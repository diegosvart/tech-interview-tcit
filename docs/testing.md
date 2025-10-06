# Estrategia de Testing

Esta documentación refleja el estado ACTUAL de la estrategia aplicada en el repositorio tras la estabilización de la suite de integración backend.

## Objetivos
1. Ejecución determinista (sin flakes) sobre PostgreSQL real.
2. Feedback rápido (< 2s) para CRUD + validaciones + health.
3. Base extensible para añadir más capas (servicios, dominio puro, frontend) sin rehacer cimientos.
4. Facilitar integración CI/CD (scripts unificados en raíz) y cobertura mínima razonable.

## Alcance actual
| Capa | Tipo | Herramientas | Estado |
|------|------|--------------|--------|
| Backend HTTP | Integración | Vitest + Supertest + Prisma + PostgreSQL | Implementado |
| Validaciones | Integración (Zod) | Vitest | Implementado |
| Healthcheck | Integración | Vitest | Implementado |
| Frontend | Unit / Component | Vitest + RTL | Infra lista (scripts), tests pendientes |
| Dominio puro / servicios | Unit | Vitest | Pendiente (no crítico aún) |

## Backend: diseño de las pruebas
Características clave:
- Runner: `Vitest` en modo single-thread (sin workers) para evitar condiciones de carrera en DB.
- Librería HTTP: `supertest` sobre la app Express exportada (no se levanta puerto real en tests).
- Base de datos: PostgreSQL real vía servicio `postgres-test` (profile `test` en `docker-compose-dev.yml`).
- ORM: Prisma Client generado + migraciones aplicadas antes de correr los tests (hook `pretest:integration`).
- Aislamiento de datos: truncado de tablas al inicio de cada suite que lo requiere (no en cada `beforeEach` para evitar interferencia temporal con peticiones concurrentes dentro de una misma suite).
- Flujo CRUD consolidado: un solo test encadenado para create → list → get → update → delete → not found. Minimiza over‑head de arranque/apagado de conexiones.

### Scripts relevantes
Ubicación raíz (`package.json`):
- `test` / `test:server`: ejecuta `server/test:integration` (Vitest). 
- `test:server:coverage`: cobertura backend.
- `build:all`: compila backend (tsc) y frontend (tsc + vite build).
- `lint:all`: ESLint en ambos paquetes.

Ubicación `server/package.json`:
- `pretest:integration`: `prisma generate && prisma migrate deploy` con `DATABASE_URL` de test.
- `test:integration`: Vitest (reporter verbose) con la misma URL.
- `db:test:reset`: `prisma migrate reset --force --skip-seed` (uso puntual, no parte del flujo normal).

### Convenciones
| Tema | Decisión |
|------|----------|
| Paralelismo | Desactivado (`threads: false`, `singleThread: true`). |
| Orden archivos | Secuencial (config Vitest) para reproducibilidad. |
| Truncado | Manual por suite (ej. en `posts.validation.test.ts` y `posts.crud.test.ts`). |
| Cobertura | Umbrales mínimos definidos en `vitest.config.ts` (≈ líneas 70%, ramas 60%). |
| Nombres de pruebas | Español descriptivo (mantener consistencia). |
| IDs | UUID, validaciones cubiertas en tests de error 400. |
| Health | Test directo sin manipulación de estado. |

### Razonamiento sobre el truncado por suite
Se descartó:
- Truncado global en `beforeEach` (causaba 404 intermitentes tras un POST por limpiar demasiado pronto).
- Reejecución de migraciones por suite (coste innecesario > latencia).

Se adoptó:
- 1 × truncado inicial por suite de datos mutables (`posts`).
- Secuencia lineal dentro del test CRUD para conservar el registro creado hasta su eliminación.

### Migraciones y Prisma
- Las migraciones se aplican una sola vez al comienzo gracias al hook `pretest:integration`.
- Aviso Prisma: `package.json#prisma` deprecado → Acción futura: crear `prisma.config.ts` y mover `seed`.

## Frontend (estado actual)
Infra lista (scripts `test`, `test:watch`, `test:coverage` en `client`). Pendiente añadir primeras pruebas:
- Render de `PostsList` con datos mock (MSW opcional o stub manual RTK Query).
- Validación de formulario (creación/edición) y manejo de errores.

## Ejecución local
1. Levantar entorno (incluye DB test si usas profile completo):
```powershell
docker compose -f docker-compose-dev.yml --profile test up -d postgres-test
```
2. Correr tests backend desde raíz:
```powershell
npm test
```
3. Cobertura:
```powershell
npm run test:server:coverage
```
4. Lint + build (pre‑commit manual):
```powershell
npm run lint:all
npm run build:all
```

## Estructura simplificada de ficheros de test backend
```
server/
  tests/
    setup.ts                # Carga env y verifica conexión, cierra prisma al final
    posts.crud.test.ts      # Flujo CRUD completo
    posts.validation.test.ts# Validaciones 400
    health.test.ts          # Health + 404 genérico
  vitest.config.ts          # Config single-thread + coverage
```

## Métricas rápidas (referencia actual)
- Test files: 3
- Tests: 13
- Duración aproximada: ~1–1.5s en máquina local.

## Roadmap inmediato
| Prioridad | Acción | Motivo |
|-----------|--------|--------|
| Alta | Documentar profile test en `docs/docker.md` | Alinear dev/CI | 
| Alta | Workflow CI (test + build + coverage) | Automatizar verificación |
| Media | Primera batería frontend | Cubrir UI crítica |
| Media | Prisma config file | Eliminar warning futuro |
| Baja | Aislamiento per‑worker (schemas) | Sólo si reactivamos paralelismo |

## Posibles mejoras futuras
- Snapshot de esquema (pg dump) para “seed” súper rápida si el dominio crece.
- MSW para pruebas frontend integradas con RTK Query.
- Tests unitarios de servicios de dominio (sin tocar Prisma).
- Reutilizar transacciones + rollback por suite (si el patrón de casos aumenta y se necesita velocidad extra).

## FAQ
**¿Por qué no usar SQLite en memoria?** Prisma + PostgreSQL garantiza que cualquier peculiaridad de tipos/operadores se detecta temprano (UUID nativo, constraints, etc.).

**¿Por qué un único test CRUD largo y no varios?** Minimiza arranques/truncados y elimina una fuente de flakes por sincronización; mantiene intención narrativa.

**¿Reactivar paralelismo?** Sólo tras introducir aislamiento por esquema por worker (creación dinámica de schemas `test_worker_X`). Actualmente no necesario.

---
Última actualización: <!-- FECHA -->
