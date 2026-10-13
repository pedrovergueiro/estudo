"""Download explícito com verificação de integridade (SHA-256) e cache local."""

from __future__ import annotations

import hashlib
import os
import shutil
import subprocess
import urllib.request
import zipfile
from pathlib import Path


class IntegrityError(RuntimeError):
    pass


def sha256_file(path: Path, chunk: int = 1 << 20) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for b in iter(lambda: fh.read(chunk), b""):
            h.update(b)
    return h.hexdigest()


def tree_manifest_sha256(root: Path, entries: list[str]) -> str:
    """Hash do manifesto "sha256  caminho" ordenado (mesmo formato de `sha256sum`)."""
    files: list[Path] = []
    for e in entries:
        p = root / e
        files += sorted(x for x in p.rglob("*") if x.is_file()) if p.is_dir() else [p]
    lines = "".join(f"{sha256_file(f)}  {f.relative_to(root).as_posix()}\n"
                    for f in sorted(files, key=lambda x: x.relative_to(root).as_posix()))
    return hashlib.sha256(lines.encode()).hexdigest()


def verify(path: Path, expected: str) -> None:
    got = sha256_file(path)
    if got != expected:
        raise IntegrityError(f"SHA-256 divergente para {path}: esperado {expected}, obtido {got}")


def download(url: str, dest: Path, expected_sha256: str, force: bool = False) -> Path:
    """Baixa para `dest` (atômico). Se já existir e o hash conferir, não baixa de novo."""
    dest = Path(dest)
    if dest.exists() and not force:
        verify(dest, expected_sha256)
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_name(dest.name + ".part")
    with urllib.request.urlopen(url, timeout=120) as r, open(tmp, "wb") as fh:  # noqa: S310
        shutil.copyfileobj(r, fh)
    try:
        verify(tmp, expected_sha256)
    except IntegrityError:
        tmp.unlink(missing_ok=True)
        raise
    os.replace(tmp, dest)
    return dest


def extract_zip(archive: Path, dest: Path) -> Path:
    dest = Path(dest)
    with zipfile.ZipFile(archive) as z:
        for m in z.namelist():  # proteção contra caminhos fora do destino
            target = (dest / m).resolve()
            if not str(target).startswith(str(dest.resolve())):
                raise IntegrityError(f"entrada suspeita no zip: {m}")
        z.extractall(dest)
    return dest


def git_checkout(url: str, commit: str, dest: Path) -> Path:
    """Clona e fixa um commit exato (sem LFS)."""
    dest = Path(dest)
    env = {**os.environ, "GIT_LFS_SKIP_SMUDGE": "1"}
    if not (dest / ".git").exists():
        dest.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(["git", "clone", "-q", url, str(dest)], check=True, env=env)
    head = subprocess.run(["git", "-C", str(dest), "rev-parse", "HEAD"], capture_output=True, text=True,
                          check=True).stdout.strip()
    if head != commit:
        subprocess.run(["git", "-C", str(dest), "fetch", "-q", "--depth", "50", "origin"], check=False, env=env)
        subprocess.run(["git", "-C", str(dest), "checkout", "-q", commit], check=True, env=env)
    return dest
