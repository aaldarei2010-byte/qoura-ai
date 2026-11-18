"""wa-watch — command line used by Abdulla, by the Hermes skill and by Hermes cron jobs."""

from __future__ import annotations

import argparse
import json
import logging
import os
import platform
import plistlib
import shlex
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime, timedelta
from importlib import resources
from logging.handlers import RotatingFileHandler
from pathlib import Path
from zoneinfo import ZoneInfo

from . import __version__
from .config import Config, default_config_path, load_config, set_value
from .digest import build_digest, people_phrase, render
from .human import HumanPacer
from .llm import LocalLLM, PrivacyError
from .notify import NotifyError, TelegramNotifier, resolve_telegram
from .scanner import AlreadyRunning, run_scan
from .store import Store

EXIT_OK, EXIT_LOGIN, EXIT_FAILED, EXIT_CONFIG, EXIT_BUSY = 0, 2, 3, 4, 5
SCAN_JOB, BRIEF_JOB = "whatsapp-night-scan", "whatsapp-morning-brief"
LAUNCHD_SCAN, LAUNCHD_BRIEF = "com.qoura.wa-watch.scan", "com.qoura.wa-watch.brief"

log = logging.getLogger("wa_watch")


# --------------------------------------------------------------------------- helpers
def setup_logging(cfg: Config, *, quiet: bool = False, verbose: bool = False) -> None:
    cfg.ensure_dirs()
    log.setLevel(logging.DEBUG if verbose else logging.INFO)
    log.handlers.clear()
    log.propagate = False
    fmt = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
    fh = RotatingFileHandler(cfg.logs_dir / "wa-watch.log", maxBytes=1_000_000, backupCount=3, encoding="utf-8")
    fh.setFormatter(fmt)
    log.addHandler(fh)
    if not quiet:  # stdout is reserved for what gets delivered; logs go to stderr
        sh = logging.StreamHandler(sys.stderr)
        sh.setFormatter(fmt)
        log.addHandler(sh)


def tz_of(cfg: Config) -> ZoneInfo:
    return ZoneInfo(cfg.get("timezone", "Asia/Dubai"))


def resource_text(*parts: str) -> str:
    return resources.files("wa_watch").joinpath(*parts).read_text(encoding="utf-8")


def wrapper_argv(cfg: Config) -> list[str]:
    """The stable command Hermes / launchd should call."""
    candidate = cfg.home / "bin" / "wa-watch"
    if candidate.exists():
        return [str(candidate)]
    found = shutil.which("wa-watch")
    return [found] if found else [sys.executable, "-m", "wa_watch"]


# Wake the display and keep the Mac awake while Chrome works (macOS only).
CAFFEINATE = ["/usr/bin/caffeinate", "-dimsu"]


def hhmm(value: str) -> tuple[int, int]:
    hour, _, minute = value.partition(":")
    h, m = int(hour), int(minute or 0)
    if not (0 <= h <= 23 and 0 <= m <= 59):
        raise argparse.ArgumentTypeError(f"bad time {value!r}, expected HH:MM")
    return h, m


def ai_summary_for(cfg: Config, digest: dict) -> dict | None:
    llm = LocalLLM.from_config(cfg)
    ok, why = llm.check()
    if not ok:
        log.warning("local LLM unavailable: %s", why)
        return None
    targets = digest["top"] + [c for c in digest["people"] + digest["groups"] if c not in digest["top"]]
    return llm.summarize(targets, int(cfg.get("llm.max_chats", 25)))


# --------------------------------------------------------------------------- commands
def cmd_init(args: argparse.Namespace, cfg: Config) -> int:
    cfg.ensure_dirs()
    path = cfg.path or default_config_path()
    if path.exists() and not args.force:
        print(f"config already exists: {path}")
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(resource_text("templates", "config.yaml"), encoding="utf-8")
        os.chmod(path, 0o600)
        print(f"wrote {path}")
    print(f"data folder: {cfg.home}")
    return EXIT_OK


