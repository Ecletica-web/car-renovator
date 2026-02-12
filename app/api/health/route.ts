import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL || "NOT SET";
    const isSqlite = dbUrl.startsWith("file:");
    const isPostgres = dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://");
    
    // Try to connect
    await db.$connect();
    await db.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: "healthy",
      database: {
        url: isSqlite ? "SQLite (file:)" : isPostgres ? "PostgreSQL" : "Unknown",
        connected: true,
        provider: "postgresql",
      },
      environment: process.env.NODE_ENV,
    });
  } catch (error: any) {
    const dbUrl = process.env.DATABASE_URL || "NOT SET";
    const isSqlite = dbUrl.startsWith("file:");
    
    return NextResponse.json(
      {
        status: "error",
        database: {
          url: dbUrl.substring(0, 30) + "...",
          connected: false,
          isSqlite,
          error: error.message,
        },
        message: isSqlite
          ? "DATABASE_URL is set to SQLite. Update it in Vercel Settings → Environment Variables."
          : "Database connection failed. Check DATABASE_URL.",
      },
      { status: 500 }
    );
  } finally {
    await db.$disconnect();
  }
}
