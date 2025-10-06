import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';

import openapiDoc from './interfaces/http/docs/openapi.json';
import { errorHandler } from './interfaces/http/middlewares/error-handler';
import postsRouter from './interfaces/http/routes/posts.routes';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
// Pino logger: pretty en desarrollo, JSON en producción
const isProd = process.env.NODE_ENV === 'production';
const logger = isProd
  ? pino({ level: 'info' })
  : pino({
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      },
    });
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      // Evitar ruido del health en logs
      ignore: (req) => req.url.startsWith('/api/v1/health'),
    },
    customLogLevel(_req, res, err) {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  })
);

// Swagger UI en /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

// Healthcheck
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

// API v1 routes
app.use('/api/v1', postsRouter);

// 404 handler (after defining all routes)
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// Register global error handler (must be after routes)
app.use(errorHandler);

// Exportamos la app sin arrancar el listener. Esto permite:
// - Reutilizar la misma instancia en tests (supertest)
// - Evitar puertos en conflicto cuando se ejecutan múltiples suites
// Un archivo separado (p.ej. server.ts) puede encargarse de arrancar el servidor en entornos reales.

export default app;