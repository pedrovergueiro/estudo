'use client';

import { create } from 'zustand';
import { UserProgress, TopicProgress } from '@/types/gamification';
import { calculateLevel } from './xpRules';

/**
 * Store de gamificação.
 *
 * Fonte da verdade agora é o SQLite (via /api/progress). A store guarda uma
 * cópia em memória para a UI ficar instantânea, e o localStorage sobrou só como
 * bagagem de versões antigas — ele é importado uma vez e depois ignorado.
 */

const VAZIO: UserProgress = {
  version: 2,
  xp: 0,
  streak: { current: 0, longest: 0, lastActiveDate: '' },
  badges: {},
  topics: {},
  xpEvents: [],
};

interface Store extends UserProgress {
  carregado: boolean;
  sincronizando: boolean;
  erroSync: string | null;

  hidratar: () => Promise<void>;
  registrarTentativa: (p: {
    exerciseId: string;
    topicId: string;
    subjectId?: string;
    correct: boolean;
    hintsUsed: number;
    xp: number;
  }) => Promise<void>;
  completeTopicTheory: (topicId: string, xp: number, subjectId?: string) => Promise<void>;
  salvarDiagnostico: (acertos: number, total: number, porArea: Record<string, number>) => Promise<void>;

  getLevel: () => number;
  getXpForNextLevel: () => number;
}

async function post(body: unknown): Promise<UserProgress | null> {
  const r = await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (await r.json()) as UserProgress;
}

/** Lê o resto do localStorage da v1 para migrar uma única vez. */
function lerLegado(): Record<string, unknown> | null {
  try {
    const cru = localStorage.getItem('gamification-store');
    if (!cru) return null;
    const parsed = JSON.parse(cru);
    return (parsed?.state ?? parsed) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const useGameificationStore = create<Store>()((set, get) => ({
  ...VAZIO,
  carregado: false,
  sincronizando: false,
  erroSync: null,

  hidratar: async () => {
    if (get().carregado) return;
    try {
      // Migração: se ainda houver dados antigos no navegador, sobem para o banco.
      const legado = lerLegado();
      if (legado && !localStorage.getItem('migrado-para-sqlite')) {
        await post({ tipo: 'importar', snapshot: legado });
        localStorage.setItem('migrado-para-sqlite', '1');
      }

      // Marca presença do dia (atualiza streak) e já recebe o estado de volta.
      const estado = await post({ tipo: 'presenca' });
      if (estado) set({ ...estado, carregado: true, erroSync: null });
    } catch (e) {
      console.error('[store] hidratar falhou:', e);
      set({ carregado: true, erroSync: 'Não consegui falar com o banco de dados.' });
    }
  },

  registrarTentativa: async (p) => {
    // Atualização otimista: a UI responde na hora, o banco confirma depois.
    if (p.correct) {
      set((s) => {
        const t: TopicProgress = s.topics[p.topicId] ?? {
          topicId: p.topicId,
          status: 'not-started',
          exercisesCompleted: 0,
          exercisesTotal: 0,
          xpEarned: 0,
          lastVisitedAt: new Date().toISOString(),
        };
        return {
          xp: s.xp + p.xp,
          topics: {
            ...s.topics,
            [p.topicId]: {
              ...t,
              status: t.status === 'not-started' ? 'in-progress' : t.status,
              exercisesCompleted: t.exercisesCompleted + 1,
              xpEarned: t.xpEarned + p.xp,
              lastVisitedAt: new Date().toISOString(),
            },
          },
        };
      });
    }

    set({ sincronizando: true });
    try {
      const estado = await post({ tipo: 'tentativa', ...p });
      if (estado) set({ ...estado, erroSync: null });
    } catch (e) {
      console.error('[store] registrarTentativa falhou:', e);
      set({ erroSync: 'Progresso não foi salvo no banco.' });
    } finally {
      set({ sincronizando: false });
    }
  },

  completeTopicTheory: async (topicId, xp, subjectId) => {
    set({ sincronizando: true });
    try {
      const estado = await post({ tipo: 'concluir-topico', topicId, subjectId, xp });
      if (estado) set({ ...estado, erroSync: null });
    } catch (e) {
      console.error('[store] completeTopicTheory falhou:', e);
      set({ erroSync: 'Não consegui salvar a conclusão do tópico.' });
    } finally {
      set({ sincronizando: false });
    }
  },

  salvarDiagnostico: async (acertos, total, porArea) => {
    try {
      await post({ tipo: 'diagnostico', acertos, total, porArea });
    } catch (e) {
      console.error('[store] salvarDiagnostico falhou:', e);
    }
  },

  getLevel: () => calculateLevel(get().xp),

  getXpForNextLevel: () => {
    const xp = get().xp;
    return calculateLevel(xp) * 500 - xp;
  },
}));

export default useGameificationStore;
