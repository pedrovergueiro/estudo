'use client';

import { useEffect, useRef, useState } from 'react';
import { partName } from './kit';

type Three = typeof import('three');
type Group = import('three').Group;

/**
 * Components of the Stake M1 design model. `match` lists fragments of the part
 * names inside estaca-m1.glb; `off` is the exploded-view offset in cm and
 * `view` the camera angle (radians) that shows the part best.
 */
export const PARTS = [
  { id: 'head', name: 'Sealed junction box', spec: 'Enclosure above ground', tone: 'ink', off: [0, 10, 0], view: 0.9, match: ['Caixa de passagem', 'Tampa da caixa'],
    d: 'A gasketed box with a screwed lid keeps the electronics above the soil and out of the weather.' },
  { id: 'mcu', name: 'ESP32-C3 Super Mini', spec: 'Microcontroller', tone: 'teal', off: [-9, 12, 9], view: 1.45, match: ['ESP32'],
    d: 'Wakes up, reads the probes, prepares each reading for transmission and goes back to sleep.' },
  { id: 'adc', name: 'ADS1115', spec: 'Analog converter', tone: 'teal', off: [-9, 6, 9], view: 1.45, match: ['ADS1115'],
    d: 'A dedicated converter turns the probes\' analog signal into a finer-grained reading.' },
  { id: 'radio', name: 'LoRa SX1276', spec: '915 MHz · planned link', tone: 'terra', off: [-9, 12, -3], view: 1.45, match: ['LoRa'],
    d: 'Long-range, low-power radio foreseen in the architecture to reach the platform.' },
  { id: 'power', name: '18650 cell + TP4056', spec: 'Battery and charger', tone: 'ink', off: [-9, 17, -9], view: 1.45, match: ['Bateria 18650', 'TP4056 com'],
    d: 'One lithium cell with a protected charger board: the stake sits where the terrain asks, not where a cable reaches.' },
  { id: 'tube', name: 'PVC body', spec: '25 mm solvent-weld tube', tone: 'ink', off: [0, 0, 0], view: 0.5, match: ['Tubo de PVC', 'Cap de PVC', 'Adaptador'],
    d: 'A 25 mm PVC tube with a bottom cap carries the cables and holds the probes at their depths.' },
  { id: 'm20', name: 'Moisture probe S1', spec: 'Capacitive · 20 cm', tone: 'teal', off: [9, 0, 0], view: 0.9, match: ['S1 (20 cm)'],
    d: 'First capacitive soil-moisture sensor, sealed in epoxy at 20 cm depth.' },
  { id: 't20', name: 'DS18B20', spec: 'Temperature · 20 cm', tone: 'terra', off: [-9, 0, 0], view: -0.9, match: ['Sonda de temperatura'],
    d: 'Digital temperature probe at 20 cm, on the side opposite the moisture sensor.' },
  { id: 'm40', name: 'Moisture probe S2', spec: 'Capacitive · 40 cm', tone: 'teal', off: [9, 0, 0], view: 0.9, match: ['S2 (40 cm)'],
    d: 'Second capacitive soil-moisture sensor, at 40 cm depth.' },
] as const;

type PartId = (typeof PARTS)[number]['id'];

const INK = 0x14120e;
const PAPER = 0xebe6da;
const TERRA = 0xd4431f;
const TEAL = 0x0e8474;

export default function StakeViewer() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const marks = useRef<(HTMLSpanElement | null)[]>([]);
  const api = useRef<{ set: (s: { part: PartId | null; exploded: boolean; soil: boolean }) => void } | null>(null);

  const [part, setPart] = useState<PartId | null>(null);
  const [exploded, setExploded] = useState(false);
  const [soil, setSoil] = useState(true);
  const [ready, setReady] = useState<'loading' | 'ok' | 'fail'>('loading');

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    const el = wrap.current;
    if (!el) return;
    // Load three.js only when the viewer approaches the viewport.
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        import('three')
          .then(async (THREE) => {
            if (disposed || !wrap.current || !canvas.current) return;
            const r = await build(THREE, wrap.current, canvas.current, marks.current);
            if (!r) return setReady('fail');
            cleanup = r.dispose;
            api.current = r;
            setReady('ok');
          })
          .catch(() => setReady('fail'));
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
  }, []);

  useEffect(() => {
    api.current?.set({ part, exploded, soil });
  }, [part, exploded, soil, ready]);

  const active = PARTS.find((p) => p.id === part);

  return (
    <div className="y-stake">
      <div className="y-stake__stage" ref={wrap}>
        <canvas
          ref={canvas}
          role="img"
          aria-label="Interactive 3D concept model of the YPY Stake M1: a sealed junction box on a 25 mm PVC tube with moisture probes at 20 and 40 cm and a temperature sensor at 20 cm."
        />
        {['Surface', '−20 cm', '−40 cm'].map((t, i) => (
          <span
            key={t}
            className="y-stake__mark"
            ref={(el) => {
              marks.current[i] = el;
            }}
          >
            {t}
          </span>
        ))}
        <span
          className="y-stake__pin"
          ref={(el) => {
            marks.current[3] = el;
          }}
        />
        {ready !== 'ok' && (
          <p className="y-stake__status">{ready === 'loading' ? 'Loading 3D model…' : '3D view unavailable on this device.'}</p>
        )}
        <div className="y-stake__controls">
          <button type="button" aria-pressed={exploded} onClick={() => setExploded((v) => !v)}>
            Exploded view
          </button>
          <button type="button" aria-pressed={soil} onClick={() => setSoil((v) => !v)}>
            Soil section
          </button>
          <span>Drag to rotate</span>
        </div>
      </div>

      <div className="y-stake__panel">
        <ul className="y-stake__list">
          {PARTS.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={part === p.id}
                onClick={() => setPart(p.id)}
                onMouseEnter={() => setPart(p.id)}
                onFocus={() => setPart(p.id)}
              >
                <i>{String(i + 1).padStart(2, '0')}</i>
                <b>{p.name}</b>
                <span>{p.spec}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="y-stake__desc" aria-live="polite">
          {active ? active.d : 'Select a component to locate it on the model.'}
        </p>
      </div>
    </div>
  );
}

