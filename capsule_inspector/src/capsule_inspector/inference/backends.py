"""Backends de inferência com interface única.

- OnnxRuntimeBackend: padrão no Raspberry Pi. Não exige PyTorch.
- OpenCvDnnBackend:   alternativa sem ONNX Runtime; compatibilidade depende da
                      versão do OpenCV e dos operadores do grafo exportado.
- UltralyticsBackend: .pt / NCNN / OpenVINO via Ultralytics (exige o pacote).
Todos retornam detecções em coordenadas da imagem original.
"""

from __future__ import annotations

import ast
import time
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

import numpy as np

from ..types import Detection
from .postprocess import decode_yolo_output
from .preprocess import letterbox, to_blob


class BackendError(RuntimeError):
    pass


class Backend(ABC):
    name = "base"

    def __init__(self, model_path: Path, imgsz: int, names: list[str] | None, conf: float,
                 iou: float, max_det: int):
        self.model_path = Path(model_path)
        self.imgsz = imgsz
        self.names = list(names or [])
        self.conf = conf
        self.iou = iou
        self.max_det = max_det
        self.task = "detect"

    @abstractmethod
    def predict(self, image: np.ndarray) -> tuple[list[Detection], dict[str, float]]:
        """Retorna (detecções, tempos em ms: preprocess/inference/postprocess)."""

    def info(self) -> dict[str, Any]:
        return {"backend": self.name, "model": str(self.model_path), "imgsz": self.imgsz,
                "task": self.task, "names": self.names}


def _parse_names(raw: str) -> list[str]:
    d = ast.literal_eval(raw)
    if isinstance(d, dict):
        return [d[k] for k in sorted(d, key=int)]
    return list(d)


class OnnxRuntimeBackend(Backend):
    name = "onnxruntime"

    def __init__(self, model_path: Path, imgsz: int, names: list[str] | None = None, conf: float = 0.05,
                 iou: float = 0.5, max_det: int = 100, num_threads: int = 4):
        super().__init__(model_path, imgsz, names, conf, iou, max_det)
        try:
            import onnxruntime as ort
        except ImportError as e:
            raise BackendError("onnxruntime não instalado") from e
        so = ort.SessionOptions()
        so.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        so.intra_op_num_threads = max(1, int(num_threads))
        so.inter_op_num_threads = 1
        so.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
        try:
            self.session = ort.InferenceSession(str(self.model_path), sess_options=so,
                                                providers=["CPUExecutionProvider"])
        except Exception as e:
            raise BackendError(f"falha ao carregar ONNX {self.model_path}: {e}") from e
        meta = self.session.get_modelmeta().custom_metadata_map
        self.metadata = dict(meta)
        if "names" in meta:
            model_names = _parse_names(meta["names"])
            if self.names and self.names != model_names:
                raise BackendError(f"classes do modelo {model_names} != esperadas {self.names}")
            self.names = model_names
        if not self.names:
            raise BackendError("nomes de classes desconhecidos (sem metadados no ONNX e sem manifesto)")
        self.task = meta.get("task", "detect")
        inp = self.session.get_inputs()[0]
        self.input_name = inp.name
        shape = inp.shape
        if isinstance(shape[2], int) and shape[2] != imgsz:
            raise BackendError(f"modelo exportado com imgsz={shape[2]}, configuração pede {imgsz}")
        self.input_dtype = np.float16 if "float16" in inp.type else np.float32
        self.outputs = [o.name for o in self.session.get_outputs()]
        if self.task == "segment" and len(self.outputs) < 2:
            raise BackendError("modelo de segmentação sem saída de protótipos")

    def predict(self, image: np.ndarray) -> tuple[list[Detection], dict[str, float]]:
        t0 = time.perf_counter()
        lb, r, pad = letterbox(image, self.imgsz)
        blob = to_blob(lb).astype(self.input_dtype, copy=False)
        t1 = time.perf_counter()
        outs = self.session.run(self.outputs, {self.input_name: blob})
        t2 = time.perf_counter()
        protos = outs[1].astype(np.float32) if self.task == "segment" else None
        dets = decode_yolo_output(outs[0].astype(np.float32), len(self.names), self.conf, self.iou,
                                  self.max_det, r, pad, image.shape[:2], self.names, protos, self.imgsz)
        t3 = time.perf_counter()
        return dets, {"preprocess": (t1 - t0) * 1e3, "inference": (t2 - t1) * 1e3,
                      "postprocess": (t3 - t2) * 1e3}


