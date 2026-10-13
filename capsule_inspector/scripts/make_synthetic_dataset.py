#!/usr/bin/env python3
"""Gera um dataset SINTÉTICO para testar o pipeline de ponta a ponta.

NÃO use as métricas resultantes como evidência de desempenho em cápsulas reais.

  python scripts/make_synthetic_dataset.py --out data/processed/synthetic --units 120
"""

import argparse
from pathlib import Path

import _bootstrap  # noqa: F401
from capsule_inspector.config import load_settings
from capsule_inspector.dataset.synthetic import generate_dataset


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", type=Path, default=Path("data/processed/synthetic"))
    ap.add_argument("--units", type=int, default=120)
    ap.add_argument("--views", type=int, default=2)
    ap.add_argument("--size", type=int, default=320)
    ap.add_argument("--seed", type=int, default=0)
    a = ap.parse_args()
    s = load_settings()
    out = generate_dataset(s.path(a.out), s.taxonomy.training_names(), a.units, a.views, a.size, a.seed)
    print(f"dataset sintético em {out} — apenas para testes de software")


if __name__ == "__main__":
    main()
