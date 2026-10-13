"""Comando único `capsule-inspector` (usado pelo pacote do Raspberry Pi).

  capsule-inspector pasta  /caminho/das/imagens [--lote L1]
  capsule-inspector camera [--fonte auto|usb|csi] [--dispositivo /dev/video0] [--intervalo 1]
  capsule-inspector interface [--rede] [--porta 8080]
  capsule-inspector iniciar   [--rede] [--fonte auto]        # câmera + interface juntos
  capsule-inspector diagnostico
  capsule-inspector teste                                     # autoteste com as imagens de exemplo
  capsule-inspector exportar --formato csv --saida resultados.csv
"""

from __future__ import annotations

import argparse
import json
import os
import platform
import secrets
import shutil
import socket
import subprocess
import sys
import time
from pathlib import Path

from . import __version__
from .config import ConfigError, Settings, load_settings

AVISO = ("AVISO: modelo DEMONSTRATIVO treinado só com dados públicos (comprimidos em blister). "
         "Localiza e conta unidades; NÃO detecta defeitos e NÃO está validado para uso industrial.")


def _settings() -> Settings:
    try:
        return load_settings()
    except ConfigError as e:
        sys.exit(f"Erro de configuração: {e}")


def _summary(svc) -> None:  # type: ignore[no-untyped-def]
    since = time.strftime("%Y-%m-%dT00:00:00")
    print("Contagem de hoje por estado:", svc.db.counts(since) if svc.db else {})


def _service(s: Settings):  # type: ignore[no-untyped-def]
    from .runtime import InspectionService
    return InspectionService(s, console_log=False)  # logs completos em var/logs/


def cmd_pasta(a: argparse.Namespace) -> int:
    s = _settings()
    d = Path(a.diretorio).expanduser().resolve()
    if not d.is_dir():
        sys.exit(f"Pasta não encontrada: {d}")
    s.camera.type = "file"
    s.camera.file.path = str(d)
    s.camera.file.pattern = "*"
    s.system.integration.trigger.type = "none"
    print(AVISO)
    svc = _service(s)
    results = []
    while True:
        out = svc.inspect_once(a.lote)
        if out is None:
            break
        if isinstance(out, str):
            print(f"Erro ao ler a pasta: {svc.camera_state.get('error')}")
            break
        r = out.record
        n = len(r.capsules)
        src = r.source["frames"][0].get("file", "") if r.source.get("frames") else ""
        label = Path(src).name if src else "(arquivo ilegível)"
        print(f"{label:40s} {r.status:12s} {n:3d} unidade(s)  {r.timings_ms.get('total', 0):7.1f} ms"
              + (f"  {r.error}" if r.error else ""))
        results.append(r.status)
    svc.shutdown()
    print(f"\n{len(results)} imagem(ns) analisada(s). Veja na interface: capsule-inspector interface")
    return 0 if results and "SYSTEM_ERROR" not in results else 1


def _apply_camera_args(s: Settings, a: argparse.Namespace) -> None:
    if getattr(a, "fonte", None):
        s.camera.type = a.fonte
    if getattr(a, "dispositivo", None):
        dev = a.dispositivo
        s.camera.usb.device = int(dev) if str(dev).isdigit() else dev
        if s.camera.type == "auto":
            s.camera.type = "usb"
    if getattr(a, "intervalo", None) is not None:
        s.system.integration.trigger.interval_s = a.intervalo


def cmd_camera(a: argparse.Namespace) -> int:
    s = _settings()
    _apply_camera_args(s, a)
    print(AVISO)
    print(f"Câmera: {s.camera.type}. Ctrl+C para parar. Interface: capsule-inspector interface")
    svc = _service(s)
    n = svc.run(lot_id=a.lote)
    print(f"{n} inspeções.")
    return 0


def _lan_ips() -> list[str]:
    ips = set()
    try:
        out = subprocess.run(["hostname", "-I"], capture_output=True, text=True, timeout=3).stdout
        ips.update(x for x in out.split() if ":" not in x)
    except (OSError, subprocess.TimeoutExpired):
        pass
    if not ips:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sk:
                sk.connect(("10.255.255.255", 1))
                ips.add(sk.getsockname()[0])
        except OSError:
            pass
    return sorted(ips)


def _token(s: Settings) -> str:
    p = s.path(s.system.storage.root) / "ui_token"
    p.parent.mkdir(parents=True, exist_ok=True)
    if not p.exists():
        p.write_text(secrets.token_urlsafe(18))
        os.chmod(p, 0o600)
    return p.read_text().strip()


def _prepare_interface(s: Settings, a: argparse.Namespace) -> None:
    if a.porta:
        s.system.interface.port = a.porta
    if a.rede:
        s.system.interface.host = "0.0.0.0"
        tok = _token(s)
        os.environ[s.system.interface.auth_token_env] = tok
        print("Interface acessível na rede local (com senha/token):")
        for ip in _lan_ips():
            print(f"   http://{ip}:{s.system.interface.port}/?token={tok}")
        print("Não exponha o Raspberry Pi à internet.")
    else:
        print(f"Interface: http://127.0.0.1:{s.system.interface.port}  (só neste aparelho; use --rede para outro PC)")


def cmd_interface(a: argparse.Namespace) -> int:
    s = _settings()
    _prepare_interface(s, a)
    from .interface.app import serve
    serve(s)
    return 0


def cmd_iniciar(a: argparse.Namespace) -> int:
    s = _settings()
    _prepare_interface(s, a)
    env = dict(os.environ)
    ui_args = [sys.executable, "-m", "capsule_inspector.cli", "interface"]
    if a.rede:
        ui_args.append("--rede")
    if a.porta:
        ui_args += ["--porta", str(a.porta)]
    ui = subprocess.Popen(ui_args, env=env, stdout=subprocess.DEVNULL)
    try:
        return cmd_camera(a)
    finally:
        ui.terminate()
        try:
            ui.wait(timeout=5)
        except subprocess.TimeoutExpired:
            ui.kill()


