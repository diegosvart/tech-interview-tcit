# Entorno de Desarrollo – Guía de Revisión

Esta guía centraliza cómo está compuesto el entorno de desarrollo multi-servicio (Docker + código local montado) y cómo validar cada pieza de forma independiente.

## 1. Componentes y archivos clave

| Componente | Propósito | Archivos relevantes |
|------------|-----------|---------------------|
| Base de datos (PostgreSQL) | Persistencia | `docker-compose-dev.yml` (servicio `postgres`) |
| Backend (API Node/Express) | Lógica de negocio y endpoints REST | `server/Dockerfile.dev`, `server/docker-entrypoint.dev.sh`, `server/package.json`, `server/src/**`, `prisma/schema.prisma` |
| Frontend (React + Vite) | UI | `client/Dockerfile.dev`, `client/docker-entrypoint.dev.sh`, `client/vite.config.ts`, `client/.env.development`, `client/src/**` |
| Prisma Studio (opcional) | Exploración visual de datos | Servicio `studio` (profile), `server/Dockerfile.dev` reutilizado |
| Compose multi-servicio | Orquestación | `docker-compose-dev.yml` |
| Ignorados build | Optimizar contexto | `.dockerignore` |
| Documentación Docker | Referencia ampliada | `docs/docker.md` |

## 2. Estructura de red y puertos

| Servicio | Host interno (Docker) | Puerto interno | Puerto expuesto (host) | URL Host |
|----------|-----------------------|---------------|-------------------------|----------|
| postgres | `postgres` | 5432 | 5432 | `localhost:5432` |
| server (API) | `server` | 3000 | 3000 | `http://localhost:3000` |
| client (Vite) | `client` | 5173 | 5173 | `http://localhost:5173` |
| studio (Prisma Studio, profile) | `studio` | 5555 | 5555 | `http://localhost:5555` |

La comunicación interna contenedor→contenedor usa los hostnames de servicio (`server`, `postgres`). El frontend usa proxy/VITE_API_URL apuntando a `http://server:3000`.

## 3. Variables de entorno y configuración

### Backend
- `DATABASE_URL=postgresql://postgres:postgres@postgres:5432/techtest`
- `PORT=3000`
- `NODE_ENV=development`

Scripts (`server/package.json`):
- `dev`: arranque con tsx watch
- `prisma:migrate`: migraciones (`prisma migrate dev`)
- `prisma:seed`: `prisma db seed`

### Frontend
- `VITE_API_URL=http://server:3000/api/v1` (en `client/.env.development` + compose)
- Puerto configurado en `vite.config.ts`: 5173
- Proxy (en `vite.config.ts`):
  ```ts
  proxy: {
    '/api': { target: 'http://server:3000', changeOrigin: true, secure: false }
  }
  ```

### Docker Compose (`docker-compose-dev.yml`)
Fragmento relevante (resumido):
```yaml
services:
  postgres:
    image: postgres:16
    environment: { POSTGRES_USER: postgres, POSTGRES_PASSWORD: postgres, POSTGRES_DB: techtest }
  server:
    build:
      context: .
      dockerfile: server/Dockerfile.dev
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/techtest
      PORT: 3000
  client:
    build:
      context: .
      dockerfile: client/Dockerfile.dev
    environment:
      VITE_API_URL: http://server:3000/api/v1
```

### Archivos especiales
- `server/docker-entrypoint.dev.sh`: corre migraciones + seed + levanta dev server (ahora con espera activa de DB y reintentos configurables).
- `client/docker-entrypoint.dev.sh`: espera la API (`/api/v1/health`) antes de iniciar Vite para reducir errores iniciales de fetch.
- `.dockerignore`: evita subir `node_modules`, `dist`, `docs`, `.vite`, etc.

## 4. Flujo de arranque completo
```powershell
docker compose -f docker-compose-dev.yml up -d --build
```
Secuencia:
1. `postgres` inicia y pasa healthcheck.
2. `server` espera health de `postgres`, luego entrypoint: espera conectividad TCP → migraciones (retries) → seed (retries) → `npm run dev` y su healthcheck expone `/api/v1/health`.
3. `client` espera explícitamente el endpoint de health (`WAIT_FOR_API_URL`) antes de iniciar Vite; su healthcheck valida la raíz HTML (`<!doctype`).
4. (Opcional) Si se incluye el perfil `studio`, Prisma Studio se expone en `:5555` tras confirmarse la base de datos.

## 5. Verificación individual de servicios

### 5.1 Postgres
Ver contenedor:
```powershell
docker compose -f docker-compose-dev.yml ps postgres
```
Logs:
```powershell
docker compose -f docker-compose-dev.yml logs -f postgres
```
Conexión rápida (requiere tener `psql` local):
```powershell
psql -h localhost -U postgres -d techtest -c "\dt"
```
(Password: `postgres`)

