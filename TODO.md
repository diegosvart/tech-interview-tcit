# TODO detallado – Construcción del proyecto (paso a paso)

Este archivo registra, en orden único y opinado, los pasos y comandos para construir el proyecto desde cero en Windows PowerShell, junto con el porqué de cada decisión. La meta es que cualquier persona pueda replicar la construcción sin huecos de información.

Orden elegido y justificación:
- 1) Git primero: versionar desde el inicio garantiza trazabilidad de cada decisión/cambio.
- 2) Inicialización del proyecto y librerías: fija el “stack” y scripts desde el principio para evitar re-trabajo.
- 3) Estructura de directorios: define límites y separación de responsabilidades (clean architecture) antes de escribir código.
- 4) Modelo de datos (Prisma + Postgres): establece el contrato de persistencia temprano; reduce cambios aguas abajo.
- 5) Calidad/automatización (scripts, lint, CI): asegura consistencia y DX antes de crecer.

Requisitos previos (local):
- Node.js LTS (>= 18) y npm (incluido con Node)
- Git
- Docker Desktop (para Postgres)

Notas de estilo:
- Todos los comandos están preparados para Windows PowerShell.
- Usa commit incrementales después de cada hito para mantener una historia clara.

--------------------------------------------------------------------------------

## 1) Inicializar repositorio Git

Motivación: activar versionado desde el primer minuto para auditar y revertir fácilmente.

```powershell
# Dentro del directorio del proyecto
git init
git branch -M main
git config user.name "Diego Morales Contreras"
git config user.email "moralesc.diego@gmail.com"

# Agregar repositorio remoto
git remote add origin https://github.com/diegosvart/tech-test-tcit.git
```

Commit inicial vacío (mantener historia):
```powershell
#convención para versionar
ni .gitkeep -ItemType File
git add .
git commit -m "chore(repo): initial commit"
```

Push inicial al remoto:
```powershell
git push -u origin main
```

--------------------------------------------------------------------------------

## 2) Archivos raíz y templates

Motivación: estandarizar herramientas desde el inicio (editor, ignores, orquestación local).

```powershell
# Copiar templates al raíz (ajusta rutas si difieren)
Copy-Item .\docs\templates\editorconfig-template.ini .\.editorconfig -Force
Copy-Item .\docs\templates\gitignore-template.txt .\.gitignore -Force
Copy-Item .\docs\templates\docker-compose-dev-template.yml .\docker-compose.yml -Force

git add .editorconfig .gitignore docker-compose.yml
git commit -m "chore(root): add editorconfig, gitignore, docker-compose (dev db)"
```

--------------------------------------------------------------------------------

## 3) Estructura de directorios (clean architecture)

Motivación: crear límites claros antes del código evita dependencias accidentales y re-organizaciones.

Basado en `docs/templates/directory-structure-template.md`:
```powershell
# Raíz del repo
mkdir client, server | Out-Null

# Backend – capas
mkdir server\src\domain\entities, server\src\domain\dtos `
    , server\src\application\services `
    , server\src\infrastructure\prisma, server\src\infrastructure\repositories `
    , server\src\interfaces\http\controllers, server\src\interfaces\http\routes, server\src\interfaces\http\middlewares `
    , server\src\config | Out-Null

# Placeholders para versionar carpetas vacías
Get-ChildItem server -Recurse -Directory | ForEach-Object { New-Item -Path $_.FullName -Name .gitkeep -ItemType File -Force | Out-Null }

git add server client
git commit -m "chore(structure): create client/server folders and server clean-arch skeleton"
```

--------------------------------------------------------------------------------

## 4) Inicialización de orquestación raíz

Motivación: orquestar dev de frontend y backend desde el raíz simplifica DX.

```powershell
# Crear package.json raíz y utilidades de orquestación
npm init -y
npm i -D concurrently cross-env

# Scripts raíz (npm v8+). Por ahora solo backend; el client se añadirá luego.
npm set-script server:dev "npm --prefix server run dev"
# El script client:dev y dev combinado se agregarán tras la fase de frontend
npm set-script format "prettier -w ."
npm set-script lint "eslint ."
npm set-script typecheck "echo \"Type checks delegated to subprojects\""

git add package.json package-lock.json
git commit -m "chore(root): npm init and add orchestration scripts"
```

--------------------------------------------------------------------------------

## 5) Backend: inicialización del proyecto (Node + TS + Express + Prisma)

Motivación: establecer el servicio de API y el ORM con tipado fuerte.

