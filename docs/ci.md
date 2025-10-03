# CI/CD – Lineamientos

## Objetivos
- Automatizar lint, typecheck y tests en Pull Requests.
- Builds reproducibles y feedback rápido.

## Pipeline sugerido (GitHub Actions)
- Jobs:
  - `lint` (matriz server/client): instala dependencias mínimas y ejecuta ESLint (server falla en errores; client permite warnings no fatales ahora).
  - `backend`: instala deps, typecheck, tests (depende de `lint`).
  - `frontend`: instala deps, typecheck, tests, build (depende de `lint`).
- Caché: gestionado por `actions/setup-node` con `cache: npm`.
- Artefactos: (pendiente) reports de tests/coverage.

## Workflow implementado

Se ha añadido el workflow en `.github/workflows/ci.yml` con cuatro jobs:

### lint (matriz server & client)
- Instala dependencias específicas de cada paquete (`npm ci --prefix <project>`).
- Ejecuta `npm run lint` para `server` (errores rompen build).
- Ejecuta `npm run lint` para `client` (warnings actuales no fallan, temporal hasta fijar severidad final).

### backend
- Service Postgres (imagen `postgres:16-alpine`).
- Instala dependencias (`npm ci --prefix server`).
- `prisma:generate` (ignora fallo eventual en Windows/Ondrive).
- Migraciones modo deploy: `prisma:migrate:deploy`.
- Seed de base (`prisma:seed`).
- Tests con cobertura (Vitest + Supertest).

### frontend
- Instala dependencias (`npm ci --prefix client`).
- Typecheck: `tsc --noEmit`.
- Tests con cobertura (Vitest + Testing Library).
- Build de producción (`npm run build --prefix client`).

### summary
- Reporta resultado de los dos jobs anteriores (estado simple en logs).

## Ejecución
Disparadores: `push` a `main`, `develop`, `feature/*` y todos los `pull_request`.
Para forzar ejecución: crear/actualizar PR o hacer push a cualquiera de esas ramas.

## Quality Gates actuales
Orden de fallos (short-circuit):
1. Lint (server and client) – corta antes de levantar Postgres o correr tests.
2. Backend tests (incluye typecheck implícito por Vitest y scripts) tras migraciones.
3. Frontend typecheck + tests + build.

## Mejoras futuras
| Área | Acción | Beneficio |
|------|--------|-----------|
| Lint | Añadir ESLint y job/step `npm run lint` | Detectar problemas de estilo y errores tempranos |
| Coverage | Umbrales Vitest (`--coverage` + config thresholds) | Falla temprana ante regresión de cobertura |
| OpenAPI/Zod | Script sync y job de diff | Evitar divergencia contracto vs validaciones |
| Artifacts | Subir `coverage/lcov.info` | Integrar con badges o SonarQube |
| Auditoría | `npm audit --production` (allowlist dev) | Seguridad mínima en dependencias |
| Cache | `actions/setup-node` ya cachea; opcional usar `pnpm`/`turbo` | Build más rápido |
| CD | Añadir job deploy (cuando exista entorno) | Automatizar releases |
| Qualidad agregada | CodeQL o SAST adicional | Seguridad estática |

## Recomendaciones de scripts (ajustes pendientes)
- Añadir `lint` y `typecheck` explícitos en ambos `package.json`.
- Añadir script `contract:check` cuando se integre generación automática de OpenAPI.

## Plantillas relacionadas
- `docs/templates/ci-github-actions.yml` (referencia base anterior).

## Próximos pasos
- Endurecer reglas ESLint (elevar warnings del client a errores una vez refactorizado).
- Integrar badge de estado (ej. en `README.MD`).
- Añadir sync Zod↔OpenAPI.
- Publicar cobertura como artefacto y definir thresholds.
