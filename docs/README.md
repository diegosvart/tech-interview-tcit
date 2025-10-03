# Índice de documentación

Navegación centralizada de la documentación del proyecto. Usa esta página como punto de entrada.

## Introducción y guía rápida
- Visión general del proyecto: ver `../README.MD`
- Quickstart del cliente (frontend): `client.md`
- Docker y ejecución local: `docker.md`

## Backend
- Arquitectura y guía: `backend.md`
- API REST (resumen): `api.md`
- OpenAPI/Swagger (contrato): `openapi.md`
- Validación con Zod: `zod.md`
- Observabilidad (logging y errores): `observability.md`
  - pino-http (guía específica): `pino-http.md`
- Base de datos y Prisma
  - Modelo y migraciones: `db.md`
  - Guía de Prisma: `prisma.md`

## Frontend
- Estructura e implementación: `frontend.md`
- Buenas prácticas con React: `frontend-best-practices.md`
- Quickstart del cliente: `client.md`

## Calidad y pruebas
- Estrategia de pruebas: `testing.md`
- Calidad de código: `quality.md`
- Checklist de revisión: `review.md`

## DevOps / CI/CD
- CI/CD y lineamientos: `ci.md`
- Plantillas útiles (IaC/CI/linters/otros): `templates/`
  - `templates/ci-github-actions.yml`
  - `templates/docker-compose-dev-template.yml`
  - `templates/editorconfig-template.ini`
  - `templates/eslint-template.json`
  - `templates/prettier-template.json`
  - `templates/tsconfig-base-template.json`
  - `templates/vite-config-proxy-snippet.ts`

## Convenciones y flujo de trabajo
- Convenciones de código y estilo: `conventions.md`
- Flujo Git y políticas: `git.md`

## ADRs (Architecture Decision Records)
- Directorio ADR: `adr/`
  - `adr/0001-frontend-bundler-vite.md`
  - `adr/0002-ids-uuid-vs-autoincrement.md`
  - `adr/0003-pagination-offset-vs-cursor.md`

## Otros
- Assessment: `assessment.md`
- Contrato OpenAPI (archivo JSON): `openapi.json`

---

Sugerencias:
- Mantén estos documentos actualizados cuando cambien decisiones o arquitectura.
- Añade nuevos documentos aquí bajo la categoría correspondiente para conservar la estructura.