"""Carregamento e validação das configurações YAML.

Todas as configurações são validadas com Pydantic (chaves desconhecidas geram
erro, para que erros de digitação não passem silenciosamente). O conjunto
carregado recebe um hash SHA-256 canônico que é gravado em cada resultado de
inspeção, junto com as versões declaradas em cada arquivo.
"""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from typing import Any, Literal

import yaml
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

Severity = Literal["none", "minor", "major", "critical"]
Action = Literal["PASS", "FAIL", "REVIEW", "SYSTEM_ERROR"]
AcquisitionKind = Literal["diffuse", "backlight", "side_light", "other"]


class ConfigError(RuntimeError):
    pass


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


# --------------------------------------------------------------------------- taxonomy
class ClassSpec(_Strict):
    key: str
    role: Literal["object", "defect", "anomaly"]
    display_name: str
    enabled: bool = True
    severity: Severity = "major"
    validated: bool = False
    aliases: list[str] = Field(default_factory=list)
    requires_acquisition: list[AcquisitionKind] = Field(default_factory=list)
    notes: str | None = None

    @field_validator("key")
    @classmethod
    def _key_ok(cls, v: str) -> str:
        if not v or not v.replace("_", "").isalnum() or v.lower() != v:
            raise ValueError(f"chave de classe inválida: {v!r} (use snake_case minúsculo)")
        return v


class Taxonomy(_Strict):
    taxonomy_version: str
    classes: list[ClassSpec]

    @model_validator(mode="after")
    def _unique(self) -> Taxonomy:
        keys = [c.key for c in self.classes]
        if len(keys) != len(set(keys)):
            raise ValueError("chaves de classe duplicadas na taxonomia")
        seen: dict[str, str] = {}
        for c in self.classes:
            for a in [c.key, *c.aliases]:
                a = a.lower()
                if a in seen and seen[a] != c.key:
                    raise ValueError(f"alias {a!r} usado por {seen[a]} e {c.key}")
                seen[a] = c.key
        objects = [c for c in self.classes if c.role == "object" and c.enabled]
        if len(objects) > 1:
            raise ValueError("no máximo uma classe 'object' habilitada (a cápsula)")
        return self

    def training_names(self) -> list[str]:
        """Nomes na ordem dos IDs YOLO (classes habilitadas de detector)."""
        return [c.key for c in self.classes if c.enabled and c.role in ("object", "defect")]

    def spec(self, key: str) -> ClassSpec:
        for c in self.classes:
            if c.key == key:
                return c
        raise KeyError(key)

    def get(self, key: str) -> ClassSpec | None:
        try:
            return self.spec(key)
        except KeyError:
            return None

    def resolve_alias(self, name: str) -> str | None:
        """Mapeia um nome de classe externo para a chave da taxonomia (ou None)."""
        n = name.strip().lower().replace(" ", "_").replace("-", "_")
        for c in self.classes:
            if n == c.key or n in [a.lower() for a in c.aliases]:
                return c.key
        return None


# --------------------------------------------------------------------------- dataset
class SplitConfig(_Strict):
    seed: int = 0
    ratios: dict[str, float] = Field(default_factory=lambda: {"train": 0.7, "val": 0.15, "test": 0.15})
    group_by: list[str] = Field(default_factory=lambda: ["unit_id", "lot", "session"])
    near_duplicate_ncc: float = 0.995
    holdout_lots: list[str] = Field(default_factory=list)

    @field_validator("ratios")
    @classmethod
    def _ratios(cls, v: dict[str, float]) -> dict[str, float]:
        if set(v) != {"train", "val", "test"}:
            raise ValueError("ratios deve conter exatamente train, val, test")
        if abs(sum(v.values()) - 1.0) > 1e-6 or min(v.values()) < 0:
            raise ValueError("ratios deve somar 1.0 e ser não negativo")
        return v


class DatasetValidationConfig(_Strict):
    min_box_size_px: float = 2
    max_aspect_ratio_image: float = 4.0
    min_instances_per_enabled_class: int = 30
    imbalance_warning_ratio: float = 20.0
    near_duplicate_ncc: float = 0.995


