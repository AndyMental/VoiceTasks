import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let url = process.env.DATABASE_URL;

if (url && url.startsWith("file:.")) {
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
