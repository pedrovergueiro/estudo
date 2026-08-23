'use client';

import React, { useState } from 'react';

type Conjunto = {
  id: string;
  nome: string;
  contexto: string;
  unidade: string;
  dados: number[];
  casasDado: number;
  casasCalc: number;
};

const CONJUNTOS: Conjunto[] = [
  {
    id: 'aquecimento',
    nome: 'Aquecimento',
    contexto: 'Cinco números redondos, só para a conta sair limpa na primeira vez.',
    unidade: '',
    dados: [1, 3, 5, 7, 9],
    casasDado: 0,
    casasCalc: 2,
  },
  {
    id: 'sem',
    nome: 'Polímero SEM envelhecimento',
    contexto:
      'Ex. 1.3 / 1.9 — resistência à tensão, em psi, de 10 espécimes que não passaram pelo envelhecimento acelerado.',
    unidade: 'psi',
    dados: [227, 222, 218, 217, 225, 218, 216, 229, 228, 221],
    casasDado: 0,
    casasCalc: 2,
  },
  {
    id: 'com',
    nome: 'Polímero COM envelhecimento',
    contexto: 'Ex. 1.3 / 1.9 — os outros 10 espécimes, expostos a alta temperatura por dez dias.',
    unidade: 'psi',
    dados: [219, 214, 215, 211, 209, 218, 203, 204, 201, 205],
    casasDado: 0,
    casasCalc: 2,
  },
  {
    id: 'secagem',
    nome: 'Tempo de secagem da tinta',
    contexto:
      'Ex. 1.1 / 1.7 — 15 medidas de tempo de secagem, em horas. Média quebrada, como cai na prova.',
    unidade: 'h',
    dados: [3.4, 2.5, 4.8, 2.9, 3.6, 2.8, 3.3, 5.6, 3.7, 2.8, 4.4, 4.0, 5.2, 3.0, 4.8],
    casasDado: 1,
    casasCalc: 4,
  },
];

const PASSOS = [
  { n: 1, titulo: 'Olhar os dados', acao: 'contar n e achar a amplitude' },
  { n: 2, titulo: 'Achar o centro', acao: 'calcular a média x̄' },
  { n: 3, titulo: 'Medir cada distância', acao: 'calcular os desvios xᵢ − x̄' },
  { n: 4, titulo: 'Matar os sinais', acao: 'elevar ao quadrado e somar' },
  { n: 5, titulo: 'Dividir e tirar a raiz', acao: 'chegar em s² e em s' },
];

/** Formata com vírgula decimal, evitando o "-0,00" do ponto flutuante. */
function fmt(v: number, casas: number) {
  const arred = Math.abs(v) < 5 * 10 ** -(casas + 1) ? 0 : v;
  return arred.toFixed(casas).replace('.', ',');
}

/**
 * A conta da variância aberta em cinco passos, sobre dados reais do livro.
 *
 * O ponto: a fórmula sozinha não ensina. Aqui cada símbolo vira número na tela,
 * uma linha de cada vez, e o mesmo roteiro roda sobre quatro conjuntos.
 */