class DatasetSource(_Strict):
    title: str
    info_url: str
    access: str
    license: str
    commercial_use: str
    expected_format: str
    direct_url: str | None = None
    sha256: str | None = None


class WorkingDataset(_Strict):
    name: str
    root: str
    task: Literal["detect", "segment"] = "detect"
    metadata_csv: str | None = None


class DatasetConfig(_Strict):
    dataset_version: str
    paths: dict[str, str]
    working_dataset: WorkingDataset
    metadata_columns: list[str]
    split: SplitConfig
    validation: DatasetValidationConfig
    sources: dict[str, DatasetSource] = Field(default_factory=dict)


# --------------------------------------------------------------------------- train
class TrainConfig(_Strict):
    train_version: str
    model: str
    task: Literal["detect", "segment"] = "detect"
    seed: int = 0
    deterministic: bool = True
    device: str = "cpu"
    workers: int = 4
    project: str = "runs/train"
    name: str = "baseline"
    hyperparameters: dict[str, Any] = Field(default_factory=dict)
    experiments: dict[str, dict[str, Any]] = Field(default_factory=dict)

    def with_experiment(self, name: str | None) -> TrainConfig:
        if not name:
            return self
        if name not in self.experiments:
            raise ConfigError(f"experimento desconhecido: {name}; opções: {sorted(self.experiments)}")
        over = self.experiments[name] or {}
        data = self.model_dump()
        hp = dict(data["hyperparameters"])
        hp.update(over.get("hyperparameters", {}))
        for k, v in over.items():
            if k != "hyperparameters":
                data[k] = v
        data["hyperparameters"] = hp
        data["name"] = name
        return TrainConfig.model_validate(data)


# --------------------------------------------------------------------------- inference
class ModelSection(_Strict):
    registry_dir: str = "models/registry"
    path_override: str | None = None
    backend: Literal["auto", "onnxruntime", "ultralytics", "opencv_dnn"] = "auto"
    imgsz: int = 640
    nms_iou: float = 0.5
    candidate_conf: float = 0.05
    max_det: int = 100
    num_threads: int = 4
    warmup_runs: int = 3


class RoiSection(_Strict):
    method: Literal["detector", "classical"] = "detector"
    margin_px: int = 12
    crop_second_stage: bool = False


class AnomalySection(_Strict):
    enabled: bool = False
    model_path: str = "models/anomaly/patchcore_lite.npz"


class AnnotationSection(_Strict):
    save_original: bool = True
    save_annotated: bool = True
    jpeg_quality: int = 92


class InferenceConfig(_Strict):
    inference_version: str
    model: ModelSection
    profile: str
    roi: RoiSection = Field(default_factory=RoiSection)
    anomaly: AnomalySection = Field(default_factory=AnomalySection)
    annotation: AnnotationSection = Field(default_factory=AnnotationSection)


# --------------------------------------------------------------------------- decision
class Thresholds(_Strict):
    fail: float
    review: float

    @model_validator(mode="after")
    def _order(self) -> Thresholds:
        if not (0.0 <= self.review <= self.fail <= 1.0):
            raise ValueError("exige 0 <= review <= fail <= 1")
        return self


class QualityThresholds(_Strict):
    min_mean_intensity: float = 25
    max_mean_intensity: float = 235
    max_saturated_fraction: float = 0.08
    min_sharpness_laplacian_var: float = 15.0
    border_margin_px: int = 3
    min_capsule_area_fraction: float = 0.005


class PassRequires(_Strict):
    validated_profile: bool = True
    approved_model: bool = True
    validated_critical_classes: bool = True
    required_acquisition_present: bool = True


class DecisionRules(_Strict):
    rules_version: str
    capsule_class: str = "capsule"
    capsule_min_confidence: float = 0.4
    expected_capsules: dict[str, int] = Field(default_factory=lambda: {"min": 1, "max": 1})
    default_thresholds: Thresholds
    class_thresholds: dict[str, Thresholds] = Field(default_factory=dict)
    severity_actions: dict[Severity, Action] = Field(
        default_factory=lambda: {"critical": "FAIL", "major": "FAIL", "minor": "REVIEW"})
    max_defects_per_capsule_before_review: int = 6
    unassociated_defect_action: Action = "REVIEW"
    anomaly_action: Literal["REVIEW", "FAIL"] = "REVIEW"
    quality_failure_action: Literal["REVIEW", "SYSTEM_ERROR"] = "REVIEW"
    pass_requires: PassRequires = Field(default_factory=PassRequires)
    quality: QualityThresholds = Field(default_factory=QualityThresholds)

    def thresholds_for(self, cls: str) -> Thresholds:
        return self.class_thresholds.get(cls, self.default_thresholds)

    def min_review_threshold(self) -> float:
        vals = [self.default_thresholds.review] + [t.review for t in self.class_thresholds.values()]
        return min(vals)


