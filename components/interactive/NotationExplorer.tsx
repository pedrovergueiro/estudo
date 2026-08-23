'use client';

import React, { useState } from 'react';
import { MatrixGrid } from '@/components/math/MatrixGrid';

const DATA = [
  [7, 2, 9, 4],
  [1, 8, 3, 6],
  [5, 0, 2, 7],
];

/**
 * Explorador de notação a_ij.
 *
 * O aluno clica numa célula e o componente narra exatamente o que aquele
 * índice significa. Aprender notação lendo texto é chato; clicando gruda.
 */
export function NotationExplorer() {
  const [sel, setSel] = useState<[number, number] | null>(null);

  const i = sel ? sel[0] + 1 : null;
  const j = sel ? sel[1] + 1 : null;
  const value = sel ? DATA[sel[0]][sel[1]] : null;

  return (
    <div className="my-8 rounded-xl border-2 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30 overflow-hidden">
      <div className="bg-amber-100 dark:bg-amber-900/50 px-5 py-3">
        <h4 className="font-bold text-amber-900 dark:text-amber-100">
          👆 Clique em qualquer número da matriz
        </h4>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex justify-center">
          <MatrixGrid
            data={DATA}
            label="Matriz A"
            selected={sel}
            onCellClick={(r, c) => setSel([r, c])}
            highlight={sel ? { rows: [sel[0]], cols: [sel[1]] } : undefined}
          />
        </div>

        {sel === null ? (
          <div className="rounded-lg border border-dashed border-amber-300 dark:border-amber-700 p-6 text-center">
            <p className="text-amber-800 dark:text-amber-200">
              Escolha um número aí em cima. Vou te mostrar como os matemáticos escrevem
              &quot;esse número específico&quot; sem precisar desenhar a matriz toda.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 p-5 text-center">
              <div className="font-mono text-3xl font-bold text-amber-700 dark:text-amber-300">
                a<sub className="text-xl">{i}{j}</sub> = {value}
              </div>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                Lê-se: &quot;a índice {i}, {j}&quot;
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/40 p-4">
                <div className="text-xs font-semibold uppercase text-indigo-700 dark:text-indigo-300">
                  Primeiro índice ({i})
                </div>
                <div className="mt-1 text-sm text-indigo-900 dark:text-indigo-100">
                  É a <strong>linha</strong>. Conta de cima para baixo, começando em 1.
                  Você clicou na linha {i}.
                </div>
              </div>

              <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 p-4">
                <div className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                  Segundo índice ({j})
                </div>
                <div className="mt-1 text-sm text-emerald-900 dark:text-emerald-100">
                  É a <strong>coluna</strong>. Conta da esquerda para a direita, começando em 1.
                  Você clicou na coluna {j}.
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4 text-sm text-gray-700 dark:text-gray-300">
              💡 <strong>A ordem nunca muda:</strong> é sempre{' '}
              <em>linha primeiro, coluna depois</em>. Se você trocar, vira outro número
              completamente diferente — repare que a<sub>{i}{j}</sub> e a<sub>{j}{i}</sub>{' '}
              apontam para lugares distintos da matriz.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
