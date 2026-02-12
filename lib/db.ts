import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check DATABASE_URL to ensure it's PostgreSQL
const databaseUrl = process.env.DATABASE_URL || "";
if (databaseUrl && databaseUrl.startsWith("file:")) {
  console.error("ERROR: DATABASE_URL is set to SQLite (file:). This won't work on Vercel!");
  console.error("Please set DATABASE_URL to a PostgreSQL connection string in Vercel environment variables.");
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
