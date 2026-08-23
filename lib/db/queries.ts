import { getDb } from './index';

/** Formatos trocados entre servidor e cliente. */

export interface TopicProgressRow {
  topic_id: string;
  subject_id: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  exercises_completed: number;
  exercises_total: number;
  xp_earned: number;
  first_visited_at: string | null;
  last_visited_at: string | null;
  completed_at: string | null;
}

export interface SnapshotProgresso {
  xp: number;
  streak: { current: number; longest: number; lastActiveDate: string | null };
  badges: Record<string, { unlockedAt: string }>;
  topics: Record<
    string,
    {
      topicId: string;
      status: TopicProgressRow['status'];
      exercisesCompleted: number;
      exercisesTotal: number;
      xpEarned: number;
      lastVisitedAt: string;
    }
  >;
  xpEvents: { id: string; type: string; xp: number; label: string; timestamp: string }[];
}

const hojeLocal = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** Lê o estado completo — é o que hidrata a store no cliente. */
export function lerSnapshot(): SnapshotProgresso {
  const db = getDb();

  const estado = db
    .prepare('SELECT xp, streak_current, streak_longest, last_active_date FROM user_state WHERE id = 1')
    .get() as
    | { xp: number; streak_current: number; streak_longest: number; last_active_date: string | null }
    | undefined;

  const topicos = db.prepare('SELECT * FROM topic_progress').all() as TopicProgressRow[];
  const badges = db.prepare('SELECT badge_id, unlocked_at FROM badges').all() as {
    badge_id: string;
    unlocked_at: string;
  }[];
  const eventos = db
    .prepare('SELECT id, type, xp, label, created_at FROM xp_events ORDER BY id DESC LIMIT 100')
    .all() as { id: number; type: string; xp: number; label: string; created_at: string }[];

  return {
    xp: estado?.xp ?? 0,
    streak: {
      current: estado?.streak_current ?? 0,
      longest: estado?.streak_longest ?? 0,
      lastActiveDate: estado?.last_active_date ?? null,
    },
    badges: Object.fromEntries(badges.map((b) => [b.badge_id, { unlockedAt: b.unlocked_at }])),
    topics: Object.fromEntries(
      topicos.map((t) => [
        t.topic_id,
        {
          topicId: t.topic_id,
          status: t.status,
          exercisesCompleted: t.exercises_completed,
          exercisesTotal: t.exercises_total,
          xpEarned: t.xp_earned,
          lastVisitedAt: t.last_visited_at ?? '',
        },
      ])
    ),
    xpEvents: eventos.map((e) => ({
      id: String(e.id),
      type: e.type,
      xp: e.xp,
      label: e.label,
      timestamp: e.created_at,
    })),
  };
}

/** Registra tentativa de exercício e, se correta, credita XP. Tudo numa transação. */
export const registrarTentativa = getDbTx(
  (
    db,
    p: {
      exerciseId: string;
      topicId: string;
      subjectId?: string;
      correct: boolean;
      hintsUsed: number;
      xp: number;
    }
  ) => {
    db.prepare(
      `INSERT INTO exercise_attempts (exercise_id, topic_id, correct, hints_used, xp_awarded)
       VALUES (?, ?, ?, ?, ?)`
    ).run(p.exerciseId, p.topicId, p.correct ? 1 : 0, p.hintsUsed, p.correct ? p.xp : 0);

    if (!p.correct) return;

    // XP e contagem só valem na PRIMEIRA vez que este exercício é acertado.
    // Sem isso, refazer o mesmo exercício viraria farm de XP infinito.
    // (a tentativa atual já foi inserida acima, por isso o corte é em <= 1)
    const jaAcertou = db
      .prepare(
        `SELECT COUNT(*) AS n FROM exercise_attempts
         WHERE exercise_id = ? AND correct = 1`
      )
      .get(p.exerciseId) as { n: number };

    const primeiraVez = jaAcertou.n <= 1;

    // Refazer exercício é bom para estudar — só não pontua de novo.
    db.prepare(
      `INSERT INTO topic_progress (topic_id, subject_id, status, exercises_completed, xp_earned,
                                   first_visited_at, last_visited_at)
       VALUES (?, ?, 'in-progress', ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(topic_id) DO UPDATE SET
         status = CASE WHEN status = 'not-started' THEN 'in-progress' ELSE status END,
         exercises_completed = exercises_completed + ?,
         xp_earned = xp_earned + ?,
         last_visited_at = datetime('now')`
    ).run(
      p.topicId,
      p.subjectId ?? '',
      primeiraVez ? 1 : 0,
      primeiraVez ? p.xp : 0,
      primeiraVez ? 1 : 0,
      primeiraVez ? p.xp : 0
    );

    if (primeiraVez) {
      creditarXp(db, p.xp, 'exercise-completed', `Exercício concluído: +${p.xp} XP`, p.topicId);
    }
  }
);

