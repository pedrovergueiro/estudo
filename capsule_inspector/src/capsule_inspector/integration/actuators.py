"""Atuador de rejeição física — DESABILITADO por padrão.

Só é instanciado um atuador real quando `enabled: true` E
`interlock_validated: true` em configs/system.yaml, depois de testes com o
equipamento industrial real. A lógica é fail-safe: qualquer estado diferente
de PASS (incluindo SYSTEM_ERROR) aciona a rejeição. Esta camada NÃO substitui
intertravamentos de segurança de hardware (CLP, relé de segurança, sensores de
confirmação de rejeição).
"""

from __future__ import annotations

import logging
import time
from abc import ABC, abstractmethod

from ..config import ActuatorConfig
from ..types import InspectionStatus

log = logging.getLogger("capsule_inspector.actuator")


class RejectActuator(ABC):
    def __init__(self, cfg: ActuatorConfig):
        self.cfg = cfg
        self.reject_on = {InspectionStatus(s) for s in cfg.reject_on}

    def should_reject(self, status: InspectionStatus) -> bool:
        return status in self.reject_on

    def handle(self, status: InspectionStatus, inspection_id: str) -> bool:
        if self.should_reject(status):
            self._reject(inspection_id)
            return True
        return False

    @abstractmethod
    def _reject(self, inspection_id: str) -> None: ...

    def close(self) -> None:
        pass


class NullActuator(RejectActuator):
    """Registra a decisão de rejeição sem acionar hardware."""

    def __init__(self, cfg: ActuatorConfig):
        super().__init__(cfg)
        self.events: list[str] = []

    def _reject(self, inspection_id: str) -> None:
        self.events.append(inspection_id)
        log.info("rejeição simulada (atuador desabilitado)", extra={"extra_fields": {"id": inspection_id}})


class GpioRejectActuator(RejectActuator):
    def __init__(self, cfg: ActuatorConfig):
        super().__init__(cfg)
        try:
            from gpiozero import OutputDevice  # type: ignore[import-not-found]
        except ImportError as e:
            raise RuntimeError("gpiozero indisponível (apt install python3-gpiozero)") from e
        self.dev = OutputDevice(cfg.gpio_pin, active_high=True, initial_value=False)

    def _reject(self, inspection_id: str) -> None:
        self.dev.on()
        time.sleep(self.cfg.pulse_ms / 1000.0)
        self.dev.off()
        log.info("rejeição acionada", extra={"extra_fields": {"id": inspection_id, "pin": self.cfg.gpio_pin}})

    def close(self) -> None:
        self.dev.off()
        self.dev.close()


def create_actuator(cfg: ActuatorConfig) -> RejectActuator:
    if cfg.enabled and not cfg.interlock_validated:
        raise RuntimeError("reject_actuator.enabled=true exige interlock_validated=true após "
                           "validação com o equipamento real")
    if cfg.enabled and cfg.interlock_validated:
        return GpioRejectActuator(cfg)
    return NullActuator(cfg)
