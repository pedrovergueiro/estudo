"""The classifier Guardian evolves.

It reads **only** the numeric feature vector.  Free-text fields on an event
are never consulted, which is what makes the system structurally immune to
the instruction-injection payloads the red team plants in them; the red
team verifies that property empirically rather than trusting the comment.
"""

from __future__ import annotations

import math
import time
from dataclasses import dataclass, field
from typing import Any, Iterable, Mapping, Sequence

from guardian.core.types import EventClass
from guardian.experiments.dataset import FEATURE_NAMES, SecurityEvent
from guardian.models.detectors import Detector, compile_detectors


@dataclass(frozen=True)
class Prediction:
    """One classification decision with its supporting evidence."""

    event_id: str
    predicted: str
    confidence: float
    scores: dict[str, float]
    evidence: tuple[str, ...] = ()

    @property
    def margin(self) -> float:
        ordered = sorted(self.scores.values(), reverse=True)
        if len(ordered) < 2:
            return ordered[0] if ordered else 0.0
        return ordered[0] - ordered[1]

    def as_dict(self) -> dict[str, Any]:
        return {
            "event_id": self.event_id,
            "predicted": self.predicted,
            "confidence": round(self.confidence, 6),
            "scores": {k: round(v, 6) for k, v in self.scores.items()},
            "evidence": list(self.evidence),
        }


@dataclass
class InferenceStats:
    """Cost accounting for one evaluation run.

    ``conditions_evaluated`` is the deterministic work measure used by the
    efficiency score.  Wall-clock latency is recorded too, but only for human
    reporting: it varies between runs and must never feed a promotion
    decision, or identical genomes would score differently.
    """

    calls: int = 0
    total_seconds: float = 0.0
    cache_hits: int = 0
    conditions_evaluated: int = 0

    @property
    def mean_latency_ms(self) -> float:
        return (self.total_seconds / self.calls * 1000.0) if self.calls else 0.0

    @property
    def work_per_call(self) -> float:
        """Mean number of conditions evaluated per classified event."""

        return self.conditions_evaluated / self.calls if self.calls else 0.0


class EventClassifier:
    """Compiles a genome into an executable classifier.

    The instance is read-only with respect to the genome: it keeps a
    defensive copy, so a caller holding a reference cannot mutate a
    deployed version in place.
    """

    def __init__(self, genome: Mapping[str, Any]) -> None:
        import copy

        self._genome: dict[str, Any] = copy.deepcopy(dict(genome))
        capabilities = self._genome.get("capabilities", {})
        decision = capabilities.get("decision", {})
        self._min_score = float(decision.get("min_score", 0.0))
        self._temperature = max(1e-6, float(decision.get("confidence_temperature", 1.0)))
        self._abstain_margin = float(decision.get("abstain_margin", 0.0))
        cache_cfg = capabilities.get("cache", {})
        self._cache_enabled = bool(cache_cfg.get("enabled", False))
        self._cache_limit = int(cache_cfg.get("max_entries", 0) or 0)
        self._cache: dict[tuple[float, ...], tuple[str, float, dict[str, float]]] = {}
        self._detectors: tuple[Detector, ...] = compile_detectors(self._genome)
        self._work_per_call = sum(len(d.conditions) for d in self._detectors)
        self.stats = InferenceStats()

    # -- introspection ---------------------------------------------------
    @property
    def genome(self) -> dict[str, Any]:
        import copy

        return copy.deepcopy(self._genome)

    @property
    def detectors(self) -> tuple[Detector, ...]:
        return self._detectors

    @property
    def known_classes(self) -> tuple[str, ...]:
        return tuple(EventClass.values())

    # -- inference -------------------------------------------------------
    def _cache_key(self, features: Mapping[str, float]) -> tuple[float, ...]:
        return tuple(float(features.get(name, 0.0)) for name in FEATURE_NAMES)

    def _class_scores(self, features: Mapping[str, float]) -> dict[str, float]:
        scores = {name: 0.0 for name in EventClass.values()}
        for detector in self._detectors:
            if detector.target_class not in scores:
                # Structurally impossible after validate_structure, but a
                # hallucinated class must never leak into the output space.
                continue
            scores[detector.target_class] = max(
                scores[detector.target_class], detector.score(features)
            )
        return scores

    def _confidence(self, scores: Mapping[str, float]) -> float:
        values = [v / self._temperature for v in scores.values()]
        peak = max(values)
        exps = [math.exp(v - peak) for v in values]
        total = sum(exps)
        return max(exps) / total if total else 0.0

    def predict(self, event: SecurityEvent) -> Prediction:
        """Classify one event.  Only ``event.features`` is read."""

        started = time.perf_counter()
        features = event.features
        key = self._cache_key(features)
        if self._cache_enabled and key in self._cache:
            predicted, confidence, scores = self._cache[key]
            self.stats.cache_hits += 1
            self.stats.calls += 1
            self.stats.conditions_evaluated += 1  # one lookup instead of a full scan
            self.stats.total_seconds += time.perf_counter() - started
            return Prediction(event.event_id, predicted, confidence, dict(scores))

        scores = self._class_scores(features)
        best_class = max(scores, key=lambda name: (scores[name], name))
        best_score = scores[best_class]
        ordered = sorted(scores.values(), reverse=True)
        margin = ordered[0] - ordered[1] if len(ordered) > 1 else ordered[0]
        if best_score < self._min_score or margin < self._abstain_margin:
            best_class = EventClass.BENIGN.value
        confidence = self._confidence(scores)
        evidence: tuple[str, ...] = ()
        for detector in self._detectors:
            if detector.target_class == best_class:
                evidence = tuple(detector.explain(features))
                break

        if self._cache_enabled and self._cache_limit > 0:
            if len(self._cache) >= self._cache_limit:
                self._cache.pop(next(iter(self._cache)))
            self._cache[key] = (best_class, confidence, scores)

        self.stats.calls += 1
        self.stats.conditions_evaluated += self._work_per_call
        self.stats.total_seconds += time.perf_counter() - started
        return Prediction(event.event_id, best_class, confidence, scores, evidence)

    def predict_many(self, events: Iterable[SecurityEvent]) -> list[Prediction]:
        return [self.predict(event) for event in events]

    def reset_stats(self) -> None:
        self.stats = InferenceStats()
        self._cache.clear()
