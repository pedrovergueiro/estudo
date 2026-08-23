'use client';

import React, { useState } from 'react';

/** Quadrado e raiz como ÁREA e LADO — o significado geométrico. */
export function SquareRootVisual() {
  const [lado, setLado] = useState(5);
  const area = lado * lado;
  const cell = 24;

  return (
    <div className="my-8 rounded-xl border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 overflow-hidden">
      <div className="bg-emerald-100 dark:bg-emerald-900/50 px-5 py-3">
        <h4 className="font-bold text-emerald-900 dark:text-emerald-100">
          ⬛ Elevar ao quadrado é literalmente fazer um quadrado
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
            <span>Lado do quadrado</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
              {lado}
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={lado}
            onChange={(e) => setLado(Number(e.target.value))}
            className="mt-2 w-full accent-emerald-600"
          />
        </div>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {/* Quadrado desenhado */}
          <div className="shrink-0">
            <svg
              width={cell * 10 + 2}
              height={cell * 10 + 2}
              className="rounded border border-gray-300 dark:border-gray-700"
            >
              {Array.from({ length: 10 }, (_, r) =>
                Array.from({ length: 10 }, (_, c) => {
                  const dentro = r < lado && c < lado;
                  return (
                    <rect
                      key={`${r}-${c}`}
                      x={c * cell + 1}
                      y={r * cell + 1}
                      width={cell}
                      height={cell}
                      className="transition-colors duration-200"
                      fill={dentro ? '#10b981' : 'transparent'}
                      stroke="currentColor"
                      strokeWidth={0.5}
                      style={{ color: '#94a3b8' }}
                    />
                  );
                })
              )}
            </svg>
            <div className="mt-1 text-center text-xs text-gray-500">
              cada quadradinho = 1 unidade de área
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="rounded-lg bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 p-4">
              <div className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                Ida: elevar ao quadrado
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-gray-900 dark:text-gray-100">
                {lado}² = {lado} × {lado} = {area}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Você tem o <strong>lado</strong> ({lado}) e quer a <strong>área</strong>. Conte os
                quadradinhos verdes: são {area}. Elevar ao quadrado é multiplicar o número por ele
                mesmo — nunca por 2.
              </p>
            </div>

            <div className="rounded-lg bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 p-4">
              <div className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">
                Volta: tirar a raiz
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-gray-900 dark:text-gray-100">
                √{area} = {lado}
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Agora o contrário: você tem a <strong>área</strong> ({area}) e quer o{' '}
                <strong>lado</strong>. A raiz quadrada pergunta &quot;qual número multiplicado por
                ele mesmo dá {area}?&quot; — e a resposta é {lado}. Raiz e quadrado desfazem um ao
                outro.
              </p>
            </div>

            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-3 text-sm text-red-900 dark:text-red-100">
              ⚠️ <strong>Os dois erros clássicos:</strong> achar que {lado}² é {lado} × 2 ={' '}
              {lado * 2} (é multiplicar por ele MESMO, não por 2), e achar que √{area} é {area} ÷ 2
              = {area / 2} (raiz não é divisão).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pitágoras como duas áreas que somam numa terceira. */
export function PythagorasVisual() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const h2 = a * a + b * b;
  const h = Math.sqrt(h2);
  const exato = Number.isInteger(h);

  return (
    <div className="my-8 rounded-xl border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 overflow-hidden">
      <div className="bg-indigo-100 dark:bg-indigo-900/50 px-5 py-3">
        <h4 className="font-bold text-indigo-900 dark:text-indigo-100">
          📐 Pitágoras — a conta que vira norma de vetor
        </h4>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Cateto horizontal (a)</span>
              <span className="font-mono font-bold">{a}</span>
            </label>
            <input
              type="range"
              min={1}
              max={8}
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className="mt-1 w-full accent-indigo-600"
            />
          </div>
          <div>
            <label className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Cateto vertical (b)</span>
              <span className="font-mono font-bold">{b}</span>
            </label>
            <input
              type="range"
              min={1}
              max={8}
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="mt-1 w-full accent-indigo-600"
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <svg width={220} height={200} className="shrink-0">
            {(() => {
              const esc = 20;
              const ox = 30;
              const oy = 170;
              const x2 = ox + a * esc;
              const y2 = oy - b * esc;
              return (
                <>
                  {/* Marca de ângulo reto */}
                  <polyline
                    points={`${ox + 10},${oy} ${ox + 10},${oy - 10} ${ox},${oy - 10}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2}
                  />
                  {/* Catetos */}
                  <line x1={ox} y1={oy} x2={x2} y2={oy} stroke="#0ea5e9" strokeWidth={3} />
                  <line x1={x2} y1={oy} x2={x2} y2={y2} stroke="#16a34a" strokeWidth={3} />
                  {/* Hipotenusa */}
                  <line x1={ox} y1={oy} x2={x2} y2={y2} stroke="#dc2626" strokeWidth={3} />
                  {/* Rótulos */}
                  <text x={(ox + x2) / 2} y={oy + 16} textAnchor="middle" className="fill-sky-600 text-xs font-bold">
                    a = {a}
                  </text>
                  <text x={x2 + 8} y={(oy + y2) / 2} className="fill-emerald-600 text-xs font-bold">
                    b = {b}
                  </text>
                  <text
                    x={(ox + x2) / 2 - 18}
                    y={(oy + y2) / 2 - 6}
                    className="fill-red-600 text-xs font-bold"
                  >
                    h = {exato ? h : h.toFixed(2)}
                  </text>
                </>
              );
            })()}
          </svg>

          <div className="flex-1 space-y-3">
            <div className="rounded-lg bg-white dark:bg-gray-900 border border-indigo-200 dark:border-indigo-800 p-4">
              <div className="text-xs font-semibold uppercase text-indigo-700 dark:text-indigo-300">
                Passo a passo
              </div>
              <div className="mt-2 space-y-1 font-mono text-sm text-gray-800 dark:text-gray-200">
                <div>
                  1. Eleve cada cateto ao quadrado: {a}² = {a * a} e {b}² = {b * b}
                </div>
                <div>
                  2. Some: {a * a} + {b * b} = {h2}
                </div>
                <div className="font-bold">
                  3. Tire a raiz: √{h2} = {exato ? h : h.toFixed(3)}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                O passo 3 é o mais esquecido. Parar no {h2} e dar isso como resposta é o erro mais
                comum — o {h2} é o quadrado da hipotenusa, não a hipotenusa.
              </p>
            </div>

            <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/40 p-3 text-sm text-indigo-900 dark:text-indigo-100">
              🔗 <strong>Conexão direta com GAAL:</strong> a norma do vetor ({a}, {b}) é exatamente
              esta conta: ‖v‖ = √({a}² + {b}²) = {exato ? h : h.toFixed(3)}. O vetor é a hipotenusa;
              as componentes são os catetos. Se você domina Pitágoras, domina norma.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
