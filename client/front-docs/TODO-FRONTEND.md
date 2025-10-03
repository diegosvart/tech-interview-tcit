# TODO Frontend - Sistema CRUD de Posts

## Resumen del Proyecto
Test técnico para Senior Software Engineer: Aplicación React + Redux para gestión de posts con funcionalidades CRUD completas.

---

## Estado Actual del Proyecto

### Stack Ya Configurado
- **React 18** con TypeScript
- **Redux Toolkit** + **RTK Query** para data fetching
- **Vite** como bundler (HMR funcionando)
- **React Router DOM** con rutas básicas
- **Proxy configurado**: `/api` → `http://localhost:3000`
- **TypeScript** con configuración estricta

### Estructura Actual
```
client/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts (proxy configurado)
├── src/
│   ├── main.tsx (Provider + Router ya configurados)
│   ├── App.tsx (header + nav + rutas básicas)
│   ├── store.ts (store con postsApi)
│   └── features/
│       └── posts/
│           ├── posts.api.ts (RTK Query API con listPosts, createPost)
│           ├── index.ts
│           ├── PostsList.tsx (lista básica)
│           └── NewPost.tsx (formulario básico)
```

### Endpoints API Ya Implementados
- `GET /api/v1/posts` - Listar posts con paginación
- `POST /api/v1/posts` - Crear nuevo post
- `DELETE /api/v1/posts/:id` - **FALTA implementar en RTK Query**

### Lo Que Ya Funciona
- Servidor dev corriendo en `http://localhost:5173/`
- Navegación entre rutas (`/`, `/posts`, `/posts/new`)
- Listar posts desde el backend
- Crear nuevos posts (con invalidación de caché)
- Provider de Redux y Router configurados

---

## COMPLETADO: Esqueleto del Sitio

### Componentes Creados
- **FilterHeader.tsx**: Input de filtro + botón Buscar con diseño minimalista
- **PostsTable.tsx**: Tabla con columnas Nombre | Descripción | Acción
- **PostFormInline.tsx**: Formulario inline para crear posts en el footer
- **PostsList.tsx**: Vista única integrada con filtrado local funcional

### Arquitectura Implementada
```
src/
├── features/posts/
│   ├── FilterHeader.tsx      Componente de filtro
│   ├── PostsTable.tsx         Tabla de posts
│   ├── PostFormInline.tsx     Formulario inline
│   ├── PostsList.tsx          Vista principal integrada
│   ├── posts.api.ts           RTK Query API
│   └── index.ts
├── styles/
│   └── posts.css              Estilos minimalistas wireframe
├── App.tsx                     Rutas simplificadas
└── main.tsx                    Importa estilos CSS
```

### Funcionalidades Implementadas
- **Filtrado local por nombre**: funciona en tiempo real sin llamar al backend
- **Diseño wireframe moderno**: blanco/negro/grises, minimalista
- **Layout según especificación**:
  - Header: filtro + botón
  - Main: tabla con hover states
  - Footer: formulario inline
- **Crear posts**: formulario integrado en la misma vista
- **Responsivo**: mobile-first con breakpoints
- **Estados de carga**: loading, empty, error
- **Validaciones**: nombre requerido, confirmación de eliminar

### Estilos CSS Moderno
- Variables CSS (`:root`) para mantenibilidad
- Diseño system-ui fonts
- Transiciones suaves (0.2s ease)
- Hover states en tabla y botones
- Focus states accesibles
- Responsive breakpoint @ 768px
- Animaciones fadeIn sutiles

---

## Lo Que FALTA Implementar (Cuando Backend Esté Listo)

### Requisitos Funcionales Pendientes
- [ ] **Eliminar posts**: Agregar mutation en RTK Query cuando endpoint DELETE esté disponible
- [ ] **Conectar función handleDelete**: Reemplazar console.log por useDeletePostMutation

---

## FASE 1: Agregar Funcionalidad de Eliminar (PENDIENTE BACKEND)

### 1.1 Agregar Mutation de Delete en RTK Query
 **Esperar a que el backend implemente**: `DELETE /api/v1/posts/:id`

