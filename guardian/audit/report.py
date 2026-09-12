"""Human audit interface (text form).

Answers, for any experiment: what changed, why it changed, which experiments
ran, what failed, what passed, and why the version was approved or refused.
"""

from __future__ import annotations

import json
from typing import Any, Mapping, Sequence

from guardian.core.state import GuardianState
from guardian.experiments.schemas import summarise_changes


def _loads(value: Any, default: Any) -> Any:
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value) if value else default
    except (TypeError, json.JSONDecodeError):
        return default


def _bar(value: float | None, width: int = 24) -> str:
    if value is None:
        return "n/a"
    filled = max(0, min(width, round(float(value) * width)))
    return "█" * filled + "·" * (width - filled)


def _delta(value: float) -> str:
    return f"{value:+.4f}"


def experiment_report(state: GuardianState, experiment_id: str) -> str:
    """Full narrative for a single experiment."""

    row = state.database.experiment(experiment_id)
    if row is None:
        return f"No experiment named {experiment_id!r}."

    changes = _loads(row["changes_json"], [])
    metrics = _loads(row["metrics_json"], {})
    tests = _loads(row["tests_json"], {})
    failures = _loads(row["failures_json"], [])
    risks = _loads(row["risks_json"], [])
    comparison = metrics.get("comparison", {}).get("metrics", {})

    audits = [a for a in state.database.audits(500) if a["experiment_id"] == experiment_id]
    audit = audits[0] if audits else None

    lines: list[str] = []
    lines.append("=" * 78)
    lines.append(f"EXPERIMENT {row['experiment_id']}")
    lines.append("=" * 78)
    lines.append(f"  when            {row['created_at']}")
    lines.append(f"  parent version  {row['parent_version']}")
    lines.append(f"  candidate       {row['candidate_version'] or '(not built)'}")
    lines.append(f"  seed            {row['seed']}")
    lines.append(f"  signature       {row['mutation_signature']}")
    lines.append("")
    lines.append("WHY IT WAS TRIED")
    lines.append(f"  hypothesis      {row['hypothesis']}")
    lines.append("")
    lines.append("WHAT CHANGED")
    if not changes:
        lines.append("  (nothing)")
    for change in changes:
        lines.append(f"  - [{change.get('operator')}] {change.get('op')} {change.get('path')}")
        value = change.get("value")
        if value is not None:
            rendered = json.dumps(value)
            lines.append(f"      value:     {rendered[:140]}")
        if change.get("rationale"):
            lines.append(f"      rationale: {change['rationale']}")
    lines.append("")
    lines.append("WHAT WAS MEASURED")
    if comparison:
        lines.append(f"  {'metric':<22}{'current':>10}{'candidate':>12}{'delta':>12}{'delta %':>10}")
        for name, entry in comparison.items():
            lines.append(
                f"  {name:<22}{entry['current']:>10.4f}{entry['candidate']:>12.4f}"
                f"{entry['delta']:>12.4f}{entry['delta_pct']:>9.2f}%"
            )
    else:
        lines.append("  (candidate was skipped before benchmarking)")
    lines.append("")
    lines.append("WHAT WAS TESTED")
    lines.append(f"  benchmark samples  {tests.get('benchmark_samples', 'n/a')}")
    lines.append(f"  red-team suites    {', '.join(tests.get('red_team_suites', [])) or 'none'}")
    lines.append(f"  red-team probes    {tests.get('red_team_probes', 'n/a')}")
    lines.append(f"  red-team score     {tests.get('red_team_score', 'n/a')}")
    lines.append(f"  kernel checks      {', '.join(tests.get('kernel_checks', [])) or 'none'}")
    sandbox = tests.get("sandbox", {})
    lines.append(
        f"  sandbox            {'clean' if sandbox.get('allowed', True) else 'VIOLATIONS'} "
        f"({sandbox.get('wall_clock_s', 0)}s)"
    )
    lines.append("")
    lines.append("WHAT FAILED")
    if not failures:
        lines.append("  nothing — every probe passed")
    for failure in failures:
        lines.append(
            f"  [{failure.get('severity', '?'):>8}] {failure.get('suite', '?')}: "
            f"{failure.get('summary', '')}"
        )
    if risks:
        lines.append("")
        lines.append("RISKS RECORDED")
        for risk in risks:
            lines.append(f"  [{risk.get('severity', '?'):>8}] {risk.get('description', '')}")
    lines.append("")
    lines.append("DECISION")
    lines.append(f"  verdict         {row['decision']}")
    lines.append(f"  fitness         {row['fitness'] if row['fitness'] is not None else 'n/a'}")
    if audit:
        lines.append(f"  auditor build   {audit['auditor_hash']}")
        for reason in _loads(audit["reasons_json"], []):
            lines.append(f"  - {reason}")
        gates = _loads(audit["evidence_json"], {}).get("gates", {})
        if gates:
            lines.append("")
            lines.append("  GATES")
            for gate in gates.get("gates", []):
                mark = "PASS" if gate["passed"] else "FAIL"
                lines.append(
                    f"    [{mark}] {gate['name']:<26} observed={gate['observed']} "
                    f"required={gate['required']}"
                )
    else:
        lines.append(f"  reason          {row['decision_reason']}")
    lines.append("")
    return "\n".join(lines)


