"""Interface local do operador (FastAPI + página estática, sem dependências externas).

Escolha: FastAPI + HTML/JS puro. Roda em processo separado do serviço de
inspeção (lê o SQLite e o status.json), de modo que uma falha na interface
não interrompe a inspeção. Consumo baixo no Pi (~40-60 MB RSS estimado; medir).

Segurança: escuta em 127.0.0.1 por padrão. Se `interface.host` não for
loopback, a interface recusa iniciar sem token (variável de ambiente), e todas
as rotas /api exigem o token (cabeçalho `Authorization: Bearer` ou `?token=`).
"""

from __future__ import annotations

import datetime as _dt
import hmac
import json
import os
import time
from pathlib import Path
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse, HTMLResponse, PlainTextResponse, Response
from pydantic import BaseModel, Field

from ..config import Settings
from ..storage.database import InspectionDB

STATIC = Path(__file__).parent / "static"
LOOPBACK = {"127.0.0.1", "localhost", "::1"}


class ReviewIn(BaseModel):
    reviewer: str = Field(min_length=1, max_length=80)
    verdict: Literal["CONFIRMED_DEFECT", "FALSE_ALARM", "UNCERTAIN"]
    defect_class: str | None = Field(default=None, max_length=64)
    note: str | None = Field(default=None, max_length=1000)


def create_app(settings: Settings, token: str | None = None) -> FastAPI:
    st = settings.system.storage
    db = InspectionDB(settings.path(st.database))
    images_dir = settings.path(st.images_dir).resolve()
    status_file = settings.path(st.status_file)
    token = token if token is not None else os.environ.get(settings.system.interface.auth_token_env) or None
    app = FastAPI(title="Capsule Inspector", docs_url=None, redoc_url=None, openapi_url=None)

    def auth(request: Request) -> None:
        if not token:
            return
        hdr = request.headers.get("authorization", "")
        given = hdr[7:] if hdr.lower().startswith("bearer ") else request.query_params.get("token", "")
        if not hmac.compare_digest(given.encode(), token.encode()):
            raise HTTPException(401, "token inválido")

    @app.get("/", response_class=HTMLResponse)
    def index() -> HTMLResponse:
        return HTMLResponse((STATIC / "index.html").read_text(encoding="utf-8"))

    @app.get("/favicon.ico", include_in_schema=False)
    def favicon() -> Response:
        return Response(status_code=204)

    @app.get("/api/status", dependencies=[Depends(auth)])
    def status() -> dict:
        data: dict = {}
        if status_file.exists():
            try:
                data = json.loads(status_file.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                data = {"error": "status.json ilegível"}
        age = time.time() - float(data.get("ts", 0) or 0)
        since = (_dt.datetime.now(_dt.UTC) - _dt.timedelta(hours=24)).isoformat()
        return {"service": data, "service_age_s": round(age, 1), "service_stale": age > 15,
                "counts_24h": db.counts(since)}

    @app.get("/api/inspections", dependencies=[Depends(auth)])
    def inspections(limit: int = Query(50, ge=1, le=1000), status: str | None = None,
                    lot: str | None = None, unreviewed: bool = False) -> list[dict]:
        rows = db.recent(limit=limit, status=status, lot_id=lot, unreviewed_only=unreviewed)
        keys = ("inspection_id", "timestamp", "status", "category", "lot_id", "timings_ms", "images",
                "model", "profile", "reasons", "capsules")
        return [{k: r.get(k) for k in keys} for r in rows]

    @app.get("/api/inspections/{iid}", dependencies=[Depends(auth)])
    def inspection(iid: str) -> dict:
        r = db.get(iid)
        if r is None:
            raise HTTPException(404, "inspeção não encontrada")
        return r

    @app.get("/api/inspections/{iid}/image/{name}", dependencies=[Depends(auth)])
    def image(iid: str, name: str) -> FileResponse:
        r = db.get(iid)
        if r is None or name not in r.get("images", {}):
            raise HTTPException(404, "imagem não registrada")
        p = (images_dir / r["images"][name]).resolve()
        if images_dir not in p.parents:
            raise HTTPException(400, "caminho inválido")
        if not p.exists():
            raise HTTPException(410, "imagem expirada pela política de retenção")
        return FileResponse(p)

    @app.post("/api/inspections/{iid}/review", dependencies=[Depends(auth)])
    def review(iid: str, body: ReviewIn) -> dict:
        if body.defect_class and settings.taxonomy.get(body.defect_class) is None:
            raise HTTPException(422, "classe desconhecida")
        try:
            rid = db.add_review(iid, body.reviewer, body.verdict, body.defect_class, body.note,
                                _dt.datetime.now(_dt.UTC).isoformat(timespec="seconds"))
        except KeyError:
            raise HTTPException(404, "inspeção não encontrada") from None
        return {"review_id": rid}

    @app.get("/api/export.csv", dependencies=[Depends(auth)])
    def export_csv(since: str | None = None, until: str | None = None) -> PlainTextResponse:
        return PlainTextResponse(db.export_csv(since, until), media_type="text/csv",
                                 headers={"Content-Disposition": "attachment; filename=inspections.csv"})

    @app.get("/api/export.json", dependencies=[Depends(auth)])
    def export_json(since: str | None = None, until: str | None = None) -> Response:
        return Response(db.export_json(since, until), media_type="application/json",
                        headers={"Content-Disposition": "attachment; filename=inspections.json"})

    @app.get("/api/classes", dependencies=[Depends(auth)])
    def classes() -> list[dict]:
        return [{"key": c.key, "display_name": c.display_name, "severity": c.severity,
                 "validated": c.validated} for c in settings.taxonomy.classes if c.enabled]

    app.state.db = db
    return app


def check_bind_policy(settings: Settings) -> str | None:
    """Retorna o token exigido; erro se host remoto sem token."""
    ic = settings.system.interface
    token = os.environ.get(ic.auth_token_env) or None
    if ic.host not in LOOPBACK and not token:
        raise SystemExit(f"interface.host={ic.host} não é local: defina {ic.auth_token_env} "
                         "(token forte) ou use 127.0.0.1. Nunca exponha o Pi à internet.")
    return token


def serve(settings: Settings) -> None:
    import uvicorn
    token = check_bind_policy(settings)
    ic = settings.system.interface
    uvicorn.run(create_app(settings, token), host=ic.host, port=ic.port, log_level="warning",
                access_log=False)
