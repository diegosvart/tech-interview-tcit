# Frontend – React + Redux Toolkit + Vite

Esta guía describe la implementación real del frontend en `client/`: estructura, dependencias, configuración de proxy y comandos comunes.

## Stack y justificación
- React + TypeScript: DX sólida y tipado fuerte.
- Redux Toolkit + RTK Query: estado global y data fetching con caché y revalidación.
- Vite: arranque rápido, HMR y build eficiente.

## Estructura actual
```
client/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  public/
    favicon.ico
  src/
    main.tsx
    App.tsx
    store.ts
    features/
      posts/
        PostsList.tsx
        NewPost.tsx
        posts.api.ts
        index.ts
```

## Conexión al backend
- En desarrollo, Vite hace proxy de `/api` a `http://localhost:3000` (ver `client/vite.config.ts`).
- Las llamadas desde el cliente usan rutas relativas (`/api/v1/...`), evitando problemas de CORS.

## Dependencias clave
- runtime: `react`, `react-dom`, `react-router-dom`, `@reduxjs/toolkit`, `react-redux`.
- dev: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/*`.

## Comandos
- Desarrollo (dev server con HMR):
  - `npm --prefix client run dev`
- Build de producción:
  - `npm --prefix client run build`
- Previsualización del build (QA local):
  - `npm --prefix client run preview`

## RTK Query base
- Archivo `src/features/posts/posts.api.ts` define `listPosts`, `getPost`, `createPost` contra `/api/v1/posts`.
- `src/store.ts` registra el reducer y middleware de RTK Query.
- `App.tsx` incluye rutas básicas: lista y creación.

## Próximos pasos (UI)
- Añadir listado paginado y detalle usando endpoints GET (cuando estén disponibles en el backend).
- Manejo de errores y toasts.
- Estilos (Tailwind o CSS Modules) si lo ves necesario.

## Notas
- Si cambias el puerto del backend, actualiza `vite.config.ts` (proxy target).
- Para variables en cliente, usa el prefijo `VITE_` y `.env`/`.env.local`.

## Documentos relacionados
- `docs/client.md`: Quickstart del cliente (comandos comunes y troubleshooting).
- `docs/frontend-best-practices.md`: Buenas prácticas con React en este proyecto.
