import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Para entorno de desarrollo: limpiamos la tabla antes de sembrar
  // Elimina esta línea si prefieres conservar datos existentes
  await prisma.post.deleteMany();

  // Generar al menos 50 posts de ejemplo
  const posts: { name: string; description: string | null }[] = [];
  for (let i = 1; i <= 50; i++) {
    posts.push({
      name: `Post ${i}: título de ejemplo`,
      description: i % 3 === 0 ? null : `Descripción del post ${i}`,
    });
  }

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
