"""The capability genome: the only mutable part of Guardian.

Everything the evolution engine is permitted to change lives under the
``capabilities`` key.  Anything else in the genome (identity, lineage,
policy fingerprint) is protected by the safety kernel.
"""

from __future__ import annotations

import copy
import json
from typing import Any, Mapping, Sequence

from guardian.core.types import EventClass
from guardian.safety.kernel import PatchProposal, SafetyViolation
from guardian.safety.policy import DEFAULT_POLICY, is_protected_path

COMPARISONS: tuple[str, ...] = ("gte", "lte", "gt", "lt")


def seed_genome() -> dict[str, Any]:
    """The Guardian 0.1 genome.

    Deliberately incomplete: ``beaconing`` has a single, badly calibrated
    condition and no supporting detector, so the research agent has a real
    deficiency to discover rather than a synthetic one.
    """

    return {
        "identity": {
            "name": "guardian-event-classifier",
            "family": "rule-ensemble",
            "policy_hash": DEFAULT_POLICY.policy_hash,
        },
        "capabilities": {
            "granted": ["read_dataset", "classify", "self_report"],
            "decision": {
                "min_score": 0.90,
                "confidence_temperature": 1.00,
                "abstain_margin": 0.0,
            },
            "cache": {"enabled": False, "max_entries": 0},
            "detectors": [
                {
                    "id": "portscan_fanout",
                    "target_class": EventClass.PORT_SCAN.value,
                    "bias": 0.0,
                    "conditions": [
                        {"feature": "unique_ports", "op": "gte", "threshold": 18.0, "weight": 1.4},
                        {"feature": "conn_count", "op": "gte", "threshold": 30.0, "weight": 0.6},
                        {"feature": "distinct_dst_hosts", "op": "gte", "threshold": 6.0, "weight": 0.5},
                    ],
                },
                {
                    "id": "bruteforce_auth",
                    "target_class": EventClass.BRUTE_FORCE.value,
                    "bias": 0.0,
                    "conditions": [
                        {"feature": "failed_logins", "op": "gte", "threshold": 12.0, "weight": 1.5},
                        {"feature": "unique_ports", "op": "lte", "threshold": 4.0, "weight": 0.4},
                    ],
                },
                {
                    "id": "exfil_volume",
                    "target_class": EventClass.EXFILTRATION.value,
                    "bias": 0.0,
                    "conditions": [
                        {"feature": "bytes_out_kb", "op": "gte", "threshold": 2500.0, "weight": 1.5},
                        {"feature": "payload_entropy", "op": "gte", "threshold": 6.5, "weight": 0.7},
                    ],
                },
                {
                    "id": "phishing_url",
                    "target_class": EventClass.PHISHING.value,
                    "bias": 0.0,
                    "conditions": [
                        {"feature": "url_suspicion", "op": "gte", "threshold": 0.55, "weight": 1.5},
                        {"feature": "bytes_in_kb", "op": "gte", "threshold": 400.0, "weight": 0.4},
                    ],
                },
                {
                    # Known weak spot: threshold is far too permissive to
                    # separate beaconing from ordinary traffic.
                    "id": "beacon_regularity",
                    "target_class": EventClass.BEACONING.value,
                    "bias": 0.0,
                    "conditions": [
                        {"feature": "beacon_interval_cv", "op": "lte", "threshold": 0.55, "weight": 0.8}
                    ],
                },
            ],
        },
    }


def clone(genome: Mapping[str, Any]) -> dict[str, Any]:
    return copy.deepcopy(dict(genome))


def detectors(genome: Mapping[str, Any]) -> list[dict[str, Any]]:
    return list(genome.get("capabilities", {}).get("detectors", []))


def detector_ids(genome: Mapping[str, Any]) -> list[str]:
    return [d["id"] for d in detectors(genome)]


def complexity(genome: Mapping[str, Any]) -> int:
    """Number of evaluated conditions — the cost proxy for efficiency."""

    return sum(len(d.get("conditions", [])) for d in detectors(genome))


def summarise(genome: Mapping[str, Any]) -> dict[str, Any]:
    per_class: dict[str, int] = {name: 0 for name in EventClass.values()}
    for detector in detectors(genome):
        per_class[detector["target_class"]] = per_class.get(detector["target_class"], 0) + 1
    return {
        "detectors": len(detectors(genome)),
        "conditions": complexity(genome),
        "detectors_per_class": per_class,
        "decision": dict(genome.get("capabilities", {}).get("decision", {})),
        "cache_enabled": bool(
            genome.get("capabilities", {}).get("cache", {}).get("enabled", False)
        ),
    }


# -- path addressing ------------------------------------------------------
def _split(path: str) -> list[str]:
    return [part for part in path.split(".") if part != ""]