- [ ] Abrir `src/features/posts/posts.api.ts`
- [ ] Agregar endpoint `deletePost`:
  ```typescript
  deletePost: builder.mutation<Post, string>({
    query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
    invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
  }),
  ```
- [ ] Exportar el hook: `export const { ..., useDeletePostMutation } = postsApi;`

### 1.2 Conectar en PostsList
- [ ] Reemplazar en `PostsList.tsx`:
  ```typescript
  // Cambiar esto:
  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este post?')) {
      console.log('Eliminar post:', id);
    }
  };
  
  // Por esto:
  const [deletePost] = useDeletePostMutation();
  
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este post?')) {
      try {
        await deletePost(id).unwrap();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };
  ```

**Criterio de aceptación**: 
- Botón "Eliminar" funciona y actualiza la lista automáticamente
- RTK Query invalida caché y recarga datos

---

## 📝 FASE 2: Testing y Refinamiento

### 2.1 Pruebas Manuales (Listo para Probar)
- [ ] Cargar `http://localhost:5173` → debe listar todos los posts
- [ ] Escribir en filtro → tabla se actualiza en tiempo real sin llamar al backend
- [ ] Crear nuevo post → aparece en la tabla inmediatamente
- [ ] ⚠️ Eliminar post → por ahora solo muestra confirm (esperar backend)
- [ ] Recargar página → posts persisten (backend + caché RTK Query)
- [ ] Probar responsivo en DevTools (mobile, tablet, desktop)

### 2.2 Verificar Requisitos del Test
- [x] **Insertar posts**: FUNCIONA
- [ ] ⚠️ **Eliminar posts**: Estructura lista, falta endpoint backend
- [x] **Listar posts**: FUNCIONA
- [x] **Filtrar posts por nombre localmente**: FUNCIONA sin backend
- [x] **JSON camelCase**: RTK Query usa camelCase automáticamente
- [x] **Llamar endpoint lista UNA SOLA VEZ**: RTK Query caché lo garantiza
- [x] **Estructura**: Filtro + Tabla + Formulario en una sola vista

---

## 📝 FASE 3: Documentación Final

### 7.1 Actualizar README.md
- [ ] Agregar sección "Cómo levantar el ambiente de desarrollo":
  ```markdown
  ## Frontend (React + Vite)
  
  ### Requisitos
  - Node.js >= 18
  - Backend corriendo en http://localhost:3000
  
  ### Instalación
  ```bash
  cd client
  npm install
  ```
  
  ### Desarrollo
  ```bash
  npm run dev
  ```
  Acceder a: http://localhost:5173
  
  ### Build de Producción
  ```bash
  npm run build
  ```
  ```

### 7.2 Comentar Código Complejo
- [ ] Documentar filtrado local en `PostsList`
- [ ] Comentar configuración de RTK Query
- [ ] Explicar por qué se usa `invalidatesTags`

---

## Checklist Final Pre-Entrega

### Funcionalidad
- [ ] Listar posts (carga inicial una sola vez con caché)
- [ ] Crear post (formulario en la misma vista)
- [ ] Eliminar post (con confirmación, retorna post eliminado)
- [ ] Filtrar posts por nombre (localmente, sin llamar API)
- [ ] Manejo de estados: loading, error, success

### Arquitectura
- [ ] RTK Query para data fetching y caché
- [ ] TypeScript con tipado fuerte
- [ ] Estructura modular: features/posts
- [ ] Proxy configurado para evitar CORS

### UI/UX
- [ ] Diseño wireframe simple (blanco/negro/grises)
- [ ] Tabla con columnas: Nombre | Descripción | Acción
- [ ] Filtro superior funcional
- [ ] Formulario inferior inline
- [ ] Confirmación antes de eliminar
- [ ] Feedback visual en acciones

### Código
- [ ] Convención camelCase en JS/TS
- [ ] Sin console.logs de debug
- [ ] Sin warnings en consola
- [ ] TypeScript sin errores

### Documentación
- [ ] README.md con instrucciones claras
- [ ] Código comentado donde sea necesario

---

## Orden Recomendado de Implementación

