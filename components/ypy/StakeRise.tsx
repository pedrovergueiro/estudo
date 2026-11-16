'use client';

import { useEffect, useRef, useState } from 'react';
import { buildStake, createStage, damp, disposeTree, fbm, fitModel, lerp, loadModel, loadPlant, ramp, soilGround, trackProgress, type Three } from './kit';
import { PARTS } from './StakeViewer';

const PHASES = [
  { k: 'Emergence', t: 'Out of the ground,', e: 'into view.' },
  { k: 'Anatomy', t: 'Every part', e: 'has a job.' },
  { k: 'Placement', t: 'Back to where', e: 'it listens.' },
  { k: 'Response', t: 'When water arrives,', e: 'depth answers in turn.' },
  { k: 'Purpose', t: 'So that this', e: 'never goes thirsty.' },
];

/* scroll timeline (fractions of the track) */
const RISE = [0.02, 0.14];
const PART_FROM = 0.16;
const PART_TO = 0.58;
const SINK = [0.6, 0.69];
const RAIN = [0.7, 0.86];
const GROW = [0.85, 0.97];

/**
 * Scroll-driven film of the Stake M1 concept: it rises out of the soil, each
 * part is called out, it settles to working depth, rain falls and the two
 * depths respond one after the other, and a plant grows beside it.
 */
export default function StakeRise() {
  const track = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pin = useRef<HTMLSpanElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [part, setPart] = useState(-1);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        import('three')
          .then((THREE) => start(THREE, el, canvas.current!, pin.current!, hud.current!, setPhase, setPart))
          .then((fn) => {
            if (disposed) fn();
            else cleanup = fn;
          })
          .catch(() => el.classList.add('is-off'));
      },
      { rootMargin: '700px 0px' },
    );
    io.observe(el);
    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
  }, []);

  const ph = PHASES[phase];
  const active = part >= 0 ? PARTS[part] : null;

  return (
    <div className="y-rise" ref={track}>
      <div className="y-rise__stage">
        <canvas ref={canvas} aria-hidden="true" />
        <span className="y-rise__pin" ref={pin} aria-hidden="true" />

        <div className="y-rise__title" key={phase}>
          <span>
            0{phase + 1} / 0{PHASES.length} · {ph.k}
          </span>
          <h3>
            {ph.t} <em>{ph.e}</em>
          </h3>
        </div>

        <div className={`y-rise__card${active ? ' on' : ''}`} aria-live="polite">
          {active && (
            <div key={active.id}>
              <i>
                {String(part + 1).padStart(2, '0')} / {String(PARTS.length).padStart(2, '0')}
              </i>
              <b>{active.name}</b>
              <span>{active.spec}</span>
              <p>{active.d}</p>
            </div>
          )}
        </div>

        <div className="y-rise__hud" ref={hud}>
          <small>
            <i /> Simulated readings · concept
          </small>
          {(['20 cm', '40 cm'] as const).map((d, i) => (
            <div key={d}>
              <span>{d}</span>
              <u>
                <b data-bar={i} />
              </u>
              <em data-val={i}>—</em>
            </div>
          ))}
          <p>The shallow probe reacts first. The deeper one follows — that delay is how water moves through this soil.</p>
        </div>

        <ol className="y-rise__ticks" aria-hidden="true">
          {PARTS.map((p, i) => (
            <li key={p.id} className={i === part ? 'on' : undefined} />
          ))}
        </ol>
        <small className="y-rise__note">Concept visualisation · stand-in models · plant: Poly Haven / DGG, CC BY 4.0</small>
      </div>
    </div>
  );
}

const height = (x: number, z: number) => {
  const r = Math.hypot(x, z);
  return (fbm(x * 0.3 + 2, z * 0.3 + 7, 4) - 0.5) * 0.9 * ramp(1.6, 6, r) - ramp(8, 20, r) * 0.6;
};

