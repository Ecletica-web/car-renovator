import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const guestEmail = body.email || `guest-${Date.now()}-${Math.random().toString(36).substring(7)}@guest.local`;

    // Find or create guest user
    let user = await db.user.findUnique({
      where: { email: guestEmail },
    });

    if (!user) {
      try {
        user = await db.user.create({
          data: {
            email: guestEmail,
            name: "Guest User",
          },
        });
      } catch (createError: any) {
        console.error("Error creating guest user:", createError);
        // If creation fails, try to find again (might have been created by another request)
        user = await db.user.findUnique({
          where: { email: guestEmail },
        });
        
        if (!user) {
          const dbUrl = process.env.DATABASE_URL || "not set";
          const isSqlite = dbUrl.startsWith("file:");
          return NextResponse.json(
            { 
              error: "Failed to create guest user",
              details: createError.message || "Database error.",
              hint: isSqlite 
                ? "DATABASE_URL is set to SQLite. Update it to PostgreSQL in Vercel Settings → Environment Variables."
                : `Database connection failed. Check DATABASE_URL. Current: ${dbUrl.substring(0, 20)}...`
            },
            { status: 500 }
          );
        }
      }
    }

    // Return success - the client will handle the sign-in
    return NextResponse.json({
      success: true,
      email: guestEmail,
      userId: user.id,
    });
  } catch (error: any) {
    console.error("Error in guest endpoint:", error);
    return NextResponse.json(
      { 
        error: "Failed to create guest user",
        details: error.message || "Unknown error",
        hint: "Database connection issue. SQLite doesn't work on Vercel - you need PostgreSQL."
      },
      { status: 500 }
    );
  }
}
