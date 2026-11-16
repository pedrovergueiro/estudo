'use client';

import { useEffect, useRef, useState } from 'react';
import { createStage, damp, lerp, loadGLB, partName, ramp, texturize, trackProgress, type Three } from './kit';

/* Facts below are read from the part names inside the field-base design model. */
const PHASES = [
  { k: 'Field base', t: 'Sun in.', e: 'Autonomy out.', f: ['Two 550 Wp panels', 'Charging dock', 'Design model'] },
  { k: 'Docking', t: 'It parks itself', e: 'and charges on copper.', f: ['Funnel guides', 'Spring-loaded copper contacts', 'Wheel stops'] },
  { k: 'Power', t: 'A solar plant', e: 'the size of a cabinet.', f: ['MPPT charge controller', 'Surge protection', 'LoRa telemetry of the base'] },
  { k: 'Grounding', t: 'Even its safety runs', e: 'beneath the surface.', f: ['Three 2.4 m copper-clad rods', 'Bare copper ring', 'Compacted gravel pad'] },
];

/* camera path in metres, model coordinates (rover at the origin, panels toward +x) */
const KEYS: { at: number; pos: [number, number, number]; look: [number, number, number] }[] = [
  { at: 0.0, pos: [-5.6, 3.3, 6.2], look: [1.0, 0.5, 0] },
  { at: 0.22, pos: [-3.4, 1.7, 3.6], look: [0.6, 0.55, 0] },
  { at: 0.4, pos: [-1.5, 0.75, 1.5], look: [0.25, 0.3, 0] },
  { at: 0.5, pos: [-1.3, 0.7, 1.35], look: [0.3, 0.3, 0] },
  { at: 0.64, pos: [1.75, 1.3, 0.75], look: [0.75, 1.08, 0] },
  { at: 0.74, pos: [1.7, 1.25, 0.6], look: [0.75, 1.08, 0] },
  { at: 0.9, pos: [-2.2, 0.1, 5.4], look: [1.2, -0.9, 0] },
  { at: 1.0, pos: [-3.6, -0.9, 6.4], look: [1.4, -1.2, 0] },
];
const CUTS = [0.3, 0.56, 0.78];

/**
 * Scroll-driven tour of the field charging base: establishing shot, the rover
 * on the dock, the controller cabinet, then the soil turns translucent to
 * show the grounding system underneath.
 */
