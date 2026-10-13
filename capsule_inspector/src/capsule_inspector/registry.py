"""Registro de modelos com aprovação explícita e rollback.

Ciclo de vida: candidate -> approved -> (active) -> retired.

- `register` copia o artefato para models/registry/<model_id>/ e grava o
  manifesto com SHA-256. Um modelo registrado é sempre `candidate`.
- `approve` exige o nome de quem aprova e um relatório de avaliação cujo
  bloco `regression.passed` seja verdadeiro (teste de regressão contra o
  modelo ativo no mesmo conjunto de teste).
- `activate` só aceita modelos aprovados e guarda o anterior para `rollback`.
- A inferência carrega somente o modelo de active.json e confere o SHA-256.
Nenhuma rotina automática altera active.json.
"""

from __future__ import annotations

import datetime as _dt
import hashlib
import json
import os
import shutil
from pathlib import Path
from typing import Any


class RegistryError(RuntimeError):
    pass


def sha256_path(path: Path) -> str:
    """SHA-256 de um arquivo ou de um diretório (ex.: modelo NCNN), determinístico."""
    path = Path(path)
    h = hashlib.sha256()
    files = [path] if path.is_file() else sorted(p for p in path.rglob("*") if p.is_file())
    if not files:
        raise RegistryError(f"artefato inexistente ou vazio: {path}")
    for f in files:
        if path.is_dir():
            h.update(f.relative_to(path).as_posix().encode())
        with open(f, "rb") as fh:
            for chunk in iter(lambda: fh.read(1 << 20), b""):
                h.update(chunk)
    return h.hexdigest()


def _now() -> str:
    return _dt.datetime.now(_dt.UTC).isoformat(timespec="seconds")


def _atomic_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.flush()
        os.fsync(fh.fileno())
    os.replace(tmp, path)


class ModelRegistry:
    def __init__(self, root: Path):
        self.root = Path(root)

    # ---------------------------------------------------------------- leitura
    def manifest_path(self, model_id: str) -> Path:
        return self.root / model_id / "manifest.json"

    def manifest(self, model_id: str) -> dict[str, Any]:
        p = self.manifest_path(model_id)
        if not p.exists():
            raise RegistryError(f"modelo não registrado: {model_id}")
        return json.loads(p.read_text(encoding="utf-8"))

    def list(self) -> list[dict[str, Any]]:
        if not self.root.exists():
            return []
        out = []
        for d in sorted(self.root.iterdir()):
            if (d / "manifest.json").exists():
                out.append(json.loads((d / "manifest.json").read_text(encoding="utf-8")))
        return out

    def active(self) -> dict[str, Any] | None:
        p = self.root / "active.json"
        if not p.exists():
            return None
        return json.loads(p.read_text(encoding="utf-8"))

    def artifact_path(self, model_id: str) -> Path:
        m = self.manifest(model_id)
        return self.root / model_id / m["file"]

    def verify(self, model_id: str) -> Path:
        m = self.manifest(model_id)
        p = self.root / model_id / m["file"]
        actual = sha256_path(p)
        if actual != m["sha256"]:
            raise RegistryError(f"SHA-256 divergente para {model_id}: arquivo alterado ou corrompido")
        return p

    # ---------------------------------------------------------------- escrita
    def register(self, artifact: Path, model_id: str, info: dict[str, Any]) -> dict[str, Any]:
        artifact = Path(artifact)
        if not artifact.exists():
            raise RegistryError(f"artefato não encontrado: {artifact}")
        dest_dir = self.root / model_id
        if dest_dir.exists():
            raise RegistryError(f"model_id já existe (registros são imutáveis): {model_id}")
        required = {"class_names", "imgsz", "task", "format"}
        missing = required - set(info)
        if missing:
            raise RegistryError(f"manifesto incompleto, faltam: {sorted(missing)}")
        dest_dir.mkdir(parents=True)
        dest = dest_dir / artifact.name
        if artifact.is_dir():
            shutil.copytree(artifact, dest)
        else:
            shutil.copy2(artifact, dest)
        manifest = {
            "model_id": model_id, "file": artifact.name, "sha256": sha256_path(dest),
            "registered_at": _now(), "status": "candidate", "approvals": [], **info,
        }
        _atomic_json(dest_dir / "manifest.json", manifest)
        return manifest

    def approve(self, model_id: str, approved_by: str, evaluation_report: Path, note: str = "") -> dict[str, Any]:
        if not approved_by.strip():
            raise RegistryError("aprovação exige identificação do responsável")
        m = self.manifest(model_id)
        self.verify(model_id)
        rep = json.loads(Path(evaluation_report).read_text(encoding="utf-8"))
        reg = rep.get("regression")
        if not isinstance(reg, dict) or reg.get("passed") is not True:
            raise RegistryError("relatório sem regressão aprovada (regression.passed != true); "
                                "rode scripts/evaluate_model.py --reference ...")
        if rep.get("model_sha256") and rep["model_sha256"] != m["sha256"]:
            raise RegistryError("o relatório de avaliação não corresponde a este artefato (SHA-256)")
        m["status"] = "approved"
        m["approvals"].append({"by": approved_by, "at": _now(), "note": note,
                               "evaluation_report": str(evaluation_report),
                               "evaluation_sha256": sha256_path(Path(evaluation_report))})
        _atomic_json(self.manifest_path(model_id), m)
        return m

    def activate(self, model_id: str, activated_by: str) -> dict[str, Any]:
        m = self.manifest(model_id)
        if m.get("status") != "approved":
            raise RegistryError(f"{model_id} não está aprovado (status={m.get('status')})")
        self.verify(model_id)
        cur = self.active()
        history = list(cur.get("history", [])) if cur else []
        if cur:
            history.append({k: cur[k] for k in ("model_id", "sha256", "activated_at", "activated_by")})
        data = {"model_id": model_id, "sha256": m["sha256"], "activated_at": _now(),
                "activated_by": activated_by, "history": history[-20:]}
        _atomic_json(self.root / "active.json", data)
        return data

    def rollback(self, activated_by: str) -> dict[str, Any]:
        cur = self.active()
        if not cur or not cur.get("history"):
            raise RegistryError("não há versão anterior para rollback")
        prev = cur["history"][-1]
        self.verify(prev["model_id"])
        data = {"model_id": prev["model_id"], "sha256": prev["sha256"], "activated_at": _now(),
                "activated_by": activated_by, "rollback_from": cur["model_id"],
                "history": cur["history"][:-1]}
        _atomic_json(self.root / "active.json", data)
        return data

    def resolve_active(self) -> tuple[Path, dict[str, Any]]:
        """Caminho verificado e manifesto do modelo ativo."""
        cur = self.active()
        if not cur:
            raise RegistryError(f"nenhum modelo ativo em {self.root / 'active.json'}")
        m = self.manifest(cur["model_id"])
        if m["sha256"] != cur["sha256"]:
            raise RegistryError("active.json e manifesto divergem no SHA-256")
        return self.verify(cur["model_id"]), m