1. **Agregar deletePost en RTK Query** (5 min)
2. **Crear FilterHeader component** (10 min)
3. **Crear PostsTable component** (15 min)
4. **Refactorizar PostsList** con filtro local + eliminar + formulario inline (30 min)
5. **Agregar estilos CSS básicos** wireframe (15 min)
6. **Validaciones y confirmaciones** (10 min)
7. **Pruebas manuales completas** (15 min)
8. **Actualizar README.md** (10 min)

**Total estimado: 2 horas**

---

## Notas Técnicas Importantes

### RTK Query Caché
- RTK Query cachea automáticamente los datos de `listPosts`
- Solo se llama al backend cuando:
  1. Primera carga (mount)
  2. Se invalida el caché (después de crear/eliminar)
  3. Se fuerza refetch manualmente
- **NO es necesario** llamar explícitamente "una sola vez", RTK Query lo maneja

### Filtrado Local
- El filtrado debe hacerse en el cliente con JavaScript
- NO enviar query params al backend para filtrar
- Usar `useMemo` para optimizar el filtrado

### Proxy Vite
- Ya configurado: `/api` → `http://localhost:3000`
- Todas las llamadas deben usar rutas relativas: `/api/v1/posts`
- No usar `http://localhost:3000` directamente en el cliente

---


**Tiempo estimado para completar**: 2-3 horas máximo.

### 1.3 Configurar Variables de Entorno
- [ ] Crear archivo `.env` con la URL del backend:
  ```
  VITE_API_URL=http://localhost:3000
  ```
- [ ] Crear archivo `.env.example` para documentación

---

## Fase 2: Estructura de Archivos y Redux

### 2.1 Crear Estructura de Carpetas
```
src/
├── app/
│   ├── store.ts                    # Configuración del store de Redux
│   └── hooks.ts                    # Hooks tipados (useAppDispatch, useAppSelector)
├── features/
│   └── posts/
│       ├── postsSlice.ts           # Slice de Redux para posts
│       ├── postsAPI.ts             # Funciones para llamadas al API
│       ├── types.ts                # Tipos TypeScript para Post
│       └── components/
│           ├── PostsList.tsx       # Componente principal de lista
│           ├── PostsTable.tsx      # Tabla de posts
│           ├── PostRow.tsx         # Fila individual de post
│           ├── PostForm.tsx        # Formulario crear/editar
│           └── FilterHeader.tsx    # Barra de filtro superior
├── components/
│   ├── ConfirmDialog.tsx           # Modal de confirmación
│   ├── LoadingSpinner.tsx          # Indicador de carga
│   └── ErrorMessage.tsx            # Mensaje de error
├── utils/
│   ├── api.ts                      # Cliente HTTP configurado
│   └── validators.ts               # Validaciones de formulario
└── styles/
    └── tailwind.css                # Estilos Tailwind
```

### 2.2 Configurar Redux Store
- [ ] Crear `src/app/store.ts` con configuración del store
- [ ] Crear `src/app/hooks.ts` con hooks tipados (`useAppDispatch`, `useAppSelector`)
- [ ] Envolver la aplicación con `<Provider store={store}>` en `main.tsx`

### 2.3 Definir Tipos TypeScript
- [ ] Crear `src/features/posts/types.ts`:
  ```typescript
  export interface Post {
    id: string | number;
    name: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface PostsState {
    items: Post[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    filter: string;
  }

  export interface CreatePostDTO {
    name: string;
    description: string;
  }
  ```

---

## Fase 3: Capa de Servicios (API)

### 3.1 Configurar Cliente HTTP
- [ ] Crear `src/utils/api.ts` con instancia de Axios:
  ```typescript
  import axios from 'axios';

  export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  ```

### 3.2 Crear Servicios de Posts
- [ ] Crear `src/features/posts/postsAPI.ts` con funciones:
  - `fetchPostsAPI(filter?: string): Promise<Post[]>`
  - `createPostAPI(post: CreatePostDTO): Promise<Post>`
  - `deletePostAPI(id: string | number): Promise<Post>`
  - Opcional: `updatePostAPI(id: string | number, post: CreatePostDTO): Promise<Post>`

---

## Fase 4: Redux Slice y Thunks

