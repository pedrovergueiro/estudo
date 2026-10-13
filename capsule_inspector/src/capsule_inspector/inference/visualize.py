"""Imagem anotada para o operador."""

from __future__ import annotations

import cv2
import numpy as np

from ..types import Decision, InspectionStatus

STATUS_COLORS = {
    InspectionStatus.PASS: (60, 170, 60),
    InspectionStatus.FAIL: (40, 40, 220),
    InspectionStatus.REVIEW: (0, 170, 255),
    InspectionStatus.SYSTEM_ERROR: (160, 40, 160),
}


def _label(img: np.ndarray, text: str, org: tuple[int, int], color: tuple[int, int, int],
           scale: float, thickness: int = 1) -> None:
    """Texto branco sobre caixa sólida — legível em fundo claro ou escuro."""
    (tw, th), base = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, scale, thickness)
    x, y = org
    h, w = img.shape[:2]
    x = max(0, min(x, w - tw - 4))
    y = max(th + 4, min(y, h - base - 2))
    cv2.rectangle(img, (x, y - th - 4), (x + tw + 4, y + base), color, -1)
    cv2.putText(img, text, (x + 2, y - 2), cv2.FONT_HERSHEY_SIMPLEX, scale, (255, 255, 255), thickness, cv2.LINE_AA)


def annotate(image: np.ndarray, decision: Decision, extra_lines: list[str] | None = None) -> np.ndarray:
    vis = image.copy() if image.ndim == 3 else cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    h, w = vis.shape[:2]
    scale = max(0.4, min(1.2, w / 1000))
    th = max(1, int(round(scale * 2)))
    for cap in decision.capsules:
        col = STATUS_COLORS[cap.status]
        if cap.box:
            x1, y1, x2, y2 = (int(round(v)) for v in cap.box)
            cv2.rectangle(vis, (x1, y1), (x2, y2), col, th)
            _label(vis, f"#{cap.index} {cap.status.value}", (x1, y1 - 2), col, 0.45 * scale + 0.1)
        for d in cap.defects:
            x1, y1, x2, y2 = (int(round(v)) for v in d.box)
            dcol = (0, 0, 255) if cap.status == InspectionStatus.FAIL else (0, 200, 255)
            if d.polygon:
                pts = np.array(d.polygon, np.int32)
                overlay = vis.copy()
                cv2.fillPoly(overlay, [pts], dcol)
                vis = cv2.addWeighted(overlay, 0.35, vis, 0.65, 0)
            cv2.rectangle(vis, (x1, y1), (x2, y2), dcol, max(1, th - 1))
            _label(vis, f"{d.class_name} {d.confidence:.2f}", (x1, y2 + int(14 * scale) + 6), dcol,
                   0.42 * scale + 0.1)
    banner_h = int(28 * scale) + 10
    col = STATUS_COLORS[decision.status]
    cv2.rectangle(vis, (0, 0), (w, banner_h), col, -1)
    text = f"{decision.status.value}  {decision.category.value}"
    cv2.putText(vis, text, (8, banner_h - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.7 * scale + 0.1,
                (255, 255, 255), th, cv2.LINE_AA)
    y = banner_h + int(16 * scale) + 6
    for line in (extra_lines or [])[:4]:
        _label(vis, line[:90], (4, y), (60, 60, 60), 0.38 * scale + 0.1)
        y += int(16 * scale) + 8
    return vis
