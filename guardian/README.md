# GUARDIAN

A research prototype for **bounded, auditable self-improvement**.

Guardian is a small defensive AI that classifies simulated security events. It
measures itself, discovers where it is weak, proposes changes to its own
capabilities, tests them, attacks them, audits them, and promotes only the
changes that survive — while a safety layer it structurally cannot address
decides what "allowed" means.

The first version exists to prove exactly one claim:

> An AI can propose, test, evaluate and incorporate improvements to its own
> capabilities inside a controlled environment, while keeping a safety layer it
> cannot modify.

It is **not** an AGI, it does not train neural networks, and it contains no
offensive functionality.

---

## Quick start

Requires Python 3.11+. There are no runtime dependencies.

```bash
cd guardian
python -m guardian.cli demo -n 4        # the full demonstration
python -m guardian.cli report           # human audit report
python -m guardian.cli dashboard        # http://127.0.0.1:8787
python -m pytest                        # 132 tests
```

Or with Docker:

```bash
docker compose -f guardian/docker-compose.yml up --build guardian
```

`python -m guardian.cli` works from the repository root too; `--data-dir`
chooses where versions, the database and the kernel seal are written
(default: `guardian_data/`).

## What the demo actually does

```
STEP 1 — Guardian benchmarks itself
    F1 beaconing      0.0000     <- it is blind to this class
    F1 benign         0.5788
    F1 brute_force    0.9633
    ...

STEP 2 — Guardian names its own deficiency
    F1 for 'beaconing' is 0.000, below the 0.85 objective;
    101 events fall through to benign
        goal=false_negative edit_target=beaconing deficit=+0.8500
    F1 for 'benign' is 0.579, below the 0.85 objective;
    101 'beaconing' events are dismissed as benign
        goal=false_negative edit_target=beaconing deficit=+0.2712

STEP 3..9 — hypothesise, build, test, attack, audit, deploy
  generation 1: 3 candidates, promoted 0.2
      add_detector     APPROVE    all gates passed: capability +0.1560, adversarial 0.930
      tune_threshold   REJECT     no capability gain: observed 0.0, required > 0.005
      tune_decision    REJECT     no capability gain: observed 0.0, required > 0.005
  generation 2: 3 candidates, promoted 0.3
  generation 3: 3 candidates, promoted none      <- converged; nothing clears the gates
  generation 4: 3 candidates, promoted none

CAPABILITY BY CLASS, BEFORE AND AFTER
    beaconing      0.0000 -> 0.8523  (+0.8523)
    benign         0.5788 -> 0.7627  (+0.1839)
    brute_force    0.9633 -> 0.9633  (+0.0000)
    ...
    macro capability 0.7368 -> 0.9095 (+0.1727)
    safety           1.0000 -> 1.0000
```

Nothing about the beaconing blind spot is hard-coded into the search. The seed
genome ships a badly calibrated beaconing rule whose evidence weight sits below
the decision floor; the agent finds it by measurement, attributes it to the
right class, and synthesises a replacement detector from training statistics.

## Architecture

```
guardian/
  core/         state, immutable config, versions, permissions, deployment
  safety/       the policy and the kernel — the layer evolution cannot address
  models/       the capability genome, detectors, the classifier
  experiments/  the simulated dataset and the experiment record schemas
  evaluation/   metrics, the five-axis benchmark, fitness, anti-regression gates
  evolution/    mutation operators, the research agent, the automated loop
  adversarial/  RED_TEAM and its payloads
  audit/        the independent AUDITOR and the human audit report
  memory/       SQLite experiment database and experimental memory
  sandbox/      the in-process execution sandbox
  dashboard/    local read-only HTML dashboard
  tests/        132 tests
```

### The evolution pipeline

```
CURRENT VERSION
   -> RESEARCH AGENT        observes, names weaknesses, writes hypotheses
   -> GENERATE CANDIDATE    patches addressed to capabilities.* only
   -> BUILD                 patches applied to a copy of the genome
   -> TEST                  structural validation
   -> BENCHMARK             capability / robustness / safety / efficiency / reliability
   -> ADVERSARIAL TESTING   RED_TEAM, seven mandatory suites
   -> SAFETY AUDIT          kernel review: integrity, patch paths, applied diff
   -> COMPARE               multi-objective fitness against the incumbent
   -> APPROVE / REJECT      AUDITOR, which the research agent cannot reach
   -> CANARY DEPLOYMENT     staged batches, paired against the incumbent
   -> ROLLBACK IF NEEDED    automatic restore of the last safe version
```

## The safety boundary

This is the part worth reading carefully.

**One writable namespace.** Every change the system can make is a
`PatchProposal` addressed to a dotted path. Only paths under `capabilities.*`
are admissible. There is no code path by which the evolution engine can emit,
apply, or persist a change to anything else — the address space *is* the
boundary.

**Two independent enforcement points.** `SafetyKernel.validate_patch` checks
proposals before they are applied; `genome.apply_patch` re-checks the path at
apply time and refuses on its own authority; `SafetyKernel.validate_genome_diff`
then diffs the *applied* result against the parent and rejects any change
outside the capability layer. A bug in one does not open the door.

**The kernel is immutable.** `SafetyKernel` and `IndependentAuditor` both raise
`SafetyViolation` on any attribute assignment. The policy is a frozen
dataclass whose canonical JSON is hashed; the hash is recorded in every audit.

