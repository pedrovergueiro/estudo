'use client';

import React, { useState } from 'react';

interface Faixa {
  de: number;
  ate: number;
  fechadoEsq: boolean;
  fechadoDir: boolean;
}

interface Funcao {
  id: string;
  rotulo: string;
  /** O que na expressão impõe restrição, em ordem de leitura. */
  condicoes: { parte: string; regra: string; resultado: string }[];
  faixas: Faixa[];
  /** Pontos removidos de dentro de uma faixa (bolinha aberta). */
  buracos: number[];
  intervalo: string;
  leitura: string;
}

const MIN = -8;
const MAX = 8;

const FUNCOES: Funcao[] = [
  {
    id: 'raiz',
    rotulo: '√(x + 3)',
    condicoes: [
      {
        parte: 'x + 3',
        regra: 'está dentro de uma raiz quadrada, então não pode ser negativo',
        resultado: 'x + 3 ≥ 0  →  x ≥ −3',
      },
    ],
    faixas: [{ de: -3, ate: MAX, fechadoEsq: true, fechadoDir: false }],
    buracos: [],
    intervalo: '[−3, +∞)',
    leitura:
      'Só existe UMA restrição: o que está sob a raiz precisa ser ≥ 0. Em x = −3 a raiz vale √0 = 0, ' +
      'que é um número real perfeitamente válido — por isso o −3 ENTRA no domínio (colchete, bolinha cheia).',
  },
  {
    id: 'fracao',
    rotulo: '1 / (x − 2)',
    condicoes: [
      {
        parte: 'x − 2',
        regra: 'está no denominador, então não pode ser zero',
        resultado: 'x − 2 ≠ 0  →  x ≠ 2',
      },
    ],
    faixas: [{ de: MIN, ate: MAX, fechadoEsq: false, fechadoDir: false }],
    buracos: [2],
    intervalo: 'ℝ − {2}   ou   (−∞, 2) ∪ (2, +∞)',
    leitura:
      'Denominador zero não é "dá zero", é "não existe". Todos os outros reais servem, então o domínio é ' +
      'a reta inteira com UM furo. Repare que o furo é uma bolinha aberta: o 2 é o único número proibido.',
  },
  {
    id: 'raiz-invertida',
    rotulo: '√(5 − x)',
    condicoes: [
      {
        parte: '5 − x',
        regra: 'está dentro de uma raiz quadrada, então não pode ser negativo',
        resultado: '5 − x ≥ 0  →  −x ≥ −5  →  x ≤ 5',
      },
    ],
    faixas: [{ de: MIN, ate: 5, fechadoEsq: false, fechadoDir: true }],
    buracos: [],
    intervalo: '(−∞, 5]',
    leitura:
      'A pegadinha clássica: ao isolar o x você multiplica os dois lados por −1, e isso VIRA o sinal da ' +
      'desigualdade (≥ passa a ≤). Quem esquece disso responde x ≥ 5 e erra o domínio inteiro. ' +
      'Confira com um número: x = 0 dá √5 ✓, e x = 10 dá √(−5) ✗.',
  },
  {
    id: 'quadratica',
    rotulo: '1 / (x² − 9)',
    condicoes: [
      {
        parte: 'x² − 9',
        regra: 'está no denominador, então não pode ser zero',
        resultado: 'x² − 9 ≠ 0  →  x ≠ 3 e x ≠ −3',
      },
    ],
    faixas: [{ de: MIN, ate: MAX, fechadoEsq: false, fechadoDir: false }],
    buracos: [-3, 3],
    intervalo: 'ℝ − {−3, 3}',
    leitura:
      'Fatore antes de concluir: x² − 9 = (x − 3)(x + 3). Um produto zera quando QUALQUER fator zera, ' +
      'então há dois furos, não um. Esquecer a raiz negativa é o erro mais comum aqui.',
  },
  {
    id: 'mista',
    rotulo: '√(x − 2) / (x − 5)',
    condicoes: [
      {
        parte: 'x − 2',
        regra: 'está sob a raiz, então precisa ser ≥ 0',
        resultado: 'x − 2 ≥ 0  →  x ≥ 2',
      },
      {
        parte: 'x − 5',
        regra: 'está no denominador, então precisa ser ≠ 0',
        resultado: 'x − 5 ≠ 0  →  x ≠ 5',
      },
    ],
    faixas: [{ de: 2, ate: MAX, fechadoEsq: true, fechadoDir: false }],
    buracos: [5],
    intervalo: '[2, 5) ∪ (5, +∞)',
    leitura:
      'Duas restrições ao mesmo tempo: as duas precisam valer JUNTAS. Comece pela raiz (x ≥ 2), ' +
      'depois abra o furo do denominador dentro dessa faixa. O resultado é um intervalo quebrado em dois — ' +
      'e é exatamente por isso que a resposta usa união (∪).',
  },
  {
    id: 'mista2',
    rotulo: '√(4 − x) / (x + 1)',
    condicoes: [
      {
        parte: '4 − x',
        regra: 'está sob a raiz, então precisa ser ≥ 0',
        resultado: '4 − x ≥ 0  →  x ≤ 4',
      },
      {
        parte: 'x + 1',
        regra: 'está no denominador, então precisa ser ≠ 0',
        resultado: 'x + 1 ≠ 0  →  x ≠ −1',
      },
    ],
    faixas: [{ de: MIN, ate: 4, fechadoEsq: false, fechadoDir: true }],
    buracos: [-1],
    intervalo: '(−∞, −1) ∪ (−1, 4]',
    leitura:
      'Junta as duas pegadinhas: o sinal que vira (x ≤ 4, não x ≥ 4) e o furo do denominador, que aqui cai ' +
      'DENTRO da faixa permitida. Se o furo caísse fora dela, nem precisaria aparecer na resposta.',
  },
];

