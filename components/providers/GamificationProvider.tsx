'use client';

import React, { useEffect } from 'react';
import useGameificationStore from '@/lib/gamification/store';
import { XpBar } from '@/components/gamification/XpBar';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import Link from 'next/link';

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const hidratar = useGameificationStore((s) => s.hidratar);
  const erroSync = useGameificationStore((s) => s.erroSync);

  useEffect(() => {
    // Carrega o progresso do SQLite e marca presença do dia.
    void hidratar();
  }, [hidratar]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <span className="text-2xl">📚</span>
              <span className="font-bold text-lg hidden sm:inline">Estudo de Matemática</span>
            </Link>

            <nav className="hidden items-center gap-4 text-sm font-medium lg:flex">
              <Link
                href="/projeto-integrador"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition"
              >
                Prazos
              </Link>
              <Link
                href="/estatisticas"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition"
              >
                Estatísticas
              </Link>
            </nav>

            <div className="flex-1 min-w-0">
              <XpBar />
            </div>

            <div className="hidden md:block">
              <StreakCounter />
            </div>
          </div>
        </div>
      </header>

      {/* Aviso caso o banco não responda — o aluno precisa saber que não salvou */}
      {erroSync && (
        <div className="border-b border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-2 text-center text-sm text-red-800 dark:text-red-200">
          ⚠️ {erroSync} O progresso desta sessão pode não ter sido gravado.
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 dark:border-gray-800 py-8 px-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Desenvolvido com ❤️ para ajudarte a aprender Matemática</p>
      </footer>
    </div>
  );
}
