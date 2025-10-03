# Quick Start Guide

## Requisitos Mínimos

### Software Requerido

| Herramienta | Versión Mínima | Versión Recomendada |
|-------------|----------------|---------------------|
| **Node.js** | 18.0.0 | 20.x LTS |
| **npm** | 9.0.0 | 10.x |
| **Backend API** | - | Debe estar corriendo en puerto 3000 |

### Verificar Instalaciones

```bash
node --version
npm --version
```

---

## Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd tech-test-tcit/client
```

### 2. Instalar Dependencias

```bash
npm install
```

Este comando instalará todas las dependencias listadas en `package.json`:
- React 18.3.1
- TypeScript 5.6.2
- Redux Toolkit 2.3.0
- Vite 5.4.20
- React Router DOM 7.0.2

**Tiempo estimado**: 1-2 minutos (dependiendo de la conexión)

---

## Configuración

### Configuración del Backend

El frontend espera que el backend esté corriendo en:

```
http://localhost:3000/api/v1
```

#### Si el backend usa un puerto diferente:

Editar `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // <- Cambiar puerto aquí
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

### Variables de Entorno (Opcional)

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=/api/v1
VITE_PORT=5173
```

**Nota**: Vite solo reconoce variables que empiezan con `VITE_`

---

## Comandos de Desarrollo

### Iniciar Servidor de Desarrollo

```bash
npm run dev
```

**Resultado:**
- Servidor disponible en: `http://localhost:5173`
- Hot Module Replacement (HMR) activado
- TypeScript type checking en consola

**Características del servidor de desarrollo:**
- Recarga automática al guardar cambios
- Errores mostrados en navegador y terminal
- Proxy configurado a `/api` -> `http://localhost:3000`

### Compilar TypeScript

```bash
npm run build
```

**Proceso:**
1. TypeScript compila archivos `.tsx` -> `.js`
2. Vite optimiza y minifica código
3. Genera bundle en carpeta `/dist`
4. Copia archivos estáticos (index.html, favicon, etc.)

**Salida:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
```

### Previsualizar Build de Producción

```bash
npm run preview
```

**Resultado:**
- Servidor local en puerto 4173
- Sirve archivos de `/dist`
- Simula entorno de producción

### Linting

```bash
npm run lint
```

Ejecuta ESLint para verificar:
- Errores de sintaxis
- Problemas de estilo
- Reglas de TypeScript
- Best practices de React

---

## Verificación de Instalación

### Checklist de Verificación

1. **Dependencias instaladas**
   ```bash
   ls node_modules
   # Debe mostrar carpetas de dependencias
   ```

2. **Backend corriendo**
   ```bash
   curl http://localhost:3000/api/v1/posts
   # Debe retornar JSON con posts
   ```

3. **Frontend corriendo**
   - Abrir `http://localhost:5173`
   - Debe mostrar interfaz de posts
   - Sin errores en consola del navegador

### Solución de Problemas Comunes

#### Error: "EADDRINUSE: address already in use"

**Problema**: Puerto 5173 ya está en uso

**Solución 1**: Vite intentará usar puerto 5174, 5175, etc.

**Solución 2**: Cambiar puerto en `vite.config.ts`:
```typescript
server: {
  port: 3001,  // Usar puerto diferente
}
```

#### Error: "Failed to fetch posts"

**Problema**: Backend no está corriendo o puerto incorrecto

**Solución**:
1. Verificar backend: `curl http://localhost:3000/api/v1/posts`
2. Verificar proxy en `vite.config.ts`
3. Revisar consola del navegador (F12) para ver error específico

#### Error: "Cannot find module"

**Problema**: Dependencias no instaladas correctamente

**Solución**:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Estructura de Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| **Frontend Dev** | 5173 | http://localhost:5173 |
| **Backend API** | 3000 | http://localhost:3000/api/v1 |
| **Preview Build** | 4173 | http://localhost:4173 |

---

## Próximos Pasos

Una vez que el servidor de desarrollo esté corriendo:

1. Acceder a `http://localhost:5173`
2. Verificar que se cargue la lista de posts
3. Probar crear un nuevo post
4. Probar editar un post existente
5. Probar eliminar un post

Para más información sobre la arquitectura y componentes, ver:
- `README.md` - Documentación general
- `REDUX-IMPLEMENTATION.md` - Implementación de Redux
- `BACKEND-INTEGRATION.md` - Integración con API

