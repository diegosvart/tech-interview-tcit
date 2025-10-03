# Base de Datos – PostgreSQL + Prisma

## Modelo

Entidad `Post`:
- `id`: UUID (PK) – elegido por escalabilidad (generación distribuida, no expone conteo). Preferir UUIDv7/ULID si aplica.
- `name`: string (1..120)
- `description`: string (1..1000)
- `createdAt`: timestamp (default now)
- `updatedAt`: timestamp (auto update)

Índices:
- `idx_posts_created_at` sobre `createdAt`

## Migraciones
- Gestionadas con Prisma Migrate.
- Directorio `server/prisma/migrations`.

## Paginación
- En esta fase, la API utilizará paginación por offset (`page`, `pageSize`), por simplicidad y rapidez de implementación.
- Nota futura: para feeds grandes o alta concurrencia, migrar a cursor basado en `createdAt, id`.

## Cadena de conexión
`DATABASE_URL=postgresql://postgres:postgres@localhost:5432/techtest`

## Docker Compose (local)
Servicio `postgres` (y opcional `pgadmin`).

