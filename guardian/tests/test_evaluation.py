"""Metrics, benchmark axes, fitness shape and the anti-regression gates."""

from __future__ import annotations

import pytest

from guardian.core.config import FitnessWeights
from guardian.core.types import EventClass
from guardian.evaluation.anti_regression import check_gates
from guardian.evaluation.benchmark import BenchmarkReport, BenchmarkSuite, comparison_report
from guardian.evaluation.fitness import compute_fitness
from guardian.evaluation.metrics import evaluate
from guardian.models.genome import seed_genome
from guardian.safety.policy import DEFAULT_POLICY

ALL_SUITES = list(DEFAULT_POLICY.gates.required_red_team_suites)


class _Pred:
    def __init__(self, predicted: str, confidence: float = 0.5) -> None:
        self.predicted = predicted
        self.confidence = confidence


def _report(**overrides) -> BenchmarkReport:
    base = dict(
        version_id="x",
        capability=0.80,
        robustness=0.80,
        safety=1.0,
        efficiency=0.80,
        reliability=0.90,
        detection_accuracy=0.85,
        false_positive_rate=0.05,
        false_negative_rate=0.05,
        hallucination_rate=0.0,
        sample_count=500,
    )
    base.update(overrides)
    return BenchmarkReport(**base)


def test_metrics_perfect_classification() -> None:
    truth = [EventClass.BENIGN.value, EventClass.PHISHING.value]
    result = evaluate(
        dataset_name="t", truth=truth, predictions=[_Pred(label) for label in truth]
    )
    assert result.accuracy == 1.0
    assert result.macro_f1 == 1.0
    assert result.false_positive_rate == 0.0
    assert result.false_negative_rate == 0.0


def test_false_positive_and_negative_rates() -> None:
    truth = [EventClass.BENIGN.value, EventClass.BENIGN.value, EventClass.PHISHING.value]
    predictions = [
        _Pred(EventClass.BENIGN.value),
        _Pred(EventClass.PHISHING.value),  # false positive
        _Pred(EventClass.BENIGN.value),  # false negative
    ]
    result = evaluate(dataset_name="t", truth=truth, predictions=predictions)
    assert result.false_positive_rate == pytest.approx(0.5)
    assert result.false_negative_rate == pytest.approx(1.0)


def test_weakest_class_is_reported() -> None:
    truth = [EventClass.BENIGN.value] * 3 + [EventClass.BEACONING.value] * 3
    predictions = [_Pred(EventClass.BENIGN.value) for _ in truth]
    result = evaluate(dataset_name="t", truth=truth, predictions=predictions)
    assert result.weakest_class()[0] == EventClass.BEACONING.value


def test_high_confidence_errors_are_counted() -> None:
    result = evaluate(
        dataset_name="t",
        truth=[EventClass.PHISHING.value],
        predictions=[_Pred(EventClass.BENIGN.value, confidence=0.99)],
    )
    assert result.high_confidence_errors == 1


def test_benchmark_axes_are_bounded(splits) -> None:
    suite = BenchmarkSuite(splits["eval"], seed=3)
    report = suite.run("0.1", seed_genome())
    for name, value in report.scalar_metrics().items():
        assert 0.0 <= value <= 1.0, f"{name} out of range: {value}"
    assert report.sample_count == len(splits["eval"])


def test_benchmark_is_reproducible(splits) -> None:
    a = BenchmarkSuite(splits["eval"], seed=3).run("0.1", seed_genome())
    b = BenchmarkSuite(splits["eval"], seed=3).run("0.1", seed_genome())
    assert a.scalar_metrics() == b.scalar_metrics()


def test_benchmark_penalises_a_structurally_broken_genome(splits) -> None:
    genome = seed_genome()
    genome["capabilities"]["detectors"][0]["target_class"] = "not_a_class"
    report = BenchmarkSuite(splits["eval"], seed=3).run("bad", genome)
    assert report.safety < 1.0
    assert report.hallucination_rate > 0.0


def test_comparison_report_shows_deltas() -> None:
    table = comparison_report(_report(capability=0.5), _report(capability=0.75))["metrics"]
    assert table["capability"]["delta"] == pytest.approx(0.25)
    assert table["capability"]["delta_pct"] == pytest.approx(50.0)


def test_intelligence_alone_does_not_win() -> None:
    """A smarter-but-less-safe candidate must score below a safe one."""

    weights = FitnessWeights()
    baseline = _report()
    smarter_unsafe = compute_fitness(
        candidate=_report(capability=0.95, safety=0.70),
        baseline=baseline,
        adversarial_score=0.9,
        weights=weights,
    )
    modest_safe = compute_fitness(
        candidate=_report(capability=0.83),
        baseline=baseline,
        adversarial_score=0.9,
        weights=weights,
    )
    assert smarter_unsafe.total < modest_safe.total


def test_hallucination_is_penalised() -> None:
    weights = FitnessWeights()
    baseline = _report()
    clean = compute_fitness(
        candidate=_report(capability=0.9), baseline=baseline, adversarial_score=0.9, weights=weights
    )
    hallucinating = compute_fitness(
        candidate=_report(capability=0.9, hallucination_rate=0.3),
        baseline=baseline,
        adversarial_score=0.9,
        weights=weights,
    )
    assert hallucinating.total < clean.total


def test_adversarial_weakness_lowers_fitness() -> None:
    weights = FitnessWeights()
    baseline = _report()
    strong = compute_fitness(
        candidate=_report(capability=0.9), baseline=baseline, adversarial_score=1.0, weights=weights
    )
    brittle = compute_fitness(
        candidate=_report(capability=0.9), baseline=baseline, adversarial_score=0.2, weights=weights
    )
    assert brittle.total < strong.total


def test_gates_pass_for_a_clean_improvement() -> None:
    report = check_gates(
        baseline=_report(),
        candidate=_report(capability=0.90),
        adversarial_score=0.95,
        critical_failures=0,
        executed_suites=ALL_SUITES,
    )
    assert report.passed


@pytest.mark.parametrize(
    "kwargs, failing_gate",
    [
        ({"candidate": _report(capability=0.801)}, "capability_gain"),
        ({"candidate": _report(capability=0.9, safety=0.8)}, "safety_not_regressed"),
        ({"critical_failures": 1}, "no_critical_failures"),
        ({"adversarial_score": 0.2}, "adversarial_score"),
        ({"candidate": _report(capability=0.9, sample_count=10)}, "evaluation_sample_size"),
        ({"executed_suites": ["consistency"]}, "red_team_coverage"),
        (
            {"candidate": _report(capability=0.9, hallucination_rate=0.1)},
            "no_hallucination_increase",
        ),
    ],
)
def test_each_gate_blocks_its_own_regression(kwargs, failing_gate) -> None:
    params = {
        "baseline": _report(),
        "candidate": _report(capability=0.90),
        "adversarial_score": 0.95,
        "critical_failures": 0,
        "executed_suites": ALL_SUITES,
    }
    params.update(kwargs)
    report = check_gates(**params)
    assert not report.passed
    assert failing_gate in [f.name for f in report.failures]


def test_gate_thresholds_come_from_the_immutable_policy() -> None:
    gates = DEFAULT_POLICY.gates
    assert gates.max_critical_failures == 0
    assert gates.min_capability_gain > 0
    with pytest.raises(Exception):
        gates.max_critical_failures = 99  # type: ignore[misc]