def cmd_diagnostico(a: argparse.Namespace) -> int:
    from .capture.discover import csi_cameras, usb_cameras
    from .monitoring.hardware import platform_report
    s = _settings()
    rep = platform_report()
    print(f"capsule-inspector {__version__}")
    print(f"Aparelho: {rep['raspberry_pi_model'] or 'não é Raspberry Pi (ou modelo não identificado)'}")
    print(f"Sistema: {rep['os']}  |  arquitetura {rep['machine']}  |  Python {rep['python']}")
    print(f"CPUs: {rep['cpu_count']}  |  RAM total {rep['memory']['total_mb']:.0f} MB, livre {rep['memory']['available_mb']:.0f} MB")
    if rep["cpu_temperature_c"] is not None:
        print(f"Temperatura CPU: {rep['cpu_temperature_c']:.1f} °C")
    if rep["throttled"]:
        bad = [k for k, v in rep["throttled"].items() if v is True]
        print(f"Throttling/subtensão: {', '.join(bad) or 'nenhum'} ({rep['throttled']['raw']})")
    print(f"Disco livre: {shutil.disk_usage(s.root).free / 1e9:.1f} GB")
    usb = usb_cameras()
    csi = csi_cameras()
    print("Câmeras USB:", ", ".join(f"{c['device']} ({c['name']})" for c in usb) or "nenhuma")
    print("Câmeras CSI:", ", ".join(f"{c['index']}: {c['sensor']}" for c in csi) or "nenhuma (ou rpicam-apps ausente)")
    try:
        from .inference.predictor import Predictor
        p = Predictor.from_settings(s)
        print(f"Modelo: OK — {Path(p.info.path).name} sha256 {p.info.sha256[:16]}… backend {p.info.backend}")
    except Exception as e:  # noqa: BLE001
        print(f"Modelo: ERRO — {e}")
        return 1
    print("Bibliotecas:", json.dumps({k: v for k, v in rep["libraries"].items()
                                      if k in ("numpy", "opencv-python-headless", "onnxruntime", "fastapi")}))
    return 0


def cmd_teste(a: argparse.Namespace) -> int:
    s = _settings()
    ex = s.path("exemplos")
    if not ex.is_dir():
        sys.exit(f"Imagens de exemplo não encontradas em {ex}")
    s.camera.type = "file"
    s.camera.file.path = str(ex)
    s.camera.file.pattern = "*"
    svc = _service(s)
    ok, n = True, 0
    t0 = time.perf_counter()
    while True:
        out = svc.inspect_once("AUTOTESTE")
        if out is None or isinstance(out, str):
            break
        n += 1
        r = out.record
        units = len(r.capsules)
        good = r.status != "SYSTEM_ERROR" and units > 0
        ok &= good
        print(f"  {'ok ' if good else 'ERRO'} {r.status:12s} {units:3d} unidade(s) {r.timings_ms.get('total', 0):7.1f} ms"
              + (f"  ({r.error})" if r.error else ""))
    svc.shutdown()
    ok &= n > 0
    print(f"Autoteste: {'APROVADO' if ok else 'FALHOU'} — {n} imagem(ns) em {time.perf_counter() - t0:.1f} s "
          f"({platform.machine()})")
    return 0 if ok else 1


def cmd_exportar(a: argparse.Namespace) -> int:
    from .storage.database import InspectionDB
    s = _settings()
    db = InspectionDB(s.path(s.system.storage.database))
    data = db.export_csv() if a.formato == "csv" else db.export_json()
    Path(a.saida).write_text(data, encoding="utf-8")
    print(f"Exportado para {a.saida}")
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="capsule-inspector", description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--versao", action="version", version=__version__)
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("pasta", help="analisa todas as imagens de uma pasta")
    p.add_argument("diretorio")
    p.add_argument("--lote")
    p.set_defaults(fn=cmd_pasta)
    for name, fn, hlp in (("camera", cmd_camera, "inspeção contínua pela câmera"),
                          ("iniciar", cmd_iniciar, "câmera + interface")):
        p = sub.add_parser(name, help=hlp)
        p.add_argument("--fonte", choices=["auto", "usb", "csi"])
        p.add_argument("--dispositivo", help="câmera USB: índice ou /dev/videoN")
        p.add_argument("--intervalo", type=float, help="segundos entre inspeções (padrão 1)")
        p.add_argument("--lote")
        if name == "iniciar":
            p.add_argument("--rede", action="store_true")
            p.add_argument("--porta", type=int)
        p.set_defaults(fn=fn)
    p = sub.add_parser("interface", help="interface web local")
    p.add_argument("--rede", action="store_true", help="permitir acesso de outros computadores (com token)")
    p.add_argument("--porta", type=int)
    p.set_defaults(fn=cmd_interface)
    p = sub.add_parser("diagnostico", help="aparelho, câmeras e modelo")
    p.set_defaults(fn=cmd_diagnostico)
    p = sub.add_parser("teste", help="autoteste com as imagens de exemplo")
    p.set_defaults(fn=cmd_teste)
    p = sub.add_parser("exportar", help="exporta resultados")
    p.add_argument("--formato", choices=["csv", "json"], default="csv")
    p.add_argument("--saida", required=True)
    p.set_defaults(fn=cmd_exportar)
    a = ap.parse_args(argv)
    try:
        return int(a.fn(a) or 0)
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    sys.exit(main())
