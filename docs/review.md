# Code Review – Checklist

## Antes de abrir PR
- [ ] Lint y typecheck pasan (server y client)
- [ ] Tests pasan localmente
- [ ] Docs actualizadas (README, /docs, ADRs si aplica)
- [ ] No hay secrets ni datos sensibles

## Revisión
- [ ] Arquitectura y responsabilidades claras (controllers/services/repos)
- [ ] Validación y manejo de errores correcto (Zod + errorHandler)
- [ ] Seguridad básica (CORS, helmet) y headers
- [ ] Código legible, funciones pequeñas, camelCase/PascalCase
- [ ] Performance razonable (paginación, queries indexadas)
- [ ] Accesibilidad UI (labels, roles, foco, contrastes)

## Post-merge
- [ ] Pipeline verde
- [ ] Tag o release (si aplica)

Plantilla de PR (copiar a `.github/pull_request_template.md`):
- `docs/templates/pull_request_template.md`
