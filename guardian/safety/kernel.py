"""The safety kernel: the only component with veto power over mutation.

Design contract
---------------
1. The kernel is constructed from :data:`guardian.safety.policy.DEFAULT_POLICY`
   and never exposes a setter for it.
2. Every patch produced by the evolution engine passes through
   :meth:`SafetyKernel.validate_patch` *before* it is applied, and the applied
   genome passes through :meth:`SafetyKernel.validate_genome_diff` *after*.
   Two independent checks, so a bug in one does not silently open the door.
3. The kernel hashes its own source (and the auditor's) and can prove the
   bytes have not changed since the last human-authorised seal.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable, Mapping, Sequence

from guardian.safety.policy import (
    DEFAULT_POLICY,
    ImmutablePolicy,
    is_protected_path,
)

PACKAGE_ROOT = Path(__file__).resolve().parent.parent


class SafetyViolation(Exception):
    """Raised whenever something tries to cross the capability boundary."""

    def __init__(self, reason: str, *, subject: str = "", severity: str = "critical") -> None:
        super().__init__(reason)
        self.reason = reason
        self.subject = subject
        self.severity = severity

    def as_dict(self) -> dict[str, Any]:
        return {"reason": self.reason, "subject": self.subject, "severity": self.severity}


class IntegrityError(SafetyViolation):
    """Raised when guarded source bytes no longer match the sealed lock."""


@dataclass(frozen=True)
class PatchProposal:
    """A single, addressable change to the capability layer."""

    path: str
    op: str
    value: Any = None
    rationale: str = ""
    operator: str = "unknown"

    def signature(self) -> str:
        payload = json.dumps(
            {"path": self.path, "op": self.op, "value": _jsonable(self.value)},
            sort_keys=True,
            separators=(",", ":"),
        )
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]

    def as_dict(self) -> dict[str, Any]:
        return {
            "path": self.path,
            "op": self.op,
            "value": _jsonable(self.value),
            "rationale": self.rationale,
            "operator": self.operator,
            "signature": self.signature(),
        }


def _jsonable(value: Any) -> Any:
    try:
        json.dumps(value)
        return value
    except TypeError:
        return repr(value)


@dataclass
class KernelReport:
    """Outcome of a full safety review of a candidate."""

    passed: bool
    violations: list[dict[str, Any]] = field(default_factory=list)
    checks_run: list[str] = field(default_factory=list)
    policy_hash: str = ""

    def add_violation(self, violation: SafetyViolation) -> None:
        self.passed = False
        self.violations.append(violation.as_dict())

    @property
    def critical_count(self) -> int:
        return sum(1 for v in self.violations if v["severity"] == "critical")

    def as_dict(self) -> dict[str, Any]:
        return {
            "passed": self.passed,
            "violations": self.violations,
            "checks_run": self.checks_run,
            "policy_hash": self.policy_hash,
            "critical_count": self.critical_count,
        }


class SafetyKernel:
    """Immutable-by-construction gatekeeper."""

    __slots__ = ("_policy", "_boot_digests", "_package_root")

    def __init__(
        self,
        policy: ImmutablePolicy | None = None,
        package_root: Path | None = None,
    ) -> None:
        object.__setattr__(self, "_policy", policy or DEFAULT_POLICY)
        object.__setattr__(self, "_package_root", package_root or PACKAGE_ROOT)
        object.__setattr__(self, "_boot_digests", self._compute_digests())

    # -- immutability ----------------------------------------------------
    def __setattr__(self, name: str, value: Any) -> None:  # pragma: no cover - guard
        raise SafetyViolation(
            f"the safety kernel is immutable; refused to set {name!r}",
            subject="SafetyKernel",
        )

    def __delattr__(self, name: str) -> None:  # pragma: no cover - guard
        raise SafetyViolation(
            f"the safety kernel is immutable; refused to delete {name!r}",
            subject="SafetyKernel",
        )

    @property
    def policy(self) -> ImmutablePolicy:
        return self._policy

    @property
    def policy_hash(self) -> str:
        return self._policy.policy_hash

    # -- integrity -------------------------------------------------------
    def _compute_digests(self) -> dict[str, str]:
        digests: dict[str, str] = {}
        for relative in self._policy.guarded_modules:
            target = self._package_root / relative
            if not target.exists():
                raise IntegrityError(
                    f"guarded module missing: {relative}", subject=relative
                )
            digests[relative] = hashlib.sha256(target.read_bytes()).hexdigest()
        return digests

    def current_digests(self) -> dict[str, str]:
        return dict(self._compute_digests())

    def seal(self, lock_path: Path) -> dict[str, Any]:
        """Write the integrity lock.  Explicitly a human-authorised action."""

        lock = {
            "policy_version": self._policy.version,
            "policy_hash": self.policy_hash,
            "digests": self.current_digests(),
        }
        lock_path.parent.mkdir(parents=True, exist_ok=True)
        lock_path.write_text(json.dumps(lock, indent=2, sort_keys=True), encoding="utf-8")
        return lock

    def verify_integrity(self, lock_path: Path | None = None) -> None:
        """Compare guarded bytes against boot time and against the seal."""

        live = self._compute_digests()
        for relative, digest in self._boot_digests.items():
            if live.get(relative) != digest:
                raise IntegrityError(
                    f"guarded module changed in-process: {relative}", subject=relative
                )
        if lock_path is None or not Path(lock_path).exists():
            return
        lock = json.loads(Path(lock_path).read_text(encoding="utf-8"))
        if lock.get("policy_hash") != self.policy_hash:
            raise IntegrityError(
                "policy hash differs from the sealed lock", subject="policy"
            )
        for relative, digest in lock.get("digests", {}).items():
            if live.get(relative) != digest:
                raise IntegrityError(
                    f"guarded module differs from sealed lock: {relative}",
                    subject=relative,
                )

    # -- patch validation ------------------------------------------------
    def validate_patch(self, patch: PatchProposal) -> None:
        """Raise :class:`SafetyViolation` unless the patch is admissible."""

        if patch.op not in self._policy.allowed_patch_ops:
            raise SafetyViolation(
                f"patch operation {patch.op!r} is not allowed", subject=patch.path
            )
        if not patch.path or patch.path.strip() != patch.path:
            raise SafetyViolation("patch path is empty or padded", subject=patch.path)
        if is_protected_path(patch.path, self._policy):
            raise SafetyViolation(
                f"patch targets protected namespace: {patch.path}", subject=patch.path
            )
        blob = json.dumps(
            {"path": patch.path, "value": _jsonable(patch.value)}, sort_keys=True
        )
        lowered = blob.lower()
        for token in self._policy.forbidden_payload_tokens:
            if token.lower() in lowered:
                raise SafetyViolation(
                    f"patch payload contains forbidden token {token!r}",
                    subject=patch.path,
                )
        if isinstance(patch.value, (int, float)) and not isinstance(patch.value, bool):
            if patch.value != patch.value or abs(float(patch.value)) > 1e6:
                raise SafetyViolation(
                    "patch value is NaN or out of sane numeric range",
                    subject=patch.path,
                    severity="high",
                )

    def validate_patches(self, patches: Iterable[PatchProposal]) -> None:
        for patch in patches:
            self.validate_patch(patch)

    # -- genome diff -----------------------------------------------------
    def validate_genome_diff(
        self, baseline: Mapping[str, Any], candidate: Mapping[str, Any]
    ) -> None:
        """Second, independent check performed on the *applied* result."""

        changed = sorted(_diff_paths(baseline, candidate))
        for path in changed:
            if is_protected_path(path, self._policy):
                raise SafetyViolation(
                    f"applied genome changed protected path: {path}", subject=path
                )
        declared = set(candidate.get("capabilities", {}).get("granted", []))
        forbidden = declared.intersection(self._policy.forbidden_capabilities)
        if forbidden:
            raise SafetyViolation(
                f"candidate declares forbidden capabilities: {sorted(forbidden)}",
                subject="capabilities.granted",
            )

    # -- full review -----------------------------------------------------
    def review_candidate(
        self,
        *,
        baseline: Mapping[str, Any],
        candidate: Mapping[str, Any],
        patches: Sequence[PatchProposal],
        lock_path: Path | None = None,
    ) -> KernelReport:
        report = KernelReport(passed=True, policy_hash=self.policy_hash)
        for name, check in (
            ("integrity", lambda: self.verify_integrity(lock_path)),
            ("patch_admissibility", lambda: self.validate_patches(patches)),
            ("applied_diff", lambda: self.validate_genome_diff(baseline, candidate)),
        ):
            report.checks_run.append(name)
            try:
                check()
            except SafetyViolation as exc:
                report.add_violation(exc)
        return report


def _diff_paths(
    baseline: Any, candidate: Any, prefix: str = ""
) -> list[str]:
    """Return dotted paths whose value differs between two nested structures."""

    if isinstance(baseline, Mapping) and isinstance(candidate, Mapping):
        paths: list[str] = []
        for key in set(baseline) | set(candidate):
            child = f"{prefix}.{key}" if prefix else str(key)
            if key not in baseline or key not in candidate:
                paths.append(child)
            else:
                paths.extend(_diff_paths(baseline[key], candidate[key], child))
        return paths
    if isinstance(baseline, list) and isinstance(candidate, list):
        paths = []
        for index in range(max(len(baseline), len(candidate))):
            child = f"{prefix}.{index}" if prefix else str(index)
            if index >= len(baseline) or index >= len(candidate):
                paths.append(child)
            else:
                paths.extend(_diff_paths(baseline[index], candidate[index], child))
        return paths
    return [] if baseline == candidate else [prefix]
