import json
import plistlib

from wa_watch import cli


def run(argv, capsys):
    code = cli.main(argv)
    return code, capsys.readouterr().out


def test_init_and_brief_without_scans(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("WA_WATCH_HOME", str(tmp_path / "home"))
    code, out = run(["init"], capsys)
    assert code == 0 and (tmp_path / "home" / "config.yaml").exists()
    code, out = run(["brief"], capsys)
    assert code == 0 and "ما عندي أي مسح" in out
    code, out = run(["brief", "--format", "json"], capsys)
    assert json.loads(out)["scan"] is None


def test_hermes_install_writes_skill_and_scripts(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("WA_WATCH_HOME", str(tmp_path / "home"))
    hermes = tmp_path / "hermes"
    code, out = run(["hermes-install", "--hermes-home", str(hermes), "--no-cron", "--scan-time", "03:10"], capsys)
    assert code == 0
    skill = (hermes / "skills" / "productivity" / "whatsapp-night-watch" / "SKILL.md").read_text()
    assert skill.startswith("---\nname: whatsapp-night-watch")
    scan_sh = hermes / "scripts" / "wa_watch_scan.sh"
    assert "scan --for-hermes" in scan_sh.read_text() and scan_sh.stat().st_mode & 0o111
    assert "--no-agent" in out and '"10 3 * * *"' in out and "--deliver telegram" in out


def test_launchd_plists(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("WA_WATCH_HOME", str(tmp_path / "home"))
    code, _ = run(["launchd-install", "--dir", str(tmp_path / "la"), "--no-load", "--brief-time", "08:05"], capsys)
    assert code == 0
    with open(tmp_path / "la" / "com.qoura.wa-watch.brief.plist", "rb") as fh:
        plist = plistlib.load(fh)
    assert plist["StartCalendarInterval"] == {"Hour": 8, "Minute": 5}
    assert plist["ProgramArguments"][:2] == ["/usr/bin/caffeinate", "-dimsu"]
    assert plist["ProgramArguments"][-2:] == ["brief", "--send"]


def test_config_set_keeps_comments(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("WA_WATCH_HOME", str(tmp_path / "home"))
    run(["init"], capsys)
    path = tmp_path / "home" / "config.yaml"
    assert run(["config-set", "llm.enabled", "true"], capsys)[0] == 0
    assert run(["config-set", "llm.model", "qwen3.5:27b"], capsys)[0] == 0
    assert run(["config-set", "delivery.mode", "direct"], capsys)[0] == 0
    assert run(["config-set", "timezone", "Asia/Dubai"], capsys)[0] == 0
    text = path.read_text()
    assert "# المرحلة الثانية" in text and "# حماية" in text            # Arabic comments survive
    code, out = run(["config-get", "llm"], capsys)
    llm = json.loads(out)
    assert llm["enabled"] is True and llm["model"] == "qwen3.5:27b" and llm["allow_remote"] is False
    assert json.loads(run(["config-get", "deep_read.enabled"], capsys)[1]) is False  # the other "enabled" untouched
    assert json.loads(run(["config-get", "delivery.mode"], capsys)[1]) == "direct"
    assert json.loads(run(["config-get", "scan.mode"], capsys)[1]) == "preview"


def test_hermes_scan_script_wakes_the_mac(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("WA_WATCH_HOME", str(tmp_path / "home"))
    run(["hermes-install", "--hermes-home", str(tmp_path / "h"), "--no-cron"], capsys)
    body = (tmp_path / "h" / "scripts" / "wa_watch_scan.sh").read_text()
    assert "/usr/bin/caffeinate -dimsu" in body and body.count("scan --for-hermes") == 2
