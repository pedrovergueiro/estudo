'use client';

import React, { useState } from 'react';

const pct = (v: number) => (v * 100).toFixed(1).replace('.', ',') + '%';

/**
 * Regra de Bayes com a população desenhada.
 * O ponto: mesmo com teste ótimo, doença rara faz P(doente | positivo) ser baixa.
 */
export function BayesExplorer() {
  const [prevalencia, setPrevalencia] = useState(1); // em %
  const [sensibilidade, setSensibilidade] = useState(99); // P(+ | doente)
  const [especificidade, setEspecificidade] = useState(95); // P(− | sadio)

  const N = 10000;
  const p = prevalencia / 100;
  const sens = sensibilidade / 100;
  const esp = especificidade / 100;

  const doentes = N * p;
  const sadios = N - doentes;
  const verdPos = doentes * sens;
  const falsoNeg = doentes - verdPos;
  const falsoPos = sadios * (1 - esp);
  const verdNeg = sadios - falsoPos;

  const totalPos = verdPos + falsoPos;
  const posterior = totalPos > 0 ? verdPos / totalPos : 0;

  const round = (v: number) => Math.round(v).toLocaleString('pt-BR');

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/30">
      <div className="bg-teal-100 dark:bg-teal-900/50 px-5 py-3">
        <h4 className="font-bold text-teal-900 dark:text-teal-100">
          🩺 Bayes: o teste deu positivo. E agora?
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
          Imagine {round(N)} pessoas fazendo um exame. Ajuste os três números e acompanhe a pergunta que
          realmente importa: <strong>dado que o teste deu positivo, qual a chance de a pessoa estar
          mesmo doente?</strong>
        </p>

        <div className="space-y-3">
          <div>
            <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Prevalência — quantos têm a doença, na população</span>
              <span className="font-mono font-bold">{prevalencia}%</span>
            </label>
            <input
              type="range"
              min={1}
              max={50}
              value={prevalencia}
              onChange={(e) => setPrevalencia(Number(e.target.value))}
              className="mt-1 w-full accent-teal-600"
            />
          </div>

          <div>
            <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Sensibilidade — acerta os doentes, P(+ | doente)</span>
              <span className="font-mono font-bold">{sensibilidade}%</span>
            </label>
            <input
              type="range"
              min={50}
              max={100}
              value={sensibilidade}
              onChange={(e) => setSensibilidade(Number(e.target.value))}
              className="mt-1 w-full accent-teal-600"
            />
          </div>

          <div>
            <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Especificidade — acerta os sadios, P(− | sadio)</span>
              <span className="font-mono font-bold">{especificidade}%</span>
            </label>
            <input
              type="range"
              min={50}
              max={100}
              value={especificidade}
              onChange={(e) => setEspecificidade(Number(e.target.value))}
              className="mt-1 w-full accent-teal-600"
            />
          </div>
        </div>

        {/* A população dividida */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Os {round(N)} em quatro grupos
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border-2 border-teal-400 bg-teal-50 dark:bg-teal-950/50 p-3">
              <div className="text-[11px] font-bold text-teal-800 dark:text-teal-200">
                Doentes com teste +
              </div>
              <div className="font-mono text-xl font-bold tabular-nums text-teal-900 dark:text-teal-100">
                {round(verdPos)}
              </div>
              <div className="text-[10px] text-teal-700 dark:text-teal-300">verdadeiro positivo</div>
            </div>

            <div className="rounded-lg border-2 border-red-400 bg-red-50 dark:bg-red-950/50 p-3">
              <div className="text-[11px] font-bold text-red-800 dark:text-red-200">
                Sadios com teste +
              </div>
              <div className="font-mono text-xl font-bold tabular-nums text-red-900 dark:text-red-100">
                {round(falsoPos)}
              </div>
              <div className="text-[10px] text-red-700 dark:text-red-300">falso positivo</div>
            </div>

            <div className="rounded-lg border border-gray-300 dark:border-gray-700 p-3 opacity-70">
              <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                Doentes com teste −
              </div>
              <div className="font-mono text-xl font-bold tabular-nums">{round(falsoNeg)}</div>
              <div className="text-[10px] text-gray-500">falso negativo</div>
            </div>

            <div className="rounded-lg border border-gray-300 dark:border-gray-700 p-3 opacity-70">
              <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                Sadios com teste −
              </div>
              <div className="font-mono text-xl font-bold tabular-nums">{round(verdNeg)}</div>
              <div className="text-[10px] text-gray-500">verdadeiro negativo</div>
            </div>
          </div>

          {/* Barra dos positivos */}
          <div className="mt-4">
            <div className="mb-1 text-[11px] text-gray-600 dark:text-gray-400">
              Entre os {round(totalPos)} que testaram POSITIVO:
            </div>
            <div className="flex h-8 overflow-hidden rounded-lg">
              <div
                className="flex items-center justify-center bg-teal-500 text-[11px] font-bold text-white transition-all"
                style={{ width: `${totalPos > 0 ? (verdPos / totalPos) * 100 : 0}%` }}
              >
                {posterior > 0.12 ? 'doentes' : ''}
              </div>
              <div
                className="flex items-center justify-center bg-red-500 text-[11px] font-bold text-white transition-all"
                style={{ width: `${totalPos > 0 ? (falsoPos / totalPos) * 100 : 0}%` }}
              >
                {1 - posterior > 0.12 ? 'sadios (alarme falso)' : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border-2 border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/50 p-4 text-center">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">
            P(doente | teste positivo)
          </div>
          <div className="font-mono text-3xl font-bold text-teal-900 dark:text-teal-100">
            {pct(posterior)}
          </div>
          <div className="mt-2 font-mono text-xs text-teal-800 dark:text-teal-200">
            = {round(verdPos)} / ({round(verdPos)} + {round(falsoPos)})
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            A mesma conta, na fórmula
          </div>
          <div className="overflow-x-auto whitespace-pre font-mono text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            {`P(D|+) =        P(+|D) · P(D)
          ─────────────────────────────────
          P(+|D)·P(D) + P(+|S)·P(S)

       =        ${sens.toFixed(2)} × ${p.toFixed(2)}
          ─────────────────────────────────
          ${sens.toFixed(2)}×${p.toFixed(2)} + ${(1 - esp).toFixed(2)}×${(1 - p).toFixed(2)}

       = ${pct(posterior)}`}
          </div>
        </div>

        <div className="rounded-lg border border-teal-200 dark:border-teal-800 bg-white dark:bg-gray-900 p-4 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
          O denominador é o <strong>teorema da probabilidade total</strong>: para achar quantos testaram
          positivo, você soma os positivos que vieram dos doentes com os que vieram dos sadios. Bayes é
          só a divisão de um pedaço desse total pelo total.
        </div>

        <div className="rounded-lg bg-teal-100 dark:bg-teal-900/40 p-3 text-sm text-teal-900 dark:text-teal-100">
          🎯 <strong>Deixe prevalência em 1% e especificidade em 95%.</strong> Mesmo com sensibilidade de
          99%, só cerca de 17% dos positivos estão realmente doentes — porque há muito mais gente sadia,
          e 5% de um grupo enorme gera mais alarmes falsos do que existem doentes. É por isso que P(D|+)
          e P(+|D) são <strong>coisas completamente diferentes</strong>, e trocá-las é o erro clássico.
        </div>
      </div>
    </div>
  );
}
