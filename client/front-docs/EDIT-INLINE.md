# Edición Inline de Posts

## Descripción

Funcionalidad de edición inline implementada en la tabla de posts. Permite editar el nombre y descripción de un post directamente desde la fila, sin necesidad de modales o páginas separadas.

## Arquitectura

### Componentes

#### 1. **PostsTableRow.tsx** (Nuevo)
Componente individual para cada fila de la tabla con capacidad de edición.

**Estado Local:**
```typescript
const [isEditing, setIsEditing] = useState(false);        // Modo edición activo
const [name, setName] = useState(post.name);              // Valor temporal del nombre
const [description, setDescription] = useState('');        // Valor temporal de descripción
const [error, setError] = useState('');                    // Mensaje de error
const [isUpdating, setIsUpdating] = useState(false);      // Loading durante guardado
```

**Props:**
```typescript
interface PostsTableRowProps {
  post: Post;                                              // Post a mostrar/editar
  onDelete: (id: string) => void;                          // Callback eliminar
  onUpdate: (id: string, name: string, description: string) => Promise<void>;
}
```

#### 2. **PostsTable.tsx** (Modificado)
Ahora usa `PostsTableRow` para renderizar cada fila.

```typescript
<tbody>
  {posts.map((post) => (
    <PostsTableRow
      key={post.id}
      post={post}
      onDelete={onDelete || (() => {})}
      onUpdate={onUpdate || (async () => {})}
    />
  ))}
</tbody>
```

#### 3. **PostsList.tsx** (Modificado)
Integra la mutation `useUpdatePostMutation` y el handler.

```typescript
const [updatePost] = useUpdatePostMutation();

const handleUpdate = async (id: string, name: string, description: string): Promise<void> => {
  await updatePost({ 
    id, 
    data: { name, description: description || undefined } 
  }).unwrap();
};
```

---

## Flujo de Uso

### 1. **Modo Vista (Normal)**
```
┌──────────────┬──────────────────┬─────────────────┐
│ Post Name    │ Description      │ [Editar] [❌]   │
└──────────────┴──────────────────┴─────────────────┘
```

### 2. **Hacer Click en "Editar"**
- La fila cambia a modo edición
- Los textos se convierten en inputs
- Aparecen botones "Guardar" y "Cancelar"
- Background de la fila cambia (hover-bg)
- Autofocus en el input de nombre

### 3. **Modo Edición**
```
┌──────────────────────────────────┬──────────────────────────┬────────────────────┐
│ [input: nombre...............]   │ [input: descripción....] │ [Guardar] [Cancelar]│
└──────────────────────────────────┴──────────────────────────┴────────────────────┘
```

### 4. **Acciones Posibles**

#### a) **Guardar Cambios**
1. Validar inputs (nombre 3-200 chars, descripción max 500)
2. Si hay error → Mostrar mensaje debajo del input
3. Si no hay cambios → Cerrar modo edición
4. Si hay cambios → Llamar `onUpdate` con mutation
5. Éxito → Cerrar modo edición
6. Error → Mostrar mensaje de error

#### b) **Cancelar**
1. Restaurar valores originales del post
2. Limpiar errores
3. Cerrar modo edición

---

## Validaciones

### Nombre
-  **Requerido**: No puede estar vacío
-  **Mínimo 3 caracteres**: Después de trim()
-  **Máximo 200 caracteres**: Límite del backend
-  **maxLength HTML**: 200 en el input

### Descripción
-  **Opcional**: Puede estar vacía
-  **Máximo 500 caracteres**: Límite frontend
- **maxLength HTML**: 500 en el input

### Lógica de Validación
```typescript
const trimmedName = name.trim();

if (!trimmedName) {
  setError('El nombre es requerido');
  return;
}

if (trimmedName.length < 3) {
  setError('El nombre debe tener al menos 3 caracteres');
  return;
}

if (trimmedName.length > 200) {
  setError('El nombre no puede tener más de 200 caracteres');
  return;
}

if (description.length > 500) {
  setError('La descripción no puede tener más de 500 caracteres');
  return;
}
```

---

## Estilos CSS

### Fila en Modo Edición
```css
.row-editing {
  background: var(--color-hover-bg);  /* Destaca visualmente */
}
```

