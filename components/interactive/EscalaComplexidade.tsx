'use client';

import React, { useState } from 'react';

/** Máquina de referência: 100 milhões de operações por segundo. */
const OPS_POR_SEGUNDO = 1e8;

type Classe = {
  nome: string;
  ops: (n: number) => number;
  cor: string;
  exemplo: string;
};

const CLASSES: Classe[] = [
  {
    nome: 'O(1)',
    ops: () => 1,
    cor: 'bg-emerald-600',
    exemplo: 'acessar dados[5] — nem olha o resto',
  },
  {
    nome: 'O(log n)',
    ops: (n) => Math.max(1, Math.ceil(Math.log2(n))),
    cor: 'bg-emerald-500',
    exemplo: 'busca binária em base ordenada',
  },
  {
    nome: 'O(n)',
    ops: (n) => n,
    cor: 'bg-sky-500',
    exemplo: 'busca linear, uma passada no dataset',
  },
  {
    nome: 'O(n log n)',
    ops: (n) => n * Math.max(1, Math.ceil(Math.log2(n))),
    cor: 'bg-amber-500',
    exemplo: 'ordenar a base (merge sort, quicksort)',
  },
  {
    nome: 'O(n²)',
    ops: (n) => n * n,
    cor: 'bg-red-500',
    exemplo: 'comparar cada registro com todos os outros',
  },
];

const TAMANHOS = [1e3, 1e4, 1e5, 1e6];

function fmtOps(v: number) {
  if (v < 1e4) return v.toLocaleString('pt-BR');
  if (v < 1e6) return `${(v / 1e3).toFixed(0)} mil`;
  if (v < 1e9) return `${(v / 1e6).toFixed(v < 1e7 ? 1 : 0)} milhões`;
  if (v < 1e12) return `${(v / 1e9).toFixed(1)} bilhões`;
  return `${(v / 1e12).toFixed(1)} trilhões`;
}

function fmtTempo(ops: number) {
  const s = ops / OPS_POR_SEGUNDO;
  if (s < 1e-3) return 'instantâneo';
  if (s < 1) return `${(s * 1000).toFixed(0)} ms`;
  if (s < 60) return `${s.toFixed(1)} s`;
  if (s < 3600) return `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ${Math.round((s % 3600) / 60)} min`;
  if (s < 86400 * 365) return `${(s / 86400).toFixed(1)} dias`;
  return `${(s / (86400 * 365)).toFixed(1)} anos`;
}

/** Faixa de veredito para a coluna de tempo. */
function veredito(ops: number) {
  const s = ops / OPS_POR_SEGUNDO;
  if (s < 1) return { txt: 'tranquilo', cls: 'text-emerald-600 dark:text-emerald-400' };
  if (s < 60) return { txt: 'aceitável', cls: 'text-amber-600 dark:text-amber-400' };
  if (s < 3600) return { txt: 'pesado', cls: 'text-orange-600 dark:text-orange-400' };
  return { txt: 'inviável', cls: 'text-red-600 dark:text-red-400' };
}

/**
 * O que "não importa, o computador é rápido" custa na prática.
 *
 * Converte a contagem de operações em tempo de parede numa máquina de
 * referência, que é onde a diferença entre O(n) e O(n²) deixa de ser abstrata.
 */
export function EscalaComplexidade() {
  const [n, setN] = useState(1e6);

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30">
      <div className="bg-rose-100 dark:bg-rose-900/50 px-5 py-3">
        <h4 className="font-bold text-rose-900 dark:text-rose-100">
          ⏳ Quanto isso custa em tempo de verdade
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-[15px] text-gray-700 dark:text-gray-300">
          Suponha uma máquina que faz <strong>100 milhões de operações por segundo</strong> — uma
          estimativa razoável para código Python simples. Escolha o tamanho da base:
        </p>

        <div className="flex flex-wrap gap-2">
          {TAMANHOS.map((v) => (
            <button
              key={v}
              onClick={() => setN(v)}
              className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                n === v
                  ? 'border-rose-500 bg-rose-500 text-white'
                  : 'border-rose-200 dark:border-rose-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-rose-400'
              }`}
            >
              {v.toLocaleString('pt-BR')} registros
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg bg-white dark:bg-gray-900 p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="py-2 text-left font-medium text-gray-500">Complexidade</th>
                <th className="py-2 text-right font-medium text-gray-500">Operações</th>
                <th className="py-2 text-right font-medium text-gray-500">Tempo</th>
                <th className="py-2 pl-4 text-left font-medium text-gray-500">Veredito</th>
              </tr>
            </thead>
            <tbody>
              {CLASSES.map((c) => {
                const ops = c.ops(n);
                const v = veredito(ops);
                return (
                  <tr key={c.nome} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${c.cor}`} />
                        <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                          {c.nome}
                        </span>
                      </div>
                      <div className="ml-5 text-xs text-gray-500">{c.exemplo}</div>
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums text-gray-800 dark:text-gray-200">
                      {fmtOps(ops)}
                    </td>
                    <td className="py-2 text-right font-mono font-bold tabular-nums text-gray-900 dark:text-gray-100">
                      {fmtTempo(ops)}
                    </td>
                    <td className={`py-2 pl-4 font-medium ${v.cls}`}>{v.txt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg bg-rose-100 dark:bg-rose-900/40 p-3 text-sm text-rose-900 dark:text-rose-100">
          🎯 <strong>Clique em 1.000 e depois em 1.000.000.</strong> A base cresceu 1.000 vezes. O
          O(n) passou de instantâneo para instantâneo. O O(n²) passou de instantâneo para{' '}
          <strong>quase 3 horas</strong> — porque ele não cresceu 1.000 vezes, cresceu 1.000² = um
          milhão de vezes. É essa a resposta do desafio final da atividade.
        </div>
      </div>
    </div>
  );
}