async function start(
  THREE: Three,
  track: HTMLDivElement,
  canvas: HTMLCanvasElement,
  pin: HTMLSpanElement,
  hud: HTMLDivElement,
  setPhase: (n: number) => void,
  setPart: (n: number) => void,
) {
  const stage = track.firstElementChild as HTMLElement;
  const small = window.innerWidth < 760;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gl = await createStage(THREE, canvas, small, { bg: 0.3, blur: 0.12, rot: 2.6, env: 0.9, exposure: 0.85, aperture: 0.0011 });
  const { scene, camera } = gl;
  scene.fog = new THREE.Fog(0x3b2e27, 14, 40);

  const ground = await soilGround(THREE, { w: 44, d: 44, seg: small ? 120 : 200, repeat: 16, height });
  scene.add(ground.mesh);

  // a real stake model listed in public/ypy/models/manifest.json replaces the stand-in
  const built = await buildStake(THREE);
  const real = await loadModel(THREE, 'stake');
  const stakeGroup = new THREE.Group();
  if (real) {
    const fitted = fitModel(THREE, real, 6.7);
    fitted.position.y = -4.8;
    stakeGroup.add(fitted);
    disposeTree(built.group);
  } else stakeGroup.add(built.group);
  scene.add(stakeGroup);

  const plant = await loadPlant(THREE, 2.1);
  plant.group.position.set(1.7, 0, 0.9);
  scene.add(plant.group);

  // loosened earth around the hole + crumbs that fall as the stake comes out
  let seed = 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const clodGeo = new THREE.IcosahedronGeometry(1, 1);
  const clodMat = new THREE.MeshStandardMaterial({ color: 0x6a4838, roughness: 1, flatShading: true });
  const MOUND = 110;
  const CRUMBS = small ? 50 : 110;
  const clods = new THREE.InstancedMesh(clodGeo, clodMat, MOUND + CRUMBS);
  clods.castShadow = clods.receiveShadow = true;
  scene.add(clods);
  const mound = Array.from({ length: MOUND }, () => {
    const a = rnd() * Math.PI * 2;
    const r = 0.16 + rnd() * rnd() * 0.9;
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.02 + rnd() * 0.06 * (1.1 - r), at: rnd() * 0.6, rx: rnd() * 6, ry: rnd() * 6 };
  });
  const crumbs = Array.from({ length: CRUMBS }, () => {
    const a = rnd() * Math.PI * 2;
    return { a, h: 0.3 + rnd() * 4.2, at: 0.08 + rnd() * 0.85, v: 0.1 + rnd() * 0.5, s: 0.012 + rnd() * 0.03, rx: rnd() * 6 };
  });
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const eu = new THREE.Euler();
  const v3 = new THREE.Vector3();
  const s3 = new THREE.Vector3();

  // rain streaks
  const DROPS = small ? 260 : 620;
  const rainSeed = Array.from({ length: DROPS }, () => ({ x: (rnd() - 0.5) * 16, z: (rnd() - 0.5) * 16, o: rnd() * 12, v: 9 + rnd() * 5 }));
  const rainPos = new Float32Array(DROPS * 6);
  const rainGeo = new THREE.BufferGeometry();
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.LineBasicMaterial({ color: 0xdcecf0, transparent: true, opacity: 0, depthWrite: false });
  const rain = new THREE.LineSegments(rainGeo, rainMat);
  rain.frustumCulled = false;
  scene.add(rain);

  const key = new THREE.DirectionalLight(0xffd9b0, 2.6);
  key.position.set(7, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(small ? 1024 : 2048);
  key.shadow.camera.left = -6;
  key.shadow.camera.right = 6;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -3;
  key.shadow.camera.far = 40;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.03;
  scene.add(key);

  const resize = () => {
    gl.setSize(stage.clientWidth, stage.clientHeight);
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  const bars = [0, 1].map((i) => hud.querySelector<HTMLElement>(`[data-bar="${i}"]`)!);
  const vals = [0, 1].map((i) => hud.querySelector<HTMLElement>(`[data-val="${i}"]`)!);

  let p = trackProgress(track);
  let raf = 0;
  let visible = false;
  let curPhase = -1;
  let curPart = -2;
  let prev = performance.now();
  const cam = { ang: -0.6, dist: 9, ty: 1, tx: 0, h: 2 };
  const anchor = new THREE.Vector3();

  const frame = (now: number) => {
    raf = 0;
    const time = now / 1000;
    const dt = (now - prev) / 1000;
    prev = now;
    const target = trackProgress(track);
    p = reduced ? target : lerp(p, target, damp(6, dt));
    const portrait = camera.aspect < 0.9;

    const rise = ramp(RISE[0], RISE[1], p);
    const sink = ramp(SINK[0], SINK[1], p);
    const raining = ramp(RAIN[0], RAIN[0] + 0.03, p) * (1 - ramp(RAIN[1] - 0.03, RAIN[1], p));
    const wet = ramp(RAIN[0] + 0.01, RAIN[0] + 0.09, p);
    const growth = ramp(GROW[0], GROW[1], p);
    const y = lerp(lerp(-6.6, 5.0, rise), 0, sink);
    stakeGroup.position.y = y;
    stakeGroup.rotation.y = lerp(0, 0.5, rise);

    const idx = p >= PART_FROM && p < PART_TO ? Math.min(PARTS.length - 1, Math.floor(((p - PART_FROM) / (PART_TO - PART_FROM)) * PARTS.length)) : -1;
    const inside = idx >= 1 && idx <= 3;
    built.housing.opacity = lerp(built.housing.opacity, inside ? 0.16 : 1, damp(8, dt));
    built.housing.depthWrite = built.housing.opacity > 0.9;

    const ph = p < PART_FROM ? 0 : p < PART_TO ? 1 : p < RAIN[0] ? 2 : p < GROW[0] ? 3 : 4;
    if (ph !== curPhase) setPhase((curPhase = ph));
    if (idx !== curPart) setPart((curPart = idx));

    // earth
    for (let i = 0; i < MOUND; i++) {
      const c = mound[i];
      const k = ramp(c.at * 0.5, c.at * 0.5 + 0.25, rise);
      eu.set(c.rx, c.ry, 0);
      m4.compose(v3.set(c.x, c.s * 0.4 * k, c.z), q.setFromEuler(eu), s3.setScalar(Math.max(0.0001, c.s * k)));
      clods.setMatrixAt(i, m4);
    }
    for (let i = 0; i < CRUMBS; i++) {
      const c = crumbs[i];
      const age = (rise - c.at) * 2.4;
      const fy = c.h - 14.7 * age * age;
      const on = age > 0 && fy > 0 && sink < 0.05;
      const r = 0.15 + c.v * age;
      eu.set(c.rx + age * 9, c.a, 0);
      m4.compose(v3.set(Math.cos(c.a) * r, on ? fy : -1, Math.sin(c.a) * r), q.setFromEuler(eu), s3.setScalar(on ? c.s : 0.0001));
      clods.setMatrixAt(MOUND + i, m4);
    }
    clods.instanceMatrix.needsUpdate = true;

    // rain + wet soil + readings (20 cm responds before 40 cm)
    ground.setWet(wet);
    clodMat.color.setHex(0x6a4838).multiplyScalar(1 - wet * 0.45);
    rainMat.opacity = raining * 0.4;
    rain.visible = raining > 0.01;
    if (rain.visible) {
      const t = reduced ? 0 : time;
      for (let i = 0; i < DROPS; i++) {
        const d = rainSeed[i];
        const yy = 12 - ((d.o + t * d.v) % 12);
        rainPos.set([d.x, yy, d.z, d.x + 0.02, yy + 0.42, d.z], i * 6);
      }
      rainGeo.attributes.position.needsUpdate = true;
    }
    const m20 = lerp(21.0, 33.4, ramp(RAIN[0] + 0.03, RAIN[0] + 0.08, p));
    const m40 = lerp(27.2, 34.1, ramp(RAIN[0] + 0.075, RAIN[0] + 0.14, p));
    [m20, m40].forEach((m, i) => {
      vals[i].textContent = `${m.toFixed(1)}%`;
      bars[i].style.transform = `scaleX(${(m - 15) / 25})`;
    });
    hud.style.opacity = String(ramp(RAIN[0], RAIN[0] + 0.03, p));

    plant.update(growth, time, !reduced);

    // camera goals per phase
    const gAng = -0.75 + p * 1.25;
    let gDist = lerp(8, portrait ? 19 : 13.5, rise);
    let gTy = lerp(0.6, 2.6, rise);
    let gTx = 0;
    let gH = lerp(1.6, 3.4, rise);
    if (idx >= 0) {
      const a = built.anchors[idx];
      gTy = y + a[1];
      gDist = portrait ? 8.5 : 5.6;
      gH = gTy + 0.7;
      gTx = portrait ? 0 : 0.85; // leave room for the card on the right
    }
    if (p >= PART_TO) {
      const k = ramp(PART_TO, RAIN[0], p);
      gDist = lerp(portrait ? 15 : 10, portrait ? 9 : 6.6, k);
      gTy = lerp(2.2, 0.8, k);
      gTx = lerp(0, 0.95, k);
      gH = lerp(3, 1.35, k);
    }
    const ease = reduced ? 1 : damp(3.5, dt);
    cam.ang = lerp(cam.ang, gAng, ease);
    cam.dist = lerp(cam.dist, gDist, ease);
    cam.ty = lerp(cam.ty, gTy, ease);
    cam.tx = lerp(cam.tx, gTx, ease);
    cam.h = lerp(cam.h, gH, ease);
    camera.position.set(cam.tx + Math.sin(cam.ang) * cam.dist, cam.h, Math.cos(cam.ang) * cam.dist);
    camera.lookAt(cam.tx, cam.ty, 0);
    camera.updateMatrixWorld();

    if (idx >= 0) {
      const a = built.anchors[idx];
      stakeGroup.updateMatrixWorld();
      anchor.set(a[0], a[1], a[2]).applyMatrix4(stakeGroup.matrixWorld).project(camera);
      pin.style.transform = `translate3d(${((anchor.x + 1) / 2) * stage.clientWidth}px, ${((1 - anchor.y) / 2) * stage.clientHeight}px, 0)`;
      pin.style.opacity = '1';
    } else pin.style.opacity = '0';

    canvas.style.opacity = String(ramp(0, 0.03, p));
    gl.render(Math.hypot(cam.dist, cam.h - cam.ty));
    if (visible) raf = requestAnimationFrame(frame);
  };

  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(frame);
  });
  io.observe(track);
  track.classList.add('is-live');

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    disposeTree(stakeGroup);
    disposeTree(plant.group);
    ground.dispose();
    [clodGeo, clodMat, rainGeo, rainMat].forEach((d) => d.dispose());
    gl.dispose();
  };
}
