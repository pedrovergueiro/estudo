"""Política de retenção de imagens (por idade e estado, e limite total em GB).

Os REGISTROS no banco não são apagados por esta rotina (rastreabilidade);
apenas os arquivos de imagem. O registro mantém o caminho e passa a indicar
que a imagem expirou.
"""

from __future__ import annotations

import time
from pathlib import Path

from ..config import RetentionConfig

STATUS_DIRS = ("PASS", "FAIL", "REVIEW", "SYSTEM_ERROR")


def _days(cfg: RetentionConfig, status: str) -> float:
    return {"PASS": cfg.pass_images_days, "FAIL": cfg.fail_images_days}.get(status, cfg.review_images_days)


def apply_retention(images_dir: Path, cfg: RetentionConfig, now: float | None = None,
                    dry_run: bool = False) -> dict[str, int]:
    """Estrutura esperada: images_dir/<STATUS>/<AAAA-MM-DD>/<arquivo>."""
    now = now or time.time()
    images_dir = Path(images_dir)
    removed = {"age": 0, "size": 0}
    files: list[tuple[float, int, Path]] = []
    for status in STATUS_DIRS:
        base = images_dir / status
        if not base.exists():
            continue
        limit = now - _days(cfg, status) * 86400
        for f in base.rglob("*"):
            if not f.is_file():
                continue
            st = f.stat()
            if st.st_mtime < limit:
                if not dry_run:
                    f.unlink(missing_ok=True)
                removed["age"] += 1
            else:
                # PASS sai primeiro quando o limite de tamanho é atingido
                files.append((st.st_mtime if status == "PASS" else st.st_mtime + 1e12, st.st_size, f))
    total = sum(s for _, s, _ in files)
    cap = cfg.max_images_gb * 1e9
    for _, size, f in sorted(files):
        if total <= cap:
            break
        if not dry_run:
            f.unlink(missing_ok=True)
        total -= size
        removed["size"] += 1
    for d in sorted(images_dir.rglob("*"), reverse=True):  # pastas vazias
        if d.is_dir() and not any(d.iterdir()) and not dry_run:
            d.rmdir()
    return removed
