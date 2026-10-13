"""Pacote do Raspberry Pi: pasta com arquivo corrompido, câmera CSI (rpicam-vid simulado),
descoberta de câmeras e comando `capsule-inspector`."""

import os
import stat
import time
from pathlib import Path

import cv2
import numpy as np
import pytest
from conftest import SYNTH_NAMES, capsule_image, make_constant_onnx

from capsule_inspector.capture.discover import parse_list_cameras, usb_cameras
from capsule_inspector.capture.rpicam_source import MjpegStreamParser, RpicamSource


def _service(synth_settings, project, folder):
    from capsule_inspector.runtime import InspectionService
    s = synth_settings()
    img, labels = capsule_image(320, 7)
    x1, y1, x2, y2 = labels[0][1]
    m = make_constant_onnx(project / "m.onnx", SYNTH_NAMES, 320, [(0, 0.9, (x1 + x2) / 2, (y1 + y2) / 2, x2 - x1, y2 - y1)])
    s.camera.type = "file"
    s.camera.file.path = str(folder)
    s.camera.file.pattern = "*"
    s.system.integration.trigger.type = "none"
    return InspectionService(s, model_path=str(m), console_log=False), img


def test_folder_with_corrupt_file_finishes(synth_settings, project, tmp_path):
    folder = tmp_path / "imgs"
    folder.mkdir()
    svc, img = _service(synth_settings, project, folder)
    for i in range(2):
        cv2.imwrite(str(folder / f"a{i}.png"), img)
    (folder / "b_ruim.png").write_bytes(b"isto nao e imagem")
    t0 = time.time()
    n = svc.run(max_inspections=20)
    assert n == 3 and time.time() - t0 < 60          # não reabre a pasta em laço
    from capsule_inspector.storage.database import InspectionDB
    rows = InspectionDB(svc.s.path(svc.s.system.storage.database)).recent(10)
    st = sorted(r["status"] for r in rows)
    assert st.count("SYSTEM_ERROR") == 1 and len(st) == 3
    bad = next(r for r in rows if r["status"] == "SYSTEM_ERROR")
    assert "b_ruim.png" in bad["error"]


def test_mjpeg_parser_splits_frames():
    ok, j = cv2.imencode(".jpg", np.zeros((8, 8, 3), np.uint8))
    data = b"lixo" + j.tobytes() + j.tobytes()[:10]
    p = MjpegStreamParser()
    assert len(p.feed(data)) == 1
    assert len(p.feed(j.tobytes()[10:] + j.tobytes())) == 2


def _fake_rpicam(tmp_path: Path, frames: int) -> Path:
    img = np.zeros((48, 64, 3), np.uint8)
    img[:, :32] = 200
    ok, j = cv2.imencode(".jpg", img)
    (tmp_path / "f.jpg").write_bytes(j.tobytes())
    exe = tmp_path / "rpicam-vid"
    exe.write_text(f"#!/bin/sh\nfor i in $(seq 1 {frames}); do cat {tmp_path / 'f.jpg'}; sleep 0.05; done\n")
    exe.chmod(exe.stat().st_mode | stat.S_IEXEC)
    return exe


def test_csi_source_reads_frames_from_rpicam(tmp_path):
    src = RpicamSource(64, 48, executable=str(_fake_rpicam(tmp_path, 40)))
    src.open()
    try:
        f1, f2 = src.read(), src.read()
        assert f1.image.shape == (48, 64, 3) and f2.frame_id == 2 and f1.image[0, 0, 0] > 150
    finally:
        src.close()


def test_csi_source_reports_dead_camera(tmp_path):
    from capsule_inspector.capture import CaptureError
    exe = tmp_path / "rpicam-vid"
    exe.write_text("#!/bin/sh\necho 'ERROR: no cameras available' >&2\nexit 1\n")
    exe.chmod(0o755)
    with pytest.raises(CaptureError, match="no cameras"):
        RpicamSource(executable=str(exe), read_timeout_s=1).open()


def test_camera_discovery_parsers(tmp_path):
    txt = "Available cameras\n-----------------\n0 : imx708 [4608x2592 10-bit RGGB] (/base/axi/pcie@120000/rp1/i2c@88000/imx708@1a)\n"
    assert parse_list_cameras(txt) == [{"index": "0", "sensor": "imx708", "mode": "4608x2592 10-bit RGGB"}]
    sysfs = tmp_path / "v4l"
    for name, drv, idx in (("video0", "uvcvideo", "0"), ("video1", "uvcvideo", "1"), ("video19", "pispbe", "0")):
        d = sysfs / name
        (d / "device").mkdir(parents=True)
        (tmp_path / "drivers" / drv).mkdir(parents=True, exist_ok=True)
        os.symlink(tmp_path / "drivers" / drv, d / "device" / "driver")
        (d / "index").write_text(idx)
        (d / "name").write_text(f"cam {name}")
    assert usb_cameras(sysfs) == [{"device": "/dev/video0", "name": "cam video0"}]


def test_cli_parses_commands():
    from capsule_inspector.cli import main
    with pytest.raises(SystemExit):
        main(["--versao"])
    with pytest.raises(SystemExit):
        main(["pasta"])   # falta o diretório
