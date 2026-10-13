"""Verificação de qualidade da imagem antes da inferência.

Imagem reprovada aqui NUNCA resulta em PASS: o motor de decisão converte a
falha em REVIEW (ou SYSTEM_ERROR, conforme configuração).
"""

from __future__ import annotations

import cv2
import numpy as np

from ..config import QualityThresholds
from ..types import QualityReport


def check_quality(image: np.ndarray | None, q: QualityThresholds) -> QualityReport:
    if image is None or not isinstance(image, np.ndarray) or image.size == 0:
        return QualityReport(False, {}, ["EMPTY_IMAGE"])
    if image.ndim not in (2, 3) or min(image.shape[:2]) < 32:
        return QualityReport(False, {}, [f"INVALID_SHAPE {image.shape}"])
    if image.dtype != np.uint8:
        return QualityReport(False, {}, [f"INVALID_DTYPE {image.dtype}"])
    gray = image if image.ndim == 2 else cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    mean = float(gray.mean())
    sat = float((gray >= 250).mean())
    dark = float((gray <= 5).mean())
    sharp = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    std = float(gray.std())
    m = {"mean_intensity": mean, "saturated_fraction": sat, "dark_fraction": dark,
         "sharpness_laplacian_var": sharp, "std_intensity": std}
    reasons = []
    if std < 1.0:
        reasons.append("UNIFORM_IMAGE (câmera tampada, sem sinal ou quadro congelado)")
    if mean < q.min_mean_intensity:
        reasons.append(f"UNDEREXPOSED mean={mean:.1f}")
    if mean > q.max_mean_intensity:
        reasons.append(f"OVEREXPOSED mean={mean:.1f}")
    if sat > q.max_saturated_fraction:
        reasons.append(f"SPECULAR_SATURATION frac={sat:.3f}")
    if sharp < q.min_sharpness_laplacian_var:
        reasons.append(f"BLURRY lap_var={sharp:.1f}")
    return QualityReport(not reasons, m, reasons)
