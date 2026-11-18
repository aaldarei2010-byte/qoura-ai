"""One scan: open WhatsApp Web, read the chat list slowly, store the result locally."""

from __future__ import annotations

import fcntl
import logging
import random
import re
import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Callable, Iterator
from zoneinfo import ZoneInfo

from .config import Config
from .human import BudgetExceeded, HumanPacer
from .store import Store
from .timeutil import parse_list_time, parse_pre_plain
from .whatsapp import WhatsAppWeb

log = logging.getLogger("wa_watch.scan")

# "Ahmed: hi" / "~ Ahmed: hi" — a sender prefix, which only group previews carry.
SENDER_RE = re.compile(r"^~?\s?[^:\n]{1,40}:\s")


class AlreadyRunning(RuntimeError):
    pass


@dataclass
class ScanResult:
    scan_id: int
    status: str  # ok | partial | needs_login | failed
    error: str | None = None
    qr_path: Path | None = None
    chats: list[dict] = field(default_factory=list)
    messages: list[dict] = field(default_factory=list)
    meta: dict = field(default_factory=dict)


@contextmanager
def single_instance(lock_path: Path) -> Iterator[None]:
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    fh = open(lock_path, "w")
    try:
        fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        fh.close()
        raise AlreadyRunning("another wa-watch run is in progress") from None
    try:
        yield
    finally:
        fcntl.flock(fh, fcntl.LOCK_UN)
        fh.close()


def _looks_like_group(row: dict) -> bool:
    return bool(row.get("groupIcon")) or (not row.get("fromMe") and bool(SENDER_RE.match(row.get("preview") or "")))


def merge_rows(cfg: Config, rows_unread: list[dict], rows_all: list[dict], groups: set[str] | None,
               now: datetime, used_unread_filter: bool) -> list[dict]:
    """Combine the passes into one record per chat."""
    order = cfg.get("whatsapp.date_order", "MDY")
    lookback = now - timedelta(hours=float(cfg.get("scan.lookback_hours", 24)))
    ignore = {n.strip().lower() for n in cfg.get("scan.ignore_chats", []) or []}

    def record(row: dict, source: str) -> dict:
        wt = parse_list_time(row.get("time", ""), now, order)
        recent = wt.when is not None and wt.when >= lookback
        if groups is not None and recent:
            is_group = row["name"] in groups or bool(row.get("groupIcon"))
        else:  # no Groups filter, or the chat is older than the Groups pass looked
            is_group = (groups is not None and row["name"] in groups) or _looks_like_group(row)
        unread = int(row.get("unread") or 0)
        return {
            "name": row["name"],
            "is_group": is_group,
            "unread": unread,
            "marked_unread": bool(row.get("marked")) or (source == "unread" and unread == 0),
            "muted": bool(row.get("muted")),
            "pinned": bool(row.get("pinned")),
            "last_from_me": bool(row.get("fromMe")),
            "awaiting_reply": False,
            "last_time_raw": row.get("time", ""),
            "last_time": wt.when,
            "time_precision": wt.precision,
            "preview": row.get("preview", ""),
            "source": source,
            "_recent": recent,
        }

    merged: dict[str, dict] = {}
    for row in rows_unread:
        if row["name"].strip().lower() not in ignore:
            merged.setdefault(row["name"], record(row, "unread"))
    for row in rows_all:
        if row["name"].strip().lower() in ignore or row["name"] in merged:
            continue
        rec = record(row, "all")
        if rec["unread"] or rec["marked_unread"]:
            merged[row["name"]] = rec
        elif (cfg.get("scan.awaiting_reply", True) and rec["_recent"] and not rec["is_group"]
              and not rec["last_from_me"] and not rec["muted"]):
            rec["awaiting_reply"] = True
            merged[row["name"]] = rec
    for rec in merged.values():
        rec.pop("_recent", None)
    return list(merged.values())


def _deep_read(wa: WhatsAppWeb, cfg: Config, targets: list[dict], tz: ZoneInfo, meta: dict,
               out: list[dict]) -> list[dict]:
    """Append messages to `out` as they are read, so a budget stop keeps what was read."""
    order = cfg.get("whatsapp.date_order", "MDY")
    limit = int(cfg.get("deep_read.max_messages_per_chat", 12))
    for chat in targets:
        wa.pacer.check_budget()
        msgs = wa.read_chat(chat["name"], limit)
        wa.close_chat()
        if msgs:
            meta["opened_chats"] = meta.get("opened_chats", 0) + 1
            if cfg.get("deep_read.restore_unread", True) and not wa.mark_unread(chat["name"]):
                meta.setdefault("restore_failed", []).append(chat["name"])
        for m in msgs:
            sent_at, sender = parse_pre_plain(m.get("meta", ""), tz, order)
            out.append({"chat_name": chat["name"], "direction": m["direction"], "sender": sender,
                        "sent_at": sent_at, "kind": m["kind"], "text": m["text"]})
        wa.pacer.item_done()
    return out


