#!/bin/sh
set -e

#############################################
# Robust development entrypoint
# Mitiga:
#  1. Migraciones no aplicadas (DB aún no lista)
#  2. Semilla parcial (fallos transitorios)
#  3. Cliente arrancando antes que API (capa cliente ahora también espera por health propio)
#
# Variables configurables (pueden sobreescribirse en docker-compose):
#  DB_HOST (default: postgres)
#  DB_PORT (default: 5432)
#  DB_WAIT_TIMEOUT_SECONDS (default: 60)
#  DB_WAIT_INTERVAL_SECONDS (default: 2)
#  MIGRATE_MAX_RETRIES (default: 5)
#  MIGRATE_RETRY_SLEEP_SECONDS (default: 3)
#  SEED_MAX_RETRIES (default: 3)
#  SEED_RETRY_SLEEP_SECONDS (default: 2)
#  SKIP_SEED (si =1 salta seed)
#############################################

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_WAIT_TIMEOUT_SECONDS="${DB_WAIT_TIMEOUT_SECONDS:-60}"
DB_WAIT_INTERVAL_SECONDS="${DB_WAIT_INTERVAL_SECONDS:-2}"
MIGRATE_MAX_RETRIES="${MIGRATE_MAX_RETRIES:-5}"
MIGRATE_RETRY_SLEEP_SECONDS="${MIGRATE_RETRY_SLEEP_SECONDS:-3}"
SEED_MAX_RETRIES="${SEED_MAX_RETRIES:-3}"
SEED_RETRY_SLEEP_SECONDS="${SEED_RETRY_SLEEP_SECONDS:-2}"
SKIP_SEED="${SKIP_SEED:-0}"

echo "[entrypoint] Waiting for database at ${DB_HOST}:${DB_PORT} (timeout ${DB_WAIT_TIMEOUT_SECONDS}s)..."
START_TS=$(date +%s)
while true; do
	# Intento de conexión TCP usando Node (el evento 'connect' no entrega socket como argumento, usamos referencia explícita)
	if node -e "const net=require('net');const socket=net.createConnection({host:'${DB_HOST}',port:${DB_PORT}},()=>{socket.end();process.exit(0);});socket.on('error',()=>process.exit(1));"; then
		echo "[entrypoint] Database reachable."
		break
	fi
	NOW=$(date +%s)
	ELAPSED=$((NOW-START_TS))
	if [ "$ELAPSED" -ge "$DB_WAIT_TIMEOUT_SECONDS" ]; then
		echo "[entrypoint][fatal] Database not reachable after ${DB_WAIT_TIMEOUT_SECONDS}s"
		exit 1
	fi
	sleep "$DB_WAIT_INTERVAL_SECONDS"
done

echo "[entrypoint] Applying migrations (up to ${MIGRATE_MAX_RETRIES} retries)..."
MIGRATE_ATTEMPT=1
MIGRATE_OK=0
while [ "$MIGRATE_ATTEMPT" -le "$MIGRATE_MAX_RETRIES" ]; do
	if npx prisma migrate dev; then
		MIGRATE_OK=1
		echo "[entrypoint] Migrations applied successfully on attempt ${MIGRATE_ATTEMPT}."
		break
	else
		echo "[entrypoint][warn] Migration attempt ${MIGRATE_ATTEMPT} failed. Retrying in ${MIGRATE_RETRY_SLEEP_SECONDS}s..."
		sleep "$MIGRATE_RETRY_SLEEP_SECONDS"
	fi
	MIGRATE_ATTEMPT=$((MIGRATE_ATTEMPT+1))
done
if [ "$MIGRATE_OK" -ne 1 ]; then
	echo "[entrypoint][warn] Migrations not confirmed after ${MIGRATE_MAX_RETRIES} attempts. Continuing (dev mode)."
fi

if [ "$SKIP_SEED" = "1" ]; then
	echo "[entrypoint] SKIP_SEED=1 -> seeding skipped."
else
	echo "[entrypoint] Seeding database (max ${SEED_MAX_RETRIES} retries)..."
	SEED_ATTEMPT=1
	SEED_OK=0
	# Detect script name dinamicamente
	if npm run | grep -q "prisma:seed"; then
		SEED_SCRIPT="prisma:seed"
	elif npm run | grep -q "seed"; then
		SEED_SCRIPT="seed"
	else
		SEED_SCRIPT=""
	fi
	if [ -z "$SEED_SCRIPT" ]; then
		echo "[entrypoint] No seed script found. Skipping seed phase."
	else
		while [ "$SEED_ATTEMPT" -le "$SEED_MAX_RETRIES" ]; do
			if npm run "$SEED_SCRIPT"; then
				SEED_OK=1
				echo "[entrypoint] Seed completed on attempt ${SEED_ATTEMPT}."
				break
			else
				echo "[entrypoint][warn] Seed attempt ${SEED_ATTEMPT} failed. Retrying in ${SEED_RETRY_SLEEP_SECONDS}s..."
				sleep "$SEED_RETRY_SLEEP_SECONDS"
			fi
			SEED_ATTEMPT=$((SEED_ATTEMPT+1))
		done
		if [ "$SEED_OK" -ne 1 ]; then
			echo "[entrypoint][warn] Seed did not complete after ${SEED_MAX_RETRIES} attempts. Continuing (dev mode)."
		fi
	fi
fi

echo "[entrypoint] Starting dev server..."
exec npm run dev
