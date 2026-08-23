'use client';

import React, { useState } from 'react';

interface Caso {
  id: string;
  expressao: string;
  ponto: number;
  pontoRotulo: string;
  f: (x: number) => number;
  simplificada: string;
  limite: number;
  limiteRotulo: string;
  fatoracao: string;
  comentario: string;
}

const CASOS: Caso[] = [
  {
    id: 'quadratica',
    expressao: '(x² − 4) / (x − 2)',
    ponto: 2,
    pontoRotulo: '2',
    f: (x) => (x * x - 4) / (x - 2),
    simplificada: 'x + 2',
    limite: 4,
    limiteRotulo: '4',
    fatoracao: 'x² − 4 = (x − 2)(x + 2)  →  o (x − 2) cancela com o de baixo',
    comentario:
      'Em x = 2 a expressão original dá 0/0 — não existe. Mas o limite não pergunta o valor EM 2, ' +
      'pergunta para onde a função aponta PERTO de 2. E ela aponta para 4, dos dois lados.',
  },
  {
    id: 'meio',
    expressao: '(4x² − 1) / (2x − 1)',
    ponto: 0.5,
    pontoRotulo: '1/2',
    f: (x) => (4 * x * x - 1) / (2 * x - 1),
    simplificada: '2x + 1',
    limite: 2,
    limiteRotulo: '2',
    fatoracao: '4x² − 1 = (2x − 1)(2x + 1)  →  diferença de quadrados, o (2x − 1) cancela',
    comentario:
      'Mesma ideia, disfarçada: 4x² − 1 é (2x)² − 1², uma diferença de quadrados. Reconhecer o produto ' +
      'notável é o que destrava a questão — sem isso você fica preso no 0/0.',
  },
  {
    id: 'cubica',
    expressao: '(x³ − 8) / (x − 2)',
    ponto: 2,
    pontoRotulo: '2',
    f: (x) => (x * x * x - 8) / (x - 2),
    simplificada: 'x² + 2x + 4',
    limite: 12,
    limiteRotulo: '12',
    fatoracao: 'x³ − 8 = (x − 2)(x² + 2x + 4)  →  diferença de cubos',
    comentario:
      'Esta é a questão 6 da lista: o L que torna a função contínua em p = 2 é exatamente este limite, ' +
      'L = 12. Continuidade em um ponto é isso — o valor da função tem que ser igual ao limite.',
  },
  {
    id: 'raiz',
    expressao: '(√x − 1) / (x − 1)',
    ponto: 1,
    pontoRotulo: '1',
    f: (x) => (Math.sqrt(x) - 1) / (x - 1),
    simplificada: '1 / (√x + 1)',
    limite: 0.5,
    limiteRotulo: '1/2 = 0,5',
    fatoracao: 'multiplique em cima e embaixo por (√x + 1): o numerador vira x − 1 e cancela',
    comentario:
      'Quando aparece raiz, fatorar não resolve — o truque é RACIONALIZAR: multiplicar por (√x + 1) ' +
      'em cima e embaixo. Isso transforma (√x − 1)(√x + 1) em x − 1, que cancela com o denominador.',
  },
  {
    id: 'linear',
    expressao: '(x² + x) / x',
    ponto: 0,
    pontoRotulo: '0',
    f: (x) => (x * x + x) / x,
    simplificada: 'x + 1',
    limite: 1,
    limiteRotulo: '1',
    fatoracao: 'x² + x = x(x + 1)  →  fator comum, o x cancela',
    comentario:
      'O caso mais simples de todos: fator comum. Se você travar aqui, a trava não é limite — é fatoração. ' +
      'Vale voltar no tópico de simplificação antes de seguir.',
  },
];

const DISTANCIAS = [0.5, 0.1, 0.01, 0.001];

function fmt(v: number): string {
  if (!Number.isFinite(v)) return '—';
  return v.toFixed(4).replace('.', ',');
}

