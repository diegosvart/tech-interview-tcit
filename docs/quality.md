# Calidad de Código y Estilo

## Linters y Formato
- ESLint (TypeScript, React) con reglas strict recomendadas.
- Prettier como formateador consistente.
- Integración pre-commit con husky + lint-staged.

Plantillas:
- ESLint: `docs/templates/eslint-template.json`
- Prettier: `docs/templates/prettier-template.json`
- EditorConfig: `docs/templates/editorconfig-template.ini`

## Reglas sugeridas
- `no-explicit-any`, `eqeqeq`, `no-unused-vars`, `prefer-const`, `no-implicit-any` (TS strict)
- React: `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`
- Import/order

## TypeScript
- `strict: true` en ambos (client y server).
- Paths alias para claridad (si aplica).

## PRs y Branching
- Convención de commits opcional.
- Plantilla de PR con checklist: lint, tests, docs, breaking changes.

## Medidas de Calidad
- Coverage reports (Jest/Vitest).
- Análisis estático en CI (eslint, tsc --noEmit).

## Quality Gates en CI
1. Lint (matriz server/client)
	- Server: cualquier error (severity error) falla el pipeline.
	- Client: por ahora se permiten warnings; objetivo futuro: 0 warnings.
2. Tests backend (con Postgres real + migraciones + seed) con cobertura.
3. Tests frontend + typecheck + build de producción.
4. Resumen final para visibilidad de estado.

Si el gate 1 falla, no se consumen recursos de DB ni se ejecutan tests largos.

## Política de Warnings
- Warnings de ESLint en client se tratan como deuda técnica y deben reducirse antes del release estable.
- Se recomienda no introducir nuevos warnings (fail-fast policy futura: convertir en errores).

## Reglas de Importación
- `import/order` aplicado con grupos: builtin, external, internal, parent, sibling, index, type.
- Auto-fix permitido localmente (`npm run lint:fix`).

## Thresholds sugeridos (pendiente implementar)
- Cobertura líneas: 80%
- Cobertura branches: 70%
- Cobertura statements: 80%
- Cobertura functions: 80%

## Criterio de Merge (cuando el PR apunte a main)
- Todos los jobs verdes.
- Sin nuevos warnings añadidos respecto a la base (temporal manual review).
- Documentación actualizada si se introducen scripts/flags nuevos.