class OpenCvDnnBackend(Backend):
    name = "opencv_dnn"

    def __init__(self, model_path: Path, imgsz: int, names: list[str] | None = None, conf: float = 0.05,
                 iou: float = 0.5, max_det: int = 100, num_threads: int = 4):
        super().__init__(model_path, imgsz, names, conf, iou, max_det)
        import cv2
        if not self.names:
            raise BackendError("OpenCV DNN não lê metadados: informe os nomes pelo manifesto")
        cv2.setNumThreads(max(1, int(num_threads)))
        try:
            self.net = cv2.dnn.readNetFromONNX(str(self.model_path))
        except cv2.error as e:
            raise BackendError(f"OpenCV DNN não suporta este grafo: {e}") from e
        self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
        # Alguns grafos carregam mas falham ao executar (ex.: INT8 QDQ): testar já na carga.
        try:
            self.net.setInput(np.zeros((1, 3, imgsz, imgsz), np.float32))
            self.net.forward()
        except cv2.error as e:
            raise BackendError(f"OpenCV DNN não executa este grafo: {str(e).strip().splitlines()[-1]}") from e

    def predict(self, image: np.ndarray) -> tuple[list[Detection], dict[str, float]]:
        t0 = time.perf_counter()
        lb, r, pad = letterbox(image, self.imgsz)
        blob = to_blob(lb)
        t1 = time.perf_counter()
        self.net.setInput(blob)
        out = self.net.forward()
        t2 = time.perf_counter()
        dets = decode_yolo_output(np.asarray(out, np.float32), len(self.names), self.conf, self.iou,
                                  self.max_det, r, pad, image.shape[:2], self.names, None, self.imgsz)
        t3 = time.perf_counter()
        return dets, {"preprocess": (t1 - t0) * 1e3, "inference": (t2 - t1) * 1e3,
                      "postprocess": (t3 - t2) * 1e3}


class UltralyticsBackend(Backend):
    name = "ultralytics"

    def __init__(self, model_path: Path, imgsz: int, names: list[str] | None = None, conf: float = 0.05,
                 iou: float = 0.5, max_det: int = 100, num_threads: int = 4):
        super().__init__(model_path, imgsz, names, conf, iou, max_det)
        try:
            from ultralytics import YOLO
        except ImportError as e:
            raise BackendError("ultralytics não instalado (requirements/training.txt)") from e
        try:
            import torch
            torch.set_num_threads(max(1, int(num_threads)))
        except ImportError:
            pass
        self.model = YOLO(str(self.model_path), task=None)
        mn = self.model.names
        model_names = [mn[k] for k in sorted(mn)] if isinstance(mn, dict) else list(mn)
        if self.names and self.names != model_names:
            raise BackendError(f"classes do modelo {model_names} != esperadas {self.names}")
        self.names = model_names
        self.task = self.model.task

    def predict(self, image: np.ndarray) -> tuple[list[Detection], dict[str, float]]:
        res = self.model.predict(image, imgsz=self.imgsz, conf=self.conf, iou=self.iou,
                                 max_det=self.max_det, verbose=False, device="cpu")[0]
        dets: list[Detection] = []
        boxes = res.boxes
        polys = res.masks.xy if res.masks is not None else None
        for i in range(len(boxes)):
            c = int(boxes.cls[i])
            poly = [(float(x), float(y)) for x, y in polys[i]] if polys is not None and len(polys[i]) else None
            dets.append(Detection(c, self.names[c], float(boxes.conf[i]),
                                  tuple(float(v) for v in boxes.xyxy[i].tolist()), poly))
        sp = res.speed
        return dets, {"preprocess": float(sp.get("preprocess", 0)), "inference": float(sp.get("inference", 0)),
                      "postprocess": float(sp.get("postprocess", 0))}


BACKENDS = {"onnxruntime": OnnxRuntimeBackend, "opencv_dnn": OpenCvDnnBackend,
            "ultralytics": UltralyticsBackend}


def create_backend(kind: str, model_path: Path, **kw: Any) -> Backend:
    if kind == "auto":
        from ..monitoring.hardware import recommend_backend
        kind = recommend_backend(model_path)
    if kind not in BACKENDS:
        raise BackendError(f"backend desconhecido: {kind}")
    return BACKENDS[kind](model_path, **kw)
