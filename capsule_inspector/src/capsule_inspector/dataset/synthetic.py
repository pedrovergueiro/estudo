"""Gerador de imagens SINTÉTICAS de cápsulas com defeitos, para testar o pipeline.

ATENÇÃO: estas imagens servem apenas para verificar que o código funciona de
ponta a ponta (treino → exportação → inferência → decisão). Métricas obtidas
com elas NÃO indicam desempenho em cápsulas reais e não podem ser usadas como
evidência de generalização ou validação.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

from .metadata import write_metadata
from .yolo_io import YoloAnnotation, write_label_file

SYNTH_DEFECTS = ("crack", "hole", "stain", "scratch", "foreign_particle")

FINISH_ALPHA = {"opaque": 1.0, "translucent": 0.65, "transparent": 0.3}
COLORS = {
    "red_white": ((40, 40, 200), (235, 235, 235)),
    "blue_yellow": ((180, 90, 30), (60, 210, 230)),
    "green_white": ((60, 160, 60), (230, 230, 230)),
    "clear": ((200, 200, 200), (210, 210, 210)),
}


@dataclass
class SynthCapsule:
    center: tuple[float, float]
    angle: float
    length: float
    diameter: float


def _capsule_mask(shape: tuple[int, int], cap: SynthCapsule) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    h, w = shape
    r = cap.diameter / 2
    half = cap.length / 2 - r
    ux, uy = math.cos(cap.angle), math.sin(cap.angle)
    p1 = (cap.center[0] - ux * half, cap.center[1] - uy * half)
    p2 = (cap.center[0] + ux * half, cap.center[1] + uy * half)
    mask = np.zeros((h, w), np.uint8)
    s = 4  # subpixel shift
    P1 = (int(p1[0] * 16), int(p1[1] * 16))
    P2 = (int(p2[0] * 16), int(p2[1] * 16))
    cv2.line(mask, P1, P2, 255, int(round(2 * r)), cv2.LINE_AA, s)
    cv2.circle(mask, P1, int(r * 16), 255, -1, cv2.LINE_AA, s)
    cv2.circle(mask, P2, int(r * 16), 255, -1, cv2.LINE_AA, s)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    proj = (xx - cap.center[0]) * ux + (yy - cap.center[1]) * uy
    # tampa um pouco maior que metade, como cápsulas reais
    cap_part = (proj < cap.length * 0.08).astype(np.uint8) * 255
    return mask, cv2.bitwise_and(mask, cap_part), cv2.bitwise_and(mask, 255 - cap_part)


def _point_inside(cap: SynthCapsule, rng: np.random.Generator, spread: float = 0.6) -> tuple[float, float]:
    t = rng.uniform(-0.38, 0.38) * cap.length
    o = rng.uniform(-spread, spread) * cap.diameter / 2
    ux, uy = math.cos(cap.angle), math.sin(cap.angle)
    return cap.center[0] + ux * t - uy * o, cap.center[1] + uy * t + ux * o


def _box_from_points(pts: np.ndarray, w: int, h: int, pad: float = 1.0) -> tuple[float, float, float, float]:
    x1, y1 = np.clip(pts.min(0) - pad, 0, [w - 1, h - 1])
    x2, y2 = np.clip(pts.max(0) + pad, 0, [w - 1, h - 1])
    return float(x1), float(y1), float(x2), float(y2)


def render_capsule(rng: np.random.Generator, size: int = 320, finish: str = "opaque",
                   color: str = "red_white", lighting: str = "diffuse",
                   defects: list[str] | None = None) -> tuple[np.ndarray, list[tuple[str, tuple]]]:
    """Retorna (imagem BGR, [(classe, (x1,y1,x2,y2)), ...]) incluindo a cápsula."""
    h = w = size
    bg_level = {"diffuse": 45, "backlight": 200, "side_light": 25}.get(lighting, 45)
    img = np.full((h, w, 3), bg_level, np.float32)
    img += rng.normal(0, 3, img.shape).astype(np.float32)
    # gradiente de iluminação de fundo
    gx = np.linspace(-1, 1, w, dtype=np.float32)[None, :, None]
    img += gx * rng.uniform(-8, 8)

    cap = SynthCapsule(center=(w / 2 + rng.uniform(-15, 15), h / 2 + rng.uniform(-15, 15)),
                       angle=rng.uniform(-0.5, 0.5), length=size * rng.uniform(0.58, 0.68),
                       diameter=size * rng.uniform(0.2, 0.24))
    mask, m_cap, m_body = _capsule_mask((h, w), cap)
    alpha = FINISH_ALPHA[finish]
    c_cap, c_body = COLORS[color]
    layer = np.zeros_like(img)
    layer[m_cap > 0] = c_cap
    layer[m_body > 0] = c_body
    # sombreamento cilíndrico
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    ux, uy = math.cos(cap.angle), math.sin(cap.angle)
    perp = (-(xx - cap.center[0]) * uy + (yy - cap.center[1]) * ux) / (cap.diameter / 2)
    shade = np.clip(1.0 - 0.35 * perp ** 2, 0.4, 1.0)[..., None]
    layer *= shade
    a = (mask.astype(np.float32) / 255.0)[..., None] * alpha
    img = img * (1 - a) + layer * a
    if finish != "opaque":  # bordas refrativas brilhantes
        edge = cv2.morphologyEx(mask, cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8)).astype(np.float32)
        img += (cv2.GaussianBlur(edge, (0, 0), 1.2) / 255.0 * 90)[..., None]
    # reflexo especular (não é defeito!)
    hl = np.zeros((h, w), np.float32)
    k = cap.diameter * 0.22  # deslocado perpendicularmente ao eixo
    hc = (int(cap.center[0] + uy * k), int(cap.center[1] - ux * k))
    cv2.ellipse(hl, hc, (int(cap.length * 0.3), max(2, int(cap.diameter * 0.06))),
                math.degrees(cap.angle), 0, 360, 1.0, -1)
    hl = cv2.GaussianBlur(hl, (0, 0), 3) * (mask > 0)
    img += hl[..., None] * rng.uniform(60, 120)

    labels: list[tuple[str, tuple]] = []
    cnt, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    x, y, bw, bh = cv2.boundingRect(max(cnt, key=cv2.contourArea))
    labels.append(("capsule", (float(x), float(y), float(x + bw), float(y + bh))))

    for d in defects or []:
        if d == "crack":
            p = np.array(_point_inside(cap, rng, 0.3))
            pts = [p]
            ang = cap.angle + math.pi / 2 + rng.uniform(-0.6, 0.6)
            for _ in range(int(rng.integers(4, 7))):
                ang += rng.uniform(-0.5, 0.5)
                step = cap.diameter * rng.uniform(0.08, 0.14)
                nxt = pts[-1] + step * np.array([math.cos(ang), math.sin(ang)])
                xi, yi = int(np.clip(nxt[0], 0, w - 1)), int(np.clip(nxt[1], 0, h - 1))
                if mask[yi, xi] < 255:  # a fissura não sai da cápsula
                    break
                pts.append(nxt)
            if len(pts) < 3:
                pts.append(pts[-1] + 3.0 * np.array([math.cos(cap.angle), math.sin(cap.angle)]))
            arr = np.array(pts, np.float32)
            cv2.polylines(img, [arr.astype(np.int32)], False, (20, 20, 20), 1, cv2.LINE_AA)
            labels.append(("crack", _box_from_points(arr, w, h, 2)))
        elif d == "hole":
            p = _point_inside(cap, rng, 0.5)
            r = rng.uniform(2.5, 5)
            cv2.circle(img, (int(p[0]), int(p[1])), int(r), (15, 15, 15), -1, cv2.LINE_AA)
            cv2.circle(img, (int(p[0]), int(p[1])), int(r) + 1, (90, 90, 90), 1, cv2.LINE_AA)
            labels.append(("hole", (p[0] - r - 2, p[1] - r - 2, p[0] + r + 2, p[1] + r + 2)))
        elif d == "stain":
            p = _point_inside(cap, rng, 0.4)
            ax = (int(rng.uniform(5, 11)), int(rng.uniform(4, 9)))
            blob = np.zeros((h, w), np.float32)
            cv2.ellipse(blob, (int(p[0]), int(p[1])), ax, rng.uniform(0, 180), 0, 360, 1.0, -1)
            blob = cv2.GaussianBlur(blob, (0, 0), 1.5)
            col = np.array([30, 90, 120], np.float32)
            img = img * (1 - 0.7 * blob[..., None]) + col * 0.7 * blob[..., None]
            r = max(ax) + 3
            labels.append(("stain", (p[0] - r, p[1] - r, p[0] + r, p[1] + r)))
        elif d == "scratch":
            p = np.array(_point_inside(cap, rng, 0.4))
            ang = cap.angle + rng.uniform(-0.4, 0.4)
            L = cap.length * rng.uniform(0.15, 0.3)
            q = p + L * np.array([math.cos(ang), math.sin(ang)])
            arr = np.array([p, q], np.float32)
            cv2.line(img, tuple(p.astype(int)), tuple(q.astype(int)), (225, 225, 225), 1, cv2.LINE_AA)
            labels.append(("scratch", _box_from_points(arr, w, h, 2)))
        elif d == "foreign_particle":
            p = _point_inside(cap, rng, 0.6)
            r = rng.uniform(1.5, 3)
            cv2.circle(img, (int(p[0]), int(p[1])), max(1, int(r)), (10, 30, 10), -1, cv2.LINE_AA)
            labels.append(("foreign_particle", (p[0] - r - 2, p[1] - r - 2, p[0] + r + 2, p[1] + r + 2)))
        else:
            raise ValueError(f"defeito sintético não suportado: {d}")
    img = np.clip(img, 0, 255).astype(np.uint8)
    return img, labels


def generate_dataset(out_root: Path, class_names: list[str], n_units: int = 60, views_per_unit: int = 2,
                     size: int = 320, seed: int = 0, defect_rate: float = 0.6,
                     finishes: tuple[str, ...] = ("opaque", "translucent", "transparent")) -> Path:
    """Gera um dataset YOLO sintético com metadata.csv (unit_id/lot/session/finish/color/lighting)."""
    rng = np.random.default_rng(seed)
    out_root = Path(out_root)
    idx = {n: i for i, n in enumerate(class_names)}
    available = [d for d in SYNTH_DEFECTS if d in idx]
    (out_root / "images").mkdir(parents=True, exist_ok=True)
    rows = []
    lightings = ["diffuse", "backlight", "side_light"]
    for u in range(n_units):
        finish = finishes[u % len(finishes)]
        color = "clear" if finish == "transparent" else list(COLORS)[u % 3]
        defects: list[str] = []
        if available and rng.random() < defect_rate:
            k = 1 if rng.random() < 0.8 else 2
            defects = list(rng.choice(available, size=min(k, len(available)), replace=False))
        state = int(rng.integers(0, 2**31 - 1))
        for v in range(views_per_unit):
            # mesma unidade física: mesma geometria/defeitos, iluminação diferente
            unit_rng = np.random.default_rng(state)
            lighting = lightings[v % len(lightings)]
            img, labels = render_capsule(unit_rng, size, finish, color, lighting, defects)
            name = f"u{u:04d}_v{v}.png"
            cv2.imwrite(str(out_root / "images" / name), img)
            anns = []
            for cls, (x1, y1, x2, y2) in labels:
                if cls not in idx:
                    continue
                anns.append(YoloAnnotation(idx[cls], (x1 + x2) / 2 / size, (y1 + y2) / 2 / size,
                                           (x2 - x1) / size, (y2 - y1) / size))
            write_label_file(out_root / "labels" / f"u{u:04d}_v{v}.txt", anns)
            rows.append({"image": f"images/{name}", "unit_id": f"U{u:04d}", "lot": f"L{u % 4}",
                         "session": f"S{u % 2}", "finish": finish, "color": color,
                         "lighting": lighting, "profile": "synthetic"})
    write_metadata(out_root / "metadata.csv", rows,
                   ["image", "unit_id", "lot", "session", "finish", "color", "lighting", "profile"])
    (out_root / "SYNTHETIC_DATA_NOT_FOR_VALIDATION.txt").write_text(
        "Dataset sintético gerado por capsule_inspector.dataset.synthetic.\n"
        "Uso exclusivo para testes de software. Não representa cápsulas reais.\n", encoding="utf-8")
    return out_root

