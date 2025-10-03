# ADR 0001: Frontend Bundler – Vite

Fecha: 2025-10-02

## Contexto
El frontend se implementará en React + TypeScript. Se requiere un bundler para dev server con HMR, build de producción y DX eficiente.

## Decisión
Adoptar Vite como bundler para el cliente.

## Motivación
- Arranque y HMR muy rápidos (esbuild).
- Configuración mínima; foco en el dominio del test técnico.
- Build robusto (Rollup) con code splitting y tree-shaking.
- Comunidad activa y soporte sólido para React + TS.

## Alternativas consideradas
- Webpack/CRA: más configuración, DX más lenta.
- Parcel: simple pero menos estándar en equipos.
- Next.js: agrega SSR/SSG no requerido.

## Consecuencias
- Variables expuestas deben iniciar con `VITE_`.
- Scripts de `client`: `dev`, `build`, `preview` provistos por Vite.
- Migración a otro bundler es posible sin tocar capas de dominio/servicios.
