#!/usr/bin/env python3
"""Benchmark no hardware atual: backends × modelos (resoluções/precisões).

  # comparar FP32 vs INT8 e duas resoluções, 200 iterações cada
  python scripts/benchmark_model.py --models models/export/best_640_fp32.onnx \
      models/export/best_640_int8.onnx models/export/best_416_fp32.onnx --iterations 200
  # incluir PyTorch (.pt via Ultralytics) e OpenCV DNN
  python scripts/benchmark_model.py --models best.pt best_640_fp32.onnx --backends auto opencv_dnn
  # teste de estresse térmico de 30 min
  python scripts/benchmark_model.py --models best_640_fp32.onnx --duration 1800
  # com precisão no split de teste (detecta degradação por quantização)
  python scripts/benchmark_model.py --models a.onnx b_int8.onnx --eval-split test

imgsz é lido do manifesto ao lado do modelo (<modelo>.manifest.json) ou de --imgsz.
"""

import argparse
import json
import multiprocessing
import sys
from pathlib import Path

import _bootstrap  # noqa: F401
from capsule_inspector.config import load_settings
from capsule_inspector.dataset.metadata import load_metadata
from capsule_inspector.inference.backends import BackendError, create_backend
from capsule_inspector.monitoring.benchmark import bench_config, load_images, write_benchmark
from capsule_inspector.training.evaluate import build_report, collect_predictions


def imgsz_for(model: Path, default: int) -> int:
    side = model.with_suffix(".manifest.json") if model.is_file() else model.parent / (model.name + ".manifest.json")
    if side.exists():
        return int(json.loads(side.read_text())["imgsz"])
    return default


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--models", nargs="+", required=True, type=Path)
    ap.add_argument("--backends", nargs="+", default=["auto"])
    ap.add_argument("--imgsz", type=int)
    ap.add_argument("--images", type=Path, help="diretório de imagens (padrão: split val)")
    ap.add_argument("--iterations", type=int, default=100)
    ap.add_argument("--warmup", type=int, default=10)
    ap.add_argument("--duration", type=float, default=0.0, help="segundos (teste prolongado)")
    ap.add_argument("--threads", type=int, nargs="+", default=None)
    ap.add_argument("--eval-split", choices=["val", "test"])
    ap.add_argument("--out", type=Path, default=Path("reports/benchmarks/latest"))
    ap.add_argument("--no-isolate", action="store_true", help="não usar um processo por configuração")
    a = ap.parse_args()
    s = load_settings()
    names = s.taxonomy.training_names()
    splits = s.path(s.dataset.paths["splits"])
    if a.images:
        img_paths = sorted(p for p in s.path(a.images).iterdir() if p.suffix.lower() in (".png", ".jpg", ".jpeg"))
    else:
        img_paths = [Path(p) for p in (splits / "val.txt").read_text().split()]
    images = load_images(img_paths, 50)
    threads = a.threads or [s.inference.model.num_threads]
    mp_ctx = multiprocessing.get_context("spawn")
    results, accuracy, failures = [], {}, []
    for m in a.models:
        mp = s.path(m)
        sz = a.imgsz or imgsz_for(mp, s.inference.model.imgsz)
        for be in a.backends:
            if be == "opencv_dnn" and mp.suffix != ".onnx":
                continue
            for th in threads:
                try:
                    args = (mp, be, sz, names, images, a.warmup, a.iterations, a.duration, th,
                            s.inference.model.candidate_conf, s.inference.model.nms_iou)
                    if a.no_isolate:
                        r = bench_config(*args)
                    else:  # processo novo por configuração: RSS não herda bibliotecas de outra config
                        with mp_ctx.Pool(1) as pool:
                            r = pool.apply(bench_config, args)
                except (BackendError, RuntimeError) as e:
                    print(f"[falhou] {m.name} / {be}: {e}")
                    failures.append({"model": str(m), "backend": be, "imgsz": sz, "error": str(e)})
                    continue
                results.append(r)
                lt = r["latency_ms"]["total"]
                print(f"{m.name:40s} {r['backend']:12s} imgsz={sz} th={th} p50={lt['p50']:.1f}ms "
                      f"p95={lt['p95']:.1f}ms fps={r['fps_sustained']} rss={r['rss_mb']['peak']}MB")
                if a.eval_split:
                    key = f"{m.name}|{r['backend']}|{sz}"
                    if key in accuracy:
                        continue
                    root = s.path(s.dataset.working_dataset.root)
                    meta = load_metadata(s.path(s.dataset.working_dataset.metadata_csv), root)
                    paths = [Path(p) for p in (splits / f"{a.eval_split}.txt").read_text().split()]
                    bk = create_backend(be, mp, imgsz=sz, names=names, conf=s.inference.model.candidate_conf,
                                        iou=s.inference.model.nms_iou, max_det=100, num_threads=th)
                    ev = collect_predictions(lambda x: bk.predict(x)[0], paths, root, meta)
                    rep = build_report(ev, s, names, {"model_id": m.name, "backend": bk.name}, a.eval_split)
                    smalls = [c["operating"]["recall_by_size"]["small"] for n, c in rep["per_class"].items()
                              if n != s.decision.capsule_class and c["operating"]["recall_by_size"]["small"] is not None]
                    accuracy[key] = {"map50": rep["summary"]["map50"], "map50_95": rep["summary"]["map50_95"],
                                     "defects_recall": rep["summary"]["defects_recall"],
                                     "small_recall_mean": round(sum(smalls) / len(smalls), 4) if smalls else None,
                                     "escape_rate": rep["decision"]["escape_rate"],
                                     "false_reject_rate": rep["decision"]["false_reject_rate"],
                                     "review_rate_defective": rep["decision"]["review_rate_defective"],
                                     "review_rate_good": rep["decision"]["review_rate_good"]}
    if not results:
        print("nenhuma configuração executada", file=sys.stderr)
        return 1
    md = write_benchmark(results, s.path(a.out), accuracy or None, failures)
    print("relatório:", md)
    return 0


if __name__ == "__main__":
    sys.exit(main())
