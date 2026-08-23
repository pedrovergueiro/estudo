'use client';

import React, { useState } from 'react';

type V3 = [number, number, number];

const cruz = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const escalar = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norma = (a: V3) => Math.sqrt(escalar(a, a));
const fmt = (v: number, c = 2) => v.toFixed(c).replace('.', ',');

/** Produto vetorial e produto misto: componentes, área e volume. */
export function CrossProductExplorer() {
  const [a, setA] = useState<V3>([2, 1, 0]);
  const [b, setB] = useState<V3>([1, 3, 0]);
  const [c, setC] = useState<V3>([0, 0, 4]);
  const [mostrarMisto, setMostrarMisto] = useState(false);

  const axb = cruz(a, b);
  const area = norma(axb);
  const misto = escalar(a, cruz(b, c));
  const volume = Math.abs(misto);

  const editor = (
    rotulo: string,
    v: V3,
    set: (x: V3) => void,
    cor: string
  ) => (
    <div>
      <div className={`mb-1 font-mono text-xs font-bold ${cor}`}>{rotulo}</div>
      <div className="grid grid-cols-3 gap-1">
        {v.map((x, i) => (
          <input
            key={i}
            type="number"
            value={x}
            aria-label={`${rotulo} componente ${['x', 'y', 'z'][i]}`}
            onChange={(e) => {
              const n = e.target.value === '' || e.target.value === '-' ? 0 : Number(e.target.value);
              if (Number.isNaN(n)) return;
              const novo = [...v] as V3;
              novo[i] = n;
              set(novo);
            }}
            className="h-10 w-full rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-center font-mono text-sm font-bold text-gray-800 dark:text-gray-200"
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-lime-200 dark:border-lime-900 bg-lime-50/50 dark:bg-lime-950/30">
      <div className="bg-lime-100 dark:bg-lime-900/50 px-5 py-3">
        <h4 className="font-bold text-lime-900 dark:text-lime-100">
          ✖️ Produto vetorial: o vetor perpendicular aos dois
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {editor('a =', a, setA, 'text-blue-600 dark:text-blue-400')}
          {editor('b =', b, setB, 'text-orange-600 dark:text-orange-400')}
          {mostrarMisto && editor('c =', c, setC, 'text-purple-600 dark:text-purple-400')}
        </div>

        {/* O determinante simbólico */}
        <div className="overflow-x-auto rounded-lg bg-white dark:bg-gray-900 p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            a × b como determinante simbólico
          </div>
          <div className="whitespace-pre font-mono text-sm text-gray-800 dark:text-gray-200">
            {`  | i    j    k  |
  | ${String(a[0]).padEnd(4)} ${String(a[1]).padEnd(4)} ${String(a[2]).padEnd(4)}|
  | ${String(b[0]).padEnd(4)} ${String(b[1]).padEnd(4)} ${String(b[2]).padEnd(4)}|`}
          </div>
          <div className="mt-3 space-y-1 font-mono text-sm text-gray-700 dark:text-gray-300">
            <div>
              i: +({a[1]})({b[2]}) − ({a[2]})({b[1]}) = {axb[0]}
            </div>
            <div>
              j: −[({a[0]})({b[2]}) − ({a[2]})({b[0]})] = {axb[1]}
            </div>
            <div>
              k: +({a[0]})({b[1]}) − ({a[1]})({b[0]}) = {axb[2]}
            </div>
          </div>
        </div>

        <div className="rounded-lg border-2 border-lime-300 dark:border-lime-700 bg-lime-50 dark:bg-lime-950/50 p-4 text-center">
          <div className="font-mono text-xl font-bold text-lime-900 dark:text-lime-100">
            a × b = ({axb[0]}, {axb[1]}, {axb[2]})
          </div>
          <div className="mt-2 font-mono text-sm text-lime-800 dark:text-lime-200">
            ‖a × b‖ = {fmt(area)} → área do paralelogramo
          </div>
          <div className="font-mono text-sm text-lime-800 dark:text-lime-200">
            área do triângulo = {fmt(area / 2)}
          </div>
        </div>

        {/* Verificação da perpendicularidade */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-white dark:bg-gray-900 p-3 text-center">
            <div className="text-xs text-gray-500">(a × b) · a</div>
            <div className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {escalar(axb, a)}
            </div>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-900 p-3 text-center">
            <div className="text-xs text-gray-500">(a × b) · b</div>
            <div className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {escalar(axb, b)}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-lime-200 dark:border-lime-800 bg-white dark:bg-gray-900 p-4 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
          Os dois produtos escalares dão <strong>zero</strong>, sempre — e é isso que define o produto
          vetorial: ele é <strong>perpendicular aos dois vetores ao mesmo tempo</strong>. Por isso ele
          serve para achar o vetor normal de um plano.
          {area === 0 && (
            <>
              {' '}
              <strong className="text-red-600 dark:text-red-400">
                Aqui a × b deu o vetor nulo: a e b são paralelos
              </strong>{' '}
              — não definem um plano, e a área do paralelogramo é zero.
            </>
          )}
        </div>

        <button
          onClick={() => setMostrarMisto((v) => !v)}
          className="w-full rounded-lg bg-lime-600 hover:bg-lime-700 px-5 py-2.5 text-sm font-semibold text-white transition"
        >
          {mostrarMisto ? 'Esconder' : 'Mostrar'} produto misto e volume
        </button>

        {mostrarMisto && (
          <div className="space-y-3">
            <div className="rounded-lg border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950/50 p-4 text-center">
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-purple-700 dark:text-purple-300">
                Produto misto a · (b × c)
              </div>
              <div className="font-mono text-2xl font-bold text-purple-900 dark:text-purple-100">
                {misto}
              </div>
              <div className="mt-1 font-mono text-sm text-purple-800 dark:text-purple-200">
                volume do paralelepípedo = |{misto}| = {volume}
              </div>
            </div>

            <div
              className={`rounded-lg p-3 text-sm ${
                volume === 0
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100'
                  : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200'
              }`}
            >
              {volume === 0 ? (
                <>
                  <strong>Produto misto zero → os três vetores são COPLANARES.</strong> Eles cabem todos
                  num mesmo plano, então o &quot;paralelepípedo&quot; é achatado e tem volume nulo. Esse
                  é o teste padrão de coplanaridade.
                </>
              ) : (
                <>
                  Produto misto diferente de zero → os três vetores <strong>não</strong> são coplanares.
                  Eles geram um paralelepípedo de volume {volume}, e por isso são linearmente
                  independentes em R³.
                </>
              )}
            </div>
          </div>
        )}

        <div className="rounded-lg bg-lime-100 dark:bg-lime-900/40 p-3 text-sm text-lime-900 dark:text-lime-100">
          🎯 <strong>Troque a e b de lugar.</strong> Todas as componentes invertem de sinal:
          a × b = −(b × a). O produto vetorial <strong>não é comutativo</strong> — e essa é a diferença
          mais cobrada em relação ao produto escalar, que é.
        </div>
      </div>
    </div>
  );
}
