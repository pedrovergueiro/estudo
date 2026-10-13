#!/usr/bin/env python3
"""Inicia a interface local do operador (http://127.0.0.1:8080 por padrão)."""

import argparse
from pathlib import Path

import _bootstrap  # noqa: F401
from capsule_inspector.config import load_settings
from capsule_inspector.interface.app import serve


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--config-dir", type=Path)
    ap.add_argument("--port", type=int)
    a = ap.parse_args()
    s = load_settings(a.config_dir)
    if a.port:
        s.system.interface.port = a.port
    serve(s)


if __name__ == "__main__":
    main()
