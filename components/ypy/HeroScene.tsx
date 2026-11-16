'use client';

import { useEffect, useRef } from 'react';

type Three = typeof import('three');

/** Path parameters (0..1 of a lap) where the rover flags a monitoring point. */
const POINTS = [0.07, 0.21, 0.38, 0.55, 0.72, 0.89];
/** Illustrative readings shown next to each point. Not real measurements. */
const DEMO = [
  ['31.4', '36.2'],
  ['28.0', '33.7'],
  ['24.6', '30.1'],
  ['17.2', '22.4'],
  ['27.3', '31.0'],
  ['33.1', '38.5'],
];
const LAP_SECONDS = 46;

const INK = 0x0c0b09;
const BONE = 0xebe6da;
const TERRA = 0xe2502a;
const AQUA = 0x7fe3d4;

function height(x: number, z: number) {
  return (
    1.5 * Math.sin(x * 0.17 + 1.3) * Math.cos(z * 0.2) +
    0.9 * Math.sin(x * 0.07 - z * 0.11 + 2.0) +
    0.35 * Math.sin(x * 0.42 + z * 0.36)
  );
}

function pathAt(t: number) {
  const a = t * Math.PI * 2;
  const x = 15 * Math.sin(a);
  const z = 7.5 * Math.sin(2 * a);
  return { x, z, y: height(x, z) };
}

export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const telemetry = useRef<HTMLDListElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    import('three')
      .then((THREE) => {
        if (disposed || !wrap.current || !canvas.current) return;
        cleanup = start(THREE, wrap.current, canvas.current, labels.current, telemetry.current);
      })
      .catch(() => {});
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div className="y-hero__scene" ref={wrap} aria-hidden="true">
      <canvas ref={canvas} />
      {POINTS.map((_, i) => (
        <div
          key={i}
          className="y-tag"
          ref={(el) => {
            labels.current[i] = el;
          }}
        >
          <b>P-0{i + 1}</b>
          <span>20 cm · {DEMO[i][0]}%</span>
          <span>40 cm · {DEMO[i][1]}%</span>
        </div>
      ))}
      <dl className="y-telemetry" ref={telemetry}>
        <div className="y-telemetry__head">
          <i /> Rover telemetry · simulation
        </div>
        <div>
          <dt>Position</dt>
          <dd data-k="pos">E 0000.0 · N 0000.0</dd>
        </div>
        <div>
          <dt>Heading</dt>
          <dd data-k="hdg">000°</dd>
        </div>
        <div>
          <dt>Points flagged</dt>
          <dd data-k="pts">0 / {POINTS.length}</dd>
        </div>
        <div>
          <dt>State</dt>
          <dd data-k="st">Mapping terrain</dd>
        </div>
      </dl>
    </div>
  );
}

