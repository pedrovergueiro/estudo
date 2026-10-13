import json
import shutil
from pathlib import Path

import cv2
import numpy as np
import pytest
from conftest import SYNTH_NAMES

from capsule_inspector.config import DatasetValidationConfig, SplitConfig
from capsule_inspector.dataset.convert import ConversionError, convert_coco, convert_voc, voc_box_to_yolo
from capsule_inspector.dataset.metadata import load_metadata
from capsule_inspector.dataset.report import write_validation_report
from capsule_inspector.dataset.split import group_aware_split, write_split
from capsule_inspector.dataset.validate import validate_dataset
from capsule_inspector.dataset.yolo_io import LabelParseError, label_path_for, parse_label_line, read_label_file

CFG = DatasetValidationConfig(min_instances_per_enabled_class=1)


def _codes(rep):
    return {i.code for i in rep.issues}


def test_parse_label_lines():
    a = parse_label_line("1 0.5 0.5 0.2 0.1")
    assert a.class_id == 1 and a.polygon is None
    s = parse_label_line("2 0.1 0.1 0.3 0.1 0.2 0.4")
    assert s.polygon and abs(s.w - 0.2) < 1e-9 and abs(s.h - 0.3) < 1e-9
    for bad in ["1 0.5 0.5", "a 0.5 0.5 0.1 0.1", "1.5 0.5 0.5 0.1 0.1", "1 0.1 0.1 0.2 0.2 0.3"]:
        with pytest.raises(LabelParseError):
            parse_label_line(bad)


def test_label_path_convention():
    assert label_path_for(Path("/d/images/train/a.png")) == Path("/d/labels/train/a.txt")


def test_validation_detects_problems(small_dataset: Path):
    root = small_dataset
    imgs = sorted((root / "images").glob("*.png"))
    (root / "images" / "corrupt.png").write_bytes(b"not an image")
    label_path_for(imgs[0]).write_text("0 0.5 0.5 1.4 0.2\n")         # fora dos limites
    label_path_for(imgs[1]).write_text("9 0.5 0.5 0.1 0.1\n")         # classe inexistente
    label_path_for(imgs[2]).write_text("0 0.5 0.5\n")                 # inválido
    label_path_for(imgs[3]).unlink()                                  # ausente
    shutil.copy2(imgs[4], root / "images" / "copy.png")               # duplicata exata
    shutil.copy2(label_path_for(imgs[4]), root / "labels" / "copy.txt")
    (root / "labels" / "orphan.txt").write_text("0 0.5 0.5 0.1 0.1\n")
    rep = validate_dataset(root, SYNTH_NAMES, CFG, metadata=load_metadata(root / "metadata.csv", root))
    codes = _codes(rep)
    assert {"IMAGE_CORRUPT", "BOX_OUT_OF_BOUNDS", "CLASS_OUT_OF_RANGE", "LABEL_INVALID", "LABEL_MISSING",
            "DUPLICATE_EXACT", "LABEL_ORPHAN", "METADATA_MISSING"} <= codes
    assert not rep.ok
    assert rep.class_instances["capsule"] > 0
    out = write_validation_report(rep, root.parent / "rep")
    assert out["markdown"].exists() and out["chart"].exists()
    assert json.loads(out["json"].read_text())["n_errors"] >= 4


def test_leakage_by_group_and_near_duplicate(tmp_path: Path, small_dataset: Path):
    root = small_dataset
    meta = load_metadata(root / "metadata.csv", root)
    keys = sorted(meta)
    # mesma unidade física (u0000) em splits diferentes => vazamento por grupo
    split_of = {k: "train" for k in keys}
    split_of["images/u0000_v1.png"] = "test"
    rep = validate_dataset(root, SYNTH_NAMES, CFG, metadata=meta, split_of=split_of)
    assert any(x["type"] == "group_unit_id" for x in rep.leakage)
    # quase duplicata (ruído leve + JPEG) entre splits, sem metadados
    img = cv2.imread(str(root / "images" / "u0001_v0.png"))
    noisy = np.clip(img.astype(np.int16) + np.random.default_rng(0).normal(0, 2, img.shape), 0, 255).astype(np.uint8)
    cv2.imwrite(str(root / "images" / "zz_recapture.jpg"), noisy, [cv2.IMWRITE_JPEG_QUALITY, 85])
    shutil.copy2(root / "labels" / "u0001_v0.txt", root / "labels" / "zz_recapture.txt")
    split_of = {k: "train" for k in keys}
    split_of["images/zz_recapture.jpg"] = "test"
    rep = validate_dataset(root, SYNTH_NAMES, CFG, split_of=split_of)
    assert any(x["type"] == "near_duplicate" and "images/zz_recapture.jpg" in x["images"] for x in rep.leakage)


