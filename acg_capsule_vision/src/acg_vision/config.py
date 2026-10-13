"""Caminhos do projeto e leitura das configurações."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import yaml


class ConfigError(RuntimeError):
    pass


def project_root() -> Path:
    env = os.environ.get("ACG_VISION_ROOT")
    if env:
        return Path(env).resolve()
    return Path(__file__).resolve().parents[2]


def load_yaml(name: str, root: Path | None = None) -> dict[str, Any]:
    p = (root or project_root()) / "configs" / name
    try:
        data = yaml.safe_load(p.read_text(encoding="utf-8"))
    except FileNotFoundError as e:
        raise ConfigError(f"configuração ausente: {p}") from e
    if not isinstance(data, dict):
        raise ConfigError(f"{p}: esperado um mapeamento YAML")
    return data


def resolve(rel: str | os.PathLike[str], root: Path | None = None) -> Path:
    p = Path(rel)
    return p if p.is_absolute() else (root or project_root()) / p


def profile(cfg: dict[str, Any], name: str) -> dict[str, Any]:
    profs = cfg.get("profiles", {})
    if name not in profs:
        raise ConfigError(f"perfil {name!r} inexistente; opções: {sorted(profs)}")
    return dict(profs[name])
