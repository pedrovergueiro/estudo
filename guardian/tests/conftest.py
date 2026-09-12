"""Shared fixtures: a throwaway Guardian on a temporary data directory."""

from __future__ import annotations

from pathlib import Path
from typing import Iterator

import pytest

from guardian.core.config import DataConfig, EvolutionConfig, GuardianConfig
from guardian.core.state import GuardianState
from guardian.evolution.loop import EvolutionEngine
from guardian.experiments.dataset import build_splits
from guardian.safety.kernel import SafetyKernel


@pytest.fixture()
def kernel() -> SafetyKernel:
    return SafetyKernel()


@pytest.fixture()
def fast_config(tmp_path: Path) -> GuardianConfig:
    """A small, fast configuration that still clears the policy's sample gate."""

    return GuardianConfig(
        seed=4242,
        data_dir=tmp_path / "data",
        log_level="WARNING",
        evolution=EvolutionConfig(population_size=3, max_generations=2),
        data=DataConfig(train_size=600, eval_size=300, holdout_size=640, noise_level=0.12, seed=4242),
    )


@pytest.fixture()
def state(fast_config: GuardianConfig) -> Iterator[GuardianState]:
    guardian = GuardianState.bootstrap(fast_config)
    try:
        yield guardian
    finally:
        guardian.close()


@pytest.fixture()
def engine(state: GuardianState) -> EvolutionEngine:
    return EvolutionEngine(state)


@pytest.fixture()
def splits(fast_config: GuardianConfig):
    return build_splits(
        seed=fast_config.data.seed,
        train_size=fast_config.data.train_size,
        eval_size=fast_config.data.eval_size,
        holdout_size=fast_config.data.holdout_size,
        noise_level=fast_config.data.noise_level,
    )
