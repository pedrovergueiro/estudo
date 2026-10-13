import json

import numpy as np
import pytest

from capsule_inspector.config import load_settings
from capsule_inspector.monitoring.hardware import platform_report, recommend_backend
from capsule_inspector.monitoring.performance import RollingStats, StageTimer, summarize
from capsule_inspector.storage.database import InspectionDB
from capsule_inspector.storage.files import atomic_write_image
from capsule_inspector.storage.records import InspectionRecord, new_inspection_id

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient  # noqa: E402

from capsule_inspector.interface.app import check_bind_policy, create_app  # noqa: E402


@pytest.fixture()
def client_and_id(project):
    s = load_settings(root=project)
    db = InspectionDB(s.path(s.system.storage.database))
    iid = new_inspection_id()
    img_rel = f"FAIL/2025-01-01/{iid}_annotated.jpg"
    atomic_write_image(s.path(s.system.storage.images_dir) / img_rel, np.zeros((10, 10, 3), np.uint8))
    db.insert(InspectionRecord(iid, InspectionRecord.utc_now(), "FAIL", "DEFECT_CONFIRMED", lot_id="L9",
                               images={"annotated": img_rel, "evil": "../../../../etc/passwd"},
                               timings_ms={"total": 33.0}))
    db.close()
    s.path(s.system.storage.status_file).write_text(json.dumps({"ts": 0, "camera": {"ok": True}}))
    return s, iid


def test_api_endpoints(client_and_id):
    s, iid = client_and_id
    c = TestClient(create_app(s, token=""))
    assert "Inspeção de Cápsulas" in c.get("/").text
    st = c.get("/api/status").json()
    assert st["service_stale"] is True and st["counts_24h"]["FAIL"] == 1
    rows = c.get("/api/inspections?status=FAIL").json()
    assert rows[0]["inspection_id"] == iid
    assert c.get(f"/api/inspections/{iid}").json()["lot_id"] == "L9"
    assert c.get("/api/inspections/nope").status_code == 404
    r = c.get(f"/api/inspections/{iid}/image/annotated")
    assert r.status_code == 200 and r.headers["content-type"].startswith("image/")
    assert c.get(f"/api/inspections/{iid}/image/evil").status_code == 400     # path traversal
    rv = c.post(f"/api/inspections/{iid}/review", json={"reviewer": "op", "verdict": "CONFIRMED_DEFECT",
                                                        "defect_class": "crack"})
    assert rv.status_code == 200
    assert c.post(f"/api/inspections/{iid}/review", json={"reviewer": "op", "verdict": "X"}).status_code == 422
    assert c.post(f"/api/inspections/{iid}/review", json={"reviewer": "op", "verdict": "UNCERTAIN",
                                                          "defect_class": "zzz"}).status_code == 422
    assert c.get("/api/export.csv").text.startswith("inspection_id,")
    assert len(c.get("/api/export.json").json()) == 1


def test_token_required_when_configured(client_and_id):
    s, _ = client_and_id
    c = TestClient(create_app(s, token="s3cret"))
    assert c.get("/api/status").status_code == 401
    assert c.get("/api/status?token=s3cret").status_code == 200
    assert c.get("/api/status", headers={"Authorization": "Bearer s3cret"}).status_code == 200


def test_remote_bind_requires_token(project, monkeypatch):
    s = load_settings(root=project)
    s.system.interface.host = "0.0.0.0"
    monkeypatch.delenv(s.system.interface.auth_token_env, raising=False)
    with pytest.raises(SystemExit):
        check_bind_policy(s)
    monkeypatch.setenv(s.system.interface.auth_token_env, "tok")
    assert check_bind_policy(s) == "tok"


def test_platform_report_and_backend_choice():
    r = platform_report()
    assert {"machine", "os", "python", "memory", "libraries", "onnxruntime_providers"} <= set(r)
    assert "CPUExecutionProvider" in r["onnxruntime_providers"]
    assert recommend_backend("a.onnx") == "onnxruntime"
    assert recommend_backend("a.pt") == "ultralytics"
    with pytest.raises(ValueError):
        recommend_backend("a.bin")


def test_performance_helpers():
    t = StageTimer()
    with t.stage("x"):
        pass
    t.add("y", 2.0)
    d = t.as_dict()
    assert d["y"] == 2.0 and d["total"] >= 0
    assert summarize([1, 2, 3])["p50"] == 2
    rs = RollingStats()
    rs.add(5.0)
    rs.add(7.0, ok=False)
    assert rs.snapshot()["errors"] == 1
