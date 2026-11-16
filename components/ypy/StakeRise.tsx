'use client';

import { useEffect, useRef, useState } from 'react';
import { buildPlant, buildStake, clamp, createStage, damp, disposeTree, fbm, lerp, ramp, soilGround, trackProgress, type Three } from './kit';
import { PARTS } from './StakeViewer';

const PHASES = [
  { k: 'Emergence', t: 'Out of the ground,', e: 'into view.' },
  { k: 'Anatomy', t: 'Every part', e: 'has a job.' },
  { k: 'Placement', t: 'Back to where', e: 'it listens.' },
  { k: 'Purpose', t: 'So that this', e: 'never goes thirsty.' },
];

const PART_FROM = 0.2;
const PART_TO = 0.7;

/**
 * Scroll-driven film of the Stake M1 concept: it rises out of the soil, each
 * part is called out, it settles back to working depth and a seedling grows.
 */
export default function StakeRise() {
  const track = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pin = useRef<HTMLSpanElement>(null);
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
          .then((THREE) => start(THREE, el, canvas.current!, pin.current!, setPhase, setPart))
          .then((fn) => {
            if (disposed) fn();
            else cleanup = fn;
          })
          .catch(() => el.classList.add('is-off'));
      },
      { rootMargin: '500px 0px' },
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
            0{phase + 1} / 04 · {ph.k}
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

        <ol className="y-rise__ticks" aria-hidden="true">
          {PARTS.map((p, i) => (
            <li key={p.id} className={i === part ? 'on' : undefined} />
          ))}
        </ol>
        <small className="y-rise__note">Stake M1 · concept visualisation · procedural 3D model, not a product photograph</small>
      </div>
    </div>
  );
}

const height = (x: number, z: number) => {
  const r = Math.hypot(x, z);
  return (fbm(x * 0.3 + 2, z * 0.3 + 7, 4) - 0.5) * 0.9 * ramp(1.2, 6, r) - ramp(8, 20, r) * 0.6;
};

