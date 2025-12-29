import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Support both DATABASE_URL (standard) and DATABASE__PRISMA_DATABASE_URL (Vercel Postgres)
const databaseUrl = 
    process.env.DATABASE_URL || 
    process.env.DATABASE__PRISMA_DATABASE_URL ||
    process.env.DATABASE__POSTGRES_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL or DATABASE__PRISMA_DATABASE_URL environment variable is required");
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