```powershell
cd server
npm init -y

# Dependencias de producción
npm i express zod cors helmet pino pino-http dotenv @prisma/client

# Dependencias de desarrollo
npm i -D typescript tsx @types/node @types/express @types/cors @types/helmet prisma

# TypeScript config
npx tsc --init --rootDir src --outDir dist --esModuleInterop --resolveJsonModule --module commonjs --target ES2020 --strict

# Prisma init (datasource Postgres)
npx prisma init --datasource-provider postgresql

# Scripts del backend
npm pkg set scripts.dev="cross-env NODE_ENV=development tsx watch src/main.ts"
npm pkg set scripts.build="tsc -p tsconfig.json"
npm pkg set scripts.start="node dist/main.js"
npm pkg set scripts.prisma:generate="prisma generate"
npm pkg set scripts.prisma:migrate="prisma migrate dev"

# Variables de entorno
"DATABASE_URL=postgresql://postgres:postgres@localhost:5432/techtest?schema=public" | Out-File -Encoding utf8 .env

git add .
git commit -m "feat(server): init express+ts+prisma project with tsconfig and scripts"
cd ..
```

--------------------------------------------------------------------------------

## 6) Contrato de API (OpenAPI/Swagger) – antes de codificar

Motivación: congelar contrato con OpenAPI para minimizar retrabajo y habilitar testing de integración.

```powershell
# Basado en docs/api.md y docs/templates/openapi-template.json
# Copia/actualiza el template y revísalo
Copy-Item .\docs\templates\openapi-template.json .\openapi.json -Force
git add openapi.json
git commit -m "docs(api): add initial OpenAPI contract"
```

Opcional: exponer Swagger UI en el backend (planificado para implementación en fase D).

--------------------------------------------------------------------------------

## 7) Base de datos local: Postgres con Docker

Motivación: entorno reproducible y aislado.

```powershell
# Levantar Postgres en segundo plano
docker compose up -d

# Verificar contenedor
docker ps | Select-String postgres
```

--------------------------------------------------------------------------------

## 8) Modelo de datos (Prisma) y migración inicial

Motivación: definir el contrato de persistencia temprano (IDs UUID y timestamps).

