'use client';

import React, { useState } from 'react';

type Op = 'soma' | 'subtracao';

/** Reta numérica: somar anda pra direita, subtrair anda pra esquerda. */
export function NumberLineExplorer() {
  const [inicio, setInicio] = useState(5);
  const [op, setOp] = useState<Op>('subtracao');
  const [valor, setValor] = useState(-3);

  const resultado = op === 'soma' ? inicio + valor : inicio - valor;
  const deslocamento = resultado - inicio;
  const paraDireita = deslocamento > 0;

  const min = -12;
  const max = 12;
  const pos = (n: number) => ((n - min) / (max - min)) * 100;

  const explicacao = (() => {
    if (op === 'subtracao' && valor < 0) {
      return `Subtrair um número negativo: ${inicio} − (${valor}). Os dois sinais de menos se cancelam e viram MAIS: ${inicio} + ${Math.abs(valor)} = ${resultado}. Por isso você andou para a DIREITA, mesmo o enunciado dizendo "menos".`;
    }
    if (op === 'subtracao' && valor > 0) {
      return `Subtrair um positivo: ${inicio} − ${valor} = ${resultado}. Anda para a esquerda, o caso mais intuitivo.`;
    }
    if (op === 'soma' && valor < 0) {
      return `Somar um número negativo: ${inicio} + (${valor}) = ${resultado}. Somar algo negativo é a mesma coisa que subtrair — por isso anda para a esquerda.`;
    }
    return `Somar um positivo: ${inicio} + ${valor} = ${resultado}. Anda para a direita.`;
  })();

  return (
    <div className="my-8 rounded-xl border-2 border-sky-200 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/30 overflow-hidden">
      <div className="bg-sky-100 dark:bg-sky-900/50 px-5 py-3">
        <h4 className="font-bold text-sky-900 dark:text-sky-100">
          ↔️ A reta numérica: para que lado a conta te leva
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Começar em</span>
              <span className="font-mono font-bold">{inicio}</span>
            </label>
            <input
              type="range"
              min={-8}
              max={8}
              value={inicio}
              onChange={(e) => setInicio(Number(e.target.value))}
              className="mt-1 w-full accent-sky-600"
            />
          </div>

          <div>
            <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">Operação</div>
            <div className="flex gap-1">
              {(
                [
                  ['soma', '+'],
                  ['subtracao', '−'],
                ] as [Op, string][]
              ).map(([id, s]) => (
                <button
                  key={id}
                  onClick={() => setOp(id)}
                  className={`flex-1 rounded-md py-1.5 font-mono text-lg font-bold transition ${
                    op === id
                      ? 'bg-sky-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Este número</span>
              <span className="font-mono font-bold">{valor}</span>
            </label>
            <input
              type="range"
              min={-8}
              max={8}
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              className="mt-1 w-full accent-sky-600"
            />
          </div>
        </div>

        {/* A conta */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 text-center">
          <div className="font-mono text-2xl font-bold text-gray-900 dark:text-gray-100">
            {inicio} {op === 'soma' ? '+' : '−'} {valor < 0 ? `(${valor})` : valor} ={' '}
            <span className="text-sky-600 dark:text-sky-400">{resultado}</span>
          </div>
        </div>

        {/* Reta */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-5">
          <div className="relative h-24">
            {/* Linha */}
            <div className="absolute left-0 right-0 top-12 h-0.5 bg-gray-400 dark:bg-gray-600" />

            {/* Marcas */}
            {Array.from({ length: max - min + 1 }, (_, k) => min + k)
              .filter((n) => n % 2 === 0)
              .map((n) => (
                <div
                  key={n}
                  className="absolute top-12 -translate-x-1/2"
                  style={{ left: `${pos(n)}%` }}
                >
                  <div className="h-2 w-0.5 bg-gray-400 dark:bg-gray-600" />
                  <div className="mt-1 -translate-x-1/2 text-[10px] text-gray-500">{n}</div>
                </div>
              ))}

            {/* Zero destacado */}
            <div
              className="absolute top-9 -translate-x-1/2"
              style={{ left: `${pos(0)}%` }}
            >
              <div className="h-6 w-0.5 bg-gray-900 dark:bg-gray-200" />
            </div>

            {/* Seta do movimento */}
            <div
              className="absolute top-6 h-1.5 rounded-full transition-all duration-300"
              style={{
                left: `${pos(Math.min(inicio, resultado))}%`,
                width: `${Math.abs(pos(resultado) - pos(inicio))}%`,
                backgroundColor: paraDireita ? '#16a34a' : '#dc2626',
              }}
            />

            {/* Ponto inicial */}
            <div
              className="absolute top-10 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white bg-gray-700 dark:bg-gray-300 transition-all duration-300"
              style={{ left: `${pos(inicio)}%` }}
            />

            {/* Ponto final */}
            <div
              className="absolute top-10 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white transition-all duration-300"
              style={{
                left: `${pos(resultado)}%`,
                backgroundColor: paraDireita ? '#16a34a' : '#dc2626',
              }}
            />

            {/* Rótulo do movimento */}
            <div
              className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-xs font-bold transition-all duration-300"
              style={{
                left: `${(pos(inicio) + pos(resultado)) / 2}%`,
                color: paraDireita ? '#16a34a' : '#dc2626',
              }}
            >
              {deslocamento === 0
                ? 'não saiu do lugar'
                : `${Math.abs(deslocamento)} para a ${paraDireita ? 'direita →' : '← esquerda'}`}
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-900 border border-sky-200 dark:border-sky-800 p-4 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
          {explicacao}
        </div>

        <div className="rounded-lg bg-sky-100 dark:bg-sky-900/40 p-3 text-sm text-sky-900 dark:text-sky-100">
          🎯 <strong>Teste o caso que mais confunde:</strong> deixe a operação em{' '}
          <strong>−</strong> e arraste o último controle para um valor <strong>negativo</strong>.
          Você vai ver a seta apontar para a DIREITA — porque menos com menos vira mais.
        </div>
      </div>
    </div>
  );
}
