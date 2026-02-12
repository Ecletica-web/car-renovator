import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signIn } from "next-auth/react";

export async function POST(request: NextRequest) {
  try {
    // Generate a unique guest email
    const guestEmail = `guest-${Date.now()}-${Math.random().toString(36).substring(7)}@guest.local`;

    // Find or create guest user
    let user = await db.user.findUnique({
      where: { email: guestEmail },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: guestEmail,
          name: "Guest User",
        },
      });
    }

    // Return success - the client will handle the sign-in
    return NextResponse.json({
      success: true,
      email: guestEmail,
      message: "Guest user created. Please sign in with credentials.",
    });
  } catch (error) {
    console.error("Error creating guest user:", error);
    return NextResponse.json(
      { error: "Failed to create guest user" },
      { status: 500 }
    );
  }
}
