# Backend – Node.js + Express + Prisma (TS)

Este documento describe la arquitectura y guía de implementación del backend.

## Objetivos
- API REST `/api/v1` para CRUD de posts (name, description).
- Clean architecture en capas: controllers, services, repositories, domain.
- Validación con Zod, manejo de errores consistente, logs básicos.

## Estructura propuesta
```
server/
  src/
    domain/
      entities/
      dtos/
    application/
      services/
    infrastructure/
      prisma/
        schema.prisma
      repositories/
    interfaces/
      http/
        controllers/
        routes/
        middlewares/
    config/
    main.ts
  prisma/                # migrations
  package.json
```

## Variables de entorno
```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/techtest
```

## Librerías (cuando se implemente)
- express, cors, helmet, zod, pino (logging)
- prisma, @prisma/client
- typescript, ts-node-dev o nodemon, tsconfig-paths

## Rutas (contrato)
- GET `/api/v1/posts`
- GET `/api/v1/posts/:id`
- POST `/api/v1/posts`
- PUT `/api/v1/posts/:id`
- DELETE `/api/v1/posts/:id`

Ver detalles en `docs/api.md`.

## Validación y DTOs
- Zod para request/response.
- DTOs ubicados en `src/domain/dtos`.
- Validar en middleware antes de llegar al controller.

## Repositorios y Prisma
- `schema.prisma` con modelo `Post` (id UUID por escalabilidad, name, description, createdAt, updatedAt).
- Repositorio `PostRepository` con métodos CRUD; no incluir reglas de negocio.
- Servicios consumen repositorios; controladores consumen servicios.

## Manejo de errores
- Middleware `errorHandler` con estructura `{ code, message, details?, traceId? }`.
- Mapear errores de validación (400), no encontrado (404) y genéricos (500).

## Seguridad
- CORS restrictivo por entorno.
- Helmet para headers seguros.
- Limitar payloads si aplica.

## Flujo de desarrollo
1) Definir `schema.prisma` y correr migraciones.
2) Implementar repositorio y servicio de `Post`.
3) Crear controladores y rutas.
4) Configurar middlewares (cors, helmet, json, errorHandler).
5) Probar endpoints con datos de ejemplo.

## Decisiones clave
- IDs: UUID (idealmente v7/ULID) para no exponer conteos y permitir generación distribuida.
- Paginación: offset (`page`, `pageSize`) por simplicidad. Futuro: cursor con `createdAt, id`.

## Notas
- Mantener funciones pequeñas y una responsabilidad por método.
- No mezclar lógica de negocio con acceso a datos.
- Loguear errores con contexto mínimo (no datos sensibles).