/** Tabela de aproximação: a ideia intuitiva de limite, com números de verdade. */
export function LimitApproachTable() {
  const [ativo, setAtivo] = useState(CASOS[0].id);
  const [revelado, setRevelado] = useState(false);
  const c = CASOS.find((x) => x.id === ativo)!;

  const esquerda = DISTANCIAS.map((d) => c.ponto - d);
  const direita = [...DISTANCIAS].reverse().map((d) => c.ponto + d);

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30">
      <div className="bg-indigo-100 dark:bg-indigo-900/50 px-5 py-3">
        <h4 className="font-bold text-indigo-900 dark:text-indigo-100">
          🎯 Chegando perto: para onde a função aponta
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">Escolha o limite</div>
          <div className="flex flex-wrap gap-2">
            {CASOS.map((op) => (
              <button
                key={op.id}
                onClick={() => {
                  setAtivo(op.id);
                  setRevelado(false);
                }}
                className={`rounded-md px-3 py-1.5 font-mono text-xs font-bold transition ${
                  ativo === op.id
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {op.expressao}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-900 p-4 text-center">
          <div className="font-mono text-lg font-bold text-gray-900 dark:text-gray-100">
            lim<sub className="text-xs">x→{c.pontoRotulo}</sub> {c.expressao}
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto rounded-lg bg-white dark:bg-gray-900 p-4">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                  x
                </th>
                <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                  f(x)
                </th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {esquerda.map((x) => (
                <tr key={x} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-3 py-1.5 text-blue-600 dark:text-blue-400">{fmt(x)}</td>
                  <td className="px-3 py-1.5 text-right">{fmt(c.f(x))}</td>
                </tr>
              ))}

              <tr className="bg-red-50 dark:bg-red-950/40">
                <td className="px-3 py-2 font-mono font-bold text-red-700 dark:text-red-300">
                  {c.pontoRotulo}
                </td>
                <td className="px-3 py-2 text-right text-xs font-bold text-red-700 dark:text-red-300">
                  0/0 — não existe
                </td>
              </tr>

              {direita.map((x) => (
                <tr key={x} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="px-3 py-1.5 text-orange-600 dark:text-orange-400">{fmt(x)}</td>
                  <td className="px-3 py-1.5 text-right">{fmt(c.f(x))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="text-blue-600 dark:text-blue-400">▲ chegando pela esquerda (x → a⁻)</span>
            <span className="text-orange-600 dark:text-orange-400">▼ chegando pela direita (x → a⁺)</span>
          </div>
        </div>

        {!revelado ? (
          <button
            onClick={() => setRevelado(true)}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition"
          >
            Olhando os dois lados da tabela — para que número f(x) está indo? Ver resposta
          </button>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 p-4 text-center">
              <div className="font-mono text-xl font-bold text-indigo-900 dark:text-indigo-100">
                lim<sub className="text-xs">x→{c.pontoRotulo}</sub> {c.expressao} = {c.limiteRotulo}
              </div>
            </div>

            <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Como chegar nisso na conta (sem tabela)
              </div>
              <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">{c.fatoracao}</p>
              <div className="rounded bg-gray-100 dark:bg-gray-800 px-4 py-2 text-center font-mono text-sm font-bold">
                {c.expressao} = {c.simplificada}, para x ≠ {c.pontoRotulo}
              </div>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                Agora é só substituir: a função simplificada é contínua em {c.pontoRotulo}, então o
                limite é o valor dela ali.
              </p>
            </div>

            <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 p-4 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
              {c.comentario}
            </div>
          </div>
        )}

        <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/40 p-3 text-sm text-indigo-900 dark:text-indigo-100">
          🎯 <strong>O ponto que destrava tudo:</strong> a linha vermelha do meio é um buraco — a função
          não existe ali. Mesmo assim, os números de cima e de baixo apertam num valor só. Limite é isso:
          o destino, não a chegada.
        </div>
      </div>
    </div>
  );
}
