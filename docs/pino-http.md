# pino-http – Guía práctica en este proyecto

Esta guía explica por qué usamos pino-http, dónde está configurado, cómo se usa en controladores y middlewares, y cómo leer/ajustar los logs.

## ¿Qué es pino-http y por qué?
- pino-http es el middleware de Pino para aplicaciones HTTP (Express en nuestro caso).
- Beneficios clave:
  - Logs estructurados en JSON (observabilidad en prod) y “pretty” en desarrollo (lectura humana).
  - Correlación por request (req.id) y logger por request (`req.log`).
  - Log automático de cada petición ("request completed") con método, URL, status y responseTime.
  - Integración simple con un handler de errores centralizado.

## Archivos y carpetas relevantes
- `server/src/main.ts`
  - Registra pino-http como middleware y configura el logger Pino.
  - En desarrollo habilita pino-pretty; en producción emite JSON para pipelines/ELK/Loki/Datadog.
  - Ignora el endpoint de health para reducir ruido y ajusta nivel de log según status code.
- `server/src/interfaces/http/middlewares/error-handler.ts`
  - Usa `req.log.error({ err }, 'Unhandled error')` para loguear errores no controlados con el contexto de la request.
- Controladores (p. ej., `server/src/interfaces/http/controllers/posts.controller.ts`)
  - Puedes usar `req.log.info/warn/error` para logs de negocio y diagnósticos.

## Config actual (resumen)
En `main.ts`:
- Logger Pino con pretty en dev y JSON en prod:
  - Dev: nivel `debug`, transporte `pino-pretty` con color y fecha legible.
  - Prod: nivel `info`, sin pretty.
- pino-http con:
  - `autoLogging.ignore` para no loguear `/api/v1/health`.
  - `customLogLevel` que mapea 5xx a `error`, 4xx a `warn`, y resto a `info`.
- Resultado: cada request imprime un “request completed” con campos de req/res y `responseTime`.

## Cómo ejecutarlo y ver los logs
- Desarrollo (pretty logging):
```powershell
npm --prefix server run dev
```
Verás líneas como:
```
[2025-10-03 09:39:46.912 -0300] INFO (22364): request completed
    req: { "id": 3, "method": "POST", "url": "/api/v1/posts", ... }
    res: { "statusCode": 201, "headers": { "location": "/api/v1/posts/<id>", ... } }
    responseTime: 115
```

- Sanity (opcional, manual):
```powershell
npm --prefix server run sanity:health
```
Esto hace GET /health (espera 200) y GET a una ruta inexistente (espera 404) y devuelve código de salida 0 si todo está OK.

## Uso en controladores y middlewares
- Logger por request:
```ts
req.log.info({ userId, action: 'create-post' }, 'Creating post');
```
- Handler de errores central:
```ts
req.log.error({ err }, 'Unhandled error');
```
- Niveles recomendados:
  - info: hitos de negocio (creación de recursos, estados relevantes).
  - warn: validaciones fallidas, timeouts/errores controlados de terceros.
  - error: excepciones/errores no controlados (lo maneja el error handler).

## Opciones útiles (cuando lo necesites)
- Pretty en dev (ya activo): ajusta en `main.ts` si quieres otro formato (por ejemplo, añade `singleLine: true`).
- Correlación con X-Request-Id:
```ts
app.use(pinoHttp({ genReqId: (req) => (req.headers['x-request-id'] as string) || crypto.randomUUID() }));
```
- Redactar sensibles (recomendado antes de prod):
```ts
import pino from 'pino';
const logger = pino({ redact: ['req.headers.authorization', 'body.password'] });
```
- Ignorar más rutas ruidosas (además del health):
```ts
autoLogging: { ignore: (req) => req.url.startsWith('/api/v1/health') || req.url.startsWith('/api/docs') }
```
- Cambiar nivel por status:
```ts
customLogLevel(_req, res, err) {
  if (err || res.statusCode >= 500) return 'error';
  if (res.statusCode >= 400) return 'warn';
  return 'info';
}
```

## Lectura de un log de ejemplo (tu salida)
- `INFO/WARN/ERROR`: nivel de severidad calculado.
- `req`: datos de la petición (id, método, url, headers acotados, ip/puerto).
- `res`: statusCode y headers (incluye `location` en 201 de creación).
- `responseTime`: milisegundos desde que se recibió la request.
- En 4xx verás `WARN`; en 5xx, `ERROR`.

### Ejemplo completo (pretty dev)

