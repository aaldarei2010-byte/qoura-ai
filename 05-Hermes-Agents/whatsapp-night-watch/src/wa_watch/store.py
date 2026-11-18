"""Local SQLite store (private file on the Mac mini, never synced anywhere)."""

from __future__ import annotations

import json
import os
import sqlite3
from contextlib import closing
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

SCHEMA = """
CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    status TEXT NOT NULL,
    mode TEXT,
    error TEXT,
    meta TEXT
);
CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id INTEGER NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_group INTEGER NOT NULL DEFAULT 0,
    unread INTEGER NOT NULL DEFAULT 0,
    marked_unread INTEGER NOT NULL DEFAULT 0,
    muted INTEGER NOT NULL DEFAULT 0,
    pinned INTEGER NOT NULL DEFAULT 0,
    last_from_me INTEGER NOT NULL DEFAULT 0,
    awaiting_reply INTEGER NOT NULL DEFAULT 0,
    last_time_raw TEXT,
    last_time TEXT,
    time_precision TEXT,
    preview TEXT,
    source TEXT
);
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scan_id INTEGER NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    chat_name TEXT NOT NULL,
    direction TEXT,
    sender TEXT,
    sent_at TEXT,
    kind TEXT,
    text TEXT
);
CREATE INDEX IF NOT EXISTS idx_chats_scan ON chats(scan_id);
CREATE INDEX IF NOT EXISTS idx_messages_scan ON messages(scan_id);
"""

CHAT_FIELDS = (
    "name", "is_group", "unread", "marked_unread", "muted", "pinned", "last_from_me",
    "awaiting_reply", "last_time_raw", "last_time", "time_precision", "preview", "source",
)


class Store:
    def __init__(self, path: Path) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        new = not self.path.exists()
        with closing(self._connect()) as db:
            db.executescript(SCHEMA)
        if new:
            try:
                os.chmod(self.path, 0o600)
            except OSError:
                pass

    def _connect(self) -> sqlite3.Connection:
        db = sqlite3.connect(self.path)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys = ON")
        return db

    # ---------------------------------------------------------------- writes
    def begin_scan(self, started_at: datetime, mode: str) -> int:
        with closing(self._connect()) as db, db:
            cur = db.execute(
                "INSERT INTO scans(started_at, status, mode) VALUES (?, 'running', ?)",
                (started_at.isoformat(), mode),
            )
            return int(cur.lastrowid)

    def finish_scan(self, scan_id: int, status: str, finished_at: datetime,
                    error: str | None = None, meta: dict | None = None) -> None:
        with closing(self._connect()) as db, db:
            db.execute(
                "UPDATE scans SET status=?, finished_at=?, error=?, meta=? WHERE id=?",
                (status, finished_at.isoformat(), error, json.dumps(meta or {}, ensure_ascii=False), scan_id),
            )

    def update_meta(self, scan_id: int, meta: dict) -> None:
        with closing(self._connect()) as db, db:
            db.execute("UPDATE scans SET meta=? WHERE id=?", (json.dumps(meta, ensure_ascii=False), scan_id))

    def save_chats(self, scan_id: int, chats: list[dict[str, Any]]) -> None:
        rows = [(scan_id, *[_db_value(c.get(f)) for f in CHAT_FIELDS]) for c in chats]
        with closing(self._connect()) as db, db:
            db.executemany(
                f"INSERT INTO chats(scan_id, {', '.join(CHAT_FIELDS)}) "
                f"VALUES (?{', ?' * len(CHAT_FIELDS)})",
                rows,
            )

    def save_messages(self, scan_id: int, messages: list[dict[str, Any]]) -> None:
        with closing(self._connect()) as db, db:
            db.executemany(
                "INSERT INTO messages(scan_id, chat_name, direction, sender, sent_at, kind, text) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                [(scan_id, m["chat_name"], m.get("direction"), m.get("sender"),
                  _db_value(m.get("sent_at")), m.get("kind"), m.get("text")) for m in messages],
            )

    def purge_older_than(self, days: int, now: datetime) -> int:
        cutoff = (now - timedelta(days=days)).isoformat()
        with closing(self._connect()) as db, db:
            cur = db.execute("DELETE FROM scans WHERE started_at < ?", (cutoff,))
            return cur.rowcount

    def purge_all(self) -> None:
        with closing(self._connect()) as db, db:
            db.execute("DELETE FROM scans")
        with closing(self._connect()) as db:
            db.execute("VACUUM")

    # ---------------------------------------------------------------- reads
    def latest_scan(self, statuses: tuple[str, ...] | None = None) -> dict | None:
        sql = "SELECT * FROM scans"
        params: tuple = ()
        if statuses:
            sql += f" WHERE status IN ({', '.join('?' * len(statuses))})"
            params = statuses
        sql += " ORDER BY id DESC LIMIT 1"
        with closing(self._connect()) as db:
            row = db.execute(sql, params).fetchone()
        return _scan_dict(row) if row else None

    def get_scan(self, scan_id: int) -> dict | None:
        with closing(self._connect()) as db:
            row = db.execute("SELECT * FROM scans WHERE id=?", (scan_id,)).fetchone()
        return _scan_dict(row) if row else None

    def chats_for(self, scan_id: int) -> list[dict]:
        with closing(self._connect()) as db:
            rows = db.execute("SELECT * FROM chats WHERE scan_id=? ORDER BY id", (scan_id,)).fetchall()
        return [dict(r) for r in rows]

    def messages_for(self, scan_id: int) -> list[dict]:
        with closing(self._connect()) as db:
            rows = db.execute("SELECT * FROM messages WHERE scan_id=? ORDER BY id", (scan_id,)).fetchall()
        return [dict(r) for r in rows]

    def search(self, text: str, since: datetime) -> list[dict]:
        like = f"%{text}%"
        with closing(self._connect()) as db:
            chats = db.execute(
                "SELECT s.started_at, c.* FROM chats c JOIN scans s ON s.id=c.scan_id "
                "WHERE s.started_at >= ? AND (c.name LIKE ? OR c.preview LIKE ?) "
                "ORDER BY s.id DESC, c.id LIMIT 60",
                (since.isoformat(), like, like),
            ).fetchall()
            msgs = db.execute(
                "SELECT s.started_at, m.* FROM messages m JOIN scans s ON s.id=m.scan_id "
                "WHERE s.started_at >= ? AND (m.chat_name LIKE ? OR m.text LIKE ?) "
                "ORDER BY s.id DESC, m.id LIMIT 80",
                (since.isoformat(), like, like),
            ).fetchall()
        return [dict(r) | {"type": "chat"} for r in chats] + [dict(r) | {"type": "message"} for r in msgs]


def _db_value(value: Any) -> Any:
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def _scan_dict(row: sqlite3.Row) -> dict:
    data = dict(row)
    try:
        data["meta"] = json.loads(data.get("meta") or "{}")
    except ValueError:
        data["meta"] = {}
    return data
