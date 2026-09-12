"""Mutation operators.

Every operator returns :class:`~guardian.safety.kernel.PatchProposal` objects
addressed to ``capabilities.*``.  Operators never construct a genome directly
and never touch the safety layer: the address space itself is the boundary,
and the kernel checks it twice.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Any, Callable, Mapping, Sequence

from guardian.core.logging import get_logger
from guardian.core.types import EventClass
from guardian.experiments.dataset import (
    FEATURE_NAMES,
    Dataset,
    SecurityEvent,
    feature_statistics,
)
from guardian.models.genome import detectors as genome_detectors
from guardian.safety.kernel import PatchProposal

LOGGER = get_logger("evolution.mutations")

_EPS = 1e-9
#: Features whose scale makes a midpoint threshold meaningless.
_BINARY_FEATURES = {"off_hours"}


@dataclass
class MutationContext:
    """Everything an operator may read while proposing a change."""

    rng: random.Random
    train: Dataset
    stats_by_class: dict[str, dict[str, dict[str, float]]] = field(default_factory=dict)
    global_stats: dict[str, dict[str, float]] = field(default_factory=dict)

    @classmethod
    def build(cls, rng: random.Random, train: Dataset) -> "MutationContext":
        by_class = {
            label: feature_statistics(train.filter(label).events)
            for label in EventClass.values()
        }
        return cls(
            rng=rng,
            train=train,
            stats_by_class=by_class,
            global_stats=feature_statistics(train.events),
        )

    def events_for(self, label: str) -> Sequence[SecurityEvent]:
        return train_events(self.train, label)

    def separation(self, label: str, feature: str) -> float:
        """How well ``feature`` separates ``label`` from everything else."""

        target = self.stats_by_class.get(label, {}).get(feature)
        if not target or not target.get("count"):
            return 0.0
        others = [
            self.stats_by_class[other][feature]
            for other in EventClass.values()
            if other != label and self.stats_by_class.get(other, {}).get(feature, {}).get("count")
        ]
        if not others:
            return 0.0
        other_mean = sum(o["mean"] for o in others) / len(others)
        other_std = sum(o["std"] for o in others) / len(others)
        return abs(target["mean"] - other_mean) / (target["std"] + other_std + _EPS)

    def ranked_features(self, label: str) -> list[tuple[str, float]]:
        scored = [
            (feature, self.separation(label, feature))
            for feature in FEATURE_NAMES
            if feature not in _BINARY_FEATURES
        ]
        return sorted(scored, key=lambda kv: kv[1], reverse=True)

    def condition_for(self, label: str, feature: str, weight: float) -> dict[str, Any]:
        """Derive a threshold that splits ``label`` from the rest of the data."""

        target = self.stats_by_class[label][feature]
        others = [
            self.stats_by_class[other][feature]
            for other in EventClass.values()
            if other != label and self.stats_by_class.get(other, {}).get(feature, {}).get("count")
        ]
        other_p50 = sum(o["p50"] for o in others) / len(others) if others else target["p50"]
        higher = target["mean"] >= other_p50
        if higher:
            threshold = 0.5 * (target["p25"] + max(other_p50, target["p25"] * 0.5))
            op = "gte"
        else:
            threshold = 0.5 * (target["p75"] + min(other_p50, target["p75"] * 2.0 + _EPS))
            op = "lte"
        return {
            "feature": feature,
            "op": op,
            "threshold": round(float(threshold), 4),
            "weight": round(float(weight), 4),
        }


def train_events(train: Dataset, label: str) -> Sequence[SecurityEvent]:
    return train.filter(label).events


# -- operators ------------------------------------------------------------
Operator = Callable[[Mapping[str, Any], MutationContext, str], list[PatchProposal]]


def _used_features(detector: Mapping[str, Any]) -> set[str]:
    return {c["feature"] for c in detector.get("conditions", [])}


def _indices_for_class(genome: Mapping[str, Any], target_class: str) -> list[int]:
    return [
        index
        for index, detector in enumerate(genome_detectors(genome))
        if detector.get("target_class") == target_class
    ]


def add_detector(
    genome: Mapping[str, Any], ctx: MutationContext, target_class: str
) -> list[PatchProposal]:
    """Build a brand-new detector for a class from training statistics."""

    ranked = [f for f, score in ctx.ranked_features(target_class) if score > 0.35][:3]
    if not ranked:
        return []
    weights = (1.30, 0.65, 0.40)
    conditions = [
        ctx.condition_for(target_class, feature, weight)
        for feature, weight in zip(ranked, weights)
    ]
    # A detector scores the sum of the conditions that fire, so a wide
    # detector would out-shout narrow incumbents on a single partial match and
    # steal their events.  A negative bias makes the new detector effectively
    # conjunctive: the two strongest conditions must agree before it fires at
    # all.  With a single condition there is nothing to conjoin, so no bias.
    total_weight = sum(c["weight"] for c in conditions)
    bias = 0.0 if len(conditions) < 2 else -round(0.35 * total_weight, 4)
    existing = {d["id"] for d in genome_detectors(genome)}
    suffix = 1
    detector_id = f"{target_class}_synth_{suffix}"
    while detector_id in existing:
        suffix += 1
        detector_id = f"{target_class}_synth_{suffix}"
    detector = {
        "id": detector_id,
        "target_class": target_class,
        "bias": bias,
        "conditions": conditions,
    }
    index = len(genome_detectors(genome))
    return [
        PatchProposal(
            path=f"capabilities.detectors.{index}",
            op="add",
            value=detector,
            rationale=(
                f"no adequate detector for {target_class}; synthesised a conjunctive "
                f"detector (bias {bias}) from the most separating features {ranked}"
            ),
            operator="add_detector",
        )
    ]


def add_condition(
    genome: Mapping[str, Any], ctx: MutationContext, target_class: str
) -> list[PatchProposal]:
    """Strengthen an existing detector with an unused discriminative feature."""

    indices = _indices_for_class(genome, target_class)
    if not indices:
        return []
    index = ctx.rng.choice(indices)
    detector = genome_detectors(genome)[index]
    used = _used_features(detector)
    for feature, score in ctx.ranked_features(target_class):
        if feature in used or score <= 0.35:
            continue
        condition = ctx.condition_for(target_class, feature, ctx.rng.uniform(0.35, 0.8))
        return [
            PatchProposal(
                path=f"capabilities.detectors.{index}.conditions."
                f"{len(detector.get('conditions', []))}",
                op="add",
                value=condition,
                rationale=(
                    f"detector {detector['id']} ignores {feature} which separates "
                    f"{target_class} with score {score:.2f}"
                ),
                operator="add_condition",
            )
        ]
    return []


def tune_threshold(
    genome: Mapping[str, Any], ctx: MutationContext, target_class: str
) -> list[PatchProposal]:
    """Recalibrate one threshold toward the class distribution."""

    indices = _indices_for_class(genome, target_class)
    if not indices:
        return []
    index = ctx.rng.choice(indices)
    detector = genome_detectors(genome)[index]
    conditions = detector.get("conditions", [])
    if not conditions:
        return []
    c_index = ctx.rng.randrange(len(conditions))
    condition = conditions[c_index]
    feature = condition["feature"]
    stats = ctx.stats_by_class.get(target_class, {}).get(feature)
    if not stats or not stats.get("count"):
        return []
    anchor = stats["p25"] if condition["op"] in ("gte", "gt") else stats["p75"]
    jitter = ctx.rng.uniform(-0.25, 0.25)
    new_threshold = round(float(anchor * (1.0 + jitter)), 4)
    if abs(new_threshold - float(condition["threshold"])) < 1e-6:
        return []
    return [
        PatchProposal(
            path=f"capabilities.detectors.{index}.conditions.{c_index}.threshold",
            op="set",
            value=new_threshold,
            rationale=(
                f"threshold {condition['threshold']} for {feature} is off the observed "
                f"{target_class} quantiles; moving toward {anchor:.3f}"
            ),
            operator="tune_threshold",
        )
    ]


def tune_weight(
    genome: Mapping[str, Any], ctx: MutationContext, target_class: str
) -> list[PatchProposal]:
    """Re-balance the evidence weight of one condition."""

    indices = _indices_for_class(genome, target_class)
    if not indices:
        return []
    index = ctx.rng.choice(indices)
    detector = genome_detectors(genome)[index]
    conditions = detector.get("conditions", [])
    if not conditions:
        return []
    c_index = ctx.rng.randrange(len(conditions))
    current = float(conditions[c_index]["weight"])
    new_weight = round(max(0.05, min(3.0, current * ctx.rng.uniform(0.7, 1.6))), 4)
    if abs(new_weight - current) < 1e-6:
        return []
    return [
        PatchProposal(
            path=f"capabilities.detectors.{index}.conditions.{c_index}.weight",
            op="set",
            value=new_weight,
            rationale=f"re-weighting evidence for {target_class} from {current} to {new_weight}",
            operator="tune_weight",
        )
    ]


def tune_decision(
    genome: Mapping[str, Any], ctx: MutationContext, target_class: str
) -> list[PatchProposal]:
    """Adjust the global decision threshold or confidence calibration."""

    decision = genome.get("capabilities", {}).get("decision", {})
    if ctx.rng.random() < 0.5:
        current = float(decision.get("min_score", 1.0))
        value = round(max(0.1, min(3.0, current * ctx.rng.uniform(0.6, 1.35))), 4)
        key, rationale = (
            "min_score",
            f"decision floor {current} may be suppressing weak-but-correct detections",
        )
    else:
        current = float(decision.get("confidence_temperature", 1.0))
        value = round(max(0.2, min(5.0, current * ctx.rng.uniform(0.7, 1.45))), 4)
        key, rationale = (
            "confidence_temperature",
            f"recalibrating confidence temperature from {current} to reduce overconfidence",
        )
    if abs(value - current) < 1e-6:
        return []
    return [
        PatchProposal(
            path=f"capabilities.decision.{key}",
            op="set",
            value=value,
            rationale=rationale,
            operator="tune_decision",
        )
    ]


def prune_condition(
    genome: Mapping[str, Any], ctx: MutationContext, target_class: str
) -> list[PatchProposal]:
    """Drop the least valuable condition — an efficiency-motivated change."""

    indices = _indices_for_class(genome, target_class)
    for index in indices:
        detector = genome_detectors(genome)[index]
        conditions = detector.get("conditions", [])
        if len(conditions) < 2:
            continue
        weakest = min(range(len(conditions)), key=lambda i: float(conditions[i]["weight"]))
        return [
            PatchProposal(
                path=f"capabilities.detectors.{index}.conditions.{weakest}",
                op="remove",
                rationale=(
                    f"condition on {conditions[weakest]['feature']} carries the lowest weight "
                    f"in {detector['id']}; removing it reduces evaluation cost"
                ),
                operator="prune_condition",
            )
        ]
    return []


def enable_cache(
    genome: Mapping[str, Any], ctx: MutationContext, target_class: str
) -> list[PatchProposal]:
    """Memoise repeated feature vectors — a pure efficiency improvement."""

    cache = genome.get("capabilities", {}).get("cache", {})
    if cache.get("enabled"):
        return []
    return [
        PatchProposal(
            path="capabilities.cache.enabled",
            op="set",
            value=True,
            rationale="repeated feature vectors are re-scored from scratch on every call",
            operator="enable_cache",
        ),
        PatchProposal(
            path="capabilities.cache.max_entries",
            op="set",
            value=4096,
            rationale="bounded memo table keeps memory flat",
            operator="enable_cache",
        ),
    ]


#: Operator registry.  Names are stable: experiment memory keys on them.
OPERATORS: dict[str, Operator] = {
    "add_detector": add_detector,
    "add_condition": add_condition,
    "tune_threshold": tune_threshold,
    "tune_weight": tune_weight,
    "tune_decision": tune_decision,
    "prune_condition": prune_condition,
    "enable_cache": enable_cache,
}

#: Which operators plausibly address which kind of deficiency.
OPERATORS_BY_GOAL: dict[str, tuple[str, ...]] = {
    "capability": ("add_detector", "add_condition", "tune_threshold", "tune_weight", "tune_decision"),
    "false_negative": ("add_detector", "tune_threshold", "tune_decision"),
    "false_positive": ("add_condition", "tune_weight", "tune_decision"),
    "efficiency": ("prune_condition", "enable_cache"),
    "hallucination": ("tune_decision", "tune_weight"),
    "robustness": ("add_condition", "tune_threshold"),
}