def cmd_scan(args: argparse.Namespace, cfg: Config) -> int:
    try:
        res = run_scan(cfg, jitter=not args.no_jitter)
    except AlreadyRunning:
        if not args.for_hermes:
            print("another wa-watch run is already in progress")
        return EXIT_OK if args.for_hermes else EXIT_BUSY

    if res.status in ("ok", "partial") and cfg.get("llm.enabled"):
        store = Store(cfg.db_path)
        scan = store.get_scan(res.scan_id)
        digest = build_digest(cfg, scan, store.chats_for(res.scan_id), store.messages_for(res.scan_id),
                              datetime.now(tz_of(cfg)))
        try:
            ai = ai_summary_for(cfg, digest)
            if ai:
                store.update_meta(res.scan_id, {**scan["meta"], "ai": ai})
        except PrivacyError as exc:
            log.error("%s", exc)
        except Exception:
            log.exception("local summary failed; the brief will use rules only")

    people = sum(1 for c in res.chats if (c["unread"] or c["marked_unread"]) and not c["is_group"] and not c["muted"])
    if args.for_hermes:  # stdout is delivered verbatim by Hermes; empty = silent
        if res.status in ("ok", "partial") and cfg.get("delivery.night_ping"):
            print(f"✅ خلص المسح الليلي: كلمك {people_phrase(people)} — التفاصيل في تقرير الصبح.")
        elif res.status in ("needs_login", "failed") and cfg.get("delivery.alerts_at_night"):
            print("⚠️ مسح الواتساب الليلي ما تم: " + ("الجهاز يحتاج إعادة ربط (wa-watch login)."
                                                    if res.status == "needs_login" else "صار خطأ، شوف wa-watch doctor."))
        return EXIT_OK

    print(f"scan #{res.scan_id}: {res.status}" + (f" — {res.error}" if res.error else ""))
    print(f"  people with unread: {people} · chats recorded: {len(res.chats)} · "
          f"duration: {res.meta.get('duration_s')}s · breaks: {res.meta.get('breaks')}")
    if res.qr_path:
        print(f"  WhatsApp needs linking. Run: wa-watch login   (QR saved to {res.qr_path})")
    return {"ok": EXIT_OK, "partial": EXIT_OK, "needs_login": EXIT_LOGIN}.get(res.status, EXIT_FAILED)


def make_digest(cfg: Config, scan_id: int | None, use_ai: bool = True) -> dict:
    store = Store(cfg.db_path)
    scan = store.get_scan(scan_id) if scan_id else store.latest_scan()
    chats = store.chats_for(scan["id"]) if scan else []
    msgs = store.messages_for(scan["id"]) if scan else []
    now = datetime.now(tz_of(cfg))
    digest = build_digest(cfg, scan, chats, msgs, now)
    if use_ai and scan and scan["status"] in ("ok", "partial") and cfg.get("llm.enabled"):
        ai = (scan.get("meta") or {}).get("ai")
        if ai is None:
            try:
                ai = ai_summary_for(cfg, digest)
            except Exception:
                log.exception("local summary failed")
        digest["ai"] = ai
    return digest


def cmd_brief(args: argparse.Namespace, cfg: Config) -> int:
    args.format = args.format or cfg.get("delivery.format", "plain")
    digest = make_digest(cfg, args.scan_id, use_ai=not args.no_ai)
    stamp = datetime.now(tz_of(cfg)).strftime("%Y-%m-%d")
    report = cfg.reports_dir / f"{stamp}.json"
    report.write_text(json.dumps(digest, ensure_ascii=False, indent=2), encoding="utf-8")
    os.chmod(report, 0o600)
    if args.format == "json":
        print(json.dumps(digest, ensure_ascii=False, indent=2))
        return EXIT_OK
    if args.send:
        try:
            parts = TelegramNotifier.from_config(cfg).send_text(render(digest, "html", cfg), html=True)
        except NotifyError as exc:
            print(f"could not send: {exc}", file=sys.stderr)
            return EXIT_FAILED
        print(f"sent to Telegram ({parts} message{'s' if parts > 1 else ''})")
        return EXIT_OK
    print(render(digest, args.format, cfg))
    return EXIT_OK


def cmd_status(args: argparse.Namespace, cfg: Config) -> int:
    store = Store(cfg.db_path)
    scan = store.latest_scan()
    ok_scan = store.latest_scan(("ok", "partial"))
    info = {"latest": scan, "latest_success": ok_scan["started_at"] if ok_scan else None,
            "linked_profile": cfg.profile_dir.exists()}
    if args.json:
        print(json.dumps(info, ensure_ascii=False, indent=2, default=str))
        return EXIT_OK
    if not scan:
        print("no scans yet — run: wa-watch scan --no-jitter")
        return EXIT_OK
    meta = scan.get("meta") or {}
    print(f"last scan #{scan['id']}: {scan['status']} at {scan['started_at']}"
          + (f" — {scan['error']}" if scan.get("error") else ""))
    print(f"  chats: {meta.get('chats', 0)} · unread chats: {meta.get('unread_chats', 0)} · "
          f"awaiting reply: {meta.get('awaiting_reply', 0)} · duration: {meta.get('duration_s', '?')}s")
    print(f"  last successful scan: {info['latest_success'] or 'never'}")
    return EXIT_OK


