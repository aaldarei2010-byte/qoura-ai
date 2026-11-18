"""Human-pace engine — "مهارة الحركة البشرية".

Keeps browser automation at a calm, human tempo:

* varied pauses drawn from a log-normal distribution (most short, a few long),
* curved mouse paths (cubic Bezier) with ease-in/ease-out speed and an
  occasional small overshoot that gets corrected,
* small, uneven scroll steps with the odd short scroll back,
* reading time that grows with the amount of text,
* periodic breaks, and a hard session time budget.

The engine is site-agnostic: WhatsApp Web uses it today and other sites can
reuse it. It only shapes *timing and motion*. It never spoofs identity, never
solves challenges, and never speeds anything up.
"""

from __future__ import annotations

import math
import random
import time
from dataclasses import dataclass
from typing import Callable


class BudgetExceeded(RuntimeError):
    """The session used up its time budget. Stop gracefully and keep what was read."""


@dataclass(frozen=True)
class PaceProfile:
    name: str
    micro: tuple[float, float]          # between tiny actions (seconds)
    short: tuple[float, float]          # between ordinary actions
    think: tuple[float, float]          # hesitation before a decision
    skim_per_item: tuple[float, float]  # glancing at one list row
    wpm: tuple[int, int]                # reading speed (words per minute)
    read_bounds: tuple[float, float]    # min/max time spent reading one block
    scroll_step_px: tuple[int, int]
    scroll_pause: tuple[float, float]
    back_scroll_chance: float
    break_every: tuple[int, int]        # take a break every N items
    break_len: tuple[float, float]
    mouse_px_per_s: tuple[float, float]
    hold_ms: tuple[int, int]            # mouse button hold time
    key_delay: tuple[float, float]      # typing, per character
    settle_poll: float = 1.5            # how often to re-check a list that is still loading


PROFILES: dict[str, PaceProfile] = {
    # Default for the real account: slow, unhurried, with breaks.
    "calm": PaceProfile(
        name="calm",
        micro=(0.05, 0.20), short=(0.8, 2.4), think=(1.6, 4.8), skim_per_item=(0.25, 0.70),
        wpm=(170, 240), read_bounds=(0.8, 14.0),
        scroll_step_px=(60, 170), scroll_pause=(0.30, 1.10), back_scroll_chance=0.07,
        break_every=(5, 9), break_len=(8.0, 26.0),
        mouse_px_per_s=(450.0, 900.0), hold_ms=(60, 160), key_delay=(0.09, 0.28),
    ),
    "normal": PaceProfile(
        name="normal",
        micro=(0.03, 0.12), short=(0.4, 1.4), think=(0.8, 2.6), skim_per_item=(0.15, 0.45),
        wpm=(200, 280), read_bounds=(0.5, 9.0),
        scroll_step_px=(90, 230), scroll_pause=(0.20, 0.70), back_scroll_chance=0.05,
        break_every=(7, 12), break_len=(4.0, 14.0),
        mouse_px_per_s=(700.0, 1300.0), hold_ms=(50, 130), key_delay=(0.06, 0.20),
    ),
    # Tests and the offline self-test only. Never point this at a real account.
    "fast": PaceProfile(
        name="fast",
        micro=(0.0, 0.002), short=(0.0, 0.004), think=(0.0, 0.004), skim_per_item=(0.0, 0.001),
        wpm=(100_000, 100_000), read_bounds=(0.0, 0.002),
        scroll_step_px=(220, 320), scroll_pause=(0.01, 0.03), back_scroll_chance=0.0,
        break_every=(1000, 1000), break_len=(0.0, 0.0),
        mouse_px_per_s=(50_000.0, 60_000.0), hold_ms=(5, 10), key_delay=(0.0, 0.005),
        settle_poll=0.15,
    ),
}

Point = tuple[float, float]


def _bezier(p0: Point, p1: Point, p2: Point, p3: Point, t: float) -> Point:
    u = 1.0 - t
    x = u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0]
    y = u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1]
    return x, y


