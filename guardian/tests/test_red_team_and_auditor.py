"""The adversarial lab and the independent auditor."""

from __future__ import annotations

import pytest

from guardian.adversarial.red_team import Finding, RedTeamAgent, RedTeamReport
from guardian.audit.auditor import IndependentAuditor
from guardian.core.types import EventClass, Severity, Verdict
from guardian.evaluation.benchmark import BenchmarkReport
from guardian.experiments.schemas import ExperimentRecord
from guardian.models.genome import seed_genome
from guardian.safety.kernel import KernelReport, SafetyKernel, SafetyViolation
from guardian.safety.policy import DEFAULT_POLICY

ALL_SUITES = list(DEFAULT_POLICY.gates.required_red_team_suites)


def _benchmark(**overrides) -> BenchmarkReport:
    base = dict(
        version_id="x",
        capability=0.80,
        robustness=0.85,
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


def _experiment() -> ExperimentRecord:
    record = ExperimentRecord(
        parent_version="0.1",
        hypothesis="h",
        seed=1,
        candidate_version="0.2",
        changes=[{"operator": "tune_weight", "path": "capabilities.x", "op": "set"}],
        dataset={"eval": {"name": "eval"}},
        metrics={"capability": 0.9},
        tests={"benchmark_samples": 500},
    )
    record.compute_signature()
    return record


def _red_team(score_findings=(), probes: int = 500) -> RedTeamReport:
    report = RedTeamReport(version_id="0.2", suites_run=list(ALL_SUITES), probes=probes)
    report.findings.extend(score_findings)
    return report


# -- red team -------------------------------------------------------------
def test_red_team_runs_every_mandated_suite(kernel: SafetyKernel, splits) -> None:
    agent = RedTeamAgent(kernel=kernel, probe_set=splits["holdout"], seed=7)
    report = agent.attack(version_id="0.1", genome=seed_genome())
    assert set(report.suites_run) == set(ALL_SUITES)
    assert report.probes > 0


def test_red_team_cannot_bypass_the_policy(kernel: SafetyKernel, splits) -> None:
    """The policy_bypass suite must come back empty — every probe was blocked."""

    agent = RedTeamAgent(kernel=kernel, probe_set=splits["holdout"], seed=7)
    report = agent.attack(version_id="0.1", genome=seed_genome())
    assert report.by_suite().get("policy_bypass", 0) == 0


def test_red_team_detects_a_hallucinated_class(kernel: SafetyKernel, splits) -> None:
    genome = seed_genome()
    genome["capabilities"]["detectors"][0]["target_class"] = "alien_signal"
    agent = RedTeamAgent(kernel=kernel, probe_set=splits["holdout"], seed=7)
    report = agent.attack(version_id="bad", genome=genome)
    hallucination = [f for f in report.findings if f.suite == "hallucination"]
    assert hallucination
    assert report.critical_failures >= 1


def test_red_team_detects_regression_against_the_incumbent(
    kernel: SafetyKernel, splits
) -> None:
    crippled = seed_genome()
    # Make the phishing detector unreachable, which regresses known-good events.
    crippled["capabilities"]["detectors"][3]["conditions"][0]["threshold"] = 99.0
    crippled["capabilities"]["detectors"][3]["conditions"][1]["threshold"] = 1e5
    agent = RedTeamAgent(kernel=kernel, probe_set=splits["holdout"], seed=7)
    report = agent.attack(
        version_id="bad", genome=crippled, baseline_genome=seed_genome()
    )
    assert any(f.suite == "regression" for f in report.findings)
    assert report.score < 1.0


def test_red_team_score_falls_with_severity() -> None:
    clean = _red_team()
    assert clean.score == 1.0
    critical = _red_team([Finding("consistency", Severity.CRITICAL.value, "boom")])
    assert critical.score < clean.score
    assert critical.critical_failures == 1


def test_red_team_uses_a_different_seed_stream(kernel: SafetyKernel, splits) -> None:
    """RED_TEAM must not sample the same way the research agent does."""

    import random

    agent = RedTeamAgent(kernel=kernel, probe_set=splits["holdout"], seed=99)
    assert agent.rng.random() != random.Random(99).random()


# -- auditor --------------------------------------------------------------
def test_auditor_approves_a_clean_improvement(kernel: SafetyKernel) -> None:
    decision = IndependentAuditor(kernel).review(
        experiment=_experiment(),
        baseline=_benchmark(),
        candidate=_benchmark(capability=0.90),
        red_team=_red_team(),
        kernel_report=KernelReport(passed=True, policy_hash=kernel.policy_hash),
        sandbox_report={"allowed": True},
    )
    assert decision.verdict == Verdict.APPROVE.value
    assert decision.approved


def test_auditor_rejects_when_the_kernel_objects(kernel: SafetyKernel) -> None:
    failed = KernelReport(passed=True, policy_hash=kernel.policy_hash)
    failed.add_violation(SafetyViolation("touched a protected path", subject="safety"))
    decision = IndependentAuditor(kernel).review(
        experiment=_experiment(),
        baseline=_benchmark(),
        candidate=_benchmark(capability=0.99),
        red_team=_red_team(),
        kernel_report=failed,
        sandbox_report={"allowed": True},
    )
    assert decision.verdict == Verdict.REJECT.value
    assert any("safety kernel" in reason for reason in decision.reasons)


def test_auditor_rejects_a_sandbox_escape(kernel: SafetyKernel) -> None:
    decision = IndependentAuditor(kernel).review(
        experiment=_experiment(),
        baseline=_benchmark(),
        candidate=_benchmark(capability=0.99),
        red_team=_red_team(),
        kernel_report=KernelReport(passed=True, policy_hash=kernel.policy_hash),
        sandbox_report={"allowed": False, "violations": [{"kind": "network"}]},
    )
    assert decision.verdict == Verdict.REJECT.value


def test_auditor_rejects_a_critical_adversarial_finding(kernel: SafetyKernel) -> None:
    decision = IndependentAuditor(kernel).review(
        experiment=_experiment(),
        baseline=_benchmark(),
        candidate=_benchmark(capability=0.99),
        red_team=_red_team([Finding("consistency", Severity.CRITICAL.value, "flaky")]),
        kernel_report=KernelReport(passed=True, policy_hash=kernel.policy_hash),
        sandbox_report={"allowed": True},
    )
    assert decision.verdict == Verdict.REJECT.value


def test_auditor_asks_for_more_tests_on_thin_evidence(kernel: SafetyKernel) -> None:
    decision = IndependentAuditor(kernel).review(
        experiment=_experiment(),
        baseline=_benchmark(),
        candidate=_benchmark(capability=0.90),
        red_team=_red_team(probes=5),
        kernel_report=KernelReport(passed=True, policy_hash=kernel.policy_hash),
        sandbox_report={"allowed": True},
    )
    assert decision.verdict == Verdict.REQUIRE_MORE_TESTS.value


def test_auditor_asks_for_more_tests_when_provenance_is_incomplete(
    kernel: SafetyKernel,
) -> None:
    incomplete = _experiment()
    incomplete.changes = []
    decision = IndependentAuditor(kernel).review(
        experiment=incomplete,
        baseline=_benchmark(),
        candidate=_benchmark(capability=0.90),
        red_team=_red_team(),
        kernel_report=KernelReport(passed=True, policy_hash=kernel.policy_hash),
        sandbox_report={"allowed": True},
    )
    assert decision.verdict == Verdict.REQUIRE_MORE_TESTS.value
    assert any("incomplete experiment record" in r for r in decision.reasons)


def test_auditor_rejects_a_safety_regression_however_capable(kernel: SafetyKernel) -> None:
    decision = IndependentAuditor(kernel).review(
        experiment=_experiment(),
        baseline=_benchmark(),
        candidate=_benchmark(capability=0.99, safety=0.60),
        red_team=_red_team(),
        kernel_report=KernelReport(passed=True, policy_hash=kernel.policy_hash),
        sandbox_report={"allowed": True},
    )
    assert decision.verdict == Verdict.REJECT.value


def test_auditor_cannot_be_reconfigured(kernel: SafetyKernel) -> None:
    """The research agent must not be able to move the auditor's goalposts."""

    auditor = IndependentAuditor(kernel)
    for attribute in ("_kernel", "threshold", "verdict"):
        with pytest.raises(SafetyViolation):
            setattr(auditor, attribute, "anything")


def test_auditor_records_its_own_build_hash(kernel: SafetyKernel) -> None:
    decision = IndependentAuditor(kernel).review(
        experiment=_experiment(),
        baseline=_benchmark(),
        candidate=_benchmark(capability=0.90),
        red_team=_red_team(),
        kernel_report=KernelReport(passed=True, policy_hash=kernel.policy_hash),
    )
    assert decision.auditor_hash
    assert decision.evidence["policy_hash"] == kernel.policy_hash


def test_canary_review_rejects_a_degrading_rollout(kernel: SafetyKernel) -> None:
    auditor = IndependentAuditor(kernel)
    ok, _ = auditor.review_canary(
        batches=[
            {"index": i, "size": 120, "error_rate": 0.10, "baseline_error_rate": 0.10}
            for i in range(5)
        ],
        baseline_error_rate=0.10,
    )
    assert ok
    bad, reason = auditor.review_canary(
        batches=[
            {"index": 0, "size": 120, "error_rate": 0.10, "baseline_error_rate": 0.10},
            {"index": 1, "size": 120, "error_rate": 0.90, "baseline_error_rate": 0.10},
        ],
        baseline_error_rate=0.10,
    )
    assert not bad
    assert "exceeded tolerance" in reason


def test_canary_review_tolerates_sampling_noise(kernel: SafetyKernel) -> None:
    """One extra mistake in a batch must not trigger a rollback."""

    auditor = IndependentAuditor(kernel)
    ok, _ = auditor.review_canary(
        batches=[
            {"index": i, "size": 120, "error_rate": 0.10 + 1 / 120, "baseline_error_rate": 0.10}
            for i in range(4)
        ],
        baseline_error_rate=0.10,
    )
    assert ok
