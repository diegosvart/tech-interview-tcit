# Redux Implementation - RTK Query

## ¿Qué es Redux en esta aplicación?

En este proyecto **NO** usamos Redux tradicional. Usamos **RTK Query**, que es parte de Redux Toolkit y maneja automáticamente:

- Fetch de datos (GET)
- Mutaciones (POST, PUT, DELETE)
- Caché automático
- Loading states
- Error states
- Invalidación de caché

---

## Arquitectura Redux - 3 Capas

```
┌─────────────────────────────────────────────┐
│  1. CONFIGURACIÓN DEL STORE (store.ts)     │
│     - Crea el store global                 │
│     - Registra el reducer de postsApi      │
│     - Configura middleware                 │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. DEFINICIÓN DE API (posts.api.ts)       │
│     - Define endpoints (GET, POST, etc.)   │
│     - Configura caché y tags               │
│     - Exporta hooks para componentes       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. USO EN COMPONENTES (PostsList.tsx)     │
│     - useListPostsQuery() para leer        │
│     - useCreatePostMutation() para crear   │
│     - useUpdatePostMutation() para editar  │
│     - useDeletePostMutation() para borrar  │
└─────────────────────────────────────────────┘
```

---

## 1. CONFIGURACIÓN DEL STORE

### `src/store.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { postsApi } from './features/posts/posts.api';

export const store = configureStore({
  reducer: {
    // Registrar el reducer de postsApi en el store
    [postsApi.reducerPath]: postsApi.reducer,
  },
  middleware: (getDefault) => 
    // Agregar middleware de RTK Query para caché y refetch
    getDefault().concat(postsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### ¿Qué hace?

1. **`configureStore`**: Crea el store global de Redux
2. **`reducer`**: Registra el reducer de `postsApi` con su key dinámica
3. **`middleware`**: Agrega el middleware de RTK Query para:
   - Gestionar caché
   - Refetch automático
   - Optimistic updates
   - Polling

### Conexión en `main.tsx`

```typescript
import { Provider } from 'react-redux';
import { store } from './store';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>  {/* ← Redux Provider envuelve la app */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
```

---

## 2. DEFINICIÓN DE API (RTK Query)

### `src/features/posts/posts.api.ts`

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ========================================
// PASO 1: Definir tipos TypeScript
// ========================================
export interface Post {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  data: Post[];
  pagination?: PaginationInfo;
}

// ========================================
// PASO 2: Crear API con createApi
// ========================================
export const postsApi = createApi({
  reducerPath: 'postsApi',  // Nombre del slice en el store
  
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/v1'  // Base URL para todas las peticiones
  }),
  
  tagTypes: ['Posts'],  // Tags para invalidación de caché
  
  // ========================================
  // PASO 3: Definir endpoints (CRUD)
  // ========================================
  endpoints: (builder) => ({
    
    // QUERY: Listar posts (GET)
    listPosts: builder.query<PostsResponse, { page?: number; pageSize?: number }>({
      query: (params = {}) => ({ 
        url: '/posts',     // → GET /api/v1/posts?page=1&pageSize=10
        params: params 
      }),
      
      // Tags que provee (para caché)
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((p) => ({ type: 'Posts' as const, id: p.id })),
              { type: 'Posts' as const, id: 'LIST' },
            ]
          : [{ type: 'Posts' as const, id: 'LIST' }],
    }),
    
    // MUTATION: Crear post (POST)
    createPost: builder.mutation<Post, CreatePostInput>({
      query: (body) => ({ 
        url: '/posts',      // → POST /api/v1/posts
        method: 'POST', 
        body 
      }),
      
      // Invalida el tag 'LIST' → refetch automático de listPosts
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),
    
    // MUTATION: Actualizar post (PUT)
    updatePost: builder.mutation<Post, { id: string; data: UpdatePostInput }>({
      query: ({ id, data }) => ({ 
        url: `/posts/${id}`,  // → PUT /api/v1/posts/:id
        method: 'PUT', 
        body: data 
      }),
      
      // Invalida el post específico + la lista
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Posts', id },           // Post individual
        { type: 'Posts', id: 'LIST' },   // Lista completa
      ],
    }),
    
    // MUTATION: Eliminar post (DELETE)
    deletePost: builder.mutation<void, string>({
      query: (id) => ({ 
        url: `/posts/${id}`,  // → DELETE /api/v1/posts/:id
        method: 'DELETE' 
      }),
      
      // Invalida la lista → refetch automático
      invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
    }),
  }),
});

