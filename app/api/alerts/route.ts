import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createAlertSchema = z.object({
  partId: z.string(),
  keywords: z.array(z.string()).min(1),
  priceRangeMin: z.number().optional(),
  priceRangeMax: z.number().optional(),
  locationRadius: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createAlertSchema.parse(body);

    // Verify part belongs to user's project
    const part = await db.part.findFirst({
      where: { id: data.partId },
      include: { project: true },
    });

    if (!part || part.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    const alert = await db.alert.create({
      data: {
        ...data,
        keywords: JSON.stringify(data.keywords),
      },
    });

    return NextResponse.json({
      ...alert,
      keywords: JSON.parse(alert.keywords || "[]"),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
