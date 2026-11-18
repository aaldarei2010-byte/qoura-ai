"""WhatsApp Web timestamps (English UI) -> timezone-aware datetimes, and Arabic display."""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

WEEKDAYS = {
    "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
    "friday": 4, "saturday": 5, "sunday": 6,
}
AR_WEEKDAYS = ["الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"]
AR_MONTHS = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
]

_CLOCK_RE = re.compile(r"^(\d{1,2}):(\d{2})(?:\s?([AaPp])\.?\s?[Mm]\.?)?$")
_DATE_RE = re.compile(r"^(\d{1,4})[/.\-](\d{1,2})[/.\-](\d{1,4})$")
_PRE_RE = re.compile(r"^\[(?P<time>[^,\]]+),\s*(?P<date>[^\]]+)\]\s*(?P<sender>.*?):?\s*$")
_INVISIBLE = re.compile(r"[‎‏‪-‮⁦-⁩]")


@dataclass(frozen=True)
class WaTime:
    when: datetime | None  # best estimate; for day-precision the *latest* moment of that day
    precision: str         # "minute" | "day" | "unknown"


def clean(text: str) -> str:
    return _INVISIBLE.sub("", text or "").replace(" ", " ").replace("\xa0", " ").strip()


def parse_clock(text: str) -> tuple[int, int] | None:
    m = _CLOCK_RE.match(clean(text))
    if not m:
        return None
    hour, minute, ampm = int(m.group(1)), int(m.group(2)), m.group(3)
    if minute > 59:
        return None
    if ampm:
        if not 1 <= hour <= 12:
            return None
        hour = hour % 12 + (12 if ampm.lower() == "p" else 0)
    elif hour > 23:
        return None
    return hour, minute


def parse_date(text: str, order: str = "MDY") -> date | None:
    m = _DATE_RE.match(clean(text))
    if not m:
        return None
    a, b, c = (int(x) for x in m.groups())
    if a > 31:  # YYYY-MM-DD
        y, mo, d = a, b, c
    else:
        y = c + 2000 if c < 100 else c
        mo, d = (a, b) if order.upper() == "MDY" else (b, a)
        if mo > 12 and d <= 12:  # the configured order is clearly wrong for this value
            mo, d = d, mo
    try:
        return date(y, mo, d)
    except ValueError:
        return None


def _end_of_day(d: date, tz: ZoneInfo) -> datetime:
    return datetime(d.year, d.month, d.day, 23, 59, 59, tzinfo=tz)


def parse_list_time(raw: str, now: datetime, order: str = "MDY") -> WaTime:
    """Parse the time label shown on a chat-list row ("10:32 PM", "Yesterday", "Monday", "11/12/2026")."""
    text = clean(raw)
    tz = now.tzinfo or ZoneInfo("UTC")
    if not text:
        return WaTime(None, "unknown")
    clock = parse_clock(text)
    if clock:
        when = now.replace(hour=clock[0], minute=clock[1], second=0, microsecond=0)
        if when > now + timedelta(minutes=5):
            when -= timedelta(days=1)
        return WaTime(when, "minute")
    low = text.lower()
    if low == "today":
        return WaTime(now, "day")
    if low == "yesterday":
        return WaTime(_end_of_day(now.date() - timedelta(days=1), tz), "day")
    if low in WEEKDAYS:
        delta = (now.weekday() - WEEKDAYS[low]) % 7 or 7
        return WaTime(_end_of_day(now.date() - timedelta(days=delta), tz), "day")
    d = parse_date(text, order)
    if d:
        return WaTime(_end_of_day(d, tz), "day")
    return WaTime(None, "unknown")


def parse_pre_plain(meta: str, tz: ZoneInfo, order: str = "MDY") -> tuple[datetime | None, str]:
    """Parse WhatsApp's ``data-pre-plain-text`` value: "[10:32 PM, 11/17/2026] Ahmed: "."""
    m = _PRE_RE.match(clean(meta))
    if not m:
        return None, ""
    sender = clean(m.group("sender"))
    clock = parse_clock(m.group("time"))
    d = parse_date(m.group("date"), order)
    if not (clock and d):
        return None, sender
    return datetime(d.year, d.month, d.day, clock[0], clock[1], tzinfo=tz), sender


def ar_clock(dt: datetime) -> str:
    hour = dt.hour % 12 or 12
    return f"{hour}:{dt.minute:02d} {'ص' if dt.hour < 12 else 'م'}"


def ar_when(dt: datetime | None, precision: str, now: datetime) -> str:
    """Short Arabic label: "11:42 م", "أمس 9:10 م", "الاثنين", "12/11"."""
    if dt is None or precision == "unknown":
        return ""
    days = (now.date() - dt.date()).days
    if precision == "minute":
        if days <= 0:
            return ar_clock(dt)
        if days == 1:
            return f"أمس {ar_clock(dt)}"
        return f"{dt.day}/{dt.month} {ar_clock(dt)}"
    if days <= 0:
        return "اليوم"
    if days == 1:
        return "أمس"
    if days < 7:
        return AR_WEEKDAYS[dt.weekday()]
    return f"{dt.day}/{dt.month}"


def ar_date_long(dt: datetime) -> str:
    return f"{AR_WEEKDAYS[dt.weekday()]} {dt.day} {AR_MONTHS[dt.month - 1]} {dt.year}"
