"""Pipeline de inspeção: qualidade → pré-processamento → inferência → ROI →
anomalia → decisão → anotação → persistência.

Garantia central: qualquer exceção em qualquer estágio produz SYSTEM_ERROR.
Uma falha de software jamais é interpretada como aprovação.
"""

from __future__ import annotations

import datetime as _dt
import json
import logging
import subprocess
import traceback
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import numpy as np

from . import __version__
from .config import Settings
from .decision.quality_gate import check_quality
from .decision.rules import DecisionEngine, PassContext
from .inference.anomaly import AnomalyResult, PatchCoreLite, normalize_crop
from .inference.postprocess import CoordinateError, nms, validate_box
from .inference.predictor import ModelLoadError, Predictor
from .inference.preprocess import build_pipeline, fuse_channels
from .inference.roi import CapsuleRegion, classical_regions, regions_from_detections
from .inference.visualize import annotate
from .monitoring.performance import StageTimer
from .storage.database import InspectionDB
from .storage.files import StorageError, atomic_write_image, free_disk_gb
from .storage.records import InspectionRecord, new_inspection_id
from .types import Decision, Detection, Frame, InspectionStatus, QualityReport, ResultCategory

log = logging.getLogger("capsule_inspector.pipeline")


def git_commit(root: Path) -> str | None:
    try:
        out = subprocess.run(["git", "-C", str(root), "rev-parse", "--short", "HEAD"],
                             capture_output=True, text=True, timeout=2)
        return out.stdout.strip() or None
    except Exception:
        return None


@dataclass
class InspectionOutput:
    record: InspectionRecord
    decision: Decision
    annotated: np.ndarray | None = None
    originals: dict[str, np.ndarray] = field(default_factory=dict)

    @property
    def status(self) -> InspectionStatus:
        return InspectionStatus(self.record.status)


