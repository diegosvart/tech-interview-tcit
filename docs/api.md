# API – Contrato REST

Base path: `/api/v1`

## Recursos

### GET /posts
- Query: `page` (default 1), `pageSize` (default 10)
- 200 OK:
  ```json
  {
    "data": [ { /* Post */ } ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 42,
      "hasNextPage": true
    }
  }
  ```
- Notas: paginación por offset para simplicidad. En escenarios de gran escala se considerará cursor (`createdAt,id`).

### GET /posts/:id
- 200 OK: `Post`
- 404 si no existe

### POST /posts
- Body: `{ name: string, description: string }`
- 201 Created: `Post`
- 400 validación

### PUT /posts/:id
- Body: `{ name?: string, description?: string }`
- 200 OK: `Post`
- 400 validación | 404 no existe

### DELETE /posts/:id
- 204 No Content | 404 no existe

## Tipos
```ts
export type Post = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};
```

## Errores
- 400: `{ code: "VALIDATION_ERROR", message: string, details?: any }`
- 404: `{ code: "NOT_FOUND", message: string }`
- 500: `{ code: "INTERNAL_ERROR", message: string, traceId?: string }`

## Ejemplos rápidos (PowerShell)

- Crear post
  ```powershell
  $body = @{ name = 'demo'; description = 'desc' } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/v1/posts -ContentType 'application/json' -Body $body
  ```

- Listar posts
  ```powershell
  Invoke-RestMethod -Uri http://localhost:3000/api/v1/posts
  ```

- Obtener por id
  ```powershell
  Invoke-RestMethod -Uri http://localhost:3000/api/v1/posts/<ID>
  ```

- Actualizar
  ```powershell
  $body = @{ name = 'updated'; description = $null } | ConvertTo-Json
  Invoke-RestMethod -Method Put -Uri http://localhost:3000/api/v1/posts/<ID> -ContentType 'application/json' -Body $body
  ```

- Eliminar
  ```powershell
  Invoke-RestMethod -Method Delete -Uri http://localhost:3000/api/v1/posts/<ID>
  ```