class HumanPacer:
    """Decides *when* and *how* to act. The caller performs the actual action."""

    def __init__(
        self,
        profile: str | PaceProfile = "calm",
        *,
        rng: random.Random | None = None,
        sleep: Callable[[float], None] = time.sleep,
        clock: Callable[[], float] = time.monotonic,
        max_seconds: float | None = None,
    ) -> None:
        self.profile = PROFILES[profile] if isinstance(profile, str) else profile
        self.rng = rng or random.Random()
        self.sleep_fn = sleep
        self._clock = clock
        self._t0 = clock()
        self.max_seconds = max_seconds
        self.items = 0
        self.breaks_taken = 0
        self._since_break = 0
        self._next_break = self.rng.randint(*self.profile.break_every)

    # ------------------------------------------------------------------ timing
    def sample(self, lo: float, hi: float) -> float:
        """Log-normal sample clipped to [lo, hi]: mostly near the middle, sometimes long."""
        if hi <= lo:
            return max(0.0, lo)
        if lo <= 0:
            return self.rng.uniform(max(0.0, lo), hi)
        mu = (math.log(lo) + math.log(hi)) / 2.0
        sigma = (math.log(hi) - math.log(lo)) / 4.0
        return min(hi, max(lo, self.rng.lognormvariate(mu, sigma)))

    def _sleep(self, seconds: float) -> None:
        if seconds > 0:
            self.sleep_fn(seconds)

    def pause(self, kind: str = "short") -> float:
        lo, hi = getattr(self.profile, kind)
        secs = self.sample(lo, hi)
        self._sleep(secs)
        return secs

    def reading_time(self, text: str) -> float:
        words = len(text.split()) if text else 0
        wpm = self.rng.uniform(*self.profile.wpm)
        secs = (0.35 + words / wpm * 60.0) * self.rng.uniform(0.85, 1.2)
        lo, hi = self.profile.read_bounds
        return min(hi, max(lo, secs))

    def read(self, text: str) -> float:
        secs = self.reading_time(text)
        self._sleep(secs)
        return secs

    def skim(self, n_items: int) -> float:
        secs = sum(self.sample(*self.profile.skim_per_item) for _ in range(max(0, n_items)))
        self._sleep(secs)
        return secs

    def item_done(self) -> float:
        """Count one finished unit of work; every few units take a longer break."""
        self.items += 1
        self._since_break += 1
        if self._since_break < self._next_break:
            return 0.0
        self._since_break = 0
        self._next_break = self.rng.randint(*self.profile.break_every)
        lo, hi = self.profile.break_len
        secs = self.sample(lo, hi) if hi > 0 else 0.0
        self.breaks_taken += 1
        self._sleep(secs)
        return secs

    def hold_seconds(self) -> float:
        return self.rng.randint(*self.profile.hold_ms) / 1000.0

    def typing_delays(self, text: str) -> list[float]:
        delays = []
        for i, ch in enumerate(text):
            d = self.sample(*self.profile.key_delay)
            if ch in " -" or (i and i % 4 == 0 and self.rng.random() < 0.25):
                d += self.sample(*self.profile.micro) * 2
            delays.append(d)
        return delays

    # ------------------------------------------------------------------ budget
    def elapsed(self) -> float:
        return self._clock() - self._t0

    def remaining(self) -> float | None:
        if self.max_seconds is None:
            return None
        return max(0.0, self.max_seconds - self.elapsed())

    def check_budget(self) -> None:
        if self.max_seconds is not None and self.elapsed() > self.max_seconds:
            raise BudgetExceeded(f"session budget of {self.max_seconds:.0f}s used up")

    # ------------------------------------------------------------------ motion
    def mouse_path(self, start: Point, end: Point) -> list[tuple[float, float, float]]:
        """Points (x, y, seconds-before-next) along a curved, eased path ending exactly on `end`."""
        x0, y0 = start
        x3, y3 = end
        dx, dy = x3 - x0, y3 - y0
        dist = math.hypot(dx, dy)
        if dist < 2:
            return [(x3, y3, self.sample(*self.profile.micro))]
        nx, ny = -dy / dist, dx / dist  # unit normal: bend the path sideways
        bend = min(dist * 0.22, 140.0)
        a, b = self.rng.uniform(0.18, 0.42), self.rng.uniform(0.58, 0.85)
        o1, o2 = self.rng.uniform(-bend, bend), self.rng.uniform(-bend, bend) * 0.6
        c1 = (x0 + dx * a + nx * o1, y0 + dy * a + ny * o1)
        c2 = (x0 + dx * b + nx * o2, y0 + dy * b + ny * o2)
        duration = 0.08 + dist / self.rng.uniform(*self.profile.mouse_px_per_s)
        steps = int(min(60, max(8, dist / 14)))
        pts: list[tuple[float, float, float]] = []
        for i in range(1, steps + 1):
            t = i / steps
            te = 0.5 - 0.5 * math.cos(math.pi * t)  # slow start, fast middle, slow finish
            x, y = _bezier((x0, y0), c1, c2, (x3, y3), te)
            wobble = (1.0 - t) * 1.2
            x += self.rng.uniform(-wobble, wobble)
            y += self.rng.uniform(-wobble, wobble)
            pts.append((x, y, duration / steps * self.rng.uniform(0.7, 1.3)))
        if dist > 280 and self.rng.random() < 0.22:
            over = self.rng.uniform(4.0, 11.0)
            pts[-1] = (x3 + dx / dist * over, y3 + dy / dist * over, pts[-1][2])
            pts.append((x3, y3, self.sample(0.06, 0.16)))
        pts[-1] = (x3, y3, pts[-1][2])
        return pts

    def click_point(self, box: dict) -> Point:
        """A point near the centre of an element, never on its edge."""
        x0, y0, w, h = box["x"], box["y"], box["width"], box["height"]
        x = self.rng.gauss(x0 + w / 2, max(1.0, w / 7))
        y = self.rng.gauss(y0 + h / 2, max(1.0, h / 7))
        x = min(x0 + w * 0.85, max(x0 + w * 0.15, x))
        y = min(y0 + h * 0.75, max(y0 + h * 0.25, y))
        return x, y

    def point_in(self, box: dict, margin: float = 0.2) -> Point:
        x0, y0, w, h = box["x"], box["y"], box["width"], box["height"]
        return (
            self.rng.uniform(x0 + w * margin, x0 + w * (1 - margin)),
            self.rng.uniform(y0 + h * margin, y0 + h * (1 - margin)),
        )

    def scroll_plan(self, total_px: float) -> list[tuple[int, float]]:
        """Split one scroll into uneven wheel steps: (delta_px, pause_after)."""
        sign = 1 if total_px >= 0 else -1
        remaining = int(abs(total_px))
        plan: list[tuple[int, float]] = []
        guard = 0
        while remaining > 0 and guard < 200:
            guard += 1
            step = min(remaining, self.rng.randint(*self.profile.scroll_step_px))
            plan.append((sign * step, self.sample(*self.profile.scroll_pause)))
            remaining -= step
            if remaining > 0 and self.rng.random() < self.profile.back_scroll_chance:
                back = self.rng.randint(15, 45)
                plan.append((-sign * back, self.sample(*self.profile.scroll_pause)))
                remaining += back
        return plan
