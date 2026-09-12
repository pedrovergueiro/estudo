"""Execution sandbox for candidate versions.

Candidates are pure functions over a feature vector, so the sandbox does not
need an OS-level jail to be meaningful: it needs to *prove* that a candidate
never reaches for the network, spawns a process, or writes to disk.  This
module installs process-local interposers for the duration of the evaluation
and records every attempt as a safety violation.

Limits of this approach are documented honestly in ``docs/THREAT_MODEL.md``:
it is an in-process guard for a research prototype, not a hypervisor.  The
container boundary (see ``Dockerfile``) is the outer layer.
"""

from __future__ import annotations

import builtins
import io
import os
import socket
import subprocess
import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Iterator, Sequence, TypeVar

from guardian.core.logging import get_logger
from guardian.core.permissions import PermissionSet, permissions_for
from guardian.core.types import OperationalMode
from guardian.safety.kernel import SafetyViolation
from guardian.safety.policy import DEFAULT_POLICY, SandboxPolicy

LOGGER = get_logger("sandbox")
T = TypeVar("T")

_WRITE_MODES = set("wxa+")


@dataclass
class SandboxReport:
    """What happened inside the sandbox."""

    allowed: bool = True
    violations: list[dict[str, Any]] = field(default_factory=list)
    wall_clock_s: float = 0.0
    budget_s: float = 0.0
    mode: str = OperationalMode.SANDBOX.value

    def record(self, kind: str, detail: str) -> None:
        self.allowed = False
        self.violations.append({"kind": kind, "detail": detail})

    def as_dict(self) -> dict[str, Any]:
        return {
            "allowed": self.allowed,
            "violations": self.violations,
            "wall_clock_s": round(self.wall_clock_s, 4),
            "budget_s": self.budget_s,
            "mode": self.mode,
        }


class SandboxEscape(SafetyViolation):
    """Raised when sandboxed code reaches for a forbidden resource."""


class Sandbox:
    """Restricted execution context for untrusted candidate code."""

    def __init__(
        self,
        *,
        policy: SandboxPolicy | None = None,
        mode: OperationalMode = OperationalMode.SANDBOX,
        allowed_read_roots: Sequence[Path] = (),
    ) -> None:
        self.policy = policy or DEFAULT_POLICY.sandbox
        self.mode = mode
        self.permissions: PermissionSet = permissions_for(mode)
        self.allowed_read_roots = tuple(
            Path(root).resolve() for root in (*self.policy.allowed_read_roots, *allowed_read_roots)
        )
        self.report = SandboxReport(budget_s=self.policy.wall_clock_budget_s, mode=mode.value)

    # -- interposers -----------------------------------------------------
    def _deny(self, kind: str, detail: str) -> None:
        self.report.record(kind, detail)
        LOGGER.warning(
            "sandbox blocked a forbidden operation", extra={"kind": kind, "detail": detail}
        )
        raise SandboxEscape(f"sandbox denied {kind}: {detail}", subject=kind)

    def _guarded_socket(self, *args: Any, **kwargs: Any) -> Any:
        self._deny("network", "socket.socket() call")

    def _guarded_connection(self, *args: Any, **kwargs: Any) -> Any:
        self._deny("network", "socket.create_connection() call")

    def _guarded_popen(self, *args: Any, **kwargs: Any) -> Any:
        self._deny("subprocess", f"process spawn: {args[0] if args else '?'}")

    def _guarded_system(self, command: str) -> int:
        self._deny("subprocess", f"os.system: {command}")
        return 1  # pragma: no cover - unreachable

    def _make_guarded_open(self, real_open: Callable[..., io.IOBase]) -> Callable[..., io.IOBase]:
        def guarded_open(file: Any, mode: str = "r", *args: Any, **kwargs: Any) -> io.IOBase:
            wants_write = bool(_WRITE_MODES.intersection(mode))
            if wants_write and not self.policy.allow_filesystem_write:
                self._deny("filesystem_write", f"open({file!r}, mode={mode!r})")
            if not wants_write and self.allowed_read_roots:
                try:
                    resolved = Path(os.fspath(file)).resolve()
                except TypeError:
                    return real_open(file, mode, *args, **kwargs)
                if not any(
                    resolved == root or root in resolved.parents
                    for root in self.allowed_read_roots
                ):
                    self._deny("filesystem_read", f"read outside allowed roots: {resolved}")
            return real_open(file, mode, *args, **kwargs)

        return guarded_open

    # -- context ---------------------------------------------------------
    @contextmanager
    def activate(self) -> Iterator["Sandbox"]:
        """Install the interposers for the duration of the block."""

        saved = {
            "socket.socket": socket.socket,
            "socket.create_connection": socket.create_connection,
            "subprocess.Popen": subprocess.Popen,
            "os.system": getattr(os, "system", None),
            "builtins.open": builtins.open,
        }
        if not self.policy.allow_network:
            socket.socket = self._guarded_socket  # type: ignore[assignment]
            socket.create_connection = self._guarded_connection  # type: ignore[assignment]
        if not self.policy.allow_subprocess:
            subprocess.Popen = self._guarded_popen  # type: ignore[assignment]
            if saved["os.system"] is not None:
                os.system = self._guarded_system  # type: ignore[assignment]
        builtins.open = self._make_guarded_open(saved["builtins.open"])  # type: ignore[assignment]

        started = time.perf_counter()
        try:
            yield self
        finally:
            socket.socket = saved["socket.socket"]  # type: ignore[assignment]
            socket.create_connection = saved["socket.create_connection"]  # type: ignore[assignment]
            subprocess.Popen = saved["subprocess.Popen"]  # type: ignore[assignment]
            if saved["os.system"] is not None:
                os.system = saved["os.system"]  # type: ignore[assignment]
            builtins.open = saved["builtins.open"]  # type: ignore[assignment]
            self.report.wall_clock_s = time.perf_counter() - started
            if self.report.wall_clock_s > self.policy.wall_clock_budget_s:
                self.report.record(
                    "time_budget",
                    f"{self.report.wall_clock_s:.2f}s exceeded budget "
                    f"{self.policy.wall_clock_budget_s:.2f}s",
                )

    def run(self, fn: Callable[..., T], *args: Any, **kwargs: Any) -> T:
        """Execute ``fn`` under the sandbox and return its result."""

        self.permissions.require("classify")
        with self.activate():
            return fn(*args, **kwargs)


def run_sandboxed(
    fn: Callable[..., T],
    *args: Any,
    mode: OperationalMode = OperationalMode.SANDBOX,
    **kwargs: Any,
) -> tuple[T, SandboxReport]:
    """Convenience wrapper returning both the result and the sandbox report."""

    sandbox = Sandbox(mode=mode)
    result = sandbox.run(fn, *args, **kwargs)
    return result, sandbox.report