def cmd_query(args: argparse.Namespace, cfg: Config) -> int:
    store = Store(cfg.db_path)
    since = datetime.now(tz_of(cfg)) - timedelta(days=args.days)
    hits = store.search(args.text, since)
    if args.json:
        print(json.dumps(hits, ensure_ascii=False, indent=2, default=str))
        return EXIT_OK
    if not hits:
        print(f"nothing found for {args.text!r} in the last {args.days} days")
        return EXIT_OK
    for h in hits:
        when = (h.get("started_at") or "")[:16].replace("T", " ")
        if h["type"] == "chat":
            flag = f"{h['unread']} unread" if h["unread"] else ("awaiting reply" if h["awaiting_reply"] else "read")
            print(f"[{when}] {h['name']} ({flag}, last {h['last_time_raw']}): {h['preview']}")
        else:
            print(f"[{when}] {h['chat_name']} · {h.get('sender') or h['direction']}: {h.get('text') or h.get('kind')}")
    return EXIT_OK


def _notifier_or_none(cfg: Config) -> TelegramNotifier | None:
    token, chat = resolve_telegram(cfg)
    return TelegramNotifier(token, chat) if token and chat else None


def cmd_login(args: argparse.Namespace, cfg: Config) -> int:
    from .whatsapp import WhatsAppWeb

    notifier = _notifier_or_none(cfg) if (args.phone or args.qr_to_telegram) else None
    if (args.phone or args.qr_to_telegram) and notifier is None:
        print("Telegram is not configured; the code/QR will only be shown here.", file=sys.stderr)
    pacer = HumanPacer("normal")
    with WhatsAppWeb(cfg, pacer) as wa:
        state = wa.open()
        if state == "ready":
            print("WhatsApp is already linked on this Mac ✅")
            return EXIT_OK
        if state != "qr":
            print(f"WhatsApp Web is not showing the login page (state={state}).")
            return EXIT_FAILED
        if args.phone:
            code = wa.request_link_code(args.phone)
            text = ("🔑 ربط واتساب الماك ميني\n"
                    + (f"الكود: {code[:4]}-{code[4:]}\n" if code else "الكود في الصورة.\n")
                    + "على تلفونك: واتساب ← الإعدادات ← الأجهزة المرتبطة ← ربط جهاز ← "
                      "«الربط برقم الهاتف بدلاً من ذلك» واكتب الكود.")
            if code:
                print(text)
            shot = cfg.debug_dir / "link-code.png"
            wa.page.screenshot(path=str(shot))
            if notifier:
                if code:
                    notifier.send_text(text)
                else:
                    notifier.send_photo(shot, text)
        elif args.qr_to_telegram and notifier:
            qr = wa.save_qr(cfg.debug_dir / "login-qr.png")
            if qr:
                notifier.send_photo(qr, "امسح هذا الكود من تلفونك: واتساب ← الأجهزة المرتبطة ← ربط جهاز "
                                        "(افتحه من شاشة ثانية؛ الكود يتجدد كل كم ثانية)")
        else:
            print("Scan the QR code in the Chrome window: WhatsApp → Settings → Linked devices → Link a device")
        state = wa.wait_for(("ready",), args.timeout)
        if state != "ready":
            print("timed out waiting for the link")
            return EXIT_LOGIN
        wa.settle()
    print("WhatsApp linked ✅ — the nightly scan can run now.")
    if notifier:
        try:
            notifier.send_text("✅ تم ربط واتساب على الماك ميني. المسح الليلي جاهز.")
        except NotifyError as exc:
            print(f"(could not notify: {exc})", file=sys.stderr)
    return EXIT_OK


