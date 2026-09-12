"""The research agent.

Its objective is narrow and explicit: raise Guardian's measured capability
without regressing anything else.  It has no access to the safety kernel, no
access to the auditor, and no way to address a path outside ``capabilities.*``.
It observes, names its own weaknesses, writes falsifiable hypotheses, and
turns each hypothesis into a concrete candidate genome.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Any, Mapping, Sequence

from guardian.core.logging import get_logger
from guardian.core.types import EventClass
from guardian.evaluation.benchmark import BenchmarkReport
from guardian.evolution.mutations import (
    OPERATORS,
    OPERATORS_BY_GOAL,
    MutationContext,
)
from guardian.experiments.dataset import Dataset
from guardian.experiments.schemas import Hypothesis
from guardian.memory.experiment_memory import ExperimentMemory
from guardian.models.genome import apply_patches, validate_structure
from guardian.safety.kernel import PatchProposal, SafetyKernel, SafetyViolation

LOGGER = get_logger("evolution.research_agent")

#: Capability target Guardian is asked to reach per class.
CAPABILITY_TARGET = 0.85
EFFICIENCY_TARGET = 0.55
FALSE_POSITIVE_BUDGET = 0.10


@dataclass
class Weakness:
    """A named, measured deficiency.

    ``target_class`` is the class whose *score* is deficient; ``mutation_class``
    is the class whose *detectors* have to change to fix it.  They differ
    whenever the deficiency is caused by another class leaking into this one —
    most importantly for ``benign``, which has no detectors of its own.
    """

    goal: str
    target_class: str | None
    observed: float
    target: float
    description: str
    mutation_class: str | None = None

    @property
    def edit_target(self) -> str | None:
        return self.mutation_class or self.target_class

    @property
    def deficit(self) -> float:
        return self.target - self.observed

    def as_dict(self) -> dict[str, Any]:
        return {
            "goal": self.goal,
            "target_class": self.target_class,
            "observed": round(self.observed, 6),
            "target": round(self.target, 6),
            "deficit": round(self.deficit, 6),
            "description": self.description,
            "mutation_class": self.mutation_class,
        }


@dataclass
class Candidate:
    """A proposed genome plus the reasoning that produced it."""

    hypothesis: Hypothesis
    patches: list[PatchProposal]
    genome: dict[str, Any]
    weakness: Weakness
    structural_problems: list[str] = field(default_factory=list)

    @property
    def viable(self) -> bool:
        return bool(self.patches) and not self.structural_problems

    def changes(self) -> list[dict[str, Any]]:
        return [patch.as_dict() for patch in self.patches]


class ResearchAgent:
    """Proposes improvements.  Cannot approve them."""

    def __init__(
        self,
        *,
        kernel: SafetyKernel,
        train: Dataset,
        memory: ExperimentMemory | None = None,
        seed: int = 0,
        max_patches: int = 3,
        exploration_rate: float = 0.35,
        memory_penalty: float = 0.5,
    ) -> None:
        self._kernel = kernel
        self.train = train
        self.memory = memory
        self.rng = random.Random(seed)
        self.max_patches = max(1, max_patches)
        self.exploration_rate = exploration_rate
        self.memory_penalty = memory_penalty
        self._ctx = MutationContext.build(self.rng, train)

    # -- 1. observe ------------------------------------------------------
    def observe(self, report: BenchmarkReport) -> dict[str, Any]:
        """Read the latest benchmark of the running version."""

        observation = {
            "version_id": report.version_id,
            "capability": report.capability,
            "robustness": report.robustness,
            "efficiency": report.efficiency,
            "reliability": report.reliability,
            "false_positive_rate": report.false_positive_rate,
            "false_negative_rate": report.false_negative_rate,
            "per_class_f1": dict(report.per_class_f1),
        }
        LOGGER.info(
            "observed current version",
            extra={"version": report.version_id, "capability": round(report.capability, 4)},
        )
        return observation

    # -- 2. identify weaknesses -----------------------------------------
    def identify_weaknesses(self, report: BenchmarkReport) -> list[Weakness]:
        """Rank deficiencies by how far they sit below their target."""

        weaknesses: list[Weakness] = []
        confusion = report.evaluation.get("confusion", {})
        for label in EventClass.values():
            f1 = report.per_class_f1.get(label, 0.0)
            if f1 >= CAPABILITY_TARGET:
                continue
            goal, culprit, cause = self._attribute(label, confusion)
            weaknesses.append(
                Weakness(
                    goal=goal,
                    target_class=label,
                    mutation_class=culprit,
                    observed=f1,
                    target=CAPABILITY_TARGET,
                    description=(
                        f"F1 for '{label}' is {f1:.3f}, below the {CAPABILITY_TARGET:.2f} "
                        f"objective{cause}"
                    ),
                )
            )
        if report.false_positive_rate > FALSE_POSITIVE_BUDGET:
            weaknesses.append(
                Weakness(
                    goal="false_positive",
                    target_class=EventClass.BENIGN.value,
                    observed=1.0 - report.false_positive_rate,
                    target=1.0 - FALSE_POSITIVE_BUDGET,
                    description=(
                        f"benign traffic is flagged {report.false_positive_rate:.1%} of the time"
                    ),
                )
            )
        if report.efficiency < EFFICIENCY_TARGET:
            weaknesses.append(
                Weakness(
                    goal="efficiency",
                    target_class=None,
                    observed=report.efficiency,
                    target=EFFICIENCY_TARGET,
                    description=f"efficiency score {report.efficiency:.3f} below target",
                )
            )
        if report.hallucination_rate > 0.02:
            weaknesses.append(
                Weakness(
                    goal="hallucination",
                    target_class=None,
                    observed=1.0 - report.hallucination_rate,
                    target=0.98,
                    description=(
                        f"hallucination rate {report.hallucination_rate:.3f} "
                        "(confident wrong answers)"
                    ),
                )
            )
        weaknesses.sort(key=lambda w: w.deficit, reverse=True)
        LOGGER.info(
            "identified weaknesses",
            extra={"count": len(weaknesses), "top": weaknesses[0].description if weaknesses else ""},
        )
        return weaknesses

    # -- 3. generate hypotheses -----------------------------------------
    def generate_hypotheses(
        self, weaknesses: Sequence[Weakness], count: int
    ) -> list[tuple[Hypothesis, Weakness]]:
        """Produce H1..Hn — distinct operators aimed at the real deficits."""

        if not weaknesses:
            return []
        produced: list[tuple[Hypothesis, Weakness]] = []
        used: set[tuple[str, str | None]] = set()
        attempts = 0
        while len(produced) < count and attempts < count * 6:
            attempts += 1
            weakness = self._pick_weakness(weaknesses)
            operator = self._pick_operator(weakness)
            key = (operator, weakness.edit_target)
            if key in used:
                continue
            used.add(key)
            scope = weakness.edit_target or "the whole pipeline"
            produced.append(
                (
                    Hypothesis(
                        statement=(
                            f"Applying '{operator}' to {scope} will raise "
                            f"{weakness.goal} by at least {min(0.5, max(0.01, weakness.deficit)):.3f}"
                        ),
                        target_metric=weakness.goal,
                        operator=operator,
                        expected_effect=round(min(0.5, max(0.01, weakness.deficit)), 4),
                        target_class=weakness.target_class,
                        rationale=weakness.description,
                    ),
                    weakness,
                )
            )
        return produced

    def _attribute(
        self, label: str, confusion: Mapping[str, Mapping[str, int]]
    ) -> tuple[str, str | None, str]:
        """Work out which class's detectors are responsible for a deficiency.

        A class can lose F1 two ways: its own events are absorbed by another
        class (that class over-fires), or foreign events land on it (its own
        detectors over-fire).  The fix lives in different places, so the agent
        names the culprit instead of blindly editing the deficient class.
        """

        row = confusion.get(label, {})
        leaked_out = {
            other: int(count)
            for other, count in row.items()
            if other != label and count
        }
        absorbed_in = {
            other: int(confusion.get(other, {}).get(label, 0))
            for other in confusion
            if other != label and confusion.get(other, {}).get(label, 0)
        }
        out_total, in_total = sum(leaked_out.values()), sum(absorbed_in.values())
        if not out_total and not in_total:
            return ("capability", label, "")

        if out_total >= in_total:
            culprit = max(leaked_out, key=lambda k: leaked_out[k])
            # Our events are being claimed by `culprit`, or dropped to benign.
            if culprit == EventClass.BENIGN.value:
                return (
                    "false_negative",
                    label,
                    f"; {out_total} events fall through to benign",
                )
            return (
                "false_positive",
                culprit,
                f"; {leaked_out[culprit]} events are claimed by '{culprit}'",
            )
        culprit = max(absorbed_in, key=lambda k: absorbed_in[k])
        if label == EventClass.BENIGN.value:
            # Benign has no detectors: the fix is in whatever is under-firing.
            return (
                "false_negative",
                culprit,
                f"; {absorbed_in[culprit]} '{culprit}' events are dismissed as benign",
            )
        return (
            "false_positive",
            label,
            f"; {in_total} foreign events are labelled '{label}'",
        )

    def _pick_weakness(self, weaknesses: Sequence[Weakness]) -> Weakness:
        if self.rng.random() < self.exploration_rate:
            return self.rng.choice(list(weaknesses))
        weights = [max(1e-3, w.deficit) for w in weaknesses]
        return self.rng.choices(list(weaknesses), weights=weights, k=1)[0]

    def _pick_operator(self, weakness: Weakness) -> str:
        candidates = list(OPERATORS_BY_GOAL.get(weakness.goal, tuple(OPERATORS)))
        bias = (
            self.memory.operator_bias(candidates, penalty=self.memory_penalty)
            if self.memory is not None
            else {name: 1.0 for name in candidates}
        )
        weights = [bias.get(name, 1.0) for name in candidates]
        return self.rng.choices(candidates, weights=weights, k=1)[0]

    # -- 4. create candidate --------------------------------------------
    def create_candidate(
        self,
        genome: Mapping[str, Any],
        hypothesis: Hypothesis,
        weakness: Weakness,
    ) -> Candidate | None:
        """Turn a hypothesis into patches, validated by the kernel before use."""

        target_class = weakness.edit_target or self.rng.choice(EventClass.values())
        operator = OPERATORS[hypothesis.operator]
        patches = list(operator(genome, self._ctx, target_class))

        # Optionally stack one extra, independent refinement.
        if patches and len(patches) < self.max_patches and self.rng.random() < 0.4:
            extra_name = self._pick_operator(weakness)
            if extra_name != hypothesis.operator:
                staged = apply_patches(genome, patches)
                extra = list(OPERATORS[extra_name](staged, self._ctx, target_class))
                if len(patches) + len(extra) <= self.max_patches:
                    patches.extend(extra)

        if not patches:
            LOGGER.debug(
                "operator produced no patches",
                extra={"operator": hypothesis.operator, "target_class": target_class},
            )
            return None

        try:
            # First enforcement point.  A violation here is a bug in the agent,
            # and it is recorded rather than silently swallowed.
            self._kernel.validate_patches(patches)
            candidate_genome = apply_patches(genome, patches)
        except SafetyViolation as exc:
            LOGGER.error(
                "research agent produced an inadmissible patch",
                extra={"reason": exc.reason, "subject": exc.subject},
            )
            raise

        return Candidate(
            hypothesis=hypothesis,
            patches=patches,
            genome=candidate_genome,
            weakness=weakness,
            structural_problems=validate_structure(candidate_genome),
        )

    # -- convenience -----------------------------------------------------
    def propose_population(
        self,
        genome: Mapping[str, Any],
        report: BenchmarkReport,
        *,
        size: int,
    ) -> list[Candidate]:
        """Full H1..Hn proposal round for one generation."""

        weaknesses = self.identify_weaknesses(report)
        if not weaknesses:
            LOGGER.info("no weakness above target thresholds; nothing to propose")
            return []
        population: list[Candidate] = []
        for hypothesis, weakness in self.generate_hypotheses(weaknesses, size * 2):
            if len(population) >= size:
                break
            candidate = self.create_candidate(genome, hypothesis, weakness)
            if candidate is None or not candidate.viable:
                continue
            population.append(candidate)
        LOGGER.info(
            "generated candidate population",
            extra={"requested": size, "produced": len(population)},
        )
        return population