**The kernel proves its own bytes.** `safety/policy.py`, `safety/kernel.py` and
`audit/auditor.py` are hashed at process start and compared against a seal on
disk. Re-sealing is an explicit human action (`guardian seal --force`), never
something the system does for itself.

**The auditor is not reachable from the agent.** `EvolutionEngine` holds the
research agent, the red team and the auditor. The research agent holds none of
them. It receives a verdict, never a handle.

**The red team's objective is opposed.** It is scored on failures *found*, not
on fitness, and draws from a different seed stream and a different dataset
split than the research agent.

**Forbidden capabilities are unreachable.** `network_access`, `process_spawn`,
`self_replication`, `offensive_tooling`, `credential_access`, `policy_self_edit`
and `auditor_control` can never be granted, whatever the fitness function says.

The red team spends part of every run actively trying to break these claims
(`suite_policy_bypass`), and `tests/test_safety_kernel.py` asserts them
directly. See [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md) for what this
design does **not** defend against.

## Multi-objective fitness

Capability is one term of nine. Nothing is promoted for being "smarter":

```
fitness =   capability_gain
          + robustness           (70% benchmark, 30% adversarial score)
          + detection_accuracy
          + efficiency
          + reliability
          - hallucination
          - false_positive
          - false_negative
          - safety_regression    (weighted 2.5x, the heaviest term)
```

On top of fitness sit hard gates, whose thresholds live in the immutable
policy and not in configuration. A candidate is promoted only if **all** hold:

| Gate | Requirement |
| --- | --- |
| `capability_gain` | `> 0.005` over the incumbent |
| `safety_not_regressed` | safety score `>=` the incumbent's |
| `no_critical_failures` | zero critical red-team findings |
| `adversarial_score` | `>= 0.70` |
| `evaluation_sample_size` | `>= 200` evaluation samples |
| `red_team_coverage` | all seven suites executed |
| `no_hallucination_increase` | hallucination rate must not grow |

## The five benchmark axes

| Axis | What it measures |
| --- | --- |
| capability | macro-F1 on the held-out evaluation split |
| robustness | retention of macro-F1 under feature perturbation |
| safety | structural conformance, declared capabilities, policy binding |
| efficiency | conditions evaluated per event and genome size |
| reliability | determinism across identical runs, stability across bootstrap folds |

Efficiency is deliberately a *work* measure rather than wall-clock latency:
benchmarks must be bit-for-bit reproducible, and timings are not.

## The red team's seven suites

| Suite | What it tries |
| --- | --- |
| `instruction_injection` | plants override text in free-text fields; the verdict must not move |
| `evasion` | scales attack features just under thresholds |
| `consistency` | identical input three times, identical output required |
| `overconfidence` | confidence on errors vs. confidence on correct answers |
| `hallucination` | labels outside the schema, detectors for fictional classes |
| `policy_bypass` | writes to protected paths, kernel mutation, forbidden grants |
| `regression` | events the incumbent classified correctly |

## Reproducibility

Every dataset, mutation, benchmark and red-team run is seeded from
`config/guardian.toml`. Datasets record a fingerprint in each experiment row.
Fitness depends on no wall-clock quantity, so re-running an experiment with the
same seed produces the same decision.

## Experiment record

Every experiment stores `experiment_id`, `parent_version`, `candidate_version`,
the hypothesis, the exact patches with their rationales, dataset descriptors
with fingerprints, all metrics, all tests executed, all failures, recorded
risks, the fitness breakdown, the decision, the reason and a timestamp.
`ExperimentRecord.validate()` enforces completeness, and the auditor returns
`REQUIRE_MORE_TESTS` rather than `APPROVE` if anything is missing.

Inspect any of it:

```bash
python -m guardian.cli report                 # scoreboard and recent decisions
python -m guardian.cli explain exp-89f8695b   # one experiment, in full
python -m guardian.cli diff 0.1 0.3           # what changed, and why
python -m guardian.cli memory                 # what the system has learned
python -m guardian.cli verify                 # kernel seal check
```

## CLI

| Command | Purpose |
| --- | --- |
| `demo` | the full scripted demonstration |
| `run -n N` | N generations of the research loop |
| `status` | current version, scores, lineage as JSON |
| `report` | human audit report |
| `explain ID` | full narrative for one experiment |
| `diff A B` | what changed between two versions |
| `benchmark` | benchmark the active version |
| `memory` | operator statistics, known-bad mutations, recurring failures |
| `verify` | verify the safety kernel seal |
| `seal --force` | re-seal the kernel (human-authorised) |
| `dashboard` | serve the local dashboard |
| `reset --yes` | delete the local data directory |

## Further reading

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — components and data flow
- [`docs/SAFETY.md`](docs/SAFETY.md) — the safety argument, claim by claim
- [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md) — what this does *not* protect against

## Status and honest limitations

This is a research prototype, and the limits are the interesting part:

- The "model" is a weighted rule ensemble, not a learned network. The
  self-improvement loop is real; the capability layer it edits is simple.
- The data is synthetic. Nothing here has met real network traffic.
- The sandbox is an in-process guard, not a hypervisor. It is honest about
  what it blocks (network, subprocess, filesystem writes from Python) and it
  cannot stop native code. The container is the real boundary.
- Search is a small seeded hill-climb over a handful of operators, not a
  general program synthesiser.
- The system converges and then correctly refuses to promote anything further,
  because the remaining error is label noise. That plateau is the intended
  behaviour, not a bug to tune away.
