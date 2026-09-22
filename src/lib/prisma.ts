import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/* Warm up the connection pool on module load. Log failures so they are
   visible in server logs — the app retries at the query level. */
prisma.$connect().catch((e: unknown) => {
  console.error('[prisma] warmup connect failed:', e instanceof Error ? e.message : e);
});
