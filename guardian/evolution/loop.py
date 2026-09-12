"""The automated research loop.

    observe -> identify_weaknesses -> generate_hypotheses -> create_candidate
    -> optimise -> evaluate -> adversarial_test -> safety_test -> compare
    -> decide -> canary -> rollback if necessary

Each generation produces one fully-provenanced experiment record per
candidate, and at most one promotion.  The engine holds references to the
research agent, the red team and the auditor, but the research agent holds a
reference to none of them: it cannot see, call, or influence its own judges.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Any, Mapping, Sequence

from guardian.adversarial.red_team import RedTeamAgent, RedTeamReport
from guardian.audit.auditor import AuditDecision, IndependentAuditor
from guardian.core.deployment import CanaryDeployer, CanaryResult
from guardian.core.logging import get_logger
from guardian.core.state import GuardianState
from guardian.core.types import OperationalMode, Verdict, VersionStatus
from guardian.core.version import VersionRecord
from guardian.evaluation.benchmark import BenchmarkReport, BenchmarkSuite, comparison_report
from guardian.evaluation.fitness import FitnessBreakdown, compute_fitness
from guardian.evolution.research_agent import Candidate, ResearchAgent
from guardian.experiments.dataset import Dataset, build_splits
from guardian.experiments.schemas import DatasetDescriptor, ExperimentRecord
from guardian.models.genome import summarise
from guardian.sandbox.sandbox import Sandbox, SandboxReport
from guardian.safety.kernel import KernelReport, SafetyViolation

LOGGER = get_logger("evolution.loop")


@dataclass
class TrialResult:
    """One candidate, taken end to end."""

    experiment: ExperimentRecord
    candidate: Candidate
    benchmark: BenchmarkReport | None
    red_team: RedTeamReport | None
    kernel_report: KernelReport
    sandbox_report: SandboxReport
    fitness: FitnessBreakdown | None
    decision: AuditDecision | None

    @property
    def approved(self) -> bool:
        return self.decision is not None and self.decision.approved

    def as_dict(self) -> dict[str, Any]:
        return {
            "experiment": self.experiment.as_dict(),
            "benchmark": self.benchmark.as_dict() if self.benchmark else None,
            "red_team": self.red_team.as_dict() if self.red_team else None,
            "kernel": self.kernel_report.as_dict(),
            "sandbox": self.sandbox_report.as_dict(),
            "fitness": self.fitness.as_dict() if self.fitness else None,
            "decision": self.decision.as_dict() if self.decision else None,
        }


@dataclass
class GenerationResult:
    """Everything that happened in one turn of the loop."""

    generation: int
    baseline_version: str
    trials: list[TrialResult] = field(default_factory=list)
    promoted_version: str | None = None
    deployment: CanaryResult | None = None
    weaknesses: list[dict[str, Any]] = field(default_factory=list)

    def as_dict(self) -> dict[str, Any]:
        return {
            "generation": self.generation,
            "baseline_version": self.baseline_version,
            "promoted_version": self.promoted_version,
            "weaknesses": self.weaknesses,
            "deployment": self.deployment.as_dict() if self.deployment else None,
            "trials": [trial.as_dict() for trial in self.trials],
        }


class EvolutionEngine:
    """Orchestrates the research loop under the safety kernel."""

    def __init__(self, state: GuardianState, *, splits: Mapping[str, Dataset] | None = None) -> None:
        self.state = state
        cfg = state.config
        self.splits = dict(
            splits
            or build_splits(
                seed=cfg.data.seed,
                train_size=cfg.data.train_size,
                eval_size=cfg.data.eval_size,
                holdout_size=cfg.data.holdout_size,
                noise_level=cfg.data.noise_level,
            )
        )
        self.benchmark = BenchmarkSuite(self.splits["eval"], seed=cfg.seed)
        self.research_agent = ResearchAgent(
            kernel=state.kernel,
            train=self.splits["train"],
            memory=state.memory,
            seed=cfg.seed,
            max_patches=cfg.evolution.max_patches_per_candidate,
            exploration_rate=cfg.evolution.exploration_rate,
            memory_penalty=cfg.evolution.memory_penalty,
        )
        # Independent components: distinct seeds, distinct objectives.
        self.red_team = RedTeamAgent(
            kernel=state.kernel, probe_set=self.splits["holdout"], seed=cfg.seed + 977
        )
        self.auditor = IndependentAuditor(state.kernel, lock_path=cfg.kernel_lock_path)
        self.deployer = CanaryDeployer(state.versions, seed=cfg.seed + 13)
        self.rng = random.Random(cfg.seed + 5)
        self._benchmark_cache: dict[str, BenchmarkReport] = {}

    # -- helpers ---------------------------------------------------------
    def _dataset_descriptor(self, split: str) -> dict[str, Any]:
        dataset = self.splits[split]
        return DatasetDescriptor(
            name=dataset.name,
            size=len(dataset),
            seed=dataset.seed,
            fingerprint=dataset.fingerprint(),
            split=split,
        ).as_dict()

    def benchmark_version(self, record: VersionRecord, *, force: bool = False) -> BenchmarkReport:
        """Benchmark a version inside the sandbox, caching by genome hash."""

        key = f"{record.version_id}:{record.hash[:12]}"
        if not force and key in self._benchmark_cache:
            return self._benchmark_cache[key]
        sandbox = Sandbox(mode=OperationalMode.SANDBOX)
        report = sandbox.run(self.benchmark.run, record.version_id, record.genome)
        self._benchmark_cache[key] = report
        self.state.database.record_benchmark(
            version_id=record.version_id, experiment_id=record.experiment_id, report=report.as_dict()
        )
        return report

    # -- one candidate ---------------------------------------------------
    def run_trial(
        self,
        *,
        baseline: VersionRecord,
        baseline_report: BenchmarkReport,
        candidate: Candidate,
    ) -> TrialResult:
        """Build, test, benchmark, attack, audit — for a single candidate."""

        cfg = self.state.config
        experiment = ExperimentRecord(
            parent_version=baseline.version_id,
            hypothesis=candidate.hypothesis.statement,
            hypothesis_id=candidate.hypothesis.hypothesis_id,
            seed=cfg.seed,
            changes=candidate.changes(),
            dataset={
                "train": self._dataset_descriptor("train"),
                "eval": self._dataset_descriptor("eval"),
                "holdout": self._dataset_descriptor("holdout"),
            },
        )
        experiment.compute_signature()
        candidate.hypothesis.experiment_id = experiment.experiment_id
        self.state.database.record_hypothesis(candidate.hypothesis.as_dict())

        # Memory: refuse to burn compute on a mutation already known bad.
        if self.state.memory.is_known_bad(experiment.mutation_signature):
            experiment.decision = Verdict.REJECT.value
            experiment.decision_reason = "mutation signature previously rejected (memory)"
            experiment.metrics = {"skipped": True}
            experiment.tests = {"skipped": True}
            experiment.add_risk("repeat of a previously rejected mutation", "low")
            self.state.database.record_experiment(experiment.as_dict())
            LOGGER.info(
                "skipped known-bad mutation",
                extra={"signature": experiment.mutation_signature},
            )
            return TrialResult(
                experiment=experiment,
                candidate=candidate,
                benchmark=None,
                red_team=None,
                kernel_report=KernelReport(passed=True, policy_hash=self.state.kernel.policy_hash),
                sandbox_report=SandboxReport(),
                fitness=None,
                decision=None,
            )

        # 1. Safety review of the artefact itself (two independent checks).
        kernel_report = self.state.kernel.review_candidate(
            baseline=baseline.genome,
            candidate=candidate.genome,
            patches=candidate.patches,
            lock_path=cfg.kernel_lock_path,
        )

        # 2. Sandboxed evaluation + adversarial testing.
        sandbox = Sandbox(mode=OperationalMode.SANDBOX)
        candidate_version_id = self.state.versions.next_version_id(baseline.version_id)
        experiment.candidate_version = candidate_version_id

        with sandbox.activate():
            report = self.benchmark.run(candidate_version_id, candidate.genome)
            red_team = self.red_team.attack(
                version_id=candidate_version_id,
                genome=candidate.genome,
                baseline_genome=baseline.genome,
            )

        fitness = compute_fitness(
            candidate=report,
            baseline=baseline_report,
            adversarial_score=red_team.score,
            weights=cfg.fitness,
        )

        experiment.metrics = {
            "candidate": report.as_dict(),
            "baseline": baseline_report.as_dict(),
            "comparison": comparison_report(baseline_report, report),
            "fitness": fitness.as_dict(),
            "genome": summarise(candidate.genome),
        }
        experiment.tests = {
            "benchmark_samples": report.sample_count,
            "red_team_suites": red_team.suites_run,
            "red_team_probes": red_team.probes,
            "red_team_score": round(red_team.score, 6),
            "kernel_checks": kernel_report.checks_run,
            "sandbox": sandbox.report.as_dict(),
            "structural_problems": candidate.structural_problems,
        }
        experiment.failures = [f.as_dict() for f in red_team.findings] + [
            {"suite": "safety_kernel", "severity": v["severity"], "summary": v["reason"], "detail": v}
            for v in kernel_report.violations
        ]
        experiment.fitness = fitness.total
        for finding in red_team.findings:
            if finding.severity in ("critical", "high"):
                experiment.add_risk(finding.summary, finding.severity)
        if report.safety < baseline_report.safety:
            experiment.add_risk("candidate safety score is below the incumbent", "high")

        # 3. Independent audit.  The research agent has no say here.
        decision = self.auditor.review(
            experiment=experiment,
            baseline=baseline_report,
            candidate=report,
            red_team=red_team,
            kernel_report=kernel_report,
            sandbox_report=sandbox.report.as_dict(),
        )
        experiment.decision = decision.verdict
        experiment.decision_reason = "; ".join(decision.reasons[:4])

        # 4. Persist everything before acting on it.
        self.state.database.record_experiment(experiment.as_dict())
        self.state.database.record_failures(
            experiment_id=experiment.experiment_id,
            version_id=candidate_version_id,
            failures=experiment.failures,
        )
        self.state.database.record_audit(decision.as_dict())
        self.state.database.record_benchmark(
            version_id=candidate_version_id,
            experiment_id=experiment.experiment_id,
            report=report.as_dict(),
        )

        return TrialResult(
            experiment=experiment,
            candidate=candidate,
            benchmark=report,
            red_team=red_team,
            kernel_report=kernel_report,
            sandbox_report=sandbox.report,
            fitness=fitness,
            decision=decision,
        )

    # -- one generation --------------------------------------------------
    def run_generation(self, generation: int) -> GenerationResult:
        """observe -> hypothesise -> test -> decide -> deploy."""

        state = self.state
        baseline = state.current
        baseline_report = self.benchmark_version(baseline)
        self.research_agent.observe(baseline_report)
        weaknesses = self.research_agent.identify_weaknesses(baseline_report)

        result = GenerationResult(
            generation=generation,
            baseline_version=baseline.version_id,
            weaknesses=[w.as_dict() for w in weaknesses],
        )
        if not weaknesses:
            LOGGER.info("generation skipped: no measured deficiency", extra={"generation": generation})
            return result

        population = self.research_agent.propose_population(
            baseline.genome, baseline_report, size=state.config.evolution.population_size
        )
        for candidate in population:
            try:
                trial = self.run_trial(
                    baseline=baseline, baseline_report=baseline_report, candidate=candidate
                )
            except SafetyViolation as exc:
                LOGGER.error(
                    "candidate blocked by the safety kernel",
                    extra={"reason": exc.reason, "subject": exc.subject},
                )
                continue
            result.trials.append(trial)

        approved = [t for t in result.trials if t.approved and t.fitness is not None]
        if not approved:
            LOGGER.info(
                "no candidate approved this generation",
                extra={"generation": generation, "tried": len(result.trials)},
            )
            return result

        best = max(approved, key=lambda t: t.fitness.total)  # type: ignore[union-attr]
        if best.fitness is not None and best.fitness.total <= 0:
            LOGGER.info("best approved candidate has non-positive fitness; holding")
            return result

        promoted = self._promote(baseline, best)
        result.promoted_version = promoted.version_id if promoted else None
        result.deployment = getattr(self, "_last_deployment", None)
        return result

    # -- promotion -------------------------------------------------------
    def _promote(self, baseline: VersionRecord, trial: TrialResult) -> VersionRecord | None:
        """Persist the approved candidate and run it through canary."""

        assert trial.experiment.candidate_version is not None
        record = VersionRecord(
            version_id=trial.experiment.candidate_version,
            parent_version=baseline.version_id,
            genome=trial.candidate.genome,
            status=VersionStatus.APPROVED.value,
            experiment_id=trial.experiment.experiment_id,
            metrics=trial.benchmark.as_dict() if trial.benchmark else {},
            notes=trial.candidate.hypothesis.statement,
            rollback_point=baseline.version_id,
        )
        self.state.versions.save(record)
        self.state.database.record_version(
            version_id=record.version_id,
            parent_version=baseline.version_id,
            genome_hash=record.hash,
            status=record.status,
            policy_hash=self.state.kernel.policy_hash,
            experiment_id=record.experiment_id,
            notes=record.notes,
        )

        deployment = self.deployer.deploy(
            candidate_version=record.version_id,
            candidate_genome=record.genome,
            baseline_version=baseline.version_id,
            baseline_genome=baseline.genome,
            traffic=self.splits["holdout"],
            experiment_id=trial.experiment.experiment_id,
        )
        payload = deployment.as_dict()
        payload["experiment_id"] = trial.experiment.experiment_id
        self.state.database.record_deployment(payload)
        self._last_deployment = deployment

        if not deployment.promoted:
            self.state.database.record_version(
                version_id=record.version_id,
                parent_version=baseline.version_id,
                genome_hash=record.hash,
                status=VersionStatus.ROLLED_BACK.value,
                policy_hash=self.state.kernel.policy_hash,
                experiment_id=record.experiment_id,
                notes=deployment.reason,
            )
            LOGGER.warning(
                "candidate rolled back after canary",
                extra={"version": record.version_id, "reason": deployment.reason},
            )
            return None

        self.state.database.record_version(
            version_id=record.version_id,
            parent_version=baseline.version_id,
            genome_hash=record.hash,
            status=VersionStatus.ACTIVE.value,
            policy_hash=self.state.kernel.policy_hash,
            experiment_id=record.experiment_id,
            notes=record.notes,
        )
        LOGGER.info(
            "version promoted",
            extra={
                "version": record.version_id,
                "parent": baseline.version_id,
                "fitness": round(trial.fitness.total, 4) if trial.fitness else None,
            },
        )
        return self.state.versions.load(record.version_id)

    # -- the loop --------------------------------------------------------
    def run(self, generations: int | None = None) -> list[GenerationResult]:
        """Run the continuous loop for a bounded number of generations."""

        total = generations or self.state.config.evolution.max_generations
        history: list[GenerationResult] = []
        for generation in range(1, total + 1):
            self.state.kernel.verify_integrity(self.state.config.kernel_lock_path)
            outcome = self.run_generation(generation)
            history.append(outcome)
            LOGGER.info(
                "generation complete",
                extra={
                    "generation": generation,
                    "trials": len(outcome.trials),
                    "promoted": outcome.promoted_version,
                },
            )
        return history
