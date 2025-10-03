import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
// Import del contrato OpenAPI (JSON)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const openapiDoc = require('./interfaces/http/docs/openapi.json');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp());

// Swagger UI en /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDoc));

// Healthcheck
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

// Inicio del servidor
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`HTTP server listening on http://localhost:${port}`);
});

export default app;