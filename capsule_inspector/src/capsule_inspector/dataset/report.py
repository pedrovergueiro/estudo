"""Relatórios de dataset: JSON, Markdown, gráfico de distribuição e mosaico de anotações.

Gráficos são desenhados com OpenCV para não exigir matplotlib.
"""

from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Any

import cv2
import numpy as np

from .validate import ValidationReport
from .yolo_io import label_path_for, list_images, read_label_file

PALETTE = [(56, 56, 255), (151, 157, 255), (31, 112, 255), (29, 178, 255), (49, 210, 207),
           (10, 249, 72), (23, 204, 146), (134, 219, 61), (52, 147, 26), (187, 212, 0),
           (168, 153, 44), (255, 194, 0), (147, 69, 52), (255, 115, 100), (236, 24, 0)]


def color_for(i: int) -> tuple[int, int, int]:
    return PALETTE[i % len(PALETTE)]


def class_distribution_chart(counts: dict[str, int], out: Path, title: str = "Instâncias por classe") -> Path:
    names = list(counts)
    vals = [counts[n] for n in names]
    h_bar, pad, w = 26, 10, 900
    label_w = 220
    h = pad * 3 + 30 + len(names) * (h_bar + 6)
    img = np.full((h, w, 3), 255, np.uint8)
    cv2.putText(img, title, (pad, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (20, 20, 20), 2, cv2.LINE_AA)
    vmax = max(vals) if vals and max(vals) > 0 else 1
    for i, (n, v) in enumerate(zip(names, vals)):
        y = 50 + i * (h_bar + 6)
        cv2.putText(img, n[:26], (pad, y + 18), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (40, 40, 40), 1, cv2.LINE_AA)
        bw = int((w - label_w - 90) * v / vmax)
        cv2.rectangle(img, (label_w, y), (label_w + max(bw, 1), y + h_bar), color_for(i), -1)
        cv2.putText(img, str(v), (label_w + bw + 6, y + 18), cv2.FONT_HERSHEY_SIMPLEX, 0.5,
                    (40, 40, 40), 1, cv2.LINE_AA)
    out.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out), img)
    return out


