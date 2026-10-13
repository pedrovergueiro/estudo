"""Serviço de inspeção contínua (usado por scripts/run_inspection.py e pelo systemd)."""

from __future__ import annotations

import logging
import signal
import threading
import time
from typing import Any

from .capture import CaptureError, EndOfStream, NullLightingController, capture_views, create_source
from .config import Settings
from .integration.actuators import create_actuator
from .integration.publisher import OutboxPublisher
from .integration.triggers import create_trigger
from .logging_config import setup_logging
from .monitoring import hardware
from .monitoring.performance import RollingStats, process_rss_mb
from .pipeline import InspectionOutput, InspectionPipeline
from .storage.database import InspectionDB
from .storage.files import atomic_write_json
from .storage.retention import apply_retention

log = logging.getLogger("capsule_inspector.runtime")


class InspectionService:
    def __init__(self, settings: Settings, model_path: str | None = None, console_log: bool = True):
        self.s = settings
        sysc = settings.system
        setup_logging(settings.path(sysc.logging.dir), sysc.logging.level, sysc.logging.max_bytes,
                      sysc.logging.backup_count, console=console_log)
        self.platform = hardware.platform_report()
        log.info("plataforma", extra={"extra_fields": self.platform})
        if self.platform["memory"]["available_mb"] and self.platform["memory"]["available_mb"] < 300:
            log.warning("pouca RAM disponível (< 300 MB)")
        self.db = InspectionDB(settings.path(sysc.storage.database))
        predictor = None
        if model_path:
            from .inference.predictor import ModelLoadError, Predictor
            try:
                predictor = Predictor.from_settings(settings, model_path)
            except ModelLoadError as e:
                log.error("modelo indicado não carregou: %s", e)
        self.pipeline = InspectionPipeline(settings, predictor=predictor, db=self.db,
                                           load_model=predictor is None and not model_path)
        if model_path and predictor is None:
            self.pipeline.model_error = f"falha ao carregar {model_path}"
        self.source = create_source(settings.camera, settings)
        self.lighting = NullLightingController()
        self.trigger = create_trigger(sysc.integration.trigger)
        self.actuator = create_actuator(sysc.integration.reject_actuator)
        self.publisher = None
        if sysc.integration.publisher.enabled:
            self.publisher = OutboxPublisher(sysc.integration.publisher, self.db)
        self.stats = RollingStats()
        self.stop_evt = threading.Event()
        self.camera_state: dict[str, Any] = {"ok": False, "error": None}
        self.last: dict[str, Any] | None = None
        self._last_retention = 0.0

    # ------------------------------------------------------------------ status
    def write_status(self) -> None:
        st = {
            "ts": time.time(),
            "deployment_mode": self.s.system.deployment_mode,
            "camera": {**self.source.describe(), **self.camera_state},
            "model": self.pipeline.model_info(),
            "model_ready": self.pipeline.ready,
            "anomaly": {"enabled": self.s.inference.anomaly.enabled, "error": self.pipeline.anomaly_error},
            "profile": {"name": self.s.inference.profile, "validated": self.pipeline.profile.validated},
            "stats": self.stats.snapshot(),
            "last": self.last,
            "actuator": {"enabled": self.s.system.integration.reject_actuator.enabled},
            "outbox": self.db.outbox_size() if self.publisher else None,
            "platform": {"cpu_temperature_c": hardware.cpu_temperature_c(),
                         "cpu_frequency_mhz": hardware.cpu_frequency_mhz(),
                         "throttled": hardware.throttled_flags(),
                         "memory": hardware.memory_info(), "rss_mb": round(process_rss_mb(), 1)},
        }
        try:
            atomic_write_json(self.s.path(self.s.system.storage.status_file), st)
        except Exception as e:
            log.warning("status.json não gravado: %s", e)

    def _open_source(self) -> bool:
        try:
            self.source.open()
            self.camera_state = {"ok": True, "error": None}
            return True
        except CaptureError as e:
            self.camera_state = {"ok": False, "error": str(e)}
            log.error("câmera indisponível: %s", e)
            return False

    # ------------------------------------------------------------------ ciclo
    def inspect_once(self, lot_id: str | None = None) -> InspectionOutput | None:
        steps = self.pipeline.profile.steps
        if self.pipeline.profile.fusion_mode == "none":
            steps = steps[:1]
        err = None
        frames = []
        if not self.source.opened and not self._open_source():
            err = self.camera_state["error"]
        else:
            try:
                frames = capture_views(self.source, steps, self.lighting)
                self.camera_state = {"ok": True, "error": None}
            except EndOfStream:
                return None
            except CaptureError as e:
                err = str(e)
                self.camera_state = {"ok": False, "error": err}
                self.source.close()  # força reabertura no próximo ciclo
        out = self.pipeline.inspect(frames, lot_id=lot_id, capture_error=err)
        rec = out.record
        self.actuator.handle(out.status, rec.inspection_id)  # fail-safe: rejeita tudo que não é PASS
        self.stats.add(rec.timings_ms.get("total", 0.0), ok=rec.status != "SYSTEM_ERROR")
        self.last = {"inspection_id": rec.inspection_id, "status": rec.status, "category": rec.category,
                     "timestamp": rec.timestamp, "total_ms": rec.timings_ms.get("total")}
        log.info("inspeção", extra={"extra_fields": {**self.last, "reasons": rec.reasons[:5]}})
        return out

    def run(self, max_inspections: int | None = None, lot_id: str | None = None) -> int:
        def _stop(*_: object) -> None:
            self.stop_evt.set()
        if threading.current_thread() is threading.main_thread():
            signal.signal(signal.SIGTERM, _stop)
            signal.signal(signal.SIGINT, _stop)
        if self.publisher:
            self.publisher.start()
        self._open_source()
        self.write_status()
        n = 0
        try:
            while not self.stop_evt.is_set():
                if not self.trigger.wait(self.stop_evt, timeout=1.0):
                    self.write_status()
                    continue
                out = self.inspect_once(lot_id)
                if out is None:
                    log.info("fonte de imagens esgotada; encerrando")
                    break
                n += 1
                self.write_status()
                if time.monotonic() - self._last_retention > 3600:
                    self._last_retention = time.monotonic()
                    try:
                        removed = apply_retention(self.pipeline.images_dir, self.s.system.storage.retention)
                        log.info("retenção aplicada", extra={"extra_fields": removed})
                    except Exception:
                        log.exception("falha na retenção (inspeção continua)")
                if max_inspections and n >= max_inspections:
                    break
        finally:
            self.shutdown()
        return n

    def shutdown(self) -> None:
        self.source.close()
        self.trigger.close()
        self.actuator.close()
        if self.publisher:
            self.publisher.stop()
        self.write_status()
        self.db.close()