def run_scan(cfg: Config, *, jitter: bool = True, url: str | None = None, profile_dir: Path | None = None,
             now_fn: Callable[[], datetime] | None = None, pacer: HumanPacer | None = None,
             sleep: Callable[[float], None] = time.sleep) -> ScanResult:
    tz = ZoneInfo(cfg.get("timezone", "Asia/Dubai"))
    now_fn = now_fn or (lambda: datetime.now(tz))
    cfg.ensure_dirs()
    store = Store(cfg.db_path)
    with single_instance(cfg.lock_path):
        jitter_min = float(cfg.get("scan.jitter_minutes", 0) or 0)
        if jitter and jitter_min > 0:
            delay = random.uniform(0, jitter_min * 60)
            log.info("waiting %.0fs before starting (random start time)", delay)
            sleep(delay)
        started = now_fn()
        deep = bool(cfg.get("deep_read.enabled"))
        scan_id = store.begin_scan(started, "deep" if deep else "preview")
        pacer = pacer or HumanPacer(cfg.get("human.profile", "calm"),
                                    max_seconds=float(cfg.get("scan.max_minutes", 25)) * 60)
        meta: dict = {"passes": {}, "opened_chats": 0}
        rows_unread: list[dict] = []
        rows_all: list[dict] = []
        groups: set[str] | None = None
        messages: list[dict] = []
        status, error, qr_path = "ok", None, None
        used_unread = False
        scan_now = started
        try:
            with WhatsAppWeb(cfg, pacer, url=url, profile_dir=profile_dir) as wa:
                state = wa.open()
                if state == "qr":
                    status, error = "needs_login", "WhatsApp Web is logged out on this Mac"
                    qr_path = wa.save_qr(cfg.debug_dir / "login-qr.png")
                elif state != "ready":
                    status, error = "failed", f"WhatsApp Web did not load (state={state})"
                    meta["diag"] = wa.js("diag")
                else:
                    meta["settled_rows"] = wa.settle()
                    now = scan_now = now_fn()
                    order = cfg.get("whatsapp.date_order", "MDY")
                    lookback = now - timedelta(hours=float(cfg.get("scan.lookback_hours", 24)))
                    max_rows = int(cfg.get("scan.max_rows", 80))
                    filtered = False
                    try:
                        # Pass 1 — which chats are groups (recent ones only).
                        if cfg.get("scan.detect_groups", True) and wa.apply_filter("groups"):
                            filtered = True
                            grows = wa.collect_rows(max_rows=max_rows, now=now, older_than=lookback,
                                                    date_order=order, should_stop=pacer.check_budget)
                            groups = {r["name"] for r in grows}
                            meta["passes"]["groups"] = len(groups)
                        # Pass 2 — everything unread.
                        if cfg.get("scan.use_unread_filter", True) and wa.apply_filter("unread"):
                            filtered = used_unread = True
                            rows_unread = wa.collect_rows(max_rows=max_rows, now=now, date_order=order,
                                                          should_stop=pacer.check_budget)
                            meta["passes"]["unread"] = len(rows_unread)
                        # Pass 3 — the normal list, recent part only (read-but-unanswered, or
                        # unread chats when the Unread filter is missing). Ends on "All" as found.
                        if filtered:
                            wa.apply_filter("all")
                        if cfg.get("scan.awaiting_reply", True) or not used_unread or deep:
                            rows_all = wa.collect_rows(max_rows=max_rows, now=now, older_than=lookback,
                                                       date_order=order, should_stop=pacer.check_budget)
                            meta["passes"]["all"] = len(rows_all)
                        if deep:
                            chats = merge_rows(cfg, rows_unread, rows_all, groups, now, used_unread)
                            targets = [c for c in chats if (c["unread"] or c["marked_unread"]) and not c["muted"]
                                       and (cfg.get("deep_read.include_groups") or not c["is_group"])]
                            targets = targets[: int(cfg.get("deep_read.max_chats", 15))]
                            _deep_read(wa, cfg, targets, tz, meta, messages)
                            wa.scroll_to_top()
                    except BudgetExceeded as exc:
                        status, error = "partial", str(exc)
                        try:  # leave WhatsApp on its normal view
                            wa.apply_filter("all")
                        except Exception:
                            pass
                    pacer.pause("short")
        except AlreadyRunning:
            raise
        except Exception as exc:  # keep a record, never crash the scheduler
            log.exception("scan failed")
            status = "partial" if (rows_unread or rows_all) else "failed"
            error = f"{exc.__class__.__name__}: {exc}"[:400]

        finished = now_fn()
        chats = (merge_rows(cfg, rows_unread, rows_all, groups, scan_now, used_unread)
                 if status in ("ok", "partial") else [])
        meta.update({
            "chats": len(chats),
            "unread_chats": sum(1 for c in chats if c["unread"] or c["marked_unread"]),
            "awaiting_reply": sum(1 for c in chats if c["awaiting_reply"]),
            "duration_s": round(pacer.elapsed(), 1),
            "breaks": pacer.breaks_taken,
        })
        store.save_chats(scan_id, chats)
        store.save_messages(scan_id, messages)
        store.finish_scan(scan_id, status, finished, error, meta)
        keep_days = int(cfg.get("retention_days", 30))
        store.purge_older_than(keep_days, finished)
        cutoff = time.time() - keep_days * 86400
        for report in cfg.reports_dir.glob("*.json"):  # saved briefs follow the same retention
            if report.stat().st_mtime < cutoff:
                report.unlink(missing_ok=True)
        log.info("scan %s finished: %s (%s chats, %s unread)", scan_id, status, meta["chats"], meta["unread_chats"])
        return ScanResult(scan_id, status, error, qr_path, chats, messages, meta)
