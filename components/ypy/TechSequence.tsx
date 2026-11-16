'use client';

import { useEffect, useRef, useState } from 'react';

const STEPS = [
  {
    k: 'Survey',
    t: 'The rover travels the terrain.',
    d: 'An autonomous ground unit covers the property, building a georeferenced, three-dimensional reading of the land as it moves.',
  },
  {
    k: 'Identify',
    t: 'The system identifies relevant regions.',
    d: 'Terrain and environmental readings are combined to highlight zones that behave differently and deserve closer attention.',
  },
  {
    k: 'Place',
    t: 'Stakes go where they matter.',
    d: 'Monitoring points are selected strategically, so each stake represents a region instead of an arbitrary spot on a grid.',
  },
  {
    k: 'Sense',
    t: 'Sensors monitor continuously.',
    d: 'Each stake is designed to read soil moisture at 20 cm and 40 cm, and temperature at 20 cm — below the surface, where behaviour actually changes.',
  },
  {
    k: 'Transmit',
    t: 'Data flows to the platform.',
    d: 'Readings travel over a long-range, low-power radio link (LoRa in the planned architecture) into YPY Intelligence.',
  },
  {
    k: 'Learn',
    t: 'Intelligence finds the patterns.',
    d: 'Models analyse how each region behaves over time and flag anomalies — turning a stream of readings into decisions for the producer.',
  },
];

/* Isometric projection for the diagram. Grid units 0..10, z in px. */
const iso = (x: number, y: number, z = 0): [number, number] => [300 + (x - y) * 24, 176 + (x + y) * 12 - z];
const pts = (list: [number, number, number?][]) => list.map(([x, y, z]) => iso(x, y, z ?? 0).join(',')).join(' ');
const quad = (x0: number, y0: number, x1: number, y1: number, z = 0) =>
  pts([
    [x0, y0, z],
    [x1, y0, z],
    [x1, y1, z],
    [x0, y1, z],
  ]);

const STAKES: [number, number][] = [
  [3, 3],
  [7, 2],
  [6.5, 7],
  [2, 7.5],
  [8.6, 5],
];
const REGIONS: [number, number, number, number][] = [
  [2, 2, 4, 4],
  [6, 1, 8, 3],
  [5, 6, 8, 8],
];
const ANOMALY = 2;
const HUB: [number, number] = [520, 62];

const roverPath = (() => {
  const rows = [1, 3, 5, 7, 9];
  const p: string[] = [];
  rows.forEach((y, i) => {
    const [a, b] = i % 2 ? [9, 1] : [1, 9];
    p.push(`${i ? 'L' : 'M'}${iso(a, y).join(' ')}`, `L${iso(b, y).join(' ')}`);
  });
  return p.join(' ');
})();

