'use client';

import React, { useState } from 'react';
import { VectorPlane, VectorSpec } from '@/components/math/VectorPlane';
import { r } from '@/lib/math/vector';

/** Equação paramétrica da reta: P + t·v, com t deslizante. */
export function LineExplorer() {
  const [p, setP] = useState({ x: -2, y: 1 });
  const [v, setV] = useState({ x: 2, y: 1 });
  const [t, setT] = useState(1.5);

  const ponto = { x: p.x + t * v.x, y: p.y + t * v.y };

  // Marca vários pontos da reta para ela "aparecer" como reta
  const amostras = [-3, -2, -1, 0, 1, 2, 3].map((tt) => ({
    t: tt,
    x: p.x + tt * v.x,
    y: p.y + tt * v.y,
  }));

  const vectors: VectorSpec[] = [
    { id: 'p', x: p.x, y: p.y, color: '#0284c7', label: 'P', draggable: true },
    { id: 'v', x: v.x, y: v.y, color: '#16a34a', label: 'v (direção)', draggable: true, from: p },
    { id: 'r', x: ponto.x, y: ponto.y, color: '#dc2626', label: `P + ${r(t, 1)}v`, dashed: true },
  ];

  return (
    <div className="my-8 rounded-xl border-2 border-cyan-200 dark:border-cyan-900 bg-cyan-50/50 dark:bg-cyan-950/30 overflow-hidden">
      <div className="bg-cyan-100 dark:bg-cyan-900/50 px-5 py-3">
        <h4 className="font-bold text-cyan-900 dark:text-cyan-100">
          📏 Equação paramétrica da reta — mexa no parâmetro t
        </h4>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>Parâmetro t</span>
            <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300">{r(t, 1)}</span>
          </label>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.5}
            value={t}
            onChange={(e) => setT(Number(e.target.value))}
            className="mt-2 w-full accent-cyan-600"
          />
        </div>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <VectorPlane
            vectors={vectors}
            onDrag={(id, x, y) => {
              if (id === 'p') setP({ x, y });
              if (id === 'v') setV({ x: x - p.x, y: y - p.y });
            }}
          />

          <div className="flex-1 space-y-3">
            <div className="rounded-lg bg-white dark:bg-gray-900 border border-cyan-200 dark:border-cyan-800 p-4">
              <div className="text-xs font-semibold uppercase text-cyan-700 dark:text-cyan-300">
                A equação, com seus números
              </div>
              <div className="mt-2 space-y-1 font-mono text-sm text-gray-800 dark:text-gray-200">
                <div>(x, y) = P + t · v</div>
                <div>
                  (x, y) = ({p.x}, {p.y}) + t·({v.x}, {v.y})
                </div>
                <div className="pt-1 font-bold">
                  t = {r(t, 1)} → ({r(ponto.x)}, {r(ponto.y)})
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white dark:bg-gray-900 border border-cyan-200 dark:border-cyan-800 p-4 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              Uma reta precisa de duas informações: <strong>por onde ela passa</strong> (o ponto P) e{' '}
              <strong>para onde ela aponta</strong> (o vetor direção v). O parâmetro t é o
              &quot;quanto andar&quot;: cada valor de t entrega um ponto diferente da reta. Variando
              t de −∞ a +∞ você percorre a reta inteira.
            </div>

            <div className="rounded-lg bg-white dark:bg-gray-900 border border-cyan-200 dark:border-cyan-800 p-3">
              <div className="mb-2 text-xs font-semibold uppercase text-cyan-700 dark:text-cyan-300">
                Alguns pontos da reta
              </div>
              <div className="grid grid-cols-2 gap-1 font-mono text-xs text-gray-700 dark:text-gray-300">
                {amostras.map((a) => (
                  <div key={a.t} className={a.t === t ? 'font-bold text-cyan-600' : ''}>
                    t={a.t} → ({r(a.x)}, {r(a.y)})
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-cyan-100 dark:bg-cyan-900/40 p-3 text-sm text-cyan-900 dark:text-cyan-100">
              💡 Arraste a ponta verde para mudar a direção da reta, e o ponto azul para deslocá-la.
              Repare: mudar o comprimento de v não muda a reta, só a &quot;velocidade&quot; com que
              t percorre ela.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
