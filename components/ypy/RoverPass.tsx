'use client';

import { useEffect, useRef } from 'react';
import { bell, buildRover, clamp, damp, createStage, disposeTree, fbm, lerp, loadGLB, ramp, soilGround, splitRover, texturize, trackProgress, type Three } from './kit';

/**
 * Scroll-driven transition between the hero and "The problem": the rover
 * drives across the foreground, then the camera sinks into the soil.
 */
export default function RoverPass() {
  const track = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

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
          .then((THREE) => start(THREE, el, canvas.current!))
          .then((fn) => {
            if (disposed) fn();
            else cleanup = fn;
          })
          .catch(() => el.classList.add('is-off'));
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
  }, []);

  return (
    <div className="y-pass" ref={track}>
      <div className="y-pass__stage">
        <div className="y-pass__sky" />
        <canvas ref={canvas} aria-hidden="true" />
        <p className="y-pass__cap y-pass__cap--a">
          <span>01 → 02</span>
          On the surface, <em>a machine reads the land.</em>
        </p>
        <p className="y-pass__cap y-pass__cap--b">
          <span>Going under</span>
          Below it, <em>the land keeps its own record.</em>
        </p>
        <div className="y-pass__ink" />
        <small className="y-pass__note">YPY Rover · design model · real sky and soil textures</small>
      </div>
    </div>
  );
}

const height = (x: number, z: number) => {
  // flat lane at z = 0, rolling ground behind it, gently falling away toward the camera
  const lane = ramp(0.9, 3.5, Math.abs(z));
  const back = z < 0 ? 1 : 0.3;
  return (fbm(x * 0.22 + 4, z * 0.22 + 9, 4) - 0.5) * (0.12 + 1.5 * lane * back) + (z < 0 ? lane * 0.3 : -lane * 0.22);
};

