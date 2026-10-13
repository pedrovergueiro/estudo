import threading
from pathlib import Path

import cv2
import numpy as np
import pytest

from capsule_inspector.capture import CaptureError, EndOfStream, NullLightingController, capture_views
from capsule_inspector.capture.file_source import FileSource
from capsule_inspector.capture.libcamera_source import LibcameraSource
from capsule_inspector.capture.usb_camera import UsbCamera
from capsule_inspector.config import AcquisitionStep, ActuatorConfig, LibcameraConfig, UsbCameraConfig
from capsule_inspector.integration.actuators import NullActuator, create_actuator
from capsule_inspector.integration.triggers import IntervalTrigger
from capsule_inspector.types import InspectionStatus as S


def test_file_source_reads_and_ends(tmp_path: Path):
    for i in range(3):
        cv2.imwrite(str(tmp_path / f"{i}.png"), np.full((40, 40, 3), i * 50, np.uint8))
    src = FileSource(tmp_path, "*.png")
    with src:
        frames = [src.read() for _ in range(3)]
        assert [f.frame_id for f in frames] == [1, 2, 3] and frames[2].image[0, 0, 0] == 100
        assert frames[0].meta["file"].endswith("0.png")
        with pytest.raises(EndOfStream):
            src.read()


def test_file_source_corrupt_and_missing(tmp_path: Path):
    (tmp_path / "bad.png").write_bytes(b"xx")
    src = FileSource(tmp_path, "*.png")
    src.open()
    with pytest.raises(CaptureError):
        src.read()
    with pytest.raises(CaptureError):
        FileSource(tmp_path / "nope").open()


def test_capture_views_one_frame_per_light(tmp_path: Path):
    for i in range(2):
        cv2.imwrite(str(tmp_path / f"{i}.png"), np.zeros((40, 40, 3), np.uint8))
    steps = [AcquisitionStep(name="a", kind="diffuse", light="l1"), AcquisitionStep(name="b", kind="backlight", light="l2")]
    with FileSource(tmp_path) as src:
        fr = capture_views(src, steps, NullLightingController())
    assert [f.view for f in fr] == ["a", "b"]


def test_usb_camera_missing_device_raises():
    cam = UsbCamera(UsbCameraConfig(device="/dev/video_inexistente", reconnect_attempts=1, reconnect_backoff_s=0))
    with pytest.raises(CaptureError):
        cam.open()
    with pytest.raises(CaptureError):
        cam.read()


def test_libcamera_without_picamera2():
    try:
        import picamera2  # noqa: F401
        pytest.skip("picamera2 presente")
    except ImportError:
        pass
    with pytest.raises(CaptureError, match="picamera2"):
        LibcameraSource(LibcameraConfig()).open()


def test_actuator_disabled_by_default_and_failsafe():
    act = create_actuator(ActuatorConfig())
    assert isinstance(act, NullActuator)
    for st in (S.FAIL, S.REVIEW, S.SYSTEM_ERROR):
        assert act.handle(st, "x")
    assert not act.handle(S.PASS, "y")
    with pytest.raises(RuntimeError, match="interlock"):
        create_actuator(ActuatorConfig(enabled=True, interlock_validated=False))


def test_interval_trigger_respects_stop():
    stop = threading.Event()
    t = IntervalTrigger(0.05)
    assert t.wait(stop)
    stop.set()
    assert not t.wait(stop)


def test_publisher_sends_and_survives_offline(tmp_path: Path):
    import http.server
    import json as _json

    from capsule_inspector.config import PublisherConfig
    from capsule_inspector.integration.publisher import OutboxPublisher
    from capsule_inspector.storage.database import InspectionDB
    from capsule_inspector.storage.records import InspectionRecord, new_inspection_id

    got = []

    class H(http.server.BaseHTTPRequestHandler):
        def do_POST(self):  # noqa: N802
            got.append(_json.loads(self.rfile.read(int(self.headers["Content-Length"]))))
            self.send_response(204)
            self.end_headers()

        def log_message(self, *a):
            pass

    srv = http.server.HTTPServer(("127.0.0.1", 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    db = InspectionDB(tmp_path / "db.sqlite3")
    for _ in range(2):
        db.insert(InspectionRecord(new_inspection_id(), InspectionRecord.utc_now(), "FAIL", "X"),
                  enqueue_payload={"status": "FAIL"})
    # sem rede (porta fechada): itens permanecem na fila
    off = OutboxPublisher(PublisherConfig(enabled=True, url="http://127.0.0.1:9/x", timeout_s=0.5), db)
    assert off.send_once() == 0 and db.outbox_size() == 2
    on = OutboxPublisher(PublisherConfig(enabled=True, url=f"http://127.0.0.1:{srv.server_port}/x"), db)
    assert on.send_once() == 2 and db.outbox_size() == 0 and got[0]["status"] == "FAIL"
    srv.shutdown()
