# Integración con Backend - Contratos API v1

## Cambios Realizados

### 1. Actualización de Interfaces TypeScript (`posts.api.ts`)

#### PaginationInfo
```typescript
// ANTES (provisional)
interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;  // Campo calculado localmente
}

// DESPUÉS (contrato oficial)
interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;  // Campo del backend
}
```

#### Nuevas Interfaces
- `UpdatePostInput`: Para actualizar posts (PUT)
  - `name?: string` (opcional, 1-200 chars)
  - `description?: string` (opcional, nullable)

### 2. Nuevos Endpoints Implementados

#### DELETE /posts/:id
```typescript
deletePost: builder.mutation<void, string>({
  query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
  invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
})
```

**Hook exportado**: `useDeletePostMutation()`

#### PUT /posts/:id
```typescript
updatePost: builder.mutation<Post, { id: string; data: UpdatePostInput }>({
  query: ({ id, data }) => ({ url: `/posts/${id}`, method: 'PUT', body: data }),
  invalidatesTags: [{ type: 'Posts', id }, { type: 'Posts', id: 'LIST' }],
})
```

**Hook exportado**: `useUpdatePostMutation()`

### 3. Lógica de Paginación Actualizada

#### Cálculo de `totalPages`
Como el backend ahora devuelve `hasNextPage` en lugar de `totalPages`, se calcula en el frontend:

```typescript
const pagination = data?.pagination 
  ? {
      page: data.pagination.page,
      pageSize: data.pagination.pageSize,
      total: data.pagination.total,
      hasNextPage: data.pagination.hasNextPage,
      //Calcular totalPages desde total / pageSize
      totalPages: Math.ceil(data.pagination.total / data.pagination.pageSize)
    }
  : {
      // Fallback local cuando backend no disponible
      page: page,
      pageSize: pageSize,
      total: dataLength,
      hasNextPage: false,
      totalPages: dataLength > 0 ? Math.ceil(dataLength / pageSize) : 1
    };
```

### 4. Implementación de Delete

#### Handler en `PostsList.tsx`
```typescript
const handleDelete = async (id: string) => {
  if (window.confirm('¿Está seguro de eliminar este post?')) {
    try {
      await deletePost(id).unwrap();
      
      // Si la página queda vacía, volver a la anterior
      if (filteredPosts.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      console.error('Error al eliminar post:', error);
      alert('Error al eliminar el post. Intente nuevamente.');
    }
  }
};
```

**Características:**
- Confirmación antes de eliminar
- Manejo de errores con alert
- Navegación automática si la página actual queda vacía
- Invalidación automática de caché RTK Query

### 5. Validaciones Actualizadas

#### Límites según OpenAPI
- **name**: 
  - Mínimo: 3 caracteres (validación frontend)
  - Máximo: 200 caracteres (según contrato)
  - Campo requerido
  
- **description**:
  - Opcional (puede ser null)
  - Máximo: 500 caracteres (límite frontend)

#### Cambios en `PostFormInline.tsx`
```typescript
// ANTES
if (trimmedName.length > 100) {
  setError('El nombre no puede tener más de 100 caracteres');
}

// DESPUÉS
if (trimmedName.length > 200) {
  setError('El nombre no puede tener más de 200 caracteres');
}
```

```html
<!-- ANTES -->
<input maxLength={100} placeholder="Nombre (mín. 3 caracteres)" />

<!-- DESPUÉS -->
<input maxLength={200} placeholder="Nombre (mín. 3 caracteres, máx. 200)" />
```

---

## Endpoints del Backend (según OpenAPI)

### Health Check
- `GET /api/v1/health` → `{ ok: true }`

### Posts CRUD

#### Listar (con paginación)
- `GET /api/v1/posts?page=1&pageSize=10`
- Respuesta:
  ```json
  {
    "data": [{ Post[] }],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 57,
      "hasNextPage": true
    }
  }
  ```

#### Obtener uno
- `GET /api/v1/posts/:id`
- Respuesta: `Post`

#### Crear
- `POST /api/v1/posts`
- Body: `{ name: string, description?: string }`
- Respuesta: `Post` (status 201)

#### Actualizar
- `PUT /api/v1/posts/:id`
- Body: `{ name?: string, description?: string }` (al menos 1 campo)
- Respuesta: `Post`

#### Eliminar
- `DELETE /api/v1/posts/:id`
- Respuesta: status 204 (sin contenido)

---

## Gestión de Errores

### Códigos HTTP Implementados
- `400` Bad Request: Validación fallida
- `404` Not Found: Post no encontrado
- `409` Conflict: Post duplicado (nombre ya existe)
- `500` Server Error: Error interno

### Respuesta de Error
```typescript
interface Error {
  message: string;
  code?: string;
  details?: Record<string, any>;
}
```

---

## Cache Management (RTK Query)

### Tags de Invalidación
- `{ type: 'Posts', id: 'LIST' }`: Invalidar lista completa
- `{ type: 'Posts', id: postId }`: Invalidar un post específico

### Estrategia
1. **CREATE**: Invalida `LIST` → re-fetch automático de la lista
2. **UPDATE**: Invalida `LIST` + el post específico
3. **DELETE**: Invalida `LIST`
4. **GET/LIST**: Provee tags para tracking

---

## Próximos Pasos (Opcional)

### Funcionalidades Pendientes
- [ ] Implementar modal/formulario para **editar** posts (PUT)
- [ ] Agregar loading states individuales para delete
- [ ] Implementar manejo de errores más robusto (toast notifications)
- [ ] Agregar tests unitarios para las mutations
- [ ] Implementar infinite scroll como alternativa a paginación

### Mejoras de UX
- [ ] Animación al eliminar posts
- [ ] Confirmación con modal personalizado (en lugar de `window.confirm`)
- [ ] Feedback visual al crear/editar/eliminar
- [ ] Skeleton loaders durante fetch

---

**Fecha de actualización:** 3 de octubre de 2025  
**Versión del contrato:** OpenAPI 3.0.3 - API v1
