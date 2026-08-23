'use client';

import React, { useState } from 'react';
import { VectorPlane } from '@/components/math/VectorPlane';
import { dot, norm, projection, r } from '@/lib/math/vector';

/** Projeção ortogonal: a "sombra" de a sobre b. */
export function ProjectionExplorer() {
  const [a, setA] = useState({ x: 4, y: 3 });
  const [b, setB] = useState({ x: 5, y: 0 });

  const va = [a.x, a.y];
  const vb = [b.x, b.y];
  const proj = projection(va, vb);
  const perp = [va[0] - proj[0], va[1] - proj[1]];
  const escalar = dot(va, vb) / (norm(vb) || 1);

  return (
    <div className="my-8 rounded-xl border-2 border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/30 overflow-hidden">
      <div className="bg-orange-100 dark:bg-orange-900/50 px-5 py-3">
        <h4 className="font-bold text-orange-900 dark:text-orange-100">
          🔦 Projeção ortogonal — a sombra de a sobre b
        </h4>
      </div>

      <div className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:items-start">
        <VectorPlane
          vectors={[
            { id: 'a', x: a.x, y: a.y, color: '#ea580c', label: 'a', draggable: true },
            { id: 'b', x: b.x, y: b.y, color: '#0284c7', label: 'b', draggable: true },
            { id: 'proj', x: proj[0], y: proj[1], color: '#16a34a', label: 'proj' },
            {
              id: 'perp',
              x: perp[0],
              y: perp[1],
              color: '#94a3b8',
              label: '',
              dashed: true,
              from: { x: proj[0], y: proj[1] },
            },
          ]}
          onDrag={(id, x, y) => (id === 'a' ? setA({ x, y }) : setB({ x, y }))}
        />

        <div className="flex-1 space-y-3">
          <div className="rounded-lg bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-800 p-4">
            <p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
              Imagine uma luz vindo de cima, perpendicular a <strong>b</strong>. A sombra que{' '}
              <strong>a</strong> projeta em cima da direção de <strong>b</strong> é o vetor verde.
              A linha cinza tracejada é o que &quot;sobra&quot; — e ela sempre forma 90° com b.
            </p>
          </div>

          <div className="rounded-lg bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-800 p-4">
            <div className="text-xs font-semibold uppercase text-orange-700 dark:text-orange-300">
              A fórmula, aplicada
            </div>
            <div className="mt-2 space-y-1 font-mono text-sm text-gray-800 dark:text-gray-200">
              <div>proj_b(a) = (a·b / ‖b‖²) · b</div>
              <div>
                a·b = {dot(va, vb)} &nbsp;|&nbsp; ‖b‖² = {dot(vb, vb)}
              </div>
              <div>
                fator = {dot(va, vb)}/{dot(vb, vb)} = {r(dot(vb, vb) === 0 ? 0 : dot(va, vb) / dot(vb, vb))}
              </div>
              <div className="font-bold">
                proj = ({r(proj[0])}, {r(proj[1])})
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              O fator diz quantas vezes o vetor b cabe na sombra. Se der negativo, a sombra aponta
              para o lado oposto de b.
            </p>
          </div>

          <div className="rounded-lg bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-800 p-3 text-center">
            <div className="text-xs text-gray-500">Comprimento da sombra (projeção escalar)</div>
            <div className="font-mono text-xl font-bold">{r(escalar)}</div>
          </div>

          <div className="rounded-lg bg-orange-100 dark:bg-orange-900/40 p-3 text-sm text-orange-900 dark:text-orange-100">
            🎯 <strong>Teste:</strong> gire o vetor <strong>a</strong> até ele ficar perpendicular a
            b. A sombra encolhe até sumir — quando dois vetores são ortogonais, um não tem NENHUMA
            componente na direção do outro. É esse o significado geométrico de produto escalar zero.
          </div>
        </div>
      </div>
    </div>
  );
}