/** Marca tópico como concluído e credita o bônus. */
export const concluirTopico = getDbTx(
  (db, p: { topicId: string; subjectId?: string; xp: number }) => {
    const atual = db
      .prepare('SELECT status FROM topic_progress WHERE topic_id = ?')
      .get(p.topicId) as { status: string } | undefined;

    if (atual?.status === 'completed' || atual?.status === 'mastered') return;

    db.prepare(
      `INSERT INTO topic_progress (topic_id, subject_id, status, xp_earned,
                                   first_visited_at, last_visited_at, completed_at)
       VALUES (?, ?, 'completed', ?, datetime('now'), datetime('now'), datetime('now'))
       ON CONFLICT(topic_id) DO UPDATE SET
         status = 'completed',
         xp_earned = xp_earned + ?,
         last_visited_at = datetime('now'),
         completed_at = datetime('now')`
    ).run(p.topicId, p.subjectId ?? '', p.xp, p.xp);

    creditarXp(db, p.xp, 'topic-completed', `Tópico concluído: +${p.xp} XP`, p.topicId);
  }
);

/** Marca presença do dia e atualiza o streak. Idempotente por dia. */
export const registrarPresenca = getDbTx((db) => {
  const hoje = hojeLocal();

  const estado = db
    .prepare('SELECT streak_current, streak_longest, last_active_date FROM user_state WHERE id = 1')
    .get() as { streak_current: number; streak_longest: number; last_active_date: string | null };

  if (estado.last_active_date === hoje) return;

  let novoStreak = 1;
  if (estado.last_active_date) {
    const anterior = new Date(estado.last_active_date + 'T00:00:00');
    const atual = new Date(hoje + 'T00:00:00');
    const dias = Math.round((atual.getTime() - anterior.getTime()) / 86_400_000);
    if (dias === 1) novoStreak = estado.streak_current + 1;
  }

  db.prepare(
    `UPDATE user_state
     SET streak_current = ?, streak_longest = MAX(?, streak_longest),
         last_active_date = ?, updated_at = datetime('now')
     WHERE id = 1`
  ).run(novoStreak, novoStreak, hoje);

  db.prepare('INSERT OR IGNORE INTO study_days (date) VALUES (?)').run(hoje);
});

export const desbloquearBadges = getDbTx((db, ids: string[]) => {
  const stmt = db.prepare('INSERT OR IGNORE INTO badges (badge_id) VALUES (?)');
  for (const id of ids) stmt.run(id);
});

export const salvarDiagnostico = getDbTx(
  (db, p: { acertos: number; total: number; porArea: Record<string, number> }) => {
    db.prepare(
      'INSERT INTO diagnostic_runs (acertos, total, por_area) VALUES (?, ?, ?)'
    ).run(p.acertos, p.total, JSON.stringify(p.porArea));
  }
);

