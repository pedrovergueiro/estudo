import pytest
from conftest import edit_yaml

from capsule_inspector.config import ConfigError, load_settings


def test_default_configs_load(project):
    s = load_settings(root=project)
    names = s.taxonomy.training_names()
    assert names[0] == "capsule"
    assert "unknown_anomaly" not in names           # papel anomaly não é classe do detector
    assert "fill_irregular" not in names            # desabilitada por padrão
    assert set(s.versions()) >= {"taxonomy", "decision_rules", "inference"}
    assert len(s.inspection_config_hash()) == 64


def test_unknown_key_rejected(project):
    edit_yaml(project / "configs" / "inference.yaml", lambda d: d["model"].update({"imgzs": 320}))
    with pytest.raises(ConfigError, match="inference.yaml"):
        load_settings(root=project)


def test_threshold_order_validated(project):
    edit_yaml(project / "configs" / "decision_rules.yaml",
              lambda d: d["class_thresholds"].update({"crack": {"fail": 0.1, "review": 0.5}}))
    with pytest.raises(ConfigError):
        load_settings(root=project)


def test_candidate_conf_must_not_hide_review_detections(project):
    edit_yaml(project / "configs" / "inference.yaml", lambda d: d["model"].update({"candidate_conf": 0.3}))
    with pytest.raises(ConfigError, match="candidate_conf"):
        load_settings(root=project)


def test_unknown_class_in_rules(project):
    edit_yaml(project / "configs" / "decision_rules.yaml",
              lambda d: d["class_thresholds"].update({"bogus": {"fail": 0.5, "review": 0.2}}))
    with pytest.raises(ConfigError, match="bogus"):
        load_settings(root=project)


def test_actuator_failsafe_validation(project):
    edit_yaml(project / "configs" / "system.yaml",
              lambda d: d["integration"]["reject_actuator"].update({"reject_on": ["FAIL"]}))
    with pytest.raises(ConfigError, match="SYSTEM_ERROR"):
        load_settings(root=project)


def test_experiment_override(project):
    s = load_settings(root=project)
    t = s.train.with_experiment("imgsz_960_small_defects")
    assert t.hyperparameters["imgsz"] == 960 and t.hyperparameters["batch"] == 8
    assert t.hyperparameters["mosaic"] == s.train.hyperparameters["mosaic"]
    assert s.train.with_experiment("yolo11s").model == "yolo11s.pt"
    with pytest.raises(ConfigError):
        s.train.with_experiment("nao_existe")


def test_overlay_and_hash_changes(project):
    a = load_settings(root=project)
    b = load_settings(root=project, overlay="configs/examples/synthetic")
    assert b.taxonomy.training_names() == ["capsule", "crack", "hole", "stain", "scratch", "foreign_particle"]
    assert a.inspection_config_hash() != b.inspection_config_hash()
    with pytest.raises(ConfigError):
        load_settings(root=project, overlay="configs/nao_existe")


def test_taxonomy_alias_resolution(project):
    s = load_settings(root=project)
    assert s.taxonomy.resolve_alias("Squeeze") == "dent"
    assert s.taxonomy.resolve_alias("good") == "capsule"
    assert s.taxonomy.resolve_alias("xyz") is None


def test_duplicate_alias_rejected(project):
    def f(d):
        d["classes"][1]["aliases"].append("dent")
    edit_yaml(project / "configs" / "taxonomy.yaml", f)
    with pytest.raises(ConfigError, match="alias"):
        load_settings(root=project)
