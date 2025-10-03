# Frontend - Tech Test TCIT

## Resumen Ejecutivo

Aplicación web de gestión de posts (CRUD completo) desarrollada como prueba técnica para el puesto de **Senior Software Engineer**. La aplicación permite crear, listar, editar y eliminar posts con paginación, filtrado y validaciones completas.

**Estado**: Implementación completa y funcional

---

## Objetivo del Proyecto

Desarrollar una interfaz moderna y minimalista que permita la gestión eficiente de posts, integrándose con una API REST backend y ofreciendo una experiencia de usuario fluida con edición inline y confirmaciones modales.

---

## Tecnologías Utilizadas

### **Stack Principal**

| Tecnología | Versión | Justificación |
|------------|---------|---------------|
| **React** | 18.3.1 | Framework UI líder, virtual DOM eficiente, gran ecosistema |
| **TypeScript** | 5.6.2 | Type safety, mejor DX, detección temprana de errores |
| **Redux Toolkit** | 2.3.0 | Manejo de estado predecible, menos boilerplate que Redux tradicional |
| **RTK Query** | incluido | Data fetching con caché automático, invalidación inteligente |
| **Vite** | 5.4.20 | Build tool rápido, HMR instantáneo, mejor que CRA |

### **Librerías y Herramientas**

- **React Router DOM** v7: Navegación declarativa (preparado para expansión)
- **CSS Vanilla**: Variables CSS, sin dependencias extra (minimalismo)
- **ESLint + TypeScript**: Linting y análisis estático de código

### **Justificación del Stack**

**React + TypeScript**: Estándar de la industria, alta demanda, tipado seguro  
**Redux Toolkit + RTK Query**: Elimina complejidad, caché automático, optimistic updates  
**Vite**: Build 10-100x más rápido que Webpack, mejor experiencia de desarrollo  
**CSS Variables**: Diseño consistente sin peso de librerías (Tailwind/MUI), mantenible  

---

## Funcionalidades Implementadas

### **CRUD Completo**
- Crear posts con validación (nombre 3-200 chars, descripción opcional max 500)
- Listar posts con paginación (5, 10, 20, 50 registros por página)
- Editar posts inline con modal de confirmación
- Eliminar posts con modal de confirmación personalizado

### **UX Avanzada**
- Edición inline (sin navegación a otra página)
- Modales de confirmación con animaciones suaves (fadeIn, slideUp)
- Mensajes de éxito/error con auto-hide (3 segundos)
- Hover states con colores semánticos (verde/amarillo/rojo/negro)
- Loading states durante operaciones async

### **Validaciones**
- Validación frontend (min/max caracteres, campos requeridos)
- Mensajes de error inline con estilos diferenciados
- Prevención de guardados sin cambios

### **Performance**
- Caché automático con RTK Query (no re-fetch innecesarios)
- Invalidación inteligente de tags después de mutaciones
- Paginación eficiente (solo carga datos necesarios)

---

## Estructura del Proyecto

```
client/
├── src/
│   ├── features/posts/        # Feature modular de Posts
│   │   ├── posts.api.ts       # RTK Query endpoints y tipos
│   │   ├── PostsList.tsx      # Contenedor principal
│   │   ├── PostsTable.tsx     # Tabla de posts
│   │   ├── PostsTableRow.tsx  # Fila con edición inline
│   │   ├── PostFormInline.tsx # Formulario de creación
│   │   ├── FilterHeader.tsx   # Filtro + paginación
│   │   ├── ConfirmModal.tsx   # Modal de confirmación
│   │   └── index.ts           # Barrel export
│   ├── styles/
│   │   └── posts.css          # Estilos CSS variables (843 líneas)
│   ├── store.ts               # Redux store
│   ├── App.tsx                # Routing principal
│   └── main.tsx               # Entry point
├── front-docs/                # Documentación técnica
│   ├── README.md              # Este archivo
│   ├── QUICK-START.md         # Guía de inicio rápido
│   ├── VITE.md                # Documentación de Vite
│   ├── REDUX-IMPLEMENTATION.md # Implementación de Redux
│   ├── BACKEND-INTEGRATION.md # Integración con API
│   ├── CONFIRM-MODAL.md       # Modal de confirmación
│   ├── EDIT-INLINE.md         # Edición inline
│   └── SUCCESS-MODAL.md       # Modal de éxito
└── vite.config.ts             # Configuración Vite
```

---

## Integración con Backend

### **Endpoints Utilizados**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/posts?page=1&pageSize=10` | Listar posts paginados |
| POST | `/api/v1/posts` | Crear post |
| PUT | `/api/v1/posts/:id` | Actualizar post |
| DELETE | `/api/v1/posts/:id` | Eliminar post |

### **Respuesta Esperada (GET /posts)**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "createdAt": "ISO string",
      "updatedAt": "ISO string"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 57,
    "hasNextPage": true
  }
}
```

---

## Notas Técnicas

### **Decisiones de Diseño**

1. **RTK Query vs React Query**: Se eligió RTK Query por integración nativa con Redux Toolkit
2. **CSS Variables vs Tailwind**: CSS Variables para control total sin peso de librería
3. **Inline Edit vs Modal Edit**: Inline para mejor UX (menos clicks)
4. **Modal Confirmations**: Para prevenir errores de usuario (especialmente en delete)

### **Limitaciones Conocidas**

- Sin tests automatizados (por tiempo)
- Sin manejo de roles/permisos (fuera de scope)
- Sin internacionalización (solo español)
- Paginación básica (no hay search en backend)

---

## Documentación Disponible

### Guías de Inicio
- **[QUICK-START.md](./QUICK-START.md)** - Instalación, configuración y comandos básicos
- **[VITE.md](./VITE.md)** - Build tool, configuración y optimizaciones

### Arquitectura y Patrones
- **[REDUX-IMPLEMENTATION.md](./REDUX-IMPLEMENTATION.md)** - RTK Query, store y data fetching
- **[BACKEND-INTEGRATION.md](./BACKEND-INTEGRATION.md)** - API endpoints y contratos

### Componentes
- **[CONFIRM-MODAL.md](./CONFIRM-MODAL.md)** - Modal de confirmación personalizado
- **[SUCCESS-MODAL.md](./SUCCESS-MODAL.md)** - Modal de éxito con auto-cierre
- **[EDIT-INLINE.md](./EDIT-INLINE.md)** - Edición inline de registros
