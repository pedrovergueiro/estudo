/**
 * Shared three.js helpers for the cinematic (lit, PBR) scenes.
 * Everything is procedural: no external models, photos or textures.
 */
import type * as T from 'three';

export type Three = typeof import('three');

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Frame-rate independent smoothing factor: fraction to close in `dt` seconds. */
export const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * Math.min(dt, 0.25));
/** 0 below a, 1 above b, smooth in between. */
export const ramp = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
/** 0 → 1 → 0 window with soft edges. */
export const bell = (a: number, b: number, v: number, edge = 0.04) => ramp(a, a + edge, v) * (1 - ramp(b - edge, b, v));

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
/** Value noise that tiles with period `p` (p = 0 → no tiling). */
function vnoise(x: number, y: number, p = 0) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = (n: number) => (p ? ((n % p) + p) % p : n);
  const a = hash(w(xi), w(yi));
  const b = hash(w(xi + 1), w(yi));
  const c = hash(w(xi), w(yi + 1));
  const d = hash(w(xi + 1), w(yi + 1));
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
export function fbm(x: number, y: number, octaves = 4, period = 0) {
  let amp = 0.5;
  let f = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * vnoise(x * f, y * f, period ? period * f : 0);
    norm += amp;
    amp *= 0.5;
    f *= 2;
  }
  return sum / norm;
}

/** Scroll progress (0..1) of a tall track whose sticky child is one viewport high. */
export function trackProgress(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const total = r.height - window.innerHeight;
  return total > 0 ? clamp(-r.top / total) : 0;
}

export type Look = { bg: number; blur: number; rot: number; env: number; exposure: number; aperture: number };

/**
 * Renderer + scene lit by a real HDRI sky (Poly Haven "Spruit Sunrise", CC0),
 * with depth of field on larger screens.
 */
export async function createStage(THREE: Three, canvas: HTMLCanvasElement, small: boolean, look: Look) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 1.75));
  renderer.setClearColor(0x0c0b09, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = look.exposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
  const owned: { dispose: () => void }[] = [];
  try {
    const { HDRLoader } = await import('three/examples/jsm/loaders/HDRLoader.js');
    const hdr = await new HDRLoader().loadAsync('/ypy/spruit_sunrise_1k.hdr');
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdr;
    scene.background = hdr;
    owned.push(hdr);
  } catch {
    const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = env.texture;
    scene.background = new THREE.Color(0x0c0b09);
    pmrem.dispose();
    owned.push(env);
  }
  scene.backgroundBlurriness = look.blur;
  scene.backgroundIntensity = look.bg;
  scene.environmentIntensity = look.env;
  scene.backgroundRotation.y = scene.environmentRotation.y = look.rot;

  // depth of field: skipped on small screens to protect frame rate
  let composer: import('three/examples/jsm/postprocessing/EffectComposer.js').EffectComposer | null = null;
  let bokeh: import('three/examples/jsm/postprocessing/BokehPass.js').BokehPass | null = null;
  if (!small) {
    const [{ EffectComposer }, { RenderPass }, { BokehPass }, { OutputPass }] = await Promise.all([
      import('three/examples/jsm/postprocessing/EffectComposer.js'),
      import('three/examples/jsm/postprocessing/RenderPass.js'),
      import('three/examples/jsm/postprocessing/BokehPass.js'),
      import('three/examples/jsm/postprocessing/OutputPass.js'),
    ]);
    const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, rt);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.addPass(new RenderPass(scene, camera));
    bokeh = new BokehPass(scene, camera, { focus: 6, aperture: look.aperture, maxblur: 0.007 });
    composer.addPass(bokeh);
    composer.addPass(new OutputPass());
    owned.push(rt);
  }

  return {
    renderer,
    scene,
    camera,
    setSize(w: number, h: number) {
      renderer.setSize(w, h, false);
      composer?.setSize(w, h);
      camera.aspect = w / h;
    },
    render(focus: number) {
      if (composer && bokeh) {
        (bokeh.uniforms as Record<string, { value: number }>).focus.value = focus;
        composer.render();
      } else renderer.render(scene, camera);
    },
    dispose() {
      owned.forEach((o) => o.dispose());
      composer?.dispose();
      renderer.dispose();
    },
  };
}

