'use client';

import React, { useState } from 'react';

type M3 = number[][];

const INICIAL: M3 = [
  [2, -1, 3],
  [0, 4, 1],
  [5, 2, -2],
];

function menor(m: M3, i: number, j: number): number[][] {
  return m.filter((_, li) => li !== i).map((linha) => linha.filter((_, cj) => cj !== j));
}
const det2 = (m: number[][]) => m[0][0] * m[1][1] - m[0][1] * m[1][0];

/** Determinante 3×3 pela expansão de Laplace, com a fila escolhida por você. */
export function DeterminantExplorer() {
  const [m, setM] = useState<M3>(INICIAL);
  const [porLinha, setPorLinha] = useState(true);
  const [indice, setIndice] = useState(0);

  const atualizar = (i: number, j: number, valor: string) => {
    const v = valor === '' || valor === '-' ? 0 : Number(valor);
    if (Number.isNaN(v)) return;
    setM((atual) => atual.map((l, li) => l.map((x, cj) => (li === i && cj === j ? v : x))));
  };

  const termos = [0, 1, 2].map((k) => {
    const i = porLinha ? indice : k;
    const j = porLinha ? k : indice;
    const sinal = (i + j) % 2 === 0 ? 1 : -1;
    const sub = menor(m, i, j);
    const menorDet = det2(sub);
    return { i, j, a: m[i][j], sinal, sub, menorDet, parcela: sinal * m[i][j] * menorDet };
  });

  const D = termos.reduce((s, t) => s + t.parcela, 0);

  const zerosLinha = m.map((l) => l.filter((x) => x === 0).length);
  const zerosColuna = [0, 1, 2].map((j) => m.filter((l) => l[j] === 0).length);
  const maxZeros = Math.max(...zerosLinha, ...zerosColuna);
  const melhor =
    maxZeros === 0
      ? null
      : zerosLinha.indexOf(maxZeros) >= 0
        ? { tipo: 'linha', idx: zerosLinha.indexOf(maxZeros) }
        : { tipo: 'coluna', idx: zerosColuna.indexOf(maxZeros) };

  const destacado = (i: number, j: number) => (porLinha ? i === indice : j === indice);

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/30">
      <div className="bg-orange-100 dark:bg-orange-900/50 px-5 py-3">
        <h4 className="font-bold text-orange-900 dark:text-orange-100">
          🧮 Determinante 3×3: escolha por onde expandir
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
          Edite a matriz e escolha a fila da expansão. O resultado é sempre o mesmo — o que muda é o
          trabalho que dá.
        </p>

        <div className="flex justify-center rounded-lg bg-white dark:bg-gray-900 p-5">
          <div className="inline-grid grid-cols-3 gap-1.5">
            {m.map((linha, i) =>
              linha.map((valor, j) => (
                <input
                  key={`${i}-${j}`}
                  type="number"
                  value={valor}
                  onChange={(e) => atualizar(i, j, e.target.value)}
                  aria-label={`elemento a${i + 1}${j + 1}`}
                  className={`h-12 w-14 rounded border-2 text-center font-mono text-lg font-bold transition ${
                    destacado(i, j)
                      ? 'border-orange-500 bg-orange-100 dark:bg-orange-900/50 text-orange-900 dark:text-orange-100'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}
                />
              ))
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">Expandir por</div>
            <div className="grid grid-cols-2 gap-1">
              {([[true, 'Linha'], [false, 'Coluna']] as [boolean, string][]).map(([v, lbl]) => (
                <button
                  key={String(v)}
                  onClick={() => setPorLinha(v)}
                  className={`rounded-md py-1.5 text-sm font-bold transition ${
                    porLinha === v
                      ? 'bg-orange-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">Qual</div>
            <div className="grid grid-cols-3 gap-1">
              {[0, 1, 2].map((k) => (
                <button
                  key={k}
                  onClick={() => setIndice(k)}
                  className={`rounded-md py-1.5 font-mono text-sm font-bold transition ${
                    indice === k
                      ? 'bg-orange-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {k + 1}ª
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            O tabuleiro de sinais (−1)^(i+j)
          </div>
          <div className="flex justify-center">
            <div className="inline-grid grid-cols-3 gap-1">
              {[0, 1, 2].map((i) =>
                [0, 1, 2].map((j) => (
                  <div
                    key={`s${i}-${j}`}
                    className={`flex h-8 w-8 items-center justify-center rounded font-mono text-lg font-bold ${
                      (i + j) % 2 === 0
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {(i + j) % 2 === 0 ? '+' : '−'}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {termos.map((t, k) => (
            <div
              key={k}
              className={`rounded-lg border p-3 ${
                t.a === 0
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 opacity-60'
                  : 'border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900'
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm">
                <span className="text-gray-500">
                  a<sub>
                    {t.i + 1}
                    {t.j + 1}
                  </sub>
                </span>
                <span className={t.sinal > 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {t.sinal > 0 ? '+' : '−'}
                </span>
                <span className="font-bold">({t.a})</span>
                <span className="text-gray-400">×</span>
                <span className="inline-grid grid-cols-2 gap-x-2 rounded bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs">
                  <span>{t.sub[0][0]}</span>
                  <span>{t.sub[0][1]}</span>
                  <span>{t.sub[1][0]}</span>
                  <span>{t.sub[1][1]}</span>
                </span>
                <span className="text-gray-400">=</span>
                <span className="font-bold text-orange-600 dark:text-orange-400">{t.parcela}</span>
                {t.a === 0 && (
                  <span className="text-xs text-gray-500">← zera, nem calcula o menor</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/50 p-4 text-center">
          <div className="font-mono text-3xl font-bold text-orange-900 dark:text-orange-100">
            det(A) = {D}
          </div>
          <div className="mt-2 text-sm text-orange-800 dark:text-orange-200">
            {D === 0 ? (
              <>
                Determinante zero → a matriz <strong>não</strong> é invertível (é singular), e AX = B
                não tem solução única.
              </>
            ) : (
              <>
                Determinante diferente de zero → a matriz <strong>é</strong> invertível, e AX = B tem
                solução única.
              </>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-orange-100 dark:bg-orange-900/40 p-3 text-sm text-orange-900 dark:text-orange-100">
          🎯{' '}
          {melhor ? (
            <>
              <strong>
                Esta matriz tem {maxZeros} zero{maxZeros > 1 ? 's' : ''} na {melhor.idx + 1}ª{' '}
                {melhor.tipo}.
              </strong>{' '}
              Expandindo por ali, {maxZeros} dos três termos somem e você calcula {3 - maxZeros}{' '}
              determinante{3 - maxZeros > 1 ? 's' : ''} 2×2 em vez de três. Escolher a fila com mais
              zeros é o único truque que importa em prova.
            </>
          ) : (
            <>
              <strong>Zere alguma posição</strong> e expanda por aquela fila: o termo some inteiro,
              porque está multiplicado por zero. É por isso que se escolhe sempre a fila com mais zeros.
            </>
          )}
        </div>
      </div>
    </div>
  );
}