// ========================================
// PASO 4: Exportar hooks generados
// ========================================
export const { 
  useListPostsQuery,      // Hook para GET (query)
  useCreatePostMutation,  // Hook para POST (mutation)
  useUpdatePostMutation,  // Hook para PUT (mutation)
  useDeletePostMutation   // Hook para DELETE (mutation)
} = postsApi;
```

### Conceptos Clave

#### **Queries vs Mutations**

| Tipo | Uso | Métodos HTTP | Hook |
|------|-----|--------------|------|
| **Query** | Leer datos | GET | `useListPostsQuery()` |
| **Mutation** | Modificar datos | POST, PUT, DELETE | `useCreatePostMutation()` |

#### **Tags y Caché**

```typescript
// providesTags: Define qué tags provee este endpoint
providesTags: [
  { type: 'Posts', id: 'post-123' },  // Tag para post específico
  { type: 'Posts', id: 'LIST' }       // Tag para lista completa
]

// invalidatesTags: Invalida tags para refetch automático
invalidatesTags: [
  { type: 'Posts', id: 'LIST' }  // Invalida lista → refetch listPosts
]
```

**Flujo:**
1. `listPosts` provee tags: `[{type: 'Posts', id: 'LIST'}, ...]`
2. `createPost` invalida: `[{type: 'Posts', id: 'LIST'}]`
3. RTK Query detecta invalidación → **refetch automático** de `listPosts`

---

## 3. USO EN COMPONENTES

### `src/features/posts/PostsList.tsx`

```typescript
export default function PostsList() {
  // Estado local (NO Redux)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ========================================
  // 1. QUERY: Leer datos con useListPostsQuery
  // ========================================
  const { data, isLoading, isError } = useListPostsQuery({ page, pageSize });
  
  // ¿Qué hace internamente?
  // 1. Hace fetch a GET /api/v1/posts?page=1&pageSize=10
  // 2. Guarda resultado en caché con tags ['Posts-LIST', 'Posts-id1', ...]
  // 3. Retorna: { data, isLoading, isError, refetch, ... }
  // 4. Si los datos están en caché, NO hace fetch (retorna caché)

  // ========================================
  // 2. MUTATIONS: Modificar datos
  // ========================================
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [deletePost] = useDeletePostMutation();
  const [updatePost] = useUpdatePostMutation();
  
  // ¿Qué retorna cada mutation?
  // [triggerFunction, { data, isLoading, isError, reset }]
  //    ↓
  //  Función para ejecutar la mutation
  
  // ========================================
  // 3. EJECUTAR MUTATIONS
  // ========================================
  
  // Crear Post
  const handleCreate = async (name: string, description: string) => {
    await createPost({ name, description }).unwrap();
    // ↓ ¿Qué pasa después?
    // 1. POST /api/v1/posts con body { name, description }
    // 2. Invalida tag 'Posts-LIST'
    // 3. RTK Query refetch automático de listPosts
    // 4. UI se actualiza con nuevo post (sin refresh manual)
  };
  
  // Actualizar Post
  const handleUpdate = async (id: string, name: string, description: string) => {
    await updatePost({ id, data: { name, description } }).unwrap();
    // ↓ ¿Qué pasa después?
    // 1. PUT /api/v1/posts/:id con body { name, description }
    // 2. Invalida tags 'Posts-{id}' y 'Posts-LIST'
    // 3. RTK Query refetch automático
    // 4. UI se actualiza (sin refresh manual)
  };
  
  // Eliminar Post
  const handleDelete = async (id: string) => {
    await deletePost(id).unwrap();
    // ↓ ¿Qué pasa después?
    // 1. DELETE /api/v1/posts/:id
    // 2. Invalida tag 'Posts-LIST'
    // 3. RTK Query refetch automático
    // 4. UI se actualiza (post desaparece sin refresh)
  };

  return (
    <div>
      {isLoading && <p>Cargando...</p>}
      {isError && <p>Error al cargar posts</p>}
      {data?.data.map(post => (
        <div key={post.id}>{post.name}</div>
      ))}
    </div>
  );
}
```

---

## Flujo Completo: Crear Post

### **Usuario hace click en "Crear"**

```
┌──────────────────────────────────────────────────────────┐
│  1. COMPONENTE: PostsList.tsx                            │
│     handleCreate() llama a createPost()                  │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  2. RTK QUERY MUTATION (posts.api.ts)                    │
│     - Ejecuta: POST /api/v1/posts                        │
│     - Body: { name: "Mi Post", description: "..." }      │
│     - Recibe: { id: "123", name: "Mi Post", ... }        │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  3. INVALIDACIÓN DE CACHÉ                                │
│     - invalidatesTags: [{ type: 'Posts', id: 'LIST' }]   │
│     - RTK Query marca tag 'LIST' como inválido           │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  4. REFETCH AUTOMÁTICO                                   │
│     - RTK Query detecta tag 'LIST' inválido              │
│     - Ejecuta automáticamente: listPosts({ page, size }) │
│     - Fetch: GET /api/v1/posts?page=1&pageSize=10        │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  5. ACTUALIZACIÓN DE CACHÉ                               │
│     - Guarda nueva lista en caché                        │
│     - Actualiza tags con nuevos IDs                      │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│  6. RE-RENDER DEL COMPONENTE                             │
│     - useListPostsQuery detecta data cambió              │
│     - React re-renderiza PostsList                       │
│     - UI muestra nuevo post (SIN refresh manual)         │
└──────────────────────────────────────────────────────────┘
```

---

## Ejemplos Prácticos

### **Ejemplo 1: Loading State Automático**

```typescript
const { data, isLoading } = useListPostsQuery({ page: 1, pageSize: 10 });

