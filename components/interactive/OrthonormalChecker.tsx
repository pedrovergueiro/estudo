'use client';

import React, { useState } from 'react';

type Vetor = number[];

interface Conjunto {
  id: string;
  rotulo: string;
  vetores: Vetor[];
  comentario: string;
}

const CONJUNTOS: Conjunto[] = [
  {
    id: 'canonica',
    rotulo: 'Base canônica de R⁴',
    vetores: [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ],
    comentario:
      'A base canônica é o exemplo mais simples de base ortonormal: cada par é ortogonal e cada vetor já tem norma 1. É por isso que as coordenadas nela são apenas os próprios componentes do vetor.',
  },
  {
    id: 'ortogonal',
    rotulo: 'Ortogonal, mas não unitária',
    vetores: [
      [1, 1, 0],
      [1, -1, 0],
      [0, 0, 3],
    ],
    comentario:
      'Todos os produtos escalares cruzados dão zero, então o conjunto é ORTOGONAL. Mas as normas são √2, √2 e 3 — nenhuma vale 1. Para virar ortonormal, basta dividir cada vetor pela própria norma. Ortogonal não implica ortonormal.',
  },
  {
    id: 'ortonormal',
    rotulo: 'O mesmo conjunto, normalizado',
    vetores: [
      [1 / Math.SQRT2, 1 / Math.SQRT2, 0],
      [1 / Math.SQRT2, -1 / Math.SQRT2, 0],
      [0, 0, 1],
    ],
    comentario:
      'Agora sim: ortogonal E com todas as normas iguais a 1. Este é o conjunto anterior depois de dividir cada vetor pela própria norma — o passo de normalização.',
  },
  {
    id: 'nao-ortogonal',
    rotulo: 'Nem ortogonal',
    vetores: [
      [1, 2, 0],
      [2, 1, 0],
      [0, 0, 1],
    ],
    comentario:
      'O produto escalar entre o 1º e o 2º dá 4, diferente de zero — os dois formam um ângulo agudo, não reto. O conjunto ainda pode ser uma base de R³ (são independentes), mas não é ortogonal, então perde todas as vantagens de conta.',
  },
];

const escalar = (a: Vetor, b: Vetor) => a.reduce((s, x, i) => s + x * b[i], 0);
const norma = (a: Vetor) => Math.sqrt(escalar(a, a));
const fmt = (v: number) => {
  const r = Math.abs(v) < 1e-10 ? 0 : v;
  return Number.isInteger(r) ? String(r) : r.toFixed(3).replace('.', ',');
};
const quase = (v: number, alvo: number) => Math.abs(v - alvo) < 1e-9;

/** Testa ortogonalidade e norma de um conjunto em Rⁿ. */
export function OrthonormalChecker() {
  const [ativo, setAtivo] = useState(CONJUNTOS[1].id);
  const conj = CONJUNTOS.find((c) => c.id === ativo)!;
  const { vetores } = conj;
  const n = vetores.length;

  const ortogonal = vetores.every((v, i) =>
    vetores.every((w, j) => i === j || quase(escalar(v, w), 0))
  );
  const unitarios = vetores.every((v) => quase(norma(v), 1));
  const ortonormal = ortogonal && unitarios;

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/30">
      <div className="bg-teal-100 dark:bg-teal-900/50 px-5 py-3">
        <h4 className="font-bold text-teal-900 dark:text-teal-100">
          ⊥ Ortogonal, unitário, ortonormal: testando em Rⁿ
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <div className="flex flex-wrap gap-2">
          {CONJUNTOS.map((c) => (
            <button
              key={c.id}
              onClick={() => setAtivo(c.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                ativo === c.id
                  ? 'bg-teal-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {c.rotulo}
            </button>
          ))}
        </div>

        {/* Os vetores */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Os vetores
          </div>
          <div className="space-y-1 font-mono text-sm">
            {vetores.map((v, i) => (
              <div key={i} className="flex flex-wrap items-baseline gap-2">
                <span className="text-teal-600 dark:text-teal-400">
                  v<sub>{i + 1}</sub> =
                </span>
                <span className="text-gray-800 dark:text-gray-200">
                  ({v.map(fmt).join(', ')})
                </span>
                <span
                  className={`text-xs ${
                    quase(norma(v), 1)
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  ‖v<sub>{i + 1}</sub>‖ = {fmt(norma(v))}
                  {quase(norma(v), 1) ? ' ✓ unitário' : ' ✗ não é unitário'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Matriz de produtos escalares */}
        <div className="overflow-x-auto rounded-lg bg-white dark:bg-gray-900 p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Todos os produtos escalares v<sub>i</sub> · v<sub>j</sub>
          </div>
          <table className="text-sm tabular-nums">
            <thead>
              <tr>
                <th className="px-2 py-1"></th>
                {vetores.map((_, j) => (
                  <th key={j} className="px-3 py-1 font-mono text-xs text-gray-500">
                    v{j + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vetores.map((v, i) => (
                <tr key={i}>
                  <th className="px-2 py-1 font-mono text-xs text-gray-500">v{i + 1}</th>
                  {vetores.map((w, j) => {
                    const p = escalar(v, w);
                    const okFora = i !== j && quase(p, 0);
                    const okDiag = i === j && quase(p, 1);
                    return (
                      <td
                        key={j}
                        className={`px-3 py-1 text-center font-mono ${
                          i === j
                            ? okDiag
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200'
                              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200'
                            : okFora
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                              : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200'
                        }`}
                      >
                        {fmt(p)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
            fora da diagonal deve dar <strong>0</strong> (ortogonal) · na diagonal deve dar{' '}
            <strong>1</strong> (unitário)
          </div>
        </div>

        {/* Veredito */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ['Ortogonal', ortogonal],
            ['Unitários', unitarios],
            ['Ortonormal', ortonormal],
          ].map(([lbl, ok]) => (
            <div
              key={lbl as string}
              className={`rounded-lg border-2 p-3 text-center ${
                ok
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40'
              }`}
            >
              <div className="text-xs font-bold text-gray-600 dark:text-gray-400">{lbl as string}</div>
              <div className={`text-2xl ${ok ? '' : 'opacity-40'}`}>{ok ? '✓' : '✗'}</div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-teal-200 dark:border-teal-800 bg-white dark:bg-gray-900 p-4 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
          {conj.comentario}
        </div>

        {ortonormal && (
          <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 p-3 text-sm text-emerald-900 dark:text-emerald-100">
            💡 Numa base ortonormal, achar as coordenadas de um vetor u é trivial: cada coordenada é
            simplesmente o produto escalar u · v<sub>i</sub>. Não precisa resolver sistema nenhum — é a
            grande vantagem prática, e o motivo de o assunto vir logo antes de mudança de coordenadas.
          </div>
        )}

        <div className="rounded-lg bg-teal-100 dark:bg-teal-900/40 p-3 text-sm text-teal-900 dark:text-teal-100">
          🎯 <strong>Compare o 2º conjunto com o 3º.</strong> São os mesmos vetores, com as mesmas
          direções — muda só o comprimento. Normalizar (dividir cada um pela própria norma) é o passo
          que transforma uma base ortogonal em ortonormal, e {n} divisões resolvem.
        </div>
      </div>
    </div>
  );
}
