'use client';

import React, { useState } from 'react';

/** Φ(z) — aproximação de Abramowitz & Stegun 26.2.17, erro < 7,5e-8. */
function phi(z: number): number {
  const sinal = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-x * x);
  return 0.5 * (1 + sinal * y);
}

const densidade = (z: number) => Math.exp(-(z * z) / 2) / Math.sqrt(2 * Math.PI);

type Modo = 'menor' | 'maior' | 'entre';

const W = 440;
const H = 220;
const ZMIN = -4;
const ZMAX = 4;

const zx = (z: number) => ((z - ZMIN) / (ZMAX - ZMIN)) * W;
const zy = (d: number) => H - 20 - (d / 0.4) * (H - 45);

const fmt = (v: number, c = 4) => v.toFixed(c).replace('.', ',');

/** A curva normal com a área sombreada — e a padronização feita à vista. */
export function NormalCurveExplorer() {
  const [mu, setMu] = useState(100);
  const [sigma, setSigma] = useState(15);
  const [modo, setModo] = useState<Modo>('menor');
  const [a, setA] = useState(115);
  const [b, setB] = useState(130);

  const za = (a - mu) / sigma;
  const zb = (b - mu) / sigma;

  const prob =
    modo === 'menor' ? phi(za) : modo === 'maior' ? 1 - phi(za) : Math.max(0, phi(zb) - phi(za));

  const [lo, hi] =
    modo === 'menor' ? [ZMIN, za] : modo === 'maior' ? [za, ZMAX] : [Math.min(za, zb), Math.max(za, zb)];

  // Curva completa
  const curva: string[] = [];
  for (let z = ZMIN; z <= ZMAX; z += 0.02) {
    curva.push(`${curva.length === 0 ? 'M' : 'L'}${zx(z).toFixed(1)},${zy(densidade(z)).toFixed(1)}`);
  }

  // Área sombreada
  const area: string[] = [`M${zx(Math.max(lo, ZMIN)).toFixed(1)},${(H - 20).toFixed(1)}`];
  for (let z = Math.max(lo, ZMIN); z <= Math.min(hi, ZMAX); z += 0.02) {
    area.push(`L${zx(z).toFixed(1)},${zy(densidade(z)).toFixed(1)}`);
  }
  area.push(`L${zx(Math.min(hi, ZMAX)).toFixed(1)},${(H - 20).toFixed(1)}Z`);

  const rotulo =
    modo === 'menor'
      ? `P(X < ${a})`
      : modo === 'maior'
        ? `P(X > ${a})`
        : `P(${Math.min(a, b)} < X < ${Math.max(a, b)})`;

  return (
    <div className="my-8 overflow-hidden rounded-xl border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30">
      <div className="bg-indigo-100 dark:bg-indigo-900/50 px-5 py-3">
        <h4 className="font-bold text-indigo-900 dark:text-indigo-100">
          🔔 Curva normal: padronizar e ler a área
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>μ — a média</span>
              <span className="font-mono font-bold">{mu}</span>
            </label>
            <input
              type="range"
              min={50}
              max={150}
              value={mu}
              onChange={(e) => setMu(Number(e.target.value))}
              className="mt-1 w-full accent-indigo-600"
            />
          </div>
          <div>
            <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>σ — o desvio-padrão</span>
              <span className="font-mono font-bold">{sigma}</span>
            </label>
            <input
              type="range"
              min={5}
              max={30}
              value={sigma}
              onChange={(e) => setSigma(Number(e.target.value))}
              className="mt-1 w-full accent-indigo-600"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">O que você quer calcular</div>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ['menor', 'P(X < a)'],
                ['maior', 'P(X > a)'],
                ['entre', 'P(a < X < b)'],
              ] as [Modo, string][]
            ).map(([id, lbl]) => (
              <button
                key={id}
                onClick={() => setModo(id)}
                className={`rounded-md px-2 py-2 font-mono text-xs font-bold transition ${
                  modo === id
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>a</span>
              <span className="font-mono font-bold">{a}</span>
            </label>
            <input
              type="range"
              min={mu - 4 * sigma}
              max={mu + 4 * sigma}
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className="mt-1 w-full accent-indigo-600"
            />
          </div>
          {modo === 'entre' && (
            <div>
              <label className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>b</span>
                <span className="font-mono font-bold">{b}</span>
              </label>
              <input
                type="range"
                min={mu - 4 * sigma}
                max={mu + 4 * sigma}
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
                className="mt-1 w-full accent-indigo-600"
              />
            </div>
          )}
        </div>

        {/* Curva */}
        <div className="overflow-x-auto rounded-lg bg-white dark:bg-gray-900 p-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto block h-auto w-full max-w-[440px]"
            role="img"
            aria-label="Curva normal com a área da probabilidade sombreada"
          >
            <path d={area.join('')} fill="#6366f1" fillOpacity={0.3} />
            <path d={curva.join('')} fill="none" stroke="#4f46e5" strokeWidth={2} />
            <line
              x1={0}
              y1={H - 20}
              x2={W}
              y2={H - 20}
              stroke="currentColor"
              strokeWidth={1}
              className="text-gray-400 dark:text-gray-600"
            />

            {[-3, -2, -1, 0, 1, 2, 3].map((z) => (
              <g key={z}>
                <line
                  x1={zx(z)}
                  y1={H - 20}
                  x2={zx(z)}
                  y2={H - 15}
                  stroke="currentColor"
                  strokeWidth={1}
                  className="text-gray-400 dark:text-gray-600"
                />
                <text
                  x={zx(z)}
                  y={H - 4}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="monospace"
                  fill="currentColor"
                  className="text-gray-500"
                >
                  {Math.round(mu + z * sigma)}
                </text>
              </g>
            ))}

            {/* Marcadores dos limites */}
            {(modo === 'entre' ? [za, zb] : [za]).map((z, i) => (
              <line
                key={i}
                x1={zx(z)}
                y1={20}
                x2={zx(z)}
                y2={H - 20}
                stroke="#e11d48"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            ))}
          </svg>
          <div className="mt-1 text-center text-[10px] text-gray-500">
            eixo em unidades de X (a escala z vai de −3 a 3 nos mesmos traços)
          </div>
        </div>

        {/* Padronização */}
        <div className="rounded-lg bg-white dark:bg-gray-900 p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Passo 1 — padronizar: z = (x − μ) / σ
          </div>
          <div className="space-y-1 font-mono text-sm text-gray-800 dark:text-gray-200">
            <div>
              z<sub>a</sub> = ({a} − {mu}) / {sigma} = {fmt(za, 2)}
            </div>
            {modo === 'entre' && (
              <div>
                z<sub>b</sub> = ({b} − {mu}) / {sigma} = {fmt(zb, 2)}
              </div>
            )}
          </div>

          <div className="mt-3 mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Passo 2 — buscar na tabela e combinar
          </div>
          <div className="space-y-1 font-mono text-sm text-gray-800 dark:text-gray-200">
            {modo === 'menor' && <div>Φ({fmt(za, 2)}) = {fmt(phi(za))}</div>}
            {modo === 'maior' && (
              <div>
                1 − Φ({fmt(za, 2)}) = 1 − {fmt(phi(za))} = {fmt(1 - phi(za))}
              </div>
            )}
            {modo === 'entre' && (
              <div>
                Φ({fmt(Math.max(za, zb), 2)}) − Φ({fmt(Math.min(za, zb), 2)}) ={' '}
                {fmt(phi(Math.max(za, zb)))} − {fmt(phi(Math.min(za, zb)))} = {fmt(prob)}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 p-4 text-center">
          <div className="font-mono text-xl font-bold text-indigo-900 dark:text-indigo-100">
            {rotulo} = {fmt(prob)}
          </div>
          <div className="mt-1 text-sm text-indigo-800 dark:text-indigo-200">
            ou seja, {(prob * 100).toFixed(2).replace('.', ',')}% dos casos
          </div>
        </div>

        <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/40 p-3 text-sm text-indigo-900 dark:text-indigo-100">
          🎯 <strong>Coloque a = μ − σ e b = μ + σ no modo &quot;entre&quot;.</strong> Dá ≈ 0,6827 — a
          famosa regra de que 68% dos dados caem a um desvio-padrão da média. Com dois desvios dá ≈ 95%,
          e com três, ≈ 99,7%. Mude μ e σ à vontade: essas porcentagens não se alteram, porque a
          padronização apaga a escala original.
        </div>
      </div>
    </div>
  );
}
