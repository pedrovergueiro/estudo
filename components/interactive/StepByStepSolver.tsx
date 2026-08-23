'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MatrixStep } from '@/types/steps';
import { MatrixGrid } from '@/components/math/MatrixGrid';

interface StepByStepSolverProps {
  steps: MatrixStep[];
  title: string;
  /** Rótulo da matriz principal exibida (ex: "A + B", "Resultado"). */
  resultLabel?: string;
}

/**
 * Shell genérico de resolução passo a passo.
 *
 * Recebe passos já calculados (serializáveis) e cuida só da navegação e da
 * apresentação. Qualquer operação nova só precisa de um gerador em
 * lib/math/steps.ts — este componente não muda.
 */
export function StepByStepSolver({ steps, title, resultLabel = 'Resultado' }: StepByStepSolverProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const isFirst = index === 0;
  const isLast = index === steps.length - 1;
  const step = steps[index];

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), [steps.length]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    if (!playing) return;
    if (isLast) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(next, 2200);
    return () => clearTimeout(timer);
  }, [playing, isLast, index, next]);

  return (
    <div className="my-8 rounded-xl border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-100 dark:bg-indigo-900/50 px-5 py-3">
        <h4 className="font-bold text-indigo-900 dark:text-indigo-100">🔍 {title}</h4>
        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
          Passo {index + 1} de {steps.length}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Matrizes */}
        <div className="flex flex-wrap items-start justify-center gap-6">
          {step.secondary && (
            <MatrixGrid
              data={step.secondary.matrix}
              label={step.secondary.label}
              highlight={step.secondary.highlight}
            />
          )}
          <MatrixGrid data={step.matrix} label={resultLabel} highlight={step.highlight} />
        </div>

        {/* Operação */}
        <div className="text-center">
          <span className="inline-block rounded-lg bg-indigo-600 px-4 py-2 font-mono text-sm font-bold text-white">
            {step.operation}
          </span>
        </div>

        {/* Explicação — o "como cheguei aqui" */}
        <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 p-4">
          <p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
            {step.explanation}
          </p>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={prev}
            disabled={isFirst}
            className="rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            ← Anterior
          </button>

          <button
            onClick={() => {
              if (isLast) {
                setIndex(0);
                setPlaying(true);
              } else {
                setPlaying((p) => !p);
              }
            }}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition"
          >
            {isLast ? '↻ Ver de novo' : playing ? '⏸ Pausar' : '▶ Rodar sozinho'}
          </button>

          <button
            onClick={next}
            disabled={isLast}
            className="rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Próximo →
          </button>
        </div>

        {/* Trilha de progresso clicável */}
        <div className="flex flex-wrap justify-center gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setPlaying(false);
                setIndex(i);
              }}
              aria-label={`Ir para o passo ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index
                  ? 'w-8 bg-indigo-600'
                  : i < index
                    ? 'w-2 bg-indigo-400'
                    : 'w-2 bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