### 4.1 Crear Posts Slice
- [ ] Crear `src/features/posts/postsSlice.ts` con:
  - **Estado inicial**: `{ items: [], status: 'idle', error: null, filter: '' }`
  - **Reducers síncronos**:
    - `setFilter(state, action)`: actualiza el filtro local
    - `clearError(state)`: limpia errores
  - **AsyncThunks**:
    - `fetchPosts`: obtener todos los posts (llamar solo una vez al cargar)
    - `createPost`: crear nuevo post y agregarlo al estado
    - `deletePost`: eliminar post y removerlo del estado
  - **ExtraReducers**: manejar estados pending/fulfilled/rejected
  - **Selectors**:
    - `selectAllPosts`
    - `selectFilteredPosts`: filtrar localmente por nombre
    - `selectPostsStatus`
    - `selectPostsError`

### 4.2 Implementar Lógica de Filtrado Local
- [ ] En el selector `selectFilteredPosts`, filtrar posts por nombre usando el filtro del estado
- [ ] Asegurar que el filtro sea case-insensitive

---

## Fase 5: Componentes UI

### 5.1 Componentes de Utilidad
- [ ] **LoadingSpinner.tsx**: spinner simple con Tailwind
  ```tsx
  // Clase sugerida: animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600
  ```
- [ ] **ErrorMessage.tsx**: alerta roja para errores
  ```tsx
  // bg-red-100 text-red-700 p-3 rounded-md
  ```
- [ ] **ConfirmDialog.tsx**: modal de confirmación para eliminar
  - Props: `isOpen`, `onConfirm`, `onCancel`, `message`
  - Usar portal y overlay con backdrop

### 5.2 Componente FilterHeader
- [ ] Crear `src/features/posts/components/FilterHeader.tsx`:
  - Input de texto para filtro por nombre
  - Botón "Buscar" (opcional, puede ser filtrado en tiempo real)
  - Estilos: `flex gap-2 items-center p-4 bg-gray-50`
  - Conectar con Redux: dispatch `setFilter` action

### 5.3 Componente PostForm
- [ ] Crear `src/features/posts/components/PostForm.tsx`:
  - Dos inputs: `name` (requerido) y `description` (opcional)
  - Validación: nombre no vacío
  - Botón "Crear" que dispatcha `createPost` thunk
  - Limpiar formulario después de crear
  - Mostrar loading state durante creación
  - Layout: `flex gap-3 p-4` con inputs `w-full`
  - Estilos de input: `border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400`
  - Botón: `px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700`

### 5.4 Componente PostRow
- [ ] Crear `src/features/posts/components/PostRow.tsx`:
  - Props: `post`, `onDelete`
  - Renderizar: `<td>` para nombre, descripción y acción
  - Botón "Eliminar" (rojo): dispatcha acción de eliminar
  - Hover effect: `hover:bg-gray-50`

### 5.5 Componente PostsTable
- [ ] Crear `src/features/posts/components/PostsTable.tsx`:
  - Tabla HTML semántica: `<table>`, `<thead>`, `<tbody>`
  - Columnas: Nombre | Descripción | Acción
  - Mapear array de posts filtrados
  - Renderizar `PostRow` para cada post
  - Estilos: `w-full table-auto border-collapse`
  - Responsivo: en móvil usar `overflow-x-auto` o convertir a tarjetas

### 5.6 Componente PostsList (Principal)
- [ ] Crear `src/features/posts/components/PostsList.tsx`:
  - Componente contenedor principal
  - Layout:
    1. `FilterHeader` (superior)
    2. `PostsTable` (centro)
    3. `PostForm` (inferior)
  - **useEffect**: dispatch `fetchPosts` SOLO una vez al montar
  - Manejar estados:
    - Loading: mostrar `LoadingSpinner`
    - Error: mostrar `ErrorMessage`
    - Success: mostrar tabla y formulario
  - Conectar con selectors de Redux
  - Container: `max-w-4xl mx-auto px-4 py-6`

---

## Fase 6: Integración y Lógica de Negocio

### 6.1 Implementar Flujo de Crear Post
- [ ] Usuario llena formulario (nombre + descripción)
- [ ] Al hacer clic en "Crear":
  - Validar que nombre no esté vacío
  - Dispatch `createPost` thunk
  - Backend crea el post y retorna el objeto creado
  - Agregar post al estado de Redux
  - Limpiar formulario
  - Mostrar mensaje de éxito (opcional)

