"""Experiment memory, the database schema, reporting and the CLI surface."""

from __future__ import annotations

import json


import pytest

from guardian.audit.report import changes_between, evolution_report, experiment_report
from guardian.core.state import GuardianState
from guardian.dashboard.render import render_dashboard
from guardian.evolution.loop import EvolutionEngine
from guardian.experiments.dataset import build_splits, generate_dataset, perturb
from guardian.memory.database import ExperimentDatabase

EXPECTED_TABLES = {
    "experiments",
    "versions",
    "benchmarks",
    "failures",
    "hypotheses",
    "audits",
    "deployments",
}


# -- dataset --------------------------------------------------------------
def test_datasets_are_reproducible() -> None:
    a = generate_dataset("t", 200, seed=5)
    b = generate_dataset("t", 200, seed=5)
    assert a.fingerprint() == b.fingerprint()
    assert [e.features for e in a] == [e.features for e in b]


def test_different_seeds_give_different_data() -> None:
    assert generate_dataset("t", 200, seed=5).fingerprint() != generate_dataset(
        "t", 200, seed=6
    ).fingerprint()


def test_splits_are_disjoint_streams() -> None:
    splits = build_splits(seed=9, train_size=100, eval_size=100, holdout_size=100, noise_level=0.1)
    fingerprints = {name: ds.fingerprint() for name, ds in splits.items()}
    assert len(set(fingerprints.values())) == 3


def test_perturbation_preserves_labels() -> None:
    dataset = generate_dataset("t", 150, seed=7)
    noisy = perturb(dataset, seed=7)
    assert dataset.labels == noisy.labels
    assert [e.features for e in dataset] != [e.features for e in noisy]


def test_every_class_is_represented() -> None:
    counts = generate_dataset("t", 900, seed=8).class_counts()
    assert all(count > 0 for count in counts.values())


# -- database -------------------------------------------------------------
def test_schema_creates_every_required_table(tmp_path) -> None:
    db = ExperimentDatabase(tmp_path / "g.db")
    try:
        rows = db.query("SELECT name FROM sqlite_master WHERE type='table'")
        assert EXPECTED_TABLES <= {row["name"] for row in rows}
    finally:
        db.close()


def test_database_is_idempotent_on_reopen(tmp_path) -> None:
    path = tmp_path / "g.db"
    ExperimentDatabase(path).close()
    db = ExperimentDatabase(path)
    try:
        assert db.statistics()["experiments_run"] == 0
    finally:
        db.close()


# -- memory ---------------------------------------------------------------
def test_memory_flags_a_repeated_failure(engine: EvolutionEngine) -> None:
    engine.run_generation(1)
    rejected = [
        row for row in engine.state.database.experiments(50) if row["decision"] == "REJECT"
    ]
    if not rejected:
        pytest.skip("this seed produced no rejection to learn from")
    signature = rejected[0]["mutation_signature"]
    assert engine.state.memory.is_known_bad(signature)
    assert signature in engine.state.memory.known_bad_signatures()


def test_memory_does_not_blacklist_a_signature_that_once_worked(
    engine: EvolutionEngine,
) -> None:
    engine.run_generation(1)
    approved = [
        row for row in engine.state.database.experiments(50) if row["decision"] == "APPROVE"
    ]
    for row in approved:
        assert not engine.state.memory.is_known_bad(row["mutation_signature"])


def test_memory_tracks_operator_performance(engine: EvolutionEngine) -> None:
    engine.run(2)
    stats = engine.state.memory.operator_statistics()
    assert stats
    for record in stats.values():
        assert record.attempts >= 1
        assert 0.0 <= record.success_rate <= 1.0


def test_memory_summary_is_json_serialisable(engine: EvolutionEngine) -> None:
    engine.run_generation(1)
    json.dumps(engine.state.memory.summary(), default=str)


def test_benchmark_history_is_ordered(engine: EvolutionEngine) -> None:
    engine.run(2)
    history = engine.state.memory.benchmark_history()
    assert history
    assert [row["created_at"] for row in history] == sorted(
        row["created_at"] for row in history
    )


# -- reporting ------------------------------------------------------------
def test_evolution_report_answers_the_human_questions(engine: EvolutionEngine) -> None:
    engine.run_generation(1)
    text = evolution_report(engine.state)
    for heading in ("SCORES", "ACTIVITY", "EVOLUTION HISTORY", "RECENT DECISIONS"):
        assert heading in text
    assert engine.state.current.version_id in text


def test_experiment_report_explains_what_and_why(engine: EvolutionEngine) -> None:
    engine.run_generation(1)
    row = engine.state.database.experiments(1)[0]
    text = experiment_report(engine.state, row["experiment_id"])
    for heading in (
        "WHY IT WAS TRIED",
        "WHAT CHANGED",
        "WHAT WAS MEASURED",
        "WHAT WAS TESTED",
        "WHAT FAILED",
        "DECISION",
    ):
        assert heading in text
    assert row["decision"] in text


