'use client';

import React, { useState } from 'react';
import { VectorPlane } from '@/components/math/VectorPlane';
import { r } from '@/lib/math/vector';

interface Base {
  id: string;
  nome: string;
  e1: { x: number; y: number };
  e2: { x: number; y: number };
  obs: string;
}

const BASES: Base[] = [
  {
    id: 'canonica',
    nome: 'Base canônica',
    e1: { x: 1, y: 0 },
    e2: { x: 0, y: 1 },
    obs:
      'A base padrão, que todo mundo usa sem perceber. Quando você escreve "o vetor (3, 2)", ' +
      'está implicitamente dizendo 3·(1,0) + 2·(0,1) nesta base.',
  },
  {
    id: 'diagonal',
    nome: 'Base diagonal',
    e1: { x: 1, y: 1 },
    e2: { x: -1, y: 1 },
    obs:
      'Uma base girada 45°. O MESMO vetor do plano agora tem coordenadas diferentes, porque ' +
      'estamos medindo com outras "réguas". O vetor não mudou — a descrição dele mudou.',
  },
  {
    id: 'esticada',
    nome: 'Base esticada',
    e1: { x: 2, y: 0 },
    e2: { x: 0, y: 3 },
    obs:
      'Base com vetores de comprimentos diferentes. As coordenadas encolhem, porque cada "passo" ' +
      'na direção de e₁ agora vale 2 unidades, e cada passo em e₂ vale 3.',
  },
];

/** O mesmo vetor descrito em bases diferentes. */
export function BasisExplorer() {
  const [baseId, setBaseId] = useState(BASES[0].id);
  const alvo = { x: 4, y: 2 }; // vetor fixo no plano

  const base = BASES.find((b) => b.id === baseId)!;

  // Resolve alvo = c1·e1 + c2·e2 (sistema 2×2 pela regra de Cramer)
  const det = base.e1.x * base.e2.y - base.e2.x * base.e1.y;
  const c1 = det === 0 ? 0 : (alvo.x * base.e2.y - base.e2.x * alvo.y) / det;
  const c2 = det === 0 ? 0 : (base.e1.x * alvo.y - alvo.x * base.e1.y) / det;

  return (
    <div className="my-8 rounded-xl border-2 border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 overflow-hidden">
      <div className="bg-rose-100 dark:bg-rose-900/50 px-5 py-3">
        <h4 className="font-bold text-rose-900 dark:text-rose-100">
          🧭 O mesmo vetor, coordenadas diferentes
        </h4>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {BASES.map((b) => (
            <button
              key={b.id}
              onClick={() => setBaseId(b.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                baseId === b.id
                  ? 'bg-rose-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {b.nome}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <VectorPlane
            vectors={[
              { id: 'e1', x: base.e1.x, y: base.e1.y, color: '#0284c7', label: 'e₁' },
              { id: 'e2', x: base.e2.x, y: base.e2.y, color: '#16a34a', label: 'e₂' },
              { id: 'alvo', x: alvo.x, y: alvo.y, color: '#e11d48', label: 'v (fixo)' },
            ]}
          />

          <div className="flex-1 space-y-3">
            <div className="rounded-lg bg-white dark:bg-gray-900 border border-rose-200 dark:border-rose-800 p-4">
              <div className="text-xs font-semibold uppercase text-rose-700 dark:text-rose-300">
                Coordenadas de v nesta base
              </div>
              <div className="mt-2 font-mono text-2xl font-bold text-gray-900 dark:text-gray-100">
                [v] = ({r(c1)}, {r(c2)})
              </div>
              <div className="mt-2 space-y-1 font-mono text-xs text-gray-600 dark:text-gray-400">
                <div>
                  v = {r(c1)}·({base.e1.x}, {base.e1.y}) + {r(c2)}·({base.e2.x}, {base.e2.y})
                </div>
                <div>
                  v = ({alvo.x}, {alvo.y}) ← sempre o mesmo vetor
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white dark:bg-gray-900 border border-rose-200 dark:border-rose-800 p-4 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              {base.obs}
            </div>

            <div className="rounded-lg bg-rose-100 dark:bg-rose-900/40 p-3 text-sm text-rose-900 dark:text-rose-100">
              💡 A seta vermelha <strong>nunca se move</strong> — é sempre o mesmo vetor do plano. O
              que muda são os números que o descrevem, porque você está medindo com outra régua.
              Coordenada não é uma propriedade do vetor: é uma propriedade da dupla (vetor, base).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
