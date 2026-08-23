'use client';

import React, { useState } from 'react';
import { VectorPlane } from '@/components/math/VectorPlane';
import { r } from '@/lib/math/vector';

interface Preset {
  id: string;
  nome: string;
  u: { x: number; y: number };
  w: { x: number; y: number };
  gera: string;
}

const PRESETS: Preset[] = [
  {
    id: 'li',
    nome: 'Vetores independentes',
    u: { x: 3, y: 1 },
    w: { x: 1, y: 3 },
    gera:
      'Estes dois vetores apontam para direções genuinamente diferentes. Combinando-os com os ' +
      'escalares certos, você alcança QUALQUER ponto do plano — eles geram todo o R². ' +
      'Dizemos que são linearmente INDEPENDENTES.',
  },
  {
    id: 'ld',
    nome: 'Vetores dependentes',
    u: { x: 2, y: 1 },
    w: { x: 4, y: 2 },
    gera:
      'Repare que w é exatamente 2×u — os dois estão na MESMA reta. Por mais que você mexa nos ' +
      'escalares, o resultado nunca sai dessa reta: eles geram apenas uma reta, não o plano todo. ' +
      'São linearmente DEPENDENTES, e w não acrescenta nada de novo.',
  },
];

/** Combinação linear a·u + b·w, com escalares deslizantes. */
export function CombinationExplorer() {
  const [preset, setPreset] = useState(PRESETS[0].id);
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);

  const p = PRESETS.find((x) => x.id === preset)!;
  const res = { x: a * p.u.x + b * p.w.x, y: a * p.u.y + b * p.w.y };

  return (
    <div className="my-8 rounded-xl border-2 border-lime-200 dark:border-lime-900 bg-lime-50/50 dark:bg-lime-950/30 overflow-hidden">
      <div className="bg-lime-100 dark:bg-lime-900/50 px-5 py-3">
        <h4 className="font-bold text-lime-900 dark:text-lime-100">
          🎛️ Combinação linear: a·u + b·w
        </h4>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((x) => (
            <button
              key={x.id}
              onClick={() => setPreset(x.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                preset === x.id
                  ? 'bg-lime-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              {x.nome}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ['Escalar a (multiplica u)', a, setA, '#0284c7'],
              ['Escalar b (multiplica w)', b, setB, '#dc2626'],
            ] as [string, number, (n: number) => void, string][]
          ).map(([label, val, set, cor]) => (
            <div key={label}>
              <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                <span>{label}</span>
                <span className="font-mono font-bold" style={{ color: cor }}>
                  {val}
                </span>
              </label>
              <input
                type="range"
                min={-2}
                max={2}
                step={0.5}
                value={val}
                onChange={(e) => set(Number(e.target.value))}
                className="mt-2 w-full"
                style={{ accentColor: cor }}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <VectorPlane
            vectors={[
              { id: 'u', x: p.u.x, y: p.u.y, color: '#0284c7', label: 'u' },
              { id: 'w', x: p.w.x, y: p.w.y, color: '#dc2626', label: 'w' },
              { id: 'au', x: a * p.u.x, y: a * p.u.y, color: '#7dd3fc', label: 'a·u', dashed: true },
              {
                id: 'bw',
                x: b * p.w.x,
                y: b * p.w.y,
                color: '#fca5a5',
                label: 'b·w',
                dashed: true,
                from: { x: a * p.u.x, y: a * p.u.y },
              },
              { id: 'res', x: res.x, y: res.y, color: '#16a34a', label: 'resultado' },
            ]}
          />

          <div className="flex-1 space-y-3">
            <div className="rounded-lg bg-white dark:bg-gray-900 border border-lime-200 dark:border-lime-800 p-4">
              <div className="text-xs font-semibold uppercase text-lime-700 dark:text-lime-300">
                A conta
              </div>
              <div className="mt-2 space-y-1 font-mono text-sm text-gray-800 dark:text-gray-200">
                <div>
                  {a}·({p.u.x}, {p.u.y}) + {b}·({p.w.x}, {p.w.y})
                </div>
                <div>
                  = ({r(a * p.u.x)}, {r(a * p.u.y)}) + ({r(b * p.w.x)}, {r(b * p.w.y)})
                </div>
                <div className="text-lg font-bold">
                  = ({r(res.x)}, {r(res.y)})
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white dark:bg-gray-900 border border-lime-200 dark:border-lime-800 p-4 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              {p.gera}
            </div>

            <div className="rounded-lg bg-lime-100 dark:bg-lime-900/40 p-3 text-sm text-lime-900 dark:text-lime-100">
              🎯 <strong>Compare os dois casos.</strong> No primeiro, mexendo em a e b a seta verde
              alcança qualquer canto do plano. No segundo, ela fica presa numa única reta, não
              importa o que você faça. Essa é a diferença prática entre independência e dependência
              linear.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
