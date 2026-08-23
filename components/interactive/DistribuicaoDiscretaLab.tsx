'use client';

import React, { useState } from 'react';

type Dist = 'binomial' | 'poisson' | 'geometrica';
type Modo = 'exatamente' | 'no-maximo' | 'pelo-menos';

const fmt = (v: number, c = 4) => v.toFixed(c).replace('.', ',');

/** C(n, k) por produto iterativo — estável para os n do capítulo. */
function comb(n: number, k: number) {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

/** Devolve [xInicial, pmf[]] para a distribuição escolhida. */
function calcular(dist: Dist, n: number, p: number, lambda: number): [number, number[]] {
  if (dist === 'binomial') {
    const pmf = Array.from({ length: n + 1 }, (_, x) => comb(n, x) * p ** x * (1 - p) ** (n - x));
    return [0, pmf];
  }
  if (dist === 'poisson') {
    const topo = Math.max(12, Math.ceil(lambda + 4 * Math.sqrt(lambda) + 2));
    const pmf: number[] = [Math.exp(-lambda)];
    for (let x = 1; x <= topo; x++) pmf.push((pmf[x - 1] * lambda) / x);
    return [0, pmf];
  }
  // geométrica: x = 1, 2, 3, ...
  const topo = Math.min(30, Math.ceil(8 / p));
  const pmf = Array.from({ length: topo }, (_, i) => p * (1 - p) ** i);
  return [1, pmf];
}

/**
 * O laboratório das discretas: a fórmula vira tabela, a tabela vira gráfico,
 * e "no máximo / pelo menos" viram soma escrita com todos os termos à vista.
 *
 * Existe porque o enunciado quase nunca pede P(X = x) puro — pede acumulada,
 * e é exatamente aí que a aula costumava parar.
 */
export function DistribuicaoDiscretaLab() {
  const [dist, setDist] = useState<Dist>('binomial');
  const [n, setN] = useState(5);
  const [p, setP] = useState(0.1);
  const [lambda, setLambda] = useState(4);
  const [corte, setCorte] = useState(2);
  const [modo, setModo] = useState<Modo>('exatamente');

  const [x0, pmf] = calcular(dist, n, p, lambda);
  const xs = pmf.map((_, i) => i + x0);
  const xMax = xs[xs.length - 1];
  const c = Math.min(Math.max(corte, x0), xMax);

  const selecionado = (x: number) =>
    modo === 'exatamente' ? x === c : modo === 'no-maximo' ? x <= c : x >= c;

  const termos = xs.filter(selecionado).map((x) => pmf[x - x0]);
  const total = termos.reduce((a, b) => a + b, 0);
  const altura = Math.max(...pmf);

  const nomeDist =
    dist === 'binomial'
      ? `b(x; ${n}; ${fmt(p, 2)})`
      : dist === 'poisson'
        ? `p(x; ${fmt(lambda, 1)})`
        : `g(x; ${fmt(p, 2)})`;

  const simbolo =
    modo === 'exatamente' ? `P(X = ${c})` : modo === 'no-maximo' ? `P(X ≤ ${c})` : `P(X ≥ ${c})`;

  /** A soma escrita por extenso — encurtada quando passa de 6 parcelas. */
  const contaEscrita = () => {
    if (termos.length === 0) return '0';
    if (termos.length === 1) return fmt(termos[0]);
    if (termos.length <= 6) return termos.map((t) => fmt(t)).join(' + ');
    return `${termos.slice(0, 3).map((t) => fmt(t)).join(' + ')} + … + ${fmt(termos[termos.length - 1])}`;
  };

  const formulaTermo = () => {
    if (dist === 'binomial')
      return `b(${c}; ${n}; ${fmt(p, 2)}) = C(${n}, ${c}) · ${fmt(p, 2)}^${c} · ${fmt(1 - p, 2)}^${n - c} = ${fmt(comb(n, c))} × ${fmt(p ** c, 6)} × ${fmt((1 - p) ** (n - c), 6)}`;
    if (dist === 'poisson')
      return `p(${c}; ${fmt(lambda, 1)}) = e^−${fmt(lambda, 1)} · ${fmt(lambda, 1)}^${c} / ${c}!`;
    return `g(${c}; ${fmt(p, 2)}) = ${fmt(p, 2)} × ${fmt(1 - p, 2)}^${c - 1}`;
  };

  const media = dist === 'binomial' ? n * p : dist === 'poisson' ? lambda : 1 / p;
  const varianc =
    dist === 'binomial' ? n * p * (1 - p) : dist === 'poisson' ? lambda : (1 - p) / p ** 2;

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-cyan-200 dark:border-cyan-900 bg-cyan-50/50 dark:bg-cyan-950/30">
      <div className="bg-cyan-100 dark:bg-cyan-900/50 px-5 py-3">
        <h4 className="font-bold text-cyan-900 dark:text-cyan-100">
          📊 Laboratório das discretas: &quot;exatamente&quot;, &quot;no máximo&quot; e &quot;pelo
          menos&quot;
        </h4>
      </div>

      <div className="space-y-5 p-5">
        {/* Distribuição */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['binomial', 'Binomial'],
              ['poisson', 'Poisson'],
              ['geometrica', 'Geométrica'],
            ] as [Dist, string][]
          ).map(([id, rotulo]) => (
            <button
              key={id}
              onClick={() => {
                setDist(id);
                setCorte(id === 'geometrica' ? 2 : 2);
              }}
              className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                dist === id
                  ? 'border-cyan-500 bg-cyan-500 text-white'
                  : 'border-cyan-200 dark:border-cyan-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-cyan-400'
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {/* Parâmetros */}
        <div className="grid gap-4 sm:grid-cols-2">
          {dist === 'binomial' && (
            <div>
              <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>n — número de tentativas</span>
                <span className="font-mono font-bold">{n}</span>
              </label>
              <input
                type="range"
                min={1}
                max={30}
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                className="mt-1 w-full accent-cyan-600"
              />
            </div>
          )}

          {dist === 'poisson' ? (
            <div>
              <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>λt — média no intervalo</span>
                <span className="font-mono font-bold">{fmt(lambda, 1)}</span>
              </label>
              <input
                type="range"
                min={0.5}
                max={15}
                step={0.5}
                value={lambda}
                onChange={(e) => setLambda(Number(e.target.value))}
                className="mt-1 w-full accent-cyan-600"
              />
            </div>
          ) : (
            <div>
              <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>p — probabilidade de sucesso</span>
                <span className="font-mono font-bold">{fmt(p, 2)}</span>
              </label>
              <input
                type="range"
                min={0.05}
                max={0.95}
                step={0.05}
                value={p}
                onChange={(e) => setP(Number(e.target.value))}
                className="mt-1 w-full accent-cyan-600"
              />
            </div>
          )}
        </div>

        {/* Modo de leitura */}
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-400">
            O que o enunciado pede
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['exatamente', `exatamente ${c}`],
                ['no-maximo', `no máximo ${c}`],
                ['pelo-menos', `pelo menos ${c}`],
              ] as [Modo, string][]
            ).map(([id, rotulo]) => (
              <button
                key={id}
                onClick={() => setModo(id)}
                className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                  modo === id
                    ? 'border-cyan-500 bg-cyan-500 text-white'
                    : 'border-cyan-200 dark:border-cyan-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-cyan-400'
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>

          <label className="mt-3 flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>x — o valor de corte</span>
            <span className="font-mono font-bold">{c}</span>
          </label>
          <input
            type="range"
            min={x0}
            max={xMax}
            value={c}
            onChange={(e) => setCorte(Number(e.target.value))}
            className="mt-1 w-full accent-cyan-600"
          />
        </div>

        {/* Gráfico de barras */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
          <div className="flex h-40 items-end gap-[2px]">
            {xs.map((x) => {
              const v = pmf[x - x0];
              const on = selecionado(x);
              return (
                <div key={x} className="flex flex-1 flex-col items-center justify-end">
                  <div
                    className={`w-full rounded-t transition-colors ${
                      on ? 'bg-cyan-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    style={{ height: `${Math.max((v / altura) * 100, 1)}%` }}
                    title={`P(X = ${x}) = ${fmt(v)}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-1 flex gap-[2px]">
            {xs.map((x) => (
              <div
                key={x}
                className={`flex-1 text-center text-[9px] tabular-nums ${
                  selecionado(x)
                    ? 'font-bold text-cyan-700 dark:text-cyan-300'
                    : 'text-gray-400 dark:text-gray-600'
                }`}
              >
                {xs.length > 20 && x % 2 !== 0 ? '' : x}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center text-xs text-gray-500">
            f(x) = {nomeDist} &nbsp;·&nbsp; as barras acesas são as que entram na sua conta
          </div>
        </div>

        {/* A conta */}
        <div className="space-y-3 rounded-lg border border-cyan-200 dark:border-cyan-800 bg-white dark:bg-gray-900 p-4">
          {modo === 'exatamente' ? (
            <div className="space-y-1 font-mono text-[14px] text-gray-800 dark:text-gray-200">
              <div className="break-words">{formulaTermo()}</div>
              <div className="font-bold text-cyan-700 dark:text-cyan-300">
                {simbolo} = {fmt(total)}
              </div>
            </div>
          ) : (
            <div className="space-y-1 font-mono text-[14px] text-gray-800 dark:text-gray-200">
              <div className="text-xs text-gray-500">
                {termos.length} termo{termos.length === 1 ? '' : 's'} somado
                {termos.length === 1 ? '' : 's'} — de f({modo === 'no-maximo' ? x0 : c}) até f(
                {modo === 'no-maximo' ? c : xMax})
              </div>
              <div className="break-words">
                {simbolo} = {contaEscrita()}
              </div>
              <div className="font-bold text-cyan-700 dark:text-cyan-300">
                {simbolo} = {fmt(total)}
              </div>
            </div>
          )}

          {modo === 'pelo-menos' && c > x0 && (
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-3 text-sm text-emerald-900 dark:text-emerald-100">
              ⚡ <strong>Atalho do complemento:</strong> em vez de somar {termos.length} termos, some
              os {c - x0} de baixo e faça 1 menos.{' '}
              <span className="font-mono">
                P(X ≥ {c}) = 1 − P(X ≤ {c - 1}) = 1 − {fmt(1 - total)} = {fmt(total)}
              </span>
              . Mesmo resultado, menos conta — e menos chance de errar.
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="rounded bg-gray-50 dark:bg-gray-800/50 p-2">
              <div className="text-[10px] font-bold uppercase text-gray-500">Média μ</div>
              <div className="font-mono font-bold text-gray-900 dark:text-gray-100">
                {fmt(media, 3)}
              </div>
            </div>
            <div className="rounded bg-gray-50 dark:bg-gray-800/50 p-2">
              <div className="text-[10px] font-bold uppercase text-gray-500">Variância σ²</div>
              <div className="font-mono font-bold text-gray-900 dark:text-gray-100">
                {fmt(varianc, 3)}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-cyan-100 dark:bg-cyan-900/40 p-3 text-sm text-cyan-900 dark:text-cyan-100">
          🎯 <strong>Teste a tradução do enunciado.</strong> Deixe o corte em x e alterne os três
          botões: &quot;exatamente&quot; acende uma barra só, &quot;no máximo&quot; acende tudo à
          esquerda, &quot;pelo menos&quot; acende tudo à direita. Errar essa tradução custa a questão
          inteira mesmo com a fórmula certa — é o erro mais comum do capítulo.
        </div>
      </div>
    </div>
  );
}
