#!/usr/bin/env python3
"""Instala rodas (.whl) extraindo-as num diretório — sem pip, sem venv, sem internet.

Uma roda é um zip cujo conteúdo vai direto para site-packages; o conteúdo de
`<pacote>.data/purelib` e `platlib` também. Scripts de console não são necessários.
Uso: python3 install_wheels.py <dir_rodas> <destino_lib>
"""

import shutil
import sys
import zipfile
from pathlib import Path


def install(wheel: Path, dest: Path) -> int:
    n = 0
    with zipfile.ZipFile(wheel) as z:
        for info in z.infolist():
            name = info.filename
            parts = name.split("/")
            if parts[0].endswith(".data"):
                if len(parts) > 2 and parts[1] in ("purelib", "platlib"):
                    name = "/".join(parts[2:])
                else:
                    continue  # scripts/headers/data: não usados pelo aplicativo
            target = (dest / name).resolve()
            if not str(target).startswith(str(dest.resolve())):
                raise RuntimeError(f"caminho suspeito em {wheel.name}: {info.filename}")
            if name.endswith("/"):
                target.mkdir(parents=True, exist_ok=True)
                continue
            target.parent.mkdir(parents=True, exist_ok=True)
            with z.open(info) as src, open(target, "wb") as out:
                shutil.copyfileobj(src, out)
            mode = (info.external_attr >> 16) & 0o777
            if mode:
                target.chmod(mode)
            n += 1
    return n


def main() -> int:
    src, dest = Path(sys.argv[1]), Path(sys.argv[2])
    wheels = sorted(src.glob("*.whl"))
    if not src.is_dir():
        print(f"diretório inexistente: {src}", file=sys.stderr)
        return 1
    dest.mkdir(parents=True, exist_ok=True)
    for w in wheels:
        install(w, dest)
        print(f"  instalado {w.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
