'use client';

import React, { useState } from 'react';
import { VectorPlane } from '@/components/math/VectorPlane';
import { norm, r } from '@/lib/math/vector';

/** Vetor arrastável com leitura ao vivo de componentes e norma. */
export function VectorPlayground() {
  const [v, setV] = useState({ x: 3, y: 4 });

  return (
    <div className="my-8 rounded-xl border-2 border-sky-200 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/30 overflow-hidden">
      <div className="bg-sky-100 dark:bg-sky-900/50 px-5 py-3">
        <h4 className="font-bold text-sky-900 dark:text-sky-100">
          🎯 Arraste a ponta da seta e veja os números mudarem
        </h4>
      </div>

      <div className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:items-start">
        <VectorPlane
          vectors={[
            { id: 'v', x: v.x, y: v.y, color: '#0284c7', label: 'v', draggable: true },
            { id: 'vx', x: v.x, y: 0, color: '#94a3b8', label: '', dashed: true },
            { id: 'vy', x: 0, y: v.y, color: '#94a3b8', label: '', dashed: true, from: { x: v.x, y: 0 } },
          ]}
          onDrag={(_, x, y) => setV({ x, y })}
        />

        <div className="flex-1 space-y-3">
          <div className="rounded-lg bg-white dark:bg-gray-900 border border-sky-200 dark:border-sky-800 p-4">
            <div className="text-xs font-semibold uppercase text-sky-700 dark:text-sky-300">
              Componentes
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-gray-900 dark:text-gray-100">
              v = ({v.x}, {v.y})
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              O primeiro número é quanto o vetor anda na horizontal, o segundo é quanto anda na
              vertical. As linhas cinzas tracejadas mostram esse caminho.
            </p>
          </div>

          <div className="rounded-lg bg-white dark:bg-gray-900 border border-sky-200 dark:border-sky-800 p-4">
            <div className="text-xs font-semibold uppercase text-sky-700 dark:text-sky-300">
              Norma (comprimento)
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-gray-900 dark:text-gray-100">
              ‖v‖ = {r(norm([v.x, v.y]))}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              É Pitágoras: √({v.x}² + {v.y}²) = √{v.x * v.x + v.y * v.y} = {r(norm([v.x, v.y]))}.
              O vetor é a hipotenusa do triângulo formado pelas linhas tracejadas.
            </p>
          </div>

          <div className="rounded-lg bg-sky-100 dark:bg-sky-900/40 p-4 text-sm text-sky-900 dark:text-sky-100">
            💡 Experimente deixar o vetor apontando para o lado oposto (valores negativos). O
            comprimento continua positivo — norma nunca é negativa, porque é uma distância.
          </div>
        </div>
      </div>
    </div>
  );
}
