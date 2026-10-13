"""Logs em JSON por linha com rotação por tamanho."""

from __future__ import annotations

import json
import logging
import logging.handlers
import sys
import time
from pathlib import Path


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(record.created))
            + f".{int(record.msecs):03d}",
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        extra = getattr(record, "extra_fields", None)
        if isinstance(extra, dict):
            payload.update(extra)
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False, default=str)


def setup_logging(log_dir: str | Path | None = None, level: str = "INFO",
                  max_bytes: int = 10 * 1024 * 1024, backup_count: int = 10,
                  console: bool = True) -> logging.Logger:
    root = logging.getLogger("capsule_inspector")
    root.setLevel(getattr(logging, level.upper(), logging.INFO))
    for h in list(root.handlers):
        root.removeHandler(h)
        h.close()
    fmt = JsonFormatter()
    if log_dir is not None:
        d = Path(log_dir)
        try:
            d.mkdir(parents=True, exist_ok=True)
            fh = logging.handlers.RotatingFileHandler(
                d / "capsule_inspector.log", maxBytes=max_bytes, backupCount=backup_count,
                encoding="utf-8")
            fh.setFormatter(fmt)
            root.addHandler(fh)
        except OSError as e:  # armazenamento indisponível não pode parar a inspeção
            print(f"[capsule_inspector] falha ao abrir log em {d}: {e}", file=sys.stderr)
    sh = logging.StreamHandler(sys.stderr)
    if console:
        sh.setFormatter(fmt)
    else:  # modo operador: só avisos/erros, em texto simples
        sh.setLevel(logging.WARNING)
        sh.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))
    root.addHandler(sh)
    root.propagate = False
    return root


def log_event(logger: logging.Logger, level: int, msg: str, **fields) -> None:
    logger.log(level, msg, extra={"extra_fields": fields})
