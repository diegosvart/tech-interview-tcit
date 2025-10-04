# Dockerización – Desarrollo Local

Esta guía cubre tres modos de trabajo:

1. Modo ligero (solo Postgres en Docker) – original y aún válido.
2. Modo multi-servicio (Postgres + Backend + Frontend todos en contenedores con hot reload) para levantar el stack completo con un solo comando.
3. Perfil de pruebas (servicio `postgres-test`) para ejecutar la suite de integración backend de forma aislada y reproducible (local y CI).

## Objetivos
Modo ligero:
 - Usar Docker solo para Postgres (persistencia y aislamiento).
 - Minimizar complejidad mientras se desarrolla la aplicación directamente sobre Node/Vite locales.

Modo multi-servicio:
 - Levantar Postgres + API + Frontend en un único `docker compose up`.
 - Hot reload (montaje de volúmenes) para iterar código sin rebuild completo.
 - Migraciones y seed automáticos en el arranque del backend.
 - Evitar optimizaciones de producción (multi-stage, Nginx, pruning) en esta fase.

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

## docker-compose-dev.yml (multi-servicio + profiles)

Archivo: `docker-compose-dev.yml`

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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d techtest"]
      interval: 5s
      timeout: 5s
      retries: 10

  server:
    build:
      context: .
      dockerfile: server/Dockerfile.dev
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/techtest
      PORT: 3000
      NODE_ENV: development
      # Variables opcionales de robustez (valores por defecto si no se definen):
      # DB_WAIT_TIMEOUT_SECONDS: 60
      # DB_WAIT_INTERVAL_SECONDS: 2
      # MIGRATE_MAX_RETRIES: 5
      # MIGRATE_RETRY_SLEEP_SECONDS: 3
      # SEED_MAX_RETRIES: 3
      # SEED_RETRY_SLEEP_SECONDS: 2
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "3000:3000"
    volumes:
      - ./server:/app
      - /app/node_modules
    entrypoint: ["sh","/app/docker-entrypoint.dev.sh"]
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O - http://localhost:3000/api/v1/health || exit 1"]
      interval: 5s
      timeout: 5s
      retries: 12
      start_period: 10s

  client:
    build:
      context: .
      dockerfile: client/Dockerfile.dev
    environment:
      VITE_API_BASE: http://localhost:3000
      NODE_ENV: development
      # Espera robusta de API antes de iniciar Vite (opcional):
      # WAIT_FOR_API_URL: http://server:3000/api/v1/health
      # WAIT_FOR_API_TIMEOUT_SECONDS: 60
      # WAIT_FOR_API_INTERVAL_SECONDS: 2
    depends_on:
      server:
        condition: service_healthy
    ports:
      - "5173:5173"
    volumes:
      - ./client:/app
      - /app/node_modules
    entrypoint: ["sh","/app/docker-entrypoint.dev.sh"]
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O - http://localhost:5173/ | grep -qi '<!doctype' || exit 1"]
      interval: 5s
      timeout: 5s
      retries: 20
      start_period: 15s

  studio:
    profiles: ["studio"]
  postgres-test:
    profiles: ["test"]
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tech_test_tcit_test
    ports:
      - "5544:5432"
    tmpfs:
      - /var/lib/postgresql/data:rw
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d tech_test_tcit_test"]
      interval: 3s
      timeout: 5s
      retries: 20
    # Uso: sólo durante tests de integración. tmpfs => I/O muy rápido y datos efímeros.
    build:
      context: .
      dockerfile: server/Dockerfile.dev
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/techtest
      NODE_ENV: development
    depends_on:
      postgres:
        condition: service_healthy
    command: ["npx","prisma","studio","--port","5555","--browser","none","--hostname","0.0.0.0"]
    ports:
      - "5555:5555"
    volumes:
      - ./server:/app
      - /app/node_modules
    # Servicio auxiliar: interfaz visual de datos. No forma parte del arranque base.

volumes:
  pgdata:
