# Observabilidad y Logging

## Objetivos
- Diagnóstico simple y consistente durante desarrollo.

## Logging
- `pino`/`pino-http` para logs estructurados en backend.
- Nivel por entorno (debug en dev, info en prod).
- Incluir `traceId` simple por request (middleware opcional).

Ver guía detallada: `docs/pino-http.md`.

## Métricas (opcional)
- Exponer `/metrics` (Prometheus) en el futuro si aplica.

## Errores
- Manejo centralizado con shape `{ code, message, details?, traceId? }`.
- Evitar loggear datos sensibles.
