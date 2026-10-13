"""Classificação normal × defeito (YOLO11-cls) no Pill-Defects.

NÃO é um detector: o dataset só tem rótulo por imagem. Não há caixas de defeito.

Etapa A: pesos ImageNet (yolo11n-cls.pt) não conhecem "normal/defeito"; registra-se
o que eles predizem (classes ImageNet) e a linha de base de classe majoritária.
Etapa B: ajuste fino com validação cruzada deixa-uma-unidade-física-de-fora (LOUO):
10 dobras, cada uma testada num comprimido nunca visto no treino.
"""

from __future__ import annotations

import shutil
from collections import Counter
from pathlib import Path
from typing import Any

from ..config import load_yaml, profile, resolve
from ..data import pill_defects
from ..offline import enable_offline, require, weight_path
from .common import Timer, environment, model_summary, set_seeds, weights_info, write_json


def _units() -> list[pill_defects.Unit]:
    res = load_yaml("resources.yaml")
    cfg = load_yaml("train_classify.yaml")
    raw = require(resolve(res["data_dir"]) / "pill_defects", "dataset Pill-Defects",
                  "python scripts/fetch_resources.py --only pill_defects")
    return pill_defects.group_units(raw, cfg["grouping"]["max_mae_same_unit"])


def reference_stage_a(out_dir: Path) -> dict[str, Any]:
    from ultralytics import YOLO
    enable_offline()
    cfg = load_yaml("train_classify.yaml")
    wfile = weight_path(cfg["model"])
    model = YOLO(str(wfile))
    units = _units()
    top1: dict[str, Counter] = {c: Counter() for c in pill_defects.CLASSES}
    with Timer() as t:
        n = 0
        for u in units:
            for p in u.images:
                r = model.predict(str(p), imgsz=224, verbose=False, device="cpu")[0]
                top1[u.label][model.names[int(r.probs.top1)]] += 1
                n += 1
    # linha de base: sempre prever a classe majoritária do treino (em LOUO, sempre "defect")
    tot = Counter(u.label for u in units for _ in u.images)
    rep = {
        "stage": "A_pretrained_reference", "weights": weights_info(wfile), "model": model_summary(model),
        "note": "pesos ImageNet não possuem classes normal/defeito; abaixo, top-1 ImageNet por classe real",
        "imagenet_top1_by_true_label": {c: dict(v.most_common(5)) for c, v in top1.items()},
        "majority_baseline": {"predict": "defect", "accuracy": tot["defect"] / sum(tot.values()),
                              "normal_recall": 0.0, "defect_recall": 1.0},
        "inference_ms_per_image": t.seconds * 1000 / max(n, 1), "environment": environment(),
    }
    write_json(out_dir / "stage_a_cls.json", rep)
    return rep


def _train_fold(fold_dir: Path, prof: dict[str, Any], seed: int, deterministic: bool, project: Path,
                name: str):  # type: ignore[no-untyped-def]
    from ultralytics import YOLO
    cfg = load_yaml("train_classify.yaml")
    model = YOLO(str(weight_path(cfg["model"])))
    with Timer() as t:
        model.train(data=str(fold_dir), project=str(project), name=name, exist_ok=True, seed=seed,
                    deterministic=deterministic, plots=False, verbose=False, amp=False, **prof)
    return Path(model.trainer.save_dir), t.seconds


def louo_stage_b(profile_name: str = "cpu_conservative", only_units: list[str] | None = None) -> dict[str, Any]:
    from ultralytics import YOLO
    enable_offline()
    cfg = load_yaml("train_classify.yaml")
    prof = profile(cfg, profile_name)
    set_seeds(cfg["seed"])
    units = _units()
    work = resolve(cfg["prepared_dir"]) / "folds"
    project = resolve(cfg["output_dir"]) / f"louo_{profile_name}"
    folds, predictions = [], []
    for u in units:
        if only_units and u.unit_id not in only_units:
            continue
        fold_dir = work / u.unit_id
        info = pill_defects.build_fold(units, u.unit_id, fold_dir)
        save_dir, secs = _train_fold(fold_dir, prof, cfg["seed"], cfg["deterministic"], project, u.unit_id)
        best = save_dir / "weights" / "best.pt"
        m = YOLO(str(best))
        names = [m.names[k] for k in sorted(m.names)]
        with Timer() as ti:
            for p in u.images:
                r = m.predict(str(p), imgsz=prof["imgsz"], verbose=False, device="cpu")[0]
                probs = r.probs.data.tolist()
                predictions.append({"image": f"{u.label}/{p.name}", "unit_id": u.unit_id, "true": u.label,
                                    "pred": names[int(r.probs.top1)],
                                    "p_defect": probs[names.index("defect")], "fold": u.unit_id})
        folds.append({**info, "run_dir": str(save_dir), "train_seconds": round(secs, 1),
                      "best": weights_info(best), "test_inference_ms_per_image": ti.seconds * 1000 / len(u.images)})
        shutil.rmtree(fold_dir, ignore_errors=True)
    rep = {"stage": "B_finetune_louo", "profile": profile_name, "params": prof, "seed": cfg["seed"],
           "initial_weights": weights_info(weight_path(cfg["model"])), "folds": folds,
           "predictions": predictions, "environment": environment()}
    write_json(project / "louo_results.json", rep)
    return rep


def train_final(profile_name: str = "cpu_conservative") -> dict[str, Any]:
    """Modelo final com TODAS as unidades (sem teste independente!) — usado só para a demonstração
    de inferência. Suas métricas válidas são as da LOUO, não as do próprio treino."""
    enable_offline()
    cfg = load_yaml("train_classify.yaml")
    prof = profile(cfg, profile_name)
    set_seeds(cfg["seed"])
    units = _units()
    fold_dir = resolve(cfg["prepared_dir"]) / "final_all_units"
    pill_defects.build_fold(units, "__none__", fold_dir)
    save_dir, secs = _train_fold(fold_dir, prof, cfg["seed"], cfg["deterministic"],
                                 resolve(cfg["output_dir"]), f"final_{profile_name}")
    man = {"stage": "B_final_all_units", "profile": profile_name, "params": prof, "run_dir": str(save_dir),
           "train_seconds": round(secs, 1), "best": weights_info(save_dir / "weights" / "best.pt"),
           "warning": "treinado com todas as 10 unidades; sem conjunto de teste independente",
           "environment": environment()}
    write_json(save_dir / "run_manifest.json", man)
    return man
