# Threat model

## Scope

Guardian is a **research prototype** studying whether a system can improve its
own capabilities under constraints it cannot relax. It is not a production
security product and not a containment solution for a capable adversarial
agent.

## What is defended against

| Threat | Defence |
| --- | --- |
| The evolution engine rewrites its own safety rules | Address-space boundary + three independent checks |
| A candidate grants itself new powers | `forbidden_capabilities`, checked on grant and on genome diff |
| A candidate is promoted for looking smarter while getting less safe | Multi-objective fitness + seven hard gates |
| A candidate regresses behaviour that used to work | Red-team regression suite + paired canary + automatic rollback |
| Text in the analysed data steers the classifier | The classifier reads only numeric features; verified adversarially every run |
| A candidate reaches the network or the OS during evaluation | In-process sandbox; violations reach the auditor |
| Safety source is edited | Integrity seal over kernel, policy and auditor |
| A version is silently replaced | Append-only version store, hash-checked |
| Compute is burned repeating known-bad changes | Experiment memory (signature suppression + operator bias) |
| Decisions cannot be reconstructed later | Full provenance in SQLite, enforced before approval |

## What is NOT defended against

Stated plainly, because a safety argument that overclaims is worse than none.

**Native code escape.** The sandbox interposes on Python-level entry points.
A C extension, `ctypes`, or a direct syscall bypasses it entirely. The
container (`network_mode: none`, `read_only`, `cap_drop: ALL`) is the real
boundary; the in-process guard is defence in depth and an audit signal.

**A genuinely capable adversarial agent.** The research agent here is a seeded
hill-climb over seven fixed operators. It cannot write code, reason about its
own source, or plan around its constraints. None of this design has been tested
against something that can, and passing these checks says nothing about
whether it would hold against one.

**An attacker with filesystem access.** Anyone who can edit
`guardian/safety/policy.py` *and* run `guardian seal --force` has changed the
constitution. The seal detects tampering; it does not prevent it. Detection
assumes the lock file and the source are not modified together by the same
actor.

**A compromised Python interpreter or dependency chain.** The runtime has zero
third-party dependencies specifically to keep this surface small, but the
interpreter itself is trusted.

**Reward hacking of the benchmark.** The fitness function and the benchmark are
fixed and outside the mutable namespace, so the agent cannot edit them — but a
sufficiently clever capability change could still exploit an artefact of the
synthetic data generator rather than learning anything real. The red team's
evasion and regression suites narrow this; they do not close it.

**Real-world detection quality.** The data is synthetic and generated from
known distributions. Performance here implies nothing about real telemetry.

**Multi-version or concurrent operation.** One version is active at a time and
the loop is single-threaded. There is no story for concurrent evolution,
distributed deployment, or two Guardians interacting.

## Residual risks worth naming

1. **The seal has a bootstrap problem.** The first seal records whatever bytes
   are present. It proves *no change since sealing*, not *correct at sealing*.
2. **Gates are thresholds, and thresholds are judgement calls.** A
   `min_capability_gain` of 0.005 is a choice, not a derivation.
3. **The red team is a fixed suite.** It finds the failures it was written to
   find. A real red team writes new probes when the target changes; this one
   does not.
4. **The auditor shares a process with what it audits.** Independence here is
   structural (no reference, no setter, integrity-checked source), not
   physical. A real deployment would run it out of process, ideally on
   different hardware under different ownership.

## Explicitly out of scope

No offensive functionality is implemented or will be: no exploitation, no
evasion tooling aimed at third-party defences, no scanning, no C2. The
adversarial payloads in `adversarial/payloads.py` are inert strings used to
confirm the classifier ignores narrative content.