/** Ground from a real photographed dirt texture (Poly Haven "Rocky Trail", CC0), tinted toward red soil. */
export async function soilGround(
  THREE: Three,
  opts: { w: number; d: number; seg: number; repeat: number; height: (x: number, z: number) => number },
) {
  const geo = new THREE.PlaneGeometry(opts.w, opts.d, opts.seg, Math.round((opts.seg * opts.d) / opts.w));
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setY(i, opts.height(pos.getX(i), pos.getZ(i)));
  geo.computeVertexNormals();
  const map = await new THREE.TextureLoader().loadAsync('/ypy/rocky_trail_diff.jpg');
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 8;
  map.repeat.set(opts.repeat, (opts.repeat * opts.d) / opts.w);
  const dry = new THREE.Color(0xc08a6c);
  const wet = new THREE.Color(0x3a241b);
  const mat = new THREE.MeshStandardMaterial({ map, bumpMap: map, bumpScale: 4, roughness: 0.95, metalness: 0, color: dry.clone(), envMapIntensity: 0.35 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return {
    mesh,
    /** 0 = dry, 1 = soaked: darker and glossier. */
    setWet(k: number) {
      mat.color.copy(dry).lerp(wet, k);
      mat.roughness = lerp(0.95, 0.86, k);
    },
    dispose: () => [geo, mat, map].forEach((d) => d.dispose()),
  };
}

/**
 * Optional real models. Drop a .glb in public/ypy/models and name it in
 * manifest.json ({ "rover": "rover.glb", "stake": "stake.glb", "plant": "plant.glb" })
 * to replace the built-in stand-ins. Returns null when a key is not set.
 */
let manifest: Promise<Record<string, string | null>> | null = null;
export async function loadModel(THREE: Three, key: 'rover' | 'stake' | 'plant') {
  manifest ??= fetch('/ypy/models/manifest.json')
    .then((r) => (r.ok ? r.json() : {}))
    .catch(() => ({}));
  const file = (await manifest)[key];
  if (!file) return null;
  try {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const gltf = await new GLTFLoader().loadAsync(`/ypy/models/${file}`);
    gltf.scene.traverse((o) => {
      if ((o as T.Mesh).isMesh) o.castShadow = o.receiveShadow = true;
    });
    return gltf.scene;
  } catch {
    return null;
  }
}

/** Scale a model to `size` along `axis` and rest its base on y = 0, centred in x/z. */
export function fitModel(THREE: Three, model: T.Object3D, size: number, axis: 'x' | 'y' = 'y') {
  const box = new THREE.Box3().setFromObject(model);
  const dim = box.getSize(new THREE.Vector3());
  const k = size / (dim[axis] || 1);
  const c = box.getCenter(new THREE.Vector3());
  model.scale.multiplyScalar(k);
  model.position.set(-c.x * k, -box.min.y * k, -c.z * k);
  const holder = new THREE.Group();
  holder.add(model);
  return holder;
}

/** Free every geometry/material/texture under a root. */
export function disposeTree(root: T.Object3D) {
  root.traverse((o) => {
    const m = o as T.Mesh;
    m.geometry?.dispose?.();
    const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    mats.forEach((mat) => {
      const withMaps = mat as T.MeshStandardMaterial;
      withMaps.map?.dispose();
      withMaps.bumpMap?.dispose();
      mat.dispose();
    });
  });
}

const shadows = (root: T.Object3D) =>
  root.traverse((o) => {
    if ((o as T.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

/**
 * Concept rover. The real YPY Rover design was not available, so this is an
 * illustrative six-wheel platform — faces +x.
 */
export async function buildRover(THREE: Three) {
  const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js');
  const g = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({ color: 0x1c1e20, metalness: 0.55, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.35 });
  const shell = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, metalness: 0.1, roughness: 0.55 });
  const accent = new THREE.MeshStandardMaterial({ color: 0xe2502a, metalness: 0.2, roughness: 0.5 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.97 });
  const alu = new THREE.MeshStandardMaterial({ color: 0x9a9d9f, metalness: 0.9, roughness: 0.35 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x05070c, metalness: 0.9, roughness: 0.08, clearcoat: 1 });
  const led = new THREE.MeshStandardMaterial({ color: 0x7fe3d4, emissive: 0x7fe3d4, emissiveIntensity: 2.4 });

  const add = (geo: T.BufferGeometry, mat: T.Material, x: number, y: number, z: number, parent: T.Object3D = g) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  add(new RoundedBoxGeometry(2.3, 0.44, 1.16, 4, 0.09), paint, 0, 0.68, 0);
  add(new RoundedBoxGeometry(1.7, 0.16, 1.0, 3, 0.05), shell, -0.12, 0.98, 0);
  add(new THREE.BoxGeometry(2.32, 0.05, 1.18), accent, 0, 0.5, 0);
  // solar deck with cell lines
  const panel = add(new THREE.BoxGeometry(1.2, 0.03, 0.84), glass, -0.3, 1.075, 0);
  panel.rotation.z = 0.02;
  for (let i = -2; i <= 2; i++) add(new THREE.BoxGeometry(0.012, 0.034, 0.84), alu, -0.3 + i * 0.24, 1.076, 0);
  // front sensor bar + headlights
  add(new RoundedBoxGeometry(0.1, 0.16, 0.9, 2, 0.03), glass, 1.16, 0.74, 0);
  for (const z of [-0.36, 0.36]) add(new THREE.SphereGeometry(0.035, 12, 8), led, 1.215, 0.74, z);

  // mast + sensor head + spinning lidar
  add(new THREE.CylinderGeometry(0.04, 0.05, 0.86, 12), alu, 0.62, 1.46, 0);
  const headBox = add(new RoundedBoxGeometry(0.34, 0.2, 0.4, 3, 0.04), paint, 0.66, 1.93, 0);
  for (const z of [-0.1, 0.1]) {
    const lens = add(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 20), glass, 0.18, 0, z, headBox);
    lens.rotation.z = Math.PI / 2;
  }
  const lidar = new THREE.Group();
  lidar.position.set(0.62, 2.1, 0);
  add(new THREE.CylinderGeometry(0.13, 0.13, 0.12, 28), paint, 0, 0, 0, lidar);
  add(new THREE.BoxGeometry(0.262, 0.03, 0.05), led, 0, 0.01, 0, lidar);
  g.add(lidar);
  // antenna
  const whip = add(new THREE.CylinderGeometry(0.008, 0.012, 1.1, 6), rubber, -0.95, 1.6, 0.35);
  whip.rotation.z = 0.12;

  // wheels + rocker arms
  const wheels: T.Group[] = [];
  const tire = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 36);
  tire.rotateX(Math.PI / 2);
  const hub = new THREE.CylinderGeometry(0.17, 0.17, 0.3, 20);
  hub.rotateX(Math.PI / 2);
  const lug = new THREE.BoxGeometry(0.075, 0.05, 0.29);
  for (const z of [-0.74, 0.74]) {
    add(new THREE.BoxGeometry(1.8, 0.07, 0.07), alu, 0, 0.44, z * 0.86).rotation.z = 0;
    for (const x of [-0.82, 0, 0.82]) {
      const w = new THREE.Group();
      w.position.set(x, 0.38, z);
      w.add(new THREE.Mesh(tire, rubber), new THREE.Mesh(hub, alu));
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const l = new THREE.Mesh(lug, rubber);
        l.position.set(Math.cos(a) * 0.375, Math.sin(a) * 0.375, 0);
        l.rotation.z = a + Math.PI / 2;
        w.add(l);
      }
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const s = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.31), alu);
        s.rotation.z = a;
        w.add(s);
      }
      add(new THREE.BoxGeometry(0.06, 0.34, 0.06), alu, x, 0.52, z * 0.86);
      g.add(w);
      wheels.push(w);
    }
  }
  shadows(g);
  return { group: g, wheels, lidar };
}

