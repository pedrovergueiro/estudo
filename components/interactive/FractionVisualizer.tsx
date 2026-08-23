'use client';

import React, { useState } from 'react';

function mdc(a: number, b: number): number {
  return b === 0 ? a : mdc(b, a % b);
}

/** Barra dividida em fatias, com parte preenchida. */
function Barra({
  num,
  den,
  cor,
  label,
}: {
  num: number;
  den: number;
  cor: string;
  label: string;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</div>
      <div className="flex h-11 w-full overflow-hidden rounded-md border-2 border-gray-400 dark:border-gray-600">
        {Array.from({ length: den }, (_, i) => (
          <div
            key={i}
            className="flex-1 border-r border-gray-400 dark:border-gray-600 last:border-r-0 transition-colors"
            style={{ backgroundColor: i < num ? cor : 'transparent' }}
          />
        ))}
      </div>
      <div className="text-center font-mono text-sm font-bold text-gray-800 dark:text-gray-200">
        {num}/{den}
      </div>
    </div>
  );
}

/** Por que frações precisam de denominador igual para somar. */
export function FractionVisualizer() {
  const [n1, setN1] = useState(1);
  const [d1, setD1] = useState(2);
  const [n2, setN2] = useState(1);
  const [d2, setD2] = useState(3);

  // Denominador comum e frações equivalentes
  const comum = (d1 * d2) / mdc(d1, d2);
  const e1 = (n1 * comum) / d1;
  const e2 = (n2 * comum) / d2;
  const somaNum = e1 + e2;

  const g = mdc(somaNum, comum) || 1;
  const simplNum = somaNum / g;
  const simplDen = comum / g;
  const precisaSimplificar = g > 1;

  const jaIguais = d1 === d2;

  return (
    <div className="my-8 rounded-xl border-2 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30 overflow-hidden">
      <div className="bg-amber-100 dark:bg-amber-900/50 px-5 py-3">
        <h4 className="font-bold text-amber-900 dark:text-amber-100">
          🍕 Por que não dá para somar &quot;reto&quot;
        </h4>
      </div>

      <div className="space-y-5 p-5">
        {/* Controles */}
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ['Primeira fração', n1, setN1, d1, setD1, '#f59e0b'],
              ['Segunda fração', n2, setN2, d2, setD2, '#0ea5e9'],
            ] as [string, number, (n: number) => void, number, (n: number) => void, string][]
          ).map(([label, nn, setNn, dd, setDd, cor]) => (
            <div key={label} className="rounded-lg bg-white dark:bg-gray-900 p-3">
              <div className="mb-2 text-xs font-semibold uppercase" style={{ color: cor }}>
                {label}
              </div>
              <div className="space-y-2">
                <div>
                  <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Numerador (de cima)</span>
                    <span className="font-mono font-bold">{nn}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={dd}
                    value={nn}
                    onChange={(e) => setNn(Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: cor }}
                  />
                </div>
                <div>
                  <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Denominador (de baixo)</span>
                    <span className="font-mono font-bold">{dd}</span>
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={8}
                    value={dd}
                    onChange={(e) => {
                      const novo = Number(e.target.value);
                      setDd(novo);
                      if (nn > novo) setNn(novo);
                    }}
                    className="w-full"
                    style={{ accentColor: cor }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Barras originais */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
            Como estão agora
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Barra num={n1} den={d1} cor="#f59e0b" label="Fração 1" />
            <Barra num={n2} den={d2} cor="#0ea5e9" label="Fração 2" />
          </div>

          {!jaIguais && (
            <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3 text-sm text-red-900 dark:text-red-100">
              ⚠️ <strong>Repare nas fatias:</strong> uma barra está cortada em {d1} pedaços e a outra
              em {d2}. As fatias têm <strong>tamanhos diferentes</strong>. Por isso somar os números
              de cima direto ({n1} + {n2}) daria errado — seria como somar 2 fatias de pizza grande
              com 3 de pizza pequena e dizer que dá 5 fatias iguais.
            </div>
          )}
        </div>

        {/* Passo do denominador comum */}
        {!jaIguais && (
          <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              A solução: recortar as duas no mesmo tamanho ({comum} fatias)
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Barra num={e1} den={comum} cor="#f59e0b" label={`${n1}/${d1} vira`} />
              <Barra num={e2} den={comum} cor="#0ea5e9" label={`${n2}/${d2} vira`} />
            </div>
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
              A quantidade de tinta em cada barra <strong>não mudou</strong> — só recortamos em mais
              pedaços. {n1}/{d1} e {e1}/{comum} são a mesma coisa. Multiplicamos em cima e embaixo
              pelo mesmo número, o que nunca altera o valor da fração.
            </p>
          </div>
        )}

        {/* Resultado */}
        <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Agora sim, some
          </div>
          <div className="space-y-1 font-mono text-sm text-emerald-900 dark:text-emerald-100">
            <div>
              {n1}/{d1} + {n2}/{d2}
            </div>
            {!jaIguais && (
              <div>
                = {e1}/{comum} + {e2}/{comum}
              </div>
            )}
            <div className="text-xl font-bold">
              = {somaNum}/{comum}
              {precisaSimplificar && (
                <span className="ml-2 text-base font-normal">
                  = {simplNum}/{simplDen} (simplificado ÷{g})
                </span>
              )}
            </div>
          </div>
          <p className="mt-3 text-sm text-emerald-900 dark:text-emerald-100">
            Com as fatias do mesmo tamanho, você soma só os números de cima e mantém o de baixo. O
            denominador <strong>não</strong> se soma — ele só diz o tamanho da fatia, e o tamanho
            não mudou.
          </p>
        </div>
      </div>
    </div>
  );
}
