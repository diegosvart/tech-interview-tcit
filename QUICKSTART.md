# Quick Start

Guía rápida para levantar el entorno local (Windows / PowerShell) del proyecto full‑stack.

## Requisitos
- Node.js 20.x
- Docker + Docker Compose
- PowerShell 5+ (o pwsh)

## 1. Clonar repositorio
```powershell
git clone https://github.com/diegosvart/tech-interview-tcit.git
cd tech-interview-tcit
```

## 2. Variables de entorno (opcional)
El proyecto usa valores por defecto razonables. Si necesitas personalizar:
- Crear `.env` en `server/` (ejemplo):
```
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/techtest
NODE_ENV=development
```

## 3. Levantar Postgres
```powershell
docker compose up -d
```
Verifica contenedor:
```powershell
docker ps --filter "name=postgres"
```

## 4. Instalar dependencias (monorepo)
```powershell
npm install --prefix server
npm install --prefix client
```

## 5. Prisma: generar cliente y migrar + seed
```powershell
npm run prisma:generate --prefix server || echo "(ignorar aviso prisma generate en OneDrive)"
npm run prisma:migrate --prefix server
npm run prisma:seed --prefix server
```
Esto crea la tabla `Post` y genera 50 registros de ejemplo.

## 6. Ejecutar backend en modo dev
```powershell
npm run dev --prefix server
```
Cuando veas:
```
HTTP server listening on http://localhost:3000
```
Prueba health:
```powershell
(Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:3000/api/v1/health").Content
```

## 7. Ejecutar frontend
En nueva terminal:
```powershell
npm run dev --prefix client
```
Abrir (por defecto) http://localhost:5173

## 8. Scripts útiles
Backend:
```powershell
npm test --prefix server          # Tests backend
npm run lint --prefix server      # Lint backend
npm run sanity:health --prefix server
npm run sanity:crud --prefix server
```
Frontend:
```powershell
npm test --prefix client          # Tests frontend
npm run lint --prefix client      # Lint frontend
```

## 9. Lint & Quality Gates
CI ejecuta primero `lint` (server y client) y luego tests. Fallos de lint detienen la pipeline.

## 10. Detener entorno
```powershell
# Ctrl+C en procesos dev
docker compose down
```

## 11. Estructura rápida
```
server/  -> API Express + Prisma + Zod + Vitest
client/  -> React + Redux Toolkit + RTK Query + Vite + Vitest
```

## 12. Generación OpenAPI
El JSON de contrato se sirve ya compilado. Ajustes futuros: script sync Zod -> OpenAPI.

## Problemas comunes
| Problema | Causa | Solución |
|----------|-------|----------|
| EPERM al `prisma generate` | OneDrive locking | Reintentar / ignorar si ya migraste y seed OK |
| Ports en uso | Otro proceso ocupando 3000/5173 | Cambiar PORT en `.env` o cerrar proceso |

Listo: ya puedes iterar sobre backend y frontend.