### Inputs Inline
```css
.input-inline {
  width: 100%;
  padding: var(--spacing-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
}

.input-inline:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);  /* Ring azul */
}

.input-inline.input-error {
  border-color: var(--color-danger);  /* Rojo en error */
}
```

### Mensajes de Error
```css
.error-text-inline {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-danger);
  margin-top: var(--spacing-xs);
}
```

### Botones de Acción
```css
.btn-group-inline {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: flex-end;
}

.btn-edit {
  /* Estilo neutro con border */
  background: var(--color-bg);
  border: 1px solid var(--color-border);
}

.btn-save {
  /* Botón primario azul */
  background: var(--color-primary);
  color: white;
}

.btn-cancel-inline {
  /* Botón secundario gris */
  background: var(--color-bg);
  border: 1px solid var(--color-border);
}
```

---

## Estados del Botón Guardar

### Normal
```html
<button className="btn-save">Guardar</button>
```

### Loading (Guardando)
```html
<button className="btn-save" disabled>Guardando...</button>
```

### Deshabilitado
- Opacity: 0.6
- Cursor: not-allowed
- Sin hover effects

---

## Cache Management (RTK Query)

### Mutation Update
```typescript
updatePost: builder.mutation<Post, { id: string; data: UpdatePostInput }>({
  query: ({ id, data }) => ({ 
    url: `/posts/${id}`, 
    method: 'PUT', 
    body: data 
  }),
  invalidatesTags: (_res, _err, { id }) => [
    { type: 'Posts', id },        // Invalida el post específico
    { type: 'Posts', id: 'LIST' }, // Invalida la lista completa
  ],
})
```

**Efecto:**
1. Al guardar cambios, RTK Query invalida tags
2. Se dispara re-fetch automático de la lista
3. La UI se actualiza con los nuevos datos del backend
4. No es necesario actualizar estado local manualmente

---

## Optimizaciones

### 1. **Prevenir Guardados Innecesarios**
```typescript
// Si no hay cambios, solo cerrar modo edición
if (trimmedName === post.name && description.trim() === (post.description || '')) {
  setIsEditing(false);
  return;
}
```

### 2. **AutoFocus en Input**
```tsx
<input
  type="text"
  className="input-inline"
  autoFocus  // Focus automático al entrar en modo edición
/>
```

### 3. **Estados de Loading**
- `isUpdating` → Deshabilita inputs y botones durante guardado
- Texto del botón cambia a "Guardando..."
- Previene doble submit

---

## Ejemplos de Uso

### Caso 1: Editar Solo el Nombre
```
1. Click "Editar"
2. Cambiar nombre: "Post 1" → "Post Actualizado"
3. Click "Guardar"
4. Se actualiza solo el nombre, descripción queda igual
```

### Caso 2: Editar Solo la Descripción
```
1. Click "Editar"
2. Cambiar descripción: "Old desc" → "New description"
3. Click "Guardar"
4. Se actualiza solo la descripción
```

### Caso 3: Eliminar Descripción
```
1. Click "Editar"
2. Borrar contenido de descripción (dejar vacío)
3. Click "Guardar"
4. Backend recibe description: undefined
```

### Caso 4: Validación Fallida
```
1. Click "Editar"
2. Nombre: "AB" (solo 2 caracteres)
3. Click "Guardar"
4. Mensaje: "El nombre debe tener al menos 3 caracteres"
5. Input con borde rojo
```

### Caso 5: Cancelar Cambios
```
1. Click "Editar"
2. Cambiar nombre y descripción
3. Click "Cancelar"
4. Se restauran valores originales
5. Modo edición se cierra
```

---

## Mejoras Futuras

### UX
- [ ] Animación de transición entre vista/edición
- [ ] Tooltip explicativo en botón "Editar"
- [ ] Confirmación al cancelar si hay cambios sin guardar
- [ ] Mensaje de éxito después de guardar (similar a crear)

### Funcionalidad
- [ ] Atajos de teclado: Enter para guardar, Esc para cancelar
- [ ] Permitir editar múltiples filas simultáneamente
- [ ] Deshacer/Rehacer cambios (Ctrl+Z)

### Accesibilidad
- [ ] ARIA labels apropiados
- [ ] Focus management mejorado
- [ ] Screen reader announcements

---

**Creado**: 3 de octubre de 2025  
**Versión**: 1.0.0  
**Patrón**: Edición inline sin modales
