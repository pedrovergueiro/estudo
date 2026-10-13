import numpy as np
import pytest
from conftest import capsule_image

from capsule_inspector.inference.postprocess import CoordinateError, box_iou, decode_yolo_output, nms, validate_box
from capsule_inspector.inference.preprocess import (
    OPS,
    PreprocessError,
    build_pipeline,
    fuse_channels,
    letterbox,
    to_blob,
)
from capsule_inspector.inference.roi import classical_regions

DEFAULT_PARAMS = {"fixed_white_balance": {"gains": [1.0, 1.1, 0.9]}}


@pytest.mark.parametrize("op", sorted(OPS))
def test_ops_preserve_geometry(op):
    img, _ = capsule_image(160, 0)
    out = OPS[op](img, **DEFAULT_PARAMS.get(op, {}))
    assert out.shape == img.shape and out.dtype == np.uint8


def test_aggressive_parameters_are_rejected():
    for steps in ([{"op": "clahe", "clip_limit": 8}], [{"op": "denoise_bilateral", "d": 15}],
                  [{"op": "denoise_nlmeans", "h": 30}], [{"op": "nope"}], [{"op": "clahe", "bogus": 1}]):
        with pytest.raises(PreprocessError):
            build_pipeline(steps)


@pytest.mark.parametrize("profile", ["opaque_two_tone", "translucent_colored", "transparent_clear"])
def test_profiles_preserve_one_pixel_crack(project, profile):
    """Um risco escuro de 1 px deve continuar visível após a cadeia do perfil."""
    from capsule_inspector.config import load_settings
    s = load_settings(root=project)
    fn = build_pipeline(s.lighting.profiles[profile].preprocessing)
    img, _ = capsule_image(320, 3)
    marked = img.copy()
    marked[150, 120:200] = (marked[150, 120:200] * 0.45).astype(np.uint8)
    a = fn(img).astype(np.float32).mean(2)
    b = fn(marked).astype(np.float32).mean(2)
    orig_contrast = float(np.abs(img.astype(np.float32).mean(2)[150, 120:200] - marked.astype(np.float32).mean(2)[150, 120:200]).mean())
    kept = float(np.abs(a[150, 120:200] - b[150, 120:200]).mean())
    assert kept > 0.5 * orig_contrast, f"{profile}: contraste do defeito caiu de {orig_contrast:.1f} para {kept:.1f}"


def test_letterbox_and_blob():
    img = np.zeros((240, 320, 3), np.uint8)
    lb, r, (px, py) = letterbox(img, 160)
    assert lb.shape == (160, 160, 3) and r == 0.5 and (px, py) == (0.0, 20.0)
    blob = to_blob(lb)
    assert blob.shape == (1, 3, 160, 160) and blob.dtype == np.float32 and blob.max() <= 1.0


def test_fuse_channels():
    a = np.full((10, 10, 3), 10, np.uint8)
    b = np.full((10, 10, 3), 200, np.uint8)
    f = fuse_channels([a, b])
    assert f.shape == (10, 10, 3) and f[0, 0, 0] == 10 and f[0, 0, 1] == 200
    with pytest.raises(PreprocessError):
        fuse_channels([a, np.zeros((5, 5), np.uint8)])


def test_nms_and_iou():
    boxes = np.array([[0, 0, 10, 10], [1, 1, 10, 10], [20, 20, 30, 30]], np.float32)
    keep = nms(boxes, np.array([0.9, 0.8, 0.7]), 0.5)
    assert keep.tolist() == [0, 2]
    assert box_iou(boxes[:1], boxes[:1])[0, 0] == pytest.approx(1.0)


def test_decode_maps_back_to_original_and_classwise_nms():
    names = ["capsule", "crack"]
    out = np.zeros((1, 6, 4), np.float32)
    # imagem original 240x320 -> letterbox 160: r=0.5, pad y=20
    out[0, :4, 0] = [80, 80, 100, 40]; out[0, 4, 0] = 0.9     # capsule
    out[0, :4, 1] = [80, 80, 100, 40]; out[0, 5, 1] = 0.6     # crack sobreposto (outra classe) — mantido
    out[0, :4, 2] = [81, 80, 100, 40]; out[0, 4, 2] = 0.5     # duplicata capsule — removida
    out[0, :4, 3] = [10, 10, 4, 4]; out[0, 5, 3] = 0.01       # abaixo do conf
    dets = decode_yolo_output(out, 2, 0.05, 0.5, 100, 0.5, (0.0, 20.0), (240, 320), names)
    assert [d.class_name for d in dets] == ["capsule", "crack"]
    x1, y1, x2, y2 = dets[0].box
    assert (x1, y1, x2, y2) == pytest.approx((60, 80, 260, 160))


def test_decode_rejects_wrong_channel_count():
    with pytest.raises(ValueError, match="canais"):
        decode_yolo_output(np.zeros((1, 7, 3), np.float32), 2, 0.1, 0.5, 10, 1.0, (0, 0), (10, 10), ["a", "b"])


def test_validate_box():
    assert validate_box((-0.5, 0, 10, 10.4), 10, 10) == (0.0, 0.0, 10.0, 10.0)
    for bad in [(0, 0, float("nan"), 1), (5, 5, 1, 1), (0, 0, 50, 5)]:
        with pytest.raises(CoordinateError):
            validate_box(bad, 10, 10)


def test_classical_roi_finds_capsule():
    img, labels = capsule_image(320, 5)
    regs = classical_regions(img)
    assert len(regs) == 1
    gt = np.array([labels[0][1]], np.float32)
    assert box_iou(np.array([regs[0].box], np.float32), gt)[0, 0] > 0.8
    assert not regs[0].touches_border
