'use client';

import React, { useState } from 'react';
import { MatrixStep } from '@/types/steps';
import { StepByStepSolver } from './StepByStepSolver';

export interface SistemaPreset {
  id: string;
  nome: string;
  equacoes: string[];
  classificacao: 'SPD' | 'SPI' | 'SI';
  resumo: string;
  steps: MatrixStep[];
  geometria: string;
}

const CORES = {
  SPD: 'emerald',
  SPI: 'amber',
  SI: 'red',
} as const;

/**
 * Comparador de sistemas.
 *
 * Mostra os três desfechos possíveis (SPD, SPI, SI) lado a lado para o aluno
 * perceber que a diferença aparece no FINAL do escalonamento, não no começo.
 */
export function SystemExplorer({ presets }: { presets: SistemaPreset[] }) {
  const [ativo, setAtivo] = useState(presets[0].id);
  const sistema = presets.find((p) => p.id === ativo)!;
  const cor = CORES[sistema.classificacao];

  return (
    <div className="my-8 space-y-4">
      {/* Seletor */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => setAtivo(p.id)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              p.id === ativo
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-gray-500'
            }`}
          >
            {p.nome}
          </button>
        ))}
      </div>

      {/* Sistema em notação normal */}
      <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-5">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          O sistema
        </div>
        <div className="space-y-1 font-mono text-[15px] text-gray-900 dark:text-gray-100">
          {sistema.equacoes.map((eq, i) => (
            <div key={i}>{eq}</div>
          ))}
        </div>
      </div>

      {/* Escalonamento */}
      <StepByStepSolver
        steps={sistema.steps}
        title={`Escalonando: ${sistema.nome}`}
        resultLabel="[A | b]"
      />

      {/* Veredito */}
      <div
        className={`rounded-xl border-2 p-5 ${
          cor === 'emerald'
            ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30'
            : cor === 'amber'
              ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30'
              : 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30'
        }`}
      >
        <div
          className={`mb-2 text-lg font-bold ${
            cor === 'emerald'
              ? 'text-emerald-900 dark:text-emerald-100'
              : cor === 'amber'
                ? 'text-amber-900 dark:text-amber-100'
                : 'text-red-900 dark:text-red-100'
          }`}
        >
          {sistema.classificacao === 'SPD' && '✅ SPD — Possível e Determinado'}
          {sistema.classificacao === 'SPI' && '♾️ SPI — Possível e Indeterminado'}
          {sistema.classificacao === 'SI' && '❌ SI — Impossível'}
        </div>
        <p
          className={`text-[15px] leading-relaxed ${
            cor === 'emerald'
              ? 'text-emerald-900 dark:text-emerald-100'
              : cor === 'amber'
                ? 'text-amber-900 dark:text-amber-100'
                : 'text-red-900 dark:text-red-100'
          }`}
        >
          {sistema.resumo}
        </p>
        <p
          className={`mt-3 text-sm ${
            cor === 'emerald'
              ? 'text-emerald-800 dark:text-emerald-200'
              : cor === 'amber'
                ? 'text-amber-800 dark:text-amber-200'
                : 'text-red-800 dark:text-red-200'
          }`}
        >
          <strong>Na geometria:</strong> {sistema.geometria}
        </p>
      </div>
    </div>
  );
}
