'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/* Everything in this file is fictional, deterministic demo data. */

type Layer = 'moisture' | 'risk';
type Depth = 20 | 40;

const FIELD: [number, number][] = [
  [60, 78],
  [250, 44],
  [470, 62],
  [590, 152],
  [562, 330],
  [420, 400],
  [200, 388],
  [78, 300],
];

const POINTS = [
  { id: 'P-01', x: 160, y: 136, m20: 31.2, m40: 36.4, t: 22.4 },
  { id: 'P-02', x: 300, y: 112, m20: 28.1, m40: 33.9, t: 22.9 },
  { id: 'P-03', x: 452, y: 142, m20: 24.4, m40: 30.2, t: 23.6 },
  { id: 'P-04', x: 500, y: 262, m20: 17.3, m40: 21.8, t: 24.8 },
  { id: 'P-05', x: 362, y: 240, m20: 27.0, m40: 31.3, t: 23.1 },
  { id: 'P-06', x: 222, y: 262, m20: 33.4, m40: 38.1, t: 21.9 },
  { id: 'P-07', x: 332, y: 344, m20: 29.2, m40: 34.6, t: 22.6 },
];
const ANOMALY = 3;

const ALERTS = [
  { p: 3, level: 'high', t: '40 cm layer drying faster than neighbouring points', when: 'Day 11 → 14' },
  { p: 2, level: 'watch', t: 'Moisture gradient between 20 and 40 cm narrowing', when: 'Day 12 → 14' },
  { p: 5, level: 'info', t: 'Reading pattern stable after irrigation event', when: 'Day 9' },
];

const DAYS = 14;

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function history(i: number) {
  const r = rng(i * 97 + 11);
  const p = POINTS[i];
  const a: number[] = [];
  const b: number[] = [];
  for (let d = 0; d < DAYS; d++) {
    const k = d / (DAYS - 1);
    // The flagged point dries out sharply over the last days; the others drift gently.
    const drift = i === ANOMALY ? (k < 0.7 ? 11 - k * 3 : 8.9 * (1 - (k - 0.7) / 0.3)) : (1 - k) * 2.4;
    const irrigation = i !== ANOMALY && d >= 8 && d <= 10 ? 2.2 - Math.abs(d - 9) * 0.9 : 0;
    a.push(p.m20 + drift * 0.8 + irrigation + (r() - 0.5) * 1.3);
    b.push(p.m40 + drift + irrigation * 0.6 + (r() - 0.5) * 0.9);
  }
  a[DAYS - 1] = p.m20;
  b[DAYS - 1] = p.m40;
  return { a, b };
}

