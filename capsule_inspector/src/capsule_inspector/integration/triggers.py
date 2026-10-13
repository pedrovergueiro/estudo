"""Gatilho de inspeção: intervalo fixo, sensor de presença em GPIO ou contínuo."""

from __future__ import annotations

import threading
import time
from abc import ABC, abstractmethod

from ..config import TriggerConfig


class Trigger(ABC):
    @abstractmethod
    def wait(self, stop: threading.Event, timeout: float = 1.0) -> bool:
        """True se deve inspecionar agora; False em timeout ou parada."""

    def close(self) -> None:
        pass


class IntervalTrigger(Trigger):
    def __init__(self, interval_s: float):
        self.interval = max(0.0, interval_s)
        self._next = time.monotonic()

    def wait(self, stop: threading.Event, timeout: float = 1.0) -> bool:
        delay = self._next - time.monotonic()
        if delay > 0:
            if stop.wait(min(delay, timeout)):
                return False
            if self._next - time.monotonic() > 0:
                return False
        self._next = max(self._next + self.interval, time.monotonic())
        return not stop.is_set()


class GpioPresenceTrigger(Trigger):
    """Sensor de presença (borda de subida) via gpiozero."""

    def __init__(self, pin: int):
        try:
            from gpiozero import DigitalInputDevice  # type: ignore[import-not-found]
        except ImportError as e:
            raise RuntimeError("gpiozero indisponível (apt install python3-gpiozero)") from e
        self.dev = DigitalInputDevice(pin, pull_up=False)
        self._evt = threading.Event()
        self.dev.when_activated = self._evt.set

    def wait(self, stop: threading.Event, timeout: float = 1.0) -> bool:
        fired = self._evt.wait(timeout)
        self._evt.clear()
        return fired and not stop.is_set()

    def close(self) -> None:
        self.dev.close()


class ContinuousTrigger(Trigger):
    def wait(self, stop: threading.Event, timeout: float = 1.0) -> bool:
        return not stop.is_set()


def create_trigger(cfg: TriggerConfig) -> Trigger:
    if cfg.type == "gpio":
        return GpioPresenceTrigger(cfg.gpio_pin)
    if cfg.type == "interval":
        return IntervalTrigger(cfg.interval_s)
    return ContinuousTrigger()
