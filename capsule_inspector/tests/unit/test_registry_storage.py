import json
import os
import time
from pathlib import Path

import numpy as np
import pytest

from capsule_inspector.config import RetentionConfig
from capsule_inspector.registry import ModelRegistry, RegistryError
from capsule_inspector.storage.database import InspectionDB
from capsule_inspector.storage.files import atomic_write_image, atomic_write_json
from capsule_inspector.storage.records import InspectionRecord, new_inspection_id
from capsule_inspector.storage.retention import apply_retention

INFO = {"class_names": ["capsule", "crack"], "imgsz": 320, "task": "detect", "format": "onnx"}


def _artifact(tmp_path: Path, content: bytes = b"model-bytes") -> Path:
    p = tmp_path / "m.onnx"
    p.write_bytes(content)
    return p


def _report(tmp_path: Path, passed: bool, sha: str | None = None) -> Path:
    p = tmp_path / f"eval_{passed}.json"
    p.write_text(json.dumps({"regression": {"passed": passed}, "model_sha256": sha}))
    return p


def test_registry_lifecycle(tmp_path: Path):
    reg = ModelRegistry(tmp_path / "reg")
    m1 = reg.register(_artifact(tmp_path), "v1", INFO)
    assert m1["status"] == "candidate"
    with pytest.raises(RegistryError, match="não está aprovado"):
        reg.activate("v1", "qa")
    with pytest.raises(RegistryError, match="regressão"):
        reg.approve("v1", "qa", _report(tmp_path, False))
    with pytest.raises(RegistryError, match="não corresponde"):
        reg.approve("v1", "qa", _report(tmp_path, True, "0" * 64))
    with pytest.raises(RegistryError, match="responsável"):
        reg.approve("v1", " ", _report(tmp_path, True))
    reg.approve("v1", "Maria (QA)", _report(tmp_path, True, m1["sha256"]))
    reg.activate("v1", "Maria (QA)")
    path, man = reg.resolve_active()
    assert man["model_id"] == "v1" and path.exists()
    with pytest.raises(RegistryError, match="imutáveis"):
        reg.register(_artifact(tmp_path), "v1", INFO)
    (tmp_path / "m2").mkdir()
    a2 = tmp_path / "m2" / "m.onnx"
    a2.write_bytes(b"other")
    m2 = reg.register(a2, "v2", INFO)
    reg.approve("v2", "qa", _report(tmp_path, True, m2["sha256"]))
    reg.activate("v2", "qa")
    assert reg.active()["model_id"] == "v2"
    reg.rollback("qa")
    assert reg.active()["model_id"] == "v1"


def test_registry_detects_tampering(tmp_path: Path):
    reg = ModelRegistry(tmp_path / "reg")
    m = reg.register(_artifact(tmp_path), "v1", INFO)
    reg.approve("v1", "qa", _report(tmp_path, True, m["sha256"]))
    reg.activate("v1", "qa")
    (tmp_path / "reg" / "v1" / "m.onnx").write_bytes(b"tampered")
    with pytest.raises(RegistryError, match="SHA-256"):
        reg.resolve_active()


def test_registry_requires_manifest_fields(tmp_path: Path):
    with pytest.raises(RegistryError, match="incompleto"):
        ModelRegistry(tmp_path / "r").register(_artifact(tmp_path), "x", {"imgsz": 1})


def _rec(status="PASS", lot="L1"):
    return InspectionRecord(new_inspection_id(), InspectionRecord.utc_now(), status, "NORMAL_VALIDATED",
                            lot_id=lot, model={"model_id": "v1", "sha256": "abc"}, config={"hash": "h"},
                            capsules=[{"index": 0, "defects": [{"class_name": "crack", "confidence": 0.9}]}],
                            timings_ms={"total": 12.5}, reasons=["r1"])


def test_database_roundtrip_reviews_export(tmp_path: Path):
    db = InspectionDB(tmp_path / "db.sqlite3")
    r1, r2 = _rec("PASS"), _rec("FAIL", "L2")
    db.insert(r1)
    db.insert(r2, enqueue_payload={"x": 1})
    assert db.get(r1.inspection_id)["status"] == "PASS"
    assert [r["status"] for r in db.recent(10, status="FAIL")] == ["FAIL"]
    assert db.counts() == {"PASS": 1, "FAIL": 1}
    db.add_review(r2.inspection_id, "op1", "FALSE_ALARM", None, "ok", InspectionRecord.utc_now())
    got = db.get(r2.inspection_id)
    assert got["status"] == "FAIL" and got["reviews"][0]["verdict"] == "FALSE_ALARM"   # original preservado
    assert len(db.recent(10, unreviewed_only=True)) == 1
    with pytest.raises(KeyError):
        db.add_review("nope", "op", "UNCERTAIN", None, None, "t")
    csv = db.export_csv()
    assert csv.splitlines()[0].startswith("inspection_id,") and "crack" in csv
    assert len(json.loads(db.export_json())) == 2
    assert db.outbox_size() == 1
    seq = db.outbox_batch()[0][0]
    db.outbox_done(seq)
    assert db.outbox_size() == 0
    db.close()
    # durabilidade: reabrir mantém os registros
    assert InspectionDB(tmp_path / "db.sqlite3").get(r1.inspection_id) is not None


def test_atomic_writes_leave_no_partial_files(tmp_path: Path):
    atomic_write_json(tmp_path / "a.json", {"k": 1})
    atomic_write_image(tmp_path / "i.png", np.zeros((8, 8, 3), np.uint8))
    assert sorted(p.name for p in tmp_path.iterdir()) == ["a.json", "i.png"]


def test_retention_by_age_status_and_size(tmp_path: Path):
    now = time.time()

    def mk(status, name, age_days, size=1000):
        p = tmp_path / status / "2025-01-01" / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(b"x" * size)
        os.utime(p, (now - age_days * 86400, now - age_days * 86400))
        return p

    old_pass = mk("PASS", "a.png", 10)
    new_pass = mk("PASS", "b.png", 1)
    old_fail = mk("FAIL", "c.png", 10)
    cfg = RetentionConfig(pass_images_days=7, fail_images_days=90, review_images_days=90, max_images_gb=1)
    removed = apply_retention(tmp_path, cfg, now)
    assert removed["age"] == 1 and not old_pass.exists() and new_pass.exists() and old_fail.exists()
    removed = apply_retention(tmp_path, RetentionConfig(max_images_gb=1.5e-6), now)
    assert removed["size"] >= 1 and old_fail.exists() and not new_pass.exists()   # PASS sai primeiro
