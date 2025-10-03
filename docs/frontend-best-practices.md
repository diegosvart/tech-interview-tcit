# Buenas prácticas de frontend con React

Guía de recomendaciones para desarrollar el frontend de este proyecto usando React + TypeScript + Vite + Redux Toolkit/RTK Query. No son dogmas; prioriza claridad, simplicidad y consistencia.

## Principios
- Componentes pequeños, enfocados y compuestos (composition over inheritance).
- Colocation de código: sitúa archivos cerca de donde se usan (tests, estilos, hooks).
- Tipado estricto con TypeScript: contratos explícitos entre componentes.
- Server state vs UI state: usa RTK Query para datos remotos; usa React state/Context para UI local.
- Estados explícitos: loading, empty, success, error.
- Accesibilidad primero: semántica, foco, navegación por teclado.
- Observabilidad: mensajes claros en consola sólo para desarrollo; errores capturados y mostrados al usuario.

## Estructura y organización
- Por features (ej. `src/features/posts/*`) con re-export sutil vía `index.ts`.
- Archivos sugeridos por feature:
  - `Component.tsx` (UI)
  - `*.api.ts` (RTK Query endpoints)
  - `hooks.ts` (custom hooks del feature)
  - `types.ts` (tipos del dominio en el front cuando aplica)
  - `index.ts` (barrel opcional para re-export)
- Evita jerarquías profundas; prefiere directorios planos por feature.

## Componentes reutilizables
- Preferir componentes “headless” (lógica sin estilos) + wrappers estilizados.
- Uso de props compuestas y children para composición flexible.
- Mantén contratos claros en las props (nombres, opcionalidad, valores por defecto).

Ejemplo básico de componente reutilizable controlado:
```tsx
// components/TextField.tsx
import { InputHTMLAttributes } from 'react';

type TextFieldProps = {
  label: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function TextField({ label, error, id, ...props }: TextFieldProps) {
  const inputId = id ?? `tf-${Math.random().toString(36).slice(2)}`;
  return (
    <label htmlFor={inputId} style={{ display: 'grid', gap: 4 }}>
      <span>{label}</span>
      <input id={inputId} {...props} aria-invalid={!!error} aria-describedby={error ? `${inputId}-err` : undefined} />
      {error && (
        <span id={`${inputId}-err`} role="alert" style={{ color: 'crimson' }}>
          {error}
        </span>
      )}
    </label>
  );
}
```

## Hooks y estado
- Crea hooks para encapsular lógica (formateos, selecciones de cache, sincronización de URL, etc.).
- Usa Context con moderación; evita context “global único”. Prefiere RTK/RTKQ para server state.

Ejemplo: seleccionar datos de RTK Query evitando re-renders con `selectFromResult`:
```tsx
// features/posts/hooks.ts
import { useListPostsQuery } from './posts.api';

export function usePostsNames() {
  return useListPostsQuery(undefined, {
    selectFromResult: ({ data, isLoading, isError }) => ({
      names: data?.data?.map(p => p.name) ?? [],
      isLoading,
      isError,
    }),
  });
}
```

## RTK Query – patrones útiles
- Etiquetas y cache: usa `providesTags`/`invalidatesTags` (ya configurado en `posts.api.ts`).
- Revalidación:
  - `refetchOnFocus: true` y `refetchOnReconnect: true` si tu UX lo requiere.
  - `pollingInterval` para datos que deben “refrescar”.
- `keepUnusedDataFor` para controlar cuánto tiempo permanece la cache.
- Normaliza errores en un sitio (interceptor/baseQuery extendido) si necesitas manejo homogéneo.
- Para parámetros opcionales, pasa siempre un objeto (evita `void`), p.ej. `{ page, pageSize }`.

## Rendimiento
- Evita renders innecesarios:
  - Memoiza callbacks/valores pasados a hijos (`useCallback`, `useMemo`).
  - Usa `React.memo` en listas de ítems costosos.
  - No crees objetos/funciones inline si causan re-renders frecuentes.
- Listas grandes: usa virtualización (ej. `react-window`) cuando aplique.
- Code splitting:
  - `React.lazy` + `Suspense` para rutas/páginas.
- Claves (`key`) estables y únicas para listas (usa `id`, no índices).

