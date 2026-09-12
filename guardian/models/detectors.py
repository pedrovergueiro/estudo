"""Detector primitives compiled from the genome."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any, Mapping, Sequence

from guardian.models.genome import COMPARISONS


@dataclass(frozen=True)
class Condition:
    """A single feature comparison with an associated evidence weight."""

    feature: str
    op: str
    threshold: float
    weight: float

    def satisfied_by(self, features: Mapping[str, float]) -> bool:
        value = features.get(self.feature)
        if value is None or (isinstance(value, float) and math.isnan(value)):
            return False
        if self.op == "gte":
            return value >= self.threshold
        if self.op == "gt":
            return value > self.threshold
        if self.op == "lte":
            return value <= self.threshold
        if self.op == "lt":
            return value < self.threshold
        raise ValueError(f"unsupported comparison: {self.op}")

    @classmethod
    def from_mapping(cls, data: Mapping[str, Any]) -> "Condition":
        op = str(data["op"])
        if op not in COMPARISONS:
            raise ValueError(f"unsupported comparison: {op}")
        return cls(
            feature=str(data["feature"]),
            op=op,
            threshold=float(data["threshold"]),
            weight=float(data["weight"]),
        )


@dataclass(frozen=True)
class Detector:
    """A weighted conjunction of conditions voting for one class."""

    detector_id: str
    target_class: str
    bias: float
    conditions: tuple[Condition, ...]

    @property
    def max_score(self) -> float:
        return self.bias + sum(max(0.0, c.weight) for c in self.conditions)

    def score(self, features: Mapping[str, float]) -> float:
        total = self.bias
        for condition in self.conditions:
            if condition.satisfied_by(features):
                total += condition.weight
        return total

    def explain(self, features: Mapping[str, float]) -> list[str]:
        fired = [
            f"{c.feature} {c.op} {c.threshold:g} (+{c.weight:g})"
            for c in self.conditions
            if c.satisfied_by(features)
        ]
        return fired

    @classmethod
    def from_mapping(cls, data: Mapping[str, Any]) -> "Detector":
        return cls(
            detector_id=str(data["id"]),
            target_class=str(data["target_class"]),
            bias=float(data.get("bias", 0.0)),
            conditions=tuple(
                Condition.from_mapping(c) for c in data.get("conditions", [])
            ),
        )


def compile_detectors(genome: Mapping[str, Any]) -> tuple[Detector, ...]:
    raw: Sequence[Mapping[str, Any]] = genome.get("capabilities", {}).get("detectors", [])
    return tuple(Detector.from_mapping(item) for item in raw)
