"""Sincronização externa opcional (HTTP POST JSON) a partir da fila outbox.

Desabilitado por padrão. Roda em thread separada: falta de rede apenas acumula
itens na fila (limitada por `max_outbox`) e nunca bloqueia a inspeção.
Imagens não são enviadas a menos que `include_images: true`.
"""

from __future__ import annotations

import logging
import threading
import urllib.error
import urllib.request

from ..config import PublisherConfig
from ..storage.database import InspectionDB

log = logging.getLogger("capsule_inspector.publisher")


def build_payload(record: dict, include_images: bool) -> dict:
    p = {k: record[k] for k in ("inspection_id", "timestamp", "status", "category", "lot_id",
                                "model", "config", "profile", "capsules", "reasons", "timings_ms")
         if k in record}
    if include_images:
        p["images"] = record.get("images", {})
    return p


class OutboxPublisher(threading.Thread):
    def __init__(self, cfg: PublisherConfig, db: InspectionDB, interval_s: float = 5.0):
        super().__init__(name="outbox-publisher", daemon=True)
        if not cfg.url:
            raise ValueError("publisher.enabled exige publisher.url")
        self.cfg, self.db, self.interval = cfg, db, interval_s
        self.stop_evt = threading.Event()

    def send_once(self) -> int:
        sent = 0
        for seq, _iid, payload in self.db.outbox_batch():
            req = urllib.request.Request(self.cfg.url, data=payload.encode("utf-8"), method="POST",
                                         headers={"Content-Type": "application/json"})
            try:
                with urllib.request.urlopen(req, timeout=self.cfg.timeout_s) as resp:
                    if 200 <= resp.status < 300:
                        self.db.outbox_done(seq)
                        sent += 1
                        continue
                    self.db.outbox_failed(seq, f"HTTP {resp.status}")
            except (urllib.error.URLError, OSError, ValueError) as e:
                self.db.outbox_failed(seq, str(e))
                break  # sem rede: tenta depois
        self.db.outbox_trim(self.cfg.max_outbox)
        return sent

    def run(self) -> None:
        while not self.stop_evt.wait(self.interval):
            try:
                self.send_once()
            except Exception:
                log.exception("erro no publicador (inspeção local não é afetada)")

    def stop(self) -> None:
        self.stop_evt.set()

