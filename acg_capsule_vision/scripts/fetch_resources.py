#!/usr/bin/env python3
"""Baixa (com internet autorizada) e verifica os recursos de configs/resources.yaml.

  python scripts/fetch_resources.py                 # tudo
  python scripts/fetch_resources.py --only yolo11n.pt --only medical_pills
  python scripts/fetch_resources.py --verify-only   # só confere hashes do cache (offline)

Único comando do projeto que acessa a rede. Arquivo com SHA-256 diferente é rejeitado.
"""

import argparse
import sys

import _bootstrap  # noqa: F401

from acg_vision.config import load_yaml, resolve
from acg_vision.data.fetch import IntegrityError, download, extract_zip, git_checkout, tree_manifest_sha256, verify


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", action="append", default=[])
    ap.add_argument("--verify-only", action="store_true")
    a = ap.parse_args()
    res = load_yaml("resources.yaml")
    cache, data = resolve(res["cache_dir"]), resolve(res["data_dir"])
    want = lambda k: not a.only or k in a.only  # noqa: E731
    ok = True
    for group in ("weights", "fonts"):
        for name, spec in res[group].items():
            if not want(name):
                continue
            dest = cache / name
            try:
                if a.verify_only:
                    verify(dest, spec["sha256"]) if dest.exists() else (_ for _ in ()).throw(FileNotFoundError(dest))
                else:
                    download(spec["url"], dest, spec["sha256"])
                print(f"[ok] {name}  {spec['sha256'][:16]}…")
            except (IntegrityError, FileNotFoundError, OSError) as e:
                ok = False
                print(f"[ERRO] {name}: {e}", file=sys.stderr)
    for name, spec in res["datasets"].items():
        if not want(name):
            continue
        try:
            if spec["kind"] == "archive":
                arc = data / f"{name}.zip"
                if a.verify_only:
                    verify(arc, spec["sha256"])
                else:
                    download(spec["url"], arc, spec["sha256"])
                    extract_zip(arc, data / name)
            else:
                dest = data / name
                if not a.verify_only:
                    git_checkout(spec["url"], spec["commit"], dest)
                got = tree_manifest_sha256(dest, ["normal", "defect", "data.csv", "README.md"])
                if got != spec["content_sha256"]:
                    raise IntegrityError(f"conteúdo divergente ({got})")
            print(f"[ok] dataset {name}  licença: {spec['license']}")
        except (IntegrityError, OSError, Exception) as e:  # noqa: BLE001 — relatar e seguir
            ok = False
            print(f"[ERRO] dataset {name}: {e}", file=sys.stderr)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
