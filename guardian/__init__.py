"""GUARDIAN — a research prototype for bounded, auditable self-improvement.

The system evolves its own *capabilities* (detectors, thresholds, decision
policy) while a safety kernel it cannot address, an adversarial red team with
opposing objectives, and an independent auditor decide whether any proposed
change is allowed to ship.
"""

from __future__ import annotations

__version__ = "0.1.0"
__all__ = ["__version__"]
