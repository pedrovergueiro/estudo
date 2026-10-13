"""Integração real: treino YOLO11 mínimo → exportação ONNX → paridade de inferência
PyTorch × ONNX Runtime → quantização INT8 → avaliação → serviço de inspeção.

Exige ultralytics + torch (requirements/training.txt). O treino parte de
`yolo11n.yaml` (sem download de pesos), para rodar sem internet. O modelo
resultante NÃO tem qualidade — o objetivo é verificar o encadeamento do código.
"""

import json
import shutil
from pathlib import Path

import numpy as np
import pytest

pytest.importorskip("ultralytics")
pytest.importorskip("torch")
pytestmark = pytest.mark.slow

from conftest import SYNTH_NAMES, edit_yaml  # noqa: E402

from capsule_inspector.config import load_settings  # noqa: E402
from capsule_inspector.dataset.metadata import load_metadata  # noqa: E402
from capsule_inspector.dataset.split import group_aware_split, write_split  # noqa: E402
from capsule_inspector.dataset.synthetic import generate_dataset  # noqa: E402
from capsule_inspector.inference.backends import create_backend  # noqa: E402
from capsule_inspector.inference.postprocess import box_iou  # noqa: E402

IMGSZ = 160


@pytest.fixture(scope="module")
def trained(tmp_path_factory):
    root = tmp_path_factory.mktemp("proj")
    src = Path(__file__).resolve().parents[2]
    shutil.copytree(src / "configs", root / "configs")
    for f in (root / "configs" / "examples" / "synthetic").glob("*.yaml"):
        shutil.copy2(f, root / "configs" / f.name)
    (root / "pyproject.toml").write_text("[project]\nname='t'\n")
    edit_yaml(root / "configs" / "inference.yaml", lambda d: d["model"].update({"imgsz": IMGSZ}))
    edit_yaml(root / "configs" / "train.yaml", lambda d: d.update({"model": "yolo11n.yaml", "workers": 0}) or
              d["hyperparameters"].update({"epochs": 2, "imgsz": IMGSZ, "batch": 8, "patience": 5}))
    s = load_settings(root=root)
    ds = generate_dataset(s.path(s.dataset.working_dataset.root), SYNTH_NAMES, n_units=30, views_per_unit=1,
                          size=IMGSZ, seed=2)
    res = group_aware_split(ds, SYNTH_NAMES, s.dataset.split, load_metadata(ds / "metadata.csv", ds))
    write_split(res, ds, s.path(s.dataset.paths["splits"]), SYNTH_NAMES, 0)
    from capsule_inspector.training.train import train
    manifest = train(s)
    return s, manifest


def test_training_manifest(trained):
    s, m = trained
    assert Path(m["best_checkpoint"]["path"]).exists()
    assert m["class_names"] == SYNTH_NAMES and m["seed"] == s.train.seed
    assert len(m["best_checkpoint"]["sha256"]) == 64
    assert "ultralytics" in m["environment"]["libraries"]
    assert (s.path("reports") / "experiments.csv").exists()


@pytest.fixture(scope="module")
def exported(trained):
    s, m = trained
    from capsule_inspector.training.export import export_model
    path, info = export_model(Path(m["best_checkpoint"]["path"]), s.path("models/export"), IMGSZ)
    return s, m, path, info


def test_export_and_reload(exported):
    s, _, path, info = exported
    assert path.exists() and path.with_suffix(".manifest.json").exists()
    assert info["class_names"] == SYNTH_NAMES and info["imgsz"] == IMGSZ
    be = create_backend("onnxruntime", path, imgsz=IMGSZ, names=SYNTH_NAMES)
    assert be.names == SYNTH_NAMES and be.task == "detect"


def _imgs(s, n=6):
    import cv2
    paths = [Path(p) for p in (s.path(s.dataset.paths["splits"]) / "val.txt").read_text().split()][:n]
    return [cv2.imread(str(p)) for p in paths]


