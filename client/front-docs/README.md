# Frontend - Tech Test TCIT

## 📋 Resumen Ejecutivo

Aplicación web de gestión de posts (CRUD completo) desarrollada como prueba técnica para el puesto de **Senior Software Engineer**. La aplicación permite crear, listar, editar y eliminar posts con paginación, filtrado y validaciones completas.

**Estado**: ✅ Implementación completa y funcional

---

## 🎯 Objetivo del Proyecto

Desarrollar una interfaz moderna y minimalista que permita la gestión eficiente de posts, integrándose con una API REST backend y ofreciendo una experiencia de usuario fluida con edición inline y confirmaciones modales.

---

## 🛠️ Tecnologías Utilizadas

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

✅ **React + TypeScript**: Estándar de la industria, alta demanda, tipado seguro  
✅ **Redux Toolkit + RTK Query**: Elimina complejidad, caché automático, optimistic updates  
✅ **Vite**: Build 10-100x más rápido que Webpack, mejor experiencia de desarrollo  
✅ **CSS Variables**: Diseño consistente sin peso de librerías (Tailwind/MUI), mantenible  

---

## 📦 Funcionalidades Implementadas

### ✅ **CRUD Completo**
- [x] Crear posts con validación (nombre 3-200 chars, descripción opcional max 500)
- [x] Listar posts con paginación (5, 10, 20, 50 registros por página)
- [x] Editar posts inline con modal de confirmación
- [x] Eliminar posts con modal de confirmación personalizado

### ✅ **UX Avanzada**
- [x] Edición inline (sin navegación a otra página)
- [x] Modales de confirmación con animaciones suaves (fadeIn, slideUp)
- [x] Mensajes de éxito/error con auto-hide (3 segundos)
- [x] Hover states con colores semánticos (verde/amarillo/rojo/negro)
- [x] Loading states durante operaciones async

### ✅ **Validaciones**
- [x] Validación frontend (min/max caracteres, campos requeridos)
- [x] Mensajes de error inline con estilos diferenciados
- [x] Prevención de guardados sin cambios

### ✅ **Performance**
- [x] Caché automático con RTK Query (no re-fetch innecesarios)
- [x] Invalidación inteligente de tags después de mutaciones
- [x] Paginación eficiente (solo carga datos necesarios)

---

## 🎨 Diseño y Estética

**Concepto**: Minimalista wireframe contemporáneo

- **Paleta de colores**:
  - Blanco (#ffffff) para fondos
  - Negro (#000000) para textos principales
  - Gris claro (#e0e0e0) para bordes
  - Colores semánticos para acciones:
    - 🟢 Verde (#28a745) para "Crear"
    - 🟡 Amarillo (#ffc107) para "Editar"
    - 🔴 Rojo (#dc3545) para "Eliminar"
    - ⚫ Negro (#000000) para "Buscar"

- **Hover states**: Celeste claro (#e3f2fd) en filas, colores semánticos en botones
- **Animaciones**: FadeIn (0.2s), SlideUp con scale (0.3s)
- **Tipografía**: System UI (nativa del SO para mejor legibilidad)

---

## 🚀 Pasos para Ejecutar

### 1. **Instalar Dependencias**
```bash
npm install
```

### 2. **Iniciar Servidor de Desarrollo**
```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:5174**

### 3. **Configuración del Backend**

Asegúrate de que el backend esté corriendo en:
```
http://localhost:3000/api/v1
```

Si el puerto es diferente, ajusta `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true
  }
}
```

### 4. **Build para Producción**
```bash
npm run build
```

Genera archivos optimizados en `/dist`

---

## 📁 Estructura del Proyecto

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
│   ├── BACKEND-INTEGRATION.md # Integración con API
│   ├── CONFIRM-MODAL.md       # Modal de confirmación
│   └── EDIT-INLINE.md         # Edición inline
└── vite.config.ts             # Configuración Vite
```

---

## 🔌 Integración con Backend

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

## 🎯 Próximos Pasos (Backlog)

### Funcionalidades Pendientes
- [ ] Tests unitarios (Jest + React Testing Library)
- [ ] Tests E2E (Playwright/Cypress)
- [ ] Infinite scroll como alternativa a paginación
- [ ] Búsqueda por nombre con debounce
- [ ] Ordenamiento por columnas (nombre, fecha)
- [ ] Bulk actions (eliminar múltiples)

### Mejoras Técnicas
- [ ] Implementar React Query como alternativa a RTK Query
- [ ] Agregar Storybook para documentar componentes
- [ ] PWA con service worker para offline support
- [ ] Optimistic updates en mutaciones
- [ ] Virtual scrolling para listas grandes

### UX/UI
- [ ] Dark mode
- [ ] Skeleton loaders
- [ ] Toast notifications (react-hot-toast)
- [ ] Drag & drop para reordenar
- [ ] Atajos de teclado (Ctrl+N para nuevo, Esc para cancelar)

---

## 📊 Métricas del Proyecto

- **Líneas de código**: ~1,500 (sin contar node_modules)
- **Componentes**: 7 componentes React
- **Archivos CSS**: 843 líneas (posts.css)
- **Tiempo de desarrollo**: ~6 horas
- **Cobertura de tests**: 0% (pendiente)

---

## 🤝 Contribución

Este es un proyecto de prueba técnica, pero está estructurado para escalar:

1. **Modular**: Feature folders (posts, users, etc.)
2. **Typed**: TypeScript en todo el código
3. **Documented**: Comentarios y documentación inline
4. **Consistent**: ESLint + Prettier configurados

---

## 📝 Notas Técnicas

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

**Desarrollado por**: Equipo Frontend  
**Fecha**: 3 de octubre de 2025  
**Versión**: 1.0.0
