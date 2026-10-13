"""Tipos de dados compartilhados entre os módulos."""

from __future__ import annotations

import enum
from dataclasses import asdict, dataclass, field
from typing import Any

import numpy as np


class InspectionStatus(str, enum.Enum):
    PASS = "PASS"
    FAIL = "FAIL"
    REVIEW = "REVIEW"
    SYSTEM_ERROR = "SYSTEM_ERROR"


class ResultCategory(str, enum.Enum):
    """Natureza do resultado, independente da ação (status)."""

    DEFECT_CONFIRMED = "DEFECT_CONFIRMED"          # classe validada acima do limiar fail
    VISUAL_ANOMALY = "VISUAL_ANOMALY"              # Modo C, fora das classes conhecidas
    INCONCLUSIVE = "INCONCLUSIVE"                  # incerteza, qualidade, classe não validada
    NORMAL_VALIDATED = "NORMAL_VALIDATED"          # sem defeitos, condições validadas
    SYSTEM_ERROR = "SYSTEM_ERROR"


# Ordem de "gravidade" ao agregar estados (maior vence).
STATUS_PRIORITY = {
    InspectionStatus.PASS: 0,
    InspectionStatus.REVIEW: 1,
    InspectionStatus.FAIL: 2,
    InspectionStatus.SYSTEM_ERROR: 3,
}


def worst_status(*statuses: InspectionStatus) -> InspectionStatus:
    return max(statuses, key=lambda s: STATUS_PRIORITY[s])


@dataclass
class Detection:
    """Uma detecção em coordenadas de pixel da imagem ORIGINAL (xyxy)."""

    class_id: int
    class_name: str
    confidence: float
    box: tuple[float, float, float, float]
    polygon: list[tuple[float, float]] | None = None
    view: str | None = None  # nome da vista/iluminação de origem

    @property
    def area(self) -> float:
        x1, y1, x2, y2 = self.box
        return max(0.0, x2 - x1) * max(0.0, y2 - y1)

    @property
    def center(self) -> tuple[float, float]:
        x1, y1, x2, y2 = self.box
        return (x1 + x2) / 2.0, (y1 + y2) / 2.0

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        d["box"] = [round(float(v), 2) for v in self.box]
        d["confidence"] = round(float(self.confidence), 5)
        if self.polygon is not None:
            d["polygon"] = [[round(float(x), 1), round(float(y), 1)] for x, y in self.polygon]
        return d


@dataclass
class Frame:
    image: np.ndarray            # BGR uint8 (ou cinza HxW)
    timestamp: float             # time.time() da captura
    frame_id: int
    source: str
    view: str = "default"
    capture_ms: float = 0.0
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass
class QualityReport:
    ok: bool
    metrics: dict[str, float] = field(default_factory=dict)
    reasons: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {"ok": self.ok, "metrics": {k: round(float(v), 4) for k, v in self.metrics.items()},
                "reasons": list(self.reasons)}


@dataclass
class CapsuleResult:
    index: int
    box: tuple[float, float, float, float] | None
    confidence: float | None
    status: InspectionStatus
    category: ResultCategory
    defects: list[Detection] = field(default_factory=list)
    reasons: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "index": self.index,
            "box": [round(float(v), 2) for v in self.box] if self.box else None,
            "confidence": None if self.confidence is None else round(float(self.confidence), 5),
            "status": self.status.value,
            "category": self.category.value,
            "defects": [d.to_dict() for d in self.defects],
            "reasons": list(self.reasons),
        }


@dataclass
class Decision:
    status: InspectionStatus
    category: ResultCategory
    reasons: list[str] = field(default_factory=list)
    capsules: list[CapsuleResult] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "status": self.status.value,
            "category": self.category.value,
            "reasons": list(self.reasons),
            "capsules": [c.to_dict() for c in self.capsules],
        }