class InspectionPipeline:
    def __init__(self, settings: Settings, predictor: Predictor | None = None,
                 db: InspectionDB | None = None, load_model: bool = True):
        self.s = settings
        self.profile = settings.active_profile
        self.engine = DecisionEngine(settings.decision, settings.taxonomy)
        self.preprocess = build_pipeline(self.profile.preprocessing)
        self.commit = git_commit(settings.root)
        self.model_error: str | None = None
        self.predictor = predictor
        if self.predictor is None and load_model:
            try:
                self.predictor = Predictor.from_settings(settings)
            except (ModelLoadError, MemoryError) as e:
                self.model_error = str(e)
                log.error("modelo indisponível: %s", e)
        self.anomaly: PatchCoreLite | None = None
        self.anomaly_error: str | None = None
        if settings.inference.anomaly.enabled:
            try:
                self.anomaly = PatchCoreLite.load(settings.path(settings.inference.anomaly.model_path))
            except Exception as e:  # anomalia habilitada mas ausente => não pode haver PASS
                self.anomaly_error = f"modelo de anomalia indisponível: {e}"
                log.error(self.anomaly_error)
        st = settings.system.storage
        self.images_dir = settings.path(st.images_dir)
        self.db = db
        self.fallback_path = settings.path(st.root) / "fallback_records.jsonl"

    # ------------------------------------------------------------------ estado
    @property
    def ready(self) -> bool:
        return self.predictor is not None and self.model_error is None

    def model_info(self) -> dict[str, Any]:
        if self.predictor is None:
            return {"model_id": None, "error": self.model_error}
        return self.predictor.info.as_dict()

    def _base_record(self, lot_id: str | None, unit_ref: str | None) -> InspectionRecord:
        return InspectionRecord(
            inspection_id=new_inspection_id(), timestamp=InspectionRecord.utc_now(),
            status=InspectionStatus.SYSTEM_ERROR.value, category=ResultCategory.SYSTEM_ERROR.value,
            lot_id=lot_id, unit_ref=unit_ref, deployment_mode=self.s.system.deployment_mode,
            software_version=__version__, git_commit=self.commit,
            model=self.model_info(),
            config={"versions": self.s.versions(), "hash": self.s.inspection_config_hash()},
            profile={"name": self.s.inference.profile, "hash": self.s.profile_hash(),
                     "finish": self.profile.finish, "color": self.profile.color,
                     "validated": self.profile.validated})

    # ------------------------------------------------------------------ estágios
    def _infer_views(self, views: list[tuple[str, np.ndarray]], timer: StageTimer) -> list[Detection]:
        assert self.predictor is not None
        mode = self.profile.fusion_mode
        if mode == "early_channels" and len(views) > 1:
            with timer.stage("fusion"):
                fused = fuse_channels([v for _, v in views])
            views = [("fused", fused)]
        elif mode == "none":
            views = views[:1]
        dets: list[Detection] = []
        for name, img in views:
            d, t = self.predictor.predict(img, view=name)
            for k, v in t.items():
                timer.add(f"model_{k}", v)
            dets.extend(d)
        if len(views) > 1:
            dets = merge_views(dets, self.s.inference.model.nms_iou)
        return dets

    def _regions(self, dets: list[Detection], image: np.ndarray) -> list[CapsuleRegion]:
        r = self.s.decision
        h, w = image.shape[:2]
        if self.s.inference.roi.method == "classical":
            return classical_regions(image, r.quality.min_capsule_area_fraction, r.quality.border_margin_px)
        return regions_from_detections(dets, r.capsule_class, r.capsule_min_confidence, (h, w),
                                       r.quality.border_margin_px)

    def _second_stage(self, dets: list[Detection], regions: list[CapsuleRegion],
                      views: list[tuple[str, np.ndarray]], timer: StageTimer) -> list[Detection]:
        assert self.predictor is not None
        h, w = views[0][1].shape[:2]
        boxes = [reg.padded(self.s.inference.roi.margin_px, w, h) for reg in regions]
        capsule_dets = [d for d in dets if d.class_name == self.s.decision.capsule_class]
        crop_dets: list[Detection] = []
        for name, img in views if self.profile.fusion_mode != "none" else views[:1]:
            d, t = self.predictor.predict_crops(img, boxes, view=name)
            for k, v in t.items():
                timer.add(f"crop_{k}", v)
            crop_dets.extend(x for x in d if x.class_name != self.s.decision.capsule_class)
        return capsule_dets + merge_views(crop_dets, self.s.inference.model.nms_iou)

    def _anomaly(self, image: np.ndarray, regions: list[CapsuleRegion]) -> dict[int, AnomalyResult]:
        out: dict[int, AnomalyResult] = {}
        if self.anomaly is None:
            return out
        for i, reg in enumerate(regions):
            out[i] = self.anomaly.score(normalize_crop(image, reg.box))
        return out

    # ------------------------------------------------------------------ principal
    def inspect(self, frames: list[Frame], lot_id: str | None = None, unit_ref: str | None = None,
                persist: bool = True, capture_error: str | None = None) -> InspectionOutput:
        timer = StageTimer()
        rec = self._base_record(lot_id, unit_ref)
        rec.source = {"frames": [{"view": f.view, "frame_id": f.frame_id, "source": f.source,
                                  "capture_ts": f.timestamp, **f.meta} for f in frames]}
        decision = Decision(InspectionStatus.SYSTEM_ERROR, ResultCategory.SYSTEM_ERROR)
        annotated = None
        originals: dict[str, np.ndarray] = {}
        try:
            timer.add("capture", sum(f.capture_ms for f in frames))
            if capture_error:
                raise RuntimeError(f"falha de captura: {capture_error}")
            if not frames:
                raise RuntimeError("nenhum quadro recebido")
            if not self.ready:
                raise ModelLoadError(self.model_error or "modelo não carregado")
            if self.anomaly_error:
                raise RuntimeError(self.anomaly_error)
            expected = len(self.profile.steps) if self.profile.fusion_mode != "none" else 1
            if len(frames) < expected:
                raise RuntimeError(f"perfil exige {expected} vistas, recebidas {len(frames)}")

            for f in frames:
                if f.image is None or not isinstance(f.image, np.ndarray) or f.image.size == 0:
                    raise RuntimeError(f"imagem vazia da câmera (vista {f.view})")
            with timer.stage("quality"):
                qreps: list[QualityReport] = []
                for f in frames:
                    q = check_quality(f.image, self.s.decision.quality)
                    q.reasons = [f"[{f.view}] {x}" for x in q.reasons]
                    qreps.append(q)
                rec.quality = [{"view": f.view, **q.to_dict()} for f, q in zip(frames, qreps)]
                quality = QualityReport(all(q.ok for q in qreps), {},
                                        [r for q in qreps for r in q.reasons])
            originals = {f.view: f.image for f in frames}

            with timer.stage("preprocess"):
                views = []
                for f in frames:
                    p = self.preprocess(f.image)
                    if p.shape[:2] != f.image.shape[:2]:
                        raise RuntimeError("pré-processamento alterou a geometria da imagem")
                    views.append((f.view, p))

            with timer.stage("inference"):
                dets = self._infer_views(views, timer)
            main = frames[0].image
            h, w = main.shape[:2]
            for d in dets:
                try:
                    d.box = validate_box(d.box, w, h)
                except CoordinateError as e:
                    raise RuntimeError(f"coordenada inválida do modelo: {e}") from e

            with timer.stage("roi"):
                regions = self._regions(dets, views[0][1])
            if self.s.inference.roi.crop_second_stage and regions:
                with timer.stage("second_stage"):
                    dets = self._second_stage(dets, regions, views, timer)
            rec.detections = [d.to_dict() for d in dets]

            with timer.stage("anomaly"):
                anomalies = self._anomaly(views[0][1], regions)
                rec.anomaly = [{"capsule": i, "score": round(a.score, 5), "threshold": round(a.threshold, 5),
                                "anomalous": a.is_anomalous} for i, a in anomalies.items()]

            with timer.stage("decision"):
                ctx = PassContext(self.profile, bool(self.predictor and self.predictor.info.approved))
                decision = self.engine.decide(quality, dets, regions, ctx, anomalies)

            with timer.stage("annotate"):
                annotated = annotate(main, decision, [f"lote={lot_id or '-'}  modelo={rec.model.get('model_id')}"])
        except Exception as e:  # qualquer falha => SYSTEM_ERROR
            decision = Decision(InspectionStatus.SYSTEM_ERROR, ResultCategory.SYSTEM_ERROR,
                                [f"SYSTEM_ERROR: {type(e).__name__}: {e}"])
            rec.error = "".join(traceback.format_exception_only(type(e), e)).strip()
            log.error("falha na inspeção", extra={"extra_fields": {"id": rec.inspection_id, "error": rec.error,
                                                                    "trace": traceback.format_exc(limit=5)}})
            if frames and frames[0].image is not None and getattr(frames[0].image, "size", 0):
                try:
                    annotated = annotate(frames[0].image, decision, [str(e)[:80]])
                except Exception:
                    annotated = None

        rec.status, rec.category = decision.status.value, decision.category.value
        # sem repetir o mesmo motivo para cada unidade (ordem preservada)
        rec.reasons = list(dict.fromkeys(list(decision.reasons) + [r for c in decision.capsules for r in c.reasons]))
        rec.capsules = [c.to_dict() for c in decision.capsules]
        out = InspectionOutput(rec, decision, annotated, originals)
        # tempos gravados no registro: da captura até a anotação (antes da persistência)
        rec.timings_ms = timer.as_dict()
        if persist:
            with timer.stage("persist"):
                self._persist(out)
            rec.timings_ms["persist"] = round(timer.stages["persist"], 3)
            rec.timings_ms["total_with_persist"] = round(timer.total_ms(), 3)
        return out

    # ------------------------------------------------------------------ persistência
    def _persist(self, out: InspectionOutput) -> None:
        rec = out.record
        st = self.s.system.storage
        ann = self.s.inference.annotation
        try:
            if free_disk_gb(self.images_dir) < st.retention.min_free_disk_gb:
                raise StorageError(f"espaço em disco abaixo de {st.retention.min_free_disk_gb} GB")
            day = _dt.datetime.now().strftime("%Y-%m-%d")
            d = self.images_dir / rec.status / day
            if ann.save_original:
                for view, img in out.originals.items():
                    p = d / f"{rec.inspection_id}_{view}.png"
                    atomic_write_image(p, img)
                    rec.images[f"original_{view}"] = str(p.relative_to(self.images_dir))
            if ann.save_annotated and out.annotated is not None:
                p = d / f"{rec.inspection_id}_annotated.jpg"
                atomic_write_image(p, out.annotated, ann.jpeg_quality)
                rec.images["annotated"] = str(p.relative_to(self.images_dir))
            if self.db is not None:
                payload = None
                if self.s.system.integration.publisher.enabled:
                    from .integration.publisher import build_payload
                    payload = build_payload(rec.to_dict(), self.s.system.integration.publisher.include_images)
                self.db.insert(rec, payload)
        except (StorageError, OSError) as e:
            # Falha de armazenamento: o resultado vira SYSTEM_ERROR (sem rastreabilidade não há PASS)
            rec.status = InspectionStatus.SYSTEM_ERROR.value
            rec.category = ResultCategory.SYSTEM_ERROR.value
            rec.error = f"StorageError: {e}"
            rec.reasons.append(f"SYSTEM_ERROR: armazenamento: {e}")
            out.decision.status = InspectionStatus.SYSTEM_ERROR
            out.decision.category = ResultCategory.SYSTEM_ERROR
            log.error("falha de armazenamento", extra={"extra_fields": {"id": rec.inspection_id, "error": str(e)}})
            try:
                self.fallback_path.parent.mkdir(parents=True, exist_ok=True)
                with open(self.fallback_path, "a", encoding="utf-8") as fh:
                    fh.write(json.dumps(rec.to_dict(), default=str) + "\n")
            except OSError:
                log.critical("registro de fallback também falhou", extra={"extra_fields": {"id": rec.inspection_id}})


def merge_views(dets: list[Detection], iou: float) -> list[Detection]:
    """União das detecções de várias vistas com NMS por classe (mantém a mais confiante)."""
    if len(dets) < 2:
        return dets
    boxes = np.array([d.box for d in dets], np.float32)
    scores = np.array([d.confidence for d in dets], np.float32)
    cls = np.array([d.class_id for d in dets], np.float32)
    keep = nms(boxes + cls[:, None] * 100000.0, scores, iou)
    return [dets[i] for i in keep]
