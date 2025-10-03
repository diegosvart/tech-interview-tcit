import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import pino from 'pino';
// Import del contrato OpenAPI (JSON)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const openapiDoc = require('./interfaces/http/docs/openapi.json');
import postsRouter from './interfaces/http/routes/posts.routes';
import { errorHandler } from './interfaces/http/middlewares/error-handler';

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

// Inicio del servidor
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`HTTP server listening on http://localhost:${port}`);
});

export default app;