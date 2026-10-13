"""Interfaces para três vistas da mesma cápsula.

O que se sabe: haverá três vistas. O que NÃO se sabe: posição/ângulo das câmeras,
sincronização, disparo, iluminação. Portanto:
- cada imagem preserva `view_id` (e `camera_id`, quando houver);
- imagens só são associadas a uma mesma cápsula por identificador EXPLÍCITO
  (`capsule_id` ou `trigger_id`). Associação por horário fica desligada até existir
  evidência de sincronização (tolerância medida);
- não há fusão geométrica: a fusão combina evidências por vista com regra conservadora.
"""

from __future__ import annotations

import csv
from abc import ABC, abstractmethod
from collections.abc import Callable
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class ViewImage:
    view_id: str
    path: Path
    capsule_id: str | None = None
    trigger_id: str | None = None
    timestamp_ms: float | None = None
    camera_id: str | None = None


class ImageSource(ABC):
    @abstractmethod
    def images(self) -> list[ViewImage]: ...


class LocalManifestSource(ImageSource):
    """CSV com colunas: path, view_id e (capsule_id e/ou trigger_id); opcionais timestamp_ms, camera_id."""

    def __init__(self, manifest: Path):
        self.manifest = Path(manifest)

    def images(self) -> list[ViewImage]:
        out = []
        with open(self.manifest, newline="", encoding="utf-8") as fh:
            for row in csv.DictReader(fh):
                if not row.get("path") or not row.get("view_id"):
                    raise ValueError(f"{self.manifest}: cada linha precisa de path e view_id")
                p = Path(row["path"])
                if not p.is_absolute():
                    p = self.manifest.parent / p
                ts = row.get("timestamp_ms")
                out.append(ViewImage(row["view_id"], p, row.get("capsule_id") or None, row.get("trigger_id") or None,
                                     float(ts) if ts else None, row.get("camera_id") or None))
        return out


class CameraSource(ImageSource):
    """Fonte futura de câmera real. Intencionalmente não implementada: modelo da câmera,
    interface (USB/GigE/CSI), disparo e sincronização ainda não foram informados."""

    def __init__(self, view_id: str, **params: Any):
        self.view_id, self.params = view_id, params

    def images(self) -> list[ViewImage]:
        raise NotImplementedError("CameraSource: hardware de aquisição ainda não definido — use LocalManifestSource")


@dataclass
class Association:
    groups: dict[str, list[ViewImage]] = field(default_factory=dict)
    unassociated: list[ViewImage] = field(default_factory=list)
    method: str = "explicit_id"


def associate(images: list[ViewImage], allow_timestamp: bool = False,
              tolerance_ms: float | None = None) -> Association:
    a = Association()
    loose: list[ViewImage] = []
    for im in images:
        key = f"capsule:{im.capsule_id}" if im.capsule_id else (f"trigger:{im.trigger_id}" if im.trigger_id else None)
        if key:
            a.groups.setdefault(key, []).append(im)
        else:
            loose.append(im)
    if allow_timestamp:
        if tolerance_ms is None:
            raise ValueError("associação por horário exige tolerância medida (timestamp_tolerance_ms)")
        loose.sort(key=lambda x: (x.timestamp_ms is None, x.timestamp_ms or 0))
        cur: list[ViewImage] = []
        for im in loose:
            if im.timestamp_ms is None:
                a.unassociated.append(im)
                continue
            if cur and (im.timestamp_ms - cur[0].timestamp_ms > tolerance_ms or im.view_id in {c.view_id for c in cur}):
                a.groups[f"time:{cur[0].timestamp_ms:.0f}"] = cur
                cur = []
            cur.append(im)
        if cur:
            a.groups[f"time:{cur[0].timestamp_ms:.0f}"] = cur
        a.method = "explicit_id+timestamp"
    else:
        a.unassociated.extend(loose)
    return a


def defect_evidence(result: dict[str, Any]) -> float | None:
    """Probabilidade de defeito de UMA vista, se o modelo produzir esse tipo de evidência."""
    if result.get("status") != "OK":
        return None
    cls = result.get("classification")
    if cls and "defect" in cls["probabilities"]:
        return float(cls["probabilities"]["defect"])
    return None  # detector de localização ("pill") não fornece evidência de defeito


def fuse(capsule_key: str, views: list[ViewImage], results: list[dict[str, Any]], required_views: list[str],
         threshold: float = 0.5, evidence: Callable[[dict[str, Any]], float | None] = defect_evidence
         ) -> dict[str, Any]:
    per_view = []
    reasons = []
    seen = {}
    for v, r in zip(views, results):
        if v.view_id in seen:
            reasons.append(f"vista {v.view_id} duplicada")
        seen[v.view_id] = r
        per_view.append({"view_id": v.view_id, "camera_id": v.camera_id, "source": str(v.path),
                         "status": r.get("status"), "p_defect": evidence(r)})
    missing = [vid for vid in required_views if vid not in seen]
    if missing:
        reasons.append(f"vistas ausentes: {missing}")
    scores = [p["p_defect"] for p in per_view]
    if any(s is None for s in scores):
        reasons.append("vista sem evidência de defeito válida (erro ou modelo sem saída de defeito)")
    flagged = [p["view_id"] for p in per_view if p["p_defect"] is not None and p["p_defect"] >= threshold]
    if flagged:
        decision = "DEFECT_SUSPECTED"
        reasons.append(f"defeito acima do limiar nas vistas {flagged}")
    elif reasons:
        decision = "INCONCLUSIVE"
    else:
        decision = "NO_DEFECT_OBSERVED"  # não é aprovação: modelo não validado
    return {"capsule": capsule_key, "decision": decision, "reasons": reasons, "threshold": threshold,
            "views": per_view}