# --------------------------------------------------------------------------- camera
class UsbCameraConfig(_Strict):
    device: int | str = 0
    backend: Literal["v4l2", "any"] = "v4l2"
    width: int = 1920
    height: int = 1080
    fps: int = 30
    fourcc: str | None = "MJPG"
    auto_exposure: bool = False
    exposure: float | None = None
    autofocus: bool = False
    focus: float | None = None
    auto_white_balance: bool = False
    white_balance_temperature: float | None = None
    warmup_frames: int = 10
    flush_frames: int = 2
    read_timeout_s: float = 2.0
    reconnect_attempts: int = 5
    reconnect_backoff_s: float = 1.0


class LibcameraConfig(_Strict):
    width: int = 2028
    height: int = 1520
    exposure_us: int | None = 8000
    analogue_gain: float | None = 1.0
    awb_enable: bool = False
    colour_gains: list[float] | None = None
    warmup_s: float = 1.0


class FileSourceConfig(_Strict):
    path: str = "data/samples"
    pattern: str = "*.png"
    loop: bool = False


class CsiCameraConfig(_Strict):
    """Câmera CSI via rpicam-vid (fluxo MJPEG)."""
    width: int = 1920
    height: int = 1080
    fps: int = 15
    extra_args: list[str] = Field(default_factory=list)


class CameraConfig(_Strict):
    camera_version: str
    # auto: USB (UVC) se houver; senão CSI (rpicam-vid); libcamera = Picamera2 (Python do sistema)
    type: Literal["usb", "csi", "libcamera", "file", "auto"]
    usb: UsbCameraConfig = Field(default_factory=UsbCameraConfig)
    libcamera: LibcameraConfig = Field(default_factory=LibcameraConfig)
    csi: CsiCameraConfig = Field(default_factory=CsiCameraConfig)
    file: FileSourceConfig = Field(default_factory=FileSourceConfig)


# --------------------------------------------------------------------------- lighting
class AcquisitionStep(_Strict):
    name: str
    kind: AcquisitionKind
    light: str
    exposure: float | None = None


class LightingProfile(_Strict):
    product_family: str
    finish: Literal["opaque", "translucent", "transparent"]
    color: str
    geometry: dict[str, Any] = Field(default_factory=dict)
    validated: bool = False
    background: str = ""
    acquisition: dict[str, list[AcquisitionStep]]
    fusion: dict[str, str] = Field(default_factory=lambda: {"mode": "none"})
    preprocessing: list[dict[str, Any]] = Field(default_factory=list)

    @property
    def steps(self) -> list[AcquisitionStep]:
        return self.acquisition.get("steps", [])

    @property
    def fusion_mode(self) -> str:
        return self.fusion.get("mode", "none")

    @model_validator(mode="after")
    def _check(self) -> LightingProfile:
        if not self.steps:
            raise ValueError("perfil sem acquisition.steps")
        if self.fusion_mode not in ("none", "late_union", "early_channels"):
            raise ValueError(f"fusion.mode inválido: {self.fusion_mode}")
        return self


class LightingProfiles(_Strict):
    lighting_profiles_version: str
    profiles: dict[str, LightingProfile]


# --------------------------------------------------------------------------- system
class RetentionConfig(_Strict):
    pass_images_days: float = 7
    review_images_days: float = 90
    fail_images_days: float = 90
    max_images_gb: float = 20.0
    min_free_disk_gb: float = 2.0


class StorageConfig(_Strict):
    root: str = "var"
    database: str = "var/inspections.sqlite3"
    images_dir: str = "var/images"
    status_file: str = "var/status.json"
    retention: RetentionConfig = Field(default_factory=RetentionConfig)