### 6.2 Implementar Flujo de Eliminar Post
- [ ] Usuario hace clic en botón "Eliminar" de una fila
- [ ] Abrir `ConfirmDialog` para confirmar
- [ ] Si confirma:
  - Dispatch `deletePost` thunk con id del post
  - Backend elimina y retorna el post eliminado
  - Remover post del estado de Redux
  - Cerrar modal

### 6.3 Implementar Filtrado Local
- [ ] Usuario escribe en input de filtro
- [ ] Dispatch `setFilter` action (debounce opcional de 300ms)
- [ ] Selector `selectFilteredPosts` filtra posts localmente por nombre
- [ ] Tabla se actualiza automáticamente con posts filtrados
- [ ] **NO llamar al backend** - filtrado 100% local

### 6.4 Cargar Posts Iniciales
- [ ] En `PostsList`, useEffect con dependencias vacías `[]`
- [ ] Dispatch `fetchPosts()` UNA SOLA VEZ
- [ ] Guardar todos los posts en Redux state
- [ ] Todos los filtrados posteriores son locales

---

## Fase 7: Responsividad y Accesibilidad

### 7.1 Diseño Responsivo
- [ ] **Mobile (< 640px)**:
  - Tabla con scroll horizontal (`overflow-x-auto`) O
  - Convertir filas en tarjetas verticales con `grid`
  - Formulario: inputs `w-full`, stacked verticalmente
  - Botones `w-full` en móvil
  
- [ ] **Tablet/Desktop (>= 768px)**:
  - Tabla con columnas visibles
  - Formulario: inputs inline con `flex-row`
  - Botón "Crear" al final del row

- [ ] Probar en diferentes tamaños con DevTools

### 7.2 Accesibilidad (a11y)
- [ ] Todos los inputs tienen `<label>` asociado con `htmlFor`
- [ ] Botones tienen texto descriptivo o `aria-label`
- [ ] Tabla usa `<caption>` para descripción
- [ ] Modal de confirmación tiene `role="dialog"` y `aria-modal="true"`
- [ ] Focus visible en inputs y botones (`:focus` con ring)
- [ ] Navegación por teclado funcional (Tab, Enter, Escape)
- [ ] Contraste de colores >= AA (WCAG 2.1)

---

## Fase 8: Testing (Opcional pero Recomendado)

