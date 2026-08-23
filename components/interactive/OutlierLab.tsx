'use client';

import React, { useState } from 'react';

const BASE = [123, 116, 122, 110, 126, 125, 111, 118, 117];

function media(d: number[]) {
  return d.reduce((a, b) => a + b, 0) / d.length;
}
function mediana(d: number[]) {
  const s = [...d].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
function aparada(d: number[], p: number) {
  const s = [...d].sort((a, b) => a - b);
  const k = Math.floor(s.length * p);
  const c = s.slice(k, s.length - k);
  return c.reduce((a, b) => a + b, 0) / c.length;
}
function desvio(d: number[]) {
  const m = media(d);
  return Math.sqrt(d.reduce((a, x) => a + (x - m) ** 2, 0) / (d.length - 1));
}

const fmt = (v: number, c = 2) => v.toFixed(c).replace('.', ',');

/**
 * O laboratório do outlier: arraste um ponto e veja a média correr atrás
 * enquanto a mediana nem se mexe. É a lição central do Capítulo 1.
 */
export function OutlierLab() {
  const [extremo, setExtremo] = useState(175);
  const dados = [...BASE, extremo];

  const m = media(dados);
  const med = mediana(dados);
  const ap = aparada(dados, 0.1);
  const s = desvio(dados);

  const mSem = media(BASE);
  const medSem = mediana(BASE);

  const MIN = 100;
  const MAX = 320;
  const pos = (n: number) => ((n - MIN) / (MAX - MIN)) * 100;

  const distorcao = m - med;

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30">
      <div className="bg-purple-100 dark:bg-purple-900/50 px-5 py-3">
        <h4 className="font-bold text-purple-900 dark:text-purple-100">
          🔬 O laboratório do outlier: quem corre atrás e quem fica parado
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <p className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
          Estas são as vidas úteis de 10 baterias, em horas — os dados do Exercício 1.13. Nove ficam
          agrupadas entre 110 e 126 h. Arraste a décima e observe as quatro medidas reagirem.
        </p>

        <div>
          <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>A décima bateria</span>
            <span className="font-mono font-bold">{extremo} h</span>
          </label>
          <input
            type="range"
            min={105}
            max={320}
            value={extremo}
            onChange={(e) => setExtremo(Number(e.target.value))}
            className="mt-1 w-full accent-purple-600"
          />
          <div className="mt-1 flex justify-between text-[10px] text-gray-500">
            <span>dentro do grupo</span>
            <span>outlier extremo</span>
          </div>
        </div>

        {/* Reta com os pontos */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-5">
          <div className="relative h-24">
            <div className="absolute left-0 right-0 top-14 h-0.5 bg-gray-300 dark:bg-gray-600" />

            {BASE.map((v, i) => (
              <div
                key={i}
                className="absolute top-[49px] h-3 w-3 -translate-x-1/2 rounded-full bg-gray-400 dark:bg-gray-500"
                style={{ left: `${pos(v)}%` }}
              />
            ))}

            <div
              className="absolute top-[46px] h-5 w-5 -translate-x-1/2 rounded-full border-2 border-white bg-purple-600 transition-all"
              style={{ left: `${pos(extremo)}%` }}
            />

            {/* Média */}
            <div
              className="absolute top-6 -translate-x-1/2 transition-all"
              style={{ left: `${pos(m)}%` }}
            >
              <div className="whitespace-nowrap text-[10px] font-bold text-red-600 dark:text-red-400">
                média {fmt(m, 1)}
              </div>
              <div className="mx-auto h-8 w-0.5 bg-red-500" />
            </div>

            {/* Mediana */}
            <div
              className="absolute top-[62px] -translate-x-1/2 transition-all"
              style={{ left: `${pos(med)}%` }}
            >
              <div className="mx-auto h-6 w-0.5 bg-emerald-500" />
              <div className="whitespace-nowrap text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                mediana {fmt(med, 1)}
              </div>
            </div>

            {[100, 150, 200, 250, 300].map((n) => (
              <div
                key={n}
                className="absolute top-[56px] -translate-x-1/2"
                style={{ left: `${pos(n)}%` }}
              >
                <div className="h-2 w-0.5 bg-gray-400 dark:bg-gray-600" />
              </div>
            ))}
          </div>
        </div>

        {/* Painel de medidas */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border-2 border-red-300 dark:border-red-800 bg-white dark:bg-gray-900 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
              Média
            </div>
            <div className="font-mono text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {fmt(m)}
            </div>
            <div className="text-[10px] text-gray-500">sensível</div>
          </div>

          <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-white dark:bg-gray-900 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Mediana
            </div>
            <div className="font-mono text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {fmt(med)}
            </div>
            <div className="text-[10px] text-gray-500">resistente</div>
          </div>

          <div className="rounded-lg border-2 border-sky-300 dark:border-sky-800 bg-white dark:bg-gray-900 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400">
              Aparada 10%
            </div>
            <div className="font-mono text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {fmt(ap)}
            </div>
            <div className="text-[10px] text-gray-500">meio-termo</div>
          </div>

          <div className="rounded-lg border-2 border-amber-300 dark:border-amber-800 bg-white dark:bg-gray-900 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Desvio s
            </div>
            <div className="font-mono text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {fmt(s)}
            </div>
            <div className="text-[10px] text-gray-500">explode junto</div>
          </div>
        </div>

        <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 p-4 text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
          Sem a décima bateria, as nove restantes têm média {fmt(mSem, 1)} e mediana {fmt(medSem, 1)} —
          praticamente iguais. Com o valor atual de {extremo} h, a média foi para {fmt(m, 1)} enquanto a
          mediana ficou em {fmt(med, 1)}:{' '}
          <strong>
            uma distância de {fmt(Math.abs(distorcao), 1)}{' '}
            {Math.abs(distorcao) < 1 ? 'hora' : 'horas'}
          </strong>
          . A média persegue o ponto extremo porque usa o valor de cada observação; a mediana só depende
          da <em>posição</em>, então ignora o quanto o extremo é extremo.
        </div>

        <div className="rounded-lg bg-purple-100 dark:bg-purple-900/40 p-3 text-sm text-purple-900 dark:text-purple-100">
          🎯 <strong>Puxe o controle até o fim.</strong> A mediana para de se mexer completamente, e o
          desvio-padrão dispara. É por isso que, quando média e mediana discordam muito, a mediana costuma
          descrever melhor o caso típico — a resposta do item (b) do Exercício 1.13.
        </div>
      </div>
    </div>
  );
}
