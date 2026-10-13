"""Treino real mínimo (perfil cpu_smoke) com a rede bloqueada. ~1–2 min em CPU."""

import json
import shutil

import pytest

pytest.importorskip("ultralytics")

from acg_vision.config import load_yaml, resolve  # noqa: E402
from acg_vision.offline import unblock_network  # noqa: E402

CACHE = resolve(load_yaml("resources.yaml")["cache_dir"])
need = pytest.mark.skipif(not (CACHE / "yolo11n.pt").exists()
                          or not resolve("data/prepared/medical_pills/data.yaml").exists()
                          or not resolve("data/prepared/pill_defects/units.json").exists(),
                          reason="rode fetch_resources.py e prepare_datasets.py")


@pytest.fixture(autouse=True)
def _net():
    yield
    unblock_network()


@need
def test_detect_finetune_smoke():
    from acg_vision.training.detect import finetune_stage_b
    m = finetune_stage_b("yolo11n", "cpu_smoke", name="pytest_smoke", overrides={"epochs": 1})
    try:
        assert m["best"]["sha256"] != m["initial_weights"]["sha256"]
        assert "resume" in m["resume_command"] and m["train_seconds"] > 0
        assert json.loads((resolve(m["run_dir"]) / "run_manifest.json").read_text())["seed"] == 0
    finally:
        shutil.rmtree(m["run_dir"], ignore_errors=True)


@need
def test_classify_one_louo_fold_smoke():
    from acg_vision.training.classify import louo_stage_b
    unit = "defect-s6-f2931-2946"
    r = louo_stage_b("cpu_smoke", [unit])
    try:
        assert [f["test_unit"] for f in r["folds"]] == [unit]
        assert len(r["predictions"]) == 16 and {p["unit_id"] for p in r["predictions"]} == {unit}
        assert r["folds"][0]["counts"]["test"] == {"defect": 16, "normal": 0}
    finally:
        shutil.rmtree(resolve("runs/classify/louo_cpu_smoke"), ignore_errors=True)
