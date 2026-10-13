import numpy as np
import pytest
from conftest import capsule_image

from capsule_inspector.inference.anomaly import OnnxExtractor, PatchCoreLite, normalize_crop
from capsule_inspector.training.metrics import (
    ImageEval,
    ap_per_class,
    calibrate_thresholds,
    confusion_matrix,
    decision_metrics,
    operating_point,
    regression_check,
)


def _crops(seeds, defects=None):
    out = []
    for s in seeds:
        img, lab = capsule_image(256, s, defects)
        out.append(normalize_crop(img, lab[0][1]))
    return out


def test_patchcore_lite_separates_defects_and_roundtrips(tmp_path):
    normal = _crops(range(40))
    model = PatchCoreLite.fit(normal[:30], max_bank=1500)
    thr = model.calibrate(normal[30:], quantile=0.99)
    defects = _crops(range(100, 110), ["foreign_particle", "hole"])
    sd = np.array([model.score(c).score for c in defects])
    sn = np.array([model.score(c).score for c in normal[30:]])
    assert np.median(sd) > np.median(sn)
    assert (sd > thr).mean() >= 0.5
    model.save(tmp_path / "m.npz")
    m2 = PatchCoreLite.load(tmp_path / "m.npz")
    assert m2.threshold == pytest.approx(thr)
    assert m2.score(defects[0]).score == pytest.approx(model.score(defects[0]).score, rel=1e-5)
    with pytest.raises(ValueError):
        PatchCoreLite.fit(normal[:3])


def test_onnx_feature_extractor(tmp_path):
    onnx = pytest.importorskip("onnx")
    from onnx import TensorProto, helper, numpy_helper
    w = numpy_helper.from_array(np.random.default_rng(0).normal(size=(8, 3, 3, 3)).astype(np.float32), "w")
    node = helper.make_node("Conv", ["x", "w"], ["y"], strides=[4, 4], pads=[1, 1, 1, 1])
    g = helper.make_graph([node], "f", [helper.make_tensor_value_info("x", TensorProto.FLOAT, [1, 3, 96, 192])],
                          [helper.make_tensor_value_info("y", TensorProto.FLOAT, None)], [w])
    m = helper.make_model(g, opset_imports=[helper.make_opsetid("", 17)])
    m.ir_version = 8
    onnx.save(m, str(tmp_path / "f.onnx"))
    ext = OnnxExtractor(tmp_path / "f.onnx")
    f = ext(_crops([0])[0])
    assert f.shape == (24 * 48, 8)


def _im(key, gt, preds, meta=None):
    return ImageEval(key, 200, 200, gt, preds, meta or {})


def test_metrics_perfect_and_missed():
    box_small, box_big = (10, 10, 20, 20), (50, 50, 150, 150)
    ims = [_im("a", [(1, box_small), (0, box_big)], [(1, 0.9, box_small), (0, 0.95, box_big)]),
           _im("b", [(1, box_small)], []),                                  # FN pequeno
           _im("c", [(0, box_big)], [(0, 0.9, box_big), (1, 0.8, (100, 100, 110, 110))])]  # FP
    ap = ap_per_class(ims, 2)
    assert ap[0]["ap50"] == pytest.approx(1.0)
    op = operating_point(ims, 2, {0: 0.25, 1: 0.25})
    assert op[1]["tp"] == 1 and op[1]["fn"] == 1 and op[1]["fp"] == 1
    assert op[1]["recall"] == 0.5 and op[1]["recall_by_size"]["small"] == 0.5
    cm = confusion_matrix(ims, 2, 0.25)
    assert cm[1, 1] == 1 and cm[2, 1] == 1 and cm[1, 2] == 1 and cm[0, 0] == 2
    dm = decision_metrics(ims, lambda im: "FAIL" if any(p[0] == 1 for p in im.preds) else "PASS", {1})
    assert dm["escape_rate"] == 0.5 and dm["escapes"] == ["b"] and dm["false_reject_rate"] == 1.0


def test_calibration_and_regression():
    b = (10, 10, 20, 20)
    ims = [_im(str(i), [(1, b)], [(1, 0.3 + 0.05 * i, b)]) for i in range(10)]
    cal = calibrate_thresholds(ims, 2, {1: 1.0}, {1: 0.9})
    assert cal[1]["review"] == pytest.approx(0.3) and cal[1]["fail"] is not None
    ref = {"dataset_fingerprint": "x", "summary": {"map50": 0.8}, "decision": {"escape_rate": 0.01},
           "per_class": {"crack": {"operating": {"n_gt": 10, "recall": 0.9, "recall_by_size": {"small": 0.8}}}}}
    good = {"dataset_fingerprint": "x", "summary": {"map50": 0.81}, "decision": {"escape_rate": 0.0},
            "per_class": {"crack": {"operating": {"n_gt": 10, "recall": 0.92, "recall_by_size": {"small": 0.85}}}}}
    worse_small = {**good, "per_class": {"crack": {"operating": {"n_gt": 10, "recall": 0.92,
                                                                  "recall_by_size": {"small": 0.6}}}}}
    assert regression_check(good, ref)["passed"]
    assert not regression_check(worse_small, ref)["passed"]
    assert not regression_check({**good, "dataset_fingerprint": "y"}, ref)["passed"]