```
[2025-10-03 09:39:46.912 -0300] INFO (22364): request completed
    req: {
      "id": 3,
      "method": "POST",
      "url": "/api/v1/posts",
      "query": {},
      "params": {},
      "headers": {
        "host": "localhost:3000",
        "connection": "keep-alive",
        "content-length": "67",
        "sec-ch-ua-platform": "\"Windows\"",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",      
        "accept": "application/json",
        "sec-ch-ua": "\"Chromium\";v=\"140\", \"Not=A?Brand\";v=\"24\", \"Google Chrome\";v=\"140\"",
        "content-type": "application/json",
        "sec-ch-ua-mobile": "?0",
        "origin": "http://localhost:3000",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "es-419,es;q=0.9",
        "cookie": "rl_page_init_referrer=RudderEncrypt%3AU2FsdGVkX1%2Bcz9rNLLE6SrNqTdMhfJt%2Bs3G5dtmSM44%3D; rl_page_init_referring_domain=RudderEncrypt%3AU2FsdGVkX19j%2FetQxLqUKzdvUP6fCULQwENBFT8Kmtw%3D; rl_anonymous_id=RudderEncrypt%3AU2FsdGVkX19WPR2gTjgKIt3NIcwPLmPvc%2FUvml95iUsdXxryOw0%2BCbi6N48zNeKxN9q47e5U6dm4h2pVWjGoow%3D%3D; rl_user_id=RudderEncrypt%3AU2FsdGVkX19V%2F7wjONtlLO3hu4PoZQZ2WPC2AmqtK4dJqeMTa4LgJEcMqPDtMEzUtc%2BBdsTlEetjkhqXyCK%2FVLxJkFx6%2BaY4gQOU4TNgIjHix256J9arHpn6F3bzDyD89N5STwtwbNITPshFU1WwVghONxIuB1Pva33oTzP2kmw%3D; rl_trait=RudderEncrypt%3AU2FsdGVkX18ufBYITUZdLK4l2A%2BCWXgb52ZVmn0TosMK1Xg7YQDJEx75RYetwywife7Vr6IEK5iFjE1CDD9rCPJwzSQsmYFbb8jQX2cH90ivFRCvWiuY9vgsa1H0%2B06k6d%2Fu8QCbgGE%2BuGYqPBivRQ%3D%3D; ph_phc_4URIAm1uYfJO7j8kWSe0J8lc8IqnstRLS7Jx8NcakHo_posthog=%7B%22distinct_id%22%3A%22a98e9c03959d066a64a2435efb40d8ea2c97af170e27ba36d583ac40d0cd22be%230c8cb94d-665b-42a9-8db1-9f8c00dfbb06%22%2C%22%24sesid%22%3A%5Bnull%2Cnull%2Cnull%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22%24direct%22%2C%22u%22%3A%22http%3A%2F%2Flocalhost%3A5678%2Fsetup%22%7D%7D; rl_session=RudderEncrypt%3AU2FsdGVkX1%2BcXrnZQxPaQAb7tErczvuEsObAn1dgkOqXR8sFQgNzwpRXZuXGhSjfjHvHegVu5CQVipyk9sxaAXusxk3I9V9ECGxX84sLy19NVB%2FKAt87Kc%2BfiT44CXjO0V79VSzly%2B4aBhx9Dul62g%3D%3D; PGADMIN_LANGUAGE=es; pga4_session=1df3b2bd-adde-415e-b505-5023f462a8f7!D+x5+HL84Qo0LDQEHAJPy0wpISgl6mQPItOLUE1qjvU="
      },
      "remoteAddress": "::1",
      "remotePort": 55565
    }
    res: {
      "statusCode": 201,
      "headers": {
        "content-security-policy": "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
        "cross-origin-opener-policy": "same-origin",
        "cross-origin-resource-policy": "same-origin",
        "origin-agent-cluster": "?1",
        "referrer-policy": "no-referrer",
        "cross-origin-resource-policy": "same-origin",
        "origin-agent-cluster": "?1",
        "referrer-policy": "no-referrer",
        "origin-agent-cluster": "?1",
        "referrer-policy": "no-referrer",
        "referrer-policy": "no-referrer",
        "strict-transport-security": "max-age=31536000; includeSubDomains",
        "x-content-type-options": "nosniff",
        "x-dns-prefetch-control": "off",
        "x-download-options": "noopen",
        "x-frame-options": "SAMEORIGIN",
        "x-permitted-cross-domain-policies": "none",
        "x-xss-protection": "0",
        "access-control-allow-origin": "*",
        "location": "/api/v1/posts/f4ace44d-899f-45bd-9445-3142cecfd969",
        "content-type": "application/json; charset=utf-8",
        "content-length": "180",
        "etag": "W/\"b4-w2IDA69LRu/Hg0BIXK0WKatp0YY\""
      }
    }
    responseTime: 115
```

## Buenas prácticas
- No loguear PII (datos sensibles) → usa `redact`.
- Loguear contexto suficiente (ids de recurso/usuario) para diagnosticar, sin sobrecargar.
- Evitar doble logging (ya usamos `req.log`, no `console.log`).
- No loguear healthchecks.

## Problemas frecuentes y solución
- “No se ve pretty en dev”: verifica que `NODE_ENV=development` (el script `dev` ya lo setea con cross-env) y que `pino-pretty` está instalado.
- “Demasiado ruido en la consola”: amplía `autoLogging.ignore` para endpoints ruidosos (por ejemplo `/api/docs`).
- “Quiero ver el body de error”: el handler ya loguea `{ err }`; añade campos específicos según tu caso.

## Referencias
- pino-http: https://github.com/pinojs/pino-http
- Pino: https://getpino.io/
- pino-pretty: https://github.com/pinojs/pino-pretty
