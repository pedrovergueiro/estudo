"""Versioning, rollback, sandboxing, permissions and memory."""

from __future__ import annotations

import socket
import subprocess

import pytest

from guardian.core.deployment import CanaryDeployer
from guardian.core.permissions import permissions_for
from guardian.core.types import DeploymentOutcome, OperationalMode, VersionStatus
from guardian.core.version import VersionManager, VersionRecord
from guardian.models.genome import seed_genome
from guardian.safety.kernel import SafetyViolation
from guardian.sandbox.sandbox import Sandbox, SandboxEscape


# -- versioning -----------------------------------------------------------
def test_versions_are_never_silently_overwritten(tmp_path) -> None:
    manager = VersionManager(tmp_path)
    manager.save(VersionRecord(version_id="0.1", parent_version=None, genome=seed_genome()))
    mutated = seed_genome()
    mutated["capabilities"]["decision"]["min_score"] = 0.1
    with pytest.raises(ValueError, match="refusing to overwrite"):
        manager.save(VersionRecord(version_id="0.1", parent_version=None, genome=mutated))


def test_identical_save_is_idempotent(tmp_path) -> None:
    manager = VersionManager(tmp_path)
    record = VersionRecord(version_id="0.1", parent_version=None, genome=seed_genome())
    manager.save(record)
    manager.save(record)
    assert len(manager.all_versions()) == 1


def test_lineage_is_ordered_from_root(tmp_path) -> None:
    manager = VersionManager(tmp_path)
    previous = None
    for index in range(1, 5):
        version_id = f"0.{index}"
        manager.save(
            VersionRecord(version_id=version_id, parent_version=previous, genome=seed_genome())
        )
        previous = version_id
    assert [v.version_id for v in manager.lineage("0.4")] == ["0.1", "0.2", "0.3", "0.4"]


def test_next_version_id_never_collides(tmp_path) -> None:
    manager = VersionManager(tmp_path)
    manager.save(VersionRecord(version_id="0.1", parent_version=None, genome=seed_genome()))
    manager.save(VersionRecord(version_id="0.2", parent_version="0.1", genome=seed_genome()))
    assert manager.next_version_id("0.1") == "0.3"


def test_genome_hash_changes_with_content(tmp_path) -> None:
    a = VersionRecord(version_id="0.1", parent_version=None, genome=seed_genome())
    mutated = seed_genome()
    mutated["capabilities"]["decision"]["min_score"] = 0.42
    b = VersionRecord(version_id="0.2", parent_version="0.1", genome=mutated)
    assert a.hash != b.hash


# -- canary / rollback ----------------------------------------------------
def _degraded_genome() -> dict:
    genome = seed_genome()
    for detector in genome["capabilities"]["detectors"]:
        for condition in detector["conditions"]:
            condition["threshold"] = 1e5 if condition["op"] in ("gte", "gt") else -1.0
    return genome


def test_canary_promotes_a_healthy_candidate(tmp_path, splits) -> None:
    manager = VersionManager(tmp_path)
    manager.save(
        VersionRecord(
            version_id="0.1", parent_version=None, genome=seed_genome(),
            status=VersionStatus.ACTIVE.value,
        )
    )
    manager.set_active("0.1", mark_safe=True)
    manager.save(VersionRecord(version_id="0.2", parent_version="0.1", genome=seed_genome()))
    result = CanaryDeployer(manager, seed=1).deploy(
        candidate_version="0.2",
        candidate_genome=seed_genome(),
        baseline_version="0.1",
        baseline_genome=seed_genome(),
        traffic=splits["holdout"],
    )
    assert result.outcome == DeploymentOutcome.PROMOTED.value
    assert manager.active_version_id == "0.2"
    assert manager.last_safe_version_id == "0.2"


def test_canary_rolls_back_a_degraded_candidate(tmp_path, splits) -> None:
    manager = VersionManager(tmp_path)
    manager.save(
        VersionRecord(
            version_id="0.1", parent_version=None, genome=seed_genome(),
            status=VersionStatus.ACTIVE.value,
        )
    )
    manager.set_active("0.1", mark_safe=True)
    manager.save(
        VersionRecord(version_id="0.2", parent_version="0.1", genome=_degraded_genome())
    )
    result = CanaryDeployer(manager, seed=1).deploy(
        candidate_version="0.2",
        candidate_genome=_degraded_genome(),
        baseline_version="0.1",
        baseline_genome=seed_genome(),
        traffic=splits["holdout"],
    )
    assert result.outcome == DeploymentOutcome.ROLLED_BACK.value
    assert manager.active_version_id == "0.1"
    assert manager.load("0.2").status == VersionStatus.ROLLED_BACK.value
    assert "exceeded tolerance" in result.reason


def test_rollback_restores_the_last_safe_version(tmp_path) -> None:
    manager = VersionManager(tmp_path)
    for version_id, parent in (("0.1", None), ("0.2", "0.1")):
        manager.save(
            VersionRecord(version_id=version_id, parent_version=parent, genome=seed_genome())
        )
    manager.set_active("0.1", mark_safe=True)
    restored = CanaryDeployer(manager).rollback("0.2", None, "unexpected behaviour")
    assert restored == "0.1"
    assert manager.active_version_id == "0.1"


# -- sandbox --------------------------------------------------------------
def test_sandbox_blocks_network_access() -> None:
    sandbox = Sandbox()
    with pytest.raises(SandboxEscape):
        sandbox.run(lambda: socket.socket())
    assert not sandbox.report.allowed
    assert sandbox.report.violations[0]["kind"] == "network"


def test_sandbox_blocks_process_spawning() -> None:
    sandbox = Sandbox()
    with pytest.raises(SandboxEscape):
        sandbox.run(lambda: subprocess.Popen(["echo", "hi"]))
    assert any(v["kind"] == "subprocess" for v in sandbox.report.violations)


def test_sandbox_blocks_filesystem_writes(tmp_path) -> None:
    sandbox = Sandbox()
    target = tmp_path / "escape.txt"
    with pytest.raises(SandboxEscape):
        sandbox.run(lambda: open(target, "w"))
    assert not target.exists()


def test_sandbox_restores_the_interpreter(tmp_path) -> None:
    original_socket, original_popen, original_open = socket.socket, subprocess.Popen, open
    sandbox = Sandbox()
    with pytest.raises(SandboxEscape):
        sandbox.run(lambda: socket.socket())
    assert socket.socket is original_socket
    assert subprocess.Popen is original_popen
    assert open is original_open
    (tmp_path / "after.txt").write_text("writing works again")


def test_sandbox_allows_pure_computation() -> None:
    sandbox = Sandbox()
    assert sandbox.run(lambda: sum(range(100))) == 4950
    assert sandbox.report.allowed


def test_sandbox_permissions_are_least_privilege() -> None:
    sandboxed = permissions_for(OperationalMode.SANDBOX)
    production = permissions_for(OperationalMode.PRODUCTION)
    assert sandboxed.granted < production.granted
    assert not sandboxed.allows("write_experiment_memory")
    with pytest.raises(SafetyViolation):
        sandboxed.require("write_experiment_memory")


def test_forbidden_capabilities_can_never_be_granted() -> None:
    with pytest.raises(SafetyViolation):
        permissions_for(OperationalMode.PRODUCTION, extra=["network_access"])
    with pytest.raises(SafetyViolation):
        permissions_for(OperationalMode.SANDBOX, extra=["policy_self_edit"])
