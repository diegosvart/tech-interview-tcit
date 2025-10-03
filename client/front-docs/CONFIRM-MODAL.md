# Modal de Confirmación Personalizado

## Descripción

Componente `ConfirmModal` diseñado con estilo minimalista y animaciones suaves para reemplazar el `window.confirm()` nativo del navegador.

## Características

### Diseño
- Overlay con fondo semitransparente (rgba(0, 0, 0, 0.5))
- Card centrado con border-radius, sombra y borde
- Tipografía consistente con el resto del sitio
- Variables CSS para mantener coherencia visual

### Animaciones
1. **Overlay**: FadeIn (0.2s)
   - Aparición suave del fondo oscuro
   
2. **Modal**: SlideUp + Scale (0.3s)
   - Deslizamiento desde abajo (translateY: 30px → 0)
   - Efecto de zoom sutil (scale: 0.95 → 1)
   - Combina movimiento y escala para mayor dinamismo

### Funcionalidades

#### Accesibilidad
- **Tecla ESC**: Cierra el modal (equivalente a cancelar)
- **Click fuera del modal**: Cierra el modal
- **Prevención de scroll**: El body no hace scroll mientras el modal está abierto

#### Props Interface
```typescript
interface ConfirmModalProps {
  isOpen: boolean;              // Controla visibilidad
  title: string;                // Título del modal
  message: string;              // Mensaje descriptivo
  confirmText?: string;         // Texto botón confirmar (default: "Confirmar")
  cancelText?: string;          // Texto botón cancelar (default: "Cancelar")
  onConfirm: () => void;        // Callback al confirmar
  onCancel: () => void;         // Callback al cancelar
  isDangerous?: boolean;        // Estilo peligroso (rojo) para el botón confirmar
}
```

#### Estados de Botones
- **Normal**: Azul primario (#007bff)
- **Peligroso**: Rojo (#dc3545) - usado para acciones destructivas como eliminar
- **Hover**: Cambio de color + box-shadow
- **Active**: TranslateY(1px) - simula presión del botón

## Uso

### Ejemplo Básico
```tsx
const [modalOpen, setModalOpen] = useState(false);

<ConfirmModal
  isOpen={modalOpen}
  title="Confirmar acción"
  message="¿Está seguro de realizar esta acción?"
  onConfirm={() => {
    // Ejecutar acción
    setModalOpen(false);
  }}
  onCancel={() => setModalOpen(false)}
/>
```

### Ejemplo con Eliminación (Actual)
```tsx
const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [postToDelete, setPostToDelete] = useState<string | null>(null);

// Abrir modal
const handleDelete = (id: string) => {
  setPostToDelete(id);
  setDeleteModalOpen(true);
};

// Confirmar eliminación
const confirmDelete = async () => {
  if (!postToDelete) return;
  
  try {
    await deletePost(postToDelete).unwrap();
    setDeleteModalOpen(false);
    setPostToDelete(null);
  } catch (error) {
    // Manejo de errores
  }
};

// Cancelar
const cancelDelete = () => {
  setDeleteModalOpen(false);
  setPostToDelete(null);
};

// Renderizar
<ConfirmModal
  isOpen={deleteModalOpen}
  title="Eliminar Post"
  message="¿Está seguro de que desea eliminar este post? Esta acción no se puede deshacer."
  confirmText="Eliminar"
  cancelText="Cancelar"
  onConfirm={confirmDelete}
  onCancel={cancelDelete}
  isDangerous={true}  // Botón rojo
/>
```

## Estructura HTML

```html
<div class="modal-overlay">           <!-- Fondo oscuro -->
  <div class="modal-content">         <!-- Card del modal -->
    <div class="modal-header">        <!-- Encabezado con título -->
      <h3 class="modal-title">...</h3>
    </div>
    
    <div class="modal-body">          <!-- Cuerpo con mensaje -->
      <p class="modal-message">...</p>
    </div>
    
    <div class="modal-footer">        <!-- Footer con botones -->
      <button class="btn-modal btn-cancel">Cancelar</button>
      <button class="btn-modal btn-confirm">Confirmar</button>
    </div>
  </div>
</div>
```

## Clases CSS

### Layout
- `.modal-overlay`: Posicionamiento fixed, flex centrado, z-index 1000
- `.modal-content`: Width 90%, max-width 450px, background con borde

### Secciones
- `.modal-header`: Padding lg, border-bottom
- `.modal-body`: Padding lg
- `.modal-footer`: Padding md, border-top, flex con gap

### Botones
- `.btn-modal`: Estilos base (padding, font, border, transition)
- `.btn-cancel`: Fondo blanco, hover con primary border
- `.btn-confirm`: Fondo azul, hover con sombra
- `.btn-danger`: Fondo rojo para acciones destructivas

### Animaciones
```css
@keyframes fadeInOverlay {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```
