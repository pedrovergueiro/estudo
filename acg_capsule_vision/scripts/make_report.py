#!/usr/bin/env python3
"""Gera reports/REPORT.md somente a partir dos JSON produzidos pelas execuções reais.
Seções sem resultado aparecem como "NÃO EXECUTADO" com o comando para executá-las.

  python scripts/make_report.py
"""

import json
from pathlib import Path

import _bootstrap  # noqa: F401

from acg_vision.config import resolve


def load(p: Path):
    return json.loads(p.read_text()) if p.exists() else None


def f(x, nd=3):
    return "—" if x is None else (f"{x:.{nd}f}" if isinstance(x, float) else str(x))


def main() -> None:
    R = resolve("reports")
    L = ["# Relatório de métricas — ACG Capsule Vision AI", "",
         "> Modelos treinados **somente com dados públicos**. Nenhuma métrica abaixo vale para a máquina da ACG,",
         "> para cápsulas de gelatina, para outras cores/acabamentos ou para a iluminação industrial da ACG.", ""]
    split = load(resolve("data/prepared/medical_pills/split_manifest.json"))
    units = load(resolve("data/prepared/pill_defects/units.json"))
    L += ["## 1. Dados utilizados", ""]
    if split:
        s = split["splits"]
        L += ["**Medical Pills** (detecção, 1 classe `pill`, quadros de um único vídeo; divisão por blocos temporais)", "",
              "| Conjunto | Imagens | Caixas | Quadros |", "|---|---:|---:|---|"]
        for k in ("train", "val", "test"):
            fr = s[k]["frames"]
            L.append(f"| {k} | {s[k]['images']} | {s[k]['boxes']} | {fr[0]}–{fr[-1]} |")
        L += [f"| descartados (fronteiras) | {len(s['dropped_frames'])} | — | {s['dropped_frames']} |", "",
              f"Tamanho mediano da caixa (treino): {f(s['train']['box_w_px_median'], 0)} × "
              f"{f(s['train']['box_h_px_median'], 0)} px em imagens 1920×1080.", ""]
    else:
        L += ["Medical Pills: NÃO PREPARADO — `python scripts/prepare_datasets.py`", ""]
    if units:
        L += ["**Pill-Defects** (classificação normal × defeito, COMPRIMIDOS, 512×512 cinza)", "",
              f"{units['n_images']} imagens, mas apenas **{units['n_units']} unidades físicas** "
              f"({units['units_per_class']['normal']} normais, {units['units_per_class']['defect']} defeituosas). "
              f"Imagens por classe: {units['images_per_class']}. O `data.csv` original lista só "
              f"{units['original_data_csv_rows']} das imagens.", "",
              "| Unidade | Classe | Quadros | MAE máx. ao 1º quadro |", "|---|---|---:|---:|"]
        L += [f"| {u['unit_id']} | {u['label']} | {u['n_frames']} | {u['max_mae_to_first_frame']} |" for u in units["units"]]
        L.append("")

    L += ["## 2. Detecção (Medical Pills) — Etapa A × Etapa B, conjunto de TESTE", ""]
    rows = []
    for key in ("yolo11n", "yolo11s"):
        a = load(R / "detect" / f"stage_a_{key}.json")
        if a:
            ca = a["class_agnostic"]
            rows.append(f"| {key} COCO pré-treinado (Etapa A, class-agnóstico, conf 0.25) | — | — | {f(ca['precision'])} | "
                        f"{f(ca['recall'])} | {f(ca['f1'])} |")
        b = load(R / "detect" / f"{key}_test" / "evaluation.json")
        if b:
            st, op = b["standard"], b["operating_point"]
            rows.append(f"| {key} ajustado (Etapa B) — curva | {f(st['map50'])} | {f(st['map50_95'])} | {f(st['precision'])} | "
                        f"{f(st['recall'])} | {f(st['f1'])} |")
            rows.append(f"| {key} ajustado (Etapa B) — conf 0.25 | — | — | {f(op['precision'])} | {f(op['recall'])} | "
                        f"{f(op['f1'])} |")
        elif a:
            rows.append(f"| {key} ajustado | NÃO EXECUTADO — `python scripts/train_detect.py --stage B --model {key}` "
                        f"e `python scripts/evaluate.py detect ...` | | | | |")
    L += ["| Modelo | mAP50 | mAP50-95 | Precisão | Recall | F1 |", "|---|---:|---:|---:|---:|---:|", *rows, "",
          "Latência: ver seção 4 (medida com aquecimento e máquina ociosa). Tempo de treino: o yolo11n foi treinado "
          "com a CPU compartilhada com a validação cruzada do classificador; o yolo11s, com bem menos concorrência (só testes curtos em paralelo) — os tempos não são "
          "comparáveis entre si.", ""]
    for key in ("yolo11n", "yolo11s"):
        a = load(R / "detect" / f"stage_a_{key}.json")
        if a:
            L.append(f"- Etapa A {key}: classes COCO preditas sobre comprimidos: {a['coco_classes_predicted']}")
        m = next(iter(sorted(resolve("runs/detect").glob(f"{key}_*/run_manifest.json"))), None)
        if m:
            mm = load(m)
            L.append(f"- Etapa B {key}: treino {f(mm['train_seconds'] / 60, 1)} min em CPU, parâmetros {mm['params']}, "
                     f"best.pt SHA-256 `{mm['best']['sha256'][:16]}…`")
        b = load(R / "detect" / f"{key}_test" / "evaluation.json")
        if b:
            L.append(f"- Exemplos {key} (verde = caixa real encontrada, vermelho = perdida, azul = predição correta, "
                     f"laranja = falso positivo; imagens Medical Pills, AGPL-3.0): "
                     + ", ".join(f"[{Path(e).name}](detect/{key}_test/{e})" for e in b["examples"]))
    L.append("")

    L += ["## 3. Classificação de defeitos (Pill-Defects) — validação cruzada por unidade física (LOUO)", ""]
    a = load(R / "classify" / "stage_a_cls.json")
    if a:
        mb = a["majority_baseline"]
        L += [f"- Etapa A (ImageNet, sem classes normal/defeito): top-1 ImageNet por classe real = "
              f"{a['imagenet_top1_by_true_label']}",
              f"- Linha de base classe majoritária (sempre `defect`): acurácia {f(mb['accuracy'])}, recall normal 0.000", ""]
    c = load(R / "classify" / "evaluation.json")
    if c:
        cm = c["confusion_matrix_rows_true_cols_pred"]
        L += [f"Perfil `{c['profile']}`; tempo total de treino das {len(c['folds'])} dobras: "
              f"{f(c['total_train_seconds'] / 60, 1)} min.", "",
              "Matriz de confusão (imagens de teste de todas as dobras; linhas = real):", "",
              "| real \\ predito | normal | defect |", "|---|---:|---:|",
              f"| normal | {cm['normal']['normal']} | {cm['normal']['defect']} |",
              f"| defect | {cm['defect']['normal']} | {cm['defect']['defect']} |", "",
              f"- Acurácia {f(c['accuracy'])} · acurácia balanceada {f(c['balanced_accuracy'])} · AUC (agrupada) {f(c['roc_auc_pooled'])}",
              f"- Defeito: precisão {f(c['defect']['precision'])}, recall {f(c['defect']['recall'])}, F1 {f(c['defect']['f1'])}",
              f"- Normal: precisão {f(c['normal']['precision'])}, recall {f(c['normal']['recall'])}, F1 {f(c['normal']['f1'])}",
              f"- Unidades corretas por voto majoritário: **{c['units_correct_by_majority_vote']} de {c['n_units']}**", "",
              "| Unidade de teste | Classe | Quadros | Acurácia nos quadros |", "|---|---|---:|---:|"]
        L += [f"| {u['unit_id']} | {u['true']} | {u['frames']} | {f(u['frame_accuracy'])} |" for u in c["per_unit"]]
        L += ["", f"Exemplos de acertos e erros: `reports/classify/{c['examples']}` — gerado localmente por "
              "`scripts/evaluate.py classify`; **não versionado**, pois contém imagens do Pill-Defects (licença desconhecida).", "",
              f"> {c['note']}", ""]
    else:
        L += ["LOUO: NÃO EXECUTADO — `python scripts/train_classify.py --stage B` e "
              "`python scripts/evaluate.py classify --louo runs/classify/louo_cpu_conservative/louo_results.json`", ""]

    L += ["## 4. Benchmark nesta máquina", ""]
    benches = sorted((R / "benchmark").glob("benchmark_*.json"))
    if benches:
        L += ["| Pesos | Dispositivo | imgsz | p50 ms | p95 ms | img/s | RSS pico MB | deriva | erros | máx ms |",
              "|---|---|---:|---:|---:|---:|---:|---:|---:|---:|"]
        for b in map(load, benches):
            lt = b["latency_ms"]
            run = Path(b["model"]["file"]).parents[1].name
            mode = f"{b['wall_seconds']:.0f} s contínuos" if b["wall_seconds"] > 120 else f"{b['iterations']} iterações"
            L.append(f"| {run} ({b['model']['task']}, {mode}) | {b['device']} | {b['imgsz']} | {f(lt['p50'], 1)} | "
                     f"{f(lt['p95'], 1)} | {b['throughput_img_per_s']} | {b['rss_peak_mb']} | "
                     f"{b['latency_drift_last_vs_first_decile']} | {b['errors']} | {f(lt['max'], 0)} |")
        L += ["", "Detecção: imagens 1920×1080 redimensionadas para 640; classificação: 512×512 para 224. "
              "Latência inclui pré e pós-processamento (`predict` da Ultralytics, PyTorch CPU). Estes números valem "
              "**apenas para a máquina listada** (vCPUs compartilhadas). O Raspberry Pi não foi testado.", ""]
    env = (load(R / "detect" / "stage_a_yolo11n.json") or {}).get("environment")
    if env:
        L += ["## 5. Ambiente", "", f"```\n{json.dumps(env, indent=2)}\n```", ""]
    L += ["## 6. Limitações e riscos de generalização", "",
          "Ver MODEL_CARD.md e DATASET_SOURCES.md. Em resumo: nenhum dado é de cápsula de gelatina com defeito;",
          "o detector só localiza comprimidos/cápsulas em blister de um único vídeo; o classificador de defeitos foi",
          "avaliado em 10 comprimidos físicos (2 normais) — amostra pequena demais para estimar desempenho real.", ""]
    out = R / "REPORT.md"
    out.write_text("\n".join(L), encoding="utf-8")
    print(out)


if __name__ == "__main__":
    main()