export default function TechSequence() {
  const [step, setStep] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.i));
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    items.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const on = (n: number) => (step >= n ? 'g on' : 'g');

  return (
    <div className="y-tech">
      <div className="y-tech__visual">
        <div className="y-tech__frame">
          <div className="y-tech__hud">
            <span>System sequence</span>
            <span>
              {String(step + 1).padStart(2, '0')} / 06 · {STEPS[step].k}
            </span>
          </div>
          <svg viewBox="0 0 600 540" role="img" aria-label={`Diagram, step ${step + 1} of 6: ${STEPS[step].t}`}>
            {/* subsurface layers */}
            <g className={on(3)}>
              {[-56, -112].map((z, i) => (
                <g key={z}>
                  <polygon className="l-sub" points={quad(0, 0, 10, 10, z)} />
                  <text className="l-txt" x={iso(10, 10, z)[0] + 2} y={iso(10, 10, z)[1] + 16} textAnchor="middle">
                    −{(i + 1) * 20} cm
                  </text>
                </g>
              ))}
            </g>

            {/* surface grid */}
            <g className="g on">
              <polygon className="l-surface" points={quad(0, 0, 10, 10)} />
              {Array.from({ length: 9 }, (_, i) => i + 1).map((i) => (
                <g key={i}>
                  <polyline className="l-grid" points={pts([[i, 0], [i, 10]])} />
                  <polyline className="l-grid" points={pts([[0, i], [10, i]])} />
                </g>
              ))}
            </g>

            {/* 1 · rover path */}
            <g className={on(0)}>
              <path id="y-rover-path" className="l-path" d={roverPath} pathLength={1} />
              <g className="l-rover">
                <polygon points="-9,0 0,-5 9,0 0,5" />
                <polygon points="-9,0 0,5 0,10 -9,5" />
                <polygon points="9,0 0,5 0,10 9,5" />
                <animateMotion dur="26s" repeatCount="indefinite" calcMode="linear">
                  <mpath href="#y-rover-path" />
                </animateMotion>
              </g>
            </g>

            {/* 2 · regions */}
            <g className={on(1)}>
              {REGIONS.map((r, i) => (
                <polygon key={i} className="l-region" points={quad(...r)} style={{ transitionDelay: `${i * 120}ms` }} />
              ))}
            </g>

            {/* 3 · stakes, 4 · sensors, 5 · uplink */}
            {STAKES.map(([x, y], i) => {
              const top = iso(x, y, 34);
              const base = iso(x, y, -112);
              const mid = iso(x, y, -56);
              const cx = (top[0] + HUB[0]) / 2;
              const cy = Math.min(top[1], HUB[1]) - 70;
              return (
                <g key={i}>
                  <g className={on(4)}>
                    <path
                      className="l-link"
                      d={`M${top[0]} ${top[1]} Q${cx} ${cy} ${HUB[0]} ${HUB[1] + 14}`}
                      style={{ animationDelay: `${i * -0.4}s` }}
                    />
                  </g>
                  <g className={`${on(2)} l-stake`} style={{ transitionDelay: `${i * 90}ms` }}>
                    <line x1={top[0]} y1={top[1]} x2={base[0]} y2={base[1]} />
                    <rect x={top[0] - 4} y={top[1] - 10} width="8" height="10" />
                    <text className="l-txt" x={top[0] + 9} y={top[1] - 2}>
                      P-0{i + 1}
                    </text>
                  </g>
                  <g className={on(3)}>
                    {[mid, base].map((p, j) => (
                      <g key={j}>
                        <circle className="l-node" cx={p[0]} cy={p[1]} r="3.2" />
                        <circle
                          className="l-pulse"
                          cx={p[0]}
                          cy={p[1]}
                          r="3.2"
                          style={{ animationDelay: `${(i * 0.35 + j * 0.6).toFixed(2)}s` }}
                        />
                      </g>
                    ))}
                  </g>
                  {i === ANOMALY && (
                    <g className={on(5)}>
                      <circle className="l-alert" cx={base[0]} cy={base[1]} r="9" />
                      <line className="l-alert-line" x1={base[0] + 10} y1={base[1]} x2={base[0] + 44} y2={base[1]} />
                      <text className="l-txt l-txt--alert" x={base[0] + 48} y={base[1] + 3}>
                        ANOMALY · P-0{i + 1} · −40 cm
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* hub */}
            <g className={on(4)}>
              <rect className="l-hub" x={HUB[0] - 62} y={HUB[1] - 14} width="124" height="28" />
              <text className="l-txt l-txt--hub" x={HUB[0]} y={HUB[1] + 4} textAnchor="middle">
                YPY INTELLIGENCE
              </text>
            </g>
            <g className={on(5)}>
              <polyline className="l-spark" points="388,58 398,54 408,57 418,50 428,53 438,44 448,56" />
              <text className="l-txt" x="388" y="38">
                PATTERN ANALYSIS
              </text>
            </g>
          </svg>
          <p className="y-tech__note">Schematic illustration · not to scale</p>
        </div>
      </div>

      <ol className="y-tech__steps">
        {STEPS.map((s, i) => (
          <li
            key={s.k}
            data-i={i}
            className={i === step ? 'is-active' : undefined}
            ref={(el) => {
              items.current[i] = el;
            }}
          >
            <span className="y-tech__num">
              {String(i + 1).padStart(2, '0')} — {s.k}
            </span>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
