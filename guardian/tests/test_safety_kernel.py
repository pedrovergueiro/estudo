"""The core claim: the capability layer is writable, everything else is not."""

from __future__ import annotations

import pytest

from guardian.models.genome import apply_patch, seed_genome
from guardian.safety.kernel import IntegrityError, PatchProposal, SafetyKernel, SafetyViolation
from guardian.safety.policy import DEFAULT_POLICY, is_protected_path

PROTECTED = [
    "safety.gates.min_capability_gain",
    "audit.auditor.verdict",
    "permissions.granted",
    "identity.policy_hash",
    "sandbox.allow_network",
    "capabilities.detectors.0.safety.override",
    "policy",
    "kernel.policy",
]


@pytest.mark.parametrize("path", PROTECTED)
def test_kernel_rejects_protected_paths(kernel: SafetyKernel, path: str) -> None:
    with pytest.raises(SafetyViolation):
        kernel.validate_patch(PatchProposal(path=path, op="set", value=0.0))


@pytest.mark.parametrize("path", PROTECTED)
def test_apply_patch_independently_rejects_protected_paths(path: str) -> None:
    """Second enforcement point: a patch that skipped the kernel still fails."""

    with pytest.raises(SafetyViolation):
        apply_patch(seed_genome(), PatchProposal(path=path, op="set", value=0.0))


def test_kernel_accepts_capability_paths(kernel: SafetyKernel) -> None:
    kernel.validate_patch(
        PatchProposal(path="capabilities.detectors.0.conditions.0.weight", op="set", value=1.1)
    )


def test_kernel_rejects_unknown_operations(kernel: SafetyKernel) -> None:
    with pytest.raises(SafetyViolation):
        kernel.validate_patch(PatchProposal(path="capabilities.cache.enabled", op="exec", value=1))


def test_kernel_rejects_code_like_payloads(kernel: SafetyKernel) -> None:
    for payload in ("__import__('os')", "import subprocess", "eval(1+1)", "/etc/passwd"):
        with pytest.raises(SafetyViolation):
            kernel.validate_patch(
                PatchProposal(path="capabilities.detectors.0.id", op="set", value=payload)
            )


def test_kernel_rejects_insane_numbers(kernel: SafetyKernel) -> None:
    with pytest.raises(SafetyViolation):
        kernel.validate_patch(
            PatchProposal(path="capabilities.decision.min_score", op="set", value=float("nan"))
        )
    with pytest.raises(SafetyViolation):
        kernel.validate_patch(
            PatchProposal(path="capabilities.decision.min_score", op="set", value=1e12)
        )


def test_kernel_is_immutable(kernel: SafetyKernel) -> None:
    with pytest.raises(SafetyViolation):
        kernel.policy_override = True  # type: ignore[attr-defined]
    with pytest.raises(SafetyViolation):
        del kernel._policy  # type: ignore[attr-defined]


def test_policy_object_is_frozen() -> None:
    with pytest.raises(Exception):
        DEFAULT_POLICY.version = "9.9.9"  # type: ignore[misc]


def test_applied_diff_catches_out_of_band_edits(kernel: SafetyKernel) -> None:
    """Even a genome mutated directly, without any patch, is caught."""

    baseline = seed_genome()
    tampered = seed_genome()
    tampered["identity"]["policy_hash"] = "forged"
    with pytest.raises(SafetyViolation):
        kernel.validate_genome_diff(baseline, tampered)


def test_forbidden_capability_grant_is_refused(kernel: SafetyKernel) -> None:
    baseline = seed_genome()
    rogue = seed_genome()
    rogue["capabilities"]["granted"].append("network_access")
    with pytest.raises(SafetyViolation):
        kernel.validate_genome_diff(baseline, rogue)


def test_integrity_lock_detects_tampering(kernel: SafetyKernel, tmp_path) -> None:
    lock_path = tmp_path / "kernel.lock"
    kernel.seal(lock_path)
    kernel.verify_integrity(lock_path)  # clean

    import json

    lock = json.loads(lock_path.read_text())
    lock["digests"]["safety/policy.py"] = "0" * 64
    lock_path.write_text(json.dumps(lock))
    with pytest.raises(IntegrityError):
        kernel.verify_integrity(lock_path)


def test_review_candidate_reports_rather_than_raises(kernel: SafetyKernel) -> None:
    baseline = seed_genome()
    report = kernel.review_candidate(
        baseline=baseline,
        candidate=baseline,
        patches=[PatchProposal(path="safety.gates", op="set", value=1)],
    )
    assert not report.passed
    assert report.critical_count >= 1
    assert "patch_admissibility" in report.checks_run


def test_is_protected_path_defaults_to_denying() -> None:
    assert is_protected_path("anything_else")
    assert is_protected_path("")
    assert not is_protected_path("capabilities.decision.min_score")
