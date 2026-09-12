"""Experimental memory.

Guardian remembers which mutations it has already tried and how they turned
out, so the research agent stops re-proposing changes that were rejected and
biases sampling toward operator families that historically worked.
"""

from __future__ import annotations

import json
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Iterable, Mapping

from guardian.core.logging import get_logger
from guardian.memory.database import ExperimentDatabase

LOGGER = get_logger("memory")

#: Decisions that make a mutation signature "known bad".
_NEGATIVE = {"REJECT", "SAFETY_BLOCKED"}


@dataclass
class OperatorStats:
    operator: str
    attempts: int = 0
    approvals: int = 0
    rejections: int = 0
    mean_fitness: float = 0.0
    _fitness_total: float = field(default=0.0, repr=False)

    @property
    def success_rate(self) -> float:
        return self.approvals / self.attempts if self.attempts else 0.0

    def observe(self, decision: str, fitness: float | None) -> None:
        self.attempts += 1
        if decision == "APPROVE":
            self.approvals += 1
        elif decision in _NEGATIVE:
            self.rejections += 1
        if fitness is not None:
            self._fitness_total += float(fitness)
            self.mean_fitness = self._fitness_total / self.attempts

    def as_dict(self) -> dict[str, Any]:
        return {
            "operator": self.operator,
            "attempts": self.attempts,
            "approvals": self.approvals,
            "rejections": self.rejections,
            "success_rate": round(self.success_rate, 4),
            "mean_fitness": round(self.mean_fitness, 6),
        }


class ExperimentMemory:
    """Read model over the experiment database."""

    def __init__(self, database: ExperimentDatabase) -> None:
        self.db = database

    # -- avoidance -------------------------------------------------------
    def known_bad_signatures(self) -> set[str]:
        rows = self.db.query(
            "SELECT DISTINCT mutation_signature FROM experiments WHERE decision IN (?, ?)",
            ("REJECT", "SAFETY_BLOCKED"),
        )
        return {row["mutation_signature"] for row in rows if row["mutation_signature"]}

    def is_known_bad(self, signature: str) -> bool:
        if not signature:
            return False
        rows = self.db.query(
            """
            SELECT decision FROM experiments
            WHERE mutation_signature = ?
            ORDER BY created_at DESC
            """,
            (signature,),
        )
        if not rows:
            return False
        decisions = [row["decision"] for row in rows]
        # A signature only becomes 'bad' if it never succeeded.
        return "APPROVE" not in decisions and any(d in _NEGATIVE for d in decisions)

    def seen_signatures(self) -> set[str]:
        rows = self.db.query("SELECT DISTINCT mutation_signature FROM experiments")
        return {row["mutation_signature"] for row in rows if row["mutation_signature"]}

    # -- guidance --------------------------------------------------------
    def operator_statistics(self) -> dict[str, OperatorStats]:
        stats: dict[str, OperatorStats] = {}
        for row in self.db.query("SELECT changes_json, decision, fitness FROM experiments"):
            try:
                changes = json.loads(row["changes_json"])
            except (TypeError, json.JSONDecodeError):  # pragma: no cover - defensive
                continue
            operators = {change.get("operator", "unknown") for change in changes}
            for operator in operators:
                stats.setdefault(operator, OperatorStats(operator=operator)).observe(
                    row["decision"], row["fitness"]
                )
        return stats

    def operator_bias(self, operators: Iterable[str], *, penalty: float = 0.5) -> dict[str, float]:
        """Sampling weights in ``[penalty, 1 + success_rate]`` per operator."""

        stats = self.operator_statistics()
        weights: dict[str, float] = {}
        for operator in operators:
            record = stats.get(operator)
            if record is None or record.attempts == 0:
                weights[operator] = 1.0
                continue
            if record.approvals == 0 and record.rejections >= 3:
                weights[operator] = penalty
            else:
                weights[operator] = 1.0 + record.success_rate
        return weights

    # -- recall ----------------------------------------------------------
    def successful_strategies(self, limit: int = 10) -> list[dict[str, Any]]:
        return self.db.query(
            """
            SELECT experiment_id, hypothesis, changes_json, fitness, candidate_version
            FROM experiments WHERE decision = 'APPROVE'
            ORDER BY fitness DESC LIMIT ?
            """,
            (limit,),
        )

    def recurring_failures(self, limit: int = 10) -> list[dict[str, Any]]:
        counts: dict[tuple[str, str], int] = defaultdict(int)
        for row in self.db.query("SELECT suite, summary FROM failures"):
            counts[(row["suite"], row["summary"])] += 1
        ordered = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)[:limit]
        return [
            {"suite": suite, "summary": summary, "occurrences": count}
            for (suite, summary), count in ordered
        ]

    def benchmark_history(self) -> list[dict[str, Any]]:
        return self.db.query(
            """
            SELECT version_id, capability, robustness, safety, efficiency,
                   reliability, created_at
            FROM benchmarks ORDER BY benchmark_id
            """
        )

    def summary(self) -> Mapping[str, Any]:
        return {
            "statistics": self.db.statistics(),
            "operators": {k: v.as_dict() for k, v in self.operator_statistics().items()},
            "known_bad_signatures": sorted(self.known_bad_signatures()),
            "recurring_failures": self.recurring_failures(5),
        }
