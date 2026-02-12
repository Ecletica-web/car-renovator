import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// Test database connection on startup
if (typeof window === "undefined") {
  db.$connect().catch((error) => {
    console.error("Database connection error:", error);
    console.error("Note: SQLite doesn't work on Vercel. You need PostgreSQL.");
  });
}