/** Inspetor de domínio: o que quebra a função e como isso vira intervalo. */
export function DomainInspector() {
  const [ativo, setAtivo] = useState(FUNCOES[0].id);
  const f = FUNCOES.find((x) => x.id === ativo)!;

  const pos = (n: number) => ((n - MIN) / (MAX - MIN)) * 100;
  const marcas = [-8, -6, -4, -2, 0, 2, 4, 6, 8];

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30">
      <div className="bg-emerald-100 dark:bg-emerald-900/50 px-5 py-3">
        <h4 className="font-bold text-emerald-900 dark:text-emerald-100">
          🔍 Inspetor de domínio: o que a expressão proíbe
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">Escolha a função</div>
          <div className="flex flex-wrap gap-2">
            {FUNCOES.map((op) => (
              <button
                key={op.id}
                onClick={() => setAtivo(op.id)}
                className={`rounded-md px-3 py-1.5 font-mono text-sm font-bold transition ${
                  ativo === op.id
                    ? 'bg-emerald-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {op.rotulo}
              </button>
            ))}
          </div>
        </div>

        {/* Passo 1: caçar as restrições */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Passo 1 — quem impõe restrição
          </div>
          <div className="space-y-3">
            {f.condicoes.map((c, i) => (
              <div key={i} className="flex flex-wrap items-baseline gap-2 text-sm">
                <span className="rounded bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 font-mono font-bold text-amber-900 dark:text-amber-100">
                  {c.parte}
                </span>
                <span className="text-gray-700 dark:text-gray-300">{c.regra}</span>
                <span className="w-full font-mono text-emerald-700 dark:text-emerald-300">
                  {c.resultado}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Passo 2: desenhar na reta */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-5">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Passo 2 — pintar o que sobrou na reta
          </div>
          <div className="relative h-20">
            <div className="absolute left-0 right-0 top-8 h-0.5 bg-gray-300 dark:bg-gray-600" />

            {/* Faixas permitidas */}
            {f.faixas.map((faixa, i) => (
              <div
                key={i}
                className="absolute top-[29px] h-2 rounded-full bg-emerald-500"
                style={{
                  left: `${pos(faixa.de)}%`,
                  width: `${pos(faixa.ate) - pos(faixa.de)}%`,
                }}
              />
            ))}

            {/* Extremos das faixas */}
            {f.faixas.flatMap((faixa, i) => {
              const pontas: React.ReactNode[] = [];
              if (faixa.de > MIN) {
                pontas.push(
                  <div
                    key={`e${i}`}
                    className={`absolute top-[26px] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-emerald-600 ${
                      faixa.fechadoEsq ? 'bg-emerald-600' : 'bg-white dark:bg-gray-900'
                    }`}
                    style={{ left: `${pos(faixa.de)}%` }}
                  />
                );
              }
              if (faixa.ate < MAX) {
                pontas.push(
                  <div
                    key={`d${i}`}
                    className={`absolute top-[26px] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-emerald-600 ${
                      faixa.fechadoDir ? 'bg-emerald-600' : 'bg-white dark:bg-gray-900'
                    }`}
                    style={{ left: `${pos(faixa.ate)}%` }}
                  />
                );
              }
              return pontas;
            })}

            {/* Furos do denominador */}
            {f.buracos.map((b) => (
              <div key={b}>
                <div
                  className="absolute top-[26px] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-red-500 bg-white dark:bg-gray-900"
                  style={{ left: `${pos(b)}%` }}
                />
                <div
                  className="absolute top-0 -translate-x-1/2 text-[11px] font-bold text-red-600 dark:text-red-400"
                  style={{ left: `${pos(b)}%` }}
                >
                  ✗ {b}
                </div>
              </div>
            ))}

            {/* Marcas */}
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

          <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-gray-500 dark:text-gray-400">
            <span>● bolinha cheia = o número entra (colchete)</span>
            <span>○ bolinha vazia = o número fica de fora (parêntese)</span>
          </div>
        </div>

        {/* Passo 3: escrever */}
        <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 p-4 text-center">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            Passo 3 — escrever em forma de intervalo
          </div>
          <div className="font-mono text-lg font-bold text-emerald-900 dark:text-emerald-100">
            D(f) = {f.intervalo}
          </div>
        </div>

        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 p-4 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
          {f.leitura}
        </div>

        <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 p-3 text-sm text-emerald-900 dark:text-emerald-100">
          🎯 <strong>Compare √(x + 3) com √(5 − x):</strong> as duas são raízes, mas o intervalo aponta
          para lados opostos. A diferença é o sinal que acompanha o x — e é aí que quase todo mundo erra.
        </div>
      </div>
    </div>
  );
}