def cmd_selftest(args: argparse.Namespace, cfg: Config) -> int:
    """Run the whole pipeline against a bundled fake WhatsApp page. Your account is never touched."""
    with tempfile.TemporaryDirectory(prefix="wa-watch-selftest-") as tmp, \
            resources.as_file(resources.files("wa_watch").joinpath("fixtures/fake_whatsapp.html")) as page:
        browser = {"headless": bool(args.headless), "sandbox": not args.no_sandbox}
        if args.executable:
            browser.update({"executable_path": args.executable, "channel": None})
        test_cfg = load_config(cfg.path, overrides={
            "home": tmp, "browser": browser, "human": {"profile": "fast"},
            "scan": {"jitter_minutes": 0, "max_minutes": 5},
            "deep_read": {"enabled": bool(args.deep)}, "llm": {"enabled": False},
        })
        res = run_scan(test_cfg, jitter=False, url=page.as_uri())
        store = Store(test_cfg.db_path)
        digest = build_digest(test_cfg, store.get_scan(res.scan_id), store.chats_for(res.scan_id),
                              store.messages_for(res.scan_id), datetime.now(tz_of(test_cfg)))
        print(render(digest, "plain", test_cfg))
        t = digest["totals"]
        checks = {
            "scan finished": res.status == "ok",
            "unread people found": t["people"] >= 3,
            "groups labelled": t["groups"] >= 1,
            "awaiting-reply found": t["awaiting_reply"] >= 1,
            "muted kept apart": t["muted_chats"] >= 1,
        }
        if args.deep:
            checks["messages read"] = len(res.messages) > 0
        print("\n" + "\n".join(f"{'PASS' if ok else 'FAIL'}  {name}" for name, ok in checks.items()))
        if res.error:
            print(f"error: {res.error}")
        return EXIT_OK if all(checks.values()) else EXIT_FAILED


def cmd_doctor(args: argparse.Namespace, cfg: Config) -> int:
    problems = 0

    def report(ok: bool | None, text: str) -> None:
        nonlocal problems
        mark = "✅" if ok else ("⚠️ " if ok is None else "❌")
        if ok is False:
            problems += 1
        print(f"{mark} {text}")

    print(f"wa-watch {__version__} · Python {platform.python_version()} · {platform.system()} {platform.machine()}")
    report(True if cfg.path else None, f"config: {cfg.path or 'defaults (run: wa-watch init)'}")
    try:
        import playwright  # noqa: F401
        from importlib.metadata import version
        report(True, f"playwright {version('playwright')}")
    except Exception as exc:
        report(False, f"playwright missing: {exc}")
    if platform.system() == "Darwin":
        chrome = Path("/Applications/Google Chrome.app")
        report(chrome.exists(), f"Google Chrome {'found' if chrome.exists() else 'NOT found — install it first'}")
    report(True if cfg.profile_dir.exists() else None,
           f"WhatsApp Chrome profile: {'present' if cfg.profile_dir.exists() else 'not linked yet (wa-watch login)'}")
    store = Store(cfg.db_path)
    scan = store.latest_scan()
    if scan:
        age = (datetime.now(tz_of(cfg)) - datetime.fromisoformat(scan["started_at"])).total_seconds() / 3600
        report(scan["status"] in ("ok", "partial") and age < 30,
               f"last scan: {scan['status']} {age:.1f}h ago" + (f" ({scan['error']})" if scan.get("error") else ""))
    else:
        report(None, "no scan yet")
    token, chat = resolve_telegram(cfg)
    direct = cfg.get("delivery.mode") == "direct"
    # In Hermes mode, Hermes delivers the brief; wa-watch only needs Telegram for login codes.
    missing = False if direct else None
    report(True if token else missing, "Telegram bot token " + (
        "found" if token else "missing — set TELEGRAM_BOT_TOKEN in ~/.hermes/.env (hermes gateway setup)"))
    report(True if chat else missing, "Telegram chat id " + (
        "found" if chat else "missing — set TELEGRAM_ALLOWED_USERS (your Telegram user id) in ~/.hermes/.env"))
    if args.online and token and chat:
        try:
            me = TelegramNotifier(token, chat).get_me()
            report(True, f"Telegram bot reachable: @{me.get('username')}")
        except NotifyError as exc:
            report(False, str(exc))
    hermes_home = Path("~/.hermes").expanduser()
    if hermes_home.exists():
        skill = hermes_home / "skills" / "productivity" / "whatsapp-night-watch" / "SKILL.md"
        report(skill.exists(), "Hermes skill " + ("installed" if skill.exists() else "missing (wa-watch hermes-install)"))
        for script in ("wa_watch_scan.sh", "wa_watch_brief.sh"):
            p = hermes_home / "scripts" / script
            report(p.exists(), f"Hermes script {script} " + ("present" if p.exists() else "missing"))
        if shutil.which("hermes"):
            try:
                out = subprocess.run(["hermes", "cron", "list"], capture_output=True, text=True, timeout=30).stdout
                for job in (SCAN_JOB, BRIEF_JOB):
                    report(job in out, f"Hermes cron job {job} " + ("scheduled" if job in out else "missing"))
            except Exception as exc:
                report(None, f"could not list Hermes cron jobs: {exc.__class__.__name__}")
    else:
        report(None, "Hermes not found (~/.hermes) — using launchd + direct Telegram is also possible")
    if cfg.get("llm.enabled"):
        try:
            ok, why = LocalLLM.from_config(cfg).check()
            report(ok, f"local LLM: {why}")
        except PrivacyError as exc:
            report(False, str(exc))
    else:
        report(None, f"local LLM (Phase 2) disabled — planned model: {cfg.get('llm.model')}")
    return EXIT_OK if problems == 0 else EXIT_FAILED


