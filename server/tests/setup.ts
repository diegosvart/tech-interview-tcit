import dotenv from 'dotenv';
import { beforeAll, afterAll } from 'vitest';

// Cargar variables de test primero
dotenv.config({ path: '.env.test' });

// Silenciar logs verbosos en test si LOG_LEVEL=silent
if (process.env.LOG_LEVEL === 'silent') {
  process.env.PINO_LOG_LEVEL = 'silent';
}

// Las migraciones y generate se ejecutan en `pretest:integration`, aquí solo validamos conexión.

// Limpieza por test: truncar tablas principales para aislamiento rápido.
// Evitamos migrate reset (más lento) mientras el esquema es pequeño.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

beforeAll(async () => {
  // Pequeña verificación de conectividad; si falla lanzará error rápidamente.
  await prisma.$queryRawUnsafe('SELECT 1');
});

// Nota: truncado se realizará de forma explícita dentro de las suites que lo necesiten.

afterAll(async () => {
  await prisma.$disconnect();
});
