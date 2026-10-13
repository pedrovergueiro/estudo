"""Modo offline: nenhum download silencioso.

`enable_offline()`:
1. desliga telemetria/integrações da Ultralytics (`sync`, hub, loggers externos);
2. coloca a fonte Arial.ttf (do cache verificado) onde a Ultralytics a procura;
3. com `block_network=True` (padrão quando ACG_OFFLINE=1), substitui as conexões de
   socket para destinos não locais por um erro explícito — qualquer tentativa de
   download falha de forma visível em vez de acontecer em silêncio.

`require(path, what)` gera mensagem clara com o comando exato para obter o recurso.
"""

from __future__ import annotations

import os
import shutil
import socket
from pathlib import Path

from .config import load_yaml, project_root, resolve

LOCAL_HOSTS = {"127.0.0.1", "localhost", "::1", "0.0.0.0"}
_original_connect = socket.socket.connect
_original_create_connection = socket.create_connection


class MissingResource(FileNotFoundError):
    pass


class NetworkBlocked(ConnectionError):
    pass


def require(path: Path, what: str, fetch_hint: str = "python scripts/fetch_resources.py") -> Path:
    if not Path(path).exists():
        raise MissingResource(
            f"Recurso ausente: {what} ({path}).\nModo offline não baixa nada automaticamente. "
            f"Com acesso à internet autorizado, execute:\n    {fetch_hint}")
    return Path(path)


def _host_of(address) -> str:
    if isinstance(address, tuple) and address:
        return str(address[0])
    return str(address)


def _guarded_connect(self, address):  # type: ignore[no-untyped-def]
    if self.family in (socket.AF_INET, socket.AF_INET6) and _host_of(address) not in LOCAL_HOSTS:
        raise NetworkBlocked(f"ACG offline: conexão de rede bloqueada para {address!r}")
    return _original_connect(self, address)


def _guarded_create_connection(address, *a, **k):  # type: ignore[no-untyped-def]
    if _host_of(address) not in LOCAL_HOSTS:
        raise NetworkBlocked(f"ACG offline: conexão de rede bloqueada para {address!r}")
    return _original_create_connection(address, *a, **k)


def block_network() -> None:
    socket.socket.connect = _guarded_connect  # type: ignore[method-assign]
    socket.create_connection = _guarded_create_connection  # type: ignore[assignment]


def unblock_network() -> None:
    socket.socket.connect = _original_connect  # type: ignore[method-assign]
    socket.create_connection = _original_create_connection  # type: ignore[assignment]


def configure_ultralytics() -> None:
    """Desliga envio de eventos e integrações; prepara a fonte local."""
    os.environ.setdefault("YOLO_VERBOSE", "False")
    try:
        from ultralytics import settings
        from ultralytics.utils import USER_CONFIG_DIR
    except ImportError:
        return
    off = {k: False for k in ("sync", "hub", "clearml", "comet", "dvc", "mlflow", "raytune", "tensorboard",
                              "wandb") if k in settings}
    settings.update(off)
    res = load_yaml("resources.yaml")
    font = resolve(res["cache_dir"]) / "Arial.ttf"
    dest = Path(USER_CONFIG_DIR) / "Arial.ttf"
    if font.exists() and not dest.exists():
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(font, dest)


def enable_offline(block: bool | None = None) -> None:
    if block is None:
        block = os.environ.get("ACG_OFFLINE", "1") != "0"
    configure_ultralytics()
    if block:
        block_network()


def weight_path(name: str) -> Path:
    res = load_yaml("resources.yaml")
    if name not in res["weights"]:
        raise MissingResource(f"pesos {name!r} não constam em configs/resources.yaml")
    return require(resolve(res["cache_dir"]) / name, f"pesos pré-treinados {name}",
                   f"python scripts/fetch_resources.py --only {name}")


__all__ = ["MissingResource", "NetworkBlocked", "block_network", "configure_ultralytics", "enable_offline",
           "project_root", "require", "unblock_network", "weight_path"]
