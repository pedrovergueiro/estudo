# Architecture

## Components and who may talk to whom

```
                        ┌──────────────────────────────┐
                        │        SAFETY KERNEL         │
                        │  immutable policy + integrity│
                        └──────────────┬───────────────┘
                    validates          │          verifies
             ┌─────────────────────────┼────────────────────────┐
             │                         │                        │
     ┌───────▼────────┐       ┌────────▼────────┐      ┌────────▼────────┐
     │ RESEARCH AGENT │       │    RED TEAM     │      │     AUDITOR     │
     │ maximise       │       │ maximise        │      │ decide          │
     │ fitness        │       │ failures found  │      │ APPROVE/REJECT/ │
     │                │       │                 │      │ REQUIRE_MORE    │
     └───────┬────────┘       └────────┬────────┘      └────────┬────────┘
             │ patches                 │ findings               │ verdict
             └────────────┬────────────┴────────────────────────┘
                          │
                 ┌────────▼─────────┐        ┌──────────────────┐
                 │ EVOLUTION ENGINE │───────►│ VERSION MANAGER  │
                 │ orchestration    │        │ append-only      │
                 └────────┬─────────┘        └──────────────────┘
                          │
              ┌───────────▼───────────┐      ┌──────────────────┐
              │ SANDBOX               │      │ EXPERIMENT DB    │
              │ no net / proc / write │      │ SQLite, 7 tables │
              └───────────────────────┘      └──────────────────┘
```

The arrows are the whole design. The research agent's only outbound edge is
*patches*; it has no reference to the red team, the auditor, the version
manager or the database. It cannot read its own verdict before it is made, and
it cannot change how the verdict is computed.

## The capability genome

Guardian's "model" is a JSON document. Only the `capabilities` subtree is
writable:

```jsonc
{
  "identity": {                         // protected
    "name": "guardian-event-classifier",
    "policy_hash": "526d2063f13c9954..."
  },
  "capabilities": {                     // the only mutable namespace
    "granted": ["read_dataset", "classify", "self_report"],
    "decision": { "min_score": 0.90, "confidence_temperature": 1.00 },
    "cache": { "enabled": false, "max_entries": 0 },
    "detectors": [
      {
        "id": "beacon_regularity",
        "target_class": "beaconing",
        "bias": 0.0,
        "conditions": [
          { "feature": "beacon_interval_cv", "op": "lte",
            "threshold": 0.55, "weight": 0.8 }
        ]
      }
    ]
  }
}
```

Classification: each detector scores `bias + Σ weights of satisfied
conditions`; a class scores the maximum over its detectors; the highest class
wins if it clears `decision.min_score`, otherwise the event is benign.
Confidence is a softmax over class scores at `confidence_temperature`.

**The classifier reads only the numeric feature vector.** Free-text fields on
an event (`note`, `user_agent`, `url_text`) are never consulted. That is the
structural reason instruction injection cannot work here, and the red team
verifies it empirically rather than trusting the design.

## Mutation operators

| Operator | Change | Typical goal |
| --- | --- | --- |
| `add_detector` | synthesise a conjunctive detector from training statistics | a class with no working detector |
| `add_condition` | add an unused discriminative feature to a detector | precision |
| `tune_threshold` | move a threshold toward the class quantiles | recall |
| `tune_weight` | re-balance evidence weights | precision/recall trade |
| `tune_decision` | move `min_score` or `confidence_temperature` | recall, calibration |
| `prune_condition` | drop the lowest-weight condition | efficiency |
| `enable_cache` | memoise repeated feature vectors | efficiency |

`add_detector` gives a synthesised detector a negative bias of `-0.35 × Σweights`
so it is effectively conjunctive. Without it, a wide new detector out-shouts
narrow incumbents on a single partial match and steals their events — which is
exactly what the red team's regression suite caught during development.

## Deficiency attribution

Naïvely, "class X has low F1" means "edit X's detectors". That is wrong twice:

- `benign` has no detectors at all, so there is nothing to edit;
- when X's events are claimed by Y, the fix is in Y, not X.

`ResearchAgent._attribute` reads the confusion matrix and separates
`target_class` (whose score is deficient) from `mutation_class` (whose
detectors must change), and labels the goal `false_positive` or
`false_negative` accordingly.

## Data flow for one generation

1. `benchmark_version(current)` — run the five axes inside the sandbox.
2. `observe` / `identify_weaknesses` — rank deficits against per-class targets.
3. `generate_hypotheses` — H1..Hn, distinct `(operator, edit_target)` pairs,
   sampled with a memory-derived bias toward operators that have worked.
4. `create_candidate` — operator emits patches; kernel validates; patches are
   applied to a copy; the result is structurally validated.
5. `run_trial` — memory check, kernel review, sandboxed benchmark + red team,
   fitness, audit, persist.
6. Best approved trial by fitness goes to canary; the rest are recorded as
   rejected, with reasons.
7. `CanaryDeployer` serves staged batches, comparing candidate and incumbent
   **on the same batch**, and rolls back on any batch that exceeds tolerance.

## Experiment database

Seven tables in SQLite: `versions`, `hypotheses`, `experiments`, `benchmarks`,
`failures`, `audits`, `deployments`. `memory/schema.sql` is the source of
truth; `ExperimentDatabase` is a typed wrapper, and `ExperimentMemory` is the
read model that the research agent consults.

Memory does two distinct things:

- **Signature suppression** — an exact mutation (operator + path + value) that
  was rejected and never succeeded is skipped without spending compute.
- **Operator bias** — an operator family with repeated rejections and no
  approvals is sampled at half weight; one with approvals is sampled at
  `1 + success_rate`.

The first is precise, the second is statistical. Keeping them separate is why
one bad `add_detector` does not ban the whole operator.

## Versioning

Versions are numbered `major.minor`. The engine only ever increments the minor
component; majors are reserved for humans. `VersionManager.save` refuses to
overwrite an existing version whose genome hash differs, so a functioning
version can never be silently replaced. Every record carries its parent, its
genome hash, its status, its originating experiment and its rollback point.
`index.json` tracks the active version and the last-known-safe version.