### 8.1 Tests Unitarios
- [ ] Instalar Vitest y React Testing Library:
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom
  ```
- [ ] Testear `postsSlice`:
  - Reducers síncronos (setFilter)
  - ExtraReducers (estados de thunks)
- [ ] Testear componentes:
  - `PostForm`: validación, submit
  - `FilterHeader`: dispatch de filter
  - `PostRow`: llamada a onDelete

### 8.2 Tests E2E (Opcional)
- [ ] Instalar Playwright o Cypress
- [ ] Testear flujo completo:
  1. Cargar página → ver lista de posts
  2. Crear nuevo post → verificar en tabla
  3. Filtrar por nombre → verificar resultados
  4. Eliminar post → confirmar eliminación

---

## Fase 9: Optimizaciones y Mejoras

### 9.1 Performance
- [ ] Implementar debounce en filtro de búsqueda (usar `lodash.debounce` o custom hook)
- [ ] Memoizar componentes pesados con `React.memo` si es necesario
- [ ] Lazy loading de componentes grandes con `React.lazy`

### 9.2 UX Improvements
- [ ] Agregar toasts/notifications para feedback de acciones (crear, eliminar)
- [ ] Animaciones suaves con Tailwind transitions
- [ ] Empty state cuando no hay posts: "No hay posts aún"
- [ ] Skeleton loaders en lugar de spinner simple

### 9.3 Error Handling Robusto
- [ ] Manejar errores de red (timeout, 500, etc.)
- [ ] Mostrar mensajes de error específicos al usuario
- [ ] Retry automático en caso de fallo (opcional)
- [ ] Log de errores en consola para debugging

---

## Fase 10: Documentación

### 10.1 Crear README.md
- [ ] Incluir secciones:
  - **Descripción del proyecto**
  - **Tecnologías utilizadas**
  - **Requisitos previos** (Node.js, npm)
  - **Instalación**: `npm install`
  - **Configuración**: crear `.env` con `VITE_API_URL`
  - **Desarrollo**: `npm run dev`
  - **Build**: `npm run build`
  - **Testing**: `npm run test` (si aplica)
  - **Estructura de carpetas**
  - **API Endpoints** (referencia al backend)
  - **Decisiones técnicas**

### 10.2 Comentarios en Código
- [ ] Documentar funciones complejas con JSDoc
- [ ] Comentar thunks de Redux explicando el flujo
- [ ] Agregar TODOs para mejoras futuras

---

## Checklist Final Pre-Entrega

### Funcionalidad
- [ ] Listar posts (carga inicial una sola vez)
- [ ] Crear post (formulario funcional)
- [ ]  Eliminar post (con confirmación)
- [ ]  Filtrar posts por nombre (localmente, sin llamar API)
- [ ]  Manejo de estados: loading, error, success

### Código
- [ ]  Convención camelCase en JavaScript/TypeScript
- [ ]  Nombres descriptivos de variables y funciones
- [ ]  Código limpio sin console.logs de debug
- [ ]  No hay warnings en consola
- [ ]  TypeScript sin errores (si aplica)
- [ ]  ESLint pasa sin errores

### UI/UX
- [ ]  Diseño limpio tipo wireframe (blanco/negro/grises)
- [ ]  Responsivo: funciona en mobile, tablet y desktop
- [ ]  Accesibilidad: labels, navegación por teclado, contraste
- [ ]  Feedback visual: loading, errores, confirmaciones

### Integración Backend
- [ ]  Variable de entorno configurada (`VITE_API_URL`)
- [ ]  Endpoints correctos: GET /api/posts, POST /api/posts, DELETE /api/posts/:id
- [ ]  Manejo de errores HTTP (400, 404, 500)

### Documentación
- [ ]  README.md completo con instrucciones claras
- [ ]  .env.example incluido
- [ ]  Código comentado donde sea necesario

---

## Orden Recomendado de Implementación

1. **Setup inicial** → Instalar dependencias y configurar Tailwind
2. **Redux** → Crear store, slice, thunks y API client
3. **Componentes base** → LoadingSpinner, ErrorMessage, ConfirmDialog
4. **Componentes de posts** → PostForm, PostRow, PostsTable, FilterHeader
5. **PostsList** → Integrar todo y agregar lógica de carga inicial
6. **Estilos** → Pulir diseño con Tailwind, hacer responsivo
7. **Testing** → Escribir tests para funcionalidad crítica
8. **Documentación** → README.md detallado

---

## Estimación de Tiempo

| Fase | Tiempo Estimado |
|------|----------------|
| Setup inicial y configuración | 30 min |
| Redux (slice, thunks, API) | 1-2 horas |
| Componentes UI | 2-3 horas |
| Integración y lógica | 1-2 horas |
| Responsividad y a11y | 1 hora |
| Testing | 1-2 horas (opcional) |
| Documentación | 30 min |
| **TOTAL** | **6-10 horas** |

---

## Problemas Comunes y Soluciones

### 1. CORS Error al conectar con backend
**Solución**: Configurar CORS en el backend Node.js:
```javascript
app.use(cors({ origin: 'http://localhost:5173' }));
```

### 2. Filtro no funciona
**Solución**: Verificar que `selectFilteredPosts` compare strings en lowercase:
```typescript
posts.filter(post => post.name.toLowerCase().includes(filter.toLowerCase()))
```

### 3. Posts no se actualizan después de crear
**Solución**: Verificar que el reducer `fulfilled` del thunk `createPost` agregue el post:
```typescript
.addCase(createPost.fulfilled, (state, action) => {
  state.items.push(action.payload);
})
```

### 4. Tailwind no aplica estilos
**Solución**: Verificar que el archivo CSS está importado en `main.tsx` y que el `content` de `tailwind.config.js` incluye todas las rutas correctas.

---

## Recursos de Referencia

- **Redux Toolkit**: https://redux-toolkit.js.org/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev/
- **React Testing Library**: https://testing-library.com/react
- **Axios**: https://axios-http.com/

---
