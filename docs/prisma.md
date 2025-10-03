# Prisma – Guía de uso en este proyecto

Esta guía resume cómo está integrado Prisma en el backend, qué archivos existen, qué contienen y los comandos para trabajar con el esquema, migraciones y el seed en desarrollo.

## Visión general
- ORM: Prisma (PostgreSQL)
- Entorno: Desarrollo local con Postgres en Docker (ver `docs/docker.md`).
- Flujo principal: Definir modelo → generar cliente → crear migración → ejecutar seed → usar desde el código.

## Archivos y carpetas relevantes

- `server/.env` (no versionado)
  - Contiene credenciales de DB. Ejemplo:
    ```env
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/techtest
    ```
  - Si cambias el puerto local (ej. 5433), actualiza este valor.

- `server/prisma/schema.prisma`
  - Esquema Prisma (modelo de datos y datasource). En este proyecto:
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }

    model Post {
      id          String   @id @default(uuid())
      name        String
      description String?
      createdAt   DateTime @default(now())
      updatedAt   DateTime @updatedAt
    }
    ```
  - Nota: la entidad `Post` usa los atributos `name` y `description` (alineado con el código actual del repositorio).

- `server/prisma/migrations/`
  - Carpeta con migraciones versionadas (SQL + metadatos) generadas por `prisma migrate dev`.
  - Se debe commitear (forma parte del código fuente).

- `server/prisma/seed.ts`
  - Script de seed para desarrollo (inserta datos de ejemplo). Actualmente:
    - Limpia la tabla `Post` (`deleteMany`) y luego hace `createMany` con 5 registros.
  - Se ejecuta vía `npm --prefix server run prisma:seed`.

- `server/package.json` (scripts Prisma)
  - Scripts útiles ya configurados:
    ```json
    {
      "scripts": {
        "prisma:generate": "prisma generate",
        "prisma:migrate": "prisma migrate dev",
        "prisma:studio": "prisma studio",
        "prisma:seed": "prisma db seed"
      },
      "prisma": { "seed": "tsx prisma/seed.ts" }
    }
    ```

## Comandos (PowerShell)
Ejecuta los comandos desde la raíz del repo usando `--prefix server` para apuntar al paquete del backend.

- Generar el cliente de Prisma (obligatorio tras cambiar el schema):
  ```powershell
  npm --prefix server run prisma:generate
  ```

- Crear/actualizar migración en desarrollo (tras editar `schema.prisma`):
  ```powershell
  npm --prefix server run prisma:migrate
  # te pedirá un nombre; también puedes pasar -n "mi_migracion"
  ```

- Abrir Prisma Studio (UI para inspeccionar datos):
  ```powershell
  npm --prefix server run prisma:studio
  ```

- Ejecutar el seed (puebla datos de ejemplo):
  ```powershell
  npm --prefix server run prisma:seed
  ```

- (Opcional) Reset de la base de datos en desarrollo (¡destruye datos!):
  ```powershell
  npx --yes --prefix server prisma migrate reset
  ```

## Workflows comunes

1) Primera vez (DB limpia):
   ```powershell
   # Levantar Postgres
   docker compose up -d

   # Asegurar esquema → migración → cliente generado
   npm --prefix server run prisma:migrate
   npm --prefix server run prisma:generate

   # Poblar datos
   npm --prefix server run prisma:seed
   ```

2) Cambié el modelo (`schema.prisma`):
   ```powershell
   # Crear nueva migración y aplicar
   npm --prefix server run prisma:migrate

   # Regenerar cliente por si cambian tipos/queries
   npm --prefix server run prisma:generate
   ```

3) Explorar/editar datos rápidamente:
   ```powershell
   npm --prefix server run prisma:studio
   ```

## Recomendaciones
- Desarrollo: usa `prisma migrate dev` y `prisma db seed`.
- Producción: aplicar migraciones con `prisma migrate deploy` (no uses `dev` en prod).
- Variables sensibles en `.env` (no commitear). Ajusta `DATABASE_URL` si cambias puertos.
- Tras editar el esquema: vuelve a generar el cliente (`prisma:generate`).

## Solución de problemas
- Error de conexión (P1000/P1001):
  - Verifica que Postgres esté corriendo:
    ```powershell
    docker compose ps
    Test-NetConnection localhost -Port 5432
    ```
  - Revisa `DATABASE_URL` en `server/.env`.

- TypeScript no ve tipos del cliente:
  - Ejecuta `npm --prefix server run prisma:generate`.

- Migración no se aplica:
  - Revisa que el contenedor de Postgres esté arriba y que el usuario/DB existen.
  - Mira logs del servicio:
    ```powershell
    docker compose logs -f postgres
    ```
---