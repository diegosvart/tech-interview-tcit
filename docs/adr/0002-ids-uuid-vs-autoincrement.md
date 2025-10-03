# ADR 0002: IDs – UUID vs Autoincrement

Fecha: 2025-10-02

## Contexto
La entidad principal `Post` requiere un identificador. Se consideran opciones: autoincrement (int/bigint) y UUID.

## Decisión
Usar UUID (idealmente v7 o ULID) como identificador para `Post`.

## Motivación
- Escalabilidad y generación distribuida sin coordinación con la DB.
- Oculta conteo/orden de creación (no filtra volumen).
- Facilita fusiones y replicación futura.

## Alternativas consideradas
- Autoincrement: más simple y eficiente en índices, pero expone conteo y depende de la DB para generar IDs.

## Consecuencias
- Índices algo más grandes; considerar UUIDv7/ULID para mejor locality.
- Ajustar Prisma/schema a tipo `uuid` con default apropiado.
