'use client';

import React, { useState } from 'react';

/**
 * Bloco de código Python com botão de copiar — pensado para colar direto no Colab.
 * `saida` mostra o que o código imprime, separado do código em si.
 */
export function CodeBlock({
  titulo,
  code,
  saida,
}: {
  titulo?: string;
  code: string;
  saida?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="my-5 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700">
      <div className="flex items-center justify-between gap-3 bg-gray-100 dark:bg-gray-800 px-4 py-2">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
          {titulo ?? 'Python'}
        </span>
        <button
          type="button"
          onClick={copiar}
          className="rounded px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {copiado ? '✓ copiado' : 'copiar'}
        </button>
      </div>

      <div className="overflow-x-auto bg-gray-900 p-4">
        <pre className="text-[13px] leading-relaxed text-gray-100">
          <code>{code}</code>
        </pre>
      </div>

      {saida && (
        <div className="overflow-x-auto border-t border-gray-700 bg-gray-950 px-4 py-3">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
            saída
          </div>
          <pre className="text-[13px] leading-relaxed text-emerald-200">
            <code>{saida}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
