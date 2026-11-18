"""Delivery channels. Telegram today; WhatsApp later through the Hermes gateway.

Primary path: Hermes cron runs ``wa-watch brief`` and delivers its stdout to the
Telegram home channel (``--deliver telegram``). Switching to WhatsApp later is a
one-line change on the Hermes job (``--deliver whatsapp``).

This module is the direct path: login codes/QR images and the optional
"direct" delivery mode. It reuses Hermes' bot token from ~/.hermes/.env, so
messages arrive in the same Telegram chat as Hermes.
"""

from __future__ import annotations

import json
import mimetypes
import secrets
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

from .config import Config

TELEGRAM_LIMIT = 4096


class NotifyError(RuntimeError):
    pass


def chunk_text(text: str, limit: int = 4000) -> list[str]:
    """Split on line boundaries so every piece fits in one Telegram message."""
    chunks, current = [], ""
    for line in text.split("\n"):
        while len(line) > limit:  # a single giant line
            if current:
                chunks.append(current)
                current = ""
            chunks.append(line[:limit])
            line = line[limit:]
        candidate = f"{current}\n{line}" if current else line
        if len(candidate) > limit:
            chunks.append(current)
            current = line
        else:
            current = candidate
    if current:
        chunks.append(current)
    return chunks or [""]


def resolve_telegram(cfg: Config) -> tuple[str | None, str | None]:
    token = cfg.secret("WA_WATCH_TELEGRAM_BOT_TOKEN", "TELEGRAM_BOT_TOKEN")
    chat_id = cfg.get("delivery.telegram_chat_id") or cfg.secret(
        "WA_WATCH_TELEGRAM_CHAT_ID", "TELEGRAM_CHAT_ID", "TELEGRAM_HOME_CHANNEL")
    if not chat_id:
        allowed = cfg.secret("TELEGRAM_ALLOWED_USERS") or ""
        first = allowed.split(",")[0].strip()
        chat_id = first or None  # a private chat's id equals the user's id
    return token, (str(chat_id) if chat_id else None)


class TelegramNotifier:
    def __init__(self, token: str, chat_id: str, timeout: float = 25.0) -> None:
        if not token or not chat_id:
            raise NotifyError("Telegram is not configured (bot token or chat id missing)")
        self._token = token
        self.chat_id = chat_id
        self.timeout = timeout

    @classmethod
    def from_config(cls, cfg: Config) -> "TelegramNotifier":
        token, chat_id = resolve_telegram(cfg)
        return cls(token or "", chat_id or "")

    def _call(self, method: str, data: bytes, content_type: str) -> dict[str, Any]:
        url = f"https://api.telegram.org/bot{self._token}/{method}"
        req = urllib.request.Request(url, data=data, method="POST", headers={"Content-Type": content_type})
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:  # keep the token out of every message
            detail = ""
            try:
                detail = json.loads(exc.read().decode("utf-8")).get("description", "")
            except Exception:
                pass
            raise NotifyError(f"Telegram {method} failed: HTTP {exc.code} {detail}".strip()) from None
        except (urllib.error.URLError, OSError) as exc:
            raise NotifyError(f"Telegram {method} failed: {exc.__class__.__name__}") from None
        if not payload.get("ok"):
            raise NotifyError(f"Telegram {method} failed: {payload.get('description', 'unknown error')}")
        return payload.get("result") or {}

    def get_me(self) -> dict[str, Any]:
        return self._call("getMe", b"{}", "application/json")

    def send_text(self, text: str, *, html: bool = False, silent: bool = False) -> int:
        sent = 0
        for part in chunk_text(text, 4000):
            body: dict[str, Any] = {
                "chat_id": self.chat_id,
                "text": part,
                "disable_web_page_preview": True,
                "disable_notification": silent,
            }
            if html:
                body["parse_mode"] = "HTML"
            self._call("sendMessage", json.dumps(body, ensure_ascii=False).encode("utf-8"), "application/json")
            sent += 1
        return sent

    def send_photo(self, path: Path, caption: str = "", *, silent: bool = False) -> None:
        boundary = "----wa-watch-" + secrets.token_hex(12)
        fields = {"chat_id": self.chat_id, "caption": caption[:1024], "disable_notification": str(silent).lower()}
        body = bytearray()
        for name, value in fields.items():
            body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n"
                     f"{value}\r\n").encode("utf-8")
        mime = mimetypes.guess_type(path.name)[0] or "image/png"
        body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"photo\"; filename=\"{path.name}\"\r\n"
                 f"Content-Type: {mime}\r\n\r\n").encode("utf-8")
        body += Path(path).read_bytes() + b"\r\n"
        body += f"--{boundary}--\r\n".encode("utf-8")
        self._call("sendPhoto", bytes(body), f"multipart/form-data; boundary={boundary}")