if (isLoading) return <p>Cargando posts...</p>;
if (data) return <PostsTable posts={data.data} />;
```

**Redux hace:**
- Fetch a `/api/v1/posts?page=1&pageSize=10`
- Maneja estado `isLoading` automáticamente
- Guarda resultado en caché
- Si vuelves a llamar con mismos params → retorna caché (NO fetch)

### **Ejemplo 2: Error Handling Automático**

```typescript
const { data, isError, error } = useListPostsQuery({ page: 1 });

if (isError) {
  console.error('Error:', error);
  return <p>Error al cargar posts</p>;
}
```

**Redux hace:**
- Si fetch falla → `isError = true`
- `error` contiene info del error
- No necesitas try/catch manual

### **Ejemplo 3: Refetch Manual**

```typescript
const { data, refetch } = useListPostsQuery({ page: 1 });

// Refetch manual (ignora caché)
const handleRefresh = () => {
  refetch();
};
```

### **Ejemplo 4: Mutation con Loading**

```typescript
const [createPost, { isLoading }] = useCreatePostMutation();

const handleSubmit = async () => {
  try {
    await createPost({ name: 'Nuevo', description: 'Test' }).unwrap();
    alert('Creado!');
  } catch (err) {
    alert('Error!');
  }
};

return (
  <button onClick={handleSubmit} disabled={isLoading}>
    {isLoading ? 'Creando...' : 'Crear'}
  </button>
);
```

**Redux hace:**
- `isLoading = true` mientras ejecuta POST
- `isLoading = false` cuando termina
- `.unwrap()` lanza error si falla → capturado en catch

---

## Estado en Redux Store

### **¿Cómo se ve el estado?**

```javascript
// Redux DevTools → State
{
  postsApi: {
    queries: {
      'listPosts({"page":1,"pageSize":10})': {
        status: 'fulfilled',
        data: {
          data: [
            { id: '1', name: 'Post 1', description: '...' },
            { id: '2', name: 'Post 2', description: '...' }
          ],
          pagination: { page: 1, pageSize: 10, total: 25, hasNextPage: true }
        },
        endpointName: 'listPosts',
        requestId: 'abc123',
        startedTimeStamp: 1696345200000,
        fulfilledTimeStamp: 1696345201500
      }
    },
    mutations: {
      'createPost("unique-id")': {
        status: 'fulfilled',
        data: { id: '3', name: 'New Post', ... },
        endpointName: 'createPost',
        requestId: 'xyz789'
      }
    },
    provided: {
      Posts: {
        LIST: ['listPosts({"page":1,"pageSize":10})'],
        '1': ['listPosts({"page":1,"pageSize":10})'],
        '2': ['listPosts({"page":1,"pageSize":10})']
      }
    }
  }
}
```

### **Componentes del estado:**

1. **`queries`**: Caché de todas las queries (GET)
2. **`mutations`**: Estado de mutations (POST, PUT, DELETE)
3. **`provided`**: Mapa de tags → queries que los proveen

---

## Redux DevTools

### **Instalar extensión:**
- Chrome: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

### **Ver acciones:**

```
Action: postsApi/executeQuery/pending
  meta: { requestId: 'abc', arg: { page: 1 } }

Action: postsApi/executeQuery/fulfilled
  payload: { data: [...], pagination: {...} }

Action: postsApi/executeMutation/pending
  meta: { requestId: 'xyz', arg: { name: 'New' } }

Action: postsApi/executeMutation/fulfilled
  payload: { id: '3', name: 'New', ... }
```

---

## Ventajas de RTK Query

| Característica | Redux Tradicional | RTK Query |
|----------------|-------------------|-----------|
| **Boilerplate** | 100+ líneas (actions, reducers, thunks) | 10 líneas |
| **Caché** | Manual | Automático |
| **Loading states** | Manual | Automático |
| **Refetch** | Manual | Automático con tags |
| **Optimistic updates** | Complejo | Built-in |
| **TypeScript** | Difícil | Auto-generado |

---

## Recursos

- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
