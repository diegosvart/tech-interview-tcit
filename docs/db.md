# Base de Datos – PostgreSQL + Prisma

Esta guía cubre: arquitectura, cómo levantar la base, reiniciarla, cargar datos, conectarse (local y remoto/túnel), buenas prácticas y troubleshooting.

---
## 1. Modelo actual

Entidad `Post`:
- `id`: UUID (PK) – generación desacoplada, evita inferir cardinalidad. (Futuro: considerar UUIDv7/ULID para ordenabilidad temporal)
- `name`: string (1..120)
- `description`: string (1..1000)
- `createdAt`: timestamp (default now)
- `updatedAt`: timestamp (auto update)

Índices:
- `idx_posts_created_at` sobre `createdAt`

Archivo de esquema: `server/prisma/schema.prisma`

---
## 2. Migraciones
- Herramienta: Prisma Migrate
- Directorio: `server/prisma/migrations`
- Comando desarrollo: `npx prisma migrate dev`
- Reset completo (reaplicar desde cero): `npx prisma migrate reset`

Buenas prácticas:
| Situación | Acción |
|-----------|-------|
| Nuevo campo nullable | Crear migración directa |
| Cambiar tipo datos | Evaluar migración manual + script datafix |
| Drop de columna | Asegurar no usada en código → migración → limpiar referencias |
| Índice nuevo | Justificar con query frecuente / EXPLAIN |

---
## 3. Paginación
Actualmente offset (`page`, `pageSize`). Futuro recomendado para escalabilidad: cursor (`createdAt, id`).

Comparativa breve:
| Estrategia | Ventaja | Limitación |
|-----------|---------|------------|
| Offset | Simple | Costoso en páginas altas |
| Cursor | Escalable, estable | Más lógica cliente |

---
## 4. Cadena de conexión
Formato general:
```
postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?schema=public
```
Actual dev local (multi-servicio dentro de contenedor backend):
```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/techtest
```
Desde host (modo ligero o puerto publicado):
```
postgresql://postgres:postgres@localhost:5432/techtest
```

Variables relevantes backend:
| Variable | Uso |
|----------|-----|
| DATABASE_URL | Conexión Prisma |
| DB_WAIT_TIMEOUT_SECONDS | Timeout espera conectividad (entrypoint) |
| MIGRATE_MAX_RETRIES | Reintentos migraciones |
| SEED_MAX_RETRIES | Reintentos seed |

---
## 5. Levantar la base de datos

### Opción A: Solo Postgres (modo ligero)
```powershell
docker compose up -d
```
### Opción B: Stack completo (multi-servicio)
```powershell
docker compose -f docker-compose-dev.yml up -d --build
```
Verificar:
```powershell
docker compose -f docker-compose-dev.yml ps postgres
```
Conexión rápida (psql local, si instalado):
```powershell
psql -h localhost -U postgres -d techtest -c "\dt"
```

---
## 6. Reinicio y Reset de datos

| Objetivo | Comando | Impacto |
|----------|---------|---------|
| Reiniciar contenedor | `docker compose -f docker-compose-dev.yml restart postgres` | No borra datos |
| Reset total (drop volumen) | `docker compose -f docker-compose-dev.yml down -v` → `up -d` | Datos eliminados, migraciones + seed se reejecutan |
| Reset lógico Prisma | `docker compose -f docker-compose-dev.yml exec server npx prisma migrate reset --force` | Elimina tablas, reaplica migraciones y seed |
| Reaplicar solo migraciones nuevas | `docker compose -f docker-compose-dev.yml exec server npx prisma migrate dev` | Aplica cambios pendientes |
| Solo seed nuevamente | `docker compose -f docker-compose-dev.yml exec server npm run prisma:seed` | Reintenta carga semilla |

Ver conteo de registros Post:
```powershell
docker compose -f docker-compose-dev.yml exec server npx prisma db execute --script "SELECT count(*) FROM \"Post\";"
```

---
## 7. Carga y seed de datos

Seed actual: `prisma/seed.ts` (invocado por entrypoint backend y `npm run prisma:seed`).

Requisitos para un seed sano:
| Criterio | Descripción |
|----------|-------------|
| Idempotencia | Evitar duplicados; usar `upsert` o chequear existencia |
| Trazabilidad | Log claro de cantidades creadas |
| Separación | Mantener seed de datos estructurales vs. demo/test |

Ejemplo (conceptual) de upsert en Prisma:
```ts
await prisma.post.upsert({
	where: { id: someId },
	update: { name: "Demo" },
	create: { id: someId, name: "Demo", description: "Seed" }
});
```

