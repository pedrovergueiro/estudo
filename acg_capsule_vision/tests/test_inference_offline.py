"""Inferência real (pesos e imagens obtidos por fetch_resources.py) com rede bloqueada."""

import json
import socket

import pytest

pytest.importorskip("ultralytics")

from acg_vision import MODEL_PROVENANCE_TAG  # noqa: E402
from acg_vision.config import load_yaml, resolve  # noqa: E402
from acg_vision.offline import NetworkBlocked, unblock_network  # noqa: E402

CACHE = resolve(load_yaml("resources.yaml")["cache_dir"])
RAW = resolve(load_yaml("resources.yaml")["data_dir"])
need = pytest.mark.skipif(not (CACHE / "yolo11n.pt").exists() or not (RAW / "medical_pills").exists(),
                          reason="recursos ausentes: python scripts/fetch_resources.py")


@pytest.fixture(autouse=True)
def _restore_network():
    yield
    unblock_network()


@need
def test_detect_inference_offline_json(tmp_path):
    from acg_vision.inference.predictor import run
    img = sorted((RAW / "medical_pills" / "images" / "val").glob("*.jpg"))[0]
    out = run(CACHE / "yolo11n.pt", [img], tmp_path)
    with pytest.raises(NetworkBlocked):          # a rede continua bloqueada após a inferência
        socket.create_connection(("pypi.org", 443), timeout=1)
    doc = json.loads(out.read_text())
    r = doc["results"][0]
    assert doc["model"]["provenance"] == MODEL_PROVENANCE_TAG and len(doc["model"]["sha256"]) == 64
    assert r["status"] == "OK" and r["task"] == "detect" and r["image_size"] == [1920, 1080]
    assert all(len(d["box_xyxy"]) == 4 and 0 <= d["confidence"] <= 1 for d in r["detections"])
    assert (tmp_path / "annotated").exists() and r["annotated"]


@need
def test_classify_inference_and_bad_image(tmp_path):
    from acg_vision.inference.predictor import Predictor
    p = Predictor(CACHE / "yolo11n-cls.pt")
    img = sorted((RAW / "pill_defects" / "normal").glob("*.png"))[0]
    r = p.predict(img, view_id="view_a")
    c = r["classification"]
    assert r["view_id"] == "view_a" and c["top_k"] == 5 and c["label"] == next(iter(c["probabilities"]))
    bad = tmp_path / "x.png"
    bad.write_bytes(b"nao e imagem")
    assert p.predict(bad)["status"] == "ERROR"


def test_missing_weights_message(tmp_path):
    from acg_vision.inference.predictor import Predictor
    from acg_vision.offline import MissingResource
    with pytest.raises(MissingResource):
        Predictor(tmp_path / "nada.pt")
