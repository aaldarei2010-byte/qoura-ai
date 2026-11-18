"""Configuration: built-in defaults <- config.yaml <- environment (.env files).

Everything lives under one private folder on the Mac mini (default
``~/.qoura/wa-watch``): the dedicated Chrome profile, the SQLite database,
reports, logs and the config file. Secrets are read from ``.env`` files and the
process environment, never from config.yaml.
"""

from __future__ import annotations

import copy
import os
from pathlib import Path
from typing import Any

import yaml

HOME_ENV = "WA_WATCH_HOME"
CONFIG_ENV = "WA_WATCH_CONFIG"
DEFAULT_HOME = "~/.qoura/wa-watch"

DEFAULT_URGENT = [
    "عاجل", "ضروري", "مستعجل", "بسرعة", "الحين", "اليوم", "اتصل", "كلمني", "رد علي",
    "اجتماع", "موعد", "توقيع", "عقد", "دفعة", "فاتورة", "مهم",
    "urgent", "asap", "important", "call me", "meeting", "deadline", "today",
    "contract", "invoice", "payment", "sign",
]

DEFAULTS: dict[str, Any] = {
    "owner_name": "عبدالله",
    "owner_aliases": ["Abdulla", "Abdullah", "عبدالله", "عبد الله"],
    "timezone": "Asia/Dubai",
    "home": DEFAULT_HOME,
    "whatsapp": {
        "url": "https://web.whatsapp.com/",
        "ready_timeout_s": 120,
        "date_order": "MDY",  # en-US WhatsApp shows dates as M/D/YYYY
    },
    "browser": {
        "channel": "chrome",       # the real Google Chrome installed on the Mac
        "executable_path": None,   # optional explicit path (overrides channel)
        "headless": False,         # a real visible window is more natural and more stable
        "sandbox": True,           # keep Chrome's security sandbox on
        "locale": "en-US",         # fixed UI language so the reader is predictable
        "window": {"width": 1440, "height": 900},
        "extra_args": [],
    },
    "scan": {
        "mode": "preview",         # preview: never opens a chat, so no blue ticks are sent
        "lookback_hours": 24,
        "max_rows": 80,
        "max_minutes": 25,
        "jitter_minutes": 20,      # start at a slightly different minute every night
        "use_unread_filter": True,
        "awaiting_reply": True,    # also list 1:1 chats you read but did not answer
        "detect_groups": True,     # use the "Groups" filter to label group chats
        "ignore_chats": ["WhatsApp", "Meta AI"],
    },
    "deep_read": {
        "enabled": False,          # opens unread chats: senders may see blue ticks
        "include_groups": False,   # group read receipts are always sent by WhatsApp
        "max_chats": 15,
        "max_messages_per_chat": 12,
        "restore_unread": True,    # mark the chat unread again after reading
    },
    "human": {"profile": "calm"},
    "priority": {
        "vip": [],
        "urgent_keywords": DEFAULT_URGENT,
    },
    "delivery": {
        "mode": "hermes",          # hermes: Hermes cron delivers | direct: wa-watch sends to Telegram
        "format": "plain",         # plain (Telegram via Hermes) | whatsapp (*bold*) | html
        "telegram_chat_id": None,  # defaults to TELEGRAM_HOME_CHANNEL / first TELEGRAM_ALLOWED_USERS
        "include_previews": True,  # False = counts and names only
        "max_items": 12,
        "night_ping": False,       # print a one-line "scan done" note at night
        "alerts_at_night": False,  # print login/failure alerts at night instead of in the morning brief
        "stale_after_hours": 20,
    },
    "llm": {
        "enabled": False,          # Phase 2: local Qwen 3.5 through Ollama
        "provider": "ollama",
        "base_url": "http://127.0.0.1:11434",
        "model": "qwen3.5:9b",
        "allow_remote": False,     # hard privacy guard: only localhost endpoints
        "timeout_s": 240,
        "num_ctx": 16384,
        "max_chats": 25,
    },
    "retention_days": 30,
}


def deep_merge(base: dict, override: dict) -> dict:
    out = copy.deepcopy(base)
    for key, value in (override or {}).items():
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = deep_merge(out[key], value)
        else:
            out[key] = copy.deepcopy(value)
    return out


def parse_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return values
    for raw in lines:
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        if line.startswith("export "):
            line = line[len("export "):]
        key, _, value = line.partition("=")
        key, value = key.strip(), value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "'\"":
            value = value[1:-1]
        elif " #" in value:
            value = value.split(" #", 1)[0].rstrip()
        if key:
            values[key] = value
    return values


