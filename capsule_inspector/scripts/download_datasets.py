#!/usr/bin/env python3
"""Lista fontes de datasets e, somente com confirmação explícita de licença, baixa
uma fonte que tenha `direct_url` e `sha256` preenchidos em configs/dataset.yaml.

Nenhum dataset é baixado por padrão. Datasets com acesso por solicitação devem
ser obtidos pelo canal oficial; este script não contorna restrições.

Exemplos:
  python scripts/download_datasets.py --list
  python scripts/download_datasets.py --fetch pill_defects --accept-license
"""

import argparse
import hashlib
import sys
import urllib.request
from pathlib import Path

import _bootstrap  # noqa: F401
from capsule_inspector.config import load_settings


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as fh:
        for c in iter(lambda: fh.read(1 << 20), b""):
            h.update(c)
    return h.hexdigest()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--fetch", metavar="NOME")
    ap.add_argument("--accept-license", action="store_true",
                    help="declara que você leu e aceita a licença da fonte para o uso pretendido")
    a = ap.parse_args()
    s = load_settings()
    srcs = s.dataset.sources
    if a.list or not a.fetch:
        for k, v in srcs.items():
            print(f"- {k}: {v.title}\n    acesso: {v.access} | licença: {v.license} | uso comercial: "
                  f"{v.commercial_use}\n    info: {v.info_url}\n    download direto configurado: "
                  f"{'sim' if v.direct_url and v.sha256 else 'não'}")
        print("\nApós obter os dados, importe com scripts/import_dataset.py e valide com "
              "scripts/validate_dataset.py.")
        return 0
    if a.fetch not in srcs:
        print(f"fonte desconhecida: {a.fetch}", file=sys.stderr)
        return 2
    src = srcs[a.fetch]
    if not (src.direct_url and src.sha256):
        print(f"{a.fetch}: sem direct_url+sha256 verificados. Obtenha pelo canal oficial: {src.info_url}",
              file=sys.stderr)
        return 3
    if not a.accept_license:
        print(f"Licença: {src.license} (uso comercial: {src.commercial_use}). "
              "Reexecute com --accept-license após verificar os termos.", file=sys.stderr)
        return 4
    dest_dir = s.path(s.dataset.paths["raw"]) / a.fetch
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / Path(src.direct_url).name
    print(f"baixando {src.direct_url} -> {dest}")
    tmp = dest.with_suffix(dest.suffix + ".part")
    urllib.request.urlretrieve(src.direct_url, tmp)
    digest = sha256(tmp)
    if digest != src.sha256:
        tmp.unlink()
        print(f"SHA-256 divergente ({digest}); arquivo descartado", file=sys.stderr)
        return 5
    tmp.replace(dest)
    (dest_dir / "LICENSE_ACCEPTED.txt").write_text(f"{src.title}\n{src.license}\n", encoding="utf-8")
    print("ok — integridade verificada")
    return 0


if __name__ == "__main__":
    sys.exit(main())
