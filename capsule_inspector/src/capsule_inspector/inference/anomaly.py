"""Modo C — detecção de anomalias treinada apenas com cápsulas normais.

Implementação "PatchCore-lite": banco de memória de características de
patches de cápsulas normais (subamostrado por coreset k-center guloso);
o escore de uma cápsula é a maior distância de um patch ao vizinho mais
próximo no banco.

Extratores de características:
- `handcrafted` (padrão): Lab + gradiente + Laplaciano + desvio local, em
  numpy/OpenCV. Leve o suficiente para o Raspberry Pi; menos discriminativo
  que CNN pré-treinada.
- `onnx`: backbone CNN exportado para ONNX (ex.: ResNet18 camadas 2-3) —
  produz PatchCore mais próximo do artigo original. Treino do banco na
  estação; no Pi roda só o ONNX + busca de vizinhos.
Para PatchCore/PaDiM completos (WideResNet50) recomenda-se a biblioteca
Anomalib (Apache-2.0) na estação de treinamento; o custo de memória/latência
desses modelos no Pi deve ser medido antes de adotá-los.

O resultado do Modo C é "anomalia visual" (REVIEW por padrão), nunca um
defeito confirmado de classe conhecida.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

import cv2
import numpy as np

CROP_SIZE = (192, 96)  # (largura, altura) após normalizar a orientação
FORMAT_VERSION = 1


def normalize_crop(image: np.ndarray, box: tuple[float, float, float, float], margin: int = 6,
                   size: tuple[int, int] = CROP_SIZE) -> np.ndarray:
    """Recorta a cápsula e coloca o eixo maior na horizontal."""
    h, w = image.shape[:2]
    x1, y1, x2, y2 = box
    x1, y1 = max(0, int(x1) - margin), max(0, int(y1) - margin)
    x2, y2 = min(w, int(np.ceil(x2)) + margin), min(h, int(np.ceil(y2)) + margin)
    crop = image[y1:y2, x1:x2]
    if crop.size == 0:
        raise ValueError("recorte vazio")
    if crop.shape[0] > crop.shape[1]:
        crop = cv2.rotate(crop, cv2.ROTATE_90_CLOCKWISE)
    return cv2.resize(crop, size, interpolation=cv2.INTER_AREA)


class FeatureExtractor(Protocol):
    name: str

    def __call__(self, crop_bgr: np.ndarray) -> np.ndarray:
        """Retorna (num_patches, dim) float32."""


class HandcraftedExtractor:
    name = "handcrafted"

    def __init__(self, patch: int = 8):
        self.patch = patch

    def __call__(self, crop_bgr: np.ndarray) -> np.ndarray:
        img = crop_bgr if crop_bgr.ndim == 3 else cv2.cvtColor(crop_bgr, cv2.COLOR_GRAY2BGR)
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
        L = lab[..., 0]
        gx = cv2.Sobel(L, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(L, cv2.CV_32F, 0, 1, ksize=3)
        grad = cv2.magnitude(gx, gy)
        lap = np.abs(cv2.Laplacian(L, cv2.CV_32F, ksize=3))
        mu = cv2.blur(L, (5, 5))
        lstd = np.sqrt(np.maximum(cv2.blur(L * L, (5, 5)) - mu * mu, 0))
        maps = np.dstack([lab, grad, lap, lstd])  # H, W, 6
        p = self.patch
        H, W = maps.shape[:2]
        H, W = H - H % p, W - W % p
        m = maps[:H, :W].reshape(H // p, p, W // p, p, maps.shape[2])
        mean = m.mean(axis=(1, 3))
        std = m.std(axis=(1, 3))
        mx = m.max(axis=(1, 3))
        feats = np.concatenate([mean, std, mx[..., 3:]], axis=-1)  # 6 + 6 + 3
        return feats.reshape(-1, feats.shape[-1]).astype(np.float32)


class OnnxExtractor:
    name = "onnx"

    def __init__(self, path: str | Path, num_threads: int = 2):
        import onnxruntime as ort
        so = ort.SessionOptions()
        so.intra_op_num_threads = num_threads
        self.path = str(path)
        self.sess = ort.InferenceSession(self.path, so, providers=["CPUExecutionProvider"])
        self.inp = self.sess.get_inputs()[0].name

    def __call__(self, crop_bgr: np.ndarray) -> np.ndarray:
        x = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        x = (x - np.array([0.485, 0.456, 0.406], np.float32)) / np.array([0.229, 0.224, 0.225], np.float32)
        x = x.transpose(2, 0, 1)[None]
        fmap = self.sess.run(None, {self.inp: np.ascontiguousarray(x)})[0][0]  # C, h, w
        return fmap.reshape(fmap.shape[0], -1).T.astype(np.float32)


def greedy_coreset(x: np.ndarray, k: int, seed: int = 0, proj_dim: int = 64) -> np.ndarray:
    """k-center guloso (como no PatchCore), com projeção aleatória para acelerar."""
    n = len(x)
    if k >= n:
        return np.arange(n)
    rng = np.random.default_rng(seed)
    z = x
    if x.shape[1] > proj_dim:
        z = x @ rng.normal(size=(x.shape[1], proj_dim)).astype(np.float32)
    sel = [int(rng.integers(n))]
    dmin = np.linalg.norm(z - z[sel[0]], axis=1)
    for _ in range(k - 1):
        i = int(dmin.argmax())
        sel.append(i)
        dmin = np.minimum(dmin, np.linalg.norm(z - z[i], axis=1))
    return np.array(sel)


def _nn_dist(q: np.ndarray, bank: np.ndarray, bank_sq: np.ndarray, chunk: int = 2048) -> np.ndarray:
    out = np.empty(len(q), np.float32)
    for s in range(0, len(q), chunk):
        qq = q[s:s + chunk]
        d2 = (qq * qq).sum(1, keepdims=True) - 2 * qq @ bank.T + bank_sq[None, :]
        out[s:s + chunk] = np.sqrt(np.maximum(d2.min(1), 0))
    return out


@dataclass
class AnomalyResult:
    score: float
    threshold: float
    is_anomalous: bool
    heatmap: np.ndarray | None = None


class PatchCoreLite:
    def __init__(self, extractor: FeatureExtractor, bank: np.ndarray, mean: np.ndarray, std: np.ndarray,
                 threshold: float, grid: tuple[int, int] | None = None, meta: dict | None = None):
        self.extractor = extractor
        self.bank = bank.astype(np.float32)
        self.bank_sq = (self.bank * self.bank).sum(1)
        self.mean = mean.astype(np.float32)
        self.std = std.astype(np.float32)
        self.threshold = float(threshold)
        self.grid = grid
        self.meta = meta or {}

    # ------------------------------------------------------------------ treino
    @classmethod
    def fit(cls, normal_crops: list[np.ndarray], extractor: FeatureExtractor | None = None,
            max_bank: int = 4000, seed: int = 0) -> PatchCoreLite:
        if len(normal_crops) < 5:
            raise ValueError("são necessárias ao menos 5 cápsulas normais (recomendado: centenas)")
        extractor = extractor or HandcraftedExtractor()
        feats = [extractor(c) for c in normal_crops]
        allf = np.concatenate(feats)
        mean, std = allf.mean(0), allf.std(0) + 1e-6
        z = (allf - mean) / std
        idx = greedy_coreset(z, max_bank, seed)
        model = cls(extractor, z[idx], mean, std, threshold=float("inf"),
                    meta={"n_train_crops": len(normal_crops), "n_patches": int(len(z)),
                          "bank_size": int(len(idx)), "extractor": extractor.name})
        return model

    def calibrate(self, normal_val_crops: list[np.ndarray], quantile: float = 0.995) -> float:
        """Limiar = quantil dos escores de cápsulas NORMAIS de validação (não de treino)."""
        if not normal_val_crops:
            raise ValueError("calibração exige cápsulas normais de validação")
        scores = np.array([self.score(c).score for c in normal_val_crops])
        self.threshold = float(np.quantile(scores, quantile))
        self.meta.update({"calibration_quantile": quantile, "calibration_n": int(len(scores))})
        return self.threshold

    # ------------------------------------------------------------------ inferência
    def score(self, crop_bgr: np.ndarray) -> AnomalyResult:
        f = (self.extractor(crop_bgr) - self.mean) / self.std
        d = _nn_dist(f, self.bank, self.bank_sq)
        s = float(d.max())
        heat = None
        if self.grid and self.grid[0] * self.grid[1] == len(d):
            heat = d.reshape(self.grid)
        return AnomalyResult(s, self.threshold, bool(s > self.threshold), heat)

    # ------------------------------------------------------------------ E/S
    def save(self, path: Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        meta = {**self.meta, "format_version": FORMAT_VERSION, "extractor": self.extractor.name,
                "crop_size": list(CROP_SIZE)}
        if isinstance(self.extractor, OnnxExtractor):
            meta["extractor_path"] = self.extractor.path
        tmp = path.with_name(path.name + ".tmp.npz")
        np.savez_compressed(tmp, bank=self.bank, mean=self.mean, std=self.std,
                            threshold=np.array(self.threshold), meta=np.array(json.dumps(meta)))
        tmp.replace(path)

    @classmethod
    def load(cls, path: Path) -> PatchCoreLite:
        with np.load(Path(path), allow_pickle=False) as z:
            meta = json.loads(str(z["meta"]))
            if meta.get("format_version") != FORMAT_VERSION:
                raise ValueError("versão de formato de modelo de anomalia incompatível")
            ext: FeatureExtractor = (OnnxExtractor(meta["extractor_path"]) if meta["extractor"] == "onnx"
                                     else HandcraftedExtractor())
            return cls(ext, z["bank"], z["mean"], z["std"], float(z["threshold"]), meta=meta)
