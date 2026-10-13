"""Inferência offline em imagens locais (detecção ou classificação, conforme os pesos).

Cada resultado carrega: arquivo e SHA-256 dos pesos, tarefa, vista de origem, tempos e
a etiqueta de proveniência "treinado só com dados públicos; não validado para a ACG".
"""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from .. import MODEL_PROVENANCE_TAG, __version__
from ..data.fetch import sha256_file
from ..offline import enable_offline, require

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".tif", ".tiff"}


class Predictor:
    def __init__(self, weights: Path, imgsz: int | None = None, conf: float = 0.25, offline: bool = True):
        from ultralytics import YOLO
        if offline:
            enable_offline()
        self.weights = require(Path(weights), "pesos do modelo", "treine ou copie os pesos para este caminho")
        self.model = YOLO(str(self.weights))
        self.task = self.model.task
        if self.task not in ("detect", "classify"):
            raise ValueError(f"tarefa não suportada: {self.task}")
        self.names = [self.model.names[k] for k in sorted(self.model.names)]
        self.imgsz = imgsz or int(self.model.overrides.get("imgsz") or (224 if self.task == "classify" else 640))
        self.conf = conf
        side = self.weights.with_suffix(".run_manifest.json")
        manifest = side if side.exists() else self.weights.parents[1] / "run_manifest.json"
        self.model_info = {"file": str(self.weights), "sha256": sha256_file(self.weights), "task": self.task,
                           "names": self.names, "imgsz": self.imgsz, "provenance": MODEL_PROVENANCE_TAG,
                           "run_manifest": str(manifest) if manifest.exists() else None,
                           "software_version": __version__}

    def warmup(self, n: int = 2) -> None:
        """A 1ª chamada inclui inicialização preguiçosa; aquecer antes de medir tempos."""
        dummy = np.zeros((self.imgsz, self.imgsz, 3), np.uint8)
        for _ in range(n):
            self.model.predict(dummy, imgsz=self.imgsz, verbose=False, device="cpu")

    def predict(self, image: np.ndarray | str | Path, view_id: str | None = None,
                source: str | None = None) -> dict[str, Any]:
        img = cv2.imread(str(image)) if not isinstance(image, np.ndarray) else image
        if img is None or img.size == 0:
            return {"source": source or str(image), "view_id": view_id, "status": "ERROR",
                    "error": "imagem ilegível ou vazia"}
        t0 = time.perf_counter()
        r = self.model.predict(img, imgsz=self.imgsz, conf=self.conf, verbose=False, device="cpu")[0]
        ms = (time.perf_counter() - t0) * 1000
        out: dict[str, Any] = {"source": source or (str(image) if not isinstance(image, np.ndarray) else None),
                               "view_id": view_id, "status": "OK", "task": self.task,
                               "image_size": [int(img.shape[1]), int(img.shape[0])], "inference_ms": round(ms, 2),
                               "model_sha256": self.model_info["sha256"], "provenance": MODEL_PROVENANCE_TAG}
        if self.task == "detect":
            out["detections"] = [{"class": self.names[int(c)], "confidence": round(float(s), 4),
                                  "box_xyxy": [round(float(v), 1) for v in b]}
                                 for b, s, c in zip(r.boxes.xyxy.tolist(), r.boxes.conf.tolist(),
                                                    r.boxes.cls.tolist())]
        else:
            probs = r.probs.data.tolist()
            pairs = sorted(zip(self.names, probs), key=lambda x: -x[1])
            if len(pairs) > 10:  # ex.: ImageNet (1000 classes): guarda só o top-5
                pairs = pairs[:5]
            out["classification"] = {"label": self.names[int(r.probs.top1)], "top_k": len(pairs),
                                     "probabilities": {n: round(float(p), 6) for n, p in pairs}}
        out["_annotated"] = r.plot()
        return out


def iter_images(paths: list[Path]) -> list[Path]:
    files: list[Path] = []
    for p in paths:
        p = Path(p)
        if p.is_dir():
            files += sorted(x for x in p.rglob("*") if x.suffix.lower() in IMAGE_EXTS)
        elif p.suffix.lower() in IMAGE_EXTS:
            files.append(p)
        else:
            raise FileNotFoundError(f"não é imagem nem diretório: {p}")
    return files


def run(weights: Path, inputs: list[Path], out_dir: Path, conf: float = 0.25, imgsz: int | None = None,
        view_id: str | None = None) -> Path:
    pred = Predictor(weights, imgsz, conf)
    pred.warmup()
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "annotated").mkdir(exist_ok=True)
    results = []
    for f in iter_images(inputs):
        r = pred.predict(f, view_id=view_id)
        ann = r.pop("_annotated", None)
        if ann is not None:
            p = out_dir / "annotated" / f"{f.stem}_pred.jpg"
            cv2.imwrite(str(p), ann)
            r["annotated"] = str(p)
        results.append(r)
    doc = {"model": pred.model_info, "n_images": len(results), "results": results}
    jp = out_dir / "predictions.json"
    jp.write_text(json.dumps(doc, indent=2, ensure_ascii=False), encoding="utf-8")
    return jp
