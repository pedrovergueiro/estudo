import hashlib
import http.server
import socket
import threading
import urllib.request
import zipfile

import pytest

from acg_vision.data.fetch import IntegrityError, download, extract_zip, tree_manifest_sha256
from acg_vision.offline import MissingResource, NetworkBlocked, block_network, require, unblock_network


@pytest.fixture()
def server(tmp_path):
    (tmp_path / "srv").mkdir()
    (tmp_path / "srv" / "w.bin").write_bytes(b"pesos")
    handler = lambda *a, **k: http.server.SimpleHTTPRequestHandler(*a, directory=str(tmp_path / "srv"), **k)  # noqa: E731
    httpd = http.server.HTTPServer(("127.0.0.1", 0), handler)
    httpd.RequestHandlerClass.log_message = lambda *a: None
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{httpd.server_port}"
    httpd.shutdown()


def test_download_verifies_and_caches(tmp_path, server, monkeypatch):
    monkeypatch.delenv("HTTP_PROXY", raising=False)
    monkeypatch.setenv("NO_PROXY", "127.0.0.1")
    good = hashlib.sha256(b"pesos").hexdigest()
    dest = download(f"{server}/w.bin", tmp_path / "c" / "w.bin", good)
    assert dest.read_bytes() == b"pesos"
    with pytest.raises(IntegrityError):
        download(f"{server}/w.bin", tmp_path / "c" / "x.bin", "0" * 64)
    assert not (tmp_path / "c" / "x.bin").exists() and not (tmp_path / "c" / "x.bin.part").exists()
    (tmp_path / "c" / "w.bin").write_bytes(b"adulterado")
    with pytest.raises(IntegrityError):          # cache corrompido é detectado, não reutilizado
        download(f"{server}/w.bin", tmp_path / "c" / "w.bin", good)


def test_zip_path_traversal_rejected(tmp_path):
    z = tmp_path / "a.zip"
    with zipfile.ZipFile(z, "w") as f:
        f.writestr("../fora.txt", "x")
    with pytest.raises(IntegrityError):
        extract_zip(z, tmp_path / "out")


def test_tree_manifest_is_content_sensitive(tmp_path):
    (tmp_path / "d").mkdir()
    (tmp_path / "d" / "a.txt").write_text("1")
    h1 = tree_manifest_sha256(tmp_path, ["d"])
    (tmp_path / "d" / "a.txt").write_text("2")
    assert tree_manifest_sha256(tmp_path, ["d"]) != h1


def test_network_block_and_missing_resource(tmp_path):
    block_network()
    try:
        with pytest.raises(NetworkBlocked):
            socket.create_connection(("example.com", 443), timeout=1)
        with pytest.raises(OSError):
            urllib.request.urlopen("https://example.com", timeout=2)
    finally:
        unblock_network()
    with pytest.raises(MissingResource, match="fetch_resources.py"):
        require(tmp_path / "nao_existe.pt", "pesos")
