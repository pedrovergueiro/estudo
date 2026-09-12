"""Record schemas for hypotheses and experiments.

Every experiment must carry the full provenance required by the project
brief: id, parent, candidate, hypothesis, changes, dataset, metrics, tests,
failures, risks, decision and timestamp.  :meth:`ExperimentRecord.validate`
enforces that nothing is left blank.
"""

from __future__ import annotations

import hashlib
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Mapping, Sequence

from guardian.core.types import Verdict


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


@dataclass
class Hypothesis:
    """A falsifiable claim about how to improve a specific metric."""

    statement: str
    target_metric: str
    operator: str
    expected_effect: float
    target_class: str | None = None
    rationale: str = ""
    hypothesis_id: str = field(default_factory=lambda: new_id("hyp"))
    experiment_id: str | None = None
    created_at: str = field(default_factory=utcnow)

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class DatasetDescriptor:
    """Exactly which data an experiment saw, so it can be reproduced."""

    name: str
    size: int
    seed: int
    fingerprint: str
    split: str = "eval"

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class ExperimentRecord:
    """The full provenance of one evolution attempt."""

    parent_version: str
    hypothesis: str
    seed: int
    experiment_id: str = field(default_factory=lambda: new_id("exp"))
    candidate_version: str | None = None
    hypothesis_id: str | None = None
    changes: list[dict[str, Any]] = field(default_factory=list)
    dataset: dict[str, Any] = field(default_factory=dict)
    metrics: dict[str, Any] = field(default_factory=dict)
    tests: dict[str, Any] = field(default_factory=dict)
    failures: list[dict[str, Any]] = field(default_factory=list)
    risks: list[dict[str, Any]] = field(default_factory=list)
    fitness: float | None = None
    decision: str = "PENDING"
    decision_reason: str = ""
    mutation_signature: str = ""
    created_at: str = field(default_factory=utcnow)

    def compute_signature(self) -> str:
        """Stable identity of *what was changed*, used by experiment memory.

        The patch value is part of the identity, so memory suppresses the exact
        change that failed before rather than banning a whole operator family;
        family-level learning is handled by
        :meth:`~guardian.memory.experiment_memory.ExperimentMemory.operator_bias`.
        """

        parts = sorted(
            f"{change.get('operator', '?')}:{change.get('path', '?')}:"
            f"{change.get('op', '?')}:{change.get('signature', '')}"
            for change in self.changes
        )
        digest = hashlib.sha256("|".join(parts).encode("utf-8")).hexdigest()[:16]
        self.mutation_signature = digest
        return digest

    def add_risk(self, description: str, severity: str = "medium") -> None:
        self.risks.append({"description": description, "severity": severity})

    def validate(self) -> list[str]:
        """Return the list of missing provenance fields (empty means complete)."""

        problems: list[str] = []
        if not self.experiment_id:
            problems.append("experiment_id is empty")
        if not self.parent_version:
            problems.append("parent_version is empty")
        if not self.hypothesis:
            problems.append("hypothesis is empty")
        if not self.changes:
            problems.append("changes list is empty")
        if not self.dataset:
            problems.append("dataset descriptor is empty")
        if not self.metrics:
            problems.append("metrics are empty")
        if not self.tests:
            problems.append("tests are empty")
        if not self.mutation_signature:
            problems.append("mutation_signature was never computed")
        if self.decision not in {v.value for v in Verdict} | {"PENDING", "SAFETY_BLOCKED"}:
            problems.append(f"decision has an unknown value: {self.decision!r}")
        if not self.created_at:
            problems.append("created_at is empty")
        return problems

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


def summarise_changes(changes: Sequence[Mapping[str, Any]]) -> str:
    if not changes:
        return "(no changes)"
    return "; ".join(
        f"{change.get('operator', '?')} -> {change.get('path', '?')}" for change in changes
    )
