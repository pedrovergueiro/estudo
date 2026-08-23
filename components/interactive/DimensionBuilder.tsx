'use client';

import React, { useState } from 'react';
import { MatrixGrid } from '@/components/math/MatrixGrid';

/**
 * Construtor de dimensões.
 *
 * Mexer nos sliders e ver a matriz crescer/encolher ensina "m × n" muito mais
 * rápido do que decorar a frase "m linhas por n colunas".
 */
export function DimensionBuilder() {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);

  const data = Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => `${i + 1}${j + 1}`)
  );

  const isSquare = rows === cols;

  return (
    <div className="my-8 rounded-xl border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 overflow-hidden">
      <div className="bg-emerald-100 dark:bg-emerald-900/50 px-5 py-3">
        <h4 className="font-bold text-emerald-900 dark:text-emerald-100">
          🎚️ Arraste os controles e veja a matriz mudar
        </h4>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Linhas (m)</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{rows}</span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="mt-2 w-full accent-emerald-600"
            />
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Colunas (n)</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{cols}</span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="mt-2 w-full accent-emerald-600"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <MatrixGrid data={data} label={`Matriz ${rows} × ${cols}`} size="sm" />
        </div>

        <div className="space-y-2 text-sm">
          <div className="rounded-lg bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 p-4">
            <p className="text-gray-800 dark:text-gray-200">
              Esta matriz tem <strong>{rows} linha{rows > 1 ? 's' : ''}</strong> e{' '}
              <strong>{cols} coluna{cols > 1 ? 's' : ''}</strong>. Dizemos que ela é{' '}
              <strong className="font-mono">{rows} × {cols}</strong> (lê-se &quot;{rows} por {cols}&quot;) e
              que tem <strong>{rows * cols} elementos</strong> no total ({rows} × {cols} = {rows * cols}).
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Os números dentro das células são os <em>endereços</em> (linha e coluna),
              não valores — assim fica fácil ver a posição de cada um.
            </p>
          </div>

          {isSquare && (
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 p-4 text-blue-900 dark:text-blue-100">
              ⭐ <strong>Repare:</strong> agora m = n = {rows}. Quando linhas e colunas são iguais,
              a matriz ganha um nome especial: <strong>matriz quadrada</strong>. Vários conceitos do
              curso (determinante, inversa) só existem para matrizes quadradas — por isso vale
              reconhecer isso de cara.
            </div>
          )}

          {rows === 1 && cols > 1 && (
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700 p-4 text-purple-900 dark:text-purple-100">
              ⭐ Com uma linha só, isso é uma <strong>matriz linha</strong> — na prática, um vetor
              deitado. Você vai reencontrar isso no bloco de Vetores.
            </div>
          )}

          {cols === 1 && rows > 1 && (
            <div className="rounded-lg bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700 p-4 text-purple-900 dark:text-purple-100">
              ⭐ Com uma coluna só, isso é uma <strong>matriz coluna</strong> — o formato padrão de
              representar um vetor em Álgebra Linear e em IA.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
