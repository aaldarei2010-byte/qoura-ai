"""WhatsApp Web driver: real Google Chrome, a dedicated profile, human-paced actions.

Read-only by design. The only state it may change is the optional deep-read
mode (opening a chat and marking it unread again afterwards). It never types
into a conversation and never sends anything.
"""

from __future__ import annotations

import logging
from datetime import datetime
from importlib import resources
from pathlib import Path
from typing import Any, Callable

from .config import Config
from .human import HumanPacer
from .timeutil import parse_list_time

log = logging.getLogger("wa_watch.whatsapp")

JS_SOURCE = resources.files("wa_watch").joinpath("js/extract.js").read_text(encoding="utf-8")

FILTER_LABELS = {
    "all": ["All"],
    "unread": ["Unread"],
    "groups": ["Groups"],
}
MENU_MARK_UNREAD = ["Mark as unread"]
LOGIN_WITH_PHONE = ["Log in with phone number", "Link with phone number", "Log in with phone number instead"]


class WhatsAppError(RuntimeError):
    pass


class WhatsAppWeb:
    """Context manager around one Chrome session pointed at WhatsApp Web."""

    def __init__(self, cfg: Config, pacer: HumanPacer, *, url: str | None = None,
                 profile_dir: Path | None = None) -> None:
        self.cfg = cfg
        self.pacer = pacer
        self.url = url or cfg.get("whatsapp.url")
        self.profile_dir = profile_dir or cfg.profile_dir
        self._pw = None
        self.context = None
        self.page = None
        self._mouse = (0.0, 0.0)

    # ------------------------------------------------------------ lifecycle
    def launch_kwargs(self) -> dict[str, Any]:
        b = self.cfg.get("browser")
        width, height = b["window"]["width"], b["window"]["height"]
        args = [
            f"--window-size={width},{height}",
            f"--lang={b['locale']}",
            "--no-first-run",
            "--no-default-browser-check",
            # Do not advertise remote control in navigator.webdriver; behave like the normal browser.
            "--disable-blink-features=AutomationControlled",
            *b.get("extra_args", []),
        ]
        kwargs: dict[str, Any] = {
            "user_data_dir": str(self.profile_dir),
            "headless": bool(b.get("headless", False)),
            "locale": b["locale"],
            "timezone_id": self.cfg.get("timezone"),
            "no_viewport": True,
            "args": args,
            # Drops the "Chrome is being controlled by automated test software" bar.
            "ignore_default_args": ["--enable-automation"],
            # Keep Chrome's own security sandbox on (Playwright turns it off by default).
            "chromium_sandbox": bool(b.get("sandbox", True)),
        }
        if b.get("executable_path"):
            kwargs["executable_path"] = str(Path(b["executable_path"]).expanduser())
        elif b.get("channel"):
            kwargs["channel"] = b["channel"]
        return kwargs

    def __enter__(self) -> "WhatsAppWeb":
        from playwright.sync_api import sync_playwright

        self.profile_dir.mkdir(parents=True, exist_ok=True)
        self._pw = sync_playwright().start()
        try:
            self.context = self._pw.chromium.launch_persistent_context(**self.launch_kwargs())
        except Exception:
            self._pw.stop()
            raise
        self.page = self.context.pages[0] if self.context.pages else self.context.new_page()
        self.page.set_default_timeout(20_000)
        # From now on every pause keeps the page responsive while we wait.
        self.pacer.sleep_fn = lambda s: self.page.wait_for_timeout(max(0.0, s) * 1000.0)
        width = self.cfg.get("browser.window.width", 1440)
        height = self.cfg.get("browser.window.height", 900)
        self._mouse = (self.pacer.rng.uniform(width * 0.3, width * 0.7),
                       self.pacer.rng.uniform(height * 0.3, height * 0.7))
        return self

    def __exit__(self, *exc: Any) -> None:
        try:
            if self.context is not None:
                self.context.close()
        finally:
            if self._pw is not None:
                self._pw.stop()

    # ------------------------------------------------------------ low-level
    def js(self, op: str, **params: Any) -> Any:
        return self.page.evaluate(JS_SOURCE, {"op": op, **params})

    def state(self) -> str:
        try:
            return self.js("state")
        except Exception:  # navigation in flight
            return "loading"

    def move_to(self, point: tuple[float, float]) -> None:
        for x, y, dt in self.pacer.mouse_path(self._mouse, point):
            self.page.mouse.move(x, y)
            self.pacer.sleep_fn(dt)
        self._mouse = point

    def _window(self) -> tuple[float, float]:
        width, height = self.page.evaluate("() => [window.innerWidth, window.innerHeight]")
        return float(width), float(height)

    def _inside_window(self, box: dict) -> bool:
        width, height = self._window()
        return box["x"] >= 0 and box["y"] >= 0 and box["x"] + box["width"] <= width and box["y"] + box["height"] <= height

    def _visible_part(self, box: dict) -> dict:
        """Clip a box to the window so the pointer never aims outside it."""
        width, height = self._window()
        x0, y0 = max(box["x"], 0.0), max(box["y"], 0.0)
        x1, y1 = min(box["x"] + box["width"], width), min(box["y"] + box["height"], height)
        if x1 - x0 < 2 or y1 - y0 < 2:
            return box
        return {"x": x0, "y": y0, "width": x1 - x0, "height": y1 - y0}

    def click(self, locator, *, button: str = "left") -> None:
        box = locator.bounding_box()
        if not box or not self._inside_window(box):
            locator.scroll_into_view_if_needed(timeout=5_000)
            self.pacer.pause("micro")
            box = locator.bounding_box()
        if not box:
            raise WhatsAppError("element is not visible")
        self.move_to(self.pacer.click_point(self._visible_part(box)))
        self.pacer.pause("micro")
        self.page.mouse.down(button=button)
        self.pacer.sleep_fn(self.pacer.hold_seconds())
        self.page.mouse.up(button=button)

    def wheel(self, total_px: float) -> None:
        for delta, pause in self.pacer.scroll_plan(total_px):
            self.page.mouse.wheel(0, delta)
            self.pacer.sleep_fn(pause)

    def type_text(self, text: str) -> None:
        for ch, delay in zip(text, self.pacer.typing_delays(text)):
            self.page.keyboard.type(ch)
            self.pacer.sleep_fn(delay)

    def _first_visible(self, candidates: list) -> Any | None:
        for loc in candidates:
            try:
                if loc.count() and loc.first.is_visible():
                    return loc.first
            except Exception:
                continue
        return None

    def _by_label(self, scope, labels: list[str], roles=("button", "tab", "menuitem", "radio")):
        candidates = []
        for label in labels:
            for role in roles:
                candidates.append(scope.get_by_role(role, name=label, exact=True))
            candidates.append(scope.get_by_text(label, exact=True))
        return self._first_visible(candidates)

    # ------------------------------------------------------------ session
    def open(self) -> str:
        log.info("opening WhatsApp Web")
        self.page.goto(self.url, wait_until="domcontentloaded", timeout=90_000)
        self.pacer.pause("think")
        return self.wait_for(("ready", "qr", "unsupported"), self.cfg.get("whatsapp.ready_timeout_s", 120))

    def wait_for(self, wanted: tuple[str, ...], timeout_s: float) -> str:
        waited = 0.0
        current = self.state()
        while current not in wanted and waited < timeout_s:
            self.page.wait_for_timeout(1000)
            waited += 1.0
            current = self.state()
        return current

    def settle(self, timeout_s: float = 25.0) -> int:
        """Wait until the chat list stops changing (WhatsApp syncs for a while after load)."""
        last, stable, waited = -1, 0, 0.0
        poll = self.pacer.profile.settle_poll
        while waited < timeout_s:
            count = len(self.js("rows"))
            stable = stable + 1 if count == last and count > 0 else 0
            if stable >= 2:
                break
            last = count
            self.page.wait_for_timeout(poll * 1000)
            waited += poll
        self.pacer.pause("short")
        return max(last, 0)

    def save_qr(self, path: Path) -> Path | None:
        path.parent.mkdir(parents=True, exist_ok=True)
        try:
            canvas = self._first_visible([self.page.locator("[data-ref] canvas"),
                                          self.page.locator('canvas[aria-label*="scan" i]'),
                                          self.page.locator("canvas")])
            if canvas is not None:
                canvas.screenshot(path=str(path))
            else:
                self.page.screenshot(path=str(path))
            return path
        except Exception as exc:  # pragma: no cover - best effort
            log.warning("could not capture QR: %s", exc)
            return None

    # ------------------------------------------------------------ chat list
    def apply_filter(self, which: str) -> bool:
        scope = self.page.locator("#side")
        target = self._by_label(scope, FILTER_LABELS[which])
        if target is None:
            log.info("filter %r not found", which)
            return False
        self.pacer.pause("think")
        self.click(target)
        self.pacer.pause("short")
        self.settle(timeout_s=6.0)
        return True

    def scroll_info(self) -> dict | None:
        return self.js("scrollInfo")

    def hover_list(self) -> None:
        info = self.scroll_info()
        if info:
            self.move_to(self.pacer.point_in(info["box"], margin=0.25))

    def _over_list(self, info: dict) -> bool:
        b = info["box"]
        x, y = self._mouse
        return b["x"] + 4 <= x <= b["x"] + b["width"] - 4 and b["y"] + 4 <= y <= b["y"] + b["height"] - 4

    def scroll_list(self, total_px: float) -> None:
        """Wheel-scroll the chat list, first bringing the pointer back over it if needed."""
        info = self.scroll_info()
        if info and not self._over_list(info):
            self.move_to(self.pacer.point_in(info["box"], margin=0.25))
            self.pacer.pause("micro")
        self.wheel(total_px)

    def scroll_to_top(self) -> None:
        info = self.scroll_info()
        guard = 0
        while info and not info["atTop"] and guard < 40:
            self.scroll_list(-max(info["top"], 200))
            info = self.scroll_info()
            guard += 1

    def collect_rows(self, *, max_rows: int, now: datetime, older_than: datetime | None = None,
                     date_order: str = "MDY", should_stop: Callable[[], None] | None = None) -> list[dict]:
        """Scroll the (virtualised) chat list slowly and collect each row once."""
        info = self.scroll_info()
        if info is None:
            return []
        if not info["atTop"]:
            self.scroll_to_top()  # read from the newest chat down, like a person
        self.hover_list()
        seen: dict[str, dict] = {}
        idle_rounds = 0
        while True:
            if should_stop:
                should_stop()
            batch = sorted(self.js("rows"), key=lambda r: r["y"])
            fresh = 0
            for row in batch:
                key = "\x1f".join((row["name"], row["time"], row["preview"]))
                if key not in seen:
                    row["order"] = len(seen)
                    seen[key] = row
                    fresh += 1
            self.pacer.skim(fresh)
            if len(seen) >= max_rows:
                break
            if older_than is not None and self._reached_older(batch, older_than, now, date_order):
                break
            info = self.scroll_info()
            if not info or info["atEnd"]:
                break
            idle_rounds = idle_rounds + 1 if fresh == 0 else 0
            if idle_rounds >= 3:
                break
            self.scroll_list(info["height"] * self.pacer.rng.uniform(0.55, 0.85))
            self.pacer.item_done()
        return sorted(seen.values(), key=lambda r: r["order"])[:max_rows]

    @staticmethod
    def _reached_older(batch: list[dict], older_than: datetime, now: datetime, order: str) -> bool:
        times = [parse_list_time(r["time"], now, order) for r in batch if not r.get("pinned")]
        times = [t for t in times if t.when is not None]
        return bool(times) and times[-1].when < older_than

    # ------------------------------------------------------------ one chat
    def _row_title(self, name: str):
        return self.page.locator("#pane-side").get_by_title(name, exact=True).first

    def _row_fully_shown(self, loc) -> bool:
        """Scroll gently until the whole row sits inside the list, like a person would."""
        for _ in range(4):
            box, info = loc.bounding_box(), self.scroll_info()
            if not box or not info:
                return False
            pane = info["box"]
            above = box["y"] - pane["y"]
            below = (box["y"] + box["height"]) - (pane["y"] + pane["height"])
            if above >= 0 and below <= 0:
                return True
            margin = self.pacer.rng.uniform(20, 80)
            self.scroll_list(below + margin if below > 0 else above - margin)
        return False

    def _visible(self, loc) -> bool:
        try:
            return bool(loc.count()) and loc.is_visible() and self._row_fully_shown(loc)
        except Exception:
            return False

    def find_row(self, name: str) -> Any | None:
        loc = self._row_title(name)
        if self._visible(loc):
            return loc
        self.scroll_to_top()
        for _ in range(25):
            if self._visible(loc):
                return loc
            info = self.scroll_info()
            if not info or info["atEnd"]:
                return None
            self.scroll_list(info["height"] * self.pacer.rng.uniform(0.5, 0.7))
        return None

    def read_chat(self, name: str, limit: int) -> list[dict]:
        row = self.find_row(name)
        if row is None:
            return []
        self.pacer.pause("think")
        self.click(row)
        try:
            self.page.wait_for_selector("#main", timeout=15_000)
        except Exception:
            return []
        self.pacer.pause("short")
        msgs = self.js("messages", limit=limit)
        incoming = " ".join(m["text"] for m in msgs if m["direction"] == "in")
        self.pacer.read(incoming)
        return msgs

    def close_chat(self) -> None:
        self.page.keyboard.press("Escape")
        self.pacer.pause("short")

    def mark_unread(self, name: str) -> bool:
        row = self.find_row(name)
        if row is None:
            return False
        self.click(row, button="right")
        self.pacer.pause("short")
        item = self._by_label(self.page, MENU_MARK_UNREAD, roles=("button", "menuitem"))
        if item is None:
            self.page.keyboard.press("Escape")
            return False
        self.click(item)
        self.pacer.pause("short")
        return True

    # ------------------------------------------------------------ login helpers
    def request_link_code(self, phone: str) -> str | None:
        """Switch the login page to 'link with phone number' and return the 8-character code."""
        link = self._by_label(self.page, LOGIN_WITH_PHONE, roles=("button", "link"))
        if link is None:
            return None
        self.click(link)
        self.pacer.pause("short")
        field = self._first_visible([
            self.page.locator('input[aria-label*="phone number" i]'),
            self.page.locator('input[type="tel"]'),
            self.page.locator('form input[type="text"]'),
        ])
        if field is None:
            return None
        self.click(field)
        self.page.keyboard.press("ControlOrMeta+A")
        self.page.keyboard.press("Backspace")
        self.type_text("+" + "".join(ch for ch in phone if ch.isdigit()))
        self.pacer.pause("short")
        nxt = self._by_label(self.page, ["Next"], roles=("button",))
        if nxt is not None:
            self.click(nxt)
        for _ in range(20):
            self.page.wait_for_timeout(1000)
            code = self.js("linkCode")
            if code:
                return code
        return None
