"""The continuous internal benchmark.

Five axes are measured for every version, current and candidate alike:

``capability``   macro-F1 on the held-out evaluation split
``robustness``   retention of macro-F1 under feature perturbation
``safety``       structural + policy conformance of the genome itself
``efficiency``   inference latency and genome complexity
``reliability``  determinism plus stability across bootstrap folds
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Any, Mapping, Sequence

from guardian.core.types import EventClass
from guardian.evaluation.metrics import EvaluationResult, delta_table, evaluate
from guardian.experiments.dataset import Dataset, perturb
from guardian.models.classifier import EventClassifier
from guardian.models.genome import complexity, validate_structure
from guardian.safety.policy import DEFAULT_POLICY

#: Conditions-per-event treated as the zero point of the efficiency score.
#: Deliberately a *work* measure rather than wall-clock latency: benchmarks
#: must be bit-for-bit reproducible, and timings are not.
WORK_BUDGET = 12.0
#: Genome complexity treated as the zero point of the efficiency score.
COMPLEXITY_BUDGET = 60


@dataclass
class BenchmarkReport:
    """Scores for one version on one benchmark run."""

    version_id: str
    capability: float
    robustness: float
    safety: float
    efficiency: float
    reliability: float
    detection_accuracy: float
    false_positive_rate: float
    false_negative_rate: float
    hallucination_rate: float
    sample_count: int
    per_class_f1: dict[str, float] = field(default_factory=dict)
    evaluation: dict[str, Any] = field(default_factory=dict)
    notes: list[str] = field(default_factory=list)

    def as_dict(self) -> dict[str, Any]:
        return {
            "version_id": self.version_id,
            "capability": round(self.capability, 6),
            "robustness": round(self.robustness, 6),
            "safety": round(self.safety, 6),
            "efficiency": round(self.efficiency, 6),
            "reliability": round(self.reliability, 6),
            "detection_accuracy": round(self.detection_accuracy, 6),
            "false_positive_rate": round(self.false_positive_rate, 6),
            "false_negative_rate": round(self.false_negative_rate, 6),
            "hallucination_rate": round(self.hallucination_rate, 6),
            "sample_count": self.sample_count,
            "per_class_f1": {k: round(v, 6) for k, v in self.per_class_f1.items()},
            "notes": list(self.notes),
        }

    def scalar_metrics(self) -> dict[str, float]:
        return {
            "capability": self.capability,
            "robustness": self.robustness,
            "safety": self.safety,
            "efficiency": self.efficiency,
            "reliability": self.reliability,
            "detection_accuracy": self.detection_accuracy,
            "false_positive_rate": self.false_positive_rate,
            "false_negative_rate": self.false_negative_rate,
            "hallucination_rate": self.hallucination_rate,
        }


class BenchmarkSuite:
    """Runs the same measurements against any version, deterministically."""

    def __init__(
        self,
        eval_set: Dataset,
        *,
        seed: int = 0,
        perturbation: float = 0.18,
        bootstrap_folds: int = 4,
    ) -> None:
        self.eval_set = eval_set
        self.seed = seed
        self.perturbation = perturbation
        self.bootstrap_folds = bootstrap_folds
        self._perturbed = perturb(eval_set, seed=seed + 7, magnitude=perturbation)

    # -- individual axes -------------------------------------------------
    def _run(self, classifier: EventClassifier, dataset: Dataset) -> EvaluationResult:
        classifier.reset_stats()
        predictions = classifier.predict_many(dataset)
        return evaluate(
            dataset_name=dataset.name,
            truth=dataset.labels,
            predictions=predictions,
            mean_latency_ms=classifier.stats.mean_latency_ms,
        )

    def _safety_score(self, genome: Mapping[str, Any]) -> tuple[float, list[str]]:
        """Safety of the *artefact*: structure, declared caps, policy binding."""

        notes: list[str] = []
        score = 1.0
        problems = validate_structure(genome)
        if problems:
            score -= min(0.6, 0.15 * len(problems))
            notes.extend(f"structure: {p}" for p in problems[:5])
        declared = set(genome.get("capabilities", {}).get("granted", []))
        forbidden = declared.intersection(DEFAULT_POLICY.forbidden_capabilities)
        if forbidden:
            score -= 1.0
            notes.append(f"declares forbidden capabilities: {sorted(forbidden)}")
        recorded_hash = genome.get("identity", {}).get("policy_hash")
        if recorded_hash != DEFAULT_POLICY.policy_hash:
            score -= 0.5
            notes.append("genome policy_hash does not match the live policy")
        return (max(0.0, score), notes)

    def _efficiency_score(self, work_per_call: float, genome: Mapping[str, Any]) -> float:
        """Deterministic: derived from conditions evaluated and genome size."""

        work_term = 1.0 / (1.0 + max(0.0, work_per_call) / WORK_BUDGET)
        size_term = 1.0 / (1.0 + complexity(genome) / COMPLEXITY_BUDGET)
        return 0.6 * work_term + 0.4 * size_term

    def _reliability_score(self, classifier: EventClassifier) -> tuple[float, list[str]]:
        """Determinism plus variance of macro-F1 across bootstrap folds."""

        notes: list[str] = []
        first = [p.predicted for p in classifier.predict_many(self.eval_set)]
        second = [p.predicted for p in classifier.predict_many(self.eval_set)]
        determinism = sum(1 for a, b in zip(first, second) if a == b) / max(1, len(first))
        if determinism < 1.0:
            notes.append("classifier is non-deterministic across identical runs")

        rng = random.Random(self.seed + 31)
        events = list(self.eval_set.events)
        scores: list[float] = []
        for fold in range(self.bootstrap_folds):
            sample = [rng.choice(events) for _ in range(max(30, len(events) // 3))]
            predictions = classifier.predict_many(sample)
            result = evaluate(
                dataset_name=f"fold{fold}",
                truth=[event.label for event in sample],
                predictions=predictions,
            )
            scores.append(result.macro_f1)
        mean = sum(scores) / len(scores) if scores else 0.0
        variance = (
            sum((s - mean) ** 2 for s in scores) / max(1, len(scores) - 1) if scores else 0.0
        )
        stability = 1.0 / (1.0 + 8.0 * variance**0.5)
        return (0.5 * determinism + 0.5 * stability, notes)

    def _hallucination_rate(
        self, classifier: EventClassifier, result: EvaluationResult
    ) -> float:
        """Outputs outside the schema, plus confident-but-wrong answers."""

        known = set(EventClass.values())
        off_schema = sum(
            1 for detector in classifier.detectors if detector.target_class not in known
        )
        confident_errors = result.high_confidence_errors / max(1, result.sample_count)
        return min(1.0, off_schema * 0.25 + confident_errors)

    # -- full run --------------------------------------------------------
    def run(self, version_id: str, genome: Mapping[str, Any]) -> BenchmarkReport:
        classifier = EventClassifier(genome)
        clean = self._run(classifier, self.eval_set)
        work_per_call = classifier.stats.work_per_call
        noisy = self._run(classifier, self._perturbed)

        retention = noisy.macro_f1 / clean.macro_f1 if clean.macro_f1 else 0.0
        robustness = max(0.0, min(1.0, 0.35 * noisy.macro_f1 + 0.65 * min(1.0, retention)))
        safety, safety_notes = self._safety_score(genome)
        reliability, reliability_notes = self._reliability_score(classifier)

        return BenchmarkReport(
            version_id=version_id,
            capability=clean.macro_f1,
            robustness=robustness,
            safety=safety,
            efficiency=self._efficiency_score(work_per_call, genome),
            reliability=reliability,
            detection_accuracy=clean.accuracy,
            false_positive_rate=clean.false_positive_rate,
            false_negative_rate=clean.false_negative_rate,
            hallucination_rate=self._hallucination_rate(classifier, clean),
            sample_count=clean.sample_count,
            per_class_f1={k: v.f1 for k, v in clean.per_class.items()},
            evaluation=clean.as_dict(),
            notes=safety_notes + reliability_notes,
        )


def comparison_report(
    current: BenchmarkReport, candidate: BenchmarkReport
) -> dict[str, Any]:
    """The human-facing +X% / -X% table."""

    keys = (
        "capability",
        "robustness",
        "safety",
        "efficiency",
        "reliability",
        "detection_accuracy",
        "false_positive_rate",
        "false_negative_rate",
        "hallucination_rate",
    )
    table = delta_table(current.scalar_metrics(), candidate.scalar_metrics(), keys)
    per_class = delta_table(
        current.per_class_f1, candidate.per_class_f1, tuple(EventClass.values())
    )
    return {
        "current_version": current.version_id,
        "candidate_version": candidate.version_id,
        "metrics": table,
        "per_class_f1": per_class,
    }
