-- Schema do banco de progresso.
-- Roda inteiro a cada boot; todo comando é idempotente (IF NOT EXISTS).

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Estado global do aluno. Linha única, travada em id = 1.
CREATE TABLE IF NOT EXISTS user_state (
  id               INTEGER PRIMARY KEY CHECK (id = 1),
  xp               INTEGER NOT NULL DEFAULT 0,
  streak_current   INTEGER NOT NULL DEFAULT 0,
  streak_longest   INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT,                          -- YYYY-MM-DD local
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO user_state (id) VALUES (1);

-- Progresso por tópico.
CREATE TABLE IF NOT EXISTS topic_progress (
  topic_id            TEXT PRIMARY KEY,
  subject_id          TEXT NOT NULL DEFAULT '',
  status              TEXT NOT NULL DEFAULT 'not-started'
                        CHECK (status IN ('not-started','in-progress','completed','mastered')),
  exercises_completed INTEGER NOT NULL DEFAULT 0,
  exercises_total     INTEGER NOT NULL DEFAULT 0,
  xp_earned           INTEGER NOT NULL DEFAULT 0,
  first_visited_at    TEXT,
  last_visited_at     TEXT,
  completed_at        TEXT
);

-- Cada tentativa de exercício, certa ou errada.
-- É daqui que sai a resposta para "onde eu mais erro".
CREATE TABLE IF NOT EXISTS exercise_attempts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id  TEXT NOT NULL,
  topic_id     TEXT NOT NULL,
  correct      INTEGER NOT NULL CHECK (correct IN (0,1)),
  hints_used   INTEGER NOT NULL DEFAULT 0,
  xp_awarded   INTEGER NOT NULL DEFAULT 0,
  attempted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_attempts_exercise ON exercise_attempts (exercise_id);
CREATE INDEX IF NOT EXISTS idx_attempts_topic    ON exercise_attempts (topic_id);
CREATE INDEX IF NOT EXISTS idx_attempts_data     ON exercise_attempts (attempted_at);

-- Badges desbloqueadas.
CREATE TABLE IF NOT EXISTS badges (
  badge_id    TEXT PRIMARY KEY,
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Histórico de XP, para o feed de atividade e para gráficos.
CREATE TABLE IF NOT EXISTS xp_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT NOT NULL,
  xp         INTEGER NOT NULL,
  label      TEXT NOT NULL,
  topic_id   TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_xp_events_data ON xp_events (created_at);

-- Um registro por dia estudado. Alimenta o streak e o calendário.
CREATE TABLE IF NOT EXISTS study_days (
  date          TEXT PRIMARY KEY,            -- YYYY-MM-DD local
  xp_ganho      INTEGER NOT NULL DEFAULT 0,
  exercicios    INTEGER NOT NULL DEFAULT 0,
  primeiro_acesso TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Respostas do diagnóstico, para comparar antes/depois.
CREATE TABLE IF NOT EXISTS diagnostic_runs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  acertos     INTEGER NOT NULL,
  total       INTEGER NOT NULL,
  por_area    TEXT NOT NULL,                 -- JSON: {"fracoes":2,"sinais":3,...}
  realizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
