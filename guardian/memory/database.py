"""SQLite-backed experiment database.

Every experiment, benchmark, failure, audit and deployment is written here.
The database is the authoritative record used by the dashboard, the human
audit report and the experiment memory.
"""

from __future__ import annotations

import json
import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator, Mapping, Sequence

SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _dumps(value: Any) -> str:
    return json.dumps(value, sort_keys=True, default=str)


class ExperimentDatabase:
    """Thin, typed wrapper around the SQLite schema."""

    def __init__(self, db_path: Path | str) -> None:
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        # The dashboard serves reads from worker threads while the evolution
        # loop writes from the main one, so the connection is shared under an
        # explicit lock rather than pinned to the thread that created it.
        self._connection = sqlite3.connect(self.db_path, check_same_thread=False)
        self._connection.row_factory = sqlite3.Row
        self._lock = threading.RLock()
        self._connection.execute("PRAGMA foreign_keys = ON")
        self.initialise()

    def initialise(self) -> None:
        with self._lock:
            self._connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
            self._connection.commit()

    def close(self) -> None:
        with self._lock:
            self._connection.close()

    def __enter__(self) -> "ExperimentDatabase":
        return self

    def __exit__(self, *exc: Any) -> None:
        self.close()

    @contextmanager
    def _write(self) -> Iterator[sqlite3.Connection]:
        with self._lock:
            try:
                yield self._connection
                self._connection.commit()
            except Exception:
                self._connection.rollback()
                raise

    # -- writes ----------------------------------------------------------
    def record_version(
        self,
        *,
        version_id: str,
        parent_version: str | None,
        genome_hash: str,
        status: str,
        policy_hash: str,
        experiment_id: str | None = None,
        notes: str = "",
    ) -> None:
        with self._write() as conn:
            conn.execute(
                """
                INSERT INTO versions (version_id, parent_version, genome_hash, status,
                                      created_at, experiment_id, policy_hash, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(version_id) DO UPDATE SET
                    status=excluded.status,
                    experiment_id=COALESCE(excluded.experiment_id, versions.experiment_id),
                    notes=excluded.notes
                """,
                (
                    version_id,
                    parent_version,
                    genome_hash,
                    status,
                    utcnow(),
                    experiment_id,
                    policy_hash,
                    notes,
                ),
            )

    def record_hypothesis(self, hypothesis: Mapping[str, Any]) -> None:
        with self._write() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO hypotheses
                    (hypothesis_id, experiment_id, statement, target_metric, target_class,
                     operator, expected_effect, rationale, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    hypothesis["hypothesis_id"],
                    hypothesis.get("experiment_id"),
                    hypothesis["statement"],
                    hypothesis["target_metric"],
                    hypothesis.get("target_class"),
                    hypothesis["operator"],
                    float(hypothesis.get("expected_effect", 0.0)),
                    hypothesis.get("rationale", ""),
                    hypothesis.get("created_at", utcnow()),
                ),
            )

    def record_experiment(self, experiment: Mapping[str, Any]) -> None:
        with self._write() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO experiments
                    (experiment_id, parent_version, candidate_version, hypothesis_id,
                     hypothesis, changes_json, dataset_json, metrics_json, tests_json,
                     failures_json, risks_json, fitness, decision, decision_reason,
                     seed, mutation_signature, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    experiment["experiment_id"],
                    experiment["parent_version"],
                    experiment.get("candidate_version"),
                    experiment.get("hypothesis_id"),
                    experiment["hypothesis"],
                    _dumps(experiment.get("changes", [])),
                    _dumps(experiment.get("dataset", {})),
                    _dumps(experiment.get("metrics", {})),
                    _dumps(experiment.get("tests", {})),
                    _dumps(experiment.get("failures", [])),
                    _dumps(experiment.get("risks", [])),
                    experiment.get("fitness"),
                    experiment.get("decision", "PENDING"),
                    experiment.get("decision_reason", ""),
                    int(experiment.get("seed", 0)),
                    experiment.get("mutation_signature", ""),
                    experiment.get("created_at", utcnow()),
                ),
            )

    def record_benchmark(
        self, *, version_id: str, experiment_id: str | None, report: Mapping[str, Any]
    ) -> None:
        with self._write() as conn:
            conn.execute(
                """
                INSERT INTO benchmarks (version_id, experiment_id, capability, robustness,
                                        safety, efficiency, reliability, detail_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    version_id,
                    experiment_id,
                    float(report["capability"]),
                    float(report["robustness"]),
                    float(report["safety"]),
                    float(report["efficiency"]),
                    float(report["reliability"]),
                    _dumps(report),
                    utcnow(),
                ),
            )

    def record_failures(
        self,
        *,
        experiment_id: str | None,
        version_id: str | None,
        failures: Sequence[Mapping[str, Any]],
    ) -> None:
        if not failures:
            return
        with self._write() as conn:
            conn.executemany(
                """
                INSERT INTO failures (experiment_id, version_id, suite, severity,
                                      summary, detail_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        experiment_id,
                        version_id,
                        failure.get("suite", "unknown"),
                        failure.get("severity", "medium"),
                        failure.get("summary", ""),
                        _dumps(failure),
                        utcnow(),
                    )
                    for failure in failures
                ],
            )

    def record_audit(self, audit: Mapping[str, Any]) -> None:
        with self._write() as conn:
            conn.execute(
                """
                INSERT INTO audits (experiment_id, current_version, candidate_version,
                                    verdict, reasons_json, evidence_json, auditor_hash, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    audit["experiment_id"],
                    audit["current_version"],
                    audit.get("candidate_version"),
                    audit["verdict"],
                    _dumps(audit.get("reasons", [])),
                    _dumps(audit.get("evidence", {})),
                    audit.get("auditor_hash", ""),
                    utcnow(),
                ),
            )

    def record_deployment(self, deployment: Mapping[str, Any]) -> None:
        with self._write() as conn:
            conn.execute(
                """
                INSERT INTO deployments (experiment_id, version_id, previous_version,
                                         stage, outcome, batches_json, reason, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    deployment.get("experiment_id"),
                    deployment["version_id"],
                    deployment.get("previous_version"),
                    deployment.get("stage", "canary"),
                    deployment["outcome"],
                    _dumps(deployment.get("batches", [])),
                    deployment.get("reason", ""),
                    utcnow(),
                ),
            )

    # -- reads -----------------------------------------------------------
    def query(self, sql: str, params: Sequence[Any] = ()) -> list[dict[str, Any]]:
        with self._lock:
            cursor = self._connection.execute(sql, params)
            return [dict(row) for row in cursor.fetchall()]

    def experiments(self, limit: int = 100) -> list[dict[str, Any]]:
        return self.query(
            "SELECT * FROM experiments ORDER BY created_at DESC, rowid DESC LIMIT ?", (limit,)
        )

    def experiment(self, experiment_id: str) -> dict[str, Any] | None:
        rows = self.query(
            "SELECT * FROM experiments WHERE experiment_id = ?", (experiment_id,)
        )
        return rows[0] if rows else None

    def benchmarks(self, version_id: str | None = None) -> list[dict[str, Any]]:
        if version_id:
            return self.query(
                "SELECT * FROM benchmarks WHERE version_id = ? ORDER BY benchmark_id", (version_id,)
            )
        return self.query("SELECT * FROM benchmarks ORDER BY benchmark_id")

    def audits(self, limit: int = 100) -> list[dict[str, Any]]:
        return self.query("SELECT * FROM audits ORDER BY audit_id DESC LIMIT ?", (limit,))

    def deployments(self, limit: int = 100) -> list[dict[str, Any]]:
        return self.query(
            "SELECT * FROM deployments ORDER BY deployment_id DESC LIMIT ?", (limit,)
        )

    def failures(self, experiment_id: str | None = None) -> list[dict[str, Any]]:
        if experiment_id:
            return self.query(
                "SELECT * FROM failures WHERE experiment_id = ? ORDER BY failure_id",
                (experiment_id,),
            )
        return self.query("SELECT * FROM failures ORDER BY failure_id DESC LIMIT 200")

    def statistics(self) -> dict[str, Any]:
        def scalar(sql: str, params: Sequence[Any] = ()) -> int:
            rows = self.query(sql, params)
            return int(next(iter(rows[0].values()))) if rows else 0

        return {
            "experiments_run": scalar("SELECT COUNT(*) FROM experiments"),
            "successful_improvements": scalar(
                "SELECT COUNT(*) FROM experiments WHERE decision = 'APPROVE'"
            ),
            "rejected_improvements": scalar(
                "SELECT COUNT(*) FROM experiments WHERE decision = 'REJECT'"
            ),
            "require_more_tests": scalar(
                "SELECT COUNT(*) FROM experiments WHERE decision = 'REQUIRE_MORE_TESTS'"
            ),
            "versions": scalar("SELECT COUNT(*) FROM versions"),
            "rollback_count": scalar(
                "SELECT COUNT(*) FROM deployments WHERE outcome = 'rolled_back'"
            ),
            "critical_failures": scalar(
                "SELECT COUNT(*) FROM failures WHERE severity = 'critical'"
            ),
        }