/**
 * Stake M1 concept, PBR. 1 unit = 10 cm; y = 0 is the soil line when installed.
 * Returns part anchors (local coordinates) in the same order as the parts list.
 */
export async function buildStake(THREE: Three) {
  const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js');
  const g = new THREE.Group();
  const pvc = new THREE.MeshPhysicalMaterial({ color: 0xe9e6dc, roughness: 0.38, clearcoat: 0.35, clearcoatRoughness: 0.5 });
  const housing = new THREE.MeshPhysicalMaterial({ color: 0x8f9692, roughness: 0.5, metalness: 0.05, transparent: true, opacity: 1 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.6 });
  const pcb = new THREE.MeshStandardMaterial({ color: 0x0f5a43, roughness: 0.45, metalness: 0.15 });
  const chip = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.35, metalness: 0.4 });
  const can = new THREE.MeshStandardMaterial({ color: 0xc9ccce, roughness: 0.3, metalness: 0.95 });
  const cell = new THREE.MeshPhysicalMaterial({ color: 0x1d6f8f, roughness: 0.35, metalness: 0.3, clearcoat: 0.6 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a44a, roughness: 0.35, metalness: 1 });

  const add = (geo: T.BufferGeometry, mat: T.Material, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    g.add(m);
    return m;
  };

  // tube + driven tip + depth rings
  add(new THREE.CylinderGeometry(0.125, 0.125, 4.7, 32), pvc, 0, -2.1, 0);
  add(new THREE.ConeGeometry(0.125, 0.34, 32), pvc, 0, -4.62, 0).rotation.x = Math.PI;
  for (const y of [-2, -4]) add(new THREE.CylinderGeometry(0.128, 0.128, 0.03, 32), dark, 0, y + 0.52, 0);

  // sealed head
  const head = add(new RoundedBoxGeometry(0.84, 1.02, 0.56, 4, 0.06), housing, 0, 0.76, 0);
  const lid = add(new RoundedBoxGeometry(0.9, 0.09, 0.62, 3, 0.04), housing, 0, 1.3, 0);
  add(new THREE.CylinderGeometry(0.17, 0.19, 0.16, 24), dark, 0, 0.2, 0);
  for (const [x, z] of [[-0.36, 0.23], [0.36, 0.23], [-0.36, -0.23], [0.36, -0.23]] as const)
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 10), can, x, 1.355, z);
  add(new THREE.CylinderGeometry(0.035, 0.045, 0.14, 12), can, 0.26, 1.4, 0);
  add(new THREE.CylinderGeometry(0.022, 0.03, 0.95, 10), dark, 0.26, 1.92, 0);

  // electronics inside
  add(new THREE.BoxGeometry(0.26, 0.44, 0.03), pcb, -0.19, 0.86, 0.12);
  add(new THREE.BoxGeometry(0.13, 0.13, 0.03), can, -0.19, 0.95, 0.15);
  add(new THREE.BoxGeometry(0.07, 0.07, 0.02), chip, -0.19, 0.75, 0.145);
  add(new THREE.BoxGeometry(0.18, 0.18, 0.03), pcb, 0.2, 1.02, 0.12);
  add(new THREE.BoxGeometry(0.1, 0.1, 0.025), chip, 0.2, 1.02, 0.148);
  const batt = add(new THREE.CylinderGeometry(0.095, 0.095, 0.66, 24), cell, 0, 0.47, -0.08);
  batt.rotation.z = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12), can, 0.345, 0.47, -0.08).rotation.z = Math.PI / 2;

  // probes
  const blade = (y: number) => {
    add(new RoundedBoxGeometry(0.035, 0.95, 0.23, 2, 0.012), pcb, 0.15, y, 0);
    for (const z of [-0.06, 0.06]) add(new THREE.BoxGeometry(0.004, 0.8, 0.05), gold, 0.169, y, z);
  };
  blade(-2);
  blade(-4);
  add(new THREE.CylinderGeometry(0.032, 0.032, 0.32, 16), can, -0.158, -2, 0);
  add(new THREE.SphereGeometry(0.032, 16, 8), can, -0.158, -2.16, 0);

  shadows(g);
  head.castShadow = lid.castShadow = true;
  const anchors: [number, number, number][] = [
    [0, 0.9, 0.3],
    [-0.19, 0.86, 0.16],
    [0.2, 1.02, 0.16],
    [0, 0.47, 0.02],
    [0, -1.0, 0.13],
    [0.19, -2, 0],
    [-0.2, -2, 0],
    [0.19, -4, 0],
  ];
  return { group: g, housing, anchors };
}

