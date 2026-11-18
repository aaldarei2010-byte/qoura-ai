"""Turn a stored scan into a digest (JSON) and a short Arabic brief for Telegram/WhatsApp."""

from __future__ import annotations

import html
import re
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

from .config import Config
from .timeutil import ar_clock, ar_date_long, ar_when

PHONE_RE = re.compile(r"^\+?[\d\s\-()]{7,}$")
QUESTION_RE = re.compile(r"[?؟]")


@dataclass
class ChatView:
    name: str
    is_group: bool
    unread: int
    marked_unread: bool
    muted: bool
    pinned: bool
    last_from_me: bool
    awaiting_reply: bool
    when: datetime | None
    precision: str
    preview: str
    source: str
    messages: list[dict] = field(default_factory=list)
    score: int = 0
    reasons: list[str] = field(default_factory=list)

    @property
    def count(self) -> int:
        return self.unread or (1 if self.marked_unread else 0)

    @property
    def unknown_number(self) -> bool:
        return bool(PHONE_RE.match(self.name))

    @property
    def text(self) -> str:
        body = " ".join(m.get("text") or "" for m in self.messages if m.get("direction") != "out")
        return f"{self.preview} {body}".strip()


def ar_count(n: int, one: str, two: str, few: str, many: str) -> str:
    if n == 1:
        return one
    if n == 2:
        return two
    if 3 <= n <= 10:
        return f"{n} {few}"
    return f"{n} {many}"


def people_phrase(n: int) -> str:
    return ar_count(n, "شخص واحد", "شخصين", "أشخاص", "شخص")


def messages_phrase(n: int) -> str:
    return ar_count(n, "رسالة وحدة", "رسالتين", "رسائل", "رسالة")


def groups_phrase(n: int) -> str:
    return ar_count(n, "مجموعة وحدة", "مجموعتين", "مجموعات", "مجموعة")


def chats_phrase(n: int) -> str:
    return ar_count(n, "محادثة وحدة", "محادثتين", "محادثات", "محادثة")


def _to_view(row: dict, tz: ZoneInfo, messages: list[dict]) -> ChatView:
    when = None
    if row.get("last_time"):
        try:
            when = datetime.fromisoformat(row["last_time"]).astimezone(tz)
        except ValueError:
            when = None
    return ChatView(
        name=row["name"],
        is_group=bool(row.get("is_group")),
        unread=int(row.get("unread") or 0),
        marked_unread=bool(row.get("marked_unread")),
        muted=bool(row.get("muted")),
        pinned=bool(row.get("pinned")),
        last_from_me=bool(row.get("last_from_me")),
        awaiting_reply=bool(row.get("awaiting_reply")),
        when=when,
        precision=row.get("time_precision") or "unknown",
        preview=row.get("preview") or "",
        source=row.get("source") or "",
        messages=messages,
    )


def score_chat(chat: ChatView, cfg: Config) -> tuple[int, list[str]]:
    text = chat.text.lower()
    name = chat.name.lower()
    score, reasons = 0, []
    vip = [v.lower() for v in cfg.get("priority.vip", []) or [] if v]
    if any(v in name for v in vip):
        score += 50
        reasons.append("vip")
    urgent = [k.lower() for k in cfg.get("priority.urgent_keywords", []) or [] if k]
    hits = [k for k in urgent if k in text]
    if hits:
        score += 25 + 5 * min(len(hits), 3)
        reasons.append("urgent")
    aliases = [a.lower() for a in (cfg.get("owner_aliases") or []) if a]
    if chat.is_group and any(a in text for a in aliases):
        score += 20
        reasons.append("mention")
    if QUESTION_RE.search(text):
        score += 6
        reasons.append("question")
    if chat.unknown_number:
        score += 3
        reasons.append("new_number")
    if not chat.is_group:
        score += 12
    score += min(chat.count, 10)
    if chat.muted:
        score -= 30
    return score, reasons


