'use client';

import { deadlines, getDeadlinesBySubject } from '@/lib/content/deadlines.config';
import { subjects, getTopic } from '@/lib/content/registry';
import { DeadlineWidget } from '@/components/navigation/DeadlineWidget';
import { differenceInDays, parseISO } from 'date-fns';
import useGameificationStore from '@/lib/gamification/store';
import Link from 'next/link';

export default function ProjetoIntegradorPage() {
  const { topics: userTopics } = useGameificationStore();

  const groupedBySubject = subjects.reduce(
    (acc, subject) => {
      const subjectDeadlines = getDeadlinesBySubject(subject.id);
      if (subjectDeadlines.length > 0) {
        acc[subject.id] = { subject, deadlines: subjectDeadlines };
      }
      return acc;
    },
    {} as Record<string, { subject: any; deadlines: any[] }>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4 inline-block">
          ← Voltar para Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Projeto Integrador 📋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Acompanhe seus prazos de entrega e o progresso necessário para cada etapa
        </p>
      </div>

      {/* All Deadlines */}
      <div className="space-y-8">
        {Object.entries(groupedBySubject).map(([subjectId, { subject, deadlines: subjectDeadlines }]) => (
          <div key={subjectId}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {subject.title}
            </h2>

            <div className="space-y-4">
              {subjectDeadlines.map((deadline: any) => {
                const requiredTopics = deadline.requiredTopicIds.map((id: string) => getTopic(id));
                const completedTopics = requiredTopics.filter(
                  (topic: any) =>
                    topic &&
                    userTopics[topic.id] &&
                    userTopics[topic.id].status === 'completed'
                );

                const progressPercent = requiredTopics.length > 0
                  ? (completedTopics.length / requiredTopics.length) * 100
                  : 0;

                return (
                  <div
                    key={deadline.id}
                    className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <DeadlineWidget deadline={deadline} />

                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Progresso de aprendizado
                        </span>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          {Math.round(progressPercent)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Required Topics */}
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                        Tópicos necessários:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {requiredTopics.map((topic: any) => {
                          const isCompleted = userTopics[topic!.id]?.status === 'completed';

                          return (
                            <Link
                              key={topic!.id}
                              href={`/${subject.slug}/${topic!.slug}`}
                              className={`p-3 rounded border transition ${
                                isCompleted
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {topic!.title}
                                  </span>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {topic!.estimatedMinutes}m • {topic!.xpReward} XP
                                  </p>
                                </div>
                                <span className="text-lg">
                                  {isCompleted ? '✅' : '⏳'}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-12 p-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
          📝 Resumo dos Prazos
        </h2>
        <p className="text-blue-800 dark:text-blue-200 mb-4">
          Para não ficar para depois, estude os tópicos de cada bloco antes do prazo de entrega.
          Quanto antes terminar, melhor será sua preparação para o projeto!
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 <strong>Dica:</strong> Clique nos tópicos acima para acessar o conteúdo e os exercícios.
        </p>
      </div>
    </div>
  );
}
