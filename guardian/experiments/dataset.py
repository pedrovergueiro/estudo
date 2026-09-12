"""Deterministic generator of simulated security telemetry.

No real network data is touched: every event is synthesised from a seeded
per-class distribution, so experiments are exactly reproducible.  Events
carry a few free-text fields (``note``, ``user_agent``, ``url_text``) which
the classifier must ignore; the red team uses them to smuggle instruction
injection payloads.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Any, Iterable, Mapping, Sequence

from guardian.core.types import EventClass

#: Numeric features the classifier is allowed to read.
FEATURE_NAMES: tuple[str, ...] = (
    "unique_ports",
    "failed_logins",
    "bytes_out_kb",
    "bytes_in_kb",
    "conn_count",
    "duration_s",
    "payload_entropy",
    "beacon_interval_cv",
    "url_suspicion",
    "off_hours",
    "distinct_dst_hosts",
)

#: (mean, stddev) per class per feature.  ``off_hours`` is a probability.
_PROFILES: dict[str, dict[str, tuple[float, float]]] = {
    EventClass.BENIGN.value: {
        "unique_ports": (3.0, 1.5),
        "failed_logins": (0.4, 0.8),
        "bytes_out_kb": (120.0, 60.0),
        "bytes_in_kb": (400.0, 200.0),
        "conn_count": (8.0, 4.0),
        "duration_s": (45.0, 25.0),
        "payload_entropy": (3.2, 0.6),
        "beacon_interval_cv": (0.75, 0.20),
        "url_suspicion": (0.08, 0.06),
        "off_hours": (0.15, 0.0),
        "distinct_dst_hosts": (3.0, 1.5),
    },
    EventClass.PORT_SCAN.value: {
        "unique_ports": (45.0, 15.0),
        "failed_logins": (0.5, 0.8),
        "bytes_out_kb": (20.0, 10.0),
        "bytes_in_kb": (15.0, 8.0),
        "conn_count": (60.0, 20.0),
        "duration_s": (12.0, 6.0),
        "payload_entropy": (3.0, 0.5),
        "beacon_interval_cv": (0.90, 0.30),
        "url_suspicion": (0.05, 0.05),
        "off_hours": (0.35, 0.0),
        "distinct_dst_hosts": (12.0, 5.0),
    },
    EventClass.BRUTE_FORCE.value: {
        "unique_ports": (1.5, 0.8),
        "failed_logins": (38.0, 14.0),
        "bytes_out_kb": (60.0, 25.0),
        "bytes_in_kb": (40.0, 20.0),
        "conn_count": (45.0, 15.0),
        "duration_s": (90.0, 40.0),
        "payload_entropy": (3.4, 0.6),
        "beacon_interval_cv": (0.60, 0.25),
        "url_suspicion": (0.07, 0.06),
        "off_hours": (0.45, 0.0),
        "distinct_dst_hosts": (1.4, 0.7),
    },
    EventClass.EXFILTRATION.value: {
        "unique_ports": (2.0, 1.0),
        "failed_logins": (0.3, 0.6),
        "bytes_out_kb": (9000.0, 3500.0),
        "bytes_in_kb": (150.0, 80.0),
        "conn_count": (6.0, 3.0),
        "duration_s": (300.0, 120.0),
        "payload_entropy": (7.3, 0.4),
        "beacon_interval_cv": (0.70, 0.25),
        "url_suspicion": (0.10, 0.08),
        "off_hours": (0.55, 0.0),
        "distinct_dst_hosts": (1.6, 0.8),
    },
    EventClass.BEACONING.value: {
        "unique_ports": (1.2, 0.5),
        "failed_logins": (0.2, 0.5),
        "bytes_out_kb": (35.0, 12.0),
        "bytes_in_kb": (28.0, 10.0),
        "conn_count": (90.0, 25.0),
        "duration_s": (600.0, 180.0),
        "payload_entropy": (5.2, 0.8),
        "beacon_interval_cv": (0.06, 0.03),
        "url_suspicion": (0.18, 0.10),
        "off_hours": (0.50, 0.0),
        "distinct_dst_hosts": (1.2, 0.5),
    },
    EventClass.PHISHING.value: {
        "unique_ports": (1.5, 0.7),
        "failed_logins": (0.6, 1.0),
        "bytes_out_kb": (45.0, 20.0),
        "bytes_in_kb": (700.0, 250.0),
        "conn_count": (4.0, 2.0),
        "duration_s": (35.0, 18.0),
        "payload_entropy": (4.0, 0.7),
        "beacon_interval_cv": (0.85, 0.30),
        "url_suspicion": (0.82, 0.12),
        "off_hours": (0.50, 0.0),
        "distinct_dst_hosts": (2.0, 1.0),
    },
}

_NON_NEGATIVE = set(FEATURE_NAMES)
_UPPER_BOUNDS = {"payload_entropy": 8.0, "url_suspicion": 1.0, "off_hours": 1.0}

_NOTES = (
    "routine telemetry sample",
    "collector: edge-sensor-02",
    "auto-generated synthetic record",
    "sensor heartbeat attached",
)


@dataclass(frozen=True)
class SecurityEvent:
    """One simulated security event."""

    event_id: str
    features: dict[str, float]
    label: str
    note: str = ""
    user_agent: str = "synthetic-sensor/1.0"
    url_text: str = "https://internal.example/telemetry"
    metadata: dict[str, Any] = field(default_factory=dict)

    def with_text(self, **overrides: str) -> "SecurityEvent":
        """Return a copy with free-text fields replaced (numbers untouched)."""

        return SecurityEvent(
            event_id=self.event_id,
            features=dict(self.features),
            label=self.label,
            note=overrides.get("note", self.note),
            user_agent=overrides.get("user_agent", self.user_agent),
            url_text=overrides.get("url_text", self.url_text),
            metadata=dict(self.metadata),
        )

    def with_features(self, features: Mapping[str, float]) -> "SecurityEvent":
        merged = dict(self.features)
        merged.update(features)
        return SecurityEvent(
            event_id=self.event_id,
            features=merged,
            label=self.label,
            note=self.note,
            user_agent=self.user_agent,
            url_text=self.url_text,
            metadata=dict(self.metadata),
        )

    def as_dict(self) -> dict[str, Any]:
        return {
            "event_id": self.event_id,
            "features": dict(self.features),
            "label": self.label,
            "note": self.note,
        }


@dataclass(frozen=True)
class Dataset:
    """An immutable, named collection of events."""

    name: str
    events: tuple[SecurityEvent, ...]
    seed: int

    def __len__(self) -> int:
        return len(self.events)

    def __iter__(self):
        return iter(self.events)

    @property
    def labels(self) -> tuple[str, ...]:
        return tuple(event.label for event in self.events)

    def class_counts(self) -> dict[str, int]:
        counts = {name: 0 for name in EventClass.values()}
        for event in self.events:
            counts[event.label] = counts.get(event.label, 0) + 1
        return counts

    def filter(self, label: str) -> "Dataset":
        return Dataset(
            name=f"{self.name}:{label}",
            events=tuple(e for e in self.events if e.label == label),
            seed=self.seed,
        )

    def fingerprint(self) -> str:
        import hashlib

        digest = hashlib.sha256()
        digest.update(f"{self.name}|{self.seed}|{len(self.events)}".encode("utf-8"))
        for event in self.events:
            digest.update(event.event_id.encode("utf-8"))
        return digest.hexdigest()[:16]


def _sample_feature(rng: random.Random, feature: str, mean: float, std: float) -> float:
    if feature == "off_hours":
        return 1.0 if rng.random() < mean else 0.0
    value = rng.gauss(mean, std)
    if feature in _NON_NEGATIVE:
        value = max(0.0, value)
    upper = _UPPER_BOUNDS.get(feature)
    if upper is not None:
        value = min(upper, value)
    return round(value, 4)


def generate_dataset(
    name: str,
    size: int,
    *,
    seed: int,
    noise_level: float = 0.12,
    class_weights: Mapping[str, float] | None = None,
) -> Dataset:
    """Generate a reproducible dataset.

    ``noise_level`` blends a fraction of events toward the benign profile,
    creating genuine class overlap so perfect accuracy is not attainable.
    """

    rng = random.Random(seed)
    classes = EventClass.values()
    weights = [float((class_weights or {}).get(cls, 1.0)) for cls in classes]
    events: list[SecurityEvent] = []
    for index in range(size):
        label = rng.choices(classes, weights=weights, k=1)[0]
        profile = _PROFILES[label]
        features = {
            feature: _sample_feature(rng, feature, *profile[feature])
            for feature in FEATURE_NAMES
        }
        if rng.random() < noise_level and label != EventClass.BENIGN.value:
            benign = _PROFILES[EventClass.BENIGN.value]
            blend = rng.uniform(0.35, 0.75)
            for feature in FEATURE_NAMES:
                if feature == "off_hours":
                    continue
                benign_value = _sample_feature(rng, feature, *benign[feature])
                features[feature] = round(
                    (1.0 - blend) * features[feature] + blend * benign_value, 4
                )
        events.append(
            SecurityEvent(
                event_id=f"{name}-{index:06d}",
                features=features,
                label=label,
                note=rng.choice(_NOTES),
            )
        )
    return Dataset(name=name, events=tuple(events), seed=seed)


def perturb(dataset: Dataset, *, seed: int, magnitude: float = 0.18) -> Dataset:
    """Robustness set: jitter every numeric feature without changing labels."""

    rng = random.Random(seed)
    perturbed: list[SecurityEvent] = []
    for event in dataset.events:
        features = {}
        for feature, value in event.features.items():
            if feature == "off_hours":
                features[feature] = value if rng.random() > magnitude else 1.0 - value
                continue
            scale = 1.0 + rng.uniform(-magnitude, magnitude)
            jittered = max(0.0, value * scale)
            upper = _UPPER_BOUNDS.get(feature)
            if upper is not None:
                jittered = min(upper, jittered)
            features[feature] = round(jittered, 4)
        perturbed.append(event.with_features(features))
    return Dataset(
        name=f"{dataset.name}-perturbed", events=tuple(perturbed), seed=seed
    )


def feature_statistics(
    events: Sequence[SecurityEvent] | Iterable[SecurityEvent],
) -> dict[str, dict[str, float]]:
    """Per-feature mean/std over a collection of events."""

    collected: dict[str, list[float]] = {name: [] for name in FEATURE_NAMES}
    for event in events:
        for feature in FEATURE_NAMES:
            collected[feature].append(float(event.features.get(feature, 0.0)))
    stats: dict[str, dict[str, float]] = {}
    for feature, values in collected.items():
        if not values:
            stats[feature] = {"mean": 0.0, "std": 0.0, "count": 0}
            continue
        mean = sum(values) / len(values)
        variance = sum((v - mean) ** 2 for v in values) / max(1, len(values) - 1)
        stats[feature] = {
            "mean": mean,
            "std": variance**0.5,
            "count": float(len(values)),
            "p25": _quantile(values, 0.25),
            "p50": _quantile(values, 0.50),
            "p75": _quantile(values, 0.75),
        }
    return stats


def _quantile(values: Sequence[float], q: float) -> float:
    ordered = sorted(values)
    if not ordered:
        return 0.0
    position = q * (len(ordered) - 1)
    low = int(position)
    high = min(low + 1, len(ordered) - 1)
    weight = position - low
    return ordered[low] * (1 - weight) + ordered[high] * weight


def build_splits(
    *, seed: int, train_size: int, eval_size: int, holdout_size: int, noise_level: float
) -> dict[str, Dataset]:
    """Train / eval / holdout splits generated from disjoint seeds."""

    return {
        "train": generate_dataset("train", train_size, seed=seed, noise_level=noise_level),
        "eval": generate_dataset("eval", eval_size, seed=seed + 101, noise_level=noise_level),
        "holdout": generate_dataset(
            "holdout", holdout_size, seed=seed + 202, noise_level=noise_level
        ),
    }