def cmd_llm_check(args: argparse.Namespace, cfg: Config) -> int:
    try:
        llm = LocalLLM.from_config(cfg)
    except PrivacyError as exc:
        print(exc)
        return EXIT_CONFIG
    ok, why = llm.check()
    print(why)
    if ok and args.test:
        sample = [{"name": "أحمد", "is_group": False, "unread": 2,
                   "preview": "ضروري نتكلم اليوم بخصوص العقد قبل الساعة 10", "messages": []}]
        print(json.dumps(llm.summarize(sample), ensure_ascii=False, indent=2))
    return EXIT_OK if ok else EXIT_FAILED


def cmd_purge(args: argparse.Namespace, cfg: Config) -> int:
    if not args.yes:
        print("This deletes every stored scan on this Mac. Re-run with --yes to confirm.")
        return EXIT_CONFIG
    Store(cfg.db_path).purge_all()
    for f in cfg.reports_dir.glob("*.json"):
        f.unlink()
    print("all stored WhatsApp data deleted")
    return EXIT_OK


def cmd_config_set(args: argparse.Namespace, cfg: Config) -> int:
    path = cfg.path or default_config_path()
    if not path.exists():
        print("no config.yaml yet — run: wa-watch init")
        return EXIT_CONFIG
    try:
        set_value(path, args.key, args.value)
    except ValueError as exc:
        print(f"not changed: {exc}")
        return EXIT_CONFIG
    print(f"{args.key} = {load_config(path).get(args.key)!r}")
    return EXIT_OK


def cmd_config_get(args: argparse.Namespace, cfg: Config) -> int:
    print(json.dumps(cfg.get(args.key), ensure_ascii=False))
    return EXIT_OK


def hermes_script_bodies(cfg: Config) -> dict[str, str]:
    cmd = shlex.join(wrapper_argv(cfg))
    head = "#!/bin/bash\n# Installed by wa-watch. Hermes cron runs this in no-agent mode; stdout is delivered.\n"
    scan = (f'if [ -x {CAFFEINATE[0]} ]; then exec {shlex.join(CAFFEINATE)} {cmd} scan --for-hermes; fi\n'
            f'exec {cmd} scan --for-hermes\n')
    return {
        "wa_watch_scan.sh": head + scan,
        "wa_watch_brief.sh": head + f'exec {cmd} brief\n',  # format comes from delivery.format
    }


