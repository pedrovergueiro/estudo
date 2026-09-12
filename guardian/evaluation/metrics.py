"""Classification metrics computed without third-party dependencies."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping, Sequence

from guardian.core.types import EventClass


@dataclass
class ClassMetrics:
    label: str
    support: int
    true_positive: int
    false_positive: int
    false_negative: int

    @property
    def precision(self) -> float:
        denom = self.true_positive + self.false_positive
        return self.true_positive / denom if denom else 0.0

    @property
    def recall(self) -> float:
        denom = self.true_positive + self.false_negative
        return self.true_positive / denom if denom else 0.0

    @property
    def f1(self) -> float:
        p, r = self.precision, self.recall
        return 2 * p * r / (p + r) if (p + r) else 0.0

    def as_dict(self) -> dict[str, Any]:
        return {
            "label": self.label,
            "support": self.support,
            "precision": round(self.precision, 6),
            "recall": round(self.recall, 6),
            "f1": round(self.f1, 6),
            "false_positive": self.false_positive,
            "false_negative": self.false_negative,
        }


@dataclass
class EvaluationResult:
    """Aggregate outcome of running a classifier over a labelled dataset."""

    dataset: str
    sample_count: int
    accuracy: float
    macro_f1: float
    per_class: dict[str, ClassMetrics] = field(default_factory=dict)
    confusion: dict[str, dict[str, int]] = field(default_factory=dict)
    mean_confidence: float = 0.0
    mean_confidence_when_wrong: float = 0.0
    high_confidence_errors: int = 0
    mean_latency_ms: float = 0.0

    @property
    def false_positive_rate(self) -> float:
        """Fraction of truly benign events flagged as an attack."""

        benign = EventClass.BENIGN.value
        row = self.confusion.get(benign, {})
        total = sum(row.values())
        if not total:
            return 0.0
        return (total - row.get(benign, 0)) / total

    @property
    def false_negative_rate(self) -> float:
        """Fraction of true attacks dismissed as benign."""

        benign = EventClass.BENIGN.value
        missed = 0
        total = 0
        for label, row in self.confusion.items():
            if label == benign:
                continue
            total += sum(row.values())
            missed += row.get(benign, 0)
        return missed / total if total else 0.0

    def weakest_class(self) -> tuple[str, float]:
        if not self.per_class:
            return ("", 0.0)
        worst = min(self.per_class.values(), key=lambda m: (m.f1, -m.support))
        return (worst.label, worst.f1)

    def as_dict(self) -> dict[str, Any]:
        return {
            "dataset": self.dataset,
            "sample_count": self.sample_count,
            "accuracy": round(self.accuracy, 6),
            "macro_f1": round(self.macro_f1, 6),
            "false_positive_rate": round(self.false_positive_rate, 6),
            "false_negative_rate": round(self.false_negative_rate, 6),
            "mean_confidence": round(self.mean_confidence, 6),
            "mean_confidence_when_wrong": round(self.mean_confidence_when_wrong, 6),
            "high_confidence_errors": self.high_confidence_errors,
            "mean_latency_ms": round(self.mean_latency_ms, 6),
            "per_class": {k: v.as_dict() for k, v in self.per_class.items()},
            "confusion": self.confusion,
        }


def evaluate(
    *,
    dataset_name: str,
    truth: Sequence[str],
    predictions: Sequence[Any],
    mean_latency_ms: float = 0.0,
    high_confidence_threshold: float = 0.80,
) -> EvaluationResult:
    """Build an :class:`EvaluationResult` from labels and predictions."""

    labels = EventClass.values()
    confusion = {actual: {pred: 0 for pred in labels} for actual in labels}
    per_class = {
        label: ClassMetrics(label=label, support=0, true_positive=0, false_positive=0, false_negative=0)
        for label in labels
    }

    correct = 0
    confidences: list[float] = []
    wrong_confidences: list[float] = []
    high_conf_errors = 0

    for actual, prediction in zip(truth, predictions):
        predicted = getattr(prediction, "predicted", prediction)
        confidence = float(getattr(prediction, "confidence", 0.0))
        confidences.append(confidence)
        if actual in confusion and predicted in confusion[actual]:
            confusion[actual][predicted] += 1
        per_class[actual].support += 1
        if predicted == actual:
            correct += 1
            per_class[actual].true_positive += 1
        else:
            per_class[actual].false_negative += 1
            if predicted in per_class:
                per_class[predicted].false_positive += 1
            wrong_confidences.append(confidence)
            if confidence >= high_confidence_threshold:
                high_conf_errors += 1

    total = len(truth)
    macro_f1 = (
        sum(metric.f1 for metric in per_class.values() if metric.support)
        / max(1, sum(1 for metric in per_class.values() if metric.support))
    )
    return EvaluationResult(
        dataset=dataset_name,
        sample_count=total,
        accuracy=correct / total if total else 0.0,
        macro_f1=macro_f1,
        per_class=per_class,
        confusion=confusion,
        mean_confidence=sum(confidences) / len(confidences) if confidences else 0.0,
        mean_confidence_when_wrong=(
            sum(wrong_confidences) / len(wrong_confidences) if wrong_confidences else 0.0
        ),
        high_confidence_errors=high_conf_errors,
        mean_latency_ms=mean_latency_ms,
    )


def delta_table(
    current: Mapping[str, Any], candidate: Mapping[str, Any], keys: Sequence[str]
) -> dict[str, dict[str, float]]:
    """Signed and relative deltas for a set of scalar metrics."""

    table: dict[str, dict[str, float]] = {}
    for key in keys:
        before = float(current.get(key, 0.0) or 0.0)
        after = float(candidate.get(key, 0.0) or 0.0)
        relative = ((after - before) / abs(before) * 100.0) if before else 0.0
        table[key] = {
            "current": round(before, 6),
            "candidate": round(after, 6),
            "delta": round(after - before, 6),
            "delta_pct": round(relative, 3),
        }
    return table
