#!/usr/bin/env python3
"""Demonstra a reunião de resultados de três vistas a partir de um manifesto CSV.

  python scripts/run_multiview.py --weights models/final/classify_yolo11n_cls.pt \
      --manifest data/multiview/manifest.csv --out reports/multiview

Colunas do manifesto: path, view_id, capsule_id e/ou trigger_id [, timestamp_ms, camera_id].
Imagens sem identificador explícito NÃO são associadas (ficam em `unassociated`).
"""

import argparse
import json
from pathlib import Path

import _bootstrap  # noqa: F401

from acg_vision.config import load_yaml, resolve
from acg_vision.inference.predictor import Predictor
from acg_vision.multiview.core import LocalManifestSource, associate, fuse


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--weights", required=True, type=Path)
    ap.add_argument("--manifest", required=True, type=Path)
    ap.add_argument("--out", type=Path, default=Path("reports/multiview"))
    a = ap.parse_args()
    cfg = load_yaml("multiview.yaml")
    imgs = LocalManifestSource(resolve(a.manifest)).images()
    asc = associate(imgs, cfg["association"]["allow_timestamp_matching"], cfg["association"]["timestamp_tolerance_ms"])
    pred = Predictor(resolve(a.weights))
    capsules = []
    for key, views in sorted(asc.groups.items()):
        results = []
        for v in views:
            r = pred.predict(v.path, view_id=v.view_id)
            r.pop("_annotated", None)
            results.append(r)
        capsules.append(fuse(key, views, results, cfg["views"], cfg["fusion"]["defect_threshold"]))
    doc = {"model": pred.model_info, "association_method": asc.method, "capsules": capsules,
           "unassociated": [{"path": str(v.path), "view_id": v.view_id} for v in asc.unassociated],
           "warning": "geometria e sincronização das câmeras desconhecidas; sem fusão geométrica"}
    out = resolve(a.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / "multiview_report.json").write_text(json.dumps(doc, indent=2, ensure_ascii=False), encoding="utf-8")
    for c in capsules:
        print(c["capsule"], c["decision"], [(v["view_id"], v["p_defect"]) for v in c["views"]])
    print("não associadas:", len(asc.unassociated))


if __name__ == "__main__":
    main()
