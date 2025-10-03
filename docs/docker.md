# Dockerización – Desarrollo Local

Esta guía está enfocada únicamente en desarrollo local. La aplicación (frontend y backend) se ejecuta en tu máquina, y solo la base de datos PostgreSQL corre en Docker.

## Objetivos
- Usar Docker solo para Postgres (persistencia y aislamiento).
- Evitar Nginx y contenedores de app en esta etapa.
- Facilitar variables de entorno y puertos estándar.

## Variables de entorno sugeridas
```
# Backend
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/techtest

# Frontend (Vite)
CLIENT_PORT=5173
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

## docker-compose.yml (solo Postgres)

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: techtest
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Plantillas:
- `docs/templates/docker-compose-dev-template.yml`
- `.env` de server: `docs/templates/env-server-example`
- `.env.local` de client: `docs/templates/env-client-example`

## Flujo en Windows PowerShell
1) Crear el archivo `.env` en `server/` con las variables de Backend de arriba y `.env.local` en `client/` con las de Frontend.
2) Levantar Postgres:
   ```powershell
   docker compose up -d
   ```
3) Verificar que Postgres está arriba:
   ```powershell
   docker ps
   ```
4) (Luego de implementar) correr migraciones Prisma y levantar apps:
   ```powershell
   # Backend
   # npm run prisma:migrate; npm run dev

   # Frontend
   # npm run dev
   ```

## Tips
- Configurar el proxy de Vite hacia el backend para evitar CORS durante el desarrollo. En `vite.config.ts`:
  ```ts
  server: { proxy: { '/api': 'http://localhost:4000' } }
  ```
- Usa nombres de base de datos/usuarios seguros si compartís entorno.
- Para inspección: herramientas como `pgAdmin` o `DBeaver` apuntando a `localhost:5432`.

## Más adelante (opcional)
- Si necesitás una demo reproducible en un solo comando, podemos añadir contenedores para `server` y `client` y opcionalmente Nginx. Por ahora, mantenemos el flujo simple y enfocado en desarrollo.