/** Estatísticas — o que localStorage nunca conseguiria responder. */
export function lerEstatisticas() {
  const db = getDb();

  const geral = db
    .prepare(
      `SELECT
         COUNT(*)                                    AS tentativas,
         COALESCE(SUM(correct), 0)                   AS acertos,
         COUNT(DISTINCT exercise_id)                 AS exercicios_distintos,
         COALESCE(SUM(hints_used), 0)                AS dicas
       FROM exercise_attempts`
    )
    .get() as { tentativas: number; acertos: number; exercicios_distintos: number; dicas: number };

  const maisErrados = db
    .prepare(
      `SELECT exercise_id, topic_id,
              COUNT(*)                       AS tentativas,
              SUM(CASE WHEN correct = 0 THEN 1 ELSE 0 END) AS erros
       FROM exercise_attempts
       GROUP BY exercise_id
       HAVING erros > 0
       ORDER BY erros DESC, tentativas DESC
       LIMIT 5`
    )
    .all() as { exercise_id: string; topic_id: string; tentativas: number; erros: number }[];

  const porTopico = db
    .prepare(
      `SELECT topic_id,
              COUNT(*)                                     AS tentativas,
              SUM(correct)                                 AS acertos,
              ROUND(100.0 * SUM(correct) / COUNT(*), 0)    AS taxa
       FROM exercise_attempts
       GROUP BY topic_id
       ORDER BY taxa ASC`
    )
    .all() as { topic_id: string; tentativas: number; acertos: number; taxa: number }[];

  const dias = db
    .prepare(
      `SELECT date, xp_ganho, exercicios FROM study_days ORDER BY date DESC LIMIT 30`
    )
    .all() as { date: string; xp_ganho: number; exercicios: number }[];

  const ultimoDiagnostico = db
    .prepare('SELECT acertos, total, por_area, realizado_em FROM diagnostic_runs ORDER BY id DESC LIMIT 1')
    .get() as
    | { acertos: number; total: number; por_area: string; realizado_em: string }
    | undefined;

  return { geral, maisErrados, porTopico, dias, ultimoDiagnostico };
}

/* ---------- helpers ---------- */

type Db = ReturnType<typeof getDb>;

/** Envolve a função numa transação, resolvendo a conexão na hora da chamada. */
function getDbTx<A extends unknown[]>(fn: (db: Db, ...args: A) => void) {
  return (...args: A): void => {
    const db = getDb();
    db.transaction(() => fn(db, ...args))();
  };
}

/** Credita XP no estado global, no log e no dia corrente. */
function creditarXp(db: Db, xp: number, tipo: string, label: string, topicId?: string) {
  const hoje = hojeLocal();

  db.prepare(
    `UPDATE user_state SET xp = xp + ?, updated_at = datetime('now') WHERE id = 1`
  ).run(xp);

  db.prepare(
    'INSERT INTO xp_events (type, xp, label, topic_id) VALUES (?, ?, ?, ?)'
  ).run(tipo, xp, label, topicId ?? null);

  db.prepare('INSERT OR IGNORE INTO study_days (date) VALUES (?)').run(hoje);
  db.prepare(
    `UPDATE study_days
     SET xp_ganho = xp_ganho + ?,
         exercicios = exercicios + CASE WHEN ? = 'exercise-completed' THEN 1 ELSE 0 END
     WHERE date = ?`
  ).run(xp, tipo, hoje);
}

/** Importa um estado vindo do localStorage. Só roda se o banco estiver zerado. */
export const importarDoLocalStorage = getDbTx(
  (
    db,
    snap: {
      xp?: number;
      streak?: { current?: number; longest?: number; lastActiveDate?: string };
      badges?: Record<string, { unlockedAt?: string }>;
      topics?: Record<string, Record<string, unknown>>;
    }
  ) => {
    const { n } = db.prepare('SELECT xp AS n FROM user_state WHERE id = 1').get() as { n: number };
    const temTopico = db.prepare('SELECT COUNT(*) AS c FROM topic_progress').get() as { c: number };
    if (n > 0 || temTopico.c > 0) return; // banco já tem dado; não sobrescreve

    db.prepare(
      `UPDATE user_state
       SET xp = ?, streak_current = ?, streak_longest = ?, last_active_date = ?
       WHERE id = 1`
    ).run(
      snap.xp ?? 0,
      snap.streak?.current ?? 0,
      snap.streak?.longest ?? 0,
      snap.streak?.lastActiveDate ?? null
    );

    for (const [topicId, t] of Object.entries(snap.topics ?? {})) {
      db.prepare(
        `INSERT OR REPLACE INTO topic_progress
           (topic_id, status, exercises_completed, exercises_total, xp_earned, last_visited_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).run(
        topicId,
        (t.status as string) ?? 'not-started',
        (t.exercisesCompleted as number) ?? 0,
        (t.exercisesTotal as number) ?? 0,
        (t.xpEarned as number) ?? 0,
        (t.lastVisitedAt as string) ?? null
      );
    }

    for (const [badgeId, b] of Object.entries(snap.badges ?? {})) {
      db.prepare('INSERT OR IGNORE INTO badges (badge_id, unlocked_at) VALUES (?, ?)').run(
        badgeId,
        b.unlockedAt ?? new Date().toISOString()
      );
    }
  }
);
