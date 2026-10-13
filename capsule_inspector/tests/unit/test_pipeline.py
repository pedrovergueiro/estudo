"""Pipeline completo com backend ONNX Runtime real e um modelo ONNX de saída conhecida."""

import socket
import time
from pathlib import Path

import numpy as np
import pytest
from conftest import SYNTH_NAMES, capsule_image, edit_yaml, make_constant_onnx

from capsule_inspector.inference.predictor import ModelLoadError, Predictor
from capsule_inspector.pipeline import InspectionPipeline
from capsule_inspector.registry import ModelRegistry
from capsule_inspector.storage.database import InspectionDB
from capsule_inspector.types import Frame
from capsule_inspector.types import InspectionStatus as S

IMGSZ = 320


def frame(img, view="diffuse"):
    return Frame(img, time.time(), 1, "test", view)


def _settings(project: Path, synth_settings, model: Path | None, validated: bool = False):
    if validated:
        edit_yaml(project / "configs" / "taxonomy.yaml", lambda d: [c.update({"validated": True}) for c in d["classes"]])
        edit_yaml(project / "configs" / "lighting_profiles.yaml",
                  lambda d: d["profiles"]["opaque_two_tone"].update({"validated": True}))
    s = synth_settings()
    if model is not None:
        s.inference.model.path_override = str(model)
    return s


@pytest.fixture()
def capsule_and_model(project: Path):
    img, labels = capsule_image(IMGSZ, 7)
    x1, y1, x2, y2 = labels[0][1]
    cx, cy, w, h = (x1 + x2) / 2, (y1 + y2) / 2, x2 - x1, y2 - y1
    good = make_constant_onnx(project / "good.onnx", SYNTH_NAMES, IMGSZ, [(0, 0.95, cx, cy, w, h)])
    bad = make_constant_onnx(project / "bad.onnx", SYNTH_NAMES, IMGSZ,
                             [(0, 0.95, cx, cy, w, h), (1, 0.88, cx, cy, 12, 12)])
    weak = make_constant_onnx(project / "weak.onnx", SYNTH_NAMES, IMGSZ,
                              [(0, 0.95, cx, cy, w, h), (2, 0.15, cx + 10, cy, 8, 8)])
    return img, labels, {"good": good, "bad": bad, "weak": weak}


def test_known_image_inference_and_coordinates(project, synth_settings, capsule_and_model):
    img, labels, models = capsule_and_model
    s = _settings(project, synth_settings, models["bad"])
    p = Predictor.from_settings(s)
    assert p.info.backend == "onnxruntime" and p.info.names == SYNTH_NAMES and not p.info.approved
    dets, t = p.predict(img)
    assert [d.class_name for d in dets] == ["capsule", "crack"]
    assert dets[0].box == pytest.approx(labels[0][1], abs=1.0)    # letterbox invertido corretamente
    assert set(t) == {"preprocess", "inference", "postprocess"}
    # imagem não quadrada: coordenadas continuam no espaço original
    wide = np.zeros((IMGSZ, IMGSZ * 2, 3), np.uint8)
    d2, _ = p.predict(wide)
    assert all(0 <= v <= IMGSZ * 2 for d in d2 for v in d.box)


def test_class_mismatch_rejected(project, synth_settings):
    m = make_constant_onnx(project / "x.onnx", ["capsule", "crack"], IMGSZ, [])
    s = _settings(project, synth_settings, m)
    with pytest.raises(ModelLoadError, match="classes"):
        Predictor.from_settings(s)


def test_imgsz_mismatch_rejected(project, synth_settings):
    m = make_constant_onnx(project / "y.onnx", SYNTH_NAMES, 160, [])
    s = _settings(project, synth_settings, m)
    with pytest.raises(ModelLoadError):
        Predictor.from_settings(s)


def test_pipeline_pass_fail_review(project, synth_settings, capsule_and_model):
    img, _, models = capsule_and_model
    out = {}
    for k, m in models.items():
        s = _settings(project, synth_settings, m, validated=True)
        s.decision.pass_requires.approved_model = False   # modelo de bancada (override)
        db = InspectionDB(s.path(s.system.storage.database))
        r = InspectionPipeline(s, db=db).inspect([frame(img)], lot_id="L1")
        out[k] = r
        stored = db.get(r.record.inspection_id)
        assert stored["status"] == r.record.status and stored["lot_id"] == "L1"
        assert stored["model"]["sha256"] and stored["config"]["hash"] == s.inspection_config_hash()
        assert (s.path(s.system.storage.images_dir) / stored["images"]["annotated"]).exists()
        assert {"quality", "preprocess", "inference", "decision", "total"} <= set(stored["timings_ms"])
    assert out["good"].status == S.PASS
    assert out["bad"].status == S.FAIL
    assert out["weak"].status == S.REVIEW      # 0.15 em [0.10, 0.45) para 'hole'


def test_unvalidated_system_never_passes(project, synth_settings, capsule_and_model):
    img, _, models = capsule_and_model
    s = _settings(project, synth_settings, models["good"])
    r = InspectionPipeline(s).inspect([frame(img)], persist=False)
    assert r.status == S.REVIEW and any("PASS_BLOCKED" in x for x in r.record.reasons)