def build_digest(cfg: Config, scan: dict | None, chat_rows: list[dict], message_rows: list[dict],
                 now: datetime, ai: dict | None = None) -> dict[str, Any]:
    tz = ZoneInfo(cfg.get("timezone", "Asia/Dubai"))
    now = now.astimezone(tz)
    include_previews = bool(cfg.get("delivery.include_previews", True))
    by_chat: dict[str, list[dict]] = {}
    for m in message_rows:
        by_chat.setdefault(m["chat_name"], []).append(m)

    views = [_to_view(r, tz, by_chat.get(r["name"], [])) for r in chat_rows]
    for v in views:
        v.score, v.reasons = score_chat(v, cfg)

    unread = [v for v in views if v.count > 0]
    people = sorted([v for v in unread if not v.is_group and not v.muted], key=lambda v: -v.score)
    groups = sorted([v for v in unread if v.is_group and not v.muted], key=lambda v: -v.score)
    muted = [v for v in unread if v.muted]
    awaiting = sorted([v for v in views if v.awaiting_reply and v.count == 0 and not v.is_group],
                      key=lambda v: v.when or now, reverse=True)
    top = [v for v in people + groups if {"vip", "urgent", "mention"} & set(v.reasons)]
    top = sorted(top, key=lambda v: -v.score)[:5]

    def as_dict(v: ChatView) -> dict:
        out: dict[str, Any] = {
            "name": v.name,
            "is_group": v.is_group,
            "unread": v.count,
            "muted": v.muted,
            "when": v.when.isoformat() if v.when else None,
            "when_label": ar_when(v.when, v.precision, now),
            "reasons": v.reasons,
            "score": v.score,
            "unknown_number": v.unknown_number,
        }
        if include_previews:
            out["preview"] = v.preview
            out["messages"] = [
                {"direction": m.get("direction"), "sender": m.get("sender"), "kind": m.get("kind"),
                 "text": m.get("text"), "sent_at": m.get("sent_at")}
                for m in v.messages
            ]
        return out

    scan_info = None
    warnings: list[str] = []
    if scan:
        started = datetime.fromisoformat(scan["started_at"]).astimezone(tz)
        finished = datetime.fromisoformat(scan["finished_at"]).astimezone(tz) if scan.get("finished_at") else None
        age_h = (now - started).total_seconds() / 3600
        stale = age_h > float(cfg.get("delivery.stale_after_hours", 20))
        meta = scan.get("meta") or {}
        scan_info = {
            "id": scan["id"],
            "status": scan["status"],
            "mode": scan.get("mode"),
            "error": scan.get("error"),
            "started_at": started.isoformat(),
            "finished_at": finished.isoformat() if finished else None,
            "age_hours": round(age_h, 1),
            "stale": stale,
            "opened_chats": int(meta.get("opened_chats", 0)),
        }
        if stale:
            warnings.append("stale")
        if scan["status"] == "partial":
            warnings.append("partial")

    return {
        "version": 1,
        "owner": cfg.get("owner_name", "عبدالله"),
        "generated_at": now.isoformat(),
        "scan": scan_info,
        "totals": {
            "people": len(people),
            "people_messages": sum(v.count for v in people),
            "groups": len(groups),
            "group_messages": sum(v.count for v in groups),
            "muted_chats": len(muted),
            "muted_messages": sum(v.count for v in muted),
            "awaiting_reply": len(awaiting),
        },
        "top": [as_dict(v) for v in top],
        "people": [as_dict(v) for v in people],
        "groups": [as_dict(v) for v in groups],
        "muted": [as_dict(v) for v in muted],
        "awaiting_reply": [as_dict(v) for v in awaiting],
        "ai": ai,
        "warnings": warnings,
    }


# --------------------------------------------------------------------------- rendering
def chunk_safe_len(text: str, limit: int = 4 * 4000) -> bool:
    """True when the brief fits in at most four Telegram messages."""
    return len(text) <= limit