async function start(
  THREE: Three,
  track: HTMLDivElement,
  canvas: HTMLCanvasElement,
  pin: HTMLSpanElement,
  setPhase: (n: number) => void,
  setPart: (n: number) => void,
) {
  const stage = track.firstElementChild as HTMLElement;
  const small = window.innerWidth < 760;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const { renderer, scene, camera, disposeEnv } = await createStage(THREE, canvas, small);
  scene.fog = new THREE.Fog(0x0c0b09, 14, 34);
  scene.environmentIntensity = 0.6;

  const ground = soilGround(THREE, { w: 44, d: 44, seg: small ? 120 : 200, repeat: 12, height });
  scene.add(ground.mesh);

  const stake = await buildStake(THREE);
  scene.add(stake.group);
  const plant = buildPlant(THREE);
  plant.group.position.set(1.0, 0, 0.3);
  plant.group.scale.setScalar(1.05);
  scene.add(plant.group);

  // loosened earth around the hole + crumbs that fall as the stake comes out
  let seed = 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const clodGeo = new THREE.IcosahedronGeometry(1, 0);
  const clodMat = new THREE.MeshStandardMaterial({ color: 0x3a1a11, roughness: 1 });
  const MOUND = 90;
  const CRUMBS = small ? 50 : 110;
  const clods = new THREE.InstancedMesh(clodGeo, clodMat, MOUND + CRUMBS);
  clods.castShadow = clods.receiveShadow = true;
  scene.add(clods);
  const mound = Array.from({ length: MOUND }, () => {
    const a = rnd() * Math.PI * 2;
    const r = 0.16 + rnd() * rnd() * 0.9;
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.025 + rnd() * 0.07 * (1.1 - r), at: rnd() * 0.6, rx: rnd() * 6, ry: rnd() * 6 };
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

  const key = new THREE.DirectionalLight(0xffe0c2, 2.9);
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
  const rim = new THREE.DirectionalLight(0xbfe9e2, 0.55);
  rim.position.set(-6, 4, -7);
  scene.add(key, rim, new THREE.HemisphereLight(0xfff0de, 0x1a0d08, 0.3));

  const resize = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  let p = trackProgress(track);
  let raf = 0;
  let visible = false;
  let curPhase = -1;
  let curPart = -2;
  const cam = { ang: -0.6, dist: 9, ty: 1, tx: 0, h: 2 };
  const anchor = new THREE.Vector3();
  let prev = performance.now();

  const frame = (now: number) => {
    raf = 0;
    const time = now / 1000;
    const target = trackProgress(track);
    const dt = (now - prev) / 1000;
    prev = now;
    p = reduced ? target : lerp(p, target, damp(6, dt));
    const portrait = camera.aspect < 0.9;

    const rise = ramp(0.02, 0.18, p);
    const sink = ramp(0.72, 0.83, p);
    const growth = ramp(0.84, 0.97, p);
    const y = lerp(lerp(-6.6, 5.0, rise), 0, sink);
    stake.group.position.y = y;
    stake.group.rotation.y = lerp(0, 0.5, rise);

    const idx = p >= PART_FROM && p < PART_TO ? Math.min(PARTS.length - 1, Math.floor(((p - PART_FROM) / (PART_TO - PART_FROM)) * PARTS.length)) : -1;
    const inside = idx >= 1 && idx <= 3;
    stake.housing.opacity = lerp(stake.housing.opacity, inside ? 0.16 : 1, damp(8, dt));
    stake.housing.depthWrite = stake.housing.opacity > 0.9;

    const ph = p < PART_FROM ? 0 : p < PART_TO ? 1 : p < 0.84 ? 2 : 3;
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
      const fy = c.h - 4.9 * age * age * 3;
      const on = age > 0 && fy > 0 && sink < 0.05;
      const r = 0.15 + c.v * age;
      eu.set(c.rx + age * 9, c.a, 0);
      m4.compose(v3.set(Math.cos(c.a) * r, on ? fy : -1, Math.sin(c.a) * r), q.setFromEuler(eu), s3.setScalar(on ? c.s : 0.0001));
      clods.setMatrixAt(MOUND + i, m4);
    }
    clods.instanceMatrix.needsUpdate = true;

    plant.update(growth, time, !reduced);

    // camera goals per phase
    const gAng = -0.75 + p * 1.3;
    let gDist = lerp(8, portrait ? 19 : 13.5, rise);
    let gTy = lerp(0.6, 2.6, rise);
    let gTx = 0;
    let gH = lerp(1.6, 3.4, rise);
    if (idx >= 0) {
      const a = stake.anchors[idx];
      gTy = y + a[1];
      gDist = portrait ? 8.5 : 5.6;
      gH = gTy + 0.7;
      gTx = portrait ? 0 : 0.85; // leave room for the card on the right
    }
    if (p >= PART_TO) {
      const k = ramp(PART_TO, 0.86, p);
      gDist = lerp(portrait ? 15 : 10, portrait ? 8.2 : 5.8, k);
      gTy = lerp(2.2, 0.85, k);
      gTx = lerp(0, 0.5, k);
      gH = lerp(3, 1.3, k);
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
      const a = stake.anchors[idx];
      stake.group.updateMatrixWorld();
      anchor.set(a[0], a[1], a[2]).applyMatrix4(stake.group.matrixWorld).project(camera);
      pin.style.transform = `translate3d(${((anchor.x + 1) / 2) * stage.clientWidth}px, ${((1 - anchor.y) / 2) * stage.clientHeight}px, 0)`;
      pin.style.opacity = '1';
    } else pin.style.opacity = '0';

    canvas.style.opacity = String(clamp(ramp(0, 0.03, p) * (1 - ramp(0.985, 1, p) * 0.0)));
    renderer.render(scene, camera);
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
    disposeTree(stake.group);
    disposeTree(plant.group);
    ground.dispose();
    clodGeo.dispose();
    clodMat.dispose();
    disposeEnv();
    renderer.dispose();
  };
}
