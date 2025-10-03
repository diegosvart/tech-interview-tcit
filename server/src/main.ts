import 'dotenv/config'; //.env variables
import express = require('express'); 'express'; // Express 
import cors = require('cors'); 'cors'; // Middleware for CORS
import helmet = require('helmet'); 'helmet'; // Middleware for security headers
import pinoHttp from 'pino-http'; 'pino-http'; // HTTP logger middleware

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp());

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