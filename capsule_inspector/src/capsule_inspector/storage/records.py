"""Registro estruturado de cada inspeção (rastreabilidade)."""

from __future__ import annotations

import datetime as _dt
import uuid
from dataclasses import asdict, dataclass, field
from typing import Any

from .. import __version__


def new_inspection_id() -> str:
    # uuid7-like ordenável: timestamp + aleatório
    ts = _dt.datetime.now(_dt.UTC).strftime("%Y%m%dT%H%M%S%f")
    return f"{ts}-{uuid.uuid4().hex[:8]}"


@dataclass
class InspectionRecord:
    inspection_id: str
    timestamp: str                       # ISO-8601 UTC
    status: str                          # PASS | FAIL | REVIEW | SYSTEM_ERROR
    category: str
    lot_id: str | None = None
    unit_ref: str | None = None          # identificador externo da cápsula (se houver)
    deployment_mode: str = "experimental"
    software_version: str = __version__
    git_commit: str | None = None
    model: dict[str, Any] = field(default_factory=dict)       # id, sha256, backend, imgsz, approved
    config: dict[str, Any] = field(default_factory=dict)      # versões + hash
    profile: dict[str, Any] = field(default_factory=dict)     # nome + hash
    quality: list[dict[str, Any]] = field(default_factory=list)  # por vista
    detections: list[dict[str, Any]] = field(default_factory=list)
    capsules: list[dict[str, Any]] = field(default_factory=list)
    anomaly: list[dict[str, Any]] = field(default_factory=list)
    reasons: list[str] = field(default_factory=list)
    timings_ms: dict[str, float] = field(default_factory=dict)
    images: dict[str, str] = field(default_factory=dict)      # nome -> caminho relativo
    source: dict[str, Any] = field(default_factory=dict)
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @staticmethod
    def utc_now() -> str:
        return _dt.datetime.now(_dt.UTC).isoformat(timespec="milliseconds")