def test_missing_model_is_system_error(project, synth_settings):
    s = _settings(project, synth_settings, None)     # registro vazio
    pipe = InspectionPipeline(s)
    assert not pipe.ready
    img, _ = capsule_image(IMGSZ, 1)
    r = pipe.inspect([frame(img)], persist=False)
    assert r.status == S.SYSTEM_ERROR and "nenhum modelo ativo" in r.record.error


@pytest.mark.parametrize("bad_frame", ["empty", "none", "nothing", "capture_error"])
def test_bad_inputs_are_system_error(project, synth_settings, capsule_and_model, bad_frame):
    _, _, models = capsule_and_model
    s = _settings(project, synth_settings, models["good"], validated=True)
    pipe = InspectionPipeline(s)
    kw = {}
    frames = {"empty": [frame(np.zeros((0, 0, 3), np.uint8))], "none": [frame(None)], "nothing": [],
              "capture_error": []}[bad_frame]
    if bad_frame == "capture_error":
        kw["capture_error"] = "câmera desconectada"
    r = pipe.inspect(frames, persist=False, **kw)
    assert r.status == S.SYSTEM_ERROR


def test_backend_exception_is_system_error(project, synth_settings, capsule_and_model, monkeypatch):
    img, _, models = capsule_and_model
    s = _settings(project, synth_settings, models["good"], validated=True)
    pipe = InspectionPipeline(s)

    def boom(*a, **k):
        raise MemoryError("sem memória")
    monkeypatch.setattr(pipe.predictor.backend, "predict", boom)
    r = pipe.inspect([frame(img)], persist=False)
    assert r.status == S.SYSTEM_ERROR and "MemoryError" in r.record.error


def test_invalid_model_coordinates_are_system_error(project, synth_settings, capsule_and_model, monkeypatch):
    img, _, models = capsule_and_model
    s = _settings(project, synth_settings, models["good"], validated=True)
    pipe = InspectionPipeline(s)
    from capsule_inspector.types import Detection
    monkeypatch.setattr(pipe.predictor.backend, "predict",
                        lambda x: ([Detection(0, "capsule", 0.9, (0, 0, float("nan"), 5))], {}))
    assert pipe.inspect([frame(img)], persist=False).status == S.SYSTEM_ERROR


def test_storage_failure_is_system_error(project, synth_settings, capsule_and_model, monkeypatch):
    img, _, models = capsule_and_model
    s = _settings(project, synth_settings, models["good"], validated=True)
    s.decision.pass_requires.approved_model = False
    db = InspectionDB(s.path(s.system.storage.database))
    pipe = InspectionPipeline(s, db=db)
    monkeypatch.setattr("capsule_inspector.pipeline.free_disk_gb", lambda p: 0.1)
    r = pipe.inspect([frame(img)])
    assert r.status == S.SYSTEM_ERROR and "armazenamento" in " ".join(r.record.reasons)
    assert pipe.fallback_path.exists()      # registro preservado em spool local
    assert db.recent(10) == []


def test_runs_offline(project, synth_settings, capsule_and_model, monkeypatch):
    """Inferência local não pode depender de rede: qualquer conexão falha o teste."""
    img, _, models = capsule_and_model

    def no_net(*a, **k):
        raise AssertionError("tentativa de acesso à rede durante a inspeção")
    monkeypatch.setattr(socket.socket, "connect", no_net)
    monkeypatch.setattr(socket, "create_connection", no_net)
    s = _settings(project, synth_settings, models["bad"])
    db = InspectionDB(s.path(s.system.storage.database))
    r = InspectionPipeline(s, db=db).inspect([frame(img)])
    assert r.status == S.FAIL


def test_registry_load_and_multi_view_late_union(project, synth_settings, capsule_and_model):
    img, _, models = capsule_and_model
    reg_dir = project / "models" / "registry_synthetic"
    reg = ModelRegistry(reg_dir)
    m = reg.register(models["bad"], "const-v1", {"class_names": SYNTH_NAMES, "imgsz": IMGSZ, "task": "detect",
                                                "format": "onnx"})
    rep = project / "eval.json"
    rep.write_text(f'{{"regression": {{"passed": true}}, "model_sha256": "{m["sha256"]}"}}')
    reg.approve("const-v1", "qa", rep)
    reg.activate("const-v1", "qa")
    edit_yaml(project / "configs" / "lighting_profiles.yaml",
              lambda d: d["profiles"]["opaque_two_tone"].update({"fusion": {"mode": "late_union"}}) or
              d["profiles"]["opaque_two_tone"]["acquisition"]["steps"].append(
                  {"name": "backlight", "kind": "backlight", "light": "bl"}))
    s = _settings(project, synth_settings, None)
    pipe = InspectionPipeline(s)
    assert pipe.predictor.info.approved and pipe.predictor.info.model_id == "const-v1"
    r = pipe.inspect([frame(img, "diffuse"), frame(img, "backlight")], persist=False)
    assert r.status == S.FAIL
    # detecções idênticas nas duas vistas foram unidas (NMS), não duplicadas
    assert len(r.record.detections) == 2
    # perfil exige 2 vistas: só uma => SYSTEM_ERROR
    assert pipe.inspect([frame(img)], persist=False).status == S.SYSTEM_ERROR