def test_group_split_keeps_units_together_and_is_deterministic(small_dataset: Path, tmp_path: Path):
    root = small_dataset
    meta = load_metadata(root / "metadata.csv", root)
    cfg = SplitConfig(seed=3)
    a = group_aware_split(root, SYNTH_NAMES, cfg, meta)
    b = group_aware_split(root, SYNTH_NAMES, cfg, meta)
    assert a.assignment == b.assignment
    by_unit = {}
    for k, s in a.assignment.items():
        by_unit.setdefault(meta[k]["unit_id"], set()).add(s)
    assert all(len(v) == 1 for v in by_unit.values())
    counts = {s: sum(1 for v in a.assignment.values() if v == s) for s in ("train", "val", "test")}
    assert counts["train"] > counts["val"] > 0 and counts["test"] > 0
    p = write_split(a, root, tmp_path / "splits", SYNTH_NAMES, 3)
    assert p.exists() and (tmp_path / "splits" / "train.txt").read_text().strip()
    rep = validate_dataset(root, SYNTH_NAMES, CFG, metadata=meta, split_of=a.assignment)
    assert rep.leakage == []


def test_holdout_lot_goes_to_test(small_dataset: Path):
    root = small_dataset
    meta = load_metadata(root / "metadata.csv", root)
    r = group_aware_split(root, SYNTH_NAMES, SplitConfig(seed=0, holdout_lots=["L2"]), meta)
    assert all(r.assignment[k] == "test" for k, m in meta.items() if m["lot"] == "L2")


def test_voc_conversion(tmp_path: Path, project):
    from capsule_inspector.config import load_settings
    tax = load_settings(root=project).taxonomy
    img_dir, xml_dir = tmp_path / "JPEGImages", tmp_path / "Annotations"
    img_dir.mkdir()
    xml_dir.mkdir()
    cv2.imwrite(str(img_dir / "a.jpg"), np.zeros((100, 200, 3), np.uint8))
    (xml_dir / "a.xml").write_text("""<annotation><filename>a.jpg</filename>
      <size><width>200</width><height>100</height><depth>3</depth></size>
      <object><name>Squeeze</name><bndbox><xmin>11</xmin><ymin>21</ymin><xmax>51</xmax><ymax>61</ymax></bndbox></object>
      <object><name>weird</name><bndbox><xmin>1</xmin><ymin>1</ymin><xmax>5</xmax><ymax>5</ymax></bndbox></object>
    </annotation>""")
    rep = convert_voc(xml_dir, img_dir, tmp_path / "out", tax)
    assert rep.mapped["dent"] == 1 and rep.unmapped["weird"] == 1
    a = read_label_file(tmp_path / "out" / "labels" / "a.txt")
    assert len(a) == 1 and a[0].class_id == tax.training_names().index("dent")
    cx, cy, w, h = voc_box_to_yolo(11, 21, 51, 61, 200, 100)
    assert (round(a[0].cx, 5), round(a[0].w, 5)) == (round(cx, 5), round(w, 5))
    assert abs(a[0].w - 0.2) < 1e-6 and abs(a[0].h - 0.4) < 1e-6
    with pytest.raises(ConversionError):
        convert_voc(xml_dir, img_dir, tmp_path / "out2", tax, strict=True)


def test_coco_conversion_detect_and_segment(tmp_path: Path, project):
    from capsule_inspector.config import load_settings
    tax = load_settings(root=project).taxonomy
    (tmp_path / "imgs").mkdir()
    cv2.imwrite(str(tmp_path / "imgs" / "b.png"), np.zeros((100, 100, 3), np.uint8))
    coco = {"images": [{"id": 1, "file_name": "b.png", "width": 100, "height": 100}],
            "categories": [{"id": 7, "name": "crack"}, {"id": 8, "name": "capsule"}],
            "annotations": [
                {"id": 1, "image_id": 1, "category_id": 7, "bbox": [10, 20, 30, 40], "iscrowd": 0,
                 "segmentation": [[10, 20, 40, 20, 40, 60, 10, 60]]},
                {"id": 2, "image_id": 1, "category_id": 8, "bbox": [0, 0, 100, 100], "iscrowd": 1}]}
    jp = tmp_path / "c.json"
    jp.write_text(json.dumps(coco))
    rep = convert_coco(jp, tmp_path / "imgs", tmp_path / "det", tax)
    a = read_label_file(tmp_path / "det" / "labels" / "b.txt")
    assert rep.n_objects == 1 and abs(a[0].cx - 0.25) < 1e-6 and abs(a[0].h - 0.4) < 1e-6  # crowd ignorado
    convert_coco(jp, tmp_path / "imgs", tmp_path / "seg", tax, task="segment")
    s = read_label_file(tmp_path / "seg" / "labels" / "b.txt")
    assert s[0].polygon and len(s[0].polygon) == 4
