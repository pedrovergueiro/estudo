"""Local, read-only dashboard server (stdlib ``http.server``).

Binds to loopback by default and exposes no mutating endpoint: it is a window
onto the experiment database, not a control plane.
"""

from __future__ import annotations

import json
from functools import partial
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

from guardian.core.logging import get_logger
from guardian.core.state import GuardianState
from guardian.dashboard.render import render_dashboard

LOGGER = get_logger("dashboard")


class DashboardHandler(BaseHTTPRequestHandler):
    """Serves the dashboard page and a small JSON snapshot endpoint."""

    server_version = "GuardianDashboard/1.0"

    def __init__(self, *args: Any, state: GuardianState, **kwargs: Any) -> None:
        self.state = state
        super().__init__(*args, **kwargs)

    def log_message(self, fmt: str, *args: Any) -> None:  # quieter default logging
        LOGGER.debug("dashboard request", extra={"detail": fmt % args})

    def _send(self, body: bytes, content_type: str, status: int = 200) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:  # noqa: N802 - http.server API
        path = self.path.split("?", 1)[0].rstrip("/") or "/"
        if path == "/":
            self._send(render_dashboard(self.state).encode("utf-8"), "text/html; charset=utf-8")
        elif path == "/api/snapshot":
            payload = json.dumps(self.state.snapshot(), indent=2, default=str)
            self._send(payload.encode("utf-8"), "application/json")
        elif path == "/api/experiments":
            payload = json.dumps(self.state.database.experiments(100), indent=2, default=str)
            self._send(payload.encode("utf-8"), "application/json")
        elif path == "/api/memory":
            payload = json.dumps(self.state.memory.summary(), indent=2, default=str)
            self._send(payload.encode("utf-8"), "application/json")
        elif path == "/healthz":
            self._send(b'{"status":"ok"}', "application/json")
        else:
            self._send(b"not found", "text/plain; charset=utf-8", status=404)


def serve(state: GuardianState, host: str = "127.0.0.1", port: int = 8787) -> None:
    """Run the dashboard until interrupted."""

    handler = partial(DashboardHandler, state=state)
    with ThreadingHTTPServer((host, port), handler) as httpd:
        LOGGER.info("dashboard listening", extra={"url": f"http://{host}:{port}/"})
        print(f"GUARDIAN dashboard: http://{host}:{port}/  (ctrl-c to stop)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            LOGGER.info("dashboard stopped")
