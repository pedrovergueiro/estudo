'use client';

import React, { useState } from 'react';
import { VectorPlane, VectorSpec } from '@/components/math/VectorPlane';

type Op = 'soma' | 'subtracao' | 'escalar';

/** Soma, subtração e multiplicação por escalar, visualizadas. */
export function VectorOperations() {
  const [op, setOp] = useState<Op>('soma');
  const [a, setA] = useState({ x: 3, y: 1 });
  const [b, setB] = useState({ x: 1, y: 3 });
  const [k, setK] = useState(2);

  const soma = { x: a.x + b.x, y: a.y + b.y };
  const dif = { x: a.x - b.x, y: a.y - b.y };
  const esc = { x: a.x * k, y: a.y * k };

  let vectors: VectorSpec[] = [];
  let explicacao = '';

  if (op === 'soma') {
    vectors = [
      { id: 'a', x: a.x, y: a.y, color: '#0284c7', label: 'a', draggable: true },
      { id: 'b', x: b.x, y: b.y, color: '#dc2626', label: 'b', draggable: true },
      { id: 'bshift', x: b.x, y: b.y, color: '#fca5a5', label: '', dashed: true, from: a },
      { id: 'soma', x: soma.x, y: soma.y, color: '#16a34a', label: 'a + b' },
    ];
    explicacao =
      `Some componente com componente: (${a.x} + ${b.x}, ${a.y} + ${b.y}) = (${soma.x}, ${soma.y}). ` +
      `Geometricamente é o método "ponta a ponta": pegue o vetor b (tracejado) e encoste o início ` +
      `dele na ponta de a. Onde ele terminar é a soma. Repare que a seta verde fecha o paralelogramo.`;
  } else if (op === 'subtracao') {
    vectors = [
      { id: 'a', x: a.x, y: a.y, color: '#0284c7', label: 'a', draggable: true },
      { id: 'b', x: b.x, y: b.y, color: '#dc2626', label: 'b', draggable: true },
      { id: 'dif', x: dif.x, y: dif.y, color: '#16a34a', label: 'a − b' },
    ];
    explicacao =
      `Subtraia componente com componente: (${a.x} − ${b.x}, ${a.y} − ${b.y}) = (${dif.x}, ${dif.y}). ` +
      `Um jeito útil de pensar: a − b é o vetor que sai da ponta de b e chega na ponta de a. ` +
      `É por isso que subtração de vetores aparece sempre que você quer a "diferença" ou a ` +
      `distância entre duas posições.`;
  } else {
    vectors = [
      { id: 'a', x: a.x, y: a.y, color: '#0284c7', label: 'a', draggable: true },
      { id: 'esc', x: esc.x, y: esc.y, color: '#16a34a', label: `${k}·a`, dashed: true },
    ];
    explicacao =
      `Multiplique cada componente por ${k}: (${a.x}×${k}, ${a.y}×${k}) = (${esc.x}, ${esc.y}). ` +
      (k > 1
        ? `Com k > 1 o vetor ESTICA, mas continua apontando exatamente para a mesma direção.`
        : k === 1
          ? `Com k = 1 nada muda — multiplicar por 1 devolve o próprio vetor.`
          : k > 0
            ? `Com 0 < k < 1 o vetor ENCOLHE, mantendo a direção.`
            : k === 0
              ? `Com k = 0 o vetor vira o vetor nulo: some no ponto de origem.`
              : `Com k negativo o vetor INVERTE o sentido — passa a apontar para o lado contrário.`);
  }

  return (
    <div className="my-8 rounded-xl border-2 border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/30 overflow-hidden">
      <div className="bg-teal-100 dark:bg-teal-900/50 px-5 py-3">
        <h4 className="font-bold text-teal-900 dark:text-teal-100">
          ➕ Operações com vetores — arraste as pontas
        </h4>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['soma', 'a + b'],
              ['subtracao', 'a − b'],
              ['escalar', 'k · a'],
            ] as [Op, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setOp(id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                op === id
                  ? 'bg-teal-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {op === 'escalar' && (
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
              <span>Escalar k</span>
              <span className="font-mono font-bold text-teal-700 dark:text-teal-300">{k}</span>
            </label>
            <input
              type="range"
              min={-2}
              max={3}
              step={0.5}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="mt-2 w-full accent-teal-600"
            />
          </div>
        )}

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <VectorPlane
            vectors={vectors}
            onDrag={(id, x, y) => {
              if (id === 'a') setA({ x, y });
              if (id === 'b') setB({ x, y });
            }}
          />

          <div className="flex-1 rounded-lg bg-white dark:bg-gray-900 border border-teal-200 dark:border-teal-800 p-4">
            <p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
              {explicacao}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