Editar `server/prisma/schema.prisma` con el siguiente contenido mínimo para el modelo `Post`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Post {
  id          String   @id @default(uuid()) @db.Uuid
  name        String
  description String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Generar cliente y correr migración:
```powershell
cd server
npm run prisma:generate
npm run prisma:migrate -- --name init_posts
cd ..
```

Commit de la migración:
```powershell
git add server/prisma server/package.json server/package-lock.json
git commit -m "feat(db): add Post model and initial migration"
```

--------------------------------------------------------------------------------

## 9) Backend: implementación y pruebas

Motivación: desarrollar el backend completo antes de UI.

- Implementar capas (domain/application/infrastructure/interfaces)
- Validación (Zod), CORS, Helmet, pino, error handler, healthcheck
- Endpoints CRUD de posts alineados a OpenAPI
- Pruebas: unitarias (servicios/validaciones) e integración (supertest)

CI backend (si aún no se hizo):
```powershell
mkdir .github\workflows -ErrorAction SilentlyContinue | Out-Null
Copy-Item .\docs\templates\ci-github-actions.yml .\.github\workflows\ci.yml -Force
git add .github\workflows\ci.yml
git commit -m "ci(backend): add lint/typecheck/test workflow"
```

--------------------------------------------------------------------------------

## 10) Linting, formato y convenciones (calidad base)

Motivación: calidad consistente y cambios mínimos por PR.

```powershell
# Copiar plantillas de ESLint y Prettier al raíz (puedes también copiar variantes por subproyecto)
Copy-Item .\docs\templates\eslint-template.json .\.eslintrc.json -Force
Copy-Item .\docs\templates\prettier-template.json .\.prettierrc.json -Force

git add .eslintrc.json .prettierrc.json
git commit -m "chore(quality): add eslint+prettier configs"
```

Instalar dependencias mínimas de linting en raíz (opción centralizada):
```powershell
npm i -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier
git add package.json package-lock.json
git commit -m "chore(quality): add eslint/prettier deps"
```

--------------------------------------------------------------------------------

## 11) Scripts de desarrollo orquestados (root)

Motivación: una orden para levantar todo.

```powershell
# A nivel raíz (por ahora):
# npm run server:dev  -> backend solamente
```

--------------------------------------------------------------------------------

## 12) Frontend: inicialización (Vite + React + TS + Redux Toolkit)

Motivación: comenzar UI una vez estabilizado y probado el backend.

```powershell
# Crear app con Vite (plantilla React + TS) dentro de la carpeta existente
cd client
npm create vite@latest . -- --template react-ts
npm i @reduxjs/toolkit react-redux axios zod

# Variables de entorno del cliente (API base via proxy de Vite)
"VITE_API_BASE_URL=/api" | Out-File -Encoding utf8 .env

# Scripts (Vite ya define dev/build/preview)
npm pkg set scripts.lint="eslint ."
npm pkg set scripts.format="prettier -w ."

git add .
git commit -m "feat(client): init vite react-ts and add RTK/axios/zod"
cd ..
```

Configurar proxy de desarrollo (Vite) hacia el backend:

```ts
// client/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

```powershell
git add client/vite.config.ts
git commit -m "chore(client): add dev proxy to backend"
```

--------------------------------------------------------------------------------

## 13) Arranque local (smoke test)

Motivación: validar wiring general antes de codificar features.

```powershell
# 1) DB arriba
docker compose up -d

# 2) Prisma listo
cd server; npm run prisma:generate; cd ..

# 3) Backend solamente
npm run server:dev

# 4) Una vez creado el frontend (paso 12):
# Añadir scripts root y levantar ambos en paralelo
npm set-script client:dev "npm --prefix client run dev"
npm set-script dev "concurrently \"npm run server:dev\" \"npm run client:dev\""
npm run dev
```

Esperado:
- Cliente en http://localhost:5173
- Backend en http://localhost:3000 (cuando implementemos main.ts y rutas de salud)

--------------------------------------------------------------------------------

## 14) Próximos pasos (features y contratos)

Con la base creada:
- Implementar endpoints REST de `posts` siguiendo `docs/api.md` (paginación por offset) y ADRs:
  - `docs/adr/0002-ids-uuid-vs-autoincrement.md` (usar UUID)
  - `docs/adr/0003-pagination-offset-vs-cursor.md` (offset)
- Implementar en frontend: store (RTK), slice `posts`, thunks CRUD, componentes `PostsList` y `PostForm`.
- Añadir pruebas (unitarias e integración) según `docs/testing.md`.

--------------------------------------------------------------------------------

## Anexos

- Directorios propuestos y responsabilidades: `docs/templates/directory-structure-template.md`
- Docker (desarrollo local): `docs/docker.md`
- Calidad/CI: `docs/quality.md`, `docs/ci.md`

Fin del TODO detallado.

--------------------------------------------------------------------------------

## Notas técnicas para paso a producción

- Variables de entorno y secretos
  - Centralizar configuración en variables de entorno. No commitear `.env`.
  - Usar un gestor de secretos (GitHub Actions Secrets, Azure Key Vault, AWS Secrets Manager).
  - Separar configs por entorno (dev, staging, prod). Validar configuración al arranque (Zod).

- Base de datos y migraciones
  - En despliegue usar `prisma migrate deploy` (no `migrate dev`).
  - Backups antes de cada despliegue. Probar restauración/rollback en staging.
  - Pooling de conexiones (Prisma; opcional pgbouncer). Ajustar timeouts y tamaño de pool por entorno.

- Seguridad y hardening
  - CORS con allowlist de orígenes de prod (evitar `*`).
  - Helmet con políticas adecuadas (por ejemplo, `contentSecurityPolicy`).
  - Rate limiting (p. ej. `express-rate-limit`) y límites de body.
  - Validación estricta de entrada (Zod) en todos los endpoints. Sanitizar salidas si hay HTML.
  - Deshabilitar endpoints de debug en prod (Swagger detrás de auth o no expuesto públicamente).

- Logs y observabilidad
  - Logs estructurados (pino) con nivel por entorno (`info` en prod).
  - Correlación de peticiones (request id). Exportar a un stack de logs (ELK, Loki, etc.).
  - Métricas (Prometheus/OpenTelemetry) y alertas (SLOs: disponibilidad, latencia, tasa de error).

- Salud y readiness
  - `/health` (liveness) y `/ready` (readiness: DB y dependencias críticas).
  - HEALTHCHECK en contenedores y probes en el orquestador.

- OpenAPI/Swagger
  - Publicar OpenAPI versionado. Evitar Swagger abierto en prod o protegerlo.
  - Alinear contrato y tests (idealmente contract testing).
  - Añadir ejemplos y respuestas de error consistentes.

- Errores y respuesta
  - Estructura de error consistente (`code`, `message`, `details`).
  - Mapear errores de Prisma a HTTP (400/404/409), ocultar detalles internos al cliente.

- CI/CD
  - Pipeline con: lint, typecheck, tests, build, `prisma generate` y `prisma migrate deploy` en deploy.
  - Escaneo de vulnerabilidades (npm audit, Dependabot/Snyk).
  - Checks obligatorios en PR y revisiones antes de merge a `develop/main`.

- Contenedores y runtime
  - Imagen Node minimal (alpine/distroless) y build multi-stage.
  - `NODE_ENV=production`, sin source maps en prod (o subirlos a un store seguro si se requieren).
  - Limitar memoria/CPU por contenedor y configurar auto-restart.

- Red y despliegue
  - Reverse proxy / Ingress con TLS (HTTPS end-to-end). HSTS y redirección 80→443.
  - Políticas de caché controladas y correcto manejo de CORS si hay CDN/frontend.

- Backups y recuperación
  - Backups automáticos con retención definida.
  - Procedimiento documentado y probado de restauración/rollback.

- Migraciones y orquestación
  - Asegurar que `migrate deploy` sea idempotente y con timeout razonable.
  - Alertar y abortar arranque de la app si la migración falla.

- Versionado y trazabilidad
  - Versionar la API (e.g., `/api/v1`) y el documento OpenAPI.
  - Incluir hash/versión en logs al arranque para rastrear despliegues.

- Datos y privacidad
  - Evitar PII en logs; enmascarar o truncar campos sensibles.
  - Revisar retención de datos y cumplimiento (GDPR/LOPD si aplica).