async function start(THREE: Three, track: HTMLDivElement, canvas: HTMLCanvasElement) {
  const stage = track.firstElementChild as HTMLElement;
  const sky = stage.querySelector<HTMLElement>('.y-pass__sky')!;
  const ink = stage.querySelector<HTMLElement>('.y-pass__ink')!;
  const capA = stage.querySelector<HTMLElement>('.y-pass__cap--a')!;
  const capB = stage.querySelector<HTMLElement>('.y-pass__cap--b')!;
  const note = stage.querySelector<HTMLElement>('.y-pass__note')!;
  const small = window.innerWidth < 760;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stageGL = await createStage(THREE, canvas, small, { bg: 0.4, blur: 0.04, rot: 2.2, env: 0.85, exposure: 0.8, aperture: 0.0004 });
  const { scene, camera } = stageGL;
  scene.fog = new THREE.Fog(0x4b3a31, 12, 42);

  const ground = await soilGround(THREE, { w: 70, d: 34, seg: small ? 150 : 240, repeat: 14, height: (x, z) => height(x, z - 6) });
  ground.mesh.position.z = -6;
  // the mesh is pushed back so most of it lies behind the lane (world z = 0)
  const laneY = (x: number) => height(x, 0);
  scene.add(ground.mesh);

  // clods scattered along the lane edges
  const clodGeo = new THREE.IcosahedronGeometry(1, 0);
  const clodMat = new THREE.MeshStandardMaterial({ color: 0x6a4838, roughness: 1, flatShading: true });
  const clods = new THREE.InstancedMesh(clodGeo, clodMat, 260);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v3 = new THREE.Vector3();
  const s3 = new THREE.Vector3();
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  for (let i = 0; i < 260; i++) {
    const x = (rnd() - 0.5) * 44;
    const z = (rnd() - 0.5) * 9 + (rnd() > 0.5 ? 1.6 : -1.6);
    const s = 0.03 + rnd() * rnd() * 0.16;
    e.set(rnd() * 6, rnd() * 6, rnd() * 6);
    m4.compose(v3.set(x, height(x, z) + s * 0.3, z), q.setFromEuler(e), s3.set(s, s * 0.7, s));
    clods.setMatrixAt(i, m4);
  }
  clods.castShadow = clods.receiveShadow = true;
  scene.add(clods);

  // the real rover, taken out of the charging-base model; falls back to the stand-in
  const baseModel = await loadGLB(THREE, 'base-turbo.glb');
  let rover: { group: import('three').Group; wheels: import('three').Group[]; lidar: import('three').Object3D; radius: number };
  if (baseModel) {
    await texturize(THREE, baseModel);
    const part = splitRover(THREE, baseModel);
    part.group.scale.setScalar(2.9);
    const holder = new THREE.Group();
    holder.add(part.group);
    rover = { group: holder, wheels: part.wheels, lidar: new THREE.Group(), radius: 0.0865 * 2.9 };
  } else {
    const b = await buildRover(THREE);
    rover = { ...b, radius: 0.38 };
  }
  scene.add(rover.group);

  // low sun behind the rover, cool fill from the camera side
  const sun = new THREE.DirectionalLight(0xffc592, 3.4);
  sun.position.set(-9, 5.5, -7);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(small ? 1024 : 2048);
  sun.shadow.camera.left = -7;
  sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 5;
  sun.shadow.camera.bottom = -5;
  sun.shadow.camera.far = 40;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0x8fd8ff, 0.7);
  fill.position.set(4, 3, 8);
  scene.add(fill, new THREE.HemisphereLight(0xffe2c4, 0x1a0d08, 0.35));

  // dust kicked up behind the wheels: additive points, scrubbed by rover position
  const N = small ? 150 : 320;
  const dPos = new Float32Array(N * 3);
  const dCol = new Float32Array(N * 3);
  const dSeed = Array.from({ length: N }, () => ({ x: (rnd() - 0.5) * 30, z: (rnd() > 0.5 ? 0.74 : -0.74) + (rnd() - 0.5) * 0.3, r: rnd(), k: rnd() }));
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dGeo.setAttribute('color', new THREE.BufferAttribute(dCol, 3));
  const dc = document.createElement('canvas');
  dc.width = dc.height = 64;
  const dx = dc.getContext('2d')!;
  const rg = dx.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0, 'rgba(255,255,255,1)');
  rg.addColorStop(1, 'rgba(255,255,255,0)');
  dx.fillStyle = rg;
  dx.fillRect(0, 0, 64, 64);
  const dTex = new THREE.CanvasTexture(dc);
  const dMat = new THREE.PointsMaterial({
    size: 0.5,
    map: dTex,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const dust = new THREE.Points(dGeo, dMat);
  dust.frustumCulled = false;
  scene.add(dust);

  const resize = () => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    stageGL.setSize(w, h);
    camera.fov = w / h < 0.9 ? 52 : 32;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(stage);

  let p = trackProgress(track);
  let raf = 0;
  let visible = false;
  let last = -1;
  let prev = performance.now();
  const look = new THREE.Vector3();

  const frame = (now: number) => {
    raf = 0;
    const target = trackProgress(track);
    const dt = (now - prev) / 1000;
    prev = now;
    p = reduced ? target : lerp(p, target, damp(7, dt));
    const moving = Math.abs(target - p) > 0.0004;
    if (moving || last < 0 || !reduced) {
      const time = now / 1000;
      const drive = clamp((p - 0.06) / 0.72);
      const x = lerp(-11.5, 11.5, drive);
      const y = laneY(x);
      rover.group.position.set(x, y - 0.03, 0);
      rover.group.rotation.z = Math.atan2(laneY(x + 0.9) - laneY(x - 0.9), 1.8);
      rover.group.rotation.x = Math.sin(x * 2.1) * 0.012;
      rover.wheels.forEach((w) => (w.rotation.z = -x / rover.radius));
      rover.lidar.rotation.y = x * 3 + (reduced ? 0 : time * 6);
      sun.target.position.set(x, 0, 0);
      sun.position.set(x - 9, 5.5, -7);

      for (let i = 0; i < N; i++) {
        const d = dSeed[i];
        const age = (x - 0.9 - d.x) / 2.6; // in rover-lengths behind the rear wheels
        const on = age > 0 && age < 1;
        const a = on ? Math.sin(age * Math.PI) * (0.04 + d.k * 0.06) : 0;
        dPos[i * 3] = d.x - age * 0.5;
        dPos[i * 3 + 1] = laneY(d.x) + 0.1 + age * (0.4 + d.r * 0.9);
        dPos[i * 3 + 2] = d.z + (d.r - 0.5) * age * 1.2;
        dCol[i * 3] = a;
        dCol[i * 3 + 1] = a * 0.62;
        dCol[i * 3 + 2] = a * 0.4;
      }
      dGeo.attributes.position.needsUpdate = true;
      dGeo.attributes.color.needsUpdate = true;

      // camera: track the rover loosely, then sink into the ground
      const dive = ramp(0.76, 1, p);
      const portrait = camera.aspect < 0.9;
      const dist = portrait ? 8.2 : 6.6;
      camera.position.set(x * 0.3 + 1.2, lerp(1.15, 0.16, dive), lerp(dist, 1.6, dive));
      look.set(x * 0.52, lerp(0.85, -1.6, dive), lerp(0, -1, dive));
      camera.lookAt(look);

      const show = ramp(0.0, 0.1, p);
      canvas.style.opacity = String(show);
      sky.style.opacity = String(ramp(0.02, 0.2, p));
      note.style.opacity = String(show * (1 - dive));
      ink.style.opacity = String(ramp(0.84, 0.97, p));
      capA.style.opacity = String(bell(0.14, 0.46, p));
      capA.style.transform = `translateY(${(1 - ramp(0.14, 0.22, p)) * 24}px)`;
      capB.style.opacity = String(bell(0.5, 0.86, p));
      capB.style.transform = `translateY(${(1 - ramp(0.5, 0.58, p)) * 24}px)`;
      stageGL.render(camera.position.distanceTo(rover.group.position));
      last = p;
    }
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
    disposeTree(rover.group);
    ground.dispose();
    [clodGeo, clodMat, dGeo, dMat, dTex].forEach((d) => d.dispose());
    stageGL.dispose();
  };
}
