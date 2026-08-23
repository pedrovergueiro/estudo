'use client';

import React from 'react';

interface MatrixGridProps {
  data: (string | number)[][];
  label?: string;
  highlight?: {
    rows?: number[];
    cols?: number[];
    cells?: [number, number][];
  };
  /** Chamado ao clicar numa célula — usado no explorador de notação. */
  onCellClick?: (row: number, col: number) => void;
  /** Célula atualmente selecionada (destaque forte). */
  selected?: [number, number] | null;
  size?: 'sm' | 'md';
}

/**
 * Matriz renderizada com colchetes de verdade (não tabela crua).
 * Usada tanto na teoria quanto no StepByStepSolver.
 */
export function MatrixGrid({
  data,
  label,
  highlight,
  onCellClick,
  selected,
  size = 'md',
}: MatrixGridProps) {
  const rows = data.length;
  const cols = data[0]?.length ?? 0;

  const isHighlighted = (i: number, j: number) =>
    highlight?.rows?.includes(i) ||
    highlight?.cols?.includes(j) ||
    highlight?.cells?.some(([r, c]) => r === i && c === j);

  const isSelected = (i: number, j: number) => selected?.[0] === i && selected?.[1] === j;

  const cellSize = size === 'sm' ? 'h-9 w-9 text-xs' : 'h-12 w-12 text-sm';

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </span>
      )}

      <div className="flex items-stretch">
        {/* Colchete esquerdo */}
        <div className="w-2 rounded-l-md border-y-2 border-l-2 border-gray-700 dark:border-gray-300" />

        <div className="px-1.5 py-1.5">
          {data.map((row, i) => (
            <div key={i} className="flex">
              {row.map((cell, j) => {
                const hl = isHighlighted(i, j);
                const sel = isSelected(i, j);
                const clickable = Boolean(onCellClick);

                return (
                  <div
                    key={j}
                    onClick={() => onCellClick?.(i, j)}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onCellClick?.(i, j);
                      }
                    }}
                    className={`m-0.5 flex ${cellSize} items-center justify-center rounded font-mono font-medium transition-all duration-200
                      ${clickable ? 'cursor-pointer hover:scale-110' : ''}
                      ${
                        sel
                          ? 'bg-amber-400 text-gray-900 ring-2 ring-amber-600 scale-110'
                          : hl
                            ? 'bg-indigo-500 text-white scale-105'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      }`}
                  >
                    {cell === '' ? <span className="opacity-25">·</span> : cell}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Colchete direito */}
        <div className="w-2 rounded-r-md border-y-2 border-r-2 border-gray-700 dark:border-gray-300" />
      </div>

      <span className="text-[11px] text-gray-500 dark:text-gray-400">
        {rows} × {cols}
      </span>
    </div>
  );
}
