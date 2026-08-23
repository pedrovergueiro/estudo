'use client';

import React, { useState } from 'react';

interface Racional {
  id: string;
  rotulo: string;
  f: (x: number) => number;
  /** Assíntotas verticais: as raízes do denominador que não cancelam. */
  verticais: number[];
  /** Assíntota horizontal, ou null quando não existe. */
  horizontal: number | null;
  grauCima: number;
  grauBaixo: number;
  regra: string;
  observacao: string;
}

const FUNCOES: Racional[] = [
  {
    id: 'f1',
    rotulo: '1 / (x − 2)',
    f: (x) => 1 / (x - 2),
    verticais: [2],
    horizontal: 0,
    grauCima: 0,
    grauBaixo: 1,
    regra: 'grau de cima MENOR que o de baixo → y = 0',
    observacao:
      'Denominador zera em x = 2, e o numerador vale 1 ali (não zera junto) — logo x = 2 é assíntota ' +
      'vertical de verdade. Pela esquerda a função despenca para −∞, pela direita dispara para +∞.',
  },
  {
    id: 'f2',
    rotulo: '(x + 2) / (x − 4)',
    f: (x) => (x + 2) / (x - 4),
    verticais: [4],
    horizontal: 1,
    grauCima: 1,
    grauBaixo: 1,
    regra: 'graus IGUAIS → y = razão dos coeficientes dominantes = 1/1 = 1',
    observacao:
      'Com graus iguais, a assíntota horizontal é a divisão dos coeficientes que acompanham a maior ' +
      'potência. Aqui é 1 dividido por 1. Não confunda com os números soltos (+2 e −4): eles não entram nessa conta.',
  },
  {
    id: 'f3',
    rotulo: '(2x − 1) / (x + 3)',
    f: (x) => (2 * x - 1) / (x + 3),
    verticais: [-3],
    horizontal: 2,
    grauCima: 1,
    grauBaixo: 1,
    regra: 'graus IGUAIS → y = 2/1 = 2',
    observacao:
      'A assíntota horizontal em y = 2 aparece porque, para x gigante, o 2x domina o −1 e o x domina o +3. ' +
      'Sobra 2x/x = 2. Esse é o raciocínio do "termo dominante".',
  },
  {
    id: 'f4',
    rotulo: '(x² + 1) / (x² − 4)',
    f: (x) => (x * x + 1) / (x * x - 4),
    verticais: [-2, 2],
    horizontal: 1,
    grauCima: 2,
    grauBaixo: 2,
    regra: 'graus IGUAIS → y = 1/1 = 1',
    observacao:
      'Duas assíntotas verticais, porque x² − 4 = (x − 2)(x + 2) zera em dois lugares. Fatorar o ' +
      'denominador não é opcional aqui — sem isso você acha só metade das assíntotas.',
  },
  {
    id: 'f5',
    rotulo: '(x² − 9) / (x² + 1)',
    f: (x) => (x * x - 9) / (x * x + 1),
    verticais: [],
    horizontal: 1,
    grauCima: 2,
    grauBaixo: 2,
    regra: 'graus IGUAIS → y = 1/1 = 1',
    observacao:
      'Sem assíntota vertical nenhuma: x² + 1 nunca zera nos reais (é sempre ≥ 1). Domínio é ℝ inteiro. ' +
      'Ter fração NÃO garante assíntota vertical — o denominador precisa realmente zerar.',
  },
  {
    id: 'f6',
    rotulo: '(5x² + 2) / (x² − 1)',
    f: (x) => (5 * x * x + 2) / (x * x - 1),
    verticais: [-1, 1],
    horizontal: 5,
    grauCima: 2,
    grauBaixo: 2,
    regra: 'graus IGUAIS → y = 5/1 = 5',
    observacao:
      'Duas verticais (x = ±1) e uma horizontal em y = 5. Repare que o gráfico CRUZA a região da ' +
      'horizontal perto do centro: assíntota é comportamento no infinito, não uma barreira.',
  },
  {
    id: 'f7',
    rotulo: '(3x² + 1) / (x³ + 2)',
    f: (x) => (3 * x * x + 1) / (x * x * x + 2),
    verticais: [-Math.cbrt(2)],
    horizontal: 0,
    grauCima: 2,
    grauBaixo: 3,
    regra: 'grau de cima MENOR que o de baixo → y = 0',
    observacao:
      'Embaixo cresce mais rápido que em cima, então a fração é esmagada para zero quando x → ±∞. ' +
      'Sempre que o denominador tiver grau maior, a horizontal é o eixo x.',
  },
];

const XMIN = -10;
const XMAX = 10;
const YMIN = -10;
const YMAX = 10;
const W = 420;
const H = 300;

function toSvg(x: number, y: number): [number, number] {
  return [
    ((x - XMIN) / (XMAX - XMIN)) * W,
    H - ((y - YMIN) / (YMAX - YMIN)) * H,
  ];
}

