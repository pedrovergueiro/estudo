"""Pré-processamento configurável por perfil e preparação do tensor de entrada.

Princípios:
- As operações são conservadoras: o objetivo é reduzir variação de iluminação,
  não "embelezar" a imagem. Filtros agressivos apagam fissuras e furos.
- A MESMA cadeia deve ser aplicada às imagens de treinamento
  (scripts/preprocess_dataset.py), senão há desvio de domínio.
- Nenhuma operação recupera informação que a câmera não capturou.
"""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

import cv2
import numpy as np

Op = Callable[[np.ndarray], np.ndarray]


class PreprocessError(ValueError):
    pass


def _as_bgr(img: np.ndarray) -> np.ndarray:
    if img.ndim == 2:
        return cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    if img.shape[2] == 4:
        return cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
    return img


# ------------------------------------------------------------------ operações
def gray_world_white_balance(img: np.ndarray, max_gain: float = 2.0) -> np.ndarray:
    """Balanço de branco gray-world, com ganho limitado para não amplificar ruído."""
    img = _as_bgr(img)
    f = img.astype(np.float32)
    means = f.reshape(-1, 3).mean(0)
    gains = np.clip(means.mean() / np.maximum(means, 1e-3), 1.0 / max_gain, max_gain)
    return np.clip(f * gains, 0, 255).astype(np.uint8)


def fixed_white_balance(img: np.ndarray, gains: list[float]) -> np.ndarray:
    """Ganhos fixos (B, G, R) calibrados com alvo cinza na estação."""
    if len(gains) != 3:
        raise PreprocessError("fixed_white_balance: gains deve ter 3 valores (B, G, R)")
    img = _as_bgr(img)
    return np.clip(img.astype(np.float32) * np.array(gains, np.float32), 0, 255).astype(np.uint8)


def normalize_exposure(img: np.ndarray, target_mean: float = 128.0, max_gain: float = 2.0) -> np.ndarray:
    """Ganho global para aproximar a média de luminância do alvo (limitado)."""
    gray = img if img.ndim == 2 else cv2.cvtColor(_as_bgr(img), cv2.COLOR_BGR2GRAY)
    m = float(gray.mean())
    gain = float(np.clip(target_mean / max(m, 1e-3), 1.0 / max_gain, max_gain))
    return np.clip(img.astype(np.float32) * gain, 0, 255).astype(np.uint8)


def gamma(img: np.ndarray, value: float = 1.0) -> np.ndarray:
    if value <= 0:
        raise PreprocessError("gamma deve ser > 0")
    lut = np.clip(((np.arange(256) / 255.0) ** (1.0 / value)) * 255.0, 0, 255).astype(np.uint8)
    return cv2.LUT(img, lut)


def clahe(img: np.ndarray, clip_limit: float = 2.0, tile_grid: int = 8) -> np.ndarray:
    """Realce local de contraste no canal L (Lab) — preserva matiz."""
    if clip_limit > 4.0:
        raise PreprocessError("clahe: clip_limit > 4 tende a criar artefatos semelhantes a defeitos")
    op = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(tile_grid, tile_grid))
    if img.ndim == 2:
        return op.apply(img)
    lab = cv2.cvtColor(_as_bgr(img), cv2.COLOR_BGR2LAB)
    lab[..., 0] = op.apply(lab[..., 0])
    return cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)


def denoise_bilateral(img: np.ndarray, d: int = 5, sigma_color: float = 20.0, sigma_space: float = 5.0) -> np.ndarray:
    """Bilateral leve: suaviza ruído sem borrar bordas finas (fissuras)."""
    if d > 9 or sigma_color > 60:
        raise PreprocessError("denoise_bilateral: parâmetros agressivos removem defeitos pequenos")
    return cv2.bilateralFilter(img, d, sigma_color, sigma_space)


def denoise_nlmeans(img: np.ndarray, h: float = 3.0, template: int = 7, search: int = 21) -> np.ndarray:
    if h > 10:
        raise PreprocessError("denoise_nlmeans: h > 10 apaga riscos e furos pequenos")
    if img.ndim == 2:
        return cv2.fastNlMeansDenoising(img, None, h, template, search)
    return cv2.fastNlMeansDenoisingColored(img, None, h, h, template, search)


def flat_field(img: np.ndarray, blur_sigma: float = 25.0, reference: np.ndarray | None = None) -> np.ndarray:
    """Compensa iluminação não uniforme do fundo.

    Com `reference` (imagem do fundo vazio capturada na calibração) faz correção
    de campo plano verdadeira. Sem ela, estima o fundo por desfoque forte — que
    também atenua parcialmente gradientes da própria cápsula; prefira a referência.
    """
    f = img.astype(np.float32)
    if reference is not None:
        ref = cv2.resize(reference, (img.shape[1], img.shape[0])).astype(np.float32)
    else:
        ref = cv2.GaussianBlur(f, (0, 0), blur_sigma)
    ref = np.maximum(ref, 1.0)
    mean = ref.reshape(-1, ref.shape[-1] if ref.ndim == 3 else 1).mean(0)
    return np.clip(f / ref * mean, 0, 255).astype(np.uint8)


