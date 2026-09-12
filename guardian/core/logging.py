"""Structured JSON logging with a stable schema."""

from __future__ import annotations

import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

_CONFIGURED = False
_RESERVED = set(logging.LogRecord("", 0, "", 0, "", (), None).__dict__) | {
    "message",
    "asctime",
    "taskName",
}


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "ts": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for key, value in record.__dict__.items():
            if key not in _RESERVED and not key.startswith("_"):
                payload[key] = _safe(value)
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, sort_keys=True, default=str)


class HumanFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        extras = {
            key: _safe(value)
            for key, value in record.__dict__.items()
            if key not in _RESERVED and not key.startswith("_")
        }
        suffix = ""
        if extras:
            suffix = "  " + " ".join(f"{k}={v}" for k, v in sorted(extras.items()))
        stamp = datetime.fromtimestamp(record.created, tz=timezone.utc).strftime("%H:%M:%S")
        return f"{stamp} {record.levelname:<7} {record.name:<28} {record.getMessage()}{suffix}"


def _safe(value: Any) -> Any:
    try:
        json.dumps(value)
        return value
    except TypeError:
        return str(value)


def configure_logging(
    level: str = "INFO",
    *,
    json_output: bool | None = None,
    log_file: Path | None = None,
) -> None:
    """Idempotently configure the root ``guardian`` logger."""

    global _CONFIGURED
    if json_output is None:
        json_output = os.environ.get("GUARDIAN_LOG_FORMAT", "human").lower() == "json"
    root = logging.getLogger("guardian")
    if _CONFIGURED:
        root.setLevel(level.upper())
        return
    root.setLevel(level.upper())
    root.handlers.clear()
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(JsonFormatter() if json_output else HumanFormatter())
    root.addHandler(handler)
    if log_file is not None:
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setFormatter(JsonFormatter())
        root.addHandler(file_handler)
    root.propagate = False
    _CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(f"guardian.{name}" if not name.startswith("guardian") else name)
