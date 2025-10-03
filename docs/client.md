# Client quickstart

Resumen operativo para trabajar con el frontend en `client/`.

## Prerrequisitos
- Backend corriendo en `http://localhost:3000`.
- Node 18+.

## Comandos útiles (PowerShell)
- Arrancar sólo el frontend (HMR):
  - `npm --prefix client run dev`
- Arrancar ambos (front+back) en paralelo desde el root:
  - `npm run dev`
- Build y preview del frontend:
  - `npm --prefix client run build`
  - `npm --prefix client run preview`

## Proxy de API
- Configurado en `client/vite.config.ts` para redirigir `/api` → `http://localhost:3000` en dev.
- En el código, usa rutas relativas como `/api/v1/posts`.

## Estructura mínima
- `src/features/posts/*` contiene lista y creación de posts usando RTK Query.
- `src/store.ts` configura Redux Toolkit y RTK Query.

## Problemas frecuentes
- CORS en dev: evita CORS usando el proxy (ya activo). Si cambias puertos, actualiza `vite.config.ts`.
- Tipos JSX faltantes: asegúrate de tener `@types/react` y `@types/react-dom` instalados (ya en package.json).
- API 404/500: revisa Swagger en `http://localhost:3000/api/docs` y la consola del backend (pino-http).
