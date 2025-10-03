import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Para entorno de desarrollo: limpiamos la tabla antes de sembrar
  // Elimina esta línea si prefieres conservar datos existentes
  await prisma.post.deleteMany();

  const posts = [
    {
      name: 'Primer post: Introducción',
      description: 'Bienvenido al blog de prueba. Este es el primer post.'
    },
    {
      name: 'Segundo post: Stack técnico',
      description: 'Node.js + Express + TypeScript + Prisma + PostgreSQL.'
    },
    {
      name: 'Tercer post: Arquitectura limpia',
      description: 'Capas domain, application, infrastructure, interfaces.'
    },
    {
      name: 'Cuarto post: OpenAPI primero',
      description: 'Definimos contrato antes de implementar endpoints.'
    },
    {
      name: 'Quinto post: Observabilidad',
      description: 'Logs estructurados con pino y métricas próximamente.'
    }
  ];

  await prisma.post.createMany({ data: posts });

  const count = await prisma.post.count();
  // eslint-disable-next-line no-console
  console.log(`Seed completado. Total de posts: ${count}`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