def cmd_hermes_install(args: argparse.Namespace, cfg: Config) -> int:
    hermes_home = Path(args.hermes_home).expanduser()
    skill_dir = hermes_home / "skills" / "productivity" / "whatsapp-night-watch"
    skill_dir.mkdir(parents=True, exist_ok=True)
    (skill_dir / "SKILL.md").write_text(resource_text("hermes_assets", "SKILL.md"), encoding="utf-8")
    print(f"skill → {skill_dir / 'SKILL.md'}")
    scripts = hermes_home / "scripts"
    scripts.mkdir(parents=True, exist_ok=True)
    for name, body in hermes_script_bodies(cfg).items():
        path = scripts / name
        path.write_text(body, encoding="utf-8")
        path.chmod(0o755)
        print(f"script → {path}")
    (sh, sm), (bh, bm) = args.scan_time, args.brief_time
    tz = cfg.get("timezone", "Asia/Dubai")
    jobs = [
        (SCAN_JOB, f"{sm} {sh} * * *", "wa_watch_scan.sh"),
        (BRIEF_JOB, f"{bm} {bh} * * *", "wa_watch_brief.sh"),
    ]
    commands = [["hermes", "cron", "create", schedule, "--no-agent", "--script", script,
                 "--deliver", args.deliver, "--name", name, "--timezone", tz]
                for name, schedule, script in jobs]
    if args.no_cron or not shutil.which("hermes"):
        print("\nCreate the two scheduled jobs in Hermes with:")
        for c in commands:
            print("  " + " ".join(f'"{p}"' if " " in p else p for p in c))
        return EXIT_OK
    try:
        existing = subprocess.run(["hermes", "cron", "list"], capture_output=True, text=True, timeout=60).stdout
    except Exception:
        existing = ""
    for (name, _, _), command in zip(jobs, commands):
        if name in existing:
            print(f"cron job {name} already exists (edit with: hermes cron edit {name} ...)")
            continue
        done = subprocess.run(command, capture_output=True, text=True, timeout=120)
        if done.returncode == 0:
            print(f"cron job {name} created")
        else:
            print(f"could not create {name}: {done.stderr.strip() or done.stdout.strip()}")
            print("  run manually: " + " ".join(f'"{p}"' if " " in p else p for p in command))
    print("\nIn Telegram, send /sethome to your Hermes bot once, so cron results land in that chat.")
    return EXIT_OK


def launchd_plists(cfg: Config, scan_time: tuple[int, int], brief_time: tuple[int, int]) -> dict[str, dict]:
    cmd = wrapper_argv(cfg)
    env = {"PATH": "/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/bin:/usr/local/bin"}

    def job(label: str, argv: list[str], at: tuple[int, int]) -> dict:
        return {
            "Label": label,
            "ProgramArguments": [*CAFFEINATE, *cmd, *argv],
            "StartCalendarInterval": {"Hour": at[0], "Minute": at[1]},
            "StandardOutPath": str(cfg.logs_dir / f"{label}.out.log"),
            "StandardErrorPath": str(cfg.logs_dir / f"{label}.err.log"),
            "EnvironmentVariables": env,
            "ProcessType": "Background",
        }

    return {
        LAUNCHD_SCAN: job(LAUNCHD_SCAN, ["scan"], scan_time),
        LAUNCHD_BRIEF: job(LAUNCHD_BRIEF, ["brief", "--send"], brief_time),
    }


def cmd_launchd_install(args: argparse.Namespace, cfg: Config) -> int:
    target = Path(args.dir).expanduser()
    target.mkdir(parents=True, exist_ok=True)
    cfg.ensure_dirs()
    for label, plist in launchd_plists(cfg, args.scan_time, args.brief_time).items():
        path = target / f"{label}.plist"
        with open(path, "wb") as fh:
            plistlib.dump(plist, fh)
        print(f"wrote {path}")
        if platform.system() == "Darwin" and not args.no_load:
            uid = os.getuid()
            subprocess.run(["launchctl", "bootout", f"gui/{uid}", str(path)], capture_output=True)
            done = subprocess.run(["launchctl", "bootstrap", f"gui/{uid}", str(path)], capture_output=True, text=True)
            print(f"  loaded {label}" if done.returncode == 0 else f"  could not load: {done.stderr.strip()}")
    print("Direct mode: set delivery.mode: direct in config.yaml so the morning brief goes straight to Telegram.")
    return EXIT_OK


