# OpenAPI/Swagger – Guía

## Objetivos
- Documentar y explorar la API (`/api/v1`).
- Facilitar pruebas manuales y contrato con frontend.

## Opciones
- `swagger-ui-express` + JSON OpenAPI generado manualmente.
- Generación a partir de Zod (zod-to-openapi) si se desea DRY.

## Buenas prácticas
- Definir componentes `schemas` para DTOs Post.
- Respuestas tipadas por status (200/201/204/400/404/500).
- Versionar en `/api/v1/docs`.

## Estructura mínima del spec
- Paths: `/posts`, `/posts/{id}`
- Schemas: `Post`, `CreatePost`, `UpdatePost`, `ErrorResponse`.

> Se agregará el spec cuando se implemente el backend.

Plantilla: `docs/templates/openapi-template.json`

## Mantener OpenAPI y Zod alineados

Hay dos enfoques. Elige uno y sé coherente.

### 1) Zod como fuente de verdad
- Define los esquemas con Zod (`server/src/domain/dtos`).
- Genera el OpenAPI a partir de Zod para servirlo en Swagger UI.
- Herramientas:
	- `@asteasolutions/zod-to-openapi` (Zod → OpenAPI 3)
	- `swagger-ui-express` (UI)
- Buenas prácticas:
	- Usa `.describe()` en Zod para enriquecer el esquema.
	- Representa `optional()` vs `nullable()` correctamente en el contrato.
	- Automatiza la generación en un script y súbelo a CI.

### 2) OpenAPI como fuente de verdad
- Mantén `docs/openapi.json` como contrato canónico.
- Genera Zod desde OpenAPI para reutilizar validaciones en runtime.
- Herramientas:
	- `openapi-typescript-zod` o `openapi-zod-client`
	- `openapi-typescript` si solo quieres tipos TS del contrato
- Buenas prácticas:
	- Añade un step en CI que regenere Zod y compare (diff) para detectar divergencias.
	- Sincroniza restricciones: `format: uuid`, `minimum`, `maximum`, `required`.

### Reglas de sincronización
- Tests de validación 400 (ver `server/tests/posts.validation.test.ts`) para asegurar que las reglas del contrato están en la API.
- Si cambias validaciones (p. ej., `pageSize` máx.), actualiza ambas representaciones en el mismo commit.
- Evita duplicar definiciones: una sola fuente y generación de la otra.
