#!/usr/bin/env python3
"""Avalia um modelo (.pt, .onnx, NCNN) num split independente e gera relatório.

  python scripts/evaluate_model.py --model runs/train/.../best.pt --split test
  python scripts/evaluate_model.py --model models/export/best_640_fp32.onnx --split test \
      --reference reports/eval_prev/evaluation.json        # teste de regressão
  python scripts/evaluate_model.py --model best.pt --split val --calibrate   # sugere limiares
  python scripts/evaluate_model.py --model best.onnx --split test --baseline  # primeiro modelo

O relatório de TESTE com `regression.passed: true` é o exigido por
scripts/manage_models.py approve. Limiares devem ser calibrados no split `val`.
"""

import argparse
import json
import sys
from pathlib import Path

import _bootstrap  # noqa: F401
from capsule_inspector.config import load_settings
from capsule_inspector.dataset.metadata import load_metadata
from capsule_inspector.inference.backends import create_backend
from capsule_inspector.inference.preprocess import build_pipeline
from capsule_inspector.registry import sha256_path
from capsule_inspector.training.evaluate import build_report, calibration_suggestion, collect_predictions, write_report
from capsule_inspector.training.metrics import regression_check


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--model", required=True, type=Path)
    ap.add_argument("--backend", default="auto")
    ap.add_argument("--imgsz", type=int, help="padrão: inference.yaml")
    ap.add_argument("--split", default="test", choices=["train", "val", "test"])
    ap.add_argument("--split-dir", type=Path)
    ap.add_argument("--profile", help="aplica o pré-processamento do perfil (se o treino usou)")
    ap.add_argument("--out", type=Path)
    ap.add_argument("--reference", type=Path, help="evaluation.json do modelo atual (regressão)")
    ap.add_argument("--baseline", action="store_true", help="primeiro modelo: sem referência")
    ap.add_argument("--calibrate", action="store_true", help="sugere limiares (use no split val)")
    ap.add_argument("--anomaly", type=Path, help="modelo do Modo C (.npz) para comparar decisão com/sem")
    a = ap.parse_args()
    s = load_settings()
    names = s.taxonomy.training_names()
    imgsz = a.imgsz or s.inference.model.imgsz
    split_dir = a.split_dir or s.path(s.dataset.paths["splits"])
    lst = split_dir / f"{a.split}.txt"
    if not lst.exists():
        print(f"{lst} não existe: rode scripts/validate_dataset.py --split", file=sys.stderr)
        return 2
    paths = [Path(p) for p in lst.read_text().split()]
    if not paths:
        print(f"split {a.split} vazio", file=sys.stderr)
        return 2
    if a.split == "train":
        print("AVISO: métricas no split de treino NÃO indicam generalização.")
    root = s.path(s.dataset.working_dataset.root)
    meta = load_metadata(s.path(s.dataset.working_dataset.metadata_csv) if s.dataset.working_dataset.metadata_csv
                         else None, root)
    be = create_backend(a.backend, s.path(a.model), imgsz=imgsz, names=names,
                        conf=s.inference.model.candidate_conf, iou=s.inference.model.nms_iou,
                        max_det=s.inference.model.max_det, num_threads=s.inference.model.num_threads)
    pre = build_pipeline(s.lighting.profiles[a.profile].preprocessing) if a.profile else None
    lat: list[float] = []
    images = collect_predictions(lambda x: be.predict(x)[0], paths, root, meta, pre, lat)
    model = {"model_id": a.model.name, "path": str(a.model), "backend": be.name, "imgsz": imgsz,
             "sha256": sha256_path(s.path(a.model))}
    anomaly = None
    if a.anomaly:
        from capsule_inspector.inference.anomaly import PatchCoreLite
        anomaly = PatchCoreLite.load(s.path(a.anomaly))
    rep = build_report(images, s, names, model, a.split, lat, anomaly)
    if a.calibrate:
        if a.split == "test":
            print("AVISO: calibrar no teste contamina a avaliação final; use --split val.")
        rep["calibration"] = calibration_suggestion(images, s, names)
    if a.reference:
        ref = json.loads(a.reference.read_text(encoding="utf-8"))
        rep["regression"] = regression_check(rep, ref)
        rep["regression"]["reference"] = str(a.reference)
    elif a.baseline:
        rep["regression"] = {"passed": a.split == "test", "baseline": True,
                             "note": "primeiro modelo: sem referência; aprovação depende da revisão humana "
                                     "do relatório completo"}
    out = a.out or s.path("reports") / f"eval_{a.model.stem}_{a.split}"
    p = write_report(rep, images, s, out)
    sm = rep["summary"]
    print(json.dumps({"map50": sm["map50"], "map50_95": sm["map50_95"], "defects_recall": sm["defects_recall"],
                      "escape_rate": rep["decision"]["escape_rate"],
                      "regression": rep.get("regression", {}).get("passed")}, indent=2))
    print("relatório:", p["markdown"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
