#!/usr/bin/env python3
"""Mostra plataforma, RAM, temperatura, throttling, bibliotecas e aceleradores detectados."""

import argparse
import json

import _bootstrap  # noqa: F401
from capsule_inspector.monitoring.hardware import platform_report


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", help="grava o relatório JSON neste caminho")
    a = ap.parse_args()
    rep = platform_report()
    txt = json.dumps(rep, indent=2, ensure_ascii=False)
    print(txt)
    if a.out:
        with open(a.out, "w", encoding="utf-8") as fh:
            fh.write(txt)
    if rep["machine"] not in ("aarch64", "arm64", "x86_64", "AMD64"):
        print("\nAVISO: arquitetura não suportada pelas rodas do ONNX Runtime; use Raspberry Pi OS 64 bits.")


if __name__ == "__main__":
    main()