/* Model units are centimetres. */
async function build(THREE: Three, wrap: HTMLDivElement, canvas: HTMLCanvasElement, marks: (HTMLSpanElement | null)[]) {
  let renderer: import('three').WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 600);
  const root = new THREE.Group();
  scene.add(root);

  const disposables: { dispose: () => void }[] = [];
  type Part = { g: Group; lines: import('three').LineBasicMaterial[]; fills: import('three').MeshBasicMaterial[]; base: number; off: import('three').Vector3 };
  const parts: Partial<Record<PartId, Part>> = {};

  const solid = (geo: import('three').BufferGeometry, color = INK, fill = PAPER, opacity = 1) => {
    const g = new THREE.Group();
    const fm = new THREE.MeshBasicMaterial({
      color: fill,
      transparent: opacity < 1,
      opacity,
      depthWrite: opacity === 1,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    const eg = new THREE.EdgesGeometry(geo, 24);
    const lm = new THREE.LineBasicMaterial({ color });
    g.add(new THREE.Mesh(geo, fm), new THREE.LineSegments(eg, lm));
    g.userData = { lm, fm };
    disposables.push(geo, fm, eg, lm);
    return g;
  };
  const register = (id: PartId, color: number, off: [number, number, number], ...groups: Group[]) => {
    const g = new THREE.Group();
    groups.forEach((x) => g.add(x));
    root.add(g);
    parts[id] = {
      g,
      lines: groups.map((x) => x.userData.lm),
      fills: groups.map((x) => x.userData.fm),
      base: color,
      off: new THREE.Vector3(...off),
    };
    return g;
  };

  // the real Stake M1 design model, redrawn in the technical-drawing style
  let model: import('three').Group;
  try {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    model = (await new GLTFLoader().loadAsync('/ypy/models/estaca-m1.glb')).scene;
  } catch {
    renderer.dispose();
    return null;
  }
  model.updateMatrixWorld(true);
  const tones = { ink: INK, teal: TEAL, terra: TERRA };
  for (const part of PARTS) {
    const groups: Group[] = [];
    model.traverse((o) => {
      const m = o as import('three').Mesh;
      if (!m.isMesh || !part.match.some((k) => partName(o).includes(k))) return;
      const geo = m.geometry.clone().applyMatrix4(m.matrixWorld).scale(100, 100, 100); // metres → cm
      groups.push(solid(geo, tones[part.tone], PAPER, part.id === 'head' ? 0.3 : 1));
    });
    register(part.id, tones[part.tone], [...part.off] as [number, number, number], ...groups);
  }

  // Soil section: a cut block behind the stake with depth planes
  const soil = new THREE.Group();
  const blockGeo = new THREE.BoxGeometry(34, 52, 15);
  const blockMat = new THREE.MeshBasicMaterial({ color: 0x8a5a3c, transparent: true, opacity: 0.16, depthWrite: false });
  const block = new THREE.Mesh(blockGeo, blockMat);
  block.position.set(0, -26, -7.5);
  const blockEdges = new THREE.EdgesGeometry(blockGeo);
  const blockLine = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.45 });
  const blockWire = new THREE.LineSegments(blockEdges, blockLine);
  blockWire.position.copy(block.position);
  soil.add(block, blockWire);
  const dash = new THREE.LineDashedMaterial({ color: INK, dashSize: 0.9, gapSize: 0.9, transparent: true, opacity: 0.7 });
  for (const y of [-20, -40]) {
    const lg = new THREE.BufferGeometry().setFromPoints(
      [
        [-17, 0],
        [17, 0],
        [17, -15],
        [-17, -15],
        [-17, 0],
      ].map(([x, z]) => new THREE.Vector3(x, y, z)),
    );
    const l = new THREE.Line(lg, dash);
    l.computeLineDistances();
    soil.add(l);
    disposables.push(lg);
  }
  disposables.push(blockGeo, blockMat, blockEdges, blockLine, dash);
  root.add(soil);
  root.position.y = 8;

  /* ── interaction ── */
  const state = { yaw: -0.55, pitch: 0.12, tyaw: -0.55, tpitch: 0.12, explode: 0, texplode: 0, touched: false };
  let dragging = false;
  let lx = 0;
  let ly = 0;
  const down = (e: PointerEvent) => {
    dragging = true;
    state.touched = true;
    lx = e.clientX;
    ly = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent) => {
    if (!dragging) return;
    state.tyaw += (e.clientX - lx) * 0.009;
    state.tpitch = Math.max(-0.25, Math.min(0.6, state.tpitch + (e.clientY - ly) * 0.004));
    lx = e.clientX;
    ly = e.clientY;
    wake();
  };
  const up = () => {
    dragging = false;
  };
  const key = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    state.touched = true;
    state.tyaw += e.key === 'ArrowLeft' ? -0.25 : 0.25;
    wake();
  };
  canvas.tabIndex = 0;
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('keydown', key);

  let selected: PartId | null = null;
  const tint = new THREE.Color();
  const applySelection = () => {
    (Object.keys(parts) as PartId[]).forEach((id) => {
      const p = parts[id]!;
      const isSel = id === selected;
      const dim = selected && !isSel;
      p.lines.forEach((m) => {
        m.color.set(isSel ? TERRA : p.base);
        m.transparent = true;
        m.opacity = dim ? 0.28 : 1;
      });
      p.fills.forEach((m) => {
        tint.set(isSel ? 0xf4b9a6 : PAPER);
        m.color.copy(tint);
      });
    });
  };

  const resize = () => {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    wake();
  };
  const ro = new ResizeObserver(resize);

  const v = new THREE.Vector3();
  const place = (el: HTMLSpanElement | null, x: number, y: number, z: number, show = true) => {
    if (!el) return;
    v.set(x, y, z).applyMatrix4(root.matrixWorld).project(camera);
    el.style.transform = `translate3d(${((v.x + 1) / 2) * wrap.clientWidth}px, ${((1 - v.y) / 2) * wrap.clientHeight}px, 0)`;
    el.style.opacity = show ? '1' : '0';
  };

  let raf = 0;
  let visible = true;
  let last = performance.now();
  function frame(now: number) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!state.touched && !reduced) state.tyaw += dt * 0.22;
    state.yaw += (state.tyaw - state.yaw) * 0.12;
    state.pitch += (state.tpitch - state.pitch) * 0.12;
    state.explode += (state.texplode - state.explode) * 0.1;
    root.rotation.y = state.yaw;
    (Object.keys(parts) as PartId[]).forEach((id) => {
      const p = parts[id]!;
      p.g.position.copy(p.off).multiplyScalar(state.explode);
    });
    // Frame the whole stake: the taller the canvas, the closer the camera.
    const span = 100 + state.explode * 18;
    const dist = (span / 2 / Math.tan((camera.fov * Math.PI) / 360)) * Math.max(1, 0.62 / camera.aspect);
    camera.position.set(0, Math.sin(state.pitch) * dist, Math.cos(state.pitch) * dist);
    camera.lookAt(0, 0, 0);
    root.updateMatrixWorld();
    camera.updateMatrixWorld();

    place(marks[0], -17, 0, 0, soil.visible);
    place(marks[1], -17, -20, 0, soil.visible);
    place(marks[2], -17, -40, 0, soil.visible);
    if (selected) {
      const p = parts[selected]!;
      const b = new THREE.Box3().setFromObject(p.g);
      b.getCenter(v);
      root.worldToLocal(v);
      place(marks[3], v.x, v.y, v.z, true);
    } else if (marks[3]) marks[3].style.opacity = '0';

    renderer.render(scene, camera);
    const settling =
      Math.abs(state.tyaw - state.yaw) > 0.001 ||
      Math.abs(state.tpitch - state.pitch) > 0.001 ||
      Math.abs(state.texplode - state.explode) > 0.001;
    if (visible && (settling || dragging || (!state.touched && !reduced))) raf = requestAnimationFrame(frame);
  }
  function wake() {
    if (!raf && visible) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) wake();
  });
  io.observe(wrap);
  ro.observe(wrap);
  resize();

  return {
    set(s: { part: PartId | null; exploded: boolean; soil: boolean }) {
      selected = s.part;
      state.texplode = s.exploded ? 1 : 0;
      soil.visible = s.soil;
      applySelection();
      wake();
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('keydown', key);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
