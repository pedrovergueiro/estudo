"""Localização da região ocupada por cada cápsula.

Dois métodos:
- `detector`: usa as detecções da classe "capsule" do próprio modelo.
- `classical`: limiarização + contornos, para estação com fundo controlado.
  Funciona como verificação independente do detector (ex.: cápsula presente
  mas não detectada => REVIEW) e para recortes em 2 estágios.
"""

from __future__ import annotations

from dataclasses import dataclass

import cv2
import numpy as np

from ..types import Detection


@dataclass
class CapsuleRegion:
    box: tuple[float, float, float, float]
    confidence: float | None
    source: str  # detector | classical
    touches_border: bool = False
    area_fraction: float = 0.0
    angle_deg: float | None = None

    def padded(self, margin: int, width: int, height: int) -> tuple[int, int, int, int]:
        x1, y1, x2, y2 = self.box
        return (max(0, int(x1) - margin), max(0, int(y1) - margin),
                min(width, int(np.ceil(x2)) + margin), min(height, int(np.ceil(y2)) + margin))


def _touches(box: tuple[float, float, float, float], w: int, h: int, margin: int) -> bool:
    x1, y1, x2, y2 = box
    return x1 <= margin or y1 <= margin or x2 >= w - 1 - margin or y2 >= h - 1 - margin


def regions_from_detections(dets: list[Detection], capsule_class: str, min_conf: float,
                            shape: tuple[int, int], border_margin: int) -> list[CapsuleRegion]:
    h, w = shape
    out = []
    for d in dets:
        if d.class_name == capsule_class and d.confidence >= min_conf:
            out.append(CapsuleRegion(d.box, d.confidence, "detector", _touches(d.box, w, h, border_margin),
                                     d.area / float(w * h)))
    return sorted(out, key=lambda r: (r.box[0], r.box[1]))


def classical_regions(image: np.ndarray, min_area_fraction: float = 0.005, border_margin: int = 3,
                      min_delta: float = 18.0) -> list[CapsuleRegion]:
    """Segmenta cápsulas pela distância de cor (Lab) ao fundo estimado nas bordas.

    Mais robusto que Otsu em cápsulas bicolores (ex.: tampa escura + corpo claro)
    e com fundo claro ou escuro. Pressupõe estação com fundo uniforme e cápsula
    sem tocar as bordas do quadro.
    """
    img = image if image.ndim == 3 else cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    h, w = img.shape[:2]
    lab = cv2.cvtColor(cv2.GaussianBlur(img, (5, 5), 0), cv2.COLOR_BGR2LAB).astype(np.float32)
    b = max(2, min(h, w) // 40)
    border = np.concatenate([lab[:b].reshape(-1, 3), lab[-b:].reshape(-1, 3),
                             lab[:, :b].reshape(-1, 3), lab[:, -b:].reshape(-1, 3)])
    bg = np.median(border, axis=0)
    dist = np.linalg.norm(lab - bg, axis=2)
    bd = np.linalg.norm(border - bg, axis=1)
    thr = max(min_delta, float(np.percentile(bd, 99)) * 1.5)
    th = (dist > thr).astype(np.uint8) * 255
    # fechamento proporcional ao quadro: une bordas refrativas de cápsulas transparentes
    kc = max(7, (min(h, w) // 25) | 1)
    th = cv2.morphologyEx(th, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kc, kc)))
    # preenche o interior (cápsula transparente = anel fino) antes de remover ruído
    filled = np.zeros_like(th)
    ext, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(filled, ext, -1, 255, thickness=cv2.FILLED)
    filled = cv2.morphologyEx(filled, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    cnts, _ = cv2.findContours(filled, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    out = []
    for c in cnts:
        a = cv2.contourArea(c)
        if a < min_area_fraction * w * h:
            continue
        x, y, bw, bh = cv2.boundingRect(c)
        (_, _), (_, _), ang = cv2.minAreaRect(c)
        box = (float(x), float(y), float(x + bw), float(y + bh))
        out.append(CapsuleRegion(box, None, "classical", _touches(box, w, h, border_margin),
                                 a / float(w * h), float(ang)))
    return sorted(out, key=lambda r: (r.box[0], r.box[1]))
