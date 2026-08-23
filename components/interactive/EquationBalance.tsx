'use client';

import React, { useState } from 'react';

interface Estado {
  a: number; // coeficiente de x
  b: number; // termo solto do lado esquerdo
  c: number; // lado direito
}

const INICIAL: Estado = { a: 3, b: 6, c: 15 };

function escrever({ a, b, c }: Estado) {
  const esq =
    (a === 1 ? 'x' : a === -1 ? '−x' : `${a}x`) +
    (b === 0 ? '' : b > 0 ? ` + ${b}` : ` − ${Math.abs(b)}`);
  return `${esq} = ${c}`;
}

/** A balança: o que se faz de um lado, faz-se do outro. */
export function EquationBalance() {
  const [est, setEst] = useState<Estado>(INICIAL);
  const [historico, setHistorico] = useState<{ eq: string; op: string; nota: string }[]>([
    { eq: escrever(INICIAL), op: 'Equação inicial', nota: 'Objetivo: deixar o x sozinho de um lado.' },
  ]);

  const resolvido = est.a === 1 && est.b === 0;

  const aplicar = (op: string, novo: Estado, nota: string) => {
    setEst(novo);
    setHistorico((h) => [...h, { eq: escrever(novo), op, nota }]);
  };

  const acoes: { rotulo: string; onClick: () => void; util: boolean }[] = [];

  if (est.b !== 0) {
    const s = est.b > 0 ? `− ${est.b}` : `+ ${Math.abs(est.b)}`;
    acoes.push({
      rotulo: `${s} nos dois lados`,
      util: true,
      onClick: () =>
        aplicar(
          `${s} nos dois lados`,
          { ...est, b: 0, c: est.c - est.b },
          `O ${Math.abs(est.b)} estava ${est.b > 0 ? 'somando' : 'subtraindo'} do lado esquerdo. ` +
            `Fazendo a operação inversa nos DOIS lados, ele some da esquerda e o lado direito vira ${est.c - est.b}. ` +
            `A balança continua equilibrada porque os dois pratos mudaram igual.`
        ),
    });
  }

  if (est.a !== 1 && est.b === 0) {
    acoes.push({
      rotulo: `÷ ${est.a} nos dois lados`,
      util: true,
      onClick: () =>
        aplicar(
          `÷ ${est.a} nos dois lados`,
          { a: 1, b: 0, c: est.c / est.a },
          `O x estava multiplicado por ${est.a}. Dividindo os dois lados por ${est.a}, ` +
            `o x fica sozinho e o lado direito vira ${est.c}/${est.a} = ${est.c / est.a}. Resolvido.`
        ),
    });
  }

  if (est.a !== 1 && est.b !== 0) {
    acoes.push({
      rotulo: `÷ ${est.a} nos dois lados`,
      util: false,
      onClick: () =>
        aplicar(
          `÷ ${est.a} nos dois lados`,
          { a: 1, b: est.b / est.a, c: est.c / est.a },
          `Funcionou, mas complicou: dividir TUDO por ${est.a} criou frações no caminho. ` +
            `É mais limpo tirar primeiro o termo solto e só depois dividir. Dá no mesmo resultado, ` +
            `mas com menos chance de errar conta.`
        ),
    });
  }

  acoes.push({
    rotulo: '× 2 nos dois lados',
    util: false,
    onClick: () =>
      aplicar(
        '× 2 nos dois lados',
        { a: est.a * 2, b: est.b * 2, c: est.c * 2 },
        'Operação válida — a balança continua equilibrada e a solução não mudou. Mas não te ' +
          'aproximou de isolar o x: só deixou os números maiores. Nem toda operação legal é útil.'
      ),
  });

  return (
    <div className="my-8 rounded-xl border-2 border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30 overflow-hidden">
      <div className="bg-purple-100 dark:bg-purple-900/50 px-5 py-3">
        <h4 className="font-bold text-purple-900 dark:text-purple-100">
          ⚖️ A balança — escolha o que fazer nos dois lados
        </h4>
      </div>

      <div className="space-y-5 p-5">
        {/* Balança */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-6">
          <div className="flex items-center justify-center gap-4">
            <div className="flex-1 rounded-lg border-2 border-purple-400 bg-purple-50 dark:bg-purple-900/40 py-6 text-center">
              <div className="font-mono text-2xl font-bold text-purple-900 dark:text-purple-100">
                {escrever(est).split(' = ')[0]}
              </div>
            </div>

            <div className="text-3xl font-bold text-gray-500">=</div>

            <div className="flex-1 rounded-lg border-2 border-purple-400 bg-purple-50 dark:bg-purple-900/40 py-6 text-center">
              <div className="font-mono text-2xl font-bold text-purple-900 dark:text-purple-100">
                {escrever(est).split(' = ')[1]}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="text-lg">⚖️</span>
            <span>
              equilibrada — os dois lados valem a mesma coisa, e vão continuar valendo depois de
              cada operação
            </span>
          </div>
        </div>

        {/* Ações */}
        {!resolvido ? (
          <div>
            <div className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              O que você faz agora?
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {acoes.map((a) => (
                <button
                  key={a.rotulo}
                  onClick={a.onClick}
                  className="rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 font-mono text-sm font-semibold text-gray-800 dark:text-gray-200 transition hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                >
                  {a.rotulo}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Pode errar à vontade: toda opção aqui é matematicamente válida. Algumas só não ajudam
              — e ver isso acontecer ensina mais do que ler a regra.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-5 text-center">
            <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
              🎉 Isolado: x = {est.c}
            </div>
            <p className="mt-2 text-sm text-emerald-900 dark:text-emerald-100">
              Confira substituindo na equação original: {INICIAL.a}({est.c}) + {INICIAL.b} ={' '}
              {INICIAL.a * est.c + INICIAL.b} ✓. Conferir é rápido e pega quase todo erro de sinal.
            </p>
            <button
              onClick={() => {
                setEst(INICIAL);
                setHistorico([
                  {
                    eq: escrever(INICIAL),
                    op: 'Equação inicial',
                    nota: 'Objetivo: deixar o x sozinho de um lado.',
                  },
                ]);
              }}
              className="mt-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition"
            >
              Tentar de novo por outro caminho
            </button>
          </div>
        )}

        {/* Histórico */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
            O que você fez até agora
          </div>
          <div className="space-y-3">
            {historico.map((h, n) => (
              <div key={n} className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
                  {n}
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100">
                    {h.eq}
                  </div>
                  <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                    {h.op}
                  </div>
                  <div className="mt-0.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    {h.nota}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
