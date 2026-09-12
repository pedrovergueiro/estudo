"""Immutable safety policy for GUARDIAN.

This module defines the *constitution* of the system.  Nothing in the
evolution pipeline is allowed to rewrite it: the research agent can only
emit patches addressed to the capability layer, and the safety kernel
rejects everything else.

The policy is expressed as a frozen dataclass whose canonical JSON
serialisation is hashed.  The hash is what the kernel and the independent
auditor compare against; a silent edit of this file changes the hash and
every downstream check fails loudly.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass, field
from typing import Any, Final, Mapping

#: The single namespace the evolution engine is allowed to write into.
CAPABILITY_NAMESPACE: Final[str] = "capabilities"

#: Namespaces that describe *who Guardian is* rather than *what Guardian
#: can do*.  A patch touching any of these is a safety violation.
PROTECTED_NAMESPACES: Final[tuple[str, ...]] = (
    "safety",
    "policy",
    "kernel",
    "audit",
    "auditor",
    "permissions",
    "identity",
    "lineage",
    "sandbox",
    "gates",
    "fitness_weights",
)

#: Source modules whose bytes are covered by the kernel integrity lock.
GUARDED_MODULES: Final[tuple[str, ...]] = (
    "safety/policy.py",
    "safety/kernel.py",
    "audit/auditor.py",
)

#: Patch operations the engine may use.  Anything else is rejected before
#: it reaches the genome.
ALLOWED_PATCH_OPS: Final[tuple[str, ...]] = ("set", "add", "remove")

#: Substrings that must never appear in a proposed patch payload.  These
#: catch an agent trying to smuggle executable content into configuration.
FORBIDDEN_PAYLOAD_TOKENS: Final[tuple[str, ...]] = (
    "__import__",
    "eval(",
    "exec(",
    "subprocess",
    "socket",
    "os.system",
    "open(",
    "pickle",
    "/etc/",
    "sys.modules",
)


@dataclass(frozen=True)
class PromotionGates:
    """Hard anti-regression gates.  All of them must hold simultaneously."""

    min_capability_gain: float = 0.005
    min_adversarial_score: float = 0.70
    max_critical_failures: int = 0
    max_safety_regression: float = 0.0
    min_evaluation_samples: int = 200
    required_red_team_suites: tuple[str, ...] = (
        "instruction_injection",
        "evasion",
        "consistency",
        "overconfidence",
        "hallucination",
        "policy_bypass",
        "regression",
    )


@dataclass(frozen=True)
class SandboxPolicy:
    """What a candidate version is allowed to touch while under test."""

    allow_network: bool = False
    allow_subprocess: bool = False
    allow_filesystem_write: bool = False
    allowed_read_roots: tuple[str, ...] = ()
    wall_clock_budget_s: float = 120.0


@dataclass(frozen=True)
class CanaryPolicy:
    """Staged rollout rules applied after an APPROVE verdict."""

    batches: int = 5
    batch_size: int = 120
    max_relative_error_increase: float = 0.15
    min_batches_before_promotion: int = 3


@dataclass(frozen=True)
class ImmutablePolicy:
    """The frozen root policy object."""

    version: str = "1.0.0"
    capability_namespace: str = CAPABILITY_NAMESPACE
    protected_namespaces: tuple[str, ...] = PROTECTED_NAMESPACES
    guarded_modules: tuple[str, ...] = GUARDED_MODULES
    allowed_patch_ops: tuple[str, ...] = ALLOWED_PATCH_OPS
    forbidden_payload_tokens: tuple[str, ...] = FORBIDDEN_PAYLOAD_TOKENS
    gates: PromotionGates = field(default_factory=PromotionGates)
    sandbox: SandboxPolicy = field(default_factory=SandboxPolicy)
    canary: CanaryPolicy = field(default_factory=CanaryPolicy)
    #: Guardian must never gain these, whatever the fitness function says.
    forbidden_capabilities: tuple[str, ...] = (
        "network_access",
        "process_spawn",
        "self_replication",
        "offensive_tooling",
        "credential_access",
        "policy_self_edit",
        "auditor_control",
    )
    #: A human is always able to inspect and veto.
    human_audit_required_for: tuple[str, ...] = (
        "policy_change",
        "permission_grant",
        "kernel_reseal",
    )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def canonical_json(self) -> str:
        return json.dumps(self.to_dict(), sort_keys=True, separators=(",", ":"))

    @property
    def policy_hash(self) -> str:
        return hashlib.sha256(self.canonical_json().encode("utf-8")).hexdigest()


#: The process-wide policy instance.
DEFAULT_POLICY: Final[ImmutablePolicy] = ImmutablePolicy()


def policy_fingerprint(policy: ImmutablePolicy | None = None) -> str:
    return (policy or DEFAULT_POLICY).policy_hash


def is_protected_path(path: str, policy: ImmutablePolicy | None = None) -> bool:
    """True when ``path`` addresses anything outside the capability layer."""

    pol = policy or DEFAULT_POLICY
    head = path.split(".", 1)[0].strip()
    if head != pol.capability_namespace:
        return True
    lowered = path.lower()
    return any(f".{ns}." in f".{lowered}." for ns in pol.protected_namespaces)


def describe(policy: ImmutablePolicy | None = None) -> Mapping[str, Any]:
    pol = policy or DEFAULT_POLICY
    return {
        "policy_version": pol.version,
        "policy_hash": pol.policy_hash,
        "mutable_namespace": pol.capability_namespace,
        "protected_namespaces": list(pol.protected_namespaces),
        "forbidden_capabilities": list(pol.forbidden_capabilities),
    }