def test_pytorch_onnx_parity(exported):
    """As detecções do ONNX Runtime (pré/pós próprios) devem coincidir com as da Ultralytics."""
    s, m, path, _ = exported
    pt = create_backend("ultralytics", Path(m["best_checkpoint"]["path"]), imgsz=IMGSZ, names=SYNTH_NAMES,
                        conf=0.001, iou=0.5, max_det=10)
    ox = create_backend("onnxruntime", path, imgsz=IMGSZ, names=SYNTH_NAMES, conf=0.001, iou=0.5, max_det=10)
    compared = 0
    for img in _imgs(s):
        a, _ = pt.predict(img)
        b, _ = ox.predict(img)
        for d in a[:5]:
            cands = [x for x in b if x.class_id == d.class_id]
            assert cands, f"detecção {d.class_name} {d.confidence:.3f} ausente no ONNX"
            ious = box_iou(np.array([d.box]), np.array([x.box for x in cands]))[0]
            j = int(ious.argmax())
            assert ious[j] > 0.9 and abs(cands[j].confidence - d.confidence) < 0.02
            compared += 1
    assert compared > 0, "modelo não produziu nenhuma detecção para comparar"


def test_int8_quantization_runs_and_is_comparable(exported):
    pytest.importorskip("onnx")
    s, _, path, _ = exported
    from capsule_inspector.training.export import quantize_int8
    calib = [Path(p) for p in (s.path(s.dataset.paths["splits"]) / "train.txt").read_text().split()][:20]
    q, info = quantize_int8(path, calib, path.with_name("q_int8.onnx"), IMGSZ)
    assert info["quantization"]["type"] == "int8_static_qdq" and info["quantization"]["excluded_nodes"]
    be = create_backend("onnxruntime", q, imgsz=IMGSZ, names=SYNTH_NAMES)   # metadados preservados
    dets, t = be.predict(_imgs(s, 1)[0])
    assert t["inference"] > 0


def test_evaluation_report(exported):
    s, _, path, _ = exported
    from capsule_inspector.training.evaluate import build_report, collect_predictions, write_report
    be = create_backend("onnxruntime", path, imgsz=IMGSZ, names=SYNTH_NAMES)
    root = s.path(s.dataset.working_dataset.root)
    paths = [Path(p) for p in (s.path(s.dataset.paths["splits"]) / "test.txt").read_text().split()]
    ims = collect_predictions(lambda x: be.predict(x)[0], paths, root, load_metadata(root / "metadata.csv", root))
    rep = build_report(ims, s, SYNTH_NAMES, {"model_id": "t", "backend": "onnxruntime", "sha256": "x"}, "test")
    out = write_report(rep, ims, s, s.path("reports/eval_t"))
    assert out["markdown"].exists() and out["confusion"].exists()
    assert rep["strata"]["finish"]["opaque"]["status"] == "NOT_VALIDATED"   # poucos dados => não validado
    assert "CONJUNTO SINTÉTICO" in " ".join(rep["warnings"])


def test_benchmark_runs(exported):
    s, _, path, _ = exported
    from capsule_inspector.monitoring.benchmark import bench_config, write_benchmark
    r = bench_config(path, "onnxruntime", IMGSZ, SYNTH_NAMES, _imgs(s, 3), warmup=2, iterations=5)
    assert r["iterations"] == 5 and r["latency_ms"]["inference"]["p50"] > 0 and r["model_size_mb"] > 0
    md = write_benchmark([r], s.path("reports/bench"))
    assert "NÃO são de um Raspberry Pi" in md.read_text() or "Raspberry" in md.read_text()


def test_service_loop_on_files(exported):
    s, _, path, _ = exported
    from capsule_inspector.runtime import InspectionService
    s.camera.type = "file"
    s.camera.file.path = str(s.path(s.dataset.working_dataset.root) / "images")
    s.camera.file.pattern = "*.png"
    s.system.integration.trigger.type = "none"
    svc = InspectionService(s, model_path=str(path), console_log=False)
    n = svc.run(max_inspections=4)
    assert n == 4
    st = json.loads(s.path(s.system.storage.status_file).read_text())
    assert st["model_ready"] and st["stats"]["count"] == 4
    from capsule_inspector.storage.database import InspectionDB
    rows = InspectionDB(s.path(s.system.storage.database)).recent(10)
    assert len(rows) == 4
    assert all(r["status"] in ("PASS", "FAIL", "REVIEW") for r in rows)     # nunca PASS sem validação:
    assert not any(r["status"] == "PASS" for r in rows)