class LoggingConfig(_Strict):
    dir: str = "var/logs"
    level: str = "INFO"
    max_bytes: int = 10 * 1024 * 1024
    backup_count: int = 10


class InterfaceConfig(_Strict):
    host: str = "127.0.0.1"
    port: int = 8080
    auth_token_env: str = "CAPSULE_UI_TOKEN"
    recent_limit: int = 50


class TriggerConfig(_Strict):
    type: Literal["interval", "gpio", "none"] = "interval"
    interval_s: float = 1.0
    gpio_pin: int = 17


class ActuatorConfig(_Strict):
    enabled: bool = False
    interlock_validated: bool = False
    type: Literal["gpio"] = "gpio"
    gpio_pin: int = 27
    pulse_ms: int = 50
    reject_on: list[Action] = Field(default_factory=lambda: ["FAIL", "REVIEW", "SYSTEM_ERROR"])

    @model_validator(mode="after")
    def _failsafe(self) -> ActuatorConfig:
        if "SYSTEM_ERROR" not in self.reject_on:
            raise ValueError("reject_on deve incluir SYSTEM_ERROR (fail-safe)")
        if "PASS" in self.reject_on:
            raise ValueError("reject_on não pode incluir PASS")
        return self


class PublisherConfig(_Strict):
    enabled: bool = False
    url: str | None = None
    timeout_s: float = 3.0
    include_images: bool = False
    max_outbox: int = 10000


class IntegrationConfig(_Strict):
    trigger: TriggerConfig = Field(default_factory=TriggerConfig)
    reject_actuator: ActuatorConfig = Field(default_factory=ActuatorConfig)
    publisher: PublisherConfig = Field(default_factory=PublisherConfig)


class SystemConfig(_Strict):
    system_version: str
    deployment_mode: Literal["experimental", "production"] = "experimental"
    storage: StorageConfig = Field(default_factory=StorageConfig)
    logging: LoggingConfig = Field(default_factory=LoggingConfig)
    interface: InterfaceConfig = Field(default_factory=InterfaceConfig)
    integration: IntegrationConfig = Field(default_factory=IntegrationConfig)


# --------------------------------------------------------------------------- loader
FILES = {
    "taxonomy": ("taxonomy.yaml", Taxonomy),
    "dataset": ("dataset.yaml", DatasetConfig),
    "train": ("train.yaml", TrainConfig),
    "inference": ("inference.yaml", InferenceConfig),
    "decision": ("decision_rules.yaml", DecisionRules),
    "camera": ("camera.yaml", CameraConfig),
    "lighting": ("lighting_profiles.yaml", LightingProfiles),
    "system": ("system.yaml", SystemConfig),
}


def find_project_root(start: Path | None = None) -> Path:
    env = os.environ.get("CAPSULE_INSPECTOR_ROOT")
    if env:
        return Path(env).resolve()
    here = (start or Path.cwd()).resolve()
    for p in [here, *here.parents]:
        if (p / "configs" / "taxonomy.yaml").exists() and (p / "pyproject.toml").exists():
            return p
    # fallback: a partir da localização do pacote (instalação editável)
    pkg_root = Path(__file__).resolve().parents[2]
    if (pkg_root / "configs").exists():
        return pkg_root
    raise ConfigError("raiz do projeto não encontrada; defina CAPSULE_INSPECTOR_ROOT")


def read_yaml(path: Path) -> dict[str, Any]:
    try:
        with open(path, encoding="utf-8") as fh:
            data = yaml.safe_load(fh)
    except FileNotFoundError as e:
        raise ConfigError(f"arquivo de configuração ausente: {path}") from e
    except yaml.YAMLError as e:
        raise ConfigError(f"YAML inválido em {path}: {e}") from e
    if not isinstance(data, dict):
        raise ConfigError(f"{path}: conteúdo deve ser um mapeamento")
    return data


def canonical_hash(obj: Any) -> str:
    blob = json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False, default=str)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()


