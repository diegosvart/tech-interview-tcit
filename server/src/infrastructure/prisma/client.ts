import { PrismaClient } from '@prisma/client';

// Singleton Prisma client for the app
export const prisma = new PrismaClient();
