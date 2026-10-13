#!/usr/bin/env python3
"""Executa a inspeção.

  # serviço contínuo (câmera de configs/camera.yaml, modelo ativo do registro)
  python scripts/run_inspection.py
  # inspeção de teste em imagens gravadas com um modelo de bancada (resultado experimental)
  python scripts/run_inspection.py --images data/samples --model models/export/best_640_fp32.onnx --max 10
  # uma única inspeção, imprimindo o registro completo
  python scripts/run_inspection.py --once --lot L2025-001
"""

import argparse
import json
import sys
from pathlib import Path

import _bootstrap  # noqa: F401
from capsule_inspector.config import load_settings


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--config-dir", type=Path)
    ap.add_argument("--images", type=Path, help="força fonte de arquivos (diretório/vídeo)")
    ap.add_argument("--model", type=Path, help="modelo de bancada fora do registro (resultado experimental)")
    ap.add_argument("--lot")
    ap.add_argument("--max", type=int, help="número máximo de inspeções")
    ap.add_argument("--once", action="store_true")
    ap.add_argument("--continuous", action="store_true", help="ignora o gatilho e inspeciona sem pausa")
    a = ap.parse_args()
    s = load_settings(a.config_dir)
    if a.images:
        s.camera.type = "file"
        s.camera.file.path = str(a.images.resolve())
        s.camera.file.pattern = "*"
    if a.continuous:
        s.system.integration.trigger.type = "none"
    from capsule_inspector.runtime import InspectionService
    svc = InspectionService(s, model_path=str(a.model) if a.model else None)
    if a.once:
        out = svc.inspect_once(a.lot)
        svc.shutdown()
        if out is None:
            print("sem imagens", file=sys.stderr)
            return 1
        print(json.dumps(out.record.to_dict(), indent=2, ensure_ascii=False, default=str))
        return 0
    n = svc.run(max_inspections=a.max, lot_id=a.lot)
    print(f"{n} inspeções executadas; estatísticas: {svc.stats.snapshot()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
