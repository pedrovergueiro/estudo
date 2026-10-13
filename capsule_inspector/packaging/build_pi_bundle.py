#!/usr/bin/env python3
"""Monta o pacote offline do Raspberry Pi (.tar.gz).

  python packaging/build_pi_bundle.py --model <detector.onnx> --examples <img1> <img2> ... \
      --out dist/                       # aarch64 (Raspberry Pi OS 64 bits), Python 3.11/3.12/3.13
  python packaging/build_pi_bundle.py ... --arch x86_64 --pythons 3.11 3.13   # pacote de TESTE em PC

As dependências são baixadas como rodas binárias da plataforma-alvo
(`pip download --platform ... --only-binary=:all:`) — é a única etapa que usa a rede.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from capsule_inspector import __version__  # noqa: E402

PLATFORMS = {
    "aarch64": ["manylinux_2_28_aarch64", "manylinux_2_27_aarch64", "manylinux_2_17_aarch64",
                "manylinux2014_aarch64"],
    "x86_64": ["manylinux_2_28_x86_64", "manylinux_2_27_x86_64", "manylinux_2_17_x86_64", "manylinux2014_x86_64"],
}
# Raspberry Pi OS Bookworm = glibc 2.36; Trixie = 2.41 — todas as tags acima são compatíveis.
APP_ITEMS = ["configs", "LICENSE"]


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as fh:
        for b in iter(lambda: fh.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def requirements_for(py: str, out: Path) -> Path:
    """`pip download --python-version` avalia marcadores com o Python EM EXECUÇÃO, não com o alvo;
    aqui os marcadores `python_version` são resolvidos para o Python de destino."""
    from packaging.markers import Marker
    lines = []
    for raw in (ROOT / "requirements" / "raspberry_pi.txt").read_text().splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        if ";" in line:
            req, marker = (x.strip() for x in line.split(";", 1))
            if not Marker(marker).evaluate({"python_version": py, "python_full_version": py + ".0"}):
                continue
            line = req
        lines.append(line)
    out.write_text("\n".join(lines) + "\n")
    return out


def download_wheels(dest: Path, arch: str, py: str) -> list[str]:
    dest.mkdir(parents=True, exist_ok=True)
    req = requirements_for(py, dest.parent / f"requirements-{py}.txt")
    cmd = [sys.executable, "-m", "pip", "download", "--quiet", "--only-binary=:all:", "--python-version", py,
           "--implementation", "cp", "-d", str(dest), "-r", str(req)]
    for p in PLATFORMS[arch]:
        cmd += ["--platform", p]
    subprocess.run(cmd, check=True)
    req.unlink()
    return sorted(p.name for p in dest.glob("*.whl"))


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--model", required=True, type=Path)
    ap.add_argument("--model-info", type=Path, help="JSON com proveniência/métricas do modelo")
    ap.add_argument("--examples", nargs="+", required=True, type=Path)
    ap.add_argument("--examples-license", type=Path, help="arquivo de licença das imagens de exemplo")
    ap.add_argument("--arch", default="aarch64", choices=sorted(PLATFORMS))
    # Raspberry Pi OS: Bookworm = 3.11, Trixie = 3.13
    ap.add_argument("--pythons", nargs="+", default=["3.11", "3.13"])
    ap.add_argument("--out", type=Path, default=ROOT / "dist")
    a = ap.parse_args()

    name = f"capsule-inspector-pi-{__version__}-{a.arch}"
    stage = a.out / name
    if stage.exists():
        shutil.rmtree(stage)
    app = stage / "app"
    app.mkdir(parents=True)
    for item in APP_ITEMS:
        src = ROOT / item
        (shutil.copytree if src.is_dir() else shutil.copy2)(src, app / item)
    shutil.copytree(ROOT / "src" / "capsule_inspector", app / "src" / "capsule_inspector",
                    ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
    mdir = app / "models" / "bundle"
    mdir.mkdir(parents=True)
    shutil.copy2(a.model, mdir / a.model.name)
    info = json.loads(a.model_info.read_text()) if a.model_info else {}
    info.update({"file": a.model.name, "sha256": sha256(a.model), "format": "onnx",
                 "provenance": "trained-on-public-data-only; not-validated-for-industrial-use"})
    (mdir / (a.model.stem + ".manifest.json")).write_text(json.dumps(info, indent=2, ensure_ascii=False))
    ex = app / "exemplos"
    ex.mkdir()
    for p in a.examples:
        shutil.copy2(p, ex / p.name)
    if a.examples_license:
        shutil.copy2(a.examples_license, ex / "LICENSE_EXEMPLOS.txt")
    for f in ("instalar.sh", "desinstalar.sh", "install_wheels.py", "LEIA-ME.md"):
        shutil.copy2(ROOT / "packaging" / "pi" / f, stage / f)
        if f.endswith(".sh"):
            (stage / f).chmod(0o755)
    (stage / "ARQUITETURA").write_text(a.arch + "\n")
    manifest = {"version": __version__, "arch": a.arch, "pythons": a.pythons, "wheels": {}}
    for py in a.pythons:
        tag = "cp" + py.replace(".", "")
        manifest["wheels"][tag] = download_wheels(stage / "rodas" / tag, a.arch, py)
        print(f"{tag}: {len(manifest['wheels'][tag])} rodas")
    # rodas idênticas em todas as versões (abi3 / py3-none-any) ficam uma só vez em rodas/comum
    tags = ["cp" + py.replace(".", "") for py in a.pythons]
    common = set.intersection(*(set(manifest["wheels"][t]) for t in tags)) if len(tags) > 1 else set()
    (stage / "rodas" / "comum").mkdir(parents=True, exist_ok=True)
    for w in sorted(common):
        shutil.move(str(stage / "rodas" / tags[0] / w), stage / "rodas" / "comum" / w)
        for t in tags[1:]:
            (stage / "rodas" / t / w).unlink()
    manifest["wheels"] = {"comum": sorted(common), **{t: sorted(set(manifest["wheels"][t]) - common) for t in tags}}
    (stage / "MANIFESTO.json").write_text(json.dumps(manifest, indent=2))
    files = sorted(p for p in stage.rglob("*") if p.is_file())
    (stage / "SHA256SUMS").write_text("".join(f"{sha256(p)}  {p.relative_to(stage).as_posix()}\n" for p in files))
    tgz = a.out / f"{name}.tar.gz"
    with tarfile.open(tgz, "w:gz", compresslevel=6) as t:
        t.add(stage, arcname=name)
    print(f"{tgz}  {tgz.stat().st_size / 1e6:.1f} MB  sha256 {sha256(tgz)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
