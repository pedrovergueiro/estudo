# GUARDIAN — reproducible research container.
#
# The container is the outer sandbox layer: it runs as an unprivileged user
# with a read-only root filesystem (see docker-compose.yml) and needs no
# network access at all.  The in-process sandbox is the inner layer.
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONHASHSEED=0 \
    GUARDIAN_LOG_FORMAT=json \
    PYTHONPATH=/app

WORKDIR /app

# No third-party runtime dependencies; dev extras are installed for the tests.
RUN pip install --no-cache-dir "pytest>=8.0"

COPY guardian /app/guardian

RUN useradd --create-home --uid 10001 guardian \
    && mkdir -p /data \
    && chown -R guardian:guardian /app /data
USER guardian

VOLUME ["/data"]
EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
    CMD python -c "import guardian; print(guardian.__version__)" || exit 1

ENTRYPOINT ["python", "-m", "guardian.cli", "--data-dir", "/data"]
CMD ["demo", "-n", "4"]