export default function BaseFilm() {
  const track = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState(0);

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
          .then((THREE) => start(THREE, el, canvas.current!, setPhase))
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
  return (
    <div className="y-rise y-base" ref={track}>
      <div className="y-rise__stage">
        <canvas ref={canvas} aria-hidden="true" />
        <div className="y-rise__title" key={phase}>
          <span>
            0{phase + 1} / 0{PHASES.length} · {ph.k}
          </span>
          <h3>
            {ph.t} <em>{ph.e}</em>
          </h3>
          <ul className="y-base__facts">
            {ph.f.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <small className="y-rise__note">Field charging base · design model, in development</small>
      </div>
    </div>
  );
}

async function start(THREE: Three, track: HTMLDivElement, canvas: HTMLCanvasElement, setPhase: (n: number) => void) {
  const stage = track.firstElementChild as HTMLElement;
  const small = window.innerWidth < 760;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gl = await createStage(THREE, canvas, small, { bg: 0.16, blur: 0.5, rot: 2.4, env: 0.9, exposure: 0.95, aperture: 0.0006 });
  const { scene, camera } = gl;
  const model = await loadGLB(THREE, 'base-campo.glb');
  if (!model) throw new Error('field base model unavailable');
  await texturize(THREE, model);
  scene.add(model);

  // parts that fade: the cabinet door (to show the inside) and the ground layers (to show the grounding)
  const door: import('three').Material[] = [];
  const earth: import('three').Material[] = [];
  model.traverse((o) => {
    const m = o as import('three').Mesh;
    if (!m.isMesh) return;
    const list = /^(Porta da caixa|Letreiro da porta|Adesivo de perigo)/.test(partName(o))
      ? door
      : /^(Solo da plantação|Brita|Pó de pedra|Manta|Dormente)/.test(partName(o))
        ? earth
        : null;
    if (!list) return;
    const mat = (m.material as import('three').Material).clone();
    mat.transparent = true;
    m.material = mat;
    list.push(mat);
  });

  // aim the cabinet shot at the door, wherever the model puts it
  const doorBox = new THREE.Box3();
  const bodyBox = new THREE.Box3();
  model.traverse((o) => {
    if (!(o as import('three').Mesh).isMesh) return;
    if (/^Porta da caixa/.test(partName(o))) doorBox.expandByObject(o);
    if (/^Chapa de montagem/.test(partName(o))) bodyBox.expandByObject(o); // back plate, opposite the door
  });
  if (!doorBox.isEmpty() && !bodyBox.isEmpty()) {
    const dc = doorBox.getCenter(new THREE.Vector3());
    const out = dc.clone().sub(bodyBox.getCenter(new THREE.Vector3())).setY(0);
    if (Math.abs(out.x) > Math.abs(out.z)) out.set(Math.sign(out.x), 0, 0);
    else out.set(0, 0, Math.sign(out.z));
    const sideways = new THREE.Vector3(-out.z, 0, out.x);
    for (const [i, d, s] of [[4, 1.25, 0.4], [5, 1.05, 0.25]] as const) {
      const c = dc.clone().addScaledVector(out, d).addScaledVector(sideways, s);
      KEYS[i].pos = [c.x, c.y + 0.12, c.z];
      KEYS[i].look = [dc.x, dc.y, dc.z];
    }
  }

  const key = new THREE.DirectionalLight(0xffe2c0, 3.0);
  key.position.set(-4, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(small ? 1024 : 2048);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.camera.far = 30;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.target.position.set(1, 0, 0);
  scene.add(key, key.target);

  const resize = () => {
    gl.setSize(stage.clientWidth, stage.clientHeight);
    camera.fov = camera.aspect < 0.9 ? 50 : 32;
    camera.near = 0.05;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  const pos = new THREE.Vector3(...KEYS[0].pos);
  const look = new THREE.Vector3(...KEYS[0].look);
  const gp = new THREE.Vector3();
  const gk = new THREE.Vector3();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  let p = trackProgress(track);
  let raf = 0;
  let visible = false;
  let cur = -1;
  let prev = performance.now();

  const frame = (now: number) => {
    raf = 0;
    const dt = (now - prev) / 1000;
    prev = now;
    const target = trackProgress(track);
    p = reduced ? target : lerp(p, target, damp(6, dt));

    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++;
    const k = ramp(KEYS[i].at, KEYS[i + 1].at, p);
    gp.lerpVectors(a.set(...KEYS[i].pos), b.set(...KEYS[i + 1].pos), k);
    gk.lerpVectors(a.set(...KEYS[i].look), b.set(...KEYS[i + 1].look), k);
    if (camera.aspect < 0.9) gp.sub(gk).multiplyScalar(1.45).add(gk); // step back on portrait screens
    const ease = reduced ? 1 : damp(4, dt);
    pos.lerp(gp, ease);
    look.lerp(gk, ease);
    camera.position.copy(pos);
    camera.lookAt(look);

    const open = ramp(0.52, 0.6, p) * (1 - ramp(0.76, 0.82, p));
    for (const m of door) {
      m.opacity = 1 - open;
      m.depthWrite = open < 0.5;
    }
    const xray = ramp(0.8, 0.92, p);
    for (const m of earth) {
      m.opacity = 1 - xray * 0.86;
      m.depthWrite = xray < 0.3;
    }

    const ph = p < CUTS[0] ? 0 : p < CUTS[1] ? 1 : p < CUTS[2] ? 2 : 3;
    if (ph !== cur) setPhase((cur = ph));
    canvas.style.opacity = String(ramp(0, 0.03, p));
    gl.render(pos.distanceTo(look));
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
    [...door, ...earth].forEach((m) => m.dispose());
    gl.dispose();
  };
}
