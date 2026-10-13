from pathlib import Path

import pytest

from acg_vision.evaluation.cls_eval import auc, summarize
from acg_vision.evaluation.matching import match_boxes, prf
from acg_vision.multiview.core import CameraSource, LocalManifestSource, ViewImage, associate, fuse


def test_matching_and_prf():
    gt = [(0, 0, 10, 10), (20, 20, 30, 30)]
    m = match_boxes([(0, 0, 10, 10), (50, 50, 60, 60)], gt, 0.5, [0.9, 0.8])
    assert (m["tp"], m["fp"], m["fn"]) == (1, 1, 1)
    assert prf(1, 1, 1) == {"precision": 0.5, "recall": 0.5, "f1": 0.5}
    assert prf(0, 0, 0)["f1"] is None


def test_classification_summary():
    preds = [{"true": "defect", "pred": "defect", "p_defect": 0.9, "unit_id": "d1"},
             {"true": "defect", "pred": "normal", "p_defect": 0.4, "unit_id": "d1"},
             {"true": "normal", "pred": "normal", "p_defect": 0.1, "unit_id": "n1"}]
    s = summarize(preds)
    assert s["confusion_matrix_rows_true_cols_pred"]["defect"] == {"normal": 1, "defect": 1}
    assert s["defect"]["recall"] == 0.5 and s["normal"]["precision"] == 0.5
    assert s["roc_auc_pooled"] == 1.0 and s["n_units"] == 2
    assert auc([0.1, 0.2], [0, 0]) is None


def _r(p):
    return {"status": "OK", "classification": {"label": "x", "probabilities": {"defect": p, "normal": 1 - p}}}


def test_association_requires_explicit_ids(tmp_path):
    imgs = [ViewImage("view_a", Path("a.png"), capsule_id="C1"), ViewImage("view_b", Path("b.png"), capsule_id="C1"),
            ViewImage("view_c", Path("c.png"), trigger_id="T9"), ViewImage("view_a", Path("d.png"), timestamp_ms=5)]
    a = associate(imgs)
    assert set(a.groups) == {"capsule:C1", "trigger:T9"} and len(a.unassociated) == 1
    with pytest.raises(ValueError, match="tolerância"):
        associate(imgs, allow_timestamp=True)
    t = associate([ViewImage("view_a", Path("x"), timestamp_ms=0), ViewImage("view_b", Path("y"), timestamp_ms=3),
                   ViewImage("view_a", Path("z"), timestamp_ms=4)], allow_timestamp=True, tolerance_ms=10)
    assert sorted(len(g) for g in t.groups.values()) == [1, 2]   # mesma vista não entra duas vezes no grupo


def test_fusion_rules():
    req = ["view_a", "view_b", "view_c"]
    vs = [ViewImage(v, Path(f"{v}.png")) for v in req]
    assert fuse("c", vs, [_r(0.1), _r(0.2), _r(0.3)], req)["decision"] == "NO_DEFECT_OBSERVED"
    d = fuse("c", vs, [_r(0.1), _r(0.8), _r(0.3)], req)
    assert d["decision"] == "DEFECT_SUSPECTED" and d["views"][1]["view_id"] == "view_b"
    assert fuse("c", vs[:2], [_r(0.1), _r(0.2)], req)["decision"] == "INCONCLUSIVE"
    err = {"status": "ERROR"}
    assert fuse("c", vs, [_r(0.1), err, _r(0.1)], req)["decision"] == "INCONCLUSIVE"
    det = {"status": "OK", "detections": []}      # detector de localização não dá evidência de defeito
    assert fuse("c", vs, [det, det, det], req)["decision"] == "INCONCLUSIVE"


def test_manifest_source_and_camera_placeholder(tmp_path):
    (tmp_path / "m.csv").write_text("path,view_id,capsule_id\nimg1.png,view_a,C1\n")
    ims = LocalManifestSource(tmp_path / "m.csv").images()
    assert ims[0].path == tmp_path / "img1.png" and ims[0].capsule_id == "C1"
    with pytest.raises(NotImplementedError):
        CameraSource("view_a").images()
