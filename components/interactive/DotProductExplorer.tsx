'use client';

import React, { useState } from 'react';
import { VectorPlane } from '@/components/math/VectorPlane';
import { dot, norm, angleDeg, r } from '@/lib/math/vector';

/** Produto escalar e ângulo, ao vivo, com leitura do sinal. */
export function DotProductExplorer() {
  const [a, setA] = useState({ x: 4, y: 1 });
  const [b, setB] = useState({ x: 1, y: 3 });

  const va = [a.x, a.y];
  const vb = [b.x, b.y];
  const produto = dot(va, vb);
  const ang = angleDeg(va, vb);

  const sinal =
    Math.abs(produto) < 1e-9
      ? {
          cor: 'amber',
          titulo: 'Produto escalar ZERO → vetores perpendiculares',
          texto:
            'Quando o produto escalar dá exatamente zero, os vetores formam 90° entre si — são ' +
            'ORTOGONAIS. Este é o teste mais usado do curso: para saber se dois vetores são ' +
            'perpendiculares, você não precisa medir ângulo nenhum, basta conferir se o produto ' +
            'escalar zerou.',
        }
      : produto > 0
        ? {
            cor: 'emerald',
            titulo: 'Produto escalar POSITIVO → ângulo agudo (menor que 90°)',
            texto:
              'Produto positivo significa que os vetores apontam "mais ou menos para o mesmo lado". ' +
              'Quanto maior o valor, mais alinhados eles estão.',
          }
        : {
            cor: 'red',
            titulo: 'Produto escalar NEGATIVO → ângulo obtuso (maior que 90°)',
            texto:
              'Produto negativo significa que os vetores apontam para lados opostos. Quanto mais ' +
              'negativo, mais contrários eles são.',
          };

  return (
    <div className="my-8 rounded-xl border-2 border-violet-200 dark:border-violet-900 bg-violet-50/50 dark:bg-violet-950/30 overflow-hidden">
      <div className="bg-violet-100 dark:bg-violet-900/50 px-5 py-3">
        <h4 className="font-bold text-violet-900 dark:text-violet-100">
          ⚡ Produto escalar — arraste e observe o SINAL do resultado
        </h4>
      </div>

      <div className="flex flex-col items-center gap-5 p-5 sm:flex-row sm:items-start">
        <VectorPlane
          vectors={[
            { id: 'a', x: a.x, y: a.y, color: '#7c3aed', label: 'a', draggable: true },
            { id: 'b', x: b.x, y: b.y, color: '#db2777', label: 'b', draggable: true },
          ]}
          onDrag={(id, x, y) => (id === 'a' ? setA({ x, y }) : setB({ x, y }))}
          rightAngle
        />

        <div className="flex-1 space-y-3">
          <div className="rounded-lg bg-white dark:bg-gray-900 border border-violet-200 dark:border-violet-800 p-4">
            <div className="text-xs font-semibold uppercase text-violet-700 dark:text-violet-300">
              A conta, passo a passo
            </div>
            <div className="mt-2 space-y-1 font-mono text-sm text-gray-800 dark:text-gray-200">
              <div>a · b = ({a.x})({b.x}) + ({a.y})({b.y})</div>
              <div>
                a · b = {a.x * b.x} + {a.y * b.y}
              </div>
              <div className="text-lg font-bold">a · b = {produto}</div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Multiplique as coordenadas x entre si, as y entre si, e some. O resultado é um NÚMERO,
              não um vetor — por isso o nome &quot;escalar&quot;.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white dark:bg-gray-900 border border-violet-200 dark:border-violet-800 p-3 text-center">
              <div className="text-xs text-gray-500">‖a‖</div>
              <div className="font-mono text-lg font-bold">{r(norm(va))}</div>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 border border-violet-200 dark:border-violet-800 p-3 text-center">
              <div className="text-xs text-gray-500">‖b‖</div>
              <div className="font-mono text-lg font-bold">{r(norm(vb))}</div>
            </div>
          </div>

          <div className="rounded-lg bg-white dark:bg-gray-900 border border-violet-200 dark:border-violet-800 p-3 text-center">
            <div className="text-xs text-gray-500">Ângulo entre eles</div>
            <div className="font-mono text-2xl font-bold">{r(ang, 1)}°</div>
          </div>

          <div
            className={`rounded-lg border-2 p-4 ${
              sinal.cor === 'emerald'
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40'
                : sinal.cor === 'amber'
                  ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40'
                  : 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40'
            }`}
          >
            <div
              className={`mb-1 text-sm font-bold ${
                sinal.cor === 'emerald'
                  ? 'text-emerald-900 dark:text-emerald-100'
                  : sinal.cor === 'amber'
                    ? 'text-amber-900 dark:text-amber-100'
                    : 'text-red-900 dark:text-red-100'
              }`}
            >
              {sinal.titulo}
            </div>
            <p
              className={`text-sm leading-relaxed ${
                sinal.cor === 'emerald'
                  ? 'text-emerald-900 dark:text-emerald-100'
                  : sinal.cor === 'amber'
                    ? 'text-amber-900 dark:text-amber-100'
                    : 'text-red-900 dark:text-red-100'
              }`}
            >
              {sinal.texto}
            </p>
          </div>

          <div className="rounded-lg bg-violet-100 dark:bg-violet-900/40 p-3 text-sm text-violet-900 dark:text-violet-100">
            🎯 <strong>Desafio:</strong> tente posicionar os dois vetores de modo que o produto
            escalar dê exatamente 0. Quando conseguir, aparece a marca de ângulo reto em laranja.
          </div>
        </div>
      </div>
    </div>
  );
}
