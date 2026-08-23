'use client';

import React, { useState } from 'react';

type Alg = {
  letra: string;
  codigo: string;
  /** Conta as execuções da operação principal, simulando o laço de verdade. */
  contar: (n: number) => number;
  bigO: string;
  cor: string;
  porque: string;
};

const ALGORITMOS: Alg[] = [
  {
    letra: 'A',
    codigo: `def algoritmo_a(n):
    for i in range(n):
        print(i)`,
    contar: (n) => n,
    bigO: 'O(n)',
    cor: 'bg-sky-500',
    porque: 'Um laço que vai de 0 a n − 1: executa exatamente n vezes.',
  },
  {
    letra: 'B',
    codigo: `def algoritmo_b(n):
    for i in range(n):
        for j in range(n):
            print(i, j)`,
    contar: (n) => n * n,
    bigO: 'O(n²)',
    cor: 'bg-red-500',
    porque: 'Laço dentro de laço: para cada uma das n voltas de fora, n voltas de dentro. n × n = n².',
  },
  {
    letra: 'C',
    codigo: `def algoritmo_c(n):
    i = 1
    while i < n:
        print(i)
        i *= 2`,
    contar: (n) => {
      let c = 0;
      for (let i = 1; i < n; i *= 2) c++;
      return c;
    },
    bigO: 'O(log n)',
    cor: 'bg-emerald-500',
    porque:
      'O i DOBRA a cada volta (1, 2, 4, 8, 16…). Ele chega em n depois de log₂(n) dobras — por isso o logaritmo.',
  },
  {
    letra: 'D',
    codigo: `def algoritmo_d(n):
    resultado = 0
    for i in range(n):
        resultado += i
    for i in range(n):
        resultado += i
    return resultado`,
    contar: (n) => 2 * n,
    bigO: 'O(n)',
    cor: 'bg-amber-500',
    porque:
      'Dois laços LADO A LADO, não aninhados: n + n = 2n. A constante 2 é descartada no Big O, então é O(n) — o mesmo do A.',
  },
];

const VALORES = [10, 100, 1000];
const fmt = (v: number) => v.toLocaleString('pt-BR');

/**
 * Os quatro algoritmos da atividade, contados de verdade.
 *
 * O contador do C roda o laço `while` de fato em vez de aplicar log₂ — assim o
 * número na tela é o número de `print` que o Python executaria, incluindo o
 * arredondamento que o logaritmo esconde.
 */
export function ContadorAlgoritmos() {
  const [n, setN] = useState(100);
  const [revelado, setRevelado] = useState(false);

  const maximo = Math.max(...ALGORITMOS.map((a) => a.contar(n)));

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/30">
      <div className="bg-orange-100 dark:bg-orange-900/50 px-5 py-3">
        <h4 className="font-bold text-orange-900 dark:text-orange-100">
          ⚙️ Os quatro algoritmos da atividade, contados de verdade
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Tamanho da entrada n</span>
            <span className="font-mono font-bold">{fmt(n)}</span>
          </label>
          <input
            type="range"
            min={1}
            max={1000}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="mt-1 w-full accent-orange-600"
          />
          <div className="mt-2 flex gap-2">
            {VALORES.map((v) => (
              <button
                key={v}
                onClick={() => setN(v)}
                className={`rounded-lg border-2 px-3 py-1 text-sm font-medium transition-colors ${
                  n === v
                    ? 'border-orange-500 bg-orange-500 text-white'
                    : 'border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                }`}
              >
                n = {fmt(v)}
              </button>
            ))}
            <span className="self-center text-xs text-gray-500">
              ← os três valores que a questão 1 pede
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {ALGORITMOS.map((a) => {
            const c = a.contar(n);
            return (
              <div
                key={a.letra}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${a.cor} font-bold text-white`}
                  >
                    {a.letra}
                  </span>
                  <span className="font-mono text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">
                    {fmt(c)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {c === 1 ? 'execução' : 'execuções'} da operação principal
                  </span>
                  {revelado && (
                    <span className="ml-auto rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 font-mono text-sm font-bold text-gray-700 dark:text-gray-300">
                      {a.bigO}
                    </span>
                  )}
                </div>

                <div className="mt-2 h-3 w-full overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                  <div
                    className={`h-3 ${a.cor} transition-all`}
                    style={{ width: `${maximo > 0 ? (c / maximo) * 100 : 0}%` }}
                  />
                </div>

                <pre className="mt-3 overflow-x-auto rounded bg-gray-900 p-3 font-mono text-[12px] leading-relaxed text-gray-100">
                  {a.codigo}
                </pre>

                {revelado && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{a.porque}</p>
                )}
              </div>
            );
          })}
        </div>

        {!revelado ? (
          <button
            onClick={() => setRevelado(true)}
            className="w-full rounded-lg bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600"
          >
            Tente responder antes → depois clique para ver a complexidade
          </button>
        ) : (
          <div className="rounded-lg bg-orange-100 dark:bg-orange-900/40 p-3 text-sm text-orange-900 dark:text-orange-100">
            👀 <strong>Arraste o n até 1.000 e olhe as barras.</strong> A do B some do gráfico dos
            outros: ela vale 1.000.000 enquanto A vale 1.000 e C vale 10. É esse descolamento — não o
            valor em si — que a notação Big O descreve.
          </div>
        )}
      </div>
    </div>
  );
}