Datos de prueba adicionales: crear script dedicado (`scripts/seed-demo.ts`) si se requiere dataset grande para pruebas de UI o paginación.

---
## 8. Conexión remota / túnel

Escenario: quieres acceder a la DB del contenedor desde otra máquina o a través de un túnel.

### Exposición directa (solo dev, misma LAN)
El puerto ya está publicado `5432:5432`. Desde otra máquina de la red:
```
postgresql://postgres:postgres@<IP_HOST>:5432/techtest
```
Riesgos: contraseñas débiles, sin cifrado.

### SSH Tunnel (preferido si hay salto intermedio)
```bash
ssh -L 6543:localhost:5432 usuario@host-remoto
```
Cadena local resultante:
```
postgresql://postgres:postgres@localhost:6543/techtest
```

### No recomendado para dev
Proxy público / exponer en Internet sin firewall → evitar completamente.

Checklist mínima si se expone fuera de local:
- Usuario distinto a `postgres` con privilegios mínimos.
- Rotación de contraseña.
- SSL requerido (`?sslmode=require` si aplica). 
- Filtrado de IP / VPN.

---
## 9. Buenas prácticas

| Área | Práctica | Motivo |
|------|----------|--------|
| Nombres | DB y usuarios explícitos por proyecto | Evitar colisiones multi-proyecto |
| Migraciones | Pequeñas y atómicas | Fácil revert / debugging |
| Índices | Solo tras medir queries | Evitar inflación de writes |
| Seed | Idempotente y rápido | Evita inconsistencias tras reset |
| Variables | No hardcodear credenciales en código | Seguridad / portabilidad |
| Backups locales | Export puntual antes de pruebas destructivas | Recuperación rápida |
| Observabilidad futura | Exponer métricas pg_stat_statements | Optimización en escala |
| Revisión PR | Incluir diff de schema si cambia | Transparencia de modelo |

### Anti‑patrones
- Migraciones gigantes combinando muchos cambios (divide en pasos). 
- Hacer `reset` en entornos compartidos sin avisar.
- Log de seed ruidoso (dificulta ver warnings reales).

---
## 10. Troubleshooting

| Síntoma | Causa posible | Acción |
|---------|---------------|--------|
| Timeout al arrancar server | DB no lista / red lenta | Aumentar `DB_WAIT_TIMEOUT_SECONDS` |
| Migración falla con lock | Migración previa no completó | Revisar tabla `_prisma_migrations`, relanzar |
| Datos duplicados tras seed | Seed no idempotente | Usar `upsert` / checks previos |
| Conexión rechazada desde host | Puerto no publicado / compose equivocado | Ver `docker compose ps` y reglas firewall |
| Error de encoding | Locale default alpine | Añadir ajustes si se usan collations específicos |
| Lenta una query de lista | Falta índice en filtro/orden | Añadir índice y medir |

Comando para ver estado health de Postgres:
```powershell
docker compose -f docker-compose-dev.yml logs --tail=50 postgres
```

---
## 11. Comandos rápidos

```powershell
# Listar tablas
docker compose -f docker-compose-dev.yml exec postgres psql -U postgres -d techtest -c "\dt"

# Describir tabla Post
docker compose -f docker-compose-dev.yml exec postgres psql -U postgres -d techtest -c "\d \"Post\""

# Conteo de filas
docker compose -f docker-compose-dev.yml exec postgres psql -U postgres -d techtest -c "SELECT count(*) FROM \"Post\";"

# Nueva migración (interactiva)
docker compose -f docker-compose-dev.yml exec server npx prisma migrate dev --name add_field

# Generar cliente Prisma
docker compose -f docker-compose-dev.yml exec server npx prisma generate

# Reset lógico (reaplica todo + seed)
docker compose -f docker-compose-dev.yml exec server npx prisma migrate reset --force

# Export (dump) rápido (requiere pg_dump en host si instalado)
pg_dump -h localhost -U postgres -d techtest > backup.sql

# Import desde dump (destructivo)
psql -h localhost -U postgres -d techtest -f backup.sql
```

---
## 12. Referencias
- Prisma Migrate: https://www.prisma.io/docs/orm/prisma-migrate
- PostgreSQL EXPLAIN: https://www.postgresql.org/docs/current/using-explain.html
- UUID v7 draft: https://www.ietf.org/archive/id/draft-ietf-uuidrev-rfc4122bis-latest.html