/** Quebra a curva em pedaços sempre que ela sai da tela ou salta uma assíntota. */
function construirCaminhos(f: (x: number) => number): string[] {
  const caminhos: string[] = [];
  let atual: string[] = [];
  const passo = (XMAX - XMIN) / 1200;

  for (let x = XMIN; x <= XMAX; x += passo) {
    const y = f(x);
    if (!Number.isFinite(y) || y < YMIN || y > YMAX) {
      if (atual.length > 1) caminhos.push(atual.join(' '));
      atual = [];
      continue;
    }
    const [sx, sy] = toSvg(x, y);
    atual.push(`${atual.length === 0 ? 'M' : 'L'}${sx.toFixed(2)},${sy.toFixed(2)}`);
  }
  if (atual.length > 1) caminhos.push(atual.join(' '));
  return caminhos;
}

/** Explorador de assíntotas: onde a função explode e para onde ela se acomoda. */
export function AsymptoteExplorer() {
  const [ativo, setAtivo] = useState(FUNCOES[0].id);
  const f = FUNCOES.find((x) => x.id === ativo)!;
  const caminhos = construirCaminhos(f.f);

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30">
      <div className="bg-rose-100 dark:bg-rose-900/50 px-5 py-3">
        <h4 className="font-bold text-rose-900 dark:text-rose-100">
          📈 Assíntotas: onde a função explode e onde ela se acomoda
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
                className={`rounded-md px-3 py-1.5 font-mono text-xs font-bold transition ${
                  ativo === op.id
                    ? 'bg-rose-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {op.rotulo}
              </button>
            ))}
          </div>
        </div>

        {/* Gráfico */}
        <div className="overflow-x-auto rounded-lg bg-white dark:bg-gray-900 p-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto block h-auto w-full max-w-[420px]"
            role="img"
            aria-label={`Gráfico de ${f.rotulo} com suas assíntotas`}
          >
            {/* Grade */}
            {[-8, -6, -4, -2, 2, 4, 6, 8].map((n) => {
              const [gx] = toSvg(n, 0);
              const [, gy] = toSvg(0, n);
              return (
                <g key={n}>
                  <line x1={gx} y1={0} x2={gx} y2={H} stroke="currentColor" strokeWidth={0.5} className="text-gray-200 dark:text-gray-800" />
                  <line x1={0} y1={gy} x2={W} y2={gy} stroke="currentColor" strokeWidth={0.5} className="text-gray-200 dark:text-gray-800" />
                </g>
              );
            })}

            {/* Eixos */}
            <line x1={toSvg(0, 0)[0]} y1={0} x2={toSvg(0, 0)[0]} y2={H} stroke="currentColor" strokeWidth={1.5} className="text-gray-400 dark:text-gray-600" />
            <line x1={0} y1={toSvg(0, 0)[1]} x2={W} y2={toSvg(0, 0)[1]} stroke="currentColor" strokeWidth={1.5} className="text-gray-400 dark:text-gray-600" />

            {/* Assíntotas verticais */}
            {f.verticais.map((v) => {
              const [vx] = toSvg(v, 0);
              return (
                <g key={`v${v}`}>
                  <line x1={vx} y1={0} x2={vx} y2={H} stroke="#e11d48" strokeWidth={2} strokeDasharray="6 4" />
                  <text x={vx + 4} y={14} fontSize={11} fill="#e11d48" fontFamily="monospace">
                    x = {Number(v.toFixed(2))}
                  </text>
                </g>
              );
            })}

            {/* Assíntota horizontal */}
            {f.horizontal !== null && (
              <g>
                <line
                  x1={0}
                  y1={toSvg(0, f.horizontal)[1]}
                  x2={W}
                  y2={toSvg(0, f.horizontal)[1]}
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                <text
                  x={6}
                  y={toSvg(0, f.horizontal)[1] - 5}
                  fontSize={11}
                  fill="#2563eb"
                  fontFamily="monospace"
                >
                  y = {f.horizontal}
                </text>
              </g>
            )}

            {/* Curva */}
            {caminhos.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#0f766e" strokeWidth={2.2} />
            ))}
          </svg>

          <div className="mt-2 flex flex-wrap justify-center gap-4 text-[11px]">
            <span className="text-rose-600">┊ assíntota vertical</span>
            <span className="text-blue-600">┈ assíntota horizontal</span>
            <span className="text-teal-700 dark:text-teal-500">— a função</span>
          </div>
        </div>

        {/* Leitura */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400">
              Verticais — onde o denominador zera
            </div>
            <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
              {f.verticais.length === 0
                ? 'nenhuma — o denominador nunca zera'
                : f.verticais.map((v) => `x = ${Number(v.toFixed(3))}`).join('   ')}
            </div>
          </div>

          <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Horizontal — comparando os graus
            </div>
            <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
              grau {f.grauCima} / grau {f.grauBaixo}
            </div>
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{f.regra}</div>
          </div>
        </div>

        <div className="rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-gray-900 p-4 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
          {f.observacao}
        </div>

        <div className="rounded-lg bg-rose-100 dark:bg-rose-900/40 p-3 text-sm text-rose-900 dark:text-rose-100">
          🎯 <strong>Compare (x² + 1)/(x² − 4) com (x² − 9)/(x² + 1):</strong> as duas têm grau 2 em cima
          e embaixo, mesma horizontal y = 1. Mas só a primeira tem assíntota vertical. A diferença está
          inteira no denominador: um zera, o outro nunca.
        </div>
      </div>
    </div>
  );
}
