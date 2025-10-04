#!/bin/sh
set -e

#############################################
# Client robust entrypoint
# Mitiga:
#  - Cliente arrancando antes de que la API esté lista.
# Variables:
#  WAIT_FOR_API_URL (default: http://server:3000/api/v1/health)
#  WAIT_FOR_API_TIMEOUT_SECONDS (default: 60)
#  WAIT_FOR_API_INTERVAL_SECONDS (default: 2)
#  SKIP_WAIT_FOR_API (1 = salta la espera)
#############################################

WAIT_FOR_API_URL="${WAIT_FOR_API_URL:-http://server:3000/api/v1/health}"
WAIT_FOR_API_TIMEOUT_SECONDS="${WAIT_FOR_API_TIMEOUT_SECONDS:-60}"
WAIT_FOR_API_INTERVAL_SECONDS="${WAIT_FOR_API_INTERVAL_SECONDS:-2}"
SKIP_WAIT_FOR_API="${SKIP_WAIT_FOR_API:-0}"

if [ "$SKIP_WAIT_FOR_API" = "1" ]; then
  echo "[client-entrypoint] SKIP_WAIT_FOR_API=1 -> saltando espera de API"
else
  echo "[client-entrypoint] Waiting for API: $WAIT_FOR_API_URL (timeout ${WAIT_FOR_API_TIMEOUT_SECONDS}s)"
  START_TS=$(date +%s)
  while true; do
    if wget -q -O - "$WAIT_FOR_API_URL" >/dev/null 2>&1; then
      echo "[client-entrypoint] API reachable."
      break
    fi
    NOW=$(date +%s)
    ELAPSED=$((NOW-START_TS))
    if [ "$ELAPSED" -ge "$WAIT_FOR_API_TIMEOUT_SECONDS" ]; then
      echo "[client-entrypoint][warn] API not reachable after ${WAIT_FOR_API_TIMEOUT_SECONDS}s. Continuing anyway (dev mode)."
      break
    fi
    sleep "$WAIT_FOR_API_INTERVAL_SECONDS"
  done
fi

echo "[client-entrypoint] Starting Vite dev server..."
exec npm run dev -- --host 0.0.0.0
