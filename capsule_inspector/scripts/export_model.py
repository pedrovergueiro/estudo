#!/usr/bin/env python3
"""Exporta o checkpoint para ONNX (ou NCNN), opcionalmente quantiza INT8 e registra.

  python scripts/export_model.py --weights runs/train/.../best.pt --imgsz 640
  python scripts/export_model.py --weights best.pt --imgsz 640 --int8 --calib-split train
  python scripts/export_model.py --weights best.pt --imgsz 640 --register --model-id caps-v1-640
  python scripts/export_model.py --weights best.pt --imgsz 640 --format ncnn

O artefato registrado é `candidate`; ele só entra em produção após
scripts/manage_models.py approve + activate.
"""

import argparse
import json
import random
import sys
from pathlib import Path

import _bootstrap  # noqa: F401
from capsule_inspector.config import load_settings
from capsule_inspector.registry import ModelRegistry
from capsule_inspector.training.export import export_model, quantize_int8, write_sidecar


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--weights", required=True, type=Path)
    ap.add_argument("--imgsz", type=int, nargs="+", default=[640])
    ap.add_argument("--format", default="onnx", choices=["onnx", "ncnn", "openvino"])
    ap.add_argument("--opset", type=int)
    ap.add_argument("--half", action="store_true", help="FP16 (não recomendado em CPU; só com benchmark)")
    ap.add_argument("--int8", action="store_true")
    ap.add_argument("--calib-split", default="train", choices=["train", "val"])
    ap.add_argument("--calib-n", type=int, default=200)
    ap.add_argument("--out", type=Path, default=Path("models/export"))
    ap.add_argument("--register", action="store_true")
    ap.add_argument("--model-id")
    a = ap.parse_args()
    s = load_settings()
    out_dir = s.path(a.out)
    produced = []
    for sz in a.imgsz:
        path, info = export_model(s.path(a.weights), out_dir, sz, a.format, a.opset, half=a.half)
        if info["class_names"] != s.taxonomy.training_names():
            print(f"ERRO: classes do checkpoint {info['class_names']} != taxonomia", file=sys.stderr)
            return 2
        info["taxonomy_version"] = s.taxonomy.taxonomy_version
        produced.append((path, info))
        print("exportado:", path)
        if a.int8:
            if a.format != "onnx":
                print("INT8 implementado apenas para ONNX Runtime", file=sys.stderr)
                return 2
            lst = s.path(s.dataset.paths["splits"]) / f"{a.calib_split}.txt"
            imgs = [Path(p) for p in lst.read_text().split()]
            random.Random(0).shuffle(imgs)
            qpath = path.with_name(path.name.replace("_fp32", "_int8"))
            qpath, qinfo = quantize_int8(path, imgs[:a.calib_n], qpath, sz)
            qi = {**info, **qinfo, "format": "onnx"}
            write_sidecar(qpath, qi)
            produced.append((qpath, qi))
            print("quantizado:", qpath, "— compare com FP32 antes de usar (benchmark_model.py --eval-split test)")
    if a.register:
        if len(produced) != 1:
            print("--register exige exatamente 1 artefato (um imgsz, sem --int8 simultâneo)", file=sys.stderr)
            return 2
        if not a.model_id:
            print("--register exige --model-id", file=sys.stderr)
            return 2
        reg = ModelRegistry(s.path(s.inference.model.registry_dir))
        m = reg.register(produced[0][0], a.model_id, produced[0][1])
        print(json.dumps({k: m[k] for k in ("model_id", "sha256", "status")}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
