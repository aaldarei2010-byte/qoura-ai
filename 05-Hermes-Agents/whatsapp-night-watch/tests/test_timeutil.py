from datetime import datetime
from zoneinfo import ZoneInfo

from wa_watch.timeutil import ar_when, parse_clock, parse_date, parse_list_time, parse_pre_plain

TZ = ZoneInfo("Asia/Dubai")
NOW = datetime(2026, 11, 18, 2, 40, tzinfo=TZ)  # a Wednesday


def test_clock_formats():
    assert parse_clock("10:32 PM") == (22, 32)
    assert parse_clock("12:05 AM") == (0, 5)
    assert parse_clock("12:05 PM") == (12, 5)
    assert parse_clock("23:15") == (23, 15)
    assert parse_clock("25:00") is None


def test_list_time_today_and_rollover():
    t = parse_list_time("1:58 AM", NOW)
    assert t.when == NOW.replace(hour=1, minute=58, second=0) and t.precision == "minute"
    late = parse_list_time("11:15 PM", NOW)  # later than now → it was yesterday
    assert late.when.day == 17 and late.when.hour == 23


def test_list_time_days():
    assert parse_list_time("Yesterday", NOW).when.day == 17
    monday = parse_list_time("Monday", NOW)
    assert monday.when.day == 16 and monday.precision == "day"
    assert parse_list_time("Thursday", NOW).when.day == 12
    assert parse_list_time("11/10/2026", NOW).when.date().isoformat() == "2026-11-10"
    assert parse_list_time("", NOW).when is None


def test_dates_fix_obvious_order_mistakes():
    assert parse_date("17/11/2026", "MDY").isoformat() == "2026-11-17"
    assert parse_date("2026-11-17").isoformat() == "2026-11-17"


def test_pre_plain_text():
    when, sender = parse_pre_plain("[10:32 PM, 11/17/2026] Khalid: ", TZ)
    assert sender == "Khalid" and when == datetime(2026, 11, 17, 22, 32, tzinfo=TZ)


def test_arabic_labels():
    assert ar_when(NOW.replace(hour=1, minute=58), "minute", NOW) == "1:58 ص"
    assert ar_when(datetime(2026, 11, 17, 23, 15, tzinfo=TZ), "minute", NOW) == "أمس 11:15 م"
    assert ar_when(datetime(2026, 11, 16, 23, 59, tzinfo=TZ), "day", NOW) == "الاثنين"
