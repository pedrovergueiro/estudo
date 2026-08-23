'use client';

import { subjects } from '@/lib/content/registry';
import { getNearestDeadline } from '@/lib/content/deadlines.config';
import Link from 'next/link';
import { DeadlineWidget } from '@/components/navigation/DeadlineWidget';
import useGameificationStore from '@/lib/gamification/store';

export default function Home() {
  const xp = useGameificationStore((s) => s.xp);
  const streak = useGameificationStore((s) => s.streak);
  const nearestDeadline = getNearestDeadline();
  const activeSubjects = subjects.filter((s) => s.status === 'active');

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Bem-vindo ao seu Estudo de Matemática! 🚀
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Sua jornada de aprendizado na UNIFEI começa aqui. Estude, pratique exercícios e vença cada desafio!
        </p>
      </div>

      {/* Nearest Deadline Widget */}
      {nearestDeadline && (
        <div className="mb-6">
          <DeadlineWidget deadline={nearestDeadline} />
        </div>
      )}

      {/* Simulado — treino focado nas questões do livro que o professor deve cobrar */}
      <Link
        href="/simulado"
        className="group mb-12 flex flex-wrap items-center gap-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 p-6 transition-all hover:border-indigo-500 hover:shadow-lg"
      >
        <span className="text-4xl">🎯</span>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
            Simulado — 10 questões do livro, cronometradas
          </h3>
          <p className="text-indigo-800 dark:text-indigo-200">
            Probabilidade (Montgomery, cap. 2) e Cálculo A (Stewart, 2.1–2.4). O sorteio prioriza os
            exercícios que já caíram na lista do professor.
          </p>
        </div>
        <span className="font-bold text-indigo-700 dark:text-indigo-300 group-hover:underline">
          Treinar →
        </span>
      </Link>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Total XP</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{xp}</p>
            </div>
            <span className="text-4xl">⭐</span>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/40 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 dark:text-orange-300">Sequência</p>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                {streak.current} dias
              </p>
            </div>
            <span className="text-4xl">🔥</span>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">Melhor Sequência</p>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                {streak.longest} dias
              </p>
            </div>
            <span className="text-4xl">🏆</span>
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Minhas Disciplinas
        </h2>

        {activeSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeSubjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/${subject.slug}`}
                className="group p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {subject.title}
                  </h3>
                  <span
                    className={`${subject.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}
                  >
                    Ativa
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Explore os tópicos e pratique exercícios para aumentar seu XP.
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:gap-2 transition-all">
                  Acessar →
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
            <p className="text-yellow-800 dark:text-yellow-200">
              Nenhuma disciplina ativa no momento.
            </p>
          </div>
        )}
      </div>

      {/* Planned Subjects */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Disciplinas em Breve 🔜
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects
            .filter((s) => s.status === 'planned')
            .map((subject) => (
              <div
                key={subject.id}
                className="p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg opacity-60 cursor-not-allowed"
              >
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  {subject.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Disponível em breve...
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-12 p-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
          Pronto para começar a estudar? 📚
        </h3>
        <p className="text-blue-800 dark:text-blue-200 mb-4">
          Acesse uma disciplina acima e explore os tópicos. Cada exercício completado vale XP!
        </p>
        {activeSubjects.length > 0 && (
          <Link
            href={`/${activeSubjects[0].slug}`}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Começar Agora →
          </Link>
        )}
      </div>
    </div>
  );
}
