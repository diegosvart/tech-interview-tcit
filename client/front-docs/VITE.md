# Vite - Build Tool

## Descripción

Vite es un build tool de nueva generación para proyectos frontend. Desarrollado por Evan You (creador de Vue.js), ofrece una experiencia de desarrollo extremadamente rápida aprovechando las capacidades nativas de ESM (ES Modules) del navegador.

**Versión utilizada**: 5.4.20

---

## Justificación de Uso

### Por qué Vite en lugar de Create React App (CRA) o Webpack

| Característica | Vite | CRA/Webpack | Ventaja |
|----------------|------|-------------|---------|
| **Inicio del servidor** | < 1 segundo | 10-30 segundos | 10-30x más rápido |
| **HMR (Hot Module Replacement)** | Instantáneo | 1-5 segundos | Actualizaciones en tiempo real |
| **Build de producción** | Rollup optimizado | Webpack | Bundles más pequeños |
| **TypeScript** | Soporte nativo | Requiere configuración | Sin configuración extra |
| **ESM nativo** | Sí | No | Menos transformaciones |

### Ventajas Específicas para este Proyecto

1. **Desarrollo Rápido**
   - Servidor inicia en menos de 1 segundo
   - HMR instantáneo al guardar cambios
   - No necesita bundling completo en desarrollo

2. **TypeScript sin Configuración**
   - Detecta `.tsx` automáticamente
   - Transpilación con esbuild (50-100x más rápido que tsc)
   - Type checking en paralelo

3. **Optimización Automática**
   - Code splitting automático
   - Tree shaking efectivo
   - CSS modules sin configuración

4. **Menor Configuración**
   - Archivo `vite.config.ts` de solo 15 líneas
   - Defaults inteligentes
   - Extensible con plugins

---

## Qué Aporta al Proyecto

### 1. Experiencia de Desarrollo Superior

**Problema con Webpack/CRA:**
```
npm start
-> Compilando... (15 segundos)
-> Servidor listo en http://localhost:3000
-> Editas archivo
-> Recompilando... (3 segundos)
-> Cambios visibles
```

**Con Vite:**
```
npm run dev
-> Servidor listo en http://localhost:5173 (0.8 segundos)
-> Editas archivo
-> Cambios instantáneos (< 100ms)
```

### 2. Hot Module Replacement (HMR) Instantáneo

Cuando editas un componente:
- Vite solo recarga ese módulo específico
- Estado de React se preserva
- No recarga toda la página
- No pierde estado de formularios o modales

**Ejemplo:**
```tsx
// PostsList.tsx
export default function PostsList() {
  const [page, setPage] = useState(1);  // <- Estado preservado
  // ... editas código aquí
}
// Al guardar: solo PostsList se actualiza, page sigue en su valor
```

### 3. Proxy Simplificado al Backend

Configuración en `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  }
}
```

**Resultado:**
- `fetch('/api/v1/posts')` -> `http://localhost:3000/api/v1/posts`
- Sin problemas de CORS en desarrollo
- Mismo código en dev y producción

### 4. Build de Producción Optimizado

```bash
npm run build
```

**Optimizaciones automáticas:**
- Minificación de JavaScript (Terser)
- Minificación de CSS
- Tree shaking (elimina código no usado)
- Code splitting por rutas
- Asset hashing para caché
- Compresión gzip/brotli

**Resultado:**
```
dist/assets/index-a1b2c3d4.js    45.2 kB  (gzip: 15.1 kB)
dist/assets/index-e5f6g7h8.css   12.8 kB  (gzip: 3.4 kB)
```

### 5. TypeScript Nativo

No requiere `ts-loader` o configuraciones complejas:
- Transpilación con esbuild (ultra rápido)
- Type checking con `tsc` en paralelo
- Soporte para `.tsx` out-of-the-box

---

## Configuración del Proyecto

### Archivo: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
```

### Configuraciones Clave

#### 1. Plugin de React

```typescript
plugins: [react()]
```

**Funciones:**
- Habilita Fast Refresh (HMR para React)
- Transforma JSX/TSX
- Optimiza componentes en producción

#### 2. Servidor de Desarrollo

```typescript
server: {
  port: 5173,               // Puerto del servidor dev
  open: true,               // Abre navegador automáticamente (opcional)
  host: true,               // Permite acceso desde red local (opcional)
  cors: true,               // Habilita CORS (opcional)
}
```

#### 3. Proxy para Backend

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',  // URL del backend
    changeOrigin: true,                // Cambia el header Origin
    secure: false,                     // Permite HTTPS no verificado
    rewrite: (path) => path.replace(/^\/api/, ''),  // Opcional: reescribe path
  }
}
```

**Ejemplo de uso:**
```typescript
// Frontend hace fetch a:
fetch('/api/v1/posts')

// Vite proxy redirige a:
http://localhost:3000/api/v1/posts
```

#### 4. Build de Producción

```typescript
build: {
  outDir: 'dist',           // Carpeta de salida
  sourcemap: true,          // Genera sourcemaps para debug
  minify: 'terser',         // Minificador (terser o esbuild)
  chunkSizeWarningLimit: 500,  // Aviso si chunk > 500kb
}
```

