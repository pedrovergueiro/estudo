"""HTML rendering for the local dashboard.

Pure string building against the experiment database — no template engine and
no third-party dependency, so the dashboard runs anywhere Python does.
"""

from __future__ import annotations

import html
import json
from typing import Any, Mapping, Sequence

from guardian.core.state import GuardianState

_STYLE = """
:root { color-scheme: light dark; --bg:#0f1115; --panel:#171a21; --line:#262b36;
        --text:#e6e9ef; --muted:#9aa4b2; --ok:#4ade80; --warn:#fbbf24; --bad:#f87171;
        --accent:#60a5fa; }
@media (prefers-color-scheme: light) {
  :root { --bg:#f6f7f9; --panel:#ffffff; --line:#e3e6ec; --text:#12151a; --muted:#5b6472; }
}
* { box-sizing:border-box; }
body { margin:0; background:var(--bg); color:var(--text); font:14px/1.55 ui-sans-serif,
       system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; padding:24px 16px 64px; }
.wrap { max-width:1120px; margin:0 auto; }
h1 { font-size:22px; margin:0 0 4px; letter-spacing:-.01em; }
h2 { font-size:15px; margin:28px 0 10px; color:var(--muted); text-transform:uppercase;
     letter-spacing:.08em; font-weight:600; }
.sub { color:var(--muted); margin:0 0 20px; font-variant-numeric:tabular-nums; }
.grid { display:grid; gap:12px; grid-template-columns:repeat(auto-fit,minmax(168px,1fr)); }
.card { background:var(--panel); border:1px solid var(--line); border-radius:10px; padding:14px 16px; }
.card .label { color:var(--muted); font-size:11px; text-transform:uppercase; letter-spacing:.07em; }
.card .value { font-size:26px; font-weight:650; font-variant-numeric:tabular-nums; margin-top:2px; }
.meter { height:5px; background:var(--line); border-radius:3px; margin-top:9px; overflow:hidden; }
.meter > i { display:block; height:100%; background:var(--accent); }
table { width:100%; border-collapse:collapse; background:var(--panel);
        border:1px solid var(--line); border-radius:10px; overflow:hidden; }
th, td { text-align:left; padding:8px 12px; border-bottom:1px solid var(--line); font-size:13px;
         font-variant-numeric:tabular-nums; }
th { color:var(--muted); font-weight:600; font-size:11px; text-transform:uppercase;
     letter-spacing:.06em; }
tr:last-child td { border-bottom:none; }
.scroll { overflow-x:auto; }
.tag { display:inline-block; padding:1px 8px; border-radius:999px; font-size:11px; font-weight:600; }
.APPROVE,.promoted,.active { background:rgba(74,222,128,.16); color:var(--ok); }
.REJECT,.rolled_back { background:rgba(248,113,113,.16); color:var(--bad); }
.REQUIRE_MORE_TESTS,.SAFETY_BLOCKED,.aborted { background:rgba(251,191,36,.16); color:var(--warn); }
code { font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:12px; color:var(--muted); }
.pos { color:var(--ok); } .neg { color:var(--bad); }
footer { margin-top:36px; color:var(--muted); font-size:12px; }
"""


def _esc(value: Any) -> str:
    return html.escape(str(value))


def _loads(value: Any, default: Any) -> Any:
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value) if value else default
    except (TypeError, json.JSONDecodeError):
        return default


def _card(label: str, value: Any, meter: float | None = None) -> str:
    bar = (
        f'<div class="meter"><i style="width:{max(0.0, min(1.0, meter)) * 100:.1f}%"></i></div>'
        if meter is not None
        else ""
    )
    return (
        f'<div class="card"><div class="label">{_esc(label)}</div>'
        f'<div class="value">{_esc(value)}</div>{bar}</div>'
    )


def _table(headers: Sequence[str], rows: Sequence[Sequence[str]]) -> str:
    head = "".join(f"<th>{_esc(h)}</th>" for h in headers)
    if not rows:
        body = f'<tr><td colspan="{len(headers)}"><em>no records yet</em></td></tr>'
    else:
        body = "".join("<tr>" + "".join(f"<td>{cell}</td>" for cell in row) + "</tr>" for row in rows)
    return f'<div class="scroll"><table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>'


def _score(value: Any) -> str:
    return f"{value:.4f}" if isinstance(value, (int, float)) else "n/a"


