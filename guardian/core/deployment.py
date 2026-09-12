"""Canary deployment and automatic rollback.

An approved candidate is never promoted straight to active.  It serves a
sequence of small batches alongside the incumbent; if its error rate drifts
beyond the policy tolerance, the previous safe version is restored
immediately and the event is recorded.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Any, Mapping, Sequence

from guardian.core.logging import get_logger
from guardian.core.types import DeploymentOutcome, OperationalMode, VersionStatus
from guardian.core.version import VersionManager
from guardian.experiments.dataset import Dataset, SecurityEvent
from guardian.models.classifier import EventClassifier
from guardian.safety.policy import CanaryPolicy, DEFAULT_POLICY

LOGGER = get_logger("core.deployment")


@dataclass
class CanaryResult:
    """Outcome of a staged rollout."""

    version_id: str
    previous_version: str | None
    outcome: str
    batches: list[dict[str, Any]] = field(default_factory=list)
    reason: str = ""
    baseline_error_rate: float = 0.0

    @property
    def promoted(self) -> bool:
        return self.outcome == DeploymentOutcome.PROMOTED.value

    def as_dict(self) -> dict[str, Any]:
        return {
            "version_id": self.version_id,
            "previous_version": self.previous_version,
            "outcome": self.outcome,
            "batches": self.batches,
            "reason": self.reason,
            "baseline_error_rate": round(self.baseline_error_rate, 6),
            "stage": "canary",
        }


def _error_rate(classifier: EventClassifier, events: Sequence[SecurityEvent]) -> float:
    if not events:
        return 0.0
    wrong = sum(
        1 for event in events if classifier.predict(event).predicted != event.label
    )
    return wrong / len(events)


class CanaryDeployer:
    """Runs the staged rollout and owns the rollback decision."""

    def __init__(
        self,
        version_manager: VersionManager,
        *,
        policy: CanaryPolicy | None = None,
        seed: int = 0,
    ) -> None:
        self.versions = version_manager
        self.policy = policy or DEFAULT_POLICY.canary
        self.rng = random.Random(seed)

    def deploy(
        self,
        *,
        candidate_version: str,
        candidate_genome: Mapping[str, Any],
        baseline_version: str | None,
        baseline_genome: Mapping[str, Any],
        traffic: Dataset,
        experiment_id: str | None = None,
    ) -> CanaryResult:
        """Serve ``batches`` of traffic and promote or roll back."""

        candidate = EventClassifier(candidate_genome)
        baseline = EventClassifier(baseline_genome)
        events = list(traffic.events)
        self.rng.shuffle(events)

        # Compare the two versions *on the same batch*.  Measuring the
        # candidate's batch against a globally-averaged baseline would trip on
        # ordinary sampling noise and roll back healthy versions.
        baseline_error = _error_rate(baseline, events)
        result = CanaryResult(
            version_id=candidate_version,
            previous_version=baseline_version,
            outcome=DeploymentOutcome.IN_PROGRESS.value,
            baseline_error_rate=baseline_error,
        )

        if baseline_version is not None:
            self.versions.set_status(candidate_version, VersionStatus.CANARY)

        for index in range(self.policy.batches):
            start = index * self.policy.batch_size
            batch = events[start : start + self.policy.batch_size]
            if not batch:
                break
            observed = _error_rate(candidate, batch)
            reference = _error_rate(baseline, batch)
            # One extra mistake in the batch is within noise; more is a signal.
            tolerance = (
                reference * (1.0 + self.policy.max_relative_error_increase)
                + 1.0 / len(batch)
            )
            record = {
                "index": index,
                "size": len(batch),
                "error_rate": round(observed, 6),
                "baseline_error_rate": round(reference, 6),
                "tolerance": round(tolerance, 6),
                "mode": OperationalMode.CANARY.value,
            }
            result.batches.append(record)
            LOGGER.info(
                "canary batch served",
                extra={
                    "version": candidate_version,
                    "batch": index,
                    "error_rate": record["error_rate"],
                    "tolerance": record["tolerance"],
                },
            )
            if observed > tolerance + 1e-9:
                result.outcome = DeploymentOutcome.ROLLED_BACK.value
                result.reason = (
                    f"batch {index} error rate {observed:.4f} exceeded tolerance "
                    f"{tolerance:.4f} (same-batch baseline {reference:.4f})"
                )
                self.rollback(candidate_version, baseline_version, result.reason)
                return result

        if len(result.batches) < self.policy.min_batches_before_promotion:
            result.outcome = DeploymentOutcome.ABORTED.value
            result.reason = (
                f"only {len(result.batches)} batches of traffic available; "
                f"{self.policy.min_batches_before_promotion} required"
            )
            return result

        result.outcome = DeploymentOutcome.PROMOTED.value
        result.reason = "canary stable across all batches"
        self.versions.set_status(candidate_version, VersionStatus.ACTIVE)
        if baseline_version is not None:
            self.versions.set_status(baseline_version, VersionStatus.RETIRED)
        self.versions.set_active(candidate_version, mark_safe=True)
        LOGGER.info(
            "canary promoted to active",
            extra={"version": candidate_version, "previous": baseline_version},
        )
        return result

    def rollback(
        self, failed_version: str, safe_version: str | None, reason: str
    ) -> str | None:
        """Restore the last version known to be safe."""

        self.versions.set_status(failed_version, VersionStatus.ROLLED_BACK)
        target = safe_version or self.versions.last_safe_version_id
        if target is None:
            LOGGER.error(
                "rollback requested with no safe version on record",
                extra={"failed_version": failed_version, "reason": reason},
            )
            return None
        self.versions.set_status(target, VersionStatus.ACTIVE)
        self.versions.set_active(target, mark_safe=True)
        LOGGER.warning(
            "automatic rollback executed",
            extra={"failed_version": failed_version, "restored": target, "reason": reason},
        )
        return target
