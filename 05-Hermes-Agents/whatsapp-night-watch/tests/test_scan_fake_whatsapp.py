"""End-to-end scans against the bundled fake WhatsApp Web page (no real account involved)."""

import pytest

from conftest import FIXED_NOW
from wa_watch.digest import build_digest, render
from wa_watch.human import HumanPacer
from wa_watch.scanner import AlreadyRunning, run_scan, single_instance
from wa_watch.store import Store
from wa_watch.whatsapp import WhatsAppWeb


def digest_for(cfg, res):
    store = Store(cfg.db_path)
    return build_digest(cfg, store.get_scan(res.scan_id), store.chats_for(res.scan_id),
                        store.messages_for(res.scan_id), FIXED_NOW)


def test_preview_scan_reads_everything_without_opening_chats(browser_cfg, fake_url):
    cfg = browser_cfg()
    res = run_scan(cfg, jitter=False, url=fake_url, now_fn=lambda: FIXED_NOW)
    assert res.status == "ok", res.error
    assert res.meta["opened_chats"] == 0 and res.messages == []
    t = digest_for(cfg, res)["totals"]
    assert (t["people"], t["people_messages"]) == (7, 13)
    assert (t["groups"], t["group_messages"]) == (3, 19)
    assert (t["muted_chats"], t["muted_messages"], t["awaiting_reply"]) == (2, 39, 2)
    by_name = {c["name"]: c for c in res.chats}
    assert by_name["Zayed"]["marked_unread"] and by_name["فريق قرى AI"]["is_group"]
    assert by_name["Afra"]["awaiting_reply"] and not by_name.get("Shiekha", {}).get("awaiting_reply")
    assert "Mom" not in by_name                     # pinned, old, read: not reported
    text = render(digest_for(cfg, res), "plain", cfg)
    assert "كلمك 7 أشخاص" in text and "Ahmed Al Kaabi" in text


def test_deep_read_opens_people_only_and_restores_unread(browser_cfg, fake_url):
    cfg = browser_cfg(deep_read={"enabled": True})
    res = run_scan(cfg, jitter=False, url=fake_url, now_fn=lambda: FIXED_NOW)
    assert res.status == "ok", res.error
    chats_read = {m["chat_name"] for m in res.messages}
    assert chats_read == {"Ahmed Al Kaabi", "Salem Al Menhali", "+971 50 123 4567", "Manal", "Zayed", "Osama", "Old Friend"}
    assert "restore_failed" not in res.meta
    ahmed = [m for m in res.messages if m["chat_name"] == "Ahmed Al Kaabi"]
    assert len(ahmed) == 3 and ahmed[-1]["sender"] == "Ahmed Al Kaabi" and ahmed[-1]["sent_at"].hour == 1


def test_logged_out_whatsapp_is_reported_with_qr(browser_cfg, fake_url):
    cfg = browser_cfg()
    res = run_scan(cfg, jitter=False, url=fake_url + "?state=qr")
    assert res.status == "needs_login" and res.qr_path and res.qr_path.exists()


def test_page_that_never_loads_fails_cleanly(browser_cfg, fake_url):
    cfg = browser_cfg(whatsapp={"ready_timeout_s": 3})
    res = run_scan(cfg, jitter=False, url=fake_url + "?state=loading")
    assert res.status == "failed" and "state=loading" in res.error


def test_time_budget_gives_partial_result(browser_cfg, fake_url):
    cfg = browser_cfg()
    res = run_scan(cfg, jitter=False, url=fake_url, pacer=HumanPacer("fast", max_seconds=0.001))
    assert res.status == "partial"


def test_only_one_run_at_a_time(browser_cfg, fake_url):
    cfg = browser_cfg()
    cfg.ensure_dirs()
    with single_instance(cfg.lock_path):
        with pytest.raises(AlreadyRunning):
            run_scan(cfg, jitter=False, url=fake_url)


def test_phone_number_link_code(browser_cfg, fake_url):
    cfg = browser_cfg()
    with WhatsAppWeb(cfg, HumanPacer("fast"), url=fake_url + "?state=qr") as wa:
        assert wa.open() == "qr"
        assert wa.request_link_code("+971 50 000 0000") == "QRA1K7Z9"
