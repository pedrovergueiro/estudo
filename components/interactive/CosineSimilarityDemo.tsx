'use client';

import React, { useState } from 'react';
import { VectorPlane } from '@/components/math/VectorPlane';
import { cosineSimilarity, norm, dot, angleDeg, r } from '@/lib/math/vector';

/**
 * Embeddings simplificados para 2D.
 * Eixo x ≈ "é ser vivo/animal", eixo y ≈ "é objeto/máquina".
 * Modelos reais usam centenas de dimensões — a matemática é idêntica.
 */
const PALAVRAS = [
  { id: 'gato', nome: 'gato', v: [4, 1], cor: '#7c3aed' },
  { id: 'cachorro', nome: 'cachorro', v: [4.5, 1.5], cor: '#2563eb' },
  { id: 'carro', nome: 'carro', v: [1, 4], cor: '#dc2626' },
  { id: 'caminhao', nome: 'caminhão', v: [1.5, 4.5], cor: '#ea580c' },
];

export function CosineSimilarityDemo() {
  const [a, setA] = useState('gato');
  const [b, setB] = useState('cachorro');

  const pa = PALAVRAS.find((p) => p.id === a)!;
  const pb = PALAVRAS.find((p) => p.id === b)!;

  const sim = cosineSimilarity(pa.v, pb.v);
  const ang = angleDeg(pa.v, pb.v);

  const leitura =
    sim > 0.95
      ? 'Praticamente idênticos em significado — apontam quase para a mesma direção.'
      : sim > 0.7
        ? 'Bastante parecidos: pertencem à mesma "família" de conceitos.'
        : sim > 0.3
          ? 'Alguma relação, mas conceitos distintos.'
          : 'Pouco ou nada relacionados — direções bem diferentes no espaço.';

  return (
    <div className="my-8 rounded-xl border-2 border-fuchsia-200 dark:border-fuchsia-900 bg-fuchsia-50/50 dark:bg-fuchsia-950/30 overflow-hidden">
      <div className="bg-fuchsia-100 dark:bg-fuchsia-900/50 px-5 py-3">
        <h4 className="font-bold text-fuchsia-900 dark:text-fuchsia-100">
          🤖 Similaridade do cosseno entre embeddings
        </h4>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Cada palavra virou um vetor. Aqui usamos 2 dimensões para dar para desenhar (eixo x ≈
          &quot;ser vivo&quot;, eixo y ≈ &quot;máquina&quot;). Modelos reais usam 300 a 1500
          dimensões — impossível desenhar, mas a conta é exatamente esta.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ['Palavra A', a, setA],
              ['Palavra B', b, setB],
            ] as [string, string, (v: string) => void][]
          ).map(([label, val, set]) => (
            <div key={label}>
              <div className="mb-1 text-xs font-semibold uppercase text-fuchsia-700 dark:text-fuchsia-300">
                {label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PALAVRAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => set(p.id)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                      val === p.id
                        ? 'text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                    }`}
                    style={val === p.id ? { backgroundColor: p.cor } : undefined}
                  >
                    {p.nome}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <VectorPlane
            range={6}
            vectors={[
              { id: 'a', x: pa.v[0], y: pa.v[1], color: pa.cor, label: pa.nome },
              ...(pa.id !== pb.id
                ? [{ id: 'b', x: pb.v[0], y: pb.v[1], color: pb.cor, label: pb.nome }]
                : []),
            ]}
          />

          <div className="flex-1 space-y-3">
            <div className="rounded-lg bg-white dark:bg-gray-900 border border-fuchsia-200 dark:border-fuchsia-800 p-4">
              <div className="text-xs font-semibold uppercase text-fuchsia-700 dark:text-fuchsia-300">
                A conta
              </div>
              <div className="mt-2 space-y-1 font-mono text-sm text-gray-800 dark:text-gray-200">
                <div>cos(θ) = (a · b) / (‖a‖ × ‖b‖)</div>
                <div>a · b = {r(dot(pa.v, pb.v))}</div>
                <div>
                  ‖a‖ = {r(norm(pa.v))} &nbsp;|&nbsp; ‖b‖ = {r(norm(pb.v))}
                </div>
                <div className="text-lg font-bold">
                  cos(θ) = {r(sim, 3)} &nbsp;(θ = {r(ang, 1)}°)
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white dark:bg-gray-900 border border-fuchsia-200 dark:border-fuchsia-800 p-4">
              <div className="mb-2 flex justify-between text-xs text-gray-500">
                <span>−1 (opostos)</span>
                <span>0 (sem relação)</span>
                <span>1 (idênticos)</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-red-400 via-gray-300 to-emerald-400">
                <div
                  className="absolute top-1/2 h-5 w-1.5 -translate-y-1/2 rounded-full bg-gray-900 dark:bg-white"
                  style={{ left: `calc(${((sim + 1) / 2) * 100}% - 3px)` }}
                />
              </div>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{leitura}</p>
            </div>

            <div className="rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/40 p-3 text-sm text-fuchsia-900 dark:text-fuchsia-100">
              💡 Compare <strong>gato × cachorro</strong> (dois animais) e depois{' '}
              <strong>gato × carro</strong>. O primeiro par dá similaridade alta, o segundo baixa —
              e note que o computador não sabe o que é um gato. Ele só compara ângulos entre vetores.
            </div>
          </div>
        </div>

        {/* Matriz de similaridade */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-2" />
                {PALAVRAS.map((p) => (
                  <th
                    key={p.id}
                    className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-2 text-xs"
                  >
                    {p.nome}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PALAVRAS.map((linha) => (
                <tr key={linha.id}>
                  <th className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-2 text-left text-xs">
                    {linha.nome}
                  </th>
                  {PALAVRAS.map((col) => {
                    const s = cosineSimilarity(linha.v, col.v);
                    return (
                      <td
                        key={col.id}
                        className="border border-gray-300 dark:border-gray-700 p-2 text-center font-mono text-xs"
                        style={{
                          backgroundColor: `rgba(34, 197, 94, ${Math.max(0, s) * 0.55})`,
                        }}
                      >
                        {r(s, 2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Matriz de similaridade: verde mais forte = mais parecido. A diagonal vale sempre 1
          (toda palavra é idêntica a si mesma). É exatamente assim que um sistema de busca semântica
          decide quais resultados te mostrar.
        </p>
      </div>
    </div>
  );
}
