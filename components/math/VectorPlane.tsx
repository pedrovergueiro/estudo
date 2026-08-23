'use client';

import React, { useRef, useState, useCallback } from 'react';

export interface VectorSpec {
  id: string;
  x: number;
  y: number;
  color: string;
  label: string;
  /** Se true, o aluno pode arrastar a ponta do vetor. */
  draggable?: boolean;
  dashed?: boolean;
  /** Desenha a partir de outro ponto em vez da origem (para soma "ponta a ponta"). */
  from?: { x: number; y: number };
}

interface VectorPlaneProps {
  vectors: VectorSpec[];
  /** Quantas unidades aparecem em cada direção a partir da origem. */
  range?: number;
  onDrag?: (id: string, x: number, y: number) => void;
  /** Ângulo a marcar entre dois vetores (ids). */
  showAngleBetween?: [string, string];
  /** Marca o ângulo reto quando os vetores são perpendiculares. */
  rightAngle?: boolean;
  size?: number;
}

const SIZE = 340;

/**
 * Plano cartesiano em SVG puro com vetores desenháveis e arrastáveis.
 *
 * SVG cresce o y para BAIXO e a matemática cresce para CIMA — toda a conversão
 * de coordenadas está isolada em toSvg/toMath para não espalhar sinal trocado
 * pelo componente.
 */
export function VectorPlane({
  vectors,
  range = 6,
  onDrag,
  showAngleBetween,
  rightAngle,
  size = SIZE,
}: VectorPlaneProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const unit = size / (2 * range);
  const toSvgX = (x: number) => size / 2 + x * unit;
  const toSvgY = (y: number) => size / 2 - y * unit;

  const handlePointer = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !onDrag || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      // Volta para coordenadas matemáticas, arredondando em meias unidades
      const mx = Math.round(((px - size / 2) / unit) * 2) / 2;
      const my = Math.round(((size / 2 - py) / unit) * 2) / 2;
      const clamp = (v: number) => Math.max(-range, Math.min(range, v));
      onDrag(dragging, clamp(mx), clamp(my));
    },
    [dragging, onDrag, unit, size, range]
  );

  const ticks = Array.from({ length: 2 * range + 1 }, (_, i) => i - range).filter((t) => t !== 0);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="touch-none select-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
      onPointerMove={handlePointer}
      onPointerUp={() => setDragging(null)}
      onPointerLeave={() => setDragging(null)}
    >
      <defs>
        {vectors.map((v) => (
          <marker
            key={`arrow-${v.id}`}
            id={`arrow-${v.id}`}
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={v.color} />
          </marker>
        ))}
      </defs>

      {/* Grade */}
      {ticks.map((t) => (
        <g key={`g${t}`}>
          <line
            x1={toSvgX(t)}
            y1={0}
            x2={toSvgX(t)}
            y2={size}
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-gray-200 dark:text-gray-800"
          />
          <line
            x1={0}
            y1={toSvgY(t)}
            x2={size}
            y2={toSvgY(t)}
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-gray-200 dark:text-gray-800"
          />
        </g>
      ))}

      {/* Eixos */}
      <line
        x1={0}
        y1={size / 2}
        x2={size}
        y2={size / 2}
        stroke="currentColor"
        strokeWidth={1.5}
        className="text-gray-400 dark:text-gray-600"
      />
      <line
        x1={size / 2}
        y1={0}
        x2={size / 2}
        y2={size}
        stroke="currentColor"
        strokeWidth={1.5}
        className="text-gray-400 dark:text-gray-600"
      />

      {/* Rótulos dos eixos */}
      <text x={size - 12} y={size / 2 - 6} className="fill-gray-500 text-[11px] font-medium">
        x
      </text>
      <text x={size / 2 + 6} y={12} className="fill-gray-500 text-[11px] font-medium">
        y
      </text>

      {/* Marcas numéricas */}
      {ticks
        .filter((t) => t % 2 === 0)
        .map((t) => (
          <g key={`t${t}`}>
            <text
              x={toSvgX(t)}
              y={size / 2 + 14}
              textAnchor="middle"
              className="fill-gray-400 text-[10px]"
            >
              {t}
            </text>
            <text
              x={size / 2 - 8}
              y={toSvgY(t) + 4}
              textAnchor="end"
              className="fill-gray-400 text-[10px]"
            >
              {t}
            </text>
          </g>
        ))}

      {/* Marca de ângulo reto */}
      {rightAngle && vectors.length >= 2 && (
        <RightAngleMark a={vectors[0]} b={vectors[1]} toSvgX={toSvgX} toSvgY={toSvgY} unit={unit} />
      )}

      {/* Vetores */}
      {vectors.map((v) => {
        const ox = v.from?.x ?? 0;
        const oy = v.from?.y ?? 0;
        const x1 = toSvgX(ox);
        const y1 = toSvgY(oy);
        const x2 = toSvgX(ox + v.x);
        const y2 = toSvgY(oy + v.y);

        return (
          <g key={v.id}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={v.color}
              strokeWidth={2.5}
              strokeDasharray={v.dashed ? '5 4' : undefined}
              markerEnd={`url(#arrow-${v.id})`}
            />

            {/* Alça de arraste */}
            {v.draggable && (
              <circle
                cx={x2}
                cy={y2}
                r={11}
                fill={v.color}
                fillOpacity={dragging === v.id ? 0.35 : 0.18}
                stroke={v.color}
                strokeWidth={1.5}
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setDragging(v.id);
                }}
              />
            )}

            <text
              x={x2 + (v.x >= 0 ? 10 : -10)}
              y={y2 + (v.y >= 0 ? -8 : 16)}
              textAnchor={v.x >= 0 ? 'start' : 'end'}
              fill={v.color}
              className="text-[12px] font-bold"
            >
              {v.label}
            </text>
          </g>
        );
      })}

      {/* Origem */}
      <circle cx={size / 2} cy={size / 2} r={3} className="fill-gray-500" />
    </svg>
  );
}

function RightAngleMark({
  a,
  b,
  toSvgX,
  toSvgY,
  unit,
}: {
  a: VectorSpec;
  b: VectorSpec;
  toSvgX: (n: number) => number;
  toSvgY: (n: number) => number;
  unit: number;
}) {
  const dotProd = a.x * b.x + a.y * b.y;
  if (Math.abs(dotProd) > 1e-9) return null;

  const na = Math.hypot(a.x, a.y);
  const nb = Math.hypot(b.x, b.y);
  if (na === 0 || nb === 0) return null;

  const s = 0.55;
  const ua = { x: (a.x / na) * s, y: (a.y / na) * s };
  const ub = { x: (b.x / nb) * s, y: (b.y / nb) * s };

  const pts = [
    [toSvgX(ua.x), toSvgY(ua.y)],
    [toSvgX(ua.x + ub.x), toSvgY(ua.y + ub.y)],
    [toSvgX(ub.x), toSvgY(ub.y)],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');

  return <polyline points={pts} fill="none" stroke="#f59e0b" strokeWidth={2} />;
}