def resolve(genome: Mapping[str, Any], path: str) -> Any:
    """Read a dotted path.  List indices are plain integers."""

    node: Any = genome
    for part in _split(path):
        if isinstance(node, list):
            node = node[int(part)]
        elif isinstance(node, Mapping):
            node = node[part]
        else:
            raise KeyError(path)
    return node


def apply_patch(genome: dict[str, Any], patch: PatchProposal) -> dict[str, Any]:
    """Apply one patch to a *copy* of the genome, enforcing the boundary.

    This is the second enforcement point: even if a patch somehow reached
    here without kernel validation, a protected path is refused.
    """

    if is_protected_path(patch.path, DEFAULT_POLICY):
        raise SafetyViolation(
            f"apply_patch refused protected path: {patch.path}", subject=patch.path
        )
    if patch.op not in DEFAULT_POLICY.allowed_patch_ops:
        raise SafetyViolation(
            f"apply_patch refused operation {patch.op!r}", subject=patch.path
        )

    updated = clone(genome)
    parts = _split(patch.path)
    if not parts:
        raise SafetyViolation("apply_patch refused an empty path", subject=patch.path)

    parent: Any = updated
    for part in parts[:-1]:
        parent = parent[int(part)] if isinstance(parent, list) else parent[part]
    leaf = parts[-1]

    if isinstance(parent, list):
        index = int(leaf)
        if patch.op == "set":
            parent[index] = patch.value
        elif patch.op == "add":
            parent.insert(min(index, len(parent)), patch.value)
        else:
            del parent[index]
    elif isinstance(parent, dict):
        if patch.op == "remove":
            parent.pop(leaf, None)
        else:
            if patch.op == "set" and leaf not in parent:
                raise SafetyViolation(
                    f"'set' refused for unknown key {patch.path!r}; use 'add'",
                    subject=patch.path,
                    severity="medium",
                )
            parent[leaf] = patch.value
    else:  # pragma: no cover - defensive
        raise SafetyViolation(f"unaddressable path: {patch.path}", subject=patch.path)
    return updated


def apply_patches(
    genome: Mapping[str, Any], patches: Sequence[PatchProposal]
) -> dict[str, Any]:
    updated = clone(genome)
    for patch in patches:
        updated = apply_patch(updated, patch)
    return updated


def validate_structure(genome: Mapping[str, Any]) -> list[str]:
    """Structural sanity check.  Returns a list of problems (empty is good)."""

    problems: list[str] = []
    capabilities = genome.get("capabilities")
    if not isinstance(capabilities, Mapping):
        return ["genome has no 'capabilities' mapping"]
    decision = capabilities.get("decision", {})
    for key in ("min_score", "confidence_temperature"):
        value = decision.get(key)
        if not isinstance(value, (int, float)) or isinstance(value, bool):
            problems.append(f"decision.{key} must be numeric")
        elif value != value:
            problems.append(f"decision.{key} is NaN")
    if isinstance(decision.get("confidence_temperature"), (int, float)):
        if decision["confidence_temperature"] <= 0:
            problems.append("decision.confidence_temperature must be > 0")

    seen_ids: set[str] = set()
    known_classes = set(EventClass.values())
    for index, detector in enumerate(capabilities.get("detectors", [])):
        where = f"detectors.{index}"
        if not isinstance(detector, Mapping):
            problems.append(f"{where} is not a mapping")
            continue
        det_id = detector.get("id")
        if not isinstance(det_id, str) or not det_id:
            problems.append(f"{where}.id missing")
        elif det_id in seen_ids:
            problems.append(f"{where}.id duplicated: {det_id}")
        else:
            seen_ids.add(det_id)
        if detector.get("target_class") not in known_classes:
            # A detector aiming at a class that does not exist is exactly the
            # 'hallucinated capability' the red team looks for.
            problems.append(f"{where}.target_class unknown: {detector.get('target_class')!r}")
        conditions = detector.get("conditions", [])
        if not isinstance(conditions, list) or not conditions:
            problems.append(f"{where}.conditions must be a non-empty list")
            continue
        for c_index, condition in enumerate(conditions):
            spot = f"{where}.conditions.{c_index}"
            if not isinstance(condition, Mapping):
                problems.append(f"{spot} is not a mapping")
                continue
            from guardian.experiments.dataset import FEATURE_NAMES

            if condition.get("feature") not in FEATURE_NAMES:
                problems.append(f"{spot}.feature unknown: {condition.get('feature')!r}")
            if condition.get("op") not in COMPARISONS:
                problems.append(f"{spot}.op invalid: {condition.get('op')!r}")
            for key in ("threshold", "weight"):
                value = condition.get(key)
                if not isinstance(value, (int, float)) or isinstance(value, bool):
                    problems.append(f"{spot}.{key} must be numeric")
                elif value != value or abs(float(value)) > 1e6:
                    problems.append(f"{spot}.{key} out of range")
    return problems


def to_json(genome: Mapping[str, Any]) -> str:
    return json.dumps(genome, indent=2, sort_keys=True)