def evolution_report(state: GuardianState, limit: int = 20) -> str:
    """Lineage, scoreboard and recent decisions — the human's landing page."""

    snapshot = state.snapshot()
    stats = snapshot["statistics"]
    scores = snapshot["scores"]

    lines: list[str] = []
    lines.append("=" * 78)
    lines.append("GUARDIAN — HUMAN AUDIT REPORT")
    lines.append("=" * 78)
    lines.append(f"  current version   {snapshot['current_version']} ({snapshot['status']})")
    lines.append(f"  genome hash       {snapshot['genome_hash'][:32]}")
    lines.append(f"  lineage           {' -> '.join(snapshot['lineage'])}")
    lines.append(f"  last safe version {snapshot['last_safe_version']}")
    lines.append(f"  mode              {snapshot['mode']}")
    lines.append(f"  policy            v{snapshot['policy_version']} / {snapshot['policy_hash'][:16]}")
    lines.append("")
    lines.append("SCORES")
    for name in ("capability", "robustness", "safety", "efficiency", "reliability"):
        value = scores.get(name)
        rendered = f"{value:.4f}" if isinstance(value, (int, float)) else "n/a"
        lines.append(f"  {name:<14} {rendered:>8}  {_bar(value if isinstance(value, (int, float)) else None)}")
    lines.append("")
    lines.append("ACTIVITY")
    lines.append(f"  experiments run          {stats['experiments_run']}")
    lines.append(f"  successful improvements  {stats['successful_improvements']}")
    lines.append(f"  rejected improvements    {stats['rejected_improvements']}")
    lines.append(f"  require more tests       {stats['require_more_tests']}")
    lines.append(f"  rollbacks                {stats['rollback_count']}")
    lines.append(f"  critical failures found  {stats['critical_failures']}")
    lines.append("")
    lines.append("EVOLUTION HISTORY")
    history = state.memory.benchmark_history()
    seen: dict[str, dict[str, Any]] = {}
    for row in history:
        seen[row["version_id"]] = row
    previous: dict[str, Any] | None = None
    for version_id in sorted(seen, key=lambda v: tuple(int(p) for p in v.split("."))):
        row = seen[version_id]
        marker = " *" if version_id == snapshot["current_version"] else "  "
        delta = (
            f"  (capability {_delta(row['capability'] - previous['capability'])})"
            if previous
            else ""
        )
        lines.append(
            f" {marker} {version_id:<6} capability={row['capability']:.4f} "
            f"safety={row['safety']:.4f} robustness={row['robustness']:.4f}{delta}"
        )
        previous = row
    lines.append("")
    lines.append("RECENT DECISIONS")
    lines.append(f"  {'experiment':<20}{'parent':>8}{'cand':>7}{'verdict':>20}{'fitness':>10}")
    for row in state.database.experiments(limit):
        fitness = f"{row['fitness']:.4f}" if row["fitness"] is not None else "n/a"
        lines.append(
            f"  {row['experiment_id']:<20}{row['parent_version']:>8}"
            f"{(row['candidate_version'] or '-'):>7}{row['decision']:>20}{fitness:>10}"
        )
    deployments = state.database.deployments(10)
    if deployments:
        lines.append("")
        lines.append("DEPLOYMENTS")
        for row in deployments:
            lines.append(
                f"  {row['created_at']}  {row['version_id']:<6} {row['stage']:<8} "
                f"{row['outcome']:<12} {row['reason'][:40]}"
            )
    lines.append("")
    return "\n".join(lines)


def changes_between(state: GuardianState, from_version: str, to_version: str) -> str:
    """Plain-language answer to 'what changed between these two versions?'"""

    lineage = [v.version_id for v in state.versions.lineage(to_version)]
    if from_version not in lineage:
        return f"{from_version} is not an ancestor of {to_version}."
    span = lineage[lineage.index(from_version) + 1 :]
    lines = [f"Changes from {from_version} to {to_version}:", ""]
    for version_id in span:
        record = state.versions.load(version_id)
        lines.append(f"  {version_id}  ({record.status}, parent {record.parent_version})")
        lines.append(f"    reason: {record.notes or '(none recorded)'}")
        if record.experiment_id:
            row = state.database.experiment(record.experiment_id)
            if row:
                lines.append(f"    changes: {summarise_changes(_loads(row['changes_json'], []))}")
                lines.append(f"    verdict: {row['decision']} — {row['decision_reason'][:90]}")
        lines.append("")
    return "\n".join(lines)