class Settings:
    """Conjunto completo de configurações validadas."""

    def __init__(self, root: Path, config_dir: Path, parts: dict[str, BaseModel]):
        self.root = root
        self.config_dir = config_dir
        self.taxonomy: Taxonomy = parts["taxonomy"]  # type: ignore[assignment]
        self.dataset: DatasetConfig = parts["dataset"]  # type: ignore[assignment]
        self.train: TrainConfig = parts["train"]  # type: ignore[assignment]
        self.inference: InferenceConfig = parts["inference"]  # type: ignore[assignment]
        self.decision: DecisionRules = parts["decision"]  # type: ignore[assignment]
        self.camera: CameraConfig = parts["camera"]  # type: ignore[assignment]
        self.lighting: LightingProfiles = parts["lighting"]  # type: ignore[assignment]
        self.system: SystemConfig = parts["system"]  # type: ignore[assignment]
        self._parts = parts
        self.overlay_dir: Path | None = None
        self._cross_validate()

    def _cross_validate(self) -> None:
        names = self.taxonomy.training_names()
        if self.decision.capsule_class not in names:
            raise ConfigError(f"capsule_class {self.decision.capsule_class!r} não está habilitada na taxonomia")
        for cls in self.decision.class_thresholds:
            if self.taxonomy.get(cls) is None:
                raise ConfigError(f"decision_rules: classe desconhecida {cls!r}")
        if self.inference.profile not in self.lighting.profiles:
            raise ConfigError(f"perfil {self.inference.profile!r} não existe em lighting_profiles.yaml")
        if self.inference.model.candidate_conf > self.decision.min_review_threshold():
            raise ConfigError(
                "inference.model.candidate_conf maior que o menor limiar de revisão: "
                "detecções fracas seriam descartadas antes de gerar REVIEW")

    def path(self, rel: str | os.PathLike[str]) -> Path:
        p = Path(rel)
        return p if p.is_absolute() else self.root / p

    @property
    def active_profile(self) -> LightingProfile:
        return self.lighting.profiles[self.inference.profile]

    def versions(self) -> dict[str, str]:
        return {
            "taxonomy": self.taxonomy.taxonomy_version,
            "dataset": self.dataset.dataset_version,
            "train": self.train.train_version,
            "inference": self.inference.inference_version,
            "decision_rules": self.decision.rules_version,
            "camera": self.camera.camera_version,
            "lighting_profiles": self.lighting.lighting_profiles_version,
            "system": self.system.system_version,
        }

    def inspection_config_hash(self) -> str:
        """Hash das partes que afetam o resultado de uma inspeção."""
        keys = ["taxonomy", "inference", "decision", "camera", "lighting"]
        return canonical_hash({k: self._parts[k].model_dump(mode="json") for k in keys})

    def profile_hash(self, name: str | None = None) -> str:
        name = name or self.inference.profile
        return canonical_hash(self.lighting.profiles[name].model_dump(mode="json"))

    def as_dict(self) -> dict[str, Any]:
        return {k: v.model_dump(mode="json") for k, v in self._parts.items()}


def load_settings(config_dir: str | os.PathLike[str] | None = None,
                  root: str | os.PathLike[str] | None = None,
                  overlay: str | os.PathLike[str] | None = None) -> Settings:
    """Carrega configs/. `overlay` (ou CAPSULE_CONFIG_OVERLAY) é um diretório cujos
    arquivos substituem os de mesmo nome — ex.: configs/examples/synthetic."""
    root_p = Path(root).resolve() if root else find_project_root()
    cdir = Path(config_dir).resolve() if config_dir else root_p / "configs"
    ov = overlay or os.environ.get("CAPSULE_CONFIG_OVERLAY") or None
    odir = (Path(ov) if Path(ov).is_absolute() else root_p / ov) if ov else None
    if odir is not None and not odir.is_dir():
        raise ConfigError(f"overlay de configuração inexistente: {odir}")
    parts: dict[str, BaseModel] = {}
    for key, (fname, model) in FILES.items():
        src = odir / fname if odir is not None and (odir / fname).exists() else cdir / fname
        raw = read_yaml(src)
        try:
            parts[key] = model.model_validate(raw)
        except Exception as e:  # pydantic.ValidationError
            raise ConfigError(f"{fname}: {e}") from e
    st = Settings(root_p, cdir, parts)
    st.overlay_dir = odir
    return st