def test_experiment_report_handles_an_unknown_id(state: GuardianState) -> None:
    assert "No experiment" in experiment_report(state, "exp-does-not-exist")


def test_diff_between_versions_is_explained(engine: EvolutionEngine) -> None:
    engine.run(2)
    lineage = [v.version_id for v in engine.state.versions.lineage(engine.state.current.version_id)]
    if len(lineage) < 2:
        pytest.skip("this seed produced no promotion to diff")
    text = changes_between(engine.state, lineage[0], lineage[-1])
    assert "Changes from" in text
    assert "verdict" in text


def test_diff_rejects_an_unrelated_version(engine: EvolutionEngine) -> None:
    assert "not an ancestor" in changes_between(engine.state, "9.9", "0.1")


# -- dashboard ------------------------------------------------------------
def test_dashboard_renders_valid_html(engine: EvolutionEngine) -> None:
    engine.run_generation(1)
    html = render_dashboard(engine.state)
    assert html.startswith("<!doctype html>")
    assert html.count("<table") == html.count("</table>")
    for section in (
        "Current version",
        "Capability",
        "Safety",
        "Evolution history",
        "Experiments",
        "Deployments",
        "Rollbacks",
    ):
        assert section in html


def test_dashboard_escapes_untrusted_text(state: GuardianState) -> None:
    state.database.record_experiment(
        {
            "experiment_id": "exp-xss",
            "parent_version": "0.1",
            "hypothesis": "<script>alert('x')</script>",
            "seed": 1,
            "decision": "REJECT",
            "mutation_signature": "sig",
        }
    )
    html = render_dashboard(state)
    assert "<script>alert" not in html
    assert "&lt;script&gt;" in html


# -- cli ------------------------------------------------------------------
def test_cli_status_and_verify(tmp_path, capsys) -> None:
    from guardian.cli import main

    args = ["--data-dir", str(tmp_path / "cli")]
    assert main(args + ["status"]) == 0
    payload = json.loads(capsys.readouterr().out)
    assert payload["current_version"] == "0.1"

    assert main(args + ["verify"]) == 0
    assert "integrity: OK" in capsys.readouterr().out


def test_cli_seal_refuses_to_overwrite_without_force(tmp_path, capsys) -> None:
    from guardian.cli import main

    args = ["--data-dir", str(tmp_path / "cli")]
    main(args + ["status"])
    capsys.readouterr()
    assert main(args + ["seal"]) == 1
    assert "human-authorised" in capsys.readouterr().err
    assert main(args + ["seal", "--force"]) == 0


def test_cli_reset_requires_confirmation(tmp_path, capsys) -> None:
    from guardian.cli import main

    data_dir = tmp_path / "cli"
    args = ["--data-dir", str(data_dir)]
    main(args + ["status"])
    capsys.readouterr()
    assert main(args + ["reset"]) == 1
    assert data_dir.exists()
    assert main(args + ["reset", "--yes"]) == 0
    assert not data_dir.exists()


def test_cli_run_executes_a_generation(tmp_path, capsys) -> None:
    from guardian.cli import main

    assert main(["--data-dir", str(tmp_path / "cli"), "run", "-n", "1"]) == 0
    assert "generation 1" in capsys.readouterr().out


def test_database_is_readable_from_another_thread(engine: EvolutionEngine) -> None:
    """The dashboard serves requests on worker threads, so reads must not be
    pinned to the thread that opened the connection."""

    import threading

    engine.run_generation(1)
    results: list[object] = []

    def read() -> None:
        try:
            results.append(render_dashboard(engine.state))
        except Exception as exc:  # noqa: BLE001 - the failure is the assertion
            results.append(exc)

    worker = threading.Thread(target=read)
    worker.start()
    worker.join(timeout=30)
    assert results and isinstance(results[0], str)


def test_dashboard_server_serves_every_route(state: GuardianState) -> None:
    import json as _json
    import threading
    import urllib.request
    from http.server import ThreadingHTTPServer
    from functools import partial

    from guardian.dashboard.server import DashboardHandler

    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(DashboardHandler, state=state))
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_address[1]}"
    try:
        with urllib.request.urlopen(f"{base}/", timeout=10) as response:
            assert response.status == 200
            assert b"<!doctype html>" in response.read()[:32]
        with urllib.request.urlopen(f"{base}/api/snapshot", timeout=10) as response:
            assert _json.loads(response.read())["current_version"]
        with urllib.request.urlopen(f"{base}/healthz", timeout=10) as response:
            assert response.status == 200
        try:
            urllib.request.urlopen(f"{base}/nope", timeout=10)
        except urllib.error.HTTPError as exc:
            assert exc.code == 404
        else:  # pragma: no cover - the route must 404
            raise AssertionError("unknown route should 404")
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)