/**
 * A wet seedling. `update(growth, time)` scrubs it from nothing to full size
 * and animates the falling drop once grown.
 */
export function buildPlant(THREE: Three) {
  const g = new THREE.Group();

  // leaf texture: midrib and veins
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 512;
  const x = c.getContext('2d')!;
  const grad = x.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, '#2c6a22');
  grad.addColorStop(0.5, '#4f9a37');
  grad.addColorStop(1, '#2c6a22');
  x.fillStyle = grad;
  x.fillRect(0, 0, 256, 512);
  x.strokeStyle = 'rgba(190,225,150,0.55)';
  x.lineWidth = 3;
  x.beginPath();
  x.moveTo(128, 0);
  x.lineTo(128, 512);
  x.stroke();
  x.lineWidth = 1.4;
  for (let i = 0; i < 11; i++) {
    const y = 30 + i * 44;
    for (const s of [-1, 1]) {
      x.beginPath();
      x.moveTo(128, y + 26);
      x.quadraticCurveTo(128 + s * 60, y + 6, 128 + s * 124, y - 22);
      x.stroke();
    }
  }
  const leafMap = new THREE.CanvasTexture(c);
  leafMap.colorSpace = THREE.SRGBColorSpace;
  const leafMat = new THREE.MeshPhysicalMaterial({
    map: leafMap,
    bumpMap: leafMap,
    bumpScale: 0.6,
    roughness: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    side: THREE.DoubleSide,
  });
  const stemMat = new THREE.MeshPhysicalMaterial({ color: 0x6aa84a, roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.15 });
  const water = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0,
    metalness: 0,
    transparent: true,
    opacity: 0.42,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: 3,
    depthWrite: false,
  });

  const leafGeo = (len: number, wid: number, droop: number) => {
    const geo = new THREE.PlaneGeometry(1, 1, 10, 18);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getY(i) + 0.5; // 0 base → 1 tip
      const v = p.getX(i) * 2; // -1..1
      const w = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.8)), 0.75) * (1 - 0.25 * u);
      const px = v * w * wid * 0.5;
      const py = u * len;
      const pz = -droop * u * u * len + Math.abs(v) * w * wid * 0.22;
      p.setXYZ(i, px, py, pz);
    }
    geo.computeVertexNormals();
    return geo;
  };

  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.1, 0),
    new THREE.Vector3(0.03, 0.4, 0.01),
    new THREE.Vector3(-0.02, 0.85, -0.02),
    new THREE.Vector3(0.01, 1.25, 0),
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 40, 0.028, 10);
  const stem = new THREE.Mesh(stemGeo, stemMat);
  g.add(stem);
  const stemIndexCount = stemGeo.index!.count;

  type Leaf = { pivot: T.Group; at: number; open: number; start: number };
  const leaves: Leaf[] = [];
  const addLeaf = (at: number, yaw: number, len: number, wid: number, open: number, start: number, droop = 0.3) => {
    const pivot = new THREE.Group();
    pivot.position.copy(stemCurve.getPoint(at));
    pivot.rotation.y = yaw;
    const mesh = new THREE.Mesh(leafGeo(len, wid, droop), leafMat);
    mesh.castShadow = true;
    const tilt = new THREE.Group();
    tilt.add(mesh);
    pivot.add(tilt);
    g.add(pivot);
    const leaf = { pivot: tilt, at, open, start };
    leaves.push(leaf);
    return { pivot, tilt, len, droop };
  };
  addLeaf(0.5, 0.4, 0.34, 0.2, 1.25, 0.25, 0.1);
  addLeaf(0.5, 0.4 + Math.PI, 0.34, 0.2, 1.25, 0.25, 0.1);
  const big = addLeaf(0.96, 1.2, 0.95, 0.5, 1.05, 0.45);
  addLeaf(0.96, 1.2 + Math.PI * 0.9, 0.85, 0.46, 0.95, 0.5);
  addLeaf(0.99, -0.6, 0.6, 0.34, 0.55, 0.62, 0.2);

  // beads of water resting on the big leaves
  const beadGeo = new THREE.SphereGeometry(1, 16, 12);
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  leaves.slice(2).forEach((l) => {
    const mesh = l.pivot.children[0] as T.Mesh;
    const p = mesh.geometry.attributes.position;
    for (let i = 0; i < 9; i++) {
      const idx = Math.floor(rnd() * p.count);
      const s = 0.012 + rnd() * 0.02;
      const b = new THREE.Mesh(beadGeo, water);
      b.position.set(p.getX(idx), p.getY(idx), p.getZ(idx) + s * 0.5);
      b.scale.set(s, s, s * 0.6);
      mesh.add(b);
    }
  });

  // the falling drop + splash ring (in plant-local space, ground at y = 0)
  const drop = new THREE.Mesh(beadGeo, water);
  g.add(drop);
  const ringGeo = new THREE.RingGeometry(0.82, 1, 40);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xbfe9e2, transparent: true, opacity: 0, depthWrite: false });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.02;
  g.add(ring);
  const tip = new THREE.Vector3();

  const update = (growth: number, time: number, animate: boolean) => {
    g.visible = growth > 0.001;
    stemGeo.setDrawRange(0, Math.floor((stemIndexCount * ramp(0, 0.7, growth)) / 3) * 3);
    leaves.forEach((l) => {
      const k = ramp(l.start, Math.min(1, l.start + 0.4), growth);
      l.pivot.scale.setScalar(Math.max(0.0001, k));
      l.pivot.rotation.x = lerp(0.1, l.open, k) + (animate ? Math.sin(time * 1.3 + l.at * 9) * 0.015 : 0);
    });
    // tip of the big leaf, in plant space
    g.updateMatrixWorld(true);
    tip.set(0, big.len, -big.droop * big.len);
    big.tilt.children[0].localToWorld(tip);
    g.worldToLocal(tip);
    const grown = ramp(0.9, 1, growth);
    const cyc = animate ? (time % 3.2) / 3.2 : 0.3;
    const form = ramp(0, 0.45, cyc);
    const fall = clamp((cyc - 0.5) / 0.22);
    const y = lerp(tip.y - 0.03, 0.02, fall * fall);
    const s = 0.035 * grown * (fall < 1 ? 0.3 + 0.7 * form : 0);
    drop.position.set(tip.x, y, tip.z);
    drop.scale.set(s, s * (1.25 + fall * 0.5), s);
    const splash = clamp((cyc - 0.72) / 0.28);
    ring.position.set(tip.x, 0.02, tip.z);
    ring.scale.setScalar(0.03 + splash * 0.3);
    ringMat.opacity = grown * (cyc > 0.72 ? (1 - splash) * 0.7 : 0);
  };

  return { group: g, update };
}

