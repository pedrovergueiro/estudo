'use client';

import React, { useState } from 'react';

function fatorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
const arranjo = (n: number, r: number) => fatorial(n) / fatorial(n - r);
const combinacao = (n: number, r: number) => arranjo(n, r) / fatorial(r);

const fmt = (v: number) => v.toLocaleString('pt-BR');

/** Permutação x combinação: a única pergunta que separa as duas é "a ordem importa?". */
export function CountingExplorer() {
  const [n, setN] = useState(5);
  const [r, setR] = useState(3);
  const [ordemImporta, setOrdemImporta] = useState(true);

  const rr = Math.min(r, n);
  const a = arranjo(n, rr);
  const c = combinacao(n, rr);
  const resultado = ordemImporta ? a : c;

  const letras = 'ABCDEFGH'.slice(0, n).split('');

  // Gera as listagens só quando são pequenas o suficiente para caber na tela.
  const listar = (): string[] => {
    if (a > 60) return [];
    const saida: string[] = [];
    const percorre = (atual: string[], restantes: string[]) => {
      if (atual.length === rr) {
        saida.push(atual.join(''));
        return;
      }
      restantes.forEach((x, i) => {
        percorre(
          [...atual, x],
          ordemImporta ? restantes.filter((_, j) => j !== i) : restantes.slice(i + 1)
        );
      });
    };
    percorre([], letras);
    return saida;
  };
  const lista = listar();

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-cyan-200 dark:border-cyan-900 bg-cyan-50/50 dark:bg-cyan-950/30">
      <div className="bg-cyan-100 dark:bg-cyan-900/50 px-5 py-3">
        <h4 className="font-bold text-cyan-900 dark:text-cyan-100">
          🎲 Contagem: a ordem importa ou não?
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>n — quantos objetos existem</span>
              <span className="font-mono font-bold">{n}</span>
            </label>
            <input
              type="range"
              min={2}
              max={8}
              value={n}
              onChange={(e) => {
                const v = Number(e.target.value);
                setN(v);
                if (r > v) setR(v);
              }}
              className="mt-1 w-full accent-cyan-600"
            />
          </div>

          <div>
            <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>r — quantos você escolhe</span>
              <span className="font-mono font-bold">{rr}</span>
            </label>
            <input
              type="range"
              min={1}
              max={n}
              value={rr}
              onChange={(e) => setR(Number(e.target.value))}
              className="mt-1 w-full accent-cyan-600"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
            A ordem em que eles saem faz diferença?
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setOrdemImporta(true)}
              className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                ordemImporta
                  ? 'bg-cyan-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              SIM — pódio, senha, cargos
            </button>
            <button
              onClick={() => setOrdemImporta(false)}
              className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                !ordemImporta
                  ? 'bg-cyan-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              NÃO — comissão, mão de cartas
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 text-center">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {ordemImporta ? 'Arranjo (permutação de r em n)' : 'Combinação'}
          </div>
          <div className="font-mono text-lg font-bold text-gray-900 dark:text-gray-100">
            {ordemImporta ? (
              <>
                ₙPᵣ = n! / (n − r)! = {n}! / {n - rr}!
              </>
            ) : (
              <>
                C(n, r) = n! / [r!(n − r)!] = {n}! / [{rr}!·{n - rr}!]
              </>
            )}
          </div>
          <div className="mt-2 font-mono text-3xl font-bold text-cyan-600 dark:text-cyan-400">
            {fmt(resultado)}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className={`rounded-lg border-2 p-3 text-center transition ${
              ordemImporta
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/50'
                : 'border-gray-200 dark:border-gray-700 opacity-60'
            }`}
          >
            <div className="text-xs text-gray-600 dark:text-gray-400">com ordem</div>
            <div className="font-mono text-xl font-bold tabular-nums">{fmt(a)}</div>
          </div>
          <div
            className={`rounded-lg border-2 p-3 text-center transition ${
              !ordemImporta
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/50'
                : 'border-gray-200 dark:border-gray-700 opacity-60'
            }`}
          >
            <div className="text-xs text-gray-600 dark:text-gray-400">sem ordem</div>
            <div className="font-mono text-xl font-bold tabular-nums">{fmt(c)}</div>
          </div>
        </div>

        <div className="rounded-lg border border-cyan-200 dark:border-cyan-800 bg-white dark:bg-gray-900 p-4 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
          A combinação é sempre <strong>menor ou igual</strong> ao arranjo — aqui, {fmt(a)} contra{' '}
          {fmt(c)}, uma razão de exatamente {rr}! = {fmt(fatorial(rr))}. O motivo é direto: cada grupo
          sem ordem foi contado {fmt(fatorial(rr))} vezes na versão com ordem, uma para cada maneira de
          embaralhar os {rr} escolhidos. Dividir por r! é justamente desfazer essa contagem repetida.
        </div>

        {lista.length > 0 && (
          <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Todos os {lista.length} casos, listados
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lista.map((x) => (
                <span
                  key={x}
                  className="rounded bg-cyan-100 dark:bg-cyan-900/40 px-2 py-0.5 font-mono text-xs text-cyan-900 dark:text-cyan-100"
                >
                  {x}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg bg-cyan-100 dark:bg-cyan-900/40 p-3 text-sm text-cyan-900 dark:text-cyan-100">
          🎯 <strong>Coloque n = 4 e r = 2 e alterne o botão.</strong> Com ordem aparecem AB e BA como
          casos diferentes; sem ordem, só AB. Ver a lista lado a lado é o que faz a fórmula parar de ser
          decoreba.
        </div>
      </div>
    </div>
  );
}
