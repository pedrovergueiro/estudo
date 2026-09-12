# The safety argument

Each claim below is stated in the form that makes it falsifiable, followed by
the mechanism and the test that checks it.

## C1 — The evolution engine cannot change the safety policy

**Mechanism.** Every change is a `PatchProposal(path, op, value)`.
`is_protected_path` admits only paths whose first segment is `capabilities`
and which contain no protected segment. Three independent checks apply it:
`SafetyKernel.validate_patch` before application, `genome.apply_patch` at
application time on its own authority, and `SafetyKernel.validate_genome_diff`
on the applied result.

**Tests.** `test_kernel_rejects_protected_paths`,
`test_apply_patch_independently_rejects_protected_paths`,
`test_applied_diff_catches_out_of_band_edits`,
`test_promoted_genome_only_differs_in_the_capability_layer`.

**Red team.** `suite_policy_bypass` attempts writes to seven protected paths
under two operations every run.

## C2 — The kernel and the auditor cannot be reconfigured at runtime

**Mechanism.** Both define `__slots__` and override `__setattr__` to raise
`SafetyViolation`. The policy itself is a frozen dataclass.

**Tests.** `test_kernel_is_immutable`, `test_auditor_cannot_be_reconfigured`,
`test_policy_object_is_frozen`, `test_gate_thresholds_come_from_the_immutable_policy`.

## C3 — Modified safety code is detected before it can be trusted

**Mechanism.** `safety/policy.py`, `safety/kernel.py` and `audit/auditor.py`
are hashed at kernel construction and compared against a seal on disk on every
generation and inside every audit. Re-sealing requires `guardian seal --force`.

**Tests.** `test_integrity_lock_detects_tampering`,
`test_kernel_hash_is_unchanged_after_evolving`.

**Consequence.** Upgrading Guardian's own source invalidates the seal by
design. That is the alarm working, not a defect.

## C4 — The research agent cannot influence its judges

**Mechanism.** `EvolutionEngine` owns the research agent, the red team and the
auditor. `ResearchAgent.__init__` takes the kernel, a training split and
memory — no judge. The auditor re-derives every gate from raw benchmark and
red-team evidence rather than accepting a pass/fail flag.

**Tests.** `test_auditor_rejects_when_the_kernel_objects`,
`test_auditor_rejects_a_critical_adversarial_finding`,
`test_loop_never_promotes_on_capability_alone`.

## C5 — Capability alone never earns promotion

**Mechanism.** Nine-term fitness with `safety_regression` weighted 2.5×, plus
seven hard gates whose thresholds live in the immutable policy.

**Tests.** `test_intelligence_alone_does_not_win`,
`test_auditor_rejects_a_safety_regression_however_capable`,
`test_each_gate_blocks_its_own_regression` (one case per gate).

## C6 — A candidate cannot reach the network, spawn a process, or write files

**Mechanism.** `Sandbox.activate` interposes on `socket.socket`,
`socket.create_connection`, `subprocess.Popen`, `os.system` and `builtins.open`
for the duration of evaluation, records every attempt, and restores the
interpreter in a `finally` block. Attempts surface to the auditor, which
rejects on any sandbox violation.

**Tests.** `test_sandbox_blocks_network_access`,
`test_sandbox_blocks_process_spawning`,
`test_sandbox_blocks_filesystem_writes`,
`test_sandbox_restores_the_interpreter`,
`test_auditor_rejects_a_sandbox_escape`.

**Limit.** See `THREAT_MODEL.md`. This is an in-process guard.

## C7 — Forbidden capabilities can never be granted

**Mechanism.** `permissions_for` intersects any request with
`policy.forbidden_capabilities` and raises. `validate_genome_diff` applies the
same check to a genome's declared `capabilities.granted`.

**Tests.** `test_forbidden_capabilities_can_never_be_granted`,
`test_forbidden_capability_grant_is_refused`.

## C8 — A working version is never silently lost

**Mechanism.** `VersionManager.save` refuses to overwrite an existing version
whose genome hash differs. Every promotion records a rollback point, and the
canary restores the last safe version automatically on degradation.

**Tests.** `test_versions_are_never_silently_overwritten`,
`test_canary_rolls_back_a_degraded_candidate`,
`test_rollback_restores_the_last_safe_version`.

## C9 — Nothing is promoted without a complete, inspectable record

**Mechanism.** `ExperimentRecord.validate()` lists missing provenance; the
auditor downgrades to `REQUIRE_MORE_TESTS` when anything is absent. Every
experiment, benchmark, failure, audit and deployment is written to SQLite
before the promotion decision is acted on.

**Tests.** `test_every_trial_is_fully_recorded`,
`test_auditor_asks_for_more_tests_when_provenance_is_incomplete`,
`test_experiment_report_explains_what_and_why`.

## What a human still decides

The policy version, any change to the gates, any capability grant and every
re-seal of the kernel. `policy.human_audit_required_for` names these
explicitly, and none of them is reachable from the loop.
