-- GUARDIAN experiment database schema (SQLite).
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS versions (
    version_id      TEXT PRIMARY KEY,
    parent_version  TEXT,
    genome_hash     TEXT NOT NULL,
    status          TEXT NOT NULL,
    created_at      TEXT NOT NULL,
    experiment_id   TEXT,
    policy_hash     TEXT NOT NULL,
    notes           TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS hypotheses (
    hypothesis_id   TEXT PRIMARY KEY,
    experiment_id   TEXT,
    statement       TEXT NOT NULL,
    target_metric   TEXT NOT NULL,
    target_class    TEXT,
    operator        TEXT NOT NULL,
    expected_effect REAL NOT NULL,
    rationale       TEXT DEFAULT '',
    created_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS experiments (
    experiment_id     TEXT PRIMARY KEY,
    parent_version    TEXT NOT NULL,
    candidate_version TEXT,
    hypothesis_id     TEXT,
    hypothesis        TEXT NOT NULL,
    changes_json      TEXT NOT NULL,
    dataset_json      TEXT NOT NULL,
    metrics_json      TEXT NOT NULL,
    tests_json        TEXT NOT NULL,
    failures_json     TEXT NOT NULL,
    risks_json        TEXT NOT NULL,
    fitness           REAL,
    decision          TEXT NOT NULL,
    decision_reason   TEXT DEFAULT '',
    seed              INTEGER NOT NULL,
    mutation_signature TEXT NOT NULL,
    created_at        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS benchmarks (
    benchmark_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id     TEXT NOT NULL,
    experiment_id  TEXT,
    capability     REAL NOT NULL,
    robustness     REAL NOT NULL,
    safety         REAL NOT NULL,
    efficiency     REAL NOT NULL,
    reliability    REAL NOT NULL,
    detail_json    TEXT NOT NULL,
    created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS failures (
    failure_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id TEXT,
    version_id    TEXT,
    suite         TEXT NOT NULL,
    severity      TEXT NOT NULL,
    summary       TEXT NOT NULL,
    detail_json   TEXT NOT NULL,
    created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audits (
    audit_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id   TEXT NOT NULL,
    current_version TEXT NOT NULL,
    candidate_version TEXT,
    verdict         TEXT NOT NULL,
    reasons_json    TEXT NOT NULL,
    evidence_json   TEXT NOT NULL,
    auditor_hash    TEXT NOT NULL,
    created_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS deployments (
    deployment_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    experiment_id  TEXT,
    version_id     TEXT NOT NULL,
    previous_version TEXT,
    stage          TEXT NOT NULL,
    outcome        TEXT NOT NULL,
    batches_json   TEXT NOT NULL,
    reason         TEXT DEFAULT '',
    created_at     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_experiments_parent ON experiments(parent_version);
CREATE INDEX IF NOT EXISTS idx_experiments_signature ON experiments(mutation_signature);
CREATE INDEX IF NOT EXISTS idx_benchmarks_version ON benchmarks(version_id);
CREATE INDEX IF NOT EXISTS idx_failures_experiment ON failures(experiment_id);
CREATE INDEX IF NOT EXISTS idx_audits_experiment ON audits(experiment_id);
CREATE INDEX IF NOT EXISTS idx_deployments_version ON deployments(version_id);
