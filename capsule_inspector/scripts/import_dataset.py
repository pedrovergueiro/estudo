#!/usr/bin/env python3
"""Converte anotações externas para YOLO na taxonomia do projeto.

Exemplos:
  # Pascal VOC
  python scripts/import_dataset.py voc --xml data/raw/x/Annotations --images data/raw/x/JPEGImages \
      --out data/interim/x_yolo
  # COCO (detecção ou segmentação)
  python scripts/import_dataset.py coco --json data/raw/y/annotations.json --images data/raw/y/images \
      --out data/interim/y_yolo --task segment
  # YOLO com outra lista de classes
  python scripts/import_dataset.py yolo --src data/raw/z --names crack,dent,good --out data/interim/z_yolo
  # mapeamento manual de classes externas -> taxonomia
  ... --map "faulty_imprint=stain,squeeze=dent"
"""

import argparse
import json
import sys
from pathlib import Path

import _bootstrap  # noqa: F401
from capsule_inspector.config import load_settings
from capsule_inspector.dataset.convert import convert_coco, convert_voc, remap_yolo_dataset


def parse_map(s: str | None) -> dict[str, str]:
    if not s:
        return {}
    return dict(kv.split("=", 1) for kv in s.split(",") if "=" in kv)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="fmt", required=True)
    v = sub.add_parser("voc")
    v.add_argument("--xml", required=True, type=Path)
    v.add_argument("--images", required=True, type=Path)
    v.add_argument("--skip-difficult", action="store_true")
    c = sub.add_parser("coco")
    c.add_argument("--json", required=True, type=Path)
    c.add_argument("--images", required=True, type=Path)
    c.add_argument("--task", choices=["detect", "segment"], default="detect")
    y = sub.add_parser("yolo")
    y.add_argument("--src", required=True, type=Path)
    y.add_argument("--names", required=True, help="classes da fonte, na ordem dos IDs, separadas por vírgula")
    y.add_argument("--task", choices=["detect", "segment"], default="detect")
    for p in (v, c, y):
        p.add_argument("--out", required=True, type=Path)
        p.add_argument("--map", help="mapeamento extra nome_externo=chave_taxonomia,...")
        p.add_argument("--strict", action="store_true", help="falha se houver classes sem mapeamento")
    a = ap.parse_args()
    s = load_settings()
    m = parse_map(a.map)
    if a.fmt == "voc":
        rep = convert_voc(a.xml, a.images, a.out, s.taxonomy, m, not a.skip_difficult, a.strict)
    elif a.fmt == "coco":
        rep = convert_coco(a.json, a.images, a.out, s.taxonomy, a.task, m, strict=a.strict)
    else:
        rep = remap_yolo_dataset(a.src, a.names.split(","), a.out, s.taxonomy, a.task, m)
    d = rep.as_dict()
    a.out.mkdir(parents=True, exist_ok=True)
    (a.out / "conversion_report.json").write_text(json.dumps(d, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(d, indent=2, ensure_ascii=False))
    if d["unmapped"]:
        print("\nAVISO: classes sem mapeamento foram omitidas. Ajuste `aliases` na taxonomia ou use --map.")
    print("\nPróximo passo: preencha metadata.csv (unit_id, lot, session, finish, color, lighting) e rode "
          "scripts/validate_dataset.py --root", a.out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
