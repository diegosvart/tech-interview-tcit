# ADR 0003: Paginación – Offset vs Cursor

Fecha: 2025-10-02

## Contexto
La API listará posts y requiere paginación.

## Decisión
Usar paginación por offset (`page`, `pageSize`) en esta fase.

## Motivación
- Simplicidad y rapidez de implementación para el test técnico.
- Suficiente para volúmenes pequeños/medianos.

## Alternativas consideradas
- Cursor (keyset) con orden por `createdAt, id`: más estable y escalable, pero mayor complejidad (tokens/cursors y contratos de API).

## Consecuencias
- Offset puede degradar en páginas muy altas o con alta concurrencia.
- Plan futuro: migrar a cursor si el volumen/uso crece; mantener índices sobre `createdAt, id` para facilitar el cambio.