function start(
  THREE: Three,
  wrap: HTMLDivElement,
  canvas: HTMLCanvasElement,
  labels: (HTMLDivElement | null)[],
  telemetry: HTMLDListElement | null,
) {
  let renderer: import('three').WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return () => {};
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.innerWidth < 760;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);

  /* ── Terrain: contour-line shader over an analytic height field ── */
  const seg = small ? 110 : 190;
  const tGeo = new THREE.PlaneGeometry(90, 90, seg, seg);
  tGeo.rotateX(-Math.PI / 2);
  const pos = tGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i)));
  const tMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uRover: { value: new THREE.Vector2() },
      uPulse: { value: 0 },
      uInk: { value: new THREE.Color(INK) },
      uBone: { value: new THREE.Color(BONE) },
      uAqua: { value: new THREE.Color(AQUA) },
    },
    vertexShader: /* glsl */ `
      varying float vH; varying vec2 vP;
      void main(){ vH = position.y; vP = position.xz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      varying float vH; varying vec2 vP;
      uniform vec2 uRover; uniform float uPulse; uniform vec3 uInk, uBone, uAqua;
      float band(float v){ return 1.0 - min(abs(fract(v - 0.5) - 0.5) / fwidth(v), 1.0); }
      void main(){
        float minor = band(vH * 2.6);
        float major = band(vH * 0.52);
        vec2 g = abs(fract(vP / 5.0 - 0.5) - 0.5) / fwidth(vP / 5.0);
        float grid = 1.0 - min(min(g.x, g.y), 1.0);
        float d = distance(vP, uRover);
        float scan = smoothstep(10.0, 0.0, d);
        float ping = smoothstep(0.5, 0.0, abs(d - uPulse)) * smoothstep(16.0, 2.0, uPulse);
        float a = minor * (0.24 + 0.6 * scan) + major * 0.6 + grid * 0.07 + ping * 0.6;
        a = clamp(a, 0.0, 1.0);
        vec3 line = mix(uBone, uAqua, clamp(scan * 0.9 + ping, 0.0, 1.0));
        float fade = smoothstep(40.0, 13.0, length(vP));
        gl_FragColor = vec4(mix(uInk, line, a), fade * (0.62 + 0.38 * a));
      }`,
  });
  const terrain = new THREE.Mesh(tGeo, tMat);
  terrain.renderOrder = 1;
  scene.add(terrain);

  /* ── Subsurface moisture field (particles below the surface) ── */
  const n = small ? 900 : 2200;
  const pPos = new Float32Array(n * 3);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < n; i++) {
    const x = (rnd() - 0.5) * 56;
    const z = (rnd() - 0.5) * 40;
    pPos[i * 3] = x;
    pPos[i * 3 + 1] = height(x, z) - 0.6 - rnd() * rnd() * 5.5;
    pPos[i * 3 + 2] = z;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: AQUA, size: 0.11, transparent: true, opacity: 0.7, depthWrite: false }),
  );
  particles.renderOrder = 0;
  scene.add(particles);

  /* ── Helpers: everything is drawn as ink-filled solids with bone edges ── */
  const disposables: { dispose: () => void }[] = [tGeo, tMat, pGeo, particles.material as import('three').Material];
  const edged = (geo: import('three').BufferGeometry, line = BONE, fill = INK) => {
    const g = new THREE.Group();
    const fm = new THREE.MeshBasicMaterial({ color: fill });
    const eg = new THREE.EdgesGeometry(geo, 20);
    const lm = new THREE.LineBasicMaterial({ color: line });
    g.add(new THREE.Mesh(geo, fm), new THREE.LineSegments(eg, lm));
    disposables.push(geo, fm, eg, lm);
    return g;
  };

  /* ── Rover ── */
  const rover = new THREE.Group();
  const body = edged(new THREE.BoxGeometry(1.0, 0.36, 1.7));
  body.position.y = 0.58;
  const deck = edged(new THREE.BoxGeometry(0.7, 0.16, 0.9));
  deck.position.set(0, 0.84, -0.2);
  const mast = edged(new THREE.CylinderGeometry(0.035, 0.035, 0.75, 6));
  mast.position.set(0, 1.25, 0.45);
  const head = edged(new THREE.BoxGeometry(0.34, 0.2, 0.26), TERRA);
  head.position.set(0, 1.68, 0.45);
  rover.add(body, deck, mast, head);
  for (const x of [-0.62, 0.62])
    for (const z of [-0.62, 0, 0.62]) {
      const w = edged(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 14));
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.3, z);
      rover.add(w);
    }
  const fanGeo = new THREE.CircleGeometry(7, 24, Math.PI / 2 - 0.42, 0.84);
  fanGeo.rotateX(-Math.PI / 2);
  const fanMat = new THREE.MeshBasicMaterial({
    color: AQUA,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const fan = new THREE.Mesh(fanGeo, fanMat);
  fan.rotation.y = Math.PI; // CircleGeometry sweeps toward -z after the flip; face forward (+z)
  fan.position.set(0, 1.68, 0.45);
  disposables.push(fanGeo, fanMat);
  rover.add(fan);
  rover.scale.setScalar(1.35);
  rover.renderOrder = 3;
  scene.add(rover);

  /* ── Trail ── */
  const TRAIL = 260;
  const trailPos = new Float32Array(TRAIL * 3);
  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPos, 3));
  trailGeo.setDrawRange(0, 0);
  const trailMat = new THREE.LineBasicMaterial({ color: TERRA, transparent: true, opacity: 0.95 });
  const trail = new THREE.Line(trailGeo, trailMat);
  trail.frustumCulled = false;
  trail.renderOrder = 2;
  disposables.push(trailGeo, trailMat);
  scene.add(trail);
  let trailCount = 0;

  /* ── Monitoring points (stakes) ── */
  const stakes = POINTS.map((t) => {
    const p = pathAt(t);
    const g = new THREE.Group();
    g.position.set(p.x, p.y, p.z);
    const lg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 1.1, 0), new THREE.Vector3(0, -3.4, 0)]);
    const lm = new THREE.LineBasicMaterial({ color: BONE, transparent: true, opacity: 0.75 });
    const line = new THREE.Line(lg, lm);
    const cap = edged(new THREE.BoxGeometry(0.34, 0.46, 0.34), TERRA);
    cap.position.y = 1.3;
    const sg = new THREE.SphereGeometry(0.13, 12, 8);
    const sm = new THREE.MeshBasicMaterial({ color: AQUA });
    const s1 = new THREE.Mesh(sg, sm);
    s1.position.y = -1.5;
    const s2 = new THREE.Mesh(sg, sm);
    s2.position.y = -3.0;
    const rg = new THREE.RingGeometry(0.92, 1.0, 56);
    rg.rotateX(-Math.PI / 2);
    const rm = new THREE.MeshBasicMaterial({ color: AQUA, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
    const ring = new THREE.Mesh(rg, rm);
    ring.position.y = 0.06;
    g.add(line, cap, s1, s2, ring);
    g.visible = false;
    g.renderOrder = 2;
    disposables.push(lg, lm, sg, sm, rg, rm);
    scene.add(g);
    return { g, ring, rm, baseY: p.y, born: -1, phase: t * 9 };
  });

  /* ── Sizing ── */
  const resize = () => {
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.9 ? 54 : 38;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(() => {
    resize();
    if (reduced) frame(0);
  });
  ro.observe(wrap);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    pointer.tx = e.clientX / window.innerWidth - 0.5;
    pointer.ty = e.clientY / window.innerHeight - 0.5;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  const v = new THREE.Vector3();
  const fields: Record<string, HTMLElement | null> = {};
  for (const k of ['pos', 'hdg', 'pts', 'st']) fields[k] = telemetry?.querySelector(`[data-k="${k}"]`) ?? null;

  const t0 = performance.now();
  let raf = 0;
  let visible = true;
  let tick = 0;

  function frame(now: number) {
    const time = reduced ? LAP_SECONDS * 0.93 : (now - t0) / 1000;
    const laps = time / LAP_SECONDS;
    const t = laps % 1;
    const p = pathAt(t);
    const q = pathAt(t + 0.004);
    const heading = Math.atan2(q.x - p.x, q.z - p.z);
    rover.position.set(p.x, p.y, p.z);
    rover.rotation.y = heading;
    fan.rotation.y = Math.PI + Math.sin(time * 1.7) * 0.7;
    tMat.uniforms.uRover.value.set(p.x, p.z);
    tMat.uniforms.uPulse.value = (time * 5) % 18;

    // trail
    const last = trailCount ? trailCount - 1 : 0;
    const moved =
      !trailCount || Math.hypot(trailPos[last * 3] - p.x, trailPos[last * 3 + 2] - p.z) > 0.22;
    if (moved) {
      if (trailCount === TRAIL) trailPos.copyWithin(0, 3);
      else trailCount++;
      const i = (trailCount - 1) * 3;
      trailPos[i] = p.x;
      trailPos[i + 1] = p.y + 0.08;
      trailPos[i + 2] = p.z;
      trailGeo.attributes.position.needsUpdate = true;
      trailGeo.setDrawRange(0, trailCount);
    }

    // camera
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    const scroll = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    const portrait = camera.aspect < 0.9;
    const a = 0.32 + Math.sin(time * 0.06) * 0.16 + pointer.x * 0.12;
    const R = portrait ? 44 : 33;
    camera.position.set(Math.sin(a) * R, 10.5 - scroll * 7.5 - pointer.y * 1.5, Math.cos(a) * R);
    camera.lookAt(portrait ? 0 : -3, portrait ? -9 : -8.5 + scroll * 6, 0);

    // points + labels
    let flagged = 0;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    stakes.forEach((s, i) => {
      if (s.born < 0 && (reduced || laps >= POINTS[i])) s.born = time;
      const el = labels[i];
      if (s.born < 0) return;
      flagged++;
      const age = reduced ? 9 : time - s.born;
      const k = Math.min(1, age / 0.9);
      const ease = 1 - Math.pow(1 - k, 3);
      s.g.visible = true;
      s.g.position.y = s.baseY + (1 - ease) * 3.5;
      const pulse = reduced ? 0.5 : (time * 0.45 + s.phase) % 1;
      s.ring.scale.setScalar(1 + pulse * 3.2);
      s.rm.opacity = (1 - pulse) * 0.7;
      if (el) {
        v.set(s.g.position.x, s.g.position.y + 1.9, s.g.position.z).project(camera);
        el.style.transform = `translate3d(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px, 0)`;
        el.classList.toggle('on', k > 0.6 && v.z < 1);
      }
    });

    if (tick++ % 6 === 0) {
      if (fields.pos)
        fields.pos.textContent = `E ${(420 + p.x * 12).toFixed(1).padStart(6, '0')} · N ${(260 + p.z * 12).toFixed(1).padStart(6, '0')}`;
      if (fields.hdg)
        fields.hdg.textContent = `${String(Math.round(((heading * 180) / Math.PI + 360) % 360)).padStart(3, '0')}°`;
      if (fields.pts) fields.pts.textContent = `${flagged} / ${POINTS.length}`;
      if (fields.st) fields.st.textContent = flagged < POINTS.length ? 'Mapping terrain' : 'Monitoring grid defined';
    }

    renderer.render(scene, camera);
    if (!reduced && visible) raf = requestAnimationFrame(frame);
  }

  const io = new IntersectionObserver(([e]) => {
    const was = visible;
    visible = e.isIntersecting;
    if (visible && !was && !reduced) raf = requestAnimationFrame(frame);
  });
  io.observe(wrap);
  raf = requestAnimationFrame(frame);
  wrap.classList.add('is-live');

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    window.removeEventListener('pointermove', onPointer);
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
  };
}
