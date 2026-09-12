"""Multi-objective fitness.

Capability is one term among nine.  A candidate that classifies better but
hallucinates more, regresses on safety, or trades false negatives for
false positives will not out-score the incumbent.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from guardian.core.config import FitnessWeights
from guardian.evaluation.benchmark import BenchmarkReport


@dataclass
class FitnessBreakdown:
    """Every term that contributed to a fitness score, kept for the audit log."""

    total: float
    terms: dict[str, float] = field(default_factory=dict)
    weights: dict[str, float] = field(default_factory=dict)

    def as_dict(self) -> dict[str, Any]:
        return {
            "total": round(self.total, 6),
            "terms": {k: round(v, 6) for k, v in self.terms.items()},
            "weights": dict(self.weights),
        }

    def top_contributors(self, count: int = 3) -> list[tuple[str, float]]:
        return sorted(self.terms.items(), key=lambda kv: abs(kv[1]), reverse=True)[:count]


def compute_fitness(
    *,
    candidate: BenchmarkReport,
    baseline: BenchmarkReport,
    adversarial_score: float,
    weights: FitnessWeights,
) -> FitnessBreakdown:
    """Score a candidate *relative to* its parent version.

    Positive terms reward gains; negative terms are penalties whose weight
    exceeds the capability weight for anything safety-relevant.
    """

    capability_gain = candidate.capability - baseline.capability
    safety_regression = max(0.0, baseline.safety - candidate.safety)
    # Adversarial robustness enters through the robustness term, so a
    # candidate cannot buy fitness by being brittle under red-team pressure.
    robustness_term = 0.7 * candidate.robustness + 0.3 * adversarial_score

    terms = {
        "capability_gain": weights.capability_gain * capability_gain,
        "robustness": weights.robustness * robustness_term,
        "detection_accuracy": weights.detection_accuracy * candidate.detection_accuracy,
        "efficiency": weights.efficiency * candidate.efficiency,
        "reliability": weights.reliability * candidate.reliability,
        "hallucination": -weights.hallucination * candidate.hallucination_rate,
        "false_positive": -weights.false_positive * candidate.false_positive_rate,
        "false_negative": -weights.false_negative * candidate.false_negative_rate,
        "safety_regression": -weights.safety_regression * safety_regression,
    }
    return FitnessBreakdown(
        total=sum(terms.values()),
        terms=terms,
        weights={
            "capability_gain": weights.capability_gain,
            "robustness": weights.robustness,
            "detection_accuracy": weights.detection_accuracy,
            "efficiency": weights.efficiency,
            "reliability": weights.reliability,
            "hallucination": weights.hallucination,
            "false_positive": weights.false_positive,
            "false_negative": weights.false_negative,
            "safety_regression": weights.safety_regression,
        },
    )


def baseline_fitness(
    report: BenchmarkReport, adversarial_score: float, weights: FitnessWeights
) -> FitnessBreakdown:
    """Fitness of a version measured against itself (zero capability gain)."""

    return compute_fitness(
        candidate=report,
        baseline=report,
        adversarial_score=adversarial_score,
        weights=weights,
    )
