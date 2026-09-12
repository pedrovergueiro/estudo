"""Command line interface.

    python -m guardian.cli demo        run the full demonstration end to end
    python -m guardian.cli run -n 5    run N generations of the research loop
    python -m guardian.cli status      current version, scores, lineage
    python -m guardian.cli report      human audit report
    python -m guardian.cli explain ID  full narrative for one experiment
    python -m guardian.cli diff A B    what changed between two versions
    python -m guardian.cli benchmark   benchmark the active version
    python -m guardian.cli memory      what the system has learned so far
    python -m guardian.cli verify      verify the safety kernel seal
    python -m guardian.cli seal        re-seal the kernel (human action)
    python -m guardian.cli dashboard   serve the local dashboard
    python -m guardian.cli reset       delete the local data directory
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path
from typing import Sequence

from guardian import __version__
from guardian.audit.report import changes_between, evolution_report, experiment_report
from guardian.core.config import GuardianConfig, load_config
from guardian.core.logging import configure_logging, get_logger
from guardian.core.state import GuardianState
from guardian.evolution.loop import EvolutionEngine
from guardian.safety.kernel import SafetyViolation
from guardian.safety.policy import describe

LOGGER = get_logger("cli")


def _build_config(args: argparse.Namespace) -> GuardianConfig:
    config = load_config(args.config)
    if args.data_dir:
        config = config.with_data_dir(Path(args.data_dir))
    return config


def _open_state(args: argparse.Namespace) -> GuardianState:
    return GuardianState.bootstrap(_build_config(args))


# -- commands -------------------------------------------------------------
def cmd_run(args: argparse.Namespace) -> int:
    with _open_state(args) as state:
        engine = EvolutionEngine(state)
        history = engine.run(args.generations)
        for outcome in history:
            promoted = outcome.promoted_version or "none"
            print(
                f"generation {outcome.generation}: baseline {outcome.baseline_version}, "
                f"{len(outcome.trials)} candidates, promoted {promoted}"
            )
            for trial in outcome.trials:
                verdict = trial.decision.verdict if trial.decision else "SKIPPED (memory)"
                fitness = f"{trial.fitness.total:.4f}" if trial.fitness else "n/a"
                print(
                    f"    {trial.candidate.hypothesis.operator:<16} {verdict:<20} "
                    f"fitness={fitness}"
                )
        print()
        print(evolution_report(state, limit=10))
    return 0


def cmd_demo(args: argparse.Namespace) -> int:
    """The scripted demonstration described in the README."""

    with _open_state(args) as state:
        engine = EvolutionEngine(state)
        baseline = state.current
        report = engine.benchmark_version(baseline)
        print("=" * 78)
        print("STEP 1 — Guardian benchmarks itself")
        print("=" * 78)
        for label, value in sorted(report.per_class_f1.items()):
            print(f"    F1 {label:<14} {value:.4f}")
        print()
        print("=" * 78)
        print("STEP 2 — Guardian names its own deficiency")
        print("=" * 78)
        for weakness in engine.research_agent.identify_weaknesses(report)[:4]:
            print(f"    {weakness.description}")
            print(
                f"        goal={weakness.goal} edit_target={weakness.edit_target} "
                f"deficit={weakness.deficit:+.4f}"
            )
        print()
        print("=" * 78)
        print("STEP 3..9 — hypothesise, build, test, attack, audit, deploy")
        print("=" * 78)
        history = engine.run(args.generations)
        for outcome in history:
            print(
                f"  generation {outcome.generation}: {len(outcome.trials)} candidates, "
                f"promoted {outcome.promoted_version or 'none'}"
            )
            for trial in outcome.trials:
                verdict = trial.decision.verdict if trial.decision else "SKIPPED (memory)"
                reason = trial.decision.reasons[0][:72] if trial.decision and trial.decision.reasons else ""
                print(f"      {trial.candidate.hypothesis.operator:<16} {verdict:<20} {reason}")
        print()
        print(evolution_report(state, limit=12))
        final = engine.benchmark_version(state.current)
        print("CAPABILITY BY CLASS, BEFORE AND AFTER")
        for label in sorted(report.per_class_f1):
            before = report.per_class_f1[label]
            after = final.per_class_f1.get(label, 0.0)
            print(f"    {label:<14} {before:.4f} -> {after:.4f}  ({after - before:+.4f})")
        print()
        print(
            f"    macro capability {report.capability:.4f} -> {final.capability:.4f} "
            f"({final.capability - report.capability:+.4f})"
        )
        print(f"    safety           {report.safety:.4f} -> {final.safety:.4f}")
        print()
        print("The safety kernel was never modified:")
        print(json.dumps(describe(), indent=4))
    return 0


def cmd_status(args: argparse.Namespace) -> int:
    with _open_state(args) as state:
        print(json.dumps(state.snapshot(), indent=2, default=str))
    return 0


def cmd_report(args: argparse.Namespace) -> int:
    with _open_state(args) as state:
        print(evolution_report(state, limit=args.limit))
    return 0


def cmd_explain(args: argparse.Namespace) -> int:
    with _open_state(args) as state:
        print(experiment_report(state, args.experiment_id))
    return 0


def cmd_diff(args: argparse.Namespace) -> int:
    with _open_state(args) as state:
        print(changes_between(state, args.from_version, args.to_version))
    return 0


def cmd_benchmark(args: argparse.Namespace) -> int:
    with _open_state(args) as state:
        engine = EvolutionEngine(state)
        report = engine.benchmark_version(state.current, force=True)
        print(json.dumps(report.as_dict(), indent=2))
    return 0


def cmd_memory(args: argparse.Namespace) -> int:
    with _open_state(args) as state:
        print(json.dumps(state.memory.summary(), indent=2, default=str))
    return 0


def cmd_verify(args: argparse.Namespace) -> int:
    config = _build_config(args)
    configure_logging(config.log_level, json_output=config.log_json)
    from guardian.safety.kernel import SafetyKernel

    kernel = SafetyKernel()
    try:
        kernel.verify_integrity(config.kernel_lock_path)
    except SafetyViolation as exc:
        print(f"INTEGRITY FAILURE: {exc.reason}", file=sys.stderr)
        return 2
    print("safety kernel integrity: OK")
    print(json.dumps(describe(), indent=2))
    print(json.dumps(kernel.current_digests(), indent=2))
    return 0


def cmd_seal(args: argparse.Namespace) -> int:
    config = _build_config(args)
    config.ensure_dirs()
    from guardian.safety.kernel import SafetyKernel

    if config.kernel_lock_path.exists() and not args.force:
        print(
            "a kernel seal already exists; re-sealing is a human-authorised action.\n"
            "re-run with --force if you intend to accept the current bytes.",
            file=sys.stderr,
        )
        return 1
    lock = SafetyKernel().seal(config.kernel_lock_path)
    print(json.dumps(lock, indent=2))
    return 0


def cmd_dashboard(args: argparse.Namespace) -> int:
    from guardian.dashboard.server import serve

    with _open_state(args) as state:
        serve(state, host=args.host, port=args.port)
    return 0


def cmd_reset(args: argparse.Namespace) -> int:
    config = _build_config(args)
    if not config.data_dir.exists():
        print(f"nothing to remove at {config.data_dir}")
        return 0
    if not args.yes:
        print(
            f"this deletes every version, experiment and audit under {config.data_dir}.\n"
            "re-run with --yes to confirm.",
            file=sys.stderr,
        )
        return 1
    shutil.rmtree(config.data_dir)
    print(f"removed {config.data_dir}")
    return 0


# -- parser ---------------------------------------------------------------
def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="guardian",
        description="GUARDIAN — bounded, auditable self-improvement research prototype",
    )
    parser.add_argument("--version", action="version", version=f"guardian {__version__}")
    parser.add_argument("--config", default=None, help="path to guardian.toml")
    parser.add_argument("--data-dir", default=None, help="override the data directory")
    sub = parser.add_subparsers(dest="command", required=True)

    run = sub.add_parser("run", help="run the automated research loop")
    run.add_argument("-n", "--generations", type=int, default=None)
    run.set_defaults(func=cmd_run)

    demo = sub.add_parser("demo", help="run the full scripted demonstration")
    demo.add_argument("-n", "--generations", type=int, default=4)
    demo.set_defaults(func=cmd_demo)

    status = sub.add_parser("status", help="print the current state as JSON")
    status.set_defaults(func=cmd_status)

    report = sub.add_parser("report", help="human audit report")
    report.add_argument("--limit", type=int, default=20)
    report.set_defaults(func=cmd_report)

    explain = sub.add_parser("explain", help="full narrative for one experiment")
    explain.add_argument("experiment_id")
    explain.set_defaults(func=cmd_explain)

    diff = sub.add_parser("diff", help="what changed between two versions")
    diff.add_argument("from_version")
    diff.add_argument("to_version")
    diff.set_defaults(func=cmd_diff)

    benchmark = sub.add_parser("benchmark", help="benchmark the active version")
    benchmark.set_defaults(func=cmd_benchmark)

    memory = sub.add_parser("memory", help="what the system has learned")
    memory.set_defaults(func=cmd_memory)

    verify = sub.add_parser("verify", help="verify the safety kernel seal")
    verify.set_defaults(func=cmd_verify)

    seal = sub.add_parser("seal", help="re-seal the safety kernel (human action)")
    seal.add_argument("--force", action="store_true")
    seal.set_defaults(func=cmd_seal)

    dashboard = sub.add_parser("dashboard", help="serve the local dashboard")
    dashboard.add_argument("--host", default="127.0.0.1")
    dashboard.add_argument("--port", type=int, default=8787)
    dashboard.set_defaults(func=cmd_dashboard)

    reset = sub.add_parser("reset", help="delete the local data directory")
    reset.add_argument("--yes", action="store_true")
    reset.set_defaults(func=cmd_reset)

    return parser


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return int(args.func(args))
    except SafetyViolation as exc:
        print(f"SAFETY VIOLATION: {exc.reason} (subject: {exc.subject})", file=sys.stderr)
        return 3
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