Ejemplo item memoizado:
```tsx
import { memo } from 'react';
import type { Post } from './posts.api';

export const PostListItem = memo(function PostListItem({ post }: { post: Post }) {
  return (
    <li>
      <strong>{post.name}</strong>
      {post.description ? ` — ${post.description}` : ''}
    </li>
  );
});
```

## Accesibilidad (a11y)
- HTML semántico: usa `button`, `nav`, `section`, `header`, etc.
- Labels asociados a campos (`label` + `htmlFor`).
- Foco visible y navegable con teclado; evita “tab traps”.
- Roles/aria sólo cuando la semántica nativa no alcanza.
- Contraste suficiente y textos alternativos para imágenes.

## UX de estados y errores
- Loading: spinners o skeletons.
- Empty: mensajes claros sobre “no hay resultados”.
- Error: copy empático y acción de reintento.
- Bordes (edge cases): resultados vacíos, timeouts, offline, permisos.
- Considera un Error Boundary para errores de render.

## Formularios
- Controlados simples con `useState` pueden ser suficientes.
- Para formularios complejos considera `react-hook-form` + validación con Zod/Yup.
- Maneja estados `submitting`, `success`, `error` y deshabilita acciones cuando corresponda.

## Ruteo y navegación
- Rutas declarativas (`react-router-dom`).
- Code splitting por ruta (lazy) si el tamaño crece.
- Manejo de params de búsqueda: sincronizar `page`, `pageSize`, filtros.

## Estilos
- Opciones válidas: CSS Modules, Tailwind, Styled Components.
- Criterio: consistencia > preferencia. Evita mezclar múltiples sistemas sin razón.
- Coloca estilos junto al componente o en un `styles/` del feature.

## Tipado y linting
- `strict` en `tsconfig` (ya habilitado).
- Tipar props, retornos y valores derivados (evita `any`).
- Discriminated unions para variantes de UI.
- ESLint + Prettier (agregar reglas luego si es necesario).

## Seguridad
- Nunca interpolar HTML sin sanitizar (`dangerouslySetInnerHTML`).
- Escapar datos de usuario, valida en cliente/servidor.
- No expongas secretos en variables sin el prefijo `VITE_` y sólo si estrictamente necesario.

## Entorno y variables
- En Vite, las variables expuestas al cliente deben iniciar con `VITE_`.
- Usa `.env` y `.env.local` para valores locales; no subas secretos.
- En este proyecto usamos proxy en `vite.config.ts`, por lo que normalmente no necesitas `VITE_API_BASE_URL` en dev.

## Testing (recomendado)
- Unit/integration con React Testing Library.
- E2E con Playwright o Cypress.
- Tests co-localizados (ej. `Component.test.tsx`) próximos al componente.
- Prueba estados: loading, empty, success, error.

## Observabilidad
- Errores capturados y comunicados a usuario; logs en dev, no en prod.
- Para diagnósticos, usa `console.debug/info/warn/error` con moderación.
- Si escalamos, evaluar Sentry/LogRocket para client-side.

## Patrones que suelen ayudar
- Compound components (headless):
```tsx
// Ejemplo simple: Tabs con composición
function Tabs({ children }: { children: React.ReactNode }) { return <div role="tablist">{children}</div>; }
function Tab({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button role="tab" aria-selected={!!active} onClick={onClick}>
      {children}
    </button>
  );
}
Tabs.Tab = Tab;
```
- Custom hooks para aislar efectos (scroll, keyboard, resize) y lógica de formato.
- Adaptadores: si cambia el backend, encapsula transformaciones en un lugar.

## Relación con este repo
- Servicios RTK Query del feature Posts: `client/src/features/posts/posts.api.ts`.
- Proxy de API: `client/vite.config.ts` → backend en `http://localhost:3000`.
- Revisa Swagger en `http://localhost:3000/api/docs` para contratos y ejemplos.

## Checklist rápido antes de PR
- [ ] Tipos y props explícitos, sin `any`.
- [ ] Estados (loading/empty/error) cubiertos.
- [ ] Sin `console.log` ruidosos; sin HTML sin sanitizar.
- [ ] Keys estables en listas; handlers memoizados en listas pesadas.
- [ ] Accesibilidad básica (labels, foco, semántica, contraste).
- [ ] Rutas y navegación probadas.
- [ ] Lint/format/build pasan localmente.