# --------------------------------------------------------------------------- parser
def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="wa-watch", description="WhatsApp Night Watch — local, human-paced WhatsApp reader for Hermes.")
    p.add_argument("--config", help="path to config.yaml (default ~/.qoura/wa-watch/config.yaml)")
    p.add_argument("-v", "--verbose", action="store_true")
    p.add_argument("--version", action="version", version=f"wa-watch {__version__}")
    sub = p.add_subparsers(dest="command", required=True)

    s = sub.add_parser("init", help="create the data folder and a starter config.yaml")
    s.add_argument("--force", action="store_true", help="overwrite an existing config.yaml")
    s.set_defaults(func=cmd_init)

    s = sub.add_parser("scan", help="read WhatsApp now (slowly, like a person)")
    s.add_argument("--no-jitter", action="store_true", help="start immediately instead of at a random minute")
    s.add_argument("--for-hermes", action="store_true", help="Hermes cron mode: stdout only when there is something to say")
    s.set_defaults(func=cmd_scan)

    s = sub.add_parser("brief", help="print (or send) the brief for the latest scan")
    s.add_argument("--format", choices=["plain", "html", "whatsapp", "json"],
                   help="default: delivery.format in config.yaml (plain)")
    s.add_argument("--send", action="store_true", help="send straight to Telegram (direct mode)")
    s.add_argument("--scan-id", type=int)
    s.add_argument("--no-ai", action="store_true", help="skip the local Qwen summary")
    s.set_defaults(func=cmd_brief)

    s = sub.add_parser("status", help="last scan and health")
    s.add_argument("--json", action="store_true")
    s.set_defaults(func=cmd_status)

    s = sub.add_parser("query", help="search stored chats and messages (e.g. a name)")
    s.add_argument("text")
    s.add_argument("--days", type=int, default=7)
    s.add_argument("--json", action="store_true")
    s.set_defaults(func=cmd_query)

    s = sub.add_parser("login", help="link WhatsApp Web on this Mac (QR or phone-number code)")
    s.add_argument("--phone", help="your WhatsApp number with country code, e.g. +9715XXXXXXXX (code sent to Telegram)")
    s.add_argument("--qr-to-telegram", action="store_true", help="send the QR picture to Telegram")
    s.add_argument("--timeout", type=float, default=300)
    s.set_defaults(func=cmd_login)

    s = sub.add_parser("selftest", help="full dry run on a fake WhatsApp page (your account is not touched)")
    s.add_argument("--headless", action="store_true")
    s.add_argument("--deep", action="store_true", help="also test deep-read mode on the fake page")
    s.add_argument("--executable", help="browser binary to use instead of Google Chrome")
    s.add_argument("--no-sandbox", action="store_true", help="only for containers running as root")
    s.set_defaults(func=cmd_selftest)

    s = sub.add_parser("doctor", help="check everything is wired correctly")
    s.add_argument("--online", action="store_true", help="also call the Telegram API")
    s.set_defaults(func=cmd_doctor)

    s = sub.add_parser("llm-check", help="Phase 2: check the local Qwen model in Ollama")
    s.add_argument("--test", action="store_true", help="also run a tiny Arabic summary")
    s.set_defaults(func=cmd_llm_check)

    s = sub.add_parser("purge", help="delete all stored WhatsApp data on this Mac")
    s.add_argument("--yes", action="store_true")
    s.set_defaults(func=cmd_purge)

    s = sub.add_parser("config-set", help="change one setting, e.g. config-set llm.enabled true")
    s.add_argument("key")
    s.add_argument("value")
    s.set_defaults(func=cmd_config_set)

    s = sub.add_parser("config-get", help="show one setting, e.g. config-get scan.mode")
    s.add_argument("key")
    s.set_defaults(func=cmd_config_get)

    s = sub.add_parser("hermes-install", help="install the Hermes skill, scripts and the two cron jobs")
    s.add_argument("--hermes-home", default="~/.hermes")
    s.add_argument("--scan-time", type=hhmm, default=hhmm("02:30"))
    s.add_argument("--brief-time", type=hhmm, default=hhmm("07:30"))
    s.add_argument("--deliver", default="telegram", help="Hermes delivery target (telegram now, whatsapp later)")
    s.add_argument("--no-cron", action="store_true", help="only print the cron commands")
    s.set_defaults(func=cmd_hermes_install)

    s = sub.add_parser("launchd-install", help="fallback scheduler without Hermes (macOS launchd)")
    s.add_argument("--dir", default="~/Library/LaunchAgents")
    s.add_argument("--scan-time", type=hhmm, default=hhmm("02:30"))
    s.add_argument("--brief-time", type=hhmm, default=hhmm("07:30"))
    s.add_argument("--no-load", action="store_true")
    s.set_defaults(func=cmd_launchd_install)
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        cfg = load_config(args.config)
    except (OSError, ValueError) as exc:
        print(f"config error: {exc}", file=sys.stderr)
        return EXIT_CONFIG
    quiet = bool(getattr(args, "for_hermes", False)) or args.command in ("brief", "query", "status", "config-get")
    setup_logging(cfg, quiet=quiet and not args.verbose, verbose=args.verbose)
    return int(args.func(args, cfg) or 0)