```

Características:
 - `healthcheck` en Postgres asegura que el backend migre cuando la DB está lista.
 - `healthcheck` en server valida el endpoint `/api/v1/health` (estado real de la API).
 - `healthcheck` en client verifica que la raíz HTML se sirva correctamente.
 - Script de entrada backend robustecido (`server/docker-entrypoint.dev.sh`): espera conectividad real de DB, reintenta migraciones y seed con backoff antes de lanzar `npm run dev`.
 - Script de entrada frontend (`client/docker-entrypoint.dev.sh`): espera la API (health) antes de iniciar Vite para reducir errores de carga inicial.
 - Volúmenes montan el código host para recarga en caliente (tsx watch y Vite).
 - `node_modules` se aísla dentro del contenedor para evitar incompatibilidades locales.
 - Servicio opcional `studio` (perfil `studio`) para lanzar Prisma Studio bajo demanda.
- Servicio opcional `postgres-test` (perfil `test`) pensado para: ejecutar `npm test` sin tocar la base de datos de desarrollo y con arranque / teardown ultra rápido.

### Robustez de arranque

Riesgos mitigados:
| Riesgo original | Mitigación actual |
|-----------------|-------------------|
| Migraciones no aplicadas (DB no lista) | Espera activa TCP + reintentos `prisma migrate dev` |
| Semilla parcial por fallo transitorio | Reintentos configurables de seed (`SEED_MAX_RETRIES`) |
| Cliente arranca sin API lista | Espera health API (`WAIT_FOR_API_URL`) antes de Vite |

Variables del backend (puedes sobreescribir en `environment:`):
```
DB_WAIT_TIMEOUT_SECONDS=60
DB_WAIT_INTERVAL_SECONDS=2
MIGRATE_MAX_RETRIES=5
MIGRATE_RETRY_SLEEP_SECONDS=3
SEED_MAX_RETRIES=3
SEED_RETRY_SLEEP_SECONDS=2
SKIP_SEED=0            # Si =1 salta la semilla
```

Variables del frontend:
```
WAIT_FOR_API_URL=http://server:3000/api/v1/health
WAIT_FOR_API_TIMEOUT_SECONDS=60
WAIT_FOR_API_INTERVAL_SECONDS=2
SKIP_WAIT_FOR_API=0    # Si =1 arranca Vite sin esperar API
```
Advertencia: para variables consumidas por el navegador (como `VITE_API_URL`), usar rutas relativas (`/api/v1`) y dejar que el proxy de Vite resuelva el hostname interno. Si se coloca `http://server:3000/...` el navegador externo no puede resolver `server` y fallará con `ERR_NAME_NOT_RESOLVED`.

Ejemplo modificando timeouts localmente (solo este arranque):
```powershell
DB_WAIT_TIMEOUT_SECONDS=120 MIGRATE_MAX_RETRIES=10 docker compose -f docker-compose-dev.yml up -d --build
```

Revisión rápida de logs tras un restart para confirmar migraciones:
```powershell
docker compose -f docker-compose-dev.yml logs --tail=50 server | Select-String "Migrations applied successfully"
```

### Prisma Studio (opcional)

Se expone como servicio separado para no sobrecargar el stack base.

Levantar junto al stack principal (incluye profile `studio`):
```powershell
docker compose -f docker-compose-dev.yml --profile studio up -d
```
Abrir: `http://localhost:5555`

Levantar Studio después (stack ya corriendo):
```powershell
docker compose -f docker-compose-dev.yml --profile studio up -d studio
```

Detener solo Studio:
```powershell
docker compose -f docker-compose-dev.yml stop studio
```

Eliminar Studio:
```powershell
docker compose -f docker-compose-dev.yml rm -f studio
```

Motivos para perfil opcional:
| Razón | Beneficio |
|-------|-----------|
| Seguridad local | No exponer datos si no lo necesitas |
| Menos ruido de puertos | Sólo cuando inspeccionas datos |
| Aislamiento de fallos | Problemas de Studio no afectan API/Frontend |

Si necesitas refrescar credenciales o esquema, basta con reiniciar el servicio Studio:
```powershell
docker compose -f docker-compose-dev.yml restart studio
```

Nota: Si no carga el navegador:
1. Verifica que el puerto 5555 no esté ocupado: `netstat -ano | findstr 5555`
2. Asegura que lo levantaste con perfil: `docker compose ps | Select-String studio`
3. Revisa logs: `docker compose -f docker-compose-dev.yml logs --tail=80 studio`
4. Reinicia Studio: `docker compose -f docker-compose-dev.yml restart studio`


### Perfil de pruebas (postgres-test)

Razonamiento:
- Evitar contaminar datos de desarrollo.
- Aislar flujos CI y locales.
- Minimizar tiempo de preparación (DB en memoria RAM vía `tmpfs`).

Levantar solo la DB de test:
```powershell
docker compose -f docker-compose-dev.yml --profile test up -d postgres-test
```

Ejecutar tests backend desde la raíz (aplica migraciones a la DB de test automáticamente por `pretest:integration`):
```powershell
npm test
```

Apagar sólo la DB de test:
```powershell
docker compose -f docker-compose-dev.yml --profile test stop postgres-test
```

Eliminar contenedor (reinicio limpio):
```powershell
docker compose -f docker-compose-dev.yml --profile test rm -f postgres-test
```

Flujo rápido (levantar, test, bajar):
```powershell
docker compose -f docker-compose-dev.yml --profile test up -d postgres-test; npm test; docker compose -f docker-compose-dev.yml --profile test stop postgres-test
```

Si cambias el esquema Prisma y necesitas regenerar cliente + migrar antes de correr tests:
```powershell
docker compose -f docker-compose-dev.yml --profile test up -d postgres-test
npm --prefix server run pretest:integration
npm test
```

