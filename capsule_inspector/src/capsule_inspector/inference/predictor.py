"""Carregamento validado do modelo e inferência (com recorte em 2 estágios opcional)."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import numpy as np

from ..config import Settings
from ..registry import ModelRegistry, RegistryError, sha256_path
from ..types import Detection
from .backends import Backend, BackendError, create_backend

log = logging.getLogger("capsule_inspector.predictor")


class ModelLoadError(RuntimeError):
    pass


@dataclass
class ModelInfo:
    model_id: str
    path: str
    sha256: str
    backend: str
    imgsz: int
    task: str
    names: list[str]
    approved: bool
    source: str  # registry | override
    manifest: dict[str, Any] = field(default_factory=dict)

    def as_dict(self) -> dict[str, Any]:
        return {"model_id": self.model_id, "path": self.path, "sha256": self.sha256,
                "backend": self.backend, "imgsz": self.imgsz, "task": self.task,
                "names": self.names, "approved": self.approved, "source": self.source}


class Predictor:
    def __init__(self, backend: Backend, info: ModelInfo):
        self.backend = backend
        self.info = info

    @classmethod
    def from_settings(cls, settings: Settings, model_path: str | Path | None = None) -> Predictor:
        mcfg = settings.inference.model
        expected = settings.taxonomy.training_names()
        override = model_path or mcfg.path_override
        manifest: dict[str, Any] = {}
        if override:
            path = settings.path(override)
            if not path.exists():
                raise ModelLoadError(f"modelo não encontrado: {path}")
            model_id, approved, source = f"override:{path.name}", False, "override"
            # manifesto ao lado do arquivo (gerado pelo export) se existir
            side = path.with_suffix(".manifest.json")
            if side.exists():
                import json
                manifest = json.loads(side.read_text(encoding="utf-8"))
        else:
            reg = ModelRegistry(settings.path(mcfg.registry_dir))
            try:
                path, manifest = reg.resolve_active()
            except RegistryError as e:
                raise ModelLoadError(str(e)) from e
            model_id, approved, source = manifest["model_id"], manifest.get("status") == "approved", "registry"
        names = manifest.get("class_names") or expected
        if names != expected:
            raise ModelLoadError(f"classes do modelo {names} != taxonomia habilitada {expected}; "
                                 "re-treine ou ajuste configs/taxonomy.yaml")
        imgsz = int(manifest.get("imgsz", mcfg.imgsz))
        if imgsz != mcfg.imgsz:
            raise ModelLoadError(f"modelo exportado para imgsz={imgsz}, inference.yaml pede {mcfg.imgsz}")
        try:
            backend = create_backend(mcfg.backend, path, imgsz=imgsz, names=expected,
                                     conf=mcfg.candidate_conf, iou=mcfg.nms_iou, max_det=mcfg.max_det,
                                     num_threads=mcfg.num_threads)
        except BackendError as e:
            raise ModelLoadError(str(e)) from e
        except MemoryError as e:
            raise ModelLoadError("memória insuficiente para carregar o modelo") from e
        info = ModelInfo(model_id=model_id, path=str(path), sha256=manifest["sha256"] if source == "registry" else sha256_path(path),
                         backend=backend.name, imgsz=imgsz, task=backend.task, names=backend.names,
                         approved=approved, source=source, manifest=manifest)
        p = cls(backend, info)
        p.warmup(mcfg.warmup_runs)
        log.info("modelo carregado", extra={"extra_fields": info.as_dict()})
        return p

    def warmup(self, runs: int = 3) -> None:
        dummy = np.full((self.info.imgsz, self.info.imgsz, 3), 114, np.uint8)
        for _ in range(max(0, runs)):
            self.backend.predict(dummy)

    def predict(self, image: np.ndarray, view: str | None = None) -> tuple[list[Detection], dict[str, float]]:
        if image is None or image.size == 0:
            raise ValueError("imagem vazia")
        dets, t = self.backend.predict(image)
        for d in dets:
            d.view = view
        return dets, t

    def predict_crops(self, image: np.ndarray, rois: list[tuple[int, int, int, int]], view: str | None = None
                      ) -> tuple[list[Detection], dict[str, float]]:
        """Segundo estágio: roda o detector em cada ROI e devolve coordenadas globais."""
        out: list[Detection] = []
        tot = {"preprocess": 0.0, "inference": 0.0, "postprocess": 0.0}
        for x1, y1, x2, y2 in rois:
            crop = image[y1:y2, x1:x2]
            if crop.size == 0:
                continue
            dets, t = self.backend.predict(crop)
            for k in tot:
                tot[k] += t.get(k, 0.0)
            for d in dets:
                bx1, by1, bx2, by2 = d.box
                d.box = (bx1 + x1, by1 + y1, bx2 + x1, by2 + y1)
                if d.polygon:
                    d.polygon = [(px + x1, py + y1) for px, py in d.polygon]
                d.view = view
                out.append(d)
        return out, tot
