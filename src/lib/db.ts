import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let url = process.env.DATABASE_URL;

// Handle Vercel serverless environment
if (process.env.VERCEL || process.env.VERCEL_ENV) {
    // On Vercel, use /tmp directory which is writable
    // Note: Data won't persist between deployments, but app will work
    url = "file:/tmp/tasks.db";
    console.log("Using Vercel-compatible database path:", url);
} else if (url && url.startsWith("file:.")) {
    // Local development
    const dbPath = url.slice(5);
    const absolutePath = path.resolve(process.cwd(), dbPath);
    url = `file:${absolutePath}`;
    console.log("Resolved Absolute DB URL:", url);
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url,
            },
        },
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