def draw_yolo_annotations(img: np.ndarray, label_file: Path, names: list[str]) -> np.ndarray:
    vis = img.copy()
    h, w = vis.shape[:2]
    if not label_file.exists():
        return vis
    try:
        anns = read_label_file(label_file)
    except ValueError:
        cv2.putText(vis, "LABEL INVALIDO", (5, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        return vis
    for a in anns:
        c = color_for(a.class_id)
        if a.polygon:
            pts = np.array([[x * w, y * h] for x, y in a.polygon], np.int32)
            cv2.polylines(vis, [pts], True, c, 1, cv2.LINE_AA)
        x1, y1, x2, y2 = (int(round(v)) for v in a.xyxy(w, h))
        cv2.rectangle(vis, (x1, y1), (x2, y2), c, 1)
        name = names[a.class_id] if a.class_id < len(names) else str(a.class_id)
        cv2.putText(vis, name, (x1, max(10, y1 - 3)), cv2.FONT_HERSHEY_SIMPLEX, 0.4, c, 1, cv2.LINE_AA)
    return vis


def annotation_mosaic(root: Path, names: list[str], out: Path, n: int = 16, tile: int = 256,
                      seed: int = 0) -> Path | None:
    images = list_images(root)
    if not images:
        return None
    rng = random.Random(seed)
    # prioriza imagens com defeitos para a amostra visual
    with_defects = [p for p in images if label_path_for(p).exists()
                    and any(line.split()[0] != "0" for line in label_path_for(p).read_text().splitlines()
                            if line.strip())]
    pool = with_defects if len(with_defects) >= n // 2 else images
    sample = rng.sample(pool, min(n, len(pool)))
    cols = int(np.ceil(np.sqrt(len(sample))))
    rows = int(np.ceil(len(sample) / cols))
    canvas = np.full((rows * tile, cols * tile, 3), 255, np.uint8)
    for k, p in enumerate(sample):
        img = cv2.imdecode(np.fromfile(str(p), dtype=np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            continue
        vis = draw_yolo_annotations(img, label_path_for(p), names)
        s = tile / max(vis.shape[:2])
        vis = cv2.resize(vis, (int(vis.shape[1] * s), int(vis.shape[0] * s)), interpolation=cv2.INTER_AREA)
        r, c = divmod(k, cols)
        canvas[r * tile:r * tile + vis.shape[0], c * tile:c * tile + vis.shape[1]] = vis
    out.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(out), canvas)
    return out


def write_validation_report(report: ValidationReport, out_dir: Path,
                            split_info: dict[str, Any] | None = None) -> dict[str, Path]:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    d = report.as_dict()
    if split_info:
        d["split"] = split_info
    jp = out_dir / "dataset_validation.json"
    jp.write_text(json.dumps(d, indent=2, ensure_ascii=False, default=str), encoding="utf-8")
    chart = class_distribution_chart(report.class_instances, out_dir / "class_distribution.png")
    mosaic = annotation_mosaic(Path(report.root), report.class_names, out_dir / "annotation_samples.jpg")

    lines = ["# Relatório de validação do dataset", "", f"- Raiz: `{report.root}`",
             f"- Tarefa: {report.task}", f"- Imagens: {report.n_images} — objetos: {report.n_labels}",
             f"- Resultado: **{'OK' if report.ok else 'REPROVADO'}** "
             f"({len(report.errors)} erros, {len(report.warnings)} avisos, "
             f"{len(report.leakage)} vazamentos)", ""]
    lines += ["## Distribuição por classe", "", "| Classe | Instâncias | Imagens | Fração pequena (<32² px) |",
              "|---|---:|---:|---:|"]
    for n in report.class_names:
        lines.append(f"| {n} | {report.class_instances.get(n, 0)} | {report.class_images.get(n, 0)} | "
                     f"{report.small_object_fraction.get(n, 0.0):.2f} |")
    lines += ["", f"Razão de desequilíbrio (max/min, classes não vazias): {report.imbalance_ratio}", ""]
    if report.per_split_instances:
        lines += ["## Instâncias por split", "", "| Split | " + " | ".join(report.class_names) + " |",
                  "|---|" + "---:|" * len(report.class_names)]
        for s, c in report.per_split_instances.items():
            lines.append(f"| {s} | " + " | ".join(str(c.get(n, 0)) for n in report.class_names) + " |")
        lines.append("")
    lines += ["## Resolução", "", f"```\n{json.dumps(report.resolution, indent=2, default=str)}\n```", ""]
    if report.leakage:
        lines += ["## Vazamento entre splits (BLOQUEANTE)", ""]
        lines += [f"- {json.dumps(x, ensure_ascii=False)}" for x in report.leakage[:50]]
        lines.append("")
    codes = d["issue_counts"]
    if codes:
        lines += ["## Problemas por código", "", "| Código | Ocorrências |", "|---|---:|"]
        lines += [f"| {k} | {v} |" for k, v in sorted(codes.items())]
        lines += ["", "Primeiros 30 problemas:", ""]
        lines += [f"- [{i.severity}] {i.code} `{i.path}`: {i.detail}" for i in report.issues[:30]]
    if split_info:
        lines += ["", "## Divisão", "", f"```\n{json.dumps(split_info, indent=2, ensure_ascii=False)}\n```"]
    lines += ["", "![distribuição](class_distribution.png)", "", "![amostras](annotation_samples.jpg)", ""]
    mp = out_dir / "dataset_validation.md"
    mp.write_text("\n".join(lines), encoding="utf-8")
    out = {"json": jp, "markdown": mp, "chart": chart}
    if mosaic:
        out["mosaic"] = mosaic
    return out
