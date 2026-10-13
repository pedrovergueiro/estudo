#!/usr/bin/env python3
"""Registro de modelos: listar, aprovar, ativar, rollback, verificar integridade.

  python scripts/manage_models.py list
  python scripts/manage_models.py approve caps-v1-640 --by "Maria Silva (QA)" \
      --report reports/eval_caps-v1-640_test/evaluation.json
  python scripts/manage_models.py activate caps-v1-640 --by "Maria Silva (QA)"
  python scripts/manage_models.py rollback --by "Maria Silva (QA)"
  python scripts/manage_models.py verify

Após activate/rollback reinicie o serviço: sudo systemctl restart capsule-inspector
"""

import argparse
import json
import sys
from pathlib import Path

import _bootstrap  # noqa: F401
from capsule_inspector.config import load_settings
from capsule_inspector.registry import ModelRegistry, RegistryError


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list")
    sub.add_parser("verify")
    p = sub.add_parser("approve")
    p.add_argument("model_id")
    p.add_argument("--by", required=True)
    p.add_argument("--report", required=True, type=Path)
    p.add_argument("--note", default="")
    p = sub.add_parser("activate")
    p.add_argument("model_id")
    p.add_argument("--by", required=True)
    p = sub.add_parser("rollback")
    p.add_argument("--by", required=True)
    a = ap.parse_args()
    s = load_settings()
    reg = ModelRegistry(s.path(s.inference.model.registry_dir))
    try:
        if a.cmd == "list":
            act = reg.active()
            for m in reg.list():
                mark = "*" if act and act["model_id"] == m["model_id"] else " "
                print(f"{mark} {m['model_id']:30s} {m['status']:10s} {m['format']:6s} imgsz={m['imgsz']} "
                      f"sha={m['sha256'][:12]} {m.get('precision', '')}")
            if not act:
                print("(nenhum modelo ativo)")
        elif a.cmd == "verify":
            for m in reg.list():
                reg.verify(m["model_id"])
                print("ok", m["model_id"])
        elif a.cmd == "approve":
            m = reg.approve(a.model_id, a.by, a.report, a.note)
            print(json.dumps(m["approvals"][-1], indent=2, ensure_ascii=False))
        elif a.cmd == "activate":
            print(json.dumps(reg.activate(a.model_id, a.by), indent=2, ensure_ascii=False))
        elif a.cmd == "rollback":
            print(json.dumps(reg.rollback(a.by), indent=2, ensure_ascii=False))
    except RegistryError as e:
        print("ERRO:", e, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
