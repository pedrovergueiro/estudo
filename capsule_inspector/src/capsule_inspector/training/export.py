"""Exportação (ONNX/NCNN), quantização INT8 opcional e manifesto do artefato.

Notas de decisão:
- ONNX FP32 + ONNX Runtime CPU é a referência para o Raspberry Pi (sem PyTorch
  no dispositivo, grafo otimizado pelo ORT).
- FP16: o provedor CPU do ONNX Runtime executa a maioria dos operadores em FP32;
  um modelo FP16 tende a inserir conversões e não acelerar em CPU ARM. Por isso
  não é gerado por padrão; só use se o benchmark no hardware real mostrar ganho.
- INT8 estático (QDQ, por canal) apenas em Conv, com calibração em imagens de
  TREINO/VALIDAÇÃO (nunca de teste) e excluindo a DFL do cabeçote (decodifica
  coordenadas; quantizá-la degrada a localização). Deve ser comparado contra
  FP32 com scripts/benchmark_model.py --eval-split test antes de adoção.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from ..dataset.hashing import file_sha256
from ..inference.preprocess import letterbox, to_blob


def export_model(weights: Path, out_dir: Path, imgsz: int, fmt: str = "onnx", opset: int | None = None,
                 simplify: bool = True, half: bool = False) -> tuple[Path, dict[str, Any]]:
    import ultralytics
    from ultralytics import YOLO

    weights = Path(weights)
    model = YOLO(str(weights))
    names = [model.names[k] for k in sorted(model.names)]
    kw: dict[str, Any] = {"format": fmt, "imgsz": imgsz, "half": half, "dynamic": False}
    if fmt == "onnx":
        kw.update({"simplify": simplify, "nms": False})
        if opset:
            kw["opset"] = opset
    produced = Path(model.export(**kw))
    out_dir.mkdir(parents=True, exist_ok=True)
    suffix = "_fp16" if half else "_fp32"
    dest = out_dir / f"{weights.stem}_{imgsz}{suffix}{'.onnx' if fmt == 'onnx' else '_' + fmt + '_model'}"
    if dest.exists():
        shutil.rmtree(dest) if dest.is_dir() else dest.unlink()
    shutil.move(str(produced), dest)
    info = {
        "class_names": names, "imgsz": imgsz, "task": model.task, "format": fmt,
        "precision": "fp16" if half else "fp32", "quantization": None,
        "source_checkpoint": {"path": str(weights), "sha256": file_sha256(weights)},
        "export": {k: v for k, v in kw.items()}, "ultralytics_version": ultralytics.__version__,
    }
    write_sidecar(dest, info)
    return dest, info


def write_sidecar(artifact: Path, info: dict[str, Any]) -> Path:
    p = artifact.with_suffix(".manifest.json") if artifact.is_file() else artifact.parent / (artifact.name + ".manifest.json")
    p.write_text(json.dumps(info, indent=2, ensure_ascii=False), encoding="utf-8")
    return p


class _Calib:
    def __init__(self, images: list[Path], imgsz: int, input_name: str):
        self.items = iter(images)
        self.imgsz = imgsz
        self.input_name = input_name

    def get_next(self) -> dict[str, np.ndarray] | None:
        for p in self.items:
            img = cv2.imdecode(np.fromfile(str(p), dtype=np.uint8), cv2.IMREAD_COLOR)
            if img is None:
                continue
            lb, _, _ = letterbox(img, self.imgsz)
            return {self.input_name: to_blob(lb)}
        return None

    def rewind(self) -> None:  # interface opcional do ORT
        pass


def quantize_int8(onnx_fp32: Path, calib_images: list[Path], out_path: Path, imgsz: int,
                  exclude_dfl: bool = True, per_channel: bool = True) -> tuple[Path, dict[str, Any]]:
    import onnx
    from onnxruntime.quantization import (
        CalibrationDataReader,
        CalibrationMethod,
        QuantFormat,
        QuantType,
        quantize_static,
    )

    if len(calib_images) < 20:
        raise ValueError("calibração INT8 exige >= 20 imagens representativas (recomendado 100-300)")
    src = Path(onnx_fp32)
    prep = out_path.with_name(out_path.stem + "_prep.onnx")
    try:
        from onnxruntime.quantization.shape_inference import quant_pre_process
        quant_pre_process(str(src), str(prep), skip_symbolic_shape=True)
    except Exception:
        shutil.copy2(src, prep)
    model = onnx.load(str(prep))
    input_name = model.graph.input[0].name
    exclude = [n.name for n in model.graph.node if exclude_dfl and "dfl" in n.name.lower()]

    class Reader(_Calib, CalibrationDataReader):
        pass

    quantize_static(str(prep), str(out_path), Reader(calib_images, imgsz, input_name),
                    quant_format=QuantFormat.QDQ, per_channel=per_channel,
                    activation_type=QuantType.QUInt8, weight_type=QuantType.QInt8,
                    op_types_to_quantize=["Conv"], nodes_to_exclude=exclude,
                    calibrate_method=CalibrationMethod.MinMax)
    prep.unlink(missing_ok=True)
    # preserva metadados (names, imgsz, task) do FP32 para o backend ORT
    q = onnx.load(str(out_path))
    src_meta = {p.key: p.value for p in onnx.load(str(src)).metadata_props}
    del q.metadata_props[:]
    for k, v in src_meta.items():
        q.metadata_props.add(key=k, value=v)
    onnx.save(q, str(out_path))
    info = {"quantization": {"type": "int8_static_qdq", "per_channel": per_channel,
                             "calibration_images": len(calib_images), "excluded_nodes": exclude,
                             "op_types": ["Conv"]},
            "source_onnx_sha256": file_sha256(src), "precision": "int8"}
    return out_path, info
