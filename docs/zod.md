# Guía de validación con Zod

Esta guía documenta cómo usamos Zod en el proyecto para validar peticiones HTTP, tipar DTOs y producir errores consistentes.

## Objetivos
- Validar inputs de forma declarativa y centralizada.
- Generar tipos TypeScript a partir de esquemas (source of truth único).
- Responder errores 400 uniformes con detalles por campo.

## Patrones y convenciones

- Definimos esquemas en `server/src/domain/dtos/*.ts` y exportamos tipos derivados con `z.infer<...>`.
- Validamos en la capa HTTP con middlewares dedicados:
  - `validateBody(schema)` para `req.body`.
  - `validateQuery(schema)` para `req.query`.
  - `validateParams(schema)` para `req.params`.
- Enrutamos siempre con los validadores antes del controlador. Ejemplo:

```ts
// server/src/interfaces/http/routes/posts.routes.ts
postsRouter.post('/posts', validateBody(PostCreateSchema), createPost);
postsRouter.get('/posts', validateQuery(PostListQuerySchema), listPosts);
postsRouter.get('/posts/:id', validateParams(PostIdParamSchema), getPost);
postsRouter.put(
  '/posts/:id',
  validateParams(PostIdParamSchema),
  validateBody(PostUpdateSchema),
  updatePost
);
```

## Middlewares de validación

### `validateBody<T>(schema: ZodSchema<T>)`
- Parsea `req.body` con `schema.safeParse`.
- En caso de éxito, coloca el resultado tipado en `res.locals.body`.
- En caso de error, responde `400` con payload:

```json
{
  "message": "Invalid request body",
  "details": {
    "formErrors": [],
    "fieldErrors": { "campo": ["mensaje de error"] }
  }
}
```

### `validateQuery<T>(schema: ZodSchema<T>)`
- Igual que body pero sobre `req.query` y con `message: "Invalid query parameters"`.
- Útil usar `z.coerce.number()` para convertir cadenas a números.

### `validateParams<T>(schema: ZodSchema<T>)`
- Igual que body pero sobre `req.params` y con `message: "Invalid path parameters"`.

## Ejemplos de esquemas

Archivo: `server/src/domain/dtos/post.ts`

```ts
import { z } from 'zod';

export const PostCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
});
export type PostCreateDTO = z.infer<typeof PostCreateSchema>;

export const PostUpdateSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });
export type PostUpdateDTO = z.infer<typeof PostUpdateSchema>;

export const PostListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});
export type PostListQueryDTO = z.infer<typeof PostListQuerySchema>;

export const PostIdParamSchema = z.object({ id: z.string().uuid() });
export type PostIdParamDTO = z.infer<typeof PostIdParamSchema>;
```

## Uso en controladores

Al usar los middlewares, los datos validados quedan disponibles en `res.locals`:

```ts
// Body ya validado y tipado
const body = res.locals.body as PostCreateDTO;
// Query ya validada
const query = res.locals.query as PostListQueryDTO;
// Params ya validados
const params = res.locals.params as PostIdParamDTO;
```

## Errores y manejo global

- Todos los errores de validación retornan 400 y comparten la forma de `details` por `zod.error.flatten()`.
- El manejador global de errores se encarga del resto de excepciones (5xx), manteniendo consistencia en el formato de respuesta.

## Pruebas automatizadas

Los tests en `server/tests` cubren tanto los casos felices como las validaciones (400):

- `health.test.ts`: endpoint de salud y 404.
- `posts.crud.test.ts`: create/list/get/update/delete.
- `posts.validation.test.ts`: query inválida, path param no UUID, body inválido en POST/PUT.

Ejemplos de pruebas de validación:

```ts
import request from 'supertest';
import app from '../src/main';

test('GET /api/v1/posts rechaza page < 1', async () => {
  const res = await request(app).get('/api/v1/posts?page=0&pageSize=10');
  expect(res.status).toBe(400);
});

test('POST /api/v1/posts rechaza body vacío', async () => {
  const res = await request(app).post('/api/v1/posts').send({});
  expect(res.status).toBe(400);
});
```

## Recomendaciones

- Centraliza esquemas en `domain/dtos` para que sirvan a todas las capas.
- Prefiere `z.coerce` para parámetros de consulta numéricos.
- Agrega `.describe('...')` en esquemas si quieres auto-generar documentación adicional.
- Mantén los mensajes de error comprensibles para clientes de la API.

## Mantener Zod y OpenAPI alineados

Existen dos estrategias válidas. Elige una y sé consistente.

### 1) Zod como fuente de verdad (recomendada)
- Define todos los DTOs con Zod en `domain/dtos`.
- Genera el contrato OpenAPI automáticamente a partir de Zod y publícalo en Swagger UI.
- Herramientas:
  - `@asteasolutions/zod-to-openapi` (convierte Zod → OpenAPI 3)
  - `swagger-ui-express` (sirve el JSON en `/api/docs`)
- Flujo:
  1. Añade descripciones `.describe()` y marcas de `nullable`/`optional` según corresponda.
  2. Ejecuta un script que recolecte los esquemas y genere `openapi.json`.
  3. Monta Swagger UI con ese archivo.
- Ventajas: un solo source of truth (Zod). Menos divergencias.

### 2) OpenAPI como fuente de verdad
- Mantén `docs/openapi.json` como contrato canónico.
- Genera esquemas Zod a partir de OpenAPI para usarlos en validación de runtime.
- Herramientas:
  - `openapi-typescript-zod` o `openapi-zod-client` (genera Zod desde OpenAPI)
  - `openapi-typescript` (si solo quieres tipos TS)
- Flujo:
  1. Edita/valida `openapi.json`.
  2. Genera Zod y tipos a partir del contrato.
  3. Usa los Zod generados en los middlewares.

### Reglas prácticas para evitar drift
- Añade un job de CI que: (a) genere la contraparte (Zod→OpenAPI o OpenAPI→Zod) y (b) haga `diff` contra el archivo versionado; falla si difiere.
- Cubre validaciones clave con tests (hay ejemplos en `server/tests/posts.validation.test.ts`).
- Revisa mapeos particulares: `z.string().uuid()` → `type: string, format: uuid`; `z.coerce.number().int().min(1).max(100)` → `type: integer, minimum, maximum`.
- Sé explícito con `nullable()` vs `optional()` y refleja eso en OpenAPI (`nullable: true`, `required: [...]`).

## Extensiones futuras

- Generación de documentación de DTOs a partir de Zod (p. ej., mapeo automático a OpenAPI mediante utilidades de terceros).
- Validación de respuestas de salida (response validation) en endpoints críticos.
