"""End-to-end: the loop must improve capability without weakening safety."""

from __future__ import annotations

import pytest

from guardian.core.types import EventClass, Verdict
from guardian.evolution.loop import EvolutionEngine
from guardian.evolution.research_agent import Candidate, ResearchAgent
from guardian.experiments.schemas import ExperimentRecord, Hypothesis
from guardian.models.genome import seed_genome
from guardian.safety.kernel import PatchProposal, SafetyViolation


def test_research_agent_finds_the_real_blind_spot(engine: EvolutionEngine) -> None:
    report = engine.benchmark_version(engine.state.current)
    weaknesses = engine.research_agent.identify_weaknesses(report)
    assert weaknesses
    assert weaknesses[0].target_class == EventClass.BEACONING.value
    assert weaknesses[0].deficit > 0.5


def test_research_agent_proposes_only_capability_patches(engine: EvolutionEngine) -> None:
    report = engine.benchmark_version(engine.state.current)
    population = engine.research_agent.propose_population(
        engine.state.current.genome, report, size=4
    )
    assert population
    for candidate in population:
        for patch in candidate.patches:
            assert patch.path.startswith("capabilities.")
            engine.state.kernel.validate_patch(patch)


def test_hypotheses_are_distinct_and_falsifiable(engine: EvolutionEngine) -> None:
    report = engine.benchmark_version(engine.state.current)
    weaknesses = engine.research_agent.identify_weaknesses(report)
    pairs = engine.research_agent.generate_hypotheses(weaknesses, 5)
    assert len(pairs) >= 2
    statements = {h.statement for h, _ in pairs}
    assert len(statements) == len(pairs)
    for hypothesis, _ in pairs:
        assert hypothesis.expected_effect > 0
        assert hypothesis.target_metric


def test_generation_promotes_and_improves(engine: EvolutionEngine) -> None:
    before = engine.benchmark_version(engine.state.current)
    outcome = engine.run_generation(1)
    assert outcome.promoted_version, "expected the beaconing blind spot to be fixed"
    after = engine.benchmark_version(engine.state.current)
    assert after.capability > before.capability
    assert after.safety >= before.safety
    assert after.per_class_f1[EventClass.BEACONING.value] > 0.5


def test_every_trial_is_fully_recorded(engine: EvolutionEngine) -> None:
    engine.run_generation(1)
    rows = engine.state.database.experiments(50)
    assert rows
    for row in rows:
        assert row["experiment_id"]
        assert row["parent_version"]
        assert row["hypothesis"]
        assert row["changes_json"] not in ("", "[]")
        assert row["mutation_signature"]
        assert row["created_at"]
        assert row["decision"] in {v.value for v in Verdict} | {"SAFETY_BLOCKED"}


def test_audits_and_benchmarks_are_persisted(engine: EvolutionEngine) -> None:
    engine.run_generation(1)
    assert engine.state.database.audits()
    assert engine.state.database.benchmarks()
    assert engine.state.database.deployments()


def test_loop_never_promotes_on_capability_alone(engine: EvolutionEngine) -> None:
    """Every promoted version must have cleared the full gate set."""

    engine.run(2)
    approved = [
        row for row in engine.state.database.experiments(100) if row["decision"] == "APPROVE"
    ]
    import json

    for row in approved:
        evidence = [
            json.loads(a["evidence_json"])
            for a in engine.state.database.audits(200)
            if a["experiment_id"] == row["experiment_id"]
        ]
        assert evidence
        assert evidence[0]["gates"]["passed"]
        assert evidence[0]["red_team"]["critical_failures"] == 0


def test_safety_score_never_regresses_across_the_run(engine: EvolutionEngine) -> None:
    baseline = engine.benchmark_version(engine.state.current).safety
    engine.run(2)
    assert engine.benchmark_version(engine.state.current).safety >= baseline


def test_kernel_hash_is_unchanged_after_evolving(engine: EvolutionEngine) -> None:
    before = engine.state.kernel.policy_hash
    digests = engine.state.kernel.current_digests()
    engine.run(2)
    assert engine.state.kernel.policy_hash == before
    assert engine.state.kernel.current_digests() == digests
    engine.state.kernel.verify_integrity(engine.state.config.kernel_lock_path)


def test_promoted_genome_only_differs_in_the_capability_layer(
    engine: EvolutionEngine,
) -> None:
    from guardian.safety.kernel import _diff_paths

    baseline = engine.state.current.genome
    engine.run(2)
    changed = _diff_paths(baseline, engine.state.current.genome)
    assert changed, "expected the capability layer to change"
    assert all(path.startswith("capabilities") for path in changed)


def test_memory_learns_from_rejections(engine: EvolutionEngine) -> None:
    engine.run(2)
    stats = engine.state.memory.operator_statistics()
    assert stats
    assert sum(s.attempts for s in stats.values()) > 0
    bias = engine.state.memory.operator_bias(list(stats))
    assert all(value > 0 for value in bias.values())


def test_a_rogue_agent_is_stopped_not_silently_ignored(engine: EvolutionEngine) -> None:
    """If the research agent ever emits a protected patch, it must raise."""

    report = engine.benchmark_version(engine.state.current)
    weaknesses = engine.research_agent.identify_weaknesses(report)
    rogue = Hypothesis(
        statement="rewrite the policy",
        target_metric="capability",
        operator="tune_weight",
        expected_effect=1.0,
    )

    def rogue_operator(genome, ctx, target_class):
        return [PatchProposal(path="safety.gates.min_capability_gain", op="set", value=-1.0)]

    from guardian.evolution import mutations

    original = mutations.OPERATORS["tune_weight"]
    mutations.OPERATORS["tune_weight"] = rogue_operator
    try:
        with pytest.raises(SafetyViolation):
            engine.research_agent.create_candidate(
                engine.state.current.genome, rogue, weaknesses[0]
            )
    finally:
        mutations.OPERATORS["tune_weight"] = original


def test_experiment_record_validates_its_own_provenance() -> None:
    record = ExperimentRecord(parent_version="0.1", hypothesis="h", seed=1)
    problems = record.validate()
    assert "changes list is empty" in problems
    assert "mutation_signature was never computed" in problems

    record.changes = [{"operator": "x", "path": "capabilities.y", "op": "set"}]
    record.dataset = {"eval": {}}
    record.metrics = {"a": 1}
    record.tests = {"b": 2}
    record.compute_signature()
    assert record.validate() == []


def test_signature_is_stable_and_value_sensitive() -> None:
    def build(value: float) -> str:
        patch = PatchProposal(path="capabilities.a.b", op="set", value=value, operator="tune")
        record = ExperimentRecord(
            parent_version="0.1", hypothesis="h", seed=1, changes=[patch.as_dict()]
        )
        return record.compute_signature()

    assert build(1.0) == build(1.0)
    assert build(1.0) != build(2.0)