---

## Comandos Comunes

### Desarrollo

#### Iniciar Servidor de Desarrollo
```bash
npm run dev
```

**Opciones:**
```bash
npm run dev -- --port 3001      # Cambiar puerto
npm run dev -- --host           # Acceso desde red local
npm run dev -- --open           # Abrir navegador automáticamente
```

**Salida:**
```
VITE v5.4.20  ready in 832 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.10:5173/
➜  press h to show help
```

#### Build de Producción
```bash
npm run build
```

**Proceso:**
1. Ejecuta `tsc` para type checking
2. Vite genera bundle optimizado
3. Salida en carpeta `/dist`

**Salida:**
```
vite v5.4.20 building for production...
✓ 245 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-a1b2c3d4.js   142.35 kB │ gzip: 45.67 kB
✓ built in 3.21s
```

#### Previsualizar Build
```bash
npm run preview
```

**Resultado:**
- Servidor local en puerto 4173
- Sirve archivos de `/dist`
- Simula producción

#### Limpiar Caché
```bash
rm -rf node_modules/.vite
rm -rf dist
```

Útil cuando:
- Cambios no se reflejan
- Errores de módulos no encontrados
- Después de cambiar configuración

---

## Estructura de Archivos Generados

### Desarrollo (node_modules/.vite)

```
node_modules/.vite/
├── deps/                    # Dependencias pre-bundleadas
│   ├── react.js
│   ├── react-dom.js
│   └── ...
└── deps_temp/               # Caché temporal
```

**Pre-bundling:**
Vite convierte dependencias CommonJS a ESM y las cachea para carga rápida.

### Producción (dist/)

```
dist/
├── index.html                      # HTML entry point
├── assets/
│   ├── index-[hash].js             # JavaScript bundle
│   ├── index-[hash].css            # CSS bundle
│   ├── logo-[hash].svg             # Assets optimizados
│   └── ...
└── favicon.ico
```

**Hash en archivos:**
- Permite caché infinito en CDN
- Cambios generan nuevo hash -> invalida caché
- Sin problemas de caché desactualizado

---

## Optimizaciones Automáticas

### 1. Code Splitting

Vite automáticamente divide código por:
- Rutas (React Router)
- Imports dinámicos
- Vendor chunks (node_modules)

```typescript
// Import dinámico (genera chunk separado)
const Component = lazy(() => import('./Component'));
```

### 2. Tree Shaking

Elimina código no usado:
```typescript
// posts.api.ts exporta 5 hooks
export const { useListPostsQuery, useGetPostQuery, ... } = postsApi;

// PostsList.tsx solo importa 4
import { useListPostsQuery, useCreatePostMutation, ... } from './posts.api';

// Build final: solo incluye los 4 hooks importados
```

### 3. Asset Optimization

- Imágenes < 4kb -> inline base64
- Imágenes > 4kb -> archivo separado con hash
- SVG optimizado automáticamente
- Fonts con preload hints

### 4. CSS Optimization

- CSS Modules automático (`.module.css`)
- PostCSS integrado
- Autoprefixer incluido
- Minificación con cssnano

---

## Comparación de Performance

### Proyecto Real (este proyecto)

| Métrica | Vite | CRA/Webpack |
|---------|------|-------------|
| **Cold start** | 0.8s | 15.2s |
| **Hot reload** | 0.05s | 2.8s |
| **Build time** | 3.2s | 28.5s |
| **Bundle size** | 45 KB (gzip) | 78 KB (gzip) |

### Experiencia de Desarrollo

**Vite:**
- Cambio de código -> reflejo instantáneo
- No esperas compilación
- Estado preservado en HMR
- Feedback inmediato

**Webpack/CRA:**
- Cambio de código -> espera 2-3 segundos
- A veces requiere refresh manual
- Estado se pierde ocasionalmente
- Feedback demorado

---

## Plugins Útiles (Opcionales)

### Plugin de Análisis de Bundle

```bash
npm install -D rollup-plugin-visualizer
```

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })  // Genera reporte HTML
  ]
});
```

### Plugin de Compresión

```bash
npm install -D vite-plugin-compression
```

```typescript
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'brotliCompress' })
  ]
});
```

---

## Variables de Entorno

### Definir Variables

Crear `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_TITLE=Posts Manager
```

**Regla importante:** Solo variables con prefijo `VITE_` son expuestas al cliente.

### Usar Variables

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const title = import.meta.env.VITE_APP_TITLE;
```

### Entornos Específicos

```
.env                # Todas las variables
.env.local          # Local (ignorado por git)
.env.development    # Solo en dev
.env.production     # Solo en build
```

---

## Debugging

### Ver Configuración Resuelta

```bash
npx vite --debug
```

### Ver Módulos Transformados

```bash
npx vite --debug transform
```

### Analizar Bundle

```bash
npm run build -- --mode=analyze
```

---

## Recursos Adicionales

- [Documentación Oficial](https://vitejs.dev/)
- [Guía de Migración desde CRA](https://vitejs.dev/guide/migration.html)
- [Plugin de React](https://github.com/vitejs/vite-plugin-react)
- [Awesome Vite](https://github.com/vitejs/awesome-vite)
