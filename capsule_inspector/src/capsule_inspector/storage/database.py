"""Banco SQLite local (WAL + synchronous=FULL) para resultados de inspeção.

- Transações atômicas: um registro está completo ou não existe.
- Revisões do operador ficam em tabela separada; o resultado original da
  máquina nunca é sobrescrito (trilha de auditoria).
- Fila de saída (outbox) para sincronização externa opcional, que não bloqueia
  a inspeção local quando não há rede.
"""

from __future__ import annotations

import csv
import io
import json
import sqlite3
import threading
from collections.abc import Iterable
from pathlib import Path
from typing import Any

from .files import StorageError
from .records import InspectionRecord

SCHEMA = """
CREATE TABLE IF NOT EXISTS inspections (
    inspection_id TEXT PRIMARY KEY,
    ts TEXT NOT NULL,
    status TEXT NOT NULL,
    category TEXT NOT NULL,
    lot_id TEXT,
    model_id TEXT,
    model_sha256 TEXT,
    config_hash TEXT,
    total_ms REAL,
    record_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_insp_ts ON inspections(ts);
CREATE INDEX IF NOT EXISTS idx_insp_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_insp_lot ON inspections(lot_id);
CREATE TABLE IF NOT EXISTS reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    inspection_id TEXT NOT NULL REFERENCES inspections(inspection_id),
    ts TEXT NOT NULL,
    reviewer TEXT NOT NULL,
    verdict TEXT NOT NULL CHECK (verdict IN ('CONFIRMED_DEFECT','FALSE_ALARM','UNCERTAIN')),
    defect_class TEXT,
    note TEXT
);
CREATE TABLE IF NOT EXISTS outbox (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    inspection_id TEXT NOT NULL,
    payload TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT
);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
"""

SCHEMA_VERSION = "1"