def _shorten(text: str, limit: int = 130) -> str:
    text = " ".join((text or "").split())
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def render(d: dict[str, Any], fmt: str = "plain", cfg: Config | None = None) -> str:
    """fmt: "plain" (Hermes / any chat), "html" (Telegram parse_mode=HTML), "whatsapp" (*bold*)."""
    if fmt == "html":
        bold, esc = (lambda s: f"<b>{s}</b>"), html.escape
    elif fmt == "whatsapp":
        bold, esc = (lambda s: f"*{s}*"), (lambda s: s)
    else:
        bold, esc = (lambda s: s), (lambda s: s)
    max_items = int(cfg.get("delivery.max_items", 12)) if cfg else 12
    owner = esc(d.get("owner") or "عبدالله")
    now = datetime.fromisoformat(d["generated_at"])
    scan = d.get("scan")
    out: list[str] = [f"🌙 {bold('تقرير الواتساب')} — {ar_date_long(now)}"]

    if not scan:
        out += ["", f"⚠️ {owner}، ما عندي أي مسح محفوظ للواتساب لين الحين.",
                "شغّل على الماك ميني: wa-watch scan --no-jitter"]
        return "\n".join(out)
    if scan["status"] == "needs_login":
        out += ["", f"⚠️ {owner}، ما قدرت أقرأ الواتساب الليلة: الجهاز طلع من واتساب ويب ويحتاج إعادة ربط.",
                "الحل السريع من تيليجرام: قول لـHermes «اربط الواتساب»،",
                "أو على الماك ميني: wa-watch login"]
        return "\n".join(out)
    if scan["status"] in ("failed", "running"):
        reason = "المسح ما كمل" if scan["status"] == "running" else "صار خطأ أثناء المسح"
        out += ["", f"⚠️ {owner}، {reason} الليلة، فما عندي أرقام أكيدة.",
                "تقدر تطلب من Hermes «سو مسح الواتساب الحين»، أو على الماك ميني: wa-watch scan --no-jitter"]
        return "\n".join(out)

    t = d["totals"]
    out.append("")
    if t["people"] == 0 and t["groups"] == 0:
        out.append(f"{owner}، ما حد كلمك 🌿 ما في رسائل جديدة غير مقروءة.")
    else:
        if t["people"]:
            out.append(f"📬 {owner}، كلمك {bold(people_phrase(t['people']))} "
                       f"({messages_phrase(t['people_messages'])} غير مقروءة)")
        else:
            out.append(f"📬 {owner}، ما كلمك أحد على الخاص.")
        if t["groups"]:
            out.append(f"👥 و{groups_phrase(t['groups'])} فيها {messages_phrase(t['group_messages'])}")
    if t["awaiting_reply"]:
        out.append(f"↩️ بانتظار ردك: {people_phrase(t['awaiting_reply'])} (قريت وما رديت)")

    def line(c: dict, numbered: str = "•") -> list[str]:
        tags = []
        if "vip" in c["reasons"]:
            tags.append("⭐")
        if "urgent" in c["reasons"]:
            tags.append("⏰")
        if "mention" in c["reasons"]:
            tags.append("@")
        if c.get("unknown_number"):
            tags.append("🆕")
        parts = [esc(c["name"])]
        if c["unread"]:
            parts.append(messages_phrase(c["unread"]))
        if c.get("when_label"):
            parts.append(c["when_label"])
        head = f"{numbered} {' · '.join(parts)}" + (f" {' '.join(tags)}" if tags else "")
        rows = [head]
        snippet = ""
        if c.get("messages"):
            incoming = [m for m in c["messages"] if m.get("direction") != "out" and (m.get("text") or m.get("kind"))]
            if incoming:
                last = incoming[-1]
                snippet = last.get("text") or {"voice": "🎤 رسالة صوتية", "media": "📷 صورة/فيديو",
                                               "document": "📄 ملف", "sticker": "ملصق"}.get(last.get("kind"), "")
        if not snippet and c.get("preview"):
            snippet = c["preview"]
        if snippet:
            rows.append(f"   «{esc(_shorten(snippet))}»")
        return rows

    shown: set[str] = set()
    if d["top"]:
        out += ["", f"🔴 {bold('الأهم أولاً')}"]
        for i, c in enumerate(d["top"], 1):
            out += line(c, f"{i})")
            shown.add(c["name"])

    def section(title: str, items: list[dict]) -> None:
        rest = [c for c in items if c["name"] not in shown]
        if not rest:
            return
        out.extend(["", title])
        for c in rest[:max_items]:
            out.extend(line(c))
        if len(rest) > max_items:
            out.append(f"   … و{chats_phrase(len(rest) - max_items)} غيرها")

    section(f"👤 {bold('الأشخاص')} ({len(d['people'])})", d["people"])
    section(f"👥 {bold('المجموعات')} ({len(d['groups'])})", d["groups"])
    section(f"↩️ {bold('بانتظار ردك')}", d["awaiting_reply"])
    if t["muted_chats"]:
        out += ["", f"🔕 مكتومة: {chats_phrase(t['muted_chats'])} ({messages_phrase(t['muted_messages'])}) — ما فصّلتها"]

    ai = d.get("ai")
    if ai and ai.get("items"):
        out += ["", f"🧠 {bold('ملخص ذكي')} (محلي على الماك ميني — {esc(ai.get('model', ''))})"]
        if ai.get("headline"):
            out.append(esc(_shorten(ai["headline"], 280)))
        labels = {"urgent": "عاجل", "action": "مطلوب منك", "meeting": "موعد", "question": "سؤال",
                  "info": "للعلم", "social": "اجتماعي"}
        for item in ai["items"][:max_items]:
            step = f" — {esc(_shorten(item['next_step'], 90))}" if item.get("next_step") else ""
            out.append(f"• [{labels.get(item.get('category'), 'للعلم')}] {esc(item['chat'])}: "
                       f"{esc(_shorten(item.get('summary', ''), 160))}{step}")

    started = datetime.fromisoformat(scan["started_at"])
    finished = datetime.fromisoformat(scan["finished_at"]) if scan.get("finished_at") else None
    span = ar_clock(started)
    if finished and ar_clock(finished) != span:
        span = f"{span}–{ar_clock(finished)}"
    if scan.get("mode") == "deep":
        mode = f"قراءة معمقة: فتحت {chats_phrase(scan.get('opened_chats', 0))} ورجعتها غير مقروءة"
    else:
        mode = "وضع المعاينة: ما فتحت أي محادثة، فما وصلتهم علامة القراءة"
    out += ["", f"🕑 المسح {span} · {mode}"]
    if "partial" in d.get("warnings", []):
        out.append("ℹ️ المسح وقف قبل النهاية (خلص الوقت المسموح)، فممكن تكون في رسائل ما انحسبت.")
    if "stale" in d.get("warnings", []):
        out.append(f"⚠️ هذا آخر مسح ناجح وعمره {scan['age_hours']} ساعة — مسح الليلة ما تم.")
    return "\n".join(out)
