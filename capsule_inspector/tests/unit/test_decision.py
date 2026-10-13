import numpy as np
import pytest
from conftest import capsule_image, edit_yaml

from capsule_inspector.config import load_settings
from capsule_inspector.decision.quality_gate import check_quality
from capsule_inspector.decision.rules import DecisionEngine, PassContext, associate
from capsule_inspector.inference.anomaly import AnomalyResult
from capsule_inspector.inference.roi import CapsuleRegion
from capsule_inspector.types import Detection, QualityReport
from capsule_inspector.types import InspectionStatus as S
from capsule_inspector.types import ResultCategory as C

CAP = CapsuleRegion((50, 50, 250, 130), 0.95, "detector", False, 0.2)
OK = QualityReport(True)


def det(name, conf, box=(100, 80, 110, 90), cid=1):
    return Detection(cid, name, conf, box)


@pytest.fixture()
def validated(project):
    """Tudo validado: PASS é possível."""
    edit_yaml(project / "configs" / "taxonomy.yaml",
              lambda d: [c.update({"validated": True}) for c in d["classes"]])
    edit_yaml(project / "configs" / "lighting_profiles.yaml",
              lambda d: d["profiles"]["opaque_two_tone"]["acquisition"]["steps"].extend([
                  {"name": "back", "kind": "backlight", "light": "bl"},
                  {"name": "side", "kind": "side_light", "light": "sl"}]) or
              d["profiles"]["opaque_two_tone"].update({"validated": True}))
    s = load_settings(root=project)
    return DecisionEngine(s.decision, s.taxonomy), PassContext(s.active_profile, True), s


def test_pass_only_when_everything_ok(validated):
    eng, ctx, _ = validated
    d = eng.decide(OK, [], [CAP], ctx)
    assert d.status == S.PASS and d.category == C.NORMAL_VALIDATED


def test_detection_below_review_is_ignored(validated):
    eng, ctx, _ = validated
    assert eng.decide(OK, [det("crack", 0.05)], [CAP], ctx).status == S.PASS


def test_critical_defect_fails(validated):
    eng, ctx, _ = validated
    d = eng.decide(OK, [det("crack", 0.9)], [CAP], ctx)
    assert d.status == S.FAIL and d.category == C.DEFECT_CONFIRMED
    assert d.capsules[0].defects[0].class_name == "crack"


def test_uncertain_goes_to_review_not_pass(validated):
    eng, ctx, _ = validated
    d = eng.decide(OK, [det("crack", 0.2)], [CAP], ctx)  # review 0.10 <= 0.2 < fail 0.45
    assert d.status == S.REVIEW and d.category == C.INCONCLUSIVE


def test_minor_defect_routes_to_review(validated):
    eng, ctx, _ = validated
    assert eng.decide(OK, [det("scratch", 0.9)], [CAP], ctx).status == S.REVIEW


def test_unvalidated_class_rejected_conservatively(project):
    s = load_settings(root=project)
    eng = DecisionEngine(s.decision, s.taxonomy)
    d = eng.decide(OK, [det("hole", 0.95)], [CAP], PassContext(s.active_profile, True))
    assert d.status == S.FAIL and d.category == C.INCONCLUSIVE
    assert any("não validada" in r for r in d.capsules[0].reasons)


def test_pass_blocked_when_not_validated(project):
    s = load_settings(root=project)
    eng = DecisionEngine(s.decision, s.taxonomy)
    d = eng.decide(OK, [], [CAP], PassContext(s.active_profile, False))
    assert d.status == S.REVIEW
    joined = " ".join(d.capsules[0].reasons)
    assert "perfil" in joined and "modelo não aprovado" in joined and "críticas não validadas" in joined
    assert "não torna observáveis" in joined   # perfil opaco só tem luz difusa


def test_bad_quality_never_passes(validated):
    eng, ctx, _ = validated
    q = QualityReport(False, {}, ["BLURRY"])
    d = eng.decide(q, [], [CAP], ctx)
    assert d.status == S.REVIEW and any("QUALITY" in r for r in d.reasons)


def test_capsule_count_and_border(validated):
    eng, ctx, _ = validated
    assert eng.decide(OK, [], [], ctx).status == S.REVIEW
    assert eng.decide(OK, [], [CAP, CAP], ctx).status == S.REVIEW
    border = CapsuleRegion((0, 50, 200, 130), 0.9, "detector", True, 0.2)
    assert eng.decide(OK, [], [border], ctx).status == S.REVIEW


def test_unassociated_defect_reviews(validated):
    eng, ctx, _ = validated
    d = eng.decide(OK, [det("crack", 0.9, (290, 200, 300, 210))], [CAP], ctx)
    assert d.status == S.REVIEW and any("UNASSOCIATED" in r for r in d.reasons)


def test_too_many_detections(validated):
    eng, ctx, _ = validated
    many = [det("stain", 0.3, (60 + 10 * i, 60, 68 + 10 * i, 68)) for i in range(8)]
    d = eng.decide(OK, many, [CAP], ctx)
    assert d.status == S.REVIEW and any("TOO_MANY" in r for r in d.capsules[0].reasons)


def test_anomaly_review(validated):
    eng, ctx, _ = validated
    d = eng.decide(OK, [], [CAP], ctx, {0: AnomalyResult(5.0, 2.0, True)})
    assert d.status == S.REVIEW and d.category == C.VISUAL_ANOMALY


def test_association_by_containment():
    caps = [CapsuleRegion((0, 0, 100, 50), 0.9, "d"), CapsuleRegion((0, 60, 100, 110), 0.9, "d")]
    by, orphans = associate([det("crack", 0.9, (10, 70, 20, 80))], caps)
    assert len(by[1]) == 1 and not by[0] and not orphans


def test_quality_gate():
    from capsule_inspector.config import QualityThresholds
    q = QualityThresholds()
    img, _ = capsule_image(320, 1)
    assert check_quality(img, q).ok
    assert not check_quality(None, q).ok
    assert not check_quality(np.zeros((320, 320, 3), np.uint8), q).ok            # escura/uniforme
    assert not check_quality(np.full((320, 320, 3), 255, np.uint8), q).ok         # saturada
    import cv2
    blurred = cv2.GaussianBlur(img, (0, 0), 8)
    r = check_quality(blurred, q)
    assert not r.ok and any("BLURRY" in x for x in r.reasons)