class InspectionDB:
    def __init__(self, path: Path):
        self.path = Path(path)
        self._lock = threading.Lock()
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.conn = sqlite3.connect(str(self.path), check_same_thread=False, timeout=10)
            self.conn.execute("PRAGMA journal_mode=WAL")
            self.conn.execute("PRAGMA synchronous=FULL")
            self.conn.execute("PRAGMA foreign_keys=ON")
            self.conn.executescript(SCHEMA)
            self.conn.execute("INSERT OR IGNORE INTO meta(key, value) VALUES ('schema_version', ?)",
                              (SCHEMA_VERSION,))
            self.conn.commit()
        except sqlite3.Error as e:
            raise StorageError(f"banco indisponível {self.path}: {e}") from e

    def close(self) -> None:
        with self._lock:
            self.conn.close()

    # ---------------------------------------------------------------- escrita
    def insert(self, rec: InspectionRecord, enqueue_payload: dict[str, Any] | None = None) -> None:
        d = rec.to_dict()
        try:
            with self._lock, self.conn:
                self.conn.execute(
                    "INSERT INTO inspections VALUES (?,?,?,?,?,?,?,?,?,?)",
                    (rec.inspection_id, rec.timestamp, rec.status, rec.category, rec.lot_id,
                     rec.model.get("model_id"), rec.model.get("sha256"), rec.config.get("hash"),
                     rec.timings_ms.get("total"), json.dumps(d, ensure_ascii=False, default=str)))
                if enqueue_payload is not None:
                    self.conn.execute("INSERT INTO outbox(inspection_id, payload) VALUES (?, ?)",
                                      (rec.inspection_id, json.dumps(enqueue_payload, default=str)))
        except sqlite3.Error as e:
            raise StorageError(f"falha ao gravar inspeção {rec.inspection_id}: {e}") from e

    def add_review(self, inspection_id: str, reviewer: str, verdict: str, defect_class: str | None,
                   note: str | None, ts: str) -> int:
        if not reviewer.strip():
            raise ValueError("revisor obrigatório")
        with self._lock, self.conn:
            if not self.conn.execute("SELECT 1 FROM inspections WHERE inspection_id=?",
                                     (inspection_id,)).fetchone():
                raise KeyError(inspection_id)
            cur = self.conn.execute(
                "INSERT INTO reviews(inspection_id, ts, reviewer, verdict, defect_class, note) "
                "VALUES (?,?,?,?,?,?)", (inspection_id, ts, reviewer, verdict, defect_class, note))
            return int(cur.lastrowid)

    # ---------------------------------------------------------------- leitura
    def get(self, inspection_id: str) -> dict[str, Any] | None:
        with self._lock:
            row = self.conn.execute("SELECT record_json FROM inspections WHERE inspection_id=?",
                                    (inspection_id,)).fetchone()
            if not row:
                return None
            rec = json.loads(row[0])
            rec["reviews"] = [dict(zip(("review_id", "ts", "reviewer", "verdict", "defect_class", "note"), r))
                              for r in self.conn.execute(
                                  "SELECT review_id, ts, reviewer, verdict, defect_class, note FROM reviews "
                                  "WHERE inspection_id=? ORDER BY review_id", (inspection_id,))]
            return rec

    def recent(self, limit: int = 50, status: str | None = None, lot_id: str | None = None,
               since: str | None = None, until: str | None = None, unreviewed_only: bool = False
               ) -> list[dict[str, Any]]:
        q = "SELECT record_json FROM inspections i WHERE 1=1"
        args: list[Any] = []
        if status:
            q += " AND status=?"
            args.append(status)
        if lot_id:
            q += " AND lot_id=?"
            args.append(lot_id)
        if since:
            q += " AND ts>=?"
            args.append(since)
        if until:
            q += " AND ts<=?"
            args.append(until)
        if unreviewed_only:
            q += " AND NOT EXISTS (SELECT 1 FROM reviews r WHERE r.inspection_id=i.inspection_id)"
        q += " ORDER BY ts DESC LIMIT ?"
        args.append(int(limit))
        with self._lock:
            return [json.loads(r[0]) for r in self.conn.execute(q, args)]

    def counts(self, since: str | None = None) -> dict[str, int]:
        q, args = "SELECT status, COUNT(*) FROM inspections", []
        if since:
            q += " WHERE ts>=?"
            args.append(since)
        q += " GROUP BY status"
        with self._lock:
            return {s: int(n) for s, n in self.conn.execute(q, args)}

    def iter_all(self, since: str | None = None, until: str | None = None) -> Iterable[dict[str, Any]]:
        return reversed(self.recent(limit=10**9, since=since, until=until))

    # ---------------------------------------------------------------- exportação
    CSV_COLUMNS = ["inspection_id", "timestamp", "status", "category", "lot_id", "model_id",
                   "model_sha256", "config_hash", "profile", "n_defects", "defect_classes",
                   "max_confidence", "total_ms", "reasons"]

    def export_csv(self, since: str | None = None, until: str | None = None) -> str:
        buf = io.StringIO()
        w = csv.DictWriter(buf, fieldnames=self.CSV_COLUMNS)
        w.writeheader()
        for r in self.iter_all(since, until):
            defects = [d for c in r.get("capsules", []) for d in c.get("defects", [])]
            w.writerow({
                "inspection_id": r["inspection_id"], "timestamp": r["timestamp"], "status": r["status"],
                "category": r["category"], "lot_id": r.get("lot_id") or "",
                "model_id": r.get("model", {}).get("model_id", ""),
                "model_sha256": r.get("model", {}).get("sha256", ""),
                "config_hash": r.get("config", {}).get("hash", ""),
                "profile": r.get("profile", {}).get("name", ""),
                "n_defects": len(defects),
                "defect_classes": ";".join(sorted({d["class_name"] for d in defects})),
                "max_confidence": max((d["confidence"] for d in defects), default=""),
                "total_ms": r.get("timings_ms", {}).get("total", ""),
                "reasons": " | ".join(r.get("reasons", [])),
            })
        return buf.getvalue()

    def export_json(self, since: str | None = None, until: str | None = None) -> str:
        return json.dumps(list(self.iter_all(since, until)), ensure_ascii=False, default=str)

    # ---------------------------------------------------------------- outbox
    def outbox_batch(self, n: int = 20) -> list[tuple[int, str, str]]:
        with self._lock:
            return list(self.conn.execute(
                "SELECT seq, inspection_id, payload FROM outbox ORDER BY seq LIMIT ?", (n,)))

    def outbox_done(self, seq: int) -> None:
        with self._lock, self.conn:
            self.conn.execute("DELETE FROM outbox WHERE seq=?", (seq,))

    def outbox_failed(self, seq: int, err: str) -> None:
        with self._lock, self.conn:
            self.conn.execute("UPDATE outbox SET attempts=attempts+1, last_error=? WHERE seq=?", (err[:500], seq))

    def outbox_trim(self, max_rows: int) -> int:
        with self._lock, self.conn:
            cur = self.conn.execute(
                "DELETE FROM outbox WHERE seq NOT IN (SELECT seq FROM outbox ORDER BY seq DESC LIMIT ?)",
                (max_rows,))
            return cur.rowcount

    def outbox_size(self) -> int:
        with self._lock:
            return int(self.conn.execute("SELECT COUNT(*) FROM outbox").fetchone()[0])
