'use client';

import React, { useState } from 'react';
import { Exercise } from '@/types/exercise';
import { ExerciseList } from '@/components/exercises/ExerciseList';
import useGameificationStore from '@/lib/gamification/store';
import { toast } from 'sonner';

interface TopicTabsProps {
  topicId: string;
  exercises: Exercise[];
  /** Aula renderizada no servidor e passada como slot. */
  lesson: React.ReactNode;
}

type Aba = 'aprender' | 'praticar';

export function TopicTabs({ topicId, exercises, lesson }: TopicTabsProps) {
  const [aba, setAba] = useState<Aba>('aprender');

  const progress = useGameificationStore((s) => s.topics[topicId]);
  const completeTopicTheory = useGameificationStore((s) => s.completeTopicTheory);

  const resolvidos = progress?.exercisesCompleted ?? 0;
  const concluido = progress?.status === 'completed';
  const todosResolvidos = exercises.length > 0 && resolvidos >= exercises.length;

  if (!lesson && exercises.length === 0) {
    return (
      <div className="mt-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
          Conteúdo deste tópico ainda não foi escrito 🔜
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Os tópicos estão sendo produzidos na ordem do cronograma da disciplina.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Abas */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <TabButton ativo={aba === 'aprender'} onClick={() => setAba('aprender')}>
          📖 Aprender
        </TabButton>
        <TabButton ativo={aba === 'praticar'} onClick={() => setAba('praticar')}>
          ✏️ Praticar
          {exercises.length > 0 && (
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                todosResolvidos
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {resolvidos}/{exercises.length}
            </span>
          )}
        </TabButton>
      </div>

      <div className="py-8">
        {aba === 'aprender' ? (
          <>
            {lesson}

            <div className="mt-10 flex flex-col items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Terminou a leitura? Agora fixa resolvendo.
              </p>
              <button
                onClick={() => setAba('praticar')}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 py-3 font-semibold text-white transition"
              >
                Ir para os exercícios →
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <ExerciseList exercises={exercises} topicId={topicId} />

            {todosResolvidos && !concluido && (
              <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-6 text-center">
                <p className="mb-3 font-bold text-emerald-900 dark:text-emerald-100">
                  🎉 Você resolveu todos os exercícios deste tópico!
                </p>
                <button
                  onClick={() => {
                    void completeTopicTheory(topicId, 50);
                    toast.success('Tópico concluído! +50 XP');
                  }}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-700 px-6 py-3 font-semibold text-white transition"
                >
                  Marcar tópico como concluído (+50 XP)
                </button>
              </div>
            )}

            {concluido && (
              <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 p-6 text-center font-bold text-emerald-900 dark:text-emerald-100">
                ✅ Tópico concluído — ele já conta no seu progresso do Projeto Integrador.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px flex items-center border-b-2 px-4 py-3 text-sm font-semibold transition ${
        ativo
          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}
