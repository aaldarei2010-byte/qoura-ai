import glob
import os
import sys
from datetime import datetime
from importlib import resources
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest

from wa_watch.config import load_config

DUBAI = ZoneInfo("Asia/Dubai")
# Wednesday 18 Nov 2026, 02:40 — the moment the fake WhatsApp page is written for.
FIXED_NOW = datetime(2026, 11, 18, 2, 40, tzinfo=DUBAI)


def _browser() -> dict | None:
    path = os.environ.get("WA_WATCH_TEST_CHROMIUM")
    if not path:
        found = sorted(glob.glob("/opt/pw-browsers/chromium-*/chrome-linux64/chrome"))
        path = found[-1] if found else None
    if path:
        return {"executable_path": path, "channel": None, "headless": True, "sandbox": os.getuid() != 0}
    if sys.platform == "darwin" and Path("/Applications/Google Chrome.app").exists():
        return {"channel": "chrome", "headless": True}
    return None


@pytest.fixture
def make_cfg(tmp_path):
    def factory(**overrides):
        base = {"home": str(tmp_path / "home"), "human": {"profile": "fast"},
                "scan": {"jitter_minutes": 0}, "llm": {"enabled": False}}
        for key, value in overrides.items():
            base[key] = {**base.get(key, {}), **value} if isinstance(value, dict) else value
        return load_config(tmp_path / "missing.yaml", overrides=base)
    return factory


@pytest.fixture
def browser_cfg(make_cfg):
    browser = _browser()
    if browser is None:
        pytest.skip("no Chromium/Chrome available for browser tests")

    def factory(**overrides):
        overrides["browser"] = {**browser, **overrides.get("browser", {})}
        return make_cfg(**overrides)
    return factory


@pytest.fixture
def fake_url():
    page = resources.files("wa_watch").joinpath("fixtures/fake_whatsapp.html")
    return Path(str(page)).as_uri()