def to_lab(img: np.ndarray) -> np.ndarray:
    """Experimental: entrega Lab como 3 canais (modelo deve ser treinado igual)."""
    return cv2.cvtColor(_as_bgr(img), cv2.COLOR_BGR2LAB)


def to_hsv(img: np.ndarray) -> np.ndarray:
    """Experimental: entrega HSV como 3 canais (modelo deve ser treinado igual)."""
    return cv2.cvtColor(_as_bgr(img), cv2.COLOR_BGR2HSV)


OPS: dict[str, Callable[..., np.ndarray]] = {
    "gray_world_white_balance": gray_world_white_balance,
    "fixed_white_balance": fixed_white_balance,
    "normalize_exposure": normalize_exposure,
    "gamma": gamma,
    "clahe": clahe,
    "denoise_bilateral": denoise_bilateral,
    "denoise_nlmeans": denoise_nlmeans,
    "flat_field": flat_field,
    "to_lab": to_lab,
    "to_hsv": to_hsv,
}


def build_pipeline(steps: list[dict[str, Any]], references: dict[str, np.ndarray] | None = None) -> Op:
    """Compila a lista `preprocessing` do perfil numa função img -> img."""
    compiled: list[tuple[str, Callable[..., np.ndarray], dict[str, Any]]] = []
    for i, step in enumerate(steps):
        step = dict(step)
        name = step.pop("op", None)
        if name not in OPS:
            raise PreprocessError(f"etapa {i}: operação desconhecida {name!r}; disponíveis: {sorted(OPS)}")
        if name == "flat_field" and "reference" in step:
            ref_name = step.pop("reference")
            if references is None or ref_name not in references:
                raise PreprocessError(f"flat_field: referência {ref_name!r} não carregada")
            step["reference"] = references[ref_name]
        fn = OPS[name]
        # valida parâmetros chamando com uma imagem minúscula
        try:
            fn(np.full((16, 16, 3), 128, np.uint8), **step)
        except TypeError as e:
            raise PreprocessError(f"etapa {i} ({name}): parâmetros inválidos: {e}") from e
        compiled.append((name, fn, step))

    def run(img: np.ndarray) -> np.ndarray:
        out = img
        for _, fn, kw in compiled:
            out = fn(out, **kw)
        return out

    run.steps = [n for n, _, _ in compiled]  # type: ignore[attr-defined]
    return run


def fuse_channels(images: list[np.ndarray]) -> np.ndarray:
    """Fusão antecipada: cada vista vira um canal de cinza (até 3 vistas)."""
    if not images:
        raise PreprocessError("fuse_channels: lista vazia")
    h, w = images[0].shape[:2]
    chans = []
    for im in images[:3]:
        g = im if im.ndim == 2 else cv2.cvtColor(_as_bgr(im), cv2.COLOR_BGR2GRAY)
        if g.shape[:2] != (h, w):
            raise PreprocessError("fuse_channels: vistas com tamanhos diferentes (câmera mudou?)")
        chans.append(g)
    while len(chans) < 3:
        chans.append(chans[-1])
    return np.dstack(chans)


# ------------------------------------------------------------------ entrada do modelo
def letterbox(img: np.ndarray, new_size: int = 640, color: int = 114
              ) -> tuple[np.ndarray, float, tuple[float, float]]:
    """Redimensiona mantendo proporção e preenche (mesma regra da Ultralytics LetterBox)."""
    h, w = img.shape[:2]
    r = min(new_size / h, new_size / w)
    nw, nh = int(round(w * r)), int(round(h * r))
    dw, dh = (new_size - nw) / 2, (new_size - nh) / 2
    if (w, h) != (nw, nh):
        img = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_LINEAR)
    top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
    left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
    img = cv2.copyMakeBorder(img, top, bottom, left, right, cv2.BORDER_CONSTANT, value=(color,) * 3)
    return img, r, (float(left), float(top))


def to_blob(img_bgr_lb: np.ndarray) -> np.ndarray:
    """BGR HWC uint8 -> RGB NCHW float32 [0,1]."""
    x = cv2.cvtColor(_as_bgr(img_bgr_lb), cv2.COLOR_BGR2RGB)
    x = x.transpose(2, 0, 1)[None].astype(np.float32) / 255.0
    return np.ascontiguousarray(x)
