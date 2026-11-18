import math
import random

import pytest

from wa_watch.human import PROFILES, BudgetExceeded, HumanPacer


def pacer(profile="calm", **kw):
    slept = []
    p = HumanPacer(profile, rng=random.Random(7), sleep=slept.append, **kw)
    return p, slept


def test_samples_stay_in_bounds_and_vary():
    p, _ = pacer()
    values = [p.sample(0.8, 2.4) for _ in range(2000)]
    assert min(values) >= 0.8 and max(values) <= 2.4
    assert len({round(v, 3) for v in values}) > 500          # not a fixed rhythm
    mid = sorted(values)[1000]
    assert 1.1 < mid < 1.7                                    # median near the geometric mean


def test_pause_kinds_use_the_profile():
    p, slept = pacer()
    for kind in ("micro", "short", "think"):
        lo, hi = getattr(PROFILES["calm"], kind)
        assert lo <= p.pause(kind) <= hi
    assert len(slept) == 3


def test_reading_time_grows_with_text_and_is_capped():
    p, _ = pacer()
    short = sum(p.reading_time("تمام") for _ in range(50)) / 50
    long = sum(p.reading_time(" ".join(["كلمة"] * 60)) for _ in range(50)) / 50
    assert long > short * 4
    assert p.reading_time(" ".join(["w"] * 5000)) <= PROFILES["calm"].read_bounds[1]


def test_mouse_path_is_curved_eased_and_lands_exactly():
    p, _ = pacer()
    pts = p.mouse_path((10, 10), (810, 410))
    assert pts[-1][:2] == (810, 410)
    assert 8 <= len(pts) <= 61
    assert all(dt > 0 for *_, dt in pts)
    # not a straight line: some point deviates from the direct segment
    def dist_to_line(x, y):
        return abs(400 * x - 800 * y + 800 * 10 - 400 * 10) / math.hypot(400, 800)
    assert max(dist_to_line(x, y) for x, y, _ in pts[:-1]) > 3
    # eased: first and last steps are shorter than the middle ones
    steps = [math.dist(pts[i][:2], pts[i + 1][:2]) for i in range(len(pts) - 2)]
    assert steps[len(steps) // 2] > steps[0]


def test_click_point_stays_inside_the_element():
    p, _ = pacer()
    box = {"x": 100, "y": 200, "width": 300, "height": 70}
    for _ in range(500):
        x, y = p.click_point(box)
        assert 100 + 300 * 0.15 <= x <= 100 + 300 * 0.85
        assert 200 + 70 * 0.25 <= y <= 200 + 70 * 0.75


def test_scroll_plan_adds_up_with_small_uneven_steps():
    p, _ = pacer()
    plan = p.scroll_plan(1000)
    assert sum(d for d, _ in plan) == 1000
    assert all(abs(d) <= PROFILES["calm"].scroll_step_px[1] for d, _ in plan)
    assert len({d for d, _ in plan}) > 2
    assert sum(d for d, _ in p.scroll_plan(-500)) == -500


def test_breaks_happen_every_few_items():
    p, slept = pacer()
    breaks = [p.item_done() for _ in range(40)]
    taken = [b for b in breaks if b > 0]
    assert 3 <= len(taken) <= 9
    assert all(PROFILES["calm"].break_len[0] <= b <= PROFILES["calm"].break_len[1] for b in taken)


def test_budget_stops_the_session():
    clock = iter([0.0, 10.0, 99999.0])
    p = HumanPacer("calm", sleep=lambda s: None, clock=lambda: next(clock), max_seconds=60)
    p.check_budget()  # 10 s elapsed: fine
    with pytest.raises(BudgetExceeded):
        p.check_budget()


def test_typing_has_human_gaps():
    p, _ = pacer()
    delays = p.typing_delays("+971501234567")
    assert len(delays) == 13 and all(d > 0 for d in delays)