function inside(x: number, y: number) {
  let c = false;
  for (let i = 0, j = FIELD.length - 1; i < FIELD.length; j = i++) {
    const [xi, yi] = FIELD[i];
    const [xj, yj] = FIELD[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

const CELL = 18;
const MIN = 16;
const MAX = 39;

export default function IntelligenceDemo() {
  const [layer, setLayer] = useState<Layer>('moisture');
  const [depth, setDepth] = useState<Depth>(40);
  const [sel, setSel] = useState(ANOMALY);
  const [tick, setTick] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  // Simulated "live" jitter, only while the panel is on screen.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let id: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(id);
      if (e.isIntersecting) id = setInterval(() => setTick((t) => t + 1), 2800);
    });
    if (root.current) io.observe(root.current);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, []);

  const live = (base: number, i: number, k: number) => base + Math.sin(tick * 0.9 + i * 1.7 + k) * 0.25;

  const cells = useMemo(() => {
    const out: { x: number; y: number; v: number }[] = [];
    for (let y = 36; y < 410; y += CELL)
      for (let x = 54; x < 600; x += CELL) {
        const cx = x + CELL / 2;
        const cy = y + CELL / 2;
        if (!inside(cx, cy)) continue;
        let num = 0;
        let den = 0;
        for (const p of POINTS) {
          const w = 1 / Math.pow(Math.hypot(cx - p.x, cy - p.y) + 6, 3.2);
          num += w * (depth === 20 ? p.m20 : p.m40);
          den += w;
        }
        out.push({ x, y, v: Math.min(1, Math.max(0, (num / den - MIN) / (MAX - MIN))) });
      }
    return out;
  }, [depth]);

  const hist = useMemo(() => history(sel), [sel]);
  const p = POINTS[sel];
  const fieldPts = FIELD.map((q) => q.join(',')).join(' ');

  // history chart geometry
  const CW = 340;
  const CH = 150;
  const px = (d: number) => 30 + (d / (DAYS - 1)) * (CW - 78);
  const py = (v: number) => 12 + (1 - (v - 14) / 28) * (CH - 36);
  const line = (arr: number[]) => arr.map((v, d) => `${d ? 'L' : 'M'}${px(d).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');

  const kpis = [
    { k: 'Moisture · 20 cm', v: live(p.m20, sel, 0).toFixed(1), u: '%' },
    { k: 'Moisture · 40 cm', v: live(p.m40, sel, 2).toFixed(1), u: '%' },
    { k: 'Temperature · 20 cm', v: live(p.t, sel, 4).toFixed(1), u: '°C' },
  ];

  return (
    <div className="y-app" ref={root}>
      <div className="y-app__chrome">
        <div className="y-app__crumbs">
          <b>YPY Intelligence</b>
          <span>Demo property</span>
          <span>Field 07</span>
        </div>
        <div className="y-app__badge">Concept demonstration · simulated data</div>
      </div>

      <div className="y-app__body">
        <nav className="y-app__rail" aria-label="Demo platform areas">
          {['Map', 'Points', 'Water', 'Alerts', 'Inspections'].map((t, i) => (
            <span key={t} className={i === 0 ? 'on' : undefined}>
              {t}
            </span>
          ))}
        </nav>

        <div className="y-app__map">
          <div className="y-app__tools">
            <div role="group" aria-label="Map layer">
              <button type="button" aria-pressed={layer === 'moisture'} onClick={() => setLayer('moisture')}>
                Soil moisture
              </button>
              <button type="button" aria-pressed={layer === 'risk'} onClick={() => setLayer('risk')}>
                Water risk
              </button>
            </div>
            <div role="group" aria-label="Depth">
              {([20, 40] as Depth[]).map((d) => (
                <button key={d} type="button" aria-pressed={depth === d} onClick={() => setDepth(d)}>
                  {d} cm
                </button>
              ))}
            </div>
          </div>

          <svg viewBox="30 20 590 400" role="group" aria-label="Demo field map with seven monitoring points">
            <defs>
              <clipPath id="y-field">
                <polygon points={fieldPts} />
              </clipPath>
            </defs>
            <g clipPath="url(#y-field)">
              {cells.map((c) => {
                const v = layer === 'moisture' ? c.v : 1 - c.v;
                return (
                  <rect
                    key={`${c.x}-${c.y}`}
                    x={c.x + 1}
                    y={c.y + 1}
                    width={CELL - 2}
                    height={CELL - 2}
                    className={layer === 'moisture' ? 'c-m' : 'c-r'}
                    style={{ opacity: 0.06 + Math.pow(v, 1.5) * 0.86 }}
                  />
                );
              })}
              {[0, 1, 2, 3].map((i) => (
                <ellipse key={i} className="m-contour" cx={330 - i * 18} cy={228 + i * 6} rx={90 + i * 62} ry={52 + i * 44} />
              ))}
            </g>
            <polygon className="m-field" points={fieldPts} />
            <polyline className="m-route" points={[0, 1, 2, 3, 4, 6, 5, 0].map((i) => `${POINTS[i].x},${POINTS[i].y}`).join(' ')} />
            {POINTS.map((q, i) => (
              <g
                key={q.id}
                className={`m-pt${i === sel ? ' sel' : ''}${i === ANOMALY ? ' alert' : ''}`}
                transform={`translate(${q.x} ${q.y})`}
                role="button"
                tabIndex={0}
                aria-label={`${q.id}, ${depth} cm moisture ${(depth === 20 ? q.m20 : q.m40).toFixed(1)} percent${i === ANOMALY ? ', anomaly flagged' : ''}`}
                aria-pressed={i === sel}
                onClick={() => setSel(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSel(i);
                  }
                }}
              >
                <circle className="hit" r="22" />
                {i === ANOMALY && <circle className="ping" r="9" />}
                <circle className="ring" r="9" />
                <circle className="dot" r="3.5" />
                <rect className="plate" x="11" y="-20" width="46" height="28" />
                <text x="15" y="-9">
                  {q.id}
                </text>
                <text className="val" x="15" y="4">
                  {live(depth === 20 ? q.m20 : q.m40, i, depth).toFixed(1)}%
                </text>
              </g>
            ))}
          </svg>

          <div className="y-app__legend">
            <span>{layer === 'moisture' ? 'Drier' : 'Lower risk'}</span>
            <i className={layer} />
            <span>{layer === 'moisture' ? 'Wetter' : 'Higher risk'}</span>
            <em>- - - planned inspection route</em>
          </div>
        </div>

        <aside className="y-app__side">
          <header>
            <div>
              <small>Monitoring point</small>
              <h4>{p.id}</h4>
            </div>
            <span className={`state${sel === ANOMALY ? ' alert' : ''}`}>{sel === ANOMALY ? 'Anomaly' : 'Nominal'}</span>
          </header>
          <p className="coords">
            Local grid · E {String(p.x * 2).padStart(4, '0')} m · N {String(p.y * 2).padStart(4, '0')} m
          </p>

          <div className="kpis">
            {kpis.map((k) => (
              <div key={k.k}>
                <small>{k.k}</small>
                <b>
                  {k.v}
                  <i>{k.u}</i>
                </b>
              </div>
            ))}
          </div>

          <figure className="chart">
            <figcaption>
              <span>Moisture history · 14 days</span>
              <span className="stream">
                <i /> simulated stream
              </span>
            </figcaption>
            <svg viewBox={`0 0 ${CW} ${CH}`} role="img" aria-label={`Simulated 14-day moisture history for ${p.id} at 20 and 40 cm`}>
              {[20, 30, 40].map((v) => (
                <g key={v}>
                  <line className="grid" x1="30" x2={CW - 48} y1={py(v)} y2={py(v)} />
                  <text className="ax" x="24" y={py(v) + 3} textAnchor="end">
                    {v}
                  </text>
                </g>
              ))}
              {[0, 6, 13].map((d) => (
                <text key={d} className="ax" x={px(d)} y={CH - 6} textAnchor="middle">
                  D{d + 1}
                </text>
              ))}
              <path className="s40" d={line(hist.b)} />
              <path className="s20" d={line(hist.a)} />
              <circle className="e40" cx={px(DAYS - 1)} cy={py(hist.b[DAYS - 1])} r="3" />
              <circle className="e20" cx={px(DAYS - 1)} cy={py(hist.a[DAYS - 1])} r="3" />
              <text className="lb l40" x={px(DAYS - 1) + 8} y={py(hist.b[DAYS - 1]) - 1}>
                40 cm
              </text>
              <text className="lb l20" x={px(DAYS - 1) + 8} y={py(hist.a[DAYS - 1]) + 9}>
                20 cm
              </text>
            </svg>
          </figure>

          <div className="alerts">
            <small>Anomalies identified</small>
            <ul>
              {ALERTS.map((a) => (
                <li key={a.t}>
                  <button type="button" className={a.level} onClick={() => setSel(a.p)}>
                    <b>{POINTS[a.p].id}</b>
                    <span>{a.t}</span>
                    <i>{a.when}</i>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
