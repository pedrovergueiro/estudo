"""TOML-backed configuration with typed accessors and explicit defaults."""

from __future__ import annotations

import tomllib
from dataclasses import dataclass, field, replace
from pathlib import Path
from typing import Any, Mapping

PACKAGE_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CONFIG_PATH = PACKAGE_ROOT / "config" / "guardian.toml"


@dataclass(frozen=True)
class FitnessWeights:
    """Weights of the multi-objective fitness function.

    Deliberately *not* a single 'intelligence' scalar: a candidate that only
    raises capability while degrading safety or robustness scores worse than
    the incumbent.
    """

    capability_gain: float = 1.00
    robustness: float = 0.60
    detection_accuracy: float = 0.50
    efficiency: float = 0.20
    reliability: float = 0.40
    hallucination: float = 0.90
    false_positive: float = 0.70
    false_negative: float = 0.80
    safety_regression: float = 2.50


@dataclass(frozen=True)
class EvolutionConfig:
    population_size: int = 4
    max_patches_per_candidate: int = 3
    max_generations: int = 8
    exploration_rate: float = 0.35
    memory_penalty: float = 0.5


@dataclass(frozen=True)
class DataConfig:
    train_size: int = 900
    eval_size: int = 600
    holdout_size: int = 400
    noise_level: float = 0.12
    seed: int = 20260912


@dataclass(frozen=True)
class GuardianConfig:
    """Root configuration object."""

    seed: int = 20260912
    data_dir: Path = PACKAGE_ROOT.parent / "guardian_data"
    log_level: str = "INFO"
    log_json: bool = False
    fitness: FitnessWeights = field(default_factory=FitnessWeights)
    evolution: EvolutionConfig = field(default_factory=EvolutionConfig)
    data: DataConfig = field(default_factory=DataConfig)

    @property
    def db_path(self) -> Path:
        return self.data_dir / "guardian.db"

    @property
    def versions_dir(self) -> Path:
        return self.data_dir / "versions"

    @property
    def kernel_lock_path(self) -> Path:
        return self.data_dir / "kernel.lock"

    @property
    def log_path(self) -> Path:
        return self.data_dir / "guardian.log"

    def ensure_dirs(self) -> None:
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.versions_dir.mkdir(parents=True, exist_ok=True)

    def with_data_dir(self, path: Path) -> "GuardianConfig":
        return replace(self, data_dir=Path(path))


def _sub(mapping: Mapping[str, Any], key: str) -> dict[str, Any]:
    value = mapping.get(key, {})
    return dict(value) if isinstance(value, Mapping) else {}


def _filtered(cls: type, data: Mapping[str, Any]) -> dict[str, Any]:
    allowed = set(getattr(cls, "__dataclass_fields__", {}))
    return {k: v for k, v in data.items() if k in allowed}


def load_config(path: Path | str | None = None) -> GuardianConfig:
    """Load configuration from TOML, falling back to dataclass defaults."""

    target = Path(path) if path is not None else DEFAULT_CONFIG_PATH
    if not target.exists():
        return GuardianConfig()
    raw = tomllib.loads(target.read_text(encoding="utf-8"))
    guardian = _sub(raw, "guardian")
    data_dir = guardian.get("data_dir")
    resolved_dir = (
        Path(data_dir) if data_dir and Path(data_dir).is_absolute()
        else PACKAGE_ROOT.parent / (data_dir or "guardian_data")
    )
    return GuardianConfig(
        seed=int(guardian.get("seed", 20260912)),
        data_dir=resolved_dir,
        log_level=str(guardian.get("log_level", "INFO")),
        log_json=bool(guardian.get("log_json", False)),
        fitness=FitnessWeights(**_filtered(FitnessWeights, _sub(raw, "fitness"))),
        evolution=EvolutionConfig(**_filtered(EvolutionConfig, _sub(raw, "evolution"))),
        data=DataConfig(**_filtered(DataConfig, _sub(raw, "data"))),
    )