def render_dashboard(state: GuardianState) -> str:
    """Build the full dashboard page."""

    snapshot = state.snapshot()
    stats = snapshot["statistics"]
    scores = snapshot["scores"]

    cards = [
        _card("Current version", snapshot["current_version"]),
        _card("Capability", _score(scores.get("capability")), scores.get("capability")),
        _card("Safety", _score(scores.get("safety")), scores.get("safety")),
        _card("Robustness", _score(scores.get("robustness")), scores.get("robustness")),
        _card("Efficiency", _score(scores.get("efficiency")), scores.get("efficiency")),
        _card("Reliability", _score(scores.get("reliability")), scores.get("reliability")),
    ]
    activity = [
        _card("Experiments run", stats["experiments_run"]),
        _card("Successful improvements", stats["successful_improvements"]),
        _card("Rejected improvements", stats["rejected_improvements"]),
        _card("Require more tests", stats["require_more_tests"]),
        _card("Rollbacks", stats["rollback_count"]),
        _card("Critical failures found", stats["critical_failures"]),
    ]

    history_rows: list[list[str]] = []
    seen: dict[str, Mapping[str, Any]] = {}
    for row in state.memory.benchmark_history():
        seen[row["version_id"]] = row
    previous: Mapping[str, Any] | None = None
    for version_id in sorted(seen, key=lambda v: tuple(int(p) for p in v.split("."))):
        row = seen[version_id]
        if previous:
            change = row["capability"] - previous["capability"]
            css = "pos" if change >= 0 else "neg"
            delta = f'<span class="{css}">{change:+.4f}</span>'
        else:
            delta = "<code>baseline</code>"
        record = state.versions.load(version_id) if state.versions.exists(version_id) else None
        status = record.status if record else "unknown"
        history_rows.append(
            [
                f"<strong>{_esc(version_id)}</strong>",
                f'<span class="tag {_esc(status)}">{_esc(status)}</span>',
                f"{row['capability']:.4f}",
                delta,
                f"{row['safety']:.4f}",
                f"{row['robustness']:.4f}",
                f"{row['efficiency']:.4f}",
                f"{row['reliability']:.4f}",
                f"<code>{_esc(row['created_at'])}</code>",
            ]
        )

    experiment_rows = []
    for row in state.database.experiments(25):
        fitness = f"{row['fitness']:.4f}" if row["fitness"] is not None else "—"
        experiment_rows.append(
            [
                f"<code>{_esc(row['experiment_id'])}</code>",
                _esc(row["parent_version"]),
                _esc(row["candidate_version"] or "—"),
                f'<span class="tag {_esc(row["decision"])}">{_esc(row["decision"])}</span>',
                fitness,
                _esc(row["hypothesis"][:96]),
            ]
        )

    deployment_rows = [
        [
            f"<code>{_esc(row['created_at'])}</code>",
            _esc(row["version_id"]),
            _esc(row["previous_version"] or "—"),
            _esc(row["stage"]),
            f'<span class="tag {_esc(row["outcome"])}">{_esc(row["outcome"])}</span>',
            _esc(row["reason"][:70]),
        ]
        for row in state.database.deployments(15)
    ]

    failure_rows = [
        [
            _esc(row["suite"]),
            f'<span class="tag {"REJECT" if row["severity"] in ("critical", "high") else "REQUIRE_MORE_TESTS"}">{_esc(row["severity"])}</span>',
            _esc(row["version_id"] or "—"),
            _esc(row["summary"][:110]),
        ]
        for row in state.database.failures()[:15]
    ]

    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GUARDIAN — Evolution Dashboard</title>
<meta http-equiv="refresh" content="15">
<style>{_STYLE}</style></head><body><div class="wrap">
<h1>GUARDIAN</h1>
<p class="sub">Guardian {_esc(snapshot['current_version'])} &middot; mode {_esc(snapshot['mode'])}
 &middot; lineage {_esc(' → '.join(snapshot['lineage']))}
 &middot; policy <code>{_esc(snapshot['policy_hash'][:16])}</code>
 &middot; last safe <code>{_esc(snapshot['last_safe_version'])}</code></p>

<h2>Current scores</h2>
<div class="grid">{''.join(cards)}</div>

<h2>Activity</h2>
<div class="grid">{''.join(activity)}</div>

<h2>Evolution history</h2>
{_table(
    ["Version", "Status", "Capability", "Δ capability", "Safety", "Robustness",
     "Efficiency", "Reliability", "Recorded"],
    history_rows,
)}

<h2>Experiments</h2>
{_table(["Experiment", "Parent", "Candidate", "Verdict", "Fitness", "Hypothesis"], experiment_rows)}

<h2>Deployments</h2>
{_table(["When", "Version", "Previous", "Stage", "Outcome", "Reason"], deployment_rows)}

<h2>Failures found by the red team</h2>
{_table(["Suite", "Severity", "Version", "Summary"], failure_rows)}

<footer>Safety policy v{_esc(snapshot['policy_version'])} is immutable and outside the
evolution engine's address space. Page refreshes every 15 seconds.</footer>
</div></body></html>"""