/**
 * Real plant model (public/ypy/models, see manifest.json) with water beads and a
 * falling drop. Falls back to the procedural seedling if the model is missing.
 */
export async function loadPlant(THREE: Three, height = 1.5) {
  const model = await loadModel(THREE, 'plant');
  if (!model) return buildPlant(THREE);
  const src = model.getObjectByName('leaves') ?? model;
  src.removeFromParent();
  const holder = fitModel(THREE, src, height);
  const g = new THREE.Group();
  g.add(holder);
  g.updateMatrixWorld(true);

  const meshes: T.Mesh[] = [];
  src.traverse((o) => {
    const m = o as T.Mesh;
    if (!m.isMesh) return;
    meshes.push(m);
    const mat = m.material as T.MeshStandardMaterial;
    mat.roughness = 0.34; // wet leaves
    mat.envMapIntensity = 1.5;
    mat.side = THREE.DoubleSide;
  });

  const water = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0, transmission: 1, thickness: 0.35, ior: 1.33, envMapIntensity: 2 });
  const beadGeo = new THREE.SphereGeometry(1, 14, 10);
  const COUNT = 90;
  const beads = new THREE.InstancedMesh(beadGeo, water, COUNT);
  let seed = 9;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const v = new THREE.Vector3();
  const n = new THREE.Vector3();
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const s3 = new THREE.Vector3();
  const tip = new THREE.Vector3(0, height * 0.6, 0);
  let best = -1;
  for (let i = 0; i < COUNT * 6; i++) {
    const mesh = meshes[Math.floor(rnd() * meshes.length)];
    if (!mesh) break;
    const pos = mesh.geometry.attributes.position;
    const nor = mesh.geometry.attributes.normal;
    const idx = Math.floor(rnd() * pos.count);
    v.fromBufferAttribute(pos, idx).applyMatrix4(mesh.matrixWorld);
    n.fromBufferAttribute(nor, idx).transformDirection(mesh.matrixWorld);
    // the drop falls from the outermost leaf edge
    const reach = Math.hypot(v.x, v.z) + (v.y > height * 0.3 ? 0.2 : 0);
    if (reach > best) {
      best = reach;
      tip.copy(v);
    }
    if (i < COUNT) {
      if (n.y < 0) n.negate();
      const s = 0.008 + rnd() * rnd() * 0.022;
      q.setFromUnitVectors(up, n);
      m4.compose(v.addScaledVector(n, s * 0.35), q, s3.set(s, s * 0.55, s));
      beads.setMatrixAt(i, m4);
    }
  }
  holder.add(beads);

  const drop = new THREE.Mesh(beadGeo, water);
  const ringGeo = new THREE.RingGeometry(0.8, 1, 40);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xdff3f0, transparent: true, opacity: 0, depthWrite: false });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  g.add(drop, ring);

  const update = (growth: number, time: number, animate: boolean) => {
    g.visible = growth > 0.001;
    const k = 1 - Math.pow(1 - growth, 3);
    holder.scale.setScalar(Math.max(0.0001, k));
    holder.rotation.y = (1 - k) * 1.4;
    holder.rotation.z = animate ? Math.sin(time * 0.9) * 0.012 * k : 0;
    const grown = ramp(0.92, 1, growth);
    const cyc = animate ? (time % 3.4) / 3.4 : 0.3;
    const form = ramp(0, 0.45, cyc);
    const fall = clamp((cyc - 0.5) / 0.2);
    const s = 0.034 * grown * (fall < 1 ? 0.3 + 0.7 * form : 0);
    drop.position.set(tip.x, lerp(tip.y - 0.03, 0.03, fall * fall), tip.z);
    drop.scale.set(s, s * (1.25 + fall * 0.6), s);
    const splash = clamp((cyc - 0.7) / 0.3);
    ring.position.set(tip.x, 0.03, tip.z);
    ring.scale.setScalar(0.03 + splash * 0.34);
    ringMat.opacity = grown * (cyc > 0.7 ? (1 - splash) * 0.8 : 0);
  };
  return { group: g, update };
}
