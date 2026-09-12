"""Capability-scoped permissions.

Permissions are granted *by the kernel's policy*, never by the evolving
system.  A version starts in the sandbox with the minimum set and can only
widen after an explicit approval step, and never into a forbidden capability.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable

from guardian.core.types import OperationalMode
from guardian.safety.kernel import SafetyViolation
from guardian.safety.policy import DEFAULT_POLICY, ImmutablePolicy

#: Permissions available per operational mode, least privilege first.
MODE_PERMISSIONS: dict[OperationalMode, frozenset[str]] = {
    OperationalMode.SANDBOX: frozenset({"read_dataset", "classify", "self_report"}),
    OperationalMode.CANARY: frozenset(
        {"read_dataset", "classify", "self_report", "read_benchmark_history"}
    ),
    OperationalMode.PRODUCTION: frozenset(
        {
            "read_dataset",
            "classify",
            "self_report",
            "read_benchmark_history",
            "write_experiment_memory",
        }
    ),
    OperationalMode.HALTED: frozenset(),
}


@dataclass(frozen=True)
class PermissionSet:
    """An immutable set of granted permissions bound to a mode."""

    mode: OperationalMode
    granted: frozenset[str] = field(default_factory=frozenset)

    def allows(self, permission: str) -> bool:
        return permission in self.granted

    def require(self, permission: str) -> None:
        if not self.allows(permission):
            raise SafetyViolation(
                f"permission {permission!r} not granted in mode {self.mode.value}",
                subject="permissions",
                severity="high",
            )

    def as_dict(self) -> dict[str, object]:
        return {"mode": self.mode.value, "granted": sorted(self.granted)}


def permissions_for(
    mode: OperationalMode,
    *,
    extra: Iterable[str] = (),
    policy: ImmutablePolicy | None = None,
) -> PermissionSet:
    """Build the permission set for a mode, refusing forbidden capabilities."""

    pol = policy or DEFAULT_POLICY
    requested = set(MODE_PERMISSIONS[mode]) | set(extra)
    forbidden = requested.intersection(pol.forbidden_capabilities)
    if forbidden:
        raise SafetyViolation(
            f"refused to grant forbidden capabilities: {sorted(forbidden)}",
            subject="permissions",
        )
    return PermissionSet(mode=mode, granted=frozenset(requested))
