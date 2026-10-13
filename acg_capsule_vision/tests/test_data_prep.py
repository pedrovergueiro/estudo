import cv2
import numpy as np
import pytest

from acg_vision.data import medical_pills, pill_defects


def test_temporal_split_blocks_and_gaps():
    s = medical_pills.temporal_split(100, 0.2, 0.15, 2)
    assert s["test"] == list(range(80, 100))
    assert max(s["val"]) < 80 - 2 + 1 and min(s["test"]) - max(s["val"]) == 3
    assert min(s["val"]) - max(s["train"]) == 3
    assert not set(s["train"]) & set(s["val"]) and not set(s["val"]) & set(s["test"])
    assert len(s["dropped"]) == 4


def _fake_medical_pills(root, n=30):
    for i in range(n):
        split = "val" if i % 5 == 0 else "train"
        (root / "images" / split).mkdir(parents=True, exist_ok=True)
        (root / "labels" / split).mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(root / "images" / split / f"Frame_{4 * i}.jpg"), np.zeros((54, 96, 3), np.uint8))
        (root / "labels" / split / f"Frame_{4 * i}.txt").write_text("0 0.5 0.5 0.1 0.1\n")


def test_prepare_medical_pills(tmp_path):
    _fake_medical_pills(tmp_path / "raw")
    m = medical_pills.prepare(tmp_path / "raw", tmp_path / "out", 0.2, 0.15, 1)
    sp = m["splits"]
    assert sp["test"]["frames"] == [4 * i for i in range(24, 30)]
    assert max(sp["train"]["frames"]) < min(sp["val"]["frames"]) < min(sp["test"]["frames"])
    assert (tmp_path / "out" / "data.yaml").exists()
    n_files = sum(len(list((tmp_path / "out" / "images" / s).iterdir())) for s in ("train", "val", "test"))
    assert n_files == 30 - len(sp["dropped_frames"])


def test_invalid_label_rejected(tmp_path):
    _fake_medical_pills(tmp_path / "raw", 3)
    (tmp_path / "raw" / "labels" / "train" / "Frame_4.txt").write_text("0 0.5 0.5 1.5 0.1\n")
    with pytest.raises(medical_pills.LabelError):
        medical_pills.collect_frames(tmp_path / "raw")


def _fake_pill_defects(root):
    rng = np.random.default_rng(0)
    for label, session, start, n, base in [("normal", 6, 10, 5, 80), ("normal", 7, 20, 4, 120),
                                           ("defect", 6, 10, 3, 60), ("defect", 6, 40, 3, 160)]:
        (root / label).mkdir(parents=True, exist_ok=True)
        for k in range(n):
            img = np.clip(base + rng.normal(0, 1, (64, 64)), 0, 255).astype(np.uint8)
            cv2.imwrite(str(root / label / f"pic.{session}.{start + k}.0.png"), img)


def test_group_units_and_louo_fold(tmp_path):
    _fake_pill_defects(tmp_path / "raw")
    units = pill_defects.group_units(tmp_path / "raw", 3.0)
    assert sorted(len(u.images) for u in units) == [3, 3, 4, 5] and len(units) == 4
    test_u = units[0]
    info = pill_defects.build_fold(units, test_u.unit_id, tmp_path / "fold")
    used = {p.name for p in (tmp_path / "fold").rglob("*.png")}
    # a unidade de teste não aparece em treino nem validação (nomes podem repetir entre classes)
    test_files = {(test_u.label, p.name) for p in test_u.images}
    seen = {(p.parent.name, p.name) for p in (tmp_path / "fold").rglob("*.png")}
    assert not test_files & seen and used
    assert info["counts"]["test"][test_u.label] == len(test_u.images)
    assert sum(info["counts"]["val"].values()) == len(units) - 1   # 1 quadro final de cada unidade de treino


def test_group_units_splits_on_image_jump(tmp_path):
    root = tmp_path / "raw" / "normal"
    root.mkdir(parents=True)
    for k in range(4):
        cv2.imwrite(str(root / f"pic.6.{k}.0.png"), np.full((32, 32), 50 if k < 2 else 200, np.uint8))
    (tmp_path / "raw" / "defect").mkdir()
    units = pill_defects.group_units(tmp_path / "raw", 3.0)
    assert [len(u.images) for u in units] == [2, 2]  # índices contíguos, mas imagem muda => outra unidade