export function VarianciaPassoAPasso() {
  const [idConjunto, setIdConjunto] = useState(CONJUNTOS[1].id);
  const [passo, setPasso] = useState(0);

  const conj = CONJUNTOS.find((c) => c.id === idConjunto) ?? CONJUNTOS[0];
  const { dados, unidade, casasDado, casasCalc } = conj;

  const n = dados.length;
  const soma = dados.reduce((a, b) => a + b, 0);
  const media = soma / n;
  const min = Math.min(...dados);
  const max = Math.max(...dados);
  const amplitude = max - min;

  const linhas = dados.map((x) => ({ x, dev: x - media, dev2: (x - media) ** 2 }));
  const somaDev = linhas.reduce((a, l) => a + l.dev, 0);
  const sq = linhas.reduce((a, l) => a + l.dev2, 0);
  const variancia = sq / (n - 1);
  const desvio = Math.sqrt(variancia);
  const varErrada = sq / n;

  const maxDev = Math.max(...linhas.map((l) => Math.abs(l.dev)));
  const u = unidade ? ` ${unidade}` : '';
  const u2 = unidade ? ` ${unidade}²` : '';

  const trocarConjunto = (id: string) => {
    setIdConjunto(id);
    setPasso(0);
  };

  /** Cada célula do painel só acende quando o passo dela chega. */
  const painel = [
    { rotulo: 'Amplitude A', valor: `${fmt(amplitude, casasDado)}${u}`, desde: 0 },
    { rotulo: 'Média x̄', valor: `${fmt(media, casasCalc)}${u}`, desde: 1 },
    { rotulo: 'Σ(xᵢ − x̄)²', valor: fmt(sq, casasCalc), desde: 3 },
    { rotulo: 'Variância s²', valor: `${fmt(variancia, casasCalc)}${u2}`, desde: 4 },
    { rotulo: 'Desvio s', valor: `${fmt(desvio, casasCalc)}${u}`, desde: 4 },
  ];

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30">
      <div className="bg-amber-100 dark:bg-amber-900/50 px-5 py-3">
        <h4 className="font-bold text-amber-900 dark:text-amber-100">
          🧮 A conta inteira, uma linha de cada vez
        </h4>
      </div>

      <div className="space-y-5 p-5">
        {/* Escolha do conjunto */}
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Sobre quais dados
          </div>
          <div className="flex flex-wrap gap-2">
            {CONJUNTOS.map((c) => (
              <button
                key={c.id}
                onClick={() => trocarConjunto(c.id)}
                className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                  c.id === idConjunto
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : 'border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-amber-400'
                }`}
              >
                {c.nome}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{conj.contexto}</p>
        </div>

        {/* Trilha dos passos */}
        <div className="flex flex-wrap gap-1.5">
          {PASSOS.map((p, i) => (
            <button
              key={p.n}
              onClick={() => setPasso(i)}
              className={`min-w-[110px] flex-1 rounded-md px-2 py-1.5 text-left text-[11px] leading-tight transition-colors ${
                i === passo
                  ? 'bg-amber-500 text-white'
                  : i < passo
                    ? 'bg-amber-200 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
              }`}
            >
              <span className="font-bold">{i < passo ? '✓' : p.n}</span> {p.titulo}
            </button>
          ))}
        </div>

        {/* Painel de resultados que vai acendendo */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {painel.map((c) => {
            const aceso = passo >= c.desde;
            return (
              <div
                key={c.rotulo}
                className={`rounded-lg border-2 p-2.5 transition-colors ${
                  aceso
                    ? 'border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-900'
                    : 'border-dashed border-gray-200 dark:border-gray-700 bg-transparent'
                }`}
              >
                <div
                  className={`text-[10px] font-bold uppercase tracking-wide ${
                    aceso ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {c.rotulo}
                </div>
                <div
                  className={`font-mono text-[15px] font-bold tabular-nums ${
                    aceso ? 'text-gray-900 dark:text-gray-100' : 'text-gray-300 dark:text-gray-700'
                  }`}
                >
                  {aceso ? c.valor : '—'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Conteúdo do passo atual */}
        <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-gray-900 p-5">
          <div className="mb-3 text-sm font-bold text-amber-700 dark:text-amber-400">
            Passo {PASSOS[passo].n} — {PASSOS[passo].acao}
          </div>

          {passo === 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {dados.map((x, i) => (
                  <span
                    key={i}
                    className={`rounded-md px-2 py-1 font-mono text-sm tabular-nums ${
                      x === max
                        ? 'bg-rose-100 dark:bg-rose-900/50 font-bold text-rose-800 dark:text-rose-200'
                        : x === min
                          ? 'bg-sky-100 dark:bg-sky-900/50 font-bold text-sky-800 dark:text-sky-200'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {fmt(x, casasDado)}
                  </span>
                ))}
              </div>

              <div className="font-mono text-[15px] text-gray-800 dark:text-gray-200">
                n = {n} observações
              </div>
              <div className="font-mono text-[15px] text-gray-800 dark:text-gray-200">
                A = x<sub>máx</sub> − x<sub>mín</sub> = {fmt(max, casasDado)} − {fmt(min, casasDado)} ={' '}
                <strong>
                  {fmt(amplitude, casasDado)}
                  {u}
                </strong>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                A amplitude já está calculada, e custou dois números. O problema é exatamente esse: os
                outros {n - 2} valores não entraram na conta. Se qualquer um deles mudasse de lugar, A
                continuaria {fmt(amplitude, casasDado)}
                {u}. Por isso ela serve de alarme rápido em controle de qualidade, não de medida
                definitiva.
              </p>
            </div>
          )}

          {passo === 1 && (
            <div className="space-y-3">
              <p className="text-[15px] text-gray-700 dark:text-gray-300">
                Variabilidade é distância <em>até o centro</em>. Então o centro precisa vir primeiro.
              </p>
              <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 font-mono text-[15px] text-gray-800 dark:text-gray-200">
                <div className="break-words">
                  Σxᵢ = {dados.map((x) => fmt(x, casasDado)).join(' + ')}
                </div>
                <div className="mt-1">Σxᵢ = {fmt(soma, casasDado)}</div>
                <div className="mt-2 font-bold">
                  x̄ = {fmt(soma, casasDado)} / {n} = {fmt(media, casasCalc)}
                  {u}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Guarde esse número: ele vai reaparecer {n} vezes no próximo passo, uma para cada
                observação.
              </p>
            </div>
          )}

          {passo >= 2 && (
            <div className="space-y-3">
              <p className="text-[15px] text-gray-700 dark:text-gray-300">
                {passo === 2 &&
                  `A distância de cada observação até ${fmt(media, casasCalc)}${u}. Negativo = abaixo da média, positivo = acima.`}
                {passo === 3 &&
                  'Como os desvios somam zero, somar do jeito que estão não mede nada. Elevando cada um ao quadrado o sinal some, e aí a soma passa a medir espalhamento de verdade.'}
                {passo === 4 &&
                  'Falta dividir a soma de quadrados pelos graus de liberdade e desfazer o quadrado.'}
              </p>

              <div className="max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-3 py-2 text-right font-medium text-gray-500">xᵢ</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500">xᵢ − x̄</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">distância</th>
                      <th
                        className={`px-3 py-2 text-right font-medium ${
                          passo >= 3 ? 'text-gray-500' : 'text-gray-300 dark:text-gray-700'
                        }`}
                      >
                        (xᵢ − x̄)²
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono tabular-nums">
                    {linhas.map((l, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-3 py-1 text-right text-gray-800 dark:text-gray-200">
                          {fmt(l.x, casasDado)}
                        </td>
                        <td
                          className={`px-3 py-1 text-right font-bold ${
                            l.dev < 0
                              ? 'text-sky-600 dark:text-sky-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {l.dev > 0 ? '+' : ''}
                          {fmt(l.dev, casasCalc)}
                        </td>
                        <td className="px-3 py-1">
                          <div className="relative h-2 w-full min-w-[60px] rounded bg-gray-100 dark:bg-gray-800">
                            <div
                              className={`absolute top-0 h-2 rounded ${
                                l.dev < 0 ? 'bg-sky-400' : 'bg-rose-400'
                              }`}
                              style={{
                                left: l.dev < 0 ? `${50 - (Math.abs(l.dev) / maxDev) * 50}%` : '50%',
                                width: `${(Math.abs(l.dev) / maxDev) * 50}%`,
                              }}
                            />
                            <div className="absolute left-1/2 top-0 h-2 w-px bg-gray-400 dark:bg-gray-500" />
                          </div>
                        </td>
                        <td
                          className={`px-3 py-1 text-right ${
                            passo >= 3
                              ? 'text-gray-800 dark:text-gray-200'
                              : 'text-gray-200 dark:text-gray-800'
                          }`}
                        >
                          {passo >= 3 ? fmt(l.dev2, casasCalc) : '·'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 dark:bg-gray-800/60">
                      <td className="px-3 py-2 text-right text-xs font-bold text-gray-500">soma</td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {fmt(somaDev, casasCalc)}
                      </td>
                      <td />
                      <td
                        className={`px-3 py-2 text-right font-bold ${
                          passo >= 3
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-gray-200 dark:text-gray-800'
                        }`}
                      >
                        {passo >= 3 ? fmt(sq, casasCalc) : '·'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {passo === 2 && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-3 text-sm text-emerald-900 dark:text-emerald-100">
                  👀 <strong>Olhe a linha da soma: deu exatamente 0.</strong> Não é sorte deste
                  conjunto — troque os dados lá em cima e confira. O positivo sempre cancela o negativo,
                  porque é isso que a média faz. Essa é a razão de existir o passo seguinte.
                </div>
              )}

              {passo === 3 && (
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 font-mono text-[15px] text-gray-800 dark:text-gray-200">
                  Σ(xᵢ − x̄)² ={' '}
                  {linhas
                    .slice(0, 3)
                    .map((l) => fmt(l.dev2, casasCalc))
                    .join(' + ')}{' '}
                  + … + {fmt(linhas[linhas.length - 1].dev2, casasCalc)} ={' '}
                  <strong>{fmt(sq, casasCalc)}</strong>
                </div>
              )}

              {passo === 4 && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3 font-mono text-[15px] text-gray-800 dark:text-gray-200">
                    <div>
                      s² = Σ(xᵢ − x̄)² / (n − 1) = {fmt(sq, casasCalc)} / ({n} − 1) ={' '}
                      {fmt(sq, casasCalc)} / {n - 1} ={' '}
                      <strong>
                        {fmt(variancia, casasCalc)}
                        {u2}
                      </strong>
                    </div>
                    <div className="mt-2">
                      s = √{fmt(variancia, casasCalc)} ={' '}
                      <strong>
                        {fmt(desvio, casasCalc)}
                        {u}
                      </strong>
                    </div>
                  </div>

                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-3 text-sm text-amber-900 dark:text-amber-100">
                    🎯 <strong>Traduzindo para português:</strong> uma observação típica deste conjunto
                    está a mais ou menos{' '}
                    <strong>
                      {fmt(desvio, casasCalc)}
                      {u}
                    </strong>{' '}
                    de distância da média de {fmt(media, casasCalc)}
                    {u}. É por isso que se reporta <em>s</em> e não <em>s²</em>: {fmt(desvio, casasCalc)}
                    {u} é uma frase que faz sentido; {fmt(variancia, casasCalc)}
                    {u2} não é.
                  </div>

                  <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-900 dark:text-red-100">
                    ⚠️ Se dividisse por n = {n} em vez de n − 1 = {n - 1}, daria{' '}
                    <span className="font-mono">{fmt(varErrada, casasCalc)}</span> — menor que o valor
                    certo. Dividir por n <strong>subestima</strong> a variabilidade em qualquer
                    conjunto, sempre. É para corrigir isso que o denominador é n − 1.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navegação */}
          <div className="mt-5 flex items-center justify-between gap-2">
            <button
              onClick={() => setPasso((p) => Math.max(0, p - 1))}
              disabled={passo === 0}
              className="rounded-lg border-2 border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 disabled:opacity-30"
            >
              ← Voltar
            </button>

            {passo < PASSOS.length - 1 ? (
              <button
                onClick={() => setPasso((p) => p + 1)}
                className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-bold text-white hover:bg-amber-600"
              >
                {PASSOS[passo + 1].acao} →
              </button>
            ) : (
              <button
                onClick={() => setPasso(0)}
                className="rounded-lg border-2 border-amber-400 px-4 py-1.5 text-sm font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
              >
                ↺ Refazer com outro conjunto
              </button>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-3 text-sm text-amber-900 dark:text-amber-100">
          🔁 <strong>Rode o ciclo duas vezes:</strong> uma com o polímero SEM envelhecimento, outra com
          o COM. As médias não são tão diferentes (222,10 contra 209,90 psi), mas o desvio salta de 4,86
          para 6,49 psi — o envelhecimento não só enfraquece o material, deixa ele imprevisível. Essa
          segunda frase é metade da resposta do Exercício 1.9, e ela só existe porque alguém calculou a
          variabilidade.
        </div>
      </div>
    </div>
  );
}
