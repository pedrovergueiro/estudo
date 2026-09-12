"""Guardian's operational state — the composition root.

Holds the immutable kernel, the version lineage, the experiment database and
the current operational mode.  Components are wired here so that the
evolution engine never receives a reference to the auditor's internals and
the auditor never receives a reference to the research agent.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Mapping

from guardian.core.config import GuardianConfig, load_config
from guardian.core.logging import configure_logging, get_logger
from guardian.core.permissions import PermissionSet, permissions_for
from guardian.core.types import OperationalMode, VersionStatus
from guardian.core.version import VersionManager, VersionRecord
from guardian.memory.database import ExperimentDatabase
from guardian.memory.experiment_memory import ExperimentMemory
from guardian.models.genome import seed_genome
from guardian.safety.kernel import SafetyKernel
from guardian.safety.policy import DEFAULT_POLICY

LOGGER = get_logger("core.state")


@dataclass
class GuardianState:
    """Everything a running Guardian needs, assembled once."""

    config: GuardianConfig
    kernel: SafetyKernel
    versions: VersionManager
    database: ExperimentDatabase
    memory: ExperimentMemory
    mode: OperationalMode = OperationalMode.PRODUCTION
    permissions: PermissionSet = field(
        default_factory=lambda: permissions_for(OperationalMode.PRODUCTION)
    )

    # -- lifecycle -------------------------------------------------------
    @classmethod
    def bootstrap(
        cls,
        config: GuardianConfig | None = None,
        *,
        config_path: Path | str | None = None,
    ) -> "GuardianState":
        """Load configuration, open the stores and verify the kernel seal."""

        cfg = config or load_config(config_path)
        cfg.ensure_dirs()
        configure_logging(cfg.log_level, json_output=cfg.log_json, log_file=cfg.log_path)
        kernel = SafetyKernel()
        if not cfg.kernel_lock_path.exists():
            kernel.seal(cfg.kernel_lock_path)
            LOGGER.info(
                "sealed the safety kernel for the first time",
                extra={"lock": str(cfg.kernel_lock_path), "policy_hash": kernel.policy_hash},
            )
        kernel.verify_integrity(cfg.kernel_lock_path)
        database = ExperimentDatabase(cfg.db_path)
        state = cls(
            config=cfg,
            kernel=kernel,
            versions=VersionManager(cfg.versions_dir),
            database=database,
            memory=ExperimentMemory(database),
        )
        state.ensure_genesis()
        return state

    def close(self) -> None:
        self.database.close()

    def __enter__(self) -> "GuardianState":
        return self

    def __exit__(self, *exc: Any) -> None:
        self.close()

    # -- versions --------------------------------------------------------
    def ensure_genesis(self) -> VersionRecord:
        """Create Guardian 0.1 if the lineage is empty."""

        active = self.versions.active_version_id
        if active is not None and self.versions.exists(active):
            return self.versions.load(active)
        record = VersionRecord(
            version_id="0.1",
            parent_version=None,
            genome=seed_genome(),
            status=VersionStatus.ACTIVE.value,
            notes="genesis version",
        )
        self.versions.save(record)
        self.versions.set_active(record.version_id, mark_safe=True)
        self.database.record_version(
            version_id=record.version_id,
            parent_version=None,
            genome_hash=record.hash,
            status=record.status,
            policy_hash=self.kernel.policy_hash,
            notes=record.notes,
        )
        LOGGER.info(
            "created genesis version",
            extra={"version": record.version_id, "hash": record.hash[:12]},
        )
        return record

    @property
    def current(self) -> VersionRecord:
        active = self.versions.active_version_id
        if active is None:
            return self.ensure_genesis()
        return self.versions.load(active)

    @property
    def last_safe(self) -> VersionRecord | None:
        safe = self.versions.last_safe_version_id
        return self.versions.load(safe) if safe and self.versions.exists(safe) else None

    # -- mode ------------------------------------------------------------
    def enter_mode(self, mode: OperationalMode) -> PermissionSet:
        """Switch operational mode, re-deriving permissions from the policy."""

        self.mode = mode
        self.permissions = permissions_for(mode)
        LOGGER.info(
            "operational mode changed",
            extra={"mode": mode.value, "permissions": sorted(self.permissions.granted)},
        )
        return self.permissions

    def halt(self, reason: str) -> None:
        self.enter_mode(OperationalMode.HALTED)
        LOGGER.error("guardian halted", extra={"reason": reason})

    # -- reporting -------------------------------------------------------
    def snapshot(self) -> Mapping[str, Any]:
        """The state summary used by the CLI and the dashboard."""

        current = self.current
        history = self.memory.benchmark_history()
        latest = next(
            (row for row in reversed(history) if row["version_id"] == current.version_id),
            None,
        )
        return {
            "current_version": current.version_id,
            "genome_hash": current.hash,
            "parent_version": current.parent_version,
            "status": current.status,
            "created_at": current.created_at,
            "mode": self.mode.value,
            "permissions": sorted(self.permissions.granted),
            "policy_hash": self.kernel.policy_hash,
            "policy_version": DEFAULT_POLICY.version,
            "last_safe_version": self.versions.last_safe_version_id,
            "scores": {
                key: latest[key] if latest else None
                for key in ("capability", "robustness", "safety", "efficiency", "reliability")
            },
            "statistics": self.database.statistics(),
            "lineage": [v.version_id for v in self.versions.lineage(current.version_id)],
        }
