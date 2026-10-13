"""Treinamento reprodutível YOLO11 (Ultralytics) — executar na estação de treinamento."""

from __future__ import annotations

import csv
import datetime as _dt
import json
import os
import random
from pathlib import Path
from typing import Any

import numpy as np
import yaml

from ..config import ConfigError, Settings, canonical_hash
from ..dataset.hashing import file_sha256
from ..monitoring.hardware import platform_report

# Chaves que o usuário não pode sobrescrever via `hyperparameters` (controladas pelo pipeline)
RESERVED = {"data", "project", "name", "seed", "deterministic", "device", "workers", "exist_ok"}


def set_seeds(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    os.environ["PYTHONHASHSEED"] = str(seed)
    try:
        import torch
        torch.manual_seed(seed)
    except ImportError:
        pass


def check_data_yaml(data_yaml: Path, expected_names: list[str]) -> dict[str, Any]:
    if not data_yaml.exists():
        raise ConfigError(f"{data_yaml} inexistente: rode scripts/validate_dataset.py --split primeiro")
    d = yaml.safe_load(data_yaml.read_text(encoding="utf-8"))
    names = d.get("names")
    names = [names[k] for k in sorted(names)] if isinstance(names, dict) else list(names or [])
    if names != expected_names:
        raise ConfigError(f"data.yaml names={names} difere da taxonomia {expected_names}")
    for s in ("train", "val"):
        p = Path(d[s]) if Path(d[s]).is_absolute() else Path(d.get("path", ".")) / d[s]
        if not p.exists() or (p.is_file() and not p.read_text().strip()):
            raise ConfigError(f"split '{s}' vazio ou inexistente: {p}")
    return d


def _resolve_weights(model: str, save_dir: Path) -> dict[str, Any]:
    """Identifica os pesos iniciais (nome + SHA-256 do arquivo efetivamente usado)."""
    info: dict[str, Any] = {"name": model}
    for cand in (Path(model), Path.cwd() / model, save_dir / model):
        if cand.exists() and cand.is_file():
            info["path"] = str(cand.resolve())
            info["sha256"] = file_sha256(cand)
            break
    if model.endswith(".yaml"):
        info["note"] = "arquitetura do zero (sem pesos pré-treinados)"
    return info


def train(settings: Settings, experiment: str | None = None, data_yaml: Path | None = None,
          overrides: dict[str, Any] | None = None) -> dict[str, Any]:
    cfg = settings.train.with_experiment(experiment)
    hp = dict(cfg.hyperparameters)
    hp.update(overrides or {})
    bad = RESERVED & set(hp)
    if bad:
        raise ConfigError(f"hiperparâmetros reservados não podem ser sobrescritos: {sorted(bad)}")
    names = settings.taxonomy.training_names()
    data_yaml = Path(data_yaml or settings.path(settings.dataset.paths["splits"]) / "data.yaml")
    data = check_data_yaml(data_yaml, names)
    if cfg.task == "segment" and settings.dataset.working_dataset.task != "segment":
        raise ConfigError("modelo de segmentação exige dataset com máscaras (working_dataset.task: segment)")
    set_seeds(cfg.seed)

    import ultralytics
    from ultralytics import YOLO

    project = settings.path(cfg.project)
    stamp = _dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    run_name = f"{cfg.name}-{stamp}"
    model = YOLO(cfg.model, task=cfg.task)
    results = model.train(data=str(data_yaml), project=str(project), name=run_name, exist_ok=False,
                          seed=cfg.seed, deterministic=cfg.deterministic, device=cfg.device,
                          workers=cfg.workers, verbose=False, plots=True, **hp)
    save_dir = Path(model.trainer.save_dir)
    best = save_dir / "weights" / "best.pt"
    if not best.exists():
        raise RuntimeError(f"treino terminou sem best.pt em {save_dir}")
    split_manifest = Path(data_yaml).parent / "split_manifest.json"
    metrics = {k: float(v) for k, v in (getattr(results, "results_dict", {}) or {}).items()}
    manifest = {
        "experiment": experiment or "baseline", "run_dir": str(save_dir), "created_at": stamp,
        "task": cfg.task, "class_names": names, "taxonomy_version": settings.taxonomy.taxonomy_version,
        "initial_weights": _resolve_weights(cfg.model, save_dir),
        "best_checkpoint": {"path": str(best), "sha256": file_sha256(best)},
        "hyperparameters": hp, "seed": cfg.seed, "deterministic": cfg.deterministic,
        "train_config_hash": canonical_hash(cfg.model_dump(mode="json")),
        "data_yaml": {"path": str(data_yaml), "sha256": file_sha256(data_yaml)},
        "split_manifest_sha256": file_sha256(split_manifest) if split_manifest.exists() else None,
        "dataset_version": settings.dataset.dataset_version,
        "val_metrics_best": metrics,
        "ultralytics_version": ultralytics.__version__,
        "environment": platform_report(),
        "note": "Métricas de validação usadas para seleção do checkpoint; NÃO são métricas finais. "
                "Avalie no split de teste com scripts/evaluate_model.py.",
        "data_root": data.get("path"),
    }
    (save_dir / "experiment_manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False,
                                                                  default=str), encoding="utf-8")
    _append_experiment_log(settings.path("reports") / "experiments.csv", manifest)
    return manifest


def _append_experiment_log(path: Path, m: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    new = not path.exists()
    vm = m["val_metrics_best"]
    row = {"created_at": m["created_at"], "experiment": m["experiment"], "model": m["initial_weights"]["name"],
           "task": m["task"], "imgsz": m["hyperparameters"].get("imgsz"),
           "epochs": m["hyperparameters"].get("epochs"),
           "val_map50": vm.get("metrics/mAP50(B)"), "val_map50_95": vm.get("metrics/mAP50-95(B)"),
           "val_precision": vm.get("metrics/precision(B)"), "val_recall": vm.get("metrics/recall(B)"),
           "best_sha256": m["best_checkpoint"]["sha256"][:16], "run_dir": m["run_dir"]}
    with open(path, "a", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(row))
        if new:
            w.writeheader()
        w.writerow(row)
