# Estrategia de Testing

## Objetivos
- Asegurar correctitud del dominio y endpoints.
- Proveer una base mínima de pruebas reproducibles.

## Backend
- Framework: Jest o Vitest + ts-node/register.
- Endpoints: Supertest para pruebas HTTP.
- Casos mínimos:
  - Crear, obtener, actualizar y eliminar Post (200/201/204/404/400).
  - Validación de DTOs (Zod): errores 400.
  - Repositorio con DB (test de integración simple).

## Frontend
- Framework: Vitest + React Testing Library.
- Casos mínimos:
  - Render de listado de posts con datos mockeados.
  - Formulario de creación/edición: validación y envío.
  - Manejo de estados de carga y errores.

## Datos y entorno
- Semillas controladas para tests de integración.
- Si se usa DB real, considerar contenedor efímero o sqlite en memoria (si Prisma lo facilita).

## Cobertura
- Meta inicial: 60–70% líneas/branches.
- Reporte en CI y badge opcional.
