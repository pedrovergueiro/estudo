from __future__ import annotations

import shutil
import sys
from pathlib import Path

import numpy as np
import pytest
import yaml

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from capsule_inspector.config import load_settings  # noqa: E402

SYNTH_NAMES = ["capsule", "crack", "hole", "stain", "scratch", "foreign_particle"]


@pytest.fixture()
def project(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Cópia isolada do projeto (configs + overlay sintético) num diretório temporário."""
    monkeypatch.delenv("CAPSULE_CONFIG_OVERLAY", raising=False)
    monkeypatch.delenv("CAPSULE_INSPECTOR_ROOT", raising=False)
    shutil.copytree(ROOT / "configs", tmp_path / "configs")
    (tmp_path / "pyproject.toml").write_text("[project]\nname='t'\n")
    return tmp_path


def edit_yaml(path: Path, fn) -> None:
    d = yaml.safe_load(path.read_text(encoding="utf-8"))
    fn(d)
    path.write_text(yaml.safe_dump(d, sort_keys=False, allow_unicode=True), encoding="utf-8")


@pytest.fixture()
def synth_settings(project: Path):
    """Settings com overlay sintético aplicado diretamente em configs/ (cópia)."""
    ov = project / "configs" / "examples" / "synthetic"
    for f in ov.glob("*.yaml"):
        shutil.copy2(f, project / "configs" / f.name)
    return lambda: load_settings(root=project)


@pytest.fixture()
def small_dataset(project: Path, synth_settings):
    from capsule_inspector.dataset.synthetic import generate_dataset
    s = synth_settings()
    root = generate_dataset(s.path(s.dataset.working_dataset.root), SYNTH_NAMES, n_units=24,
                            views_per_unit=2, size=160, seed=1)
    return root


def make_constant_onnx(path: Path, names: list[str], imgsz: int, dets: list[tuple[int, float, float, float, float, float]],
                       n_anchors: int = 50) -> Path:
    """ONNX que ignora a imagem e devolve saída YOLO fixa.

    dets: (classe, conf, cx, cy, w, h) em pixels da ENTRADA (letterbox).
    Permite testar backend ORT + decodificação + pipeline com resultado conhecido.
    """
    onnx = pytest.importorskip("onnx")
    from onnx import TensorProto, helper, numpy_helper

    nc = len(names)
    out = np.zeros((1, 4 + nc, n_anchors), np.float32)
    for k, (c, conf, cx, cy, w, h) in enumerate(dets):
        out[0, :4, k] = [cx, cy, w, h]
        out[0, 4 + c, k] = conf
    const = numpy_helper.from_array(out, "const_out")
    zero = numpy_helper.from_array(np.zeros((1,), np.float32), "zero")
    nodes = [
        helper.make_node("ReduceMean", ["images"], ["m"], keepdims=0),
        helper.make_node("Mul", ["m", "zero"], ["mz"]),
        helper.make_node("Add", ["const_out", "mz"], ["output0"]),
    ]
    graph = helper.make_graph(nodes, "const_yolo",
                              [helper.make_tensor_value_info("images", TensorProto.FLOAT, [1, 3, imgsz, imgsz])],
                              [helper.make_tensor_value_info("output0", TensorProto.FLOAT, [1, 4 + nc, n_anchors])],
                              [const, zero])
    model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 17)])
    model.ir_version = 8
    for k, v in {"names": str({i: n for i, n in enumerate(names)}), "imgsz": str([imgsz, imgsz]),
                 "task": "detect", "stride": "32"}.items():
        model.metadata_props.add(key=k, value=v)
    onnx.save(model, str(path))
    return path


def capsule_image(size: int = 320, seed: int = 0, defects: list[str] | None = None):
    from capsule_inspector.dataset.synthetic import render_capsule
    return render_capsule(np.random.default_rng(seed), size, "opaque", "red_white", "diffuse", defects or [])