### Integración en CI (resumen)
En GitHub Actions se puede usar un service container Postgres o reutilizar este compose. Recomendado para velocidad: service container oficial + variables `DATABASE_URL` apuntando a ese host. La lógica local (`pretest:integration`) seguirá aplicando migraciones.

Pseudoflujo CI:
1. Checkout
2. Instalar dependencias raíz (cache npm)
3. Levantar Postgres (service) en puerto 5544
4. `npm test`
5. `npm run lint:all` / `npm run build:all`
6. Publicar reportes (coverage / summary)

El badge de estado reflejará la ejecución del workflow anterior.

### Troubleshooting perfil test
| Síntoma | Posible causa | Acción |
|--------|---------------|--------|
| `ECONNREFUSED` a la DB | DB aún no healthy | Esperar unos segundos o inspeccionar `docker compose ps` |
| Tests intermitentes 404 tras POST | (Histórico) truncado global agresivo | Ya mitigado: mantener truncado por suite únicamente |
| Migraciones no aplicadas | Olvidaste levantar `postgres-test` | Levantar profile test antes de `npm test` |
| Lentitud inesperada | Sin `tmpfs` (cambios locales) | Verificar sección `postgres-test` en compose |

### Uso rápido (multi-servicio)

PowerShell:
```powershell
docker compose -f docker-compose-dev.yml up -d --build
docker compose -f docker-compose-dev.yml logs -f server
```

Abrir:
 - API: http://localhost:3000/ (health /api docs según implementación)
 - Frontend: http://localhost:5173/

Apagar:
```powershell
docker compose -f docker-compose-dev.yml down
```

Limpiar volúmenes (reset DB):
```powershell
docker compose -f docker-compose-dev.yml down -v
```

### Variables clave (multi-servicio)
```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/techtest
PORT=3000
VITE_API_URL=http://server:3000/api/v1
```

### Logs y debugging
```powershell
docker compose -f docker-compose-dev.yml logs -f postgres
docker compose -f docker-compose-dev.yml logs -f server
docker compose -f docker-compose-dev.yml logs -f client
```

### Reinicio y desmontaje (multi-servicio)

Reiniciar solo un servicio (recarga rápida de código si hay problemas de watcher):
```powershell
docker compose -f docker-compose-dev.yml restart server
docker compose -f docker-compose-dev.yml restart client
```

Reiniciar todos los servicios respetando dependencias:
```powershell
docker compose -f docker-compose-dev.yml restart
```

Parar (mantiene volúmenes y redes):
```powershell
docker compose -f docker-compose-dev.yml stop
```

Desmontar (elimina contenedores, mantiene volúmenes):
```powershell
docker compose -f docker-compose-dev.yml down
```

Desmontar y eliminar volúmenes (reset total de la base de datos):
```powershell
docker compose -f docker-compose-dev.yml down -v
```

Reconstruir forzando build (útil tras cambiar Dockerfile):
```powershell
docker compose -f docker-compose-dev.yml up -d --build
```

Ver estado resumido de health y puertos:
```powershell
docker compose -f docker-compose-dev.yml ps
```

### Cambios de esquema
Al modificar `prisma/schema.prisma`, el contenedor `server` regenerará cliente si reinicias:
```powershell
docker compose -f docker-compose-dev.yml restart server
```
O ejecutar manualmente dentro del contenedor:
```powershell
docker compose -f docker-compose-dev.yml exec server npx prisma migrate dev
```

---

## docker-compose.yml (modo ligero: solo Postgres)

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

## Flujo en Windows PowerShell (modo ligero)
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

## Tips (aplica a ambos modos)
- Configurar el proxy de Vite hacia el backend para evitar CORS durante el desarrollo. En `vite.config.ts`:
  ```ts
  server: { proxy: { '/api': 'http://localhost:4000' } }
  ```
- Usa nombres de base de datos/usuarios seguros si compartís entorno.
- Para inspección: herramientas como `pgAdmin` o `DBeaver` apuntando a `localhost:5432`.

## Más adelante (producción / optimizaciones)
- Multi-stage builds para reducir tamaño de imagen.
- Servir frontend estático detrás de un reverse proxy (Nginx / Caddy / CDN).
- Variables externas via secrets / env files versionados de forma segura.
- Healthchecks adicionales (liveness/readiness) y logs centralizados.
- Red interna separada para aislar DB de exposición pública.

## Referencias rápidas
- Dockerfiles dev: `server/Dockerfile.dev`, `client/Dockerfile.dev`.
- Entrypoint backend: `server/docker-entrypoint.dev.sh`.
- Ignorados build: `.dockerignore`.
- Compose multi-servicio: `docker-compose-dev.yml`.
- Guía de Base de Datos / Prisma: `docs/db.md`.

