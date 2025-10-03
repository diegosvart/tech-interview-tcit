# Convenciones y Buenas Prácticas

## Estilo de código
- TypeScript strict.
- camelCase para variables/funciones/archivos.
- PascalCase para componentes/clases.
- ESLint + Prettier.

## Arquitectura
- Capas: domain, application (services/use-cases), infrastructure (ORM/repos), interfaces (HTTP/controllers).
- Controladores delgados; la lógica va en servicios.
- Repositorios sin reglas de negocio.

## Validación y errores
- Zod para DTOs (entrada/salida).
- Error handler central: códigos y mensajes consistentes.

## Git y CI
- Commits claros (convencionales opcional).
- Lint y tests en pre-commit (husky/lint-staged opcional).

## Documentación
- `/docs` como fuente de verdad.
- README con pasos de ejecución para Windows PowerShell.

## Decisiones transversales
- Identificadores: usar UUID para entidades principales (posts) por escalabilidad y privacidad del conteo. Preferible UUIDv7/ULID por locality de índices.
- Paginación: offset (`page`, `pageSize`) en esta etapa. Migrar a cursor (`createdAt, id`) si el volumen/uso crece o si se requiere mayor estabilidad bajo concurrencia.