### 5.2 Backend (API)
Health:
```powershell
curl -i http://localhost:3000/api/v1/health
```
Health (Docker):
```powershell
docker inspect --format='{{json .State.Health}}' $(docker compose -f docker-compose-dev.yml ps -q server)
```
Listar posts:
```powershell
curl -s http://localhost:3000/api/v1/posts | Select-String -Pattern 'id'
```
Logs en vivo:
```powershell
docker compose -f docker-compose-dev.yml logs -f server
```
Ejecutar migración manual:
```powershell
docker compose -f docker-compose-dev.yml exec server npx prisma migrate dev
```
Seed manual:
```powershell
docker compose -f docker-compose-dev.yml exec server npm run prisma:seed
```

### 5.3 Frontend
Abrir navegador: `http://localhost:5173`

Health (Docker):
```powershell
docker inspect --format='{{json .State.Health}}' $(docker compose -f docker-compose-dev.yml ps -q client)
```
Ping API desde dentro del contenedor:
```powershell
docker compose -f docker-compose-dev.yml exec client curl -s -o /dev/null -w "%{http_code}\n" http://server:3000/api/v1/health
```
Ver variable inyectada:
```powershell
docker compose -f docker-compose-dev.yml exec client sh -c 'echo $VITE_API_URL'
```
Logs:
```powershell
docker compose -f docker-compose-dev.yml logs -f client
```

## 6. Hot Reload y Volúmenes
Montajes:
- `./server:/app` → cambios TypeScript se reflejan (tsx watch).
- `./client:/app` → recarga Vite en navegador.
`/app/node_modules` se mantiene en contenedor para evitar discrepancias de sistema operativo.

## 7. Troubleshooting rápido
| Síntoma | Posible causa | Acción |
|--------|---------------|--------|
| Frontend no carga datos | Proxy mal apuntado / variable no leída | Revisar `vite.config.ts` y `VITE_API_URL` dentro del contenedor |
| 304 en posts y UI vacía | Respuesta cacheada legítima | Forzar recarga, revisar Network y data en store |
| Backend no arranca | Migración fallida repetida | Aumentar `MIGRATE_MAX_RETRIES` / `DB_WAIT_TIMEOUT_SECONDS` y revisar logs |
| Seed duplica datos | Seed no idempotente | Ajustar script `prisma/seed.ts` con chequeos previos |
| Contenedor client no resuelve `server` | Red / nombre de servicio incorrecto | Confirmar `docker compose ps` y hostname `server` |
| Cliente arranca sin API | Timeout de espera corto | Incrementar `WAIT_FOR_API_TIMEOUT_SECONDS` |
| Cambios Prisma no reflejados | Cliente no regenerado | `docker compose exec server npx prisma generate` y reiniciar server |

## 8. Comandos resumen (cheat sheet)
```powershell
# Arrancar (modo robusto por defecto)
docker compose -f docker-compose-dev.yml up -d --build
# Arrancar con más reintentos / tiempo de espera DB
MIGRATE_MAX_RETRIES=10 DB_WAIT_TIMEOUT_SECONDS=120 docker compose -f docker-compose-dev.yml up -d --build
# Ver estado
docker compose -f docker-compose-dev.yml ps
# Reiniciar todos
docker compose -f docker-compose-dev.yml restart
# Reiniciar solo server / client
docker compose -f docker-compose-dev.yml restart server
docker compose -f docker-compose-dev.yml restart client
# Levantar Prisma Studio (perfil opcional)
docker compose -f docker-compose-dev.yml --profile studio up -d studio
# Levantar todo incluido Studio
docker compose -f docker-compose-dev.yml --profile studio up -d
# Logs Studio
docker compose -f docker-compose-dev.yml logs -f studio
# Reiniciar Studio
docker compose -f docker-compose-dev.yml restart studio
# Detener Studio
docker compose -f docker-compose-dev.yml stop studio
# Verificar migraciones aplicadas (log)
docker compose -f docker-compose-dev.yml logs --tail=80 server | Select-String "Migrations applied successfully"
# Parar (mantiene contenedores y volúmenes)
docker compose -f docker-compose-dev.yml stop
# Logs API
docker compose -f docker-compose-dev.yml logs -f server
# Logs Frontend
docker compose -f docker-compose-dev.yml logs -f client
# Health API
curl http://localhost:3000/api/v1/health
# Posts API
curl http://localhost:3000/api/v1/posts
# Ping API desde client
docker compose -f docker-compose-dev.yml exec client curl -i http://server:3000/api/v1/health
# Migración manual
docker compose -f docker-compose-dev.yml exec server npx prisma migrate dev
# Seed manual
docker compose -f docker-compose-dev.yml exec server npm run prisma:seed
# Reiniciar solo frontend
docker compose -f docker-compose-dev.yml restart client
# Apagar
docker compose -f docker-compose-dev.yml down
# Apagar + reset DB
docker compose -f docker-compose-dev.yml down -v
```

## 9. Extensiones futuras
- Añadir entorno de staging con imágenes buildadas (`docker-compose.staging.yml`).
- Multi-stage Dockerfiles para producción (reducción de tamaño).
- Observabilidad (agentes, métricas) integrada.
- Test end-to-end en contenedores (Playwright / Cypress + API).

---
Esta guía debe revisarse cada vez que cambien puertos, nombres de servicio, o se introduzcan nuevas dependencias (cache, cola, etc.).
