import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/* Warm up the connection pool on module load so the first API request
   doesn't pay the TCP + TLS + auth cost and time out. Errors are ignored
   because the connection will be retried on the actual query. */
prisma.$connect().catch(() => {});
