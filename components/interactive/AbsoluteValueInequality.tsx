'use client';

import React, { useState } from 'react';

type Rel = 'menor' | 'menorIgual' | 'maior' | 'maiorIgual';

const REL: Record<Rel, { simbolo: string; aberto: boolean; paraDentro: boolean }> = {
  menor: { simbolo: '<', aberto: true, paraDentro: true },
  menorIgual: { simbolo: '≤', aberto: false, paraDentro: true },
  maior: { simbolo: '>', aberto: true, paraDentro: false },
  maiorIgual: { simbolo: '≥', aberto: false, paraDentro: false },
};

const MIN = -8;
const MAX = 8;

/**
 * |x| < k vira UM intervalo; |x| ≥ k vira DOIS.
 * É a fragilidade nº 3 do diagnóstico, e a que aparece na prova de continuidade.
 */
export function AbsoluteValueInequality() {
  const [rel, setRel] = useState<Rel>('menorIgual');
  const [k, setK] = useState(3);

  const { simbolo, aberto, paraDentro } = REL[rel];
  const pos = (n: number) => ((n - MIN) / (MAX - MIN)) * 100;
  const marcas = [-8, -6, -4, -2, 0, 2, 4, 6, 8];

  const traducao = paraDentro
    ? `−${k} ${simbolo} x ${simbolo} ${k}`
    : `x ${simbolo === '>' ? '<' : '≤'} −${k}   ou   x ${simbolo} ${k}`;

  const intervalo = paraDentro
    ? `${aberto ? '(' : '['}−${k}, ${k}${aberto ? ')' : ']'}`
    : `(−∞, −${k}${aberto ? ')' : ']'} ∪ ${aberto ? '(' : '['}${k}, +∞)`;

  const explicacao = paraDentro
    ? `|x| ${simbolo} ${k} pergunta: quais números estão a uma distância ${
        aberto ? 'MENOR que' : 'de no máximo'
      } ${k} do zero? São os que ficam ESPREMIDOS entre −${k} e ${k}. Por isso a resposta é um intervalo só, e por isso ela se escreve como uma desigualdade dupla.`
    : `|x| ${simbolo} ${k} pergunta: quais números estão a uma distância ${
        aberto ? 'MAIOR que' : 'de pelo menos'
      } ${k} do zero? São os que ficam LONGE do zero — para a direita de ${k} ou para a esquerda de −${k}. São dois pedaços separados, ligados por "ou", e é por isso que a resposta usa união (∪). Escrever isso como desigualdade dupla é o erro clássico: não existe número que seja ao mesmo tempo menor que −${k} e maior que ${k}.`;

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-violet-200 dark:border-violet-900 bg-violet-50/50 dark:bg-violet-950/30">
      <div className="bg-violet-100 dark:bg-violet-900/50 px-5 py-3">
        <h4 className="font-bold text-violet-900 dark:text-violet-100">
          📏 Módulo é distância até o zero
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">A desigualdade</div>
            <div className="grid grid-cols-4 gap-1">
              {(Object.keys(REL) as Rel[]).map((id) => (
                <button
                  key={id}
                  onClick={() => setRel(id)}
                  className={`rounded-md py-1.5 font-mono text-lg font-bold transition ${
                    rel === id
                      ? 'bg-violet-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {REL[id].simbolo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Valor de k</span>
              <span className="font-mono font-bold">{k}</span>
            </label>
            <input
              type="range"
              min={1}
              max={6}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="mt-1 w-full accent-violet-600"
            />
          </div>
        </div>

        {/* A tradução */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 text-center">
          <div className="font-mono text-2xl font-bold text-gray-900 dark:text-gray-100">
            |x| {simbolo} {k}
          </div>
          <div className="my-2 text-2xl text-violet-500">↓</div>
          <div className="font-mono text-xl font-bold text-violet-600 dark:text-violet-400">
            {traducao}
          </div>
        </div>

        {/* Reta */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-5">
          <div className="relative h-20">
            <div className="absolute left-0 right-0 top-8 h-0.5 bg-gray-300 dark:bg-gray-600" />

            {paraDentro ? (
              <div
                className="absolute top-[29px] h-2 rounded-full bg-violet-500 transition-all duration-300"
                style={{ left: `${pos(-k)}%`, width: `${pos(k) - pos(-k)}%` }}
              />
            ) : (
              <>
                <div
                  className="absolute top-[29px] h-2 rounded-full bg-violet-500 transition-all duration-300"
                  style={{ left: '0%', width: `${pos(-k)}%` }}
                />
                <div
                  className="absolute top-[29px] h-2 rounded-full bg-violet-500 transition-all duration-300"
                  style={{ left: `${pos(k)}%`, width: `${100 - pos(k)}%` }}
                />
              </>
            )}

            {[-k, k].map((n) => (
              <div key={n}>
                <div
                  className={`absolute top-[26px] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-violet-600 transition-all duration-300 ${
                    aberto ? 'bg-white dark:bg-gray-900' : 'bg-violet-600'
                  }`}
                  style={{ left: `${pos(n)}%` }}
                />
                <div
                  className="absolute top-0 -translate-x-1/2 font-mono text-xs font-bold text-violet-600 dark:text-violet-400 transition-all duration-300"
                  style={{ left: `${pos(n)}%` }}
                >
                  {n}
                </div>
              </div>
            ))}

            {/* Zero de referência */}
            <div className="absolute top-[22px] -translate-x-1/2" style={{ left: `${pos(0)}%` }}>
              <div className="h-6 w-0.5 bg-gray-900 dark:bg-gray-200" />
            </div>

            {marcas.map((n) => (
              <div
                key={n}
                className="absolute top-[38px] -translate-x-1/2"
                style={{ left: `${pos(n)}%` }}
              >
                <div className="h-2 w-0.5 bg-gray-400 dark:bg-gray-600" />
                <div className="mt-1 -translate-x-1/2 text-[10px] text-gray-500">{n}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border-2 border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/50 p-4 text-center">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">
            Em forma de intervalo
          </div>
          <div className="font-mono text-lg font-bold text-violet-900 dark:text-violet-100">
            {intervalo}
          </div>
        </div>

        <div className="rounded-lg border border-violet-200 dark:border-violet-800 bg-white dark:bg-gray-900 p-4 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
          {explicacao}
        </div>

        <div className="rounded-lg bg-violet-100 dark:bg-violet-900/40 p-3 text-sm text-violet-900 dark:text-violet-100">
          🎯 <strong>Isso é a questão 1(e) da lista:</strong> a função vale 1/x² quando |x| ≥ 1 e vale 2
          quando |x| &lt; 1. Coloque k = 1 e alterne entre ≥ e &lt; — você vai ver exatamente os dois
          pedaços de fora e o miolo de dentro que definem cada ramo daquela função.
        </div>
      </div>
    </div>
  );
}
