from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from wa_watch.digest import build_digest, chunk_safe_len, messages_phrase, people_phrase, render
from wa_watch.store import Store

TZ = ZoneInfo("Asia/Dubai")
NOW = datetime(2026, 11, 18, 7, 30, tzinfo=TZ)


def chat(name, unread=0, **kw):
    base = {"name": name, "is_group": False, "unread": unread, "marked_unread": False, "muted": False,
            "pinned": False, "last_from_me": False, "awaiting_reply": False, "last_time_raw": "1:00 AM",
            "last_time": datetime(2026, 11, 18, 1, 0, tzinfo=TZ), "time_precision": "minute",
            "preview": "", "source": "unread"}
    base.update(kw)
    return base


def seeded_store(tmp_path, status="ok"):
    store = Store(tmp_path / "db.sqlite")
    sid = store.begin_scan(datetime(2026, 11, 18, 2, 41, tzinfo=TZ), "preview")
    store.save_chats(sid, [
        chat("Ahmed", 3, preview="ضروري نتكلم بخصوص العقد"),
        chat("Salem", 1, preview="تمام"),
        chat("Mom", 1, preview="اتصل لي <b>"),
        chat("Team", 12, is_group=True, preview="Mohammed: @Abdulla نبي رأيك"),
        chat("Family", 9, is_group=True, muted=True),
        chat("Afra", 0, awaiting_reply=True, preview="ننتظر ردك", source="all"),
    ])
    store.finish_scan(sid, status, datetime(2026, 11, 18, 2, 52, tzinfo=TZ), meta={"opened_chats": 0})
    return store, sid


def test_arabic_counting():
    assert people_phrase(1) == "شخص واحد"
    assert people_phrase(2) == "شخصين"
    assert people_phrase(7) == "7 أشخاص"
    assert people_phrase(14) == "14 شخص"
    assert messages_phrase(2) == "رسالتين"


def test_digest_counts_ranking_and_text(make_cfg, tmp_path):
    cfg = make_cfg(priority={"vip": ["Mom"]})
    store, sid = seeded_store(tmp_path)
    d = build_digest(cfg, store.get_scan(sid), store.chats_for(sid), store.messages_for(sid), NOW)
    t = d["totals"]
    assert (t["people"], t["people_messages"], t["groups"], t["group_messages"]) == (3, 5, 1, 12)
    assert (t["muted_chats"], t["muted_messages"], t["awaiting_reply"]) == (1, 9, 1)
    top = [c["name"] for c in d["top"]]
    assert top[0] == "Mom" and "Ahmed" in top and "Team" in top      # vip, urgent, mention
    text = render(d, "plain", cfg)
    assert "عبدالله، كلمك 3 أشخاص (5 رسائل غير مقروءة)" in text
    assert "بانتظار ردك" in text and "مكتومة" in text
    html = render(d, "html", cfg)
    assert "&lt;b&gt;" in html and "<b>الأهم أولاً</b>" in html       # content escaped, markup kept


def test_privacy_switch_hides_previews(make_cfg, tmp_path):
    cfg = make_cfg(delivery={"include_previews": False})
    store, sid = seeded_store(tmp_path)
    d = build_digest(cfg, store.get_scan(sid), store.chats_for(sid), [], NOW)
    assert all("preview" not in c for c in d["people"])
    assert "العقد" not in render(d, "plain", cfg)


def test_failed_and_missing_scans_explain_themselves(make_cfg, tmp_path):
    cfg = make_cfg()
    assert "ما عندي أي مسح" in render(build_digest(cfg, None, [], [], NOW), "plain", cfg)
    store, sid = seeded_store(tmp_path, status="needs_login")
    text = render(build_digest(cfg, store.get_scan(sid), [], [], NOW), "plain", cfg)
    assert "إعادة ربط" in text


def test_stale_scan_is_flagged(make_cfg, tmp_path):
    cfg = make_cfg()
    store, sid = seeded_store(tmp_path)
    d = build_digest(cfg, store.get_scan(sid), store.chats_for(sid), [], NOW + timedelta(days=2))
    assert "stale" in d["warnings"] and "مسح الليلة ما تم" in render(d, "plain", cfg)


def test_store_search_and_retention(tmp_path):
    store, sid = seeded_store(tmp_path)
    assert {h["name"] for h in store.search("Ahm", NOW - timedelta(days=1)) if h["type"] == "chat"} == {"Ahmed"}
    assert store.purge_older_than(30, NOW) == 0
    assert store.purge_older_than(0, NOW + timedelta(days=1)) == 1
    assert store.chats_for(sid) == []  # cascade


def test_long_brief_stays_reasonable(make_cfg, tmp_path):
    cfg = make_cfg()
    store = Store(tmp_path / "big.sqlite")
    sid = store.begin_scan(NOW - timedelta(hours=5), "preview")
    store.save_chats(sid, [chat(f"Person {i}", 2, preview="x" * 400) for i in range(60)])
    store.finish_scan(sid, "ok", NOW - timedelta(hours=4))
    text = render(build_digest(cfg, store.get_scan(sid), store.chats_for(sid), [], NOW), "plain", cfg)
    assert "غيرها" in text and chunk_safe_len(text)