class Config:
    def __init__(self, data: dict[str, Any], path: Path | None = None) -> None:
        self.data = data
        self.path = path
        self.env: dict[str, str] = {}

    # dotted access: cfg.get("scan.max_rows")
    def get(self, dotted: str, default: Any = None) -> Any:
        node: Any = self.data
        for part in dotted.split("."):
            if not isinstance(node, dict) or part not in node:
                return default
            node = node[part]
        return node

    def __getitem__(self, key: str) -> Any:
        return self.data[key]

    # ------------------------------------------------------------- paths
    @property
    def home(self) -> Path:
        return Path(os.path.expanduser(str(self.data.get("home") or DEFAULT_HOME)))

    @property
    def profile_dir(self) -> Path:
        return self.home / "chrome-profile"

    @property
    def db_path(self) -> Path:
        return self.home / "data" / "wa-watch.db"

    @property
    def reports_dir(self) -> Path:
        return self.home / "reports"

    @property
    def logs_dir(self) -> Path:
        return self.home / "logs"

    @property
    def debug_dir(self) -> Path:
        return self.home / "debug"

    @property
    def lock_path(self) -> Path:
        return self.home / "run.lock"

    def ensure_dirs(self) -> None:
        for d in (self.home, self.db_path.parent, self.reports_dir, self.logs_dir, self.debug_dir):
            d.mkdir(parents=True, exist_ok=True)
            try:
                os.chmod(d, 0o700)
            except OSError:
                pass

    # ------------------------------------------------------------- secrets
    def secret(self, *names: str) -> str | None:
        for name in names:
            value = os.environ.get(name) or self.env.get(name)
            if value:
                return value
        return None


def default_config_path() -> Path:
    if os.environ.get(CONFIG_ENV):
        return Path(os.path.expanduser(os.environ[CONFIG_ENV]))
    home = Path(os.path.expanduser(os.environ.get(HOME_ENV, DEFAULT_HOME)))
    return home / "config.yaml"


def load_config(path: str | Path | None = None, overrides: dict | None = None) -> Config:
    cfg_path = Path(os.path.expanduser(str(path))) if path else default_config_path()
    data = copy.deepcopy(DEFAULTS)
    if os.environ.get(HOME_ENV):
        data["home"] = os.environ[HOME_ENV]
    if cfg_path.exists():
        loaded = yaml.safe_load(cfg_path.read_text(encoding="utf-8")) or {}
        if not isinstance(loaded, dict):
            raise ValueError(f"{cfg_path} must contain a YAML mapping")
        data = deep_merge(data, loaded)
    if overrides:
        data = deep_merge(data, overrides)
    cfg = Config(data, cfg_path if cfg_path.exists() else None)
    # Secrets: our own .env first, then Hermes' .env (same Telegram bot, same chat).
    env: dict[str, str] = {}
    for env_file in (Path(os.path.expanduser("~/.hermes/.env")), cfg.home / ".env"):
        env.update(parse_env_file(env_file))
    cfg.env = env
    return cfg


def _yaml_scalar(value: str) -> str:
    """Render a CLI value as a YAML scalar (bools/numbers/null as is, text quoted)."""
    low = value.strip().lower()
    if low in ("true", "false", "null"):
        return low
    try:
        float(value)
        return value.strip()
    except ValueError:
        return json_quote(value)


def json_quote(text: str) -> str:
    import json

    return json.dumps(text, ensure_ascii=False)


def set_value(path: Path, dotted: str, value: str) -> None:
    """Change one setting in config.yaml in place, keeping every comment and the layout.

    Supports top-level keys (``timezone``) and one level of nesting (``llm.model``).
    """
    parts = dotted.split(".")
    if not 1 <= len(parts) <= 2:
        raise ValueError("use KEY or SECTION.KEY")
    scalar = _yaml_scalar(value)
    lines = path.read_text(encoding="utf-8").splitlines() if path.exists() else []

    def replace(idx: int, indent: str, key: str) -> None:
        tail = lines[idx].split(":", 1)[1]
        comment = ""
        if " #" in tail:
            body, _, rest = tail.partition(" #")
            pad = len(body) - len(body.rstrip())
            comment = " " * max(1, pad) + "#" + rest
        lines[idx] = f"{indent}{key}: {scalar}{comment}"

    if len(parts) == 1:
        key = parts[0]
        for i, line in enumerate(lines):
            if line.startswith(f"{key}:"):
                replace(i, "", key)
                break
        else:
            lines.append(f"{key}: {scalar}")
    else:
        section, key = parts
        start = next((i for i, line in enumerate(lines) if line.split("#")[0].rstrip() == f"{section}:"), None)
        if start is None:
            lines += ["", f"{section}:", f"  {key}: {scalar}"]
        else:
            end = next((j for j in range(start + 1, len(lines))
                        if lines[j] and not lines[j].startswith((" ", "\t", "#"))), len(lines))
            for j in range(start + 1, end):
                stripped = lines[j].lstrip()
                if stripped.startswith(f"{key}:"):
                    replace(j, lines[j][: len(lines[j]) - len(stripped)], key)
                    break
            else:
                lines.insert(end, f"  {key}: {scalar}")
    text = "\n".join(lines) + "\n"
    yaml.safe_load(text)  # refuse to write a broken file
    path.write_text(text, encoding="utf-8")
