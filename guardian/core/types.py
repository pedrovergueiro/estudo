"""Shared enums and value objects."""

from __future__ import annotations

from enum import Enum


class EventClass(str, Enum):
    """Classes of simulated security event Guardian must recognise."""

    BENIGN = "benign"
    PORT_SCAN = "port_scan"
    BRUTE_FORCE = "brute_force"
    EXFILTRATION = "exfiltration"
    BEACONING = "beaconing"
    PHISHING = "phishing"

    @classmethod
    def values(cls) -> list[str]:
        return [member.value for member in cls]


class Verdict(str, Enum):
    """Independent auditor decision."""

    APPROVE = "APPROVE"
    REJECT = "REJECT"
    REQUIRE_MORE_TESTS = "REQUIRE_MORE_TESTS"


class VersionStatus(str, Enum):
    CANDIDATE = "candidate"
    SANDBOXED = "sandboxed"
    APPROVED = "approved"
    CANARY = "canary"
    ACTIVE = "active"
    REJECTED = "rejected"
    ROLLED_BACK = "rolled_back"
    RETIRED = "retired"


class OperationalMode(str, Enum):
    """Where a version is allowed to run."""

    SANDBOX = "sandbox"
    CANARY = "canary"
    PRODUCTION = "production"
    HALTED = "halted"


class Severity(str, Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DeploymentOutcome(str, Enum):
    PROMOTED = "promoted"
    ROLLED_BACK = "rolled_back"
    IN_PROGRESS = "in_progress"
    ABORTED = "aborted"
