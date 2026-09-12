"""Version records, lineage and the version manager.

A version is never overwritten.  Every accepted mutation produces a new
numbered version whose full genome, hash, metrics and parent pointer are
persisted to disk, so any earlier state can be restored byte-for-byte.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterator, Mapping

from guardian.core.types import VersionStatus


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def genome_hash(genome: Mapping[str, Any]) -> str:
    blob = json.dumps(genome, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


@dataclass
class VersionRecord:
    """One immutable point in Guardian's lineage."""

    version_id: str
    parent_version: str | None
    genome: dict[str, Any]
    status: str = VersionStatus.CANDIDATE.value
    created_at: str = field(default_factory=utcnow)
    experiment_id: str | None = None
    metrics: dict[str, Any] = field(default_factory=dict)
    notes: str = ""
    rollback_point: str | None = None

    @property
    def hash(self) -> str:
        return genome_hash(self.genome)

    @property
    def numeric(self) -> tuple[int, int]:
        try:
            major, minor = self.version_id.split(".", 1)
            return int(major), int(minor)
        except ValueError:  # pragma: no cover - defensive
            return (0, 0)

    def as_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["hash"] = self.hash
        return data


class VersionManager:
    """Append-only store of versions on disk."""

    def __init__(self, versions_dir: Path) -> None:
        self.versions_dir = Path(versions_dir)
        self.versions_dir.mkdir(parents=True, exist_ok=True)
        self._index_path = self.versions_dir / "index.json"

    # -- persistence -----------------------------------------------------
    def _path_for(self, version_id: str) -> Path:
        return self.versions_dir / f"guardian-{version_id}.json"

    def _load_index(self) -> dict[str, Any]:
        if not self._index_path.exists():
            return {"active": None, "last_safe": None, "versions": []}
        return json.loads(self._index_path.read_text(encoding="utf-8"))

    def _save_index(self, index: Mapping[str, Any]) -> None:
        self._index_path.write_text(
            json.dumps(index, indent=2, sort_keys=True), encoding="utf-8"
        )

    # -- writes ----------------------------------------------------------
    def save(self, record: VersionRecord) -> VersionRecord:
        """Persist a version.  Refuses to silently overwrite a different genome."""

        path = self._path_for(record.version_id)
        if path.exists():
            existing = json.loads(path.read_text(encoding="utf-8"))
            if existing.get("hash") != record.hash:
                raise ValueError(
                    f"refusing to overwrite version {record.version_id}: "
                    "genome hash differs from the stored one"
                )
        path.write_text(
            json.dumps(record.as_dict(), indent=2, sort_keys=True), encoding="utf-8"
        )
        index = self._load_index()
        known = {entry["version_id"]: entry for entry in index["versions"]}
        known[record.version_id] = {
            "version_id": record.version_id,
            "parent_version": record.parent_version,
            "status": record.status,
            "hash": record.hash,
            "created_at": record.created_at,
            "experiment_id": record.experiment_id,
        }
        index["versions"] = sorted(known.values(), key=lambda e: e["created_at"])
        self._save_index(index)
        return record

    def set_status(self, version_id: str, status: VersionStatus | str) -> VersionRecord:
        record = self.load(version_id)
        record.status = status.value if isinstance(status, VersionStatus) else status
        return self.save(record)

    def next_version_id(self, parent: str | None) -> str:
        """Increment the minor component; majors are reserved for humans."""

        if parent is None:
            return "0.1"
        major, minor = (int(part) for part in parent.split(".", 1))
        taken = {entry["version_id"] for entry in self._load_index()["versions"]}
        candidate = f"{major}.{minor + 1}"
        bump = minor + 1
        while candidate in taken:
            bump += 1
            candidate = f"{major}.{bump}"
        return candidate

    # -- reads -----------------------------------------------------------
    def exists(self, version_id: str) -> bool:
        return self._path_for(version_id).exists()

    def load(self, version_id: str) -> VersionRecord:
        path = self._path_for(version_id)
        if not path.exists():
            raise KeyError(f"unknown version: {version_id}")
        data = json.loads(path.read_text(encoding="utf-8"))
        data.pop("hash", None)
        return VersionRecord(**data)

    def all_versions(self) -> list[VersionRecord]:
        return [self.load(e["version_id"]) for e in self._load_index()["versions"]]

    def lineage(self, version_id: str) -> list[VersionRecord]:
        """Walk from the given version back to the root."""

        chain: list[VersionRecord] = []
        seen: set[str] = set()
        current: str | None = version_id
        while current and current not in seen:
            seen.add(current)
            record = self.load(current)
            chain.append(record)
            current = record.parent_version
        return list(reversed(chain))

    def iter_status(self, status: VersionStatus | str) -> Iterator[VersionRecord]:
        wanted = status.value if isinstance(status, VersionStatus) else status
        for record in self.all_versions():
            if record.status == wanted:
                yield record

    # -- active / rollback pointers --------------------------------------
    @property
    def active_version_id(self) -> str | None:
        return self._load_index().get("active")

    @property
    def last_safe_version_id(self) -> str | None:
        return self._load_index().get("last_safe")

    def set_active(self, version_id: str, *, mark_safe: bool = False) -> None:
        if not self.exists(version_id):
            raise KeyError(f"unknown version: {version_id}")
        index = self._load_index()
        index["active"] = version_id
        if mark_safe:
            index["last_safe"] = version_id
        self._save_index(index)

    def mark_safe(self, version_id: str) -> None:
        index = self._load_index()
        index["last_safe"] = version_id
        self._save_index(index)
