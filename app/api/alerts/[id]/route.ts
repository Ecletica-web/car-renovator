import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateAlertSchema = z.object({
  keywords: z.array(z.string()).optional(),
  priceRangeMin: z.number().optional(),
  priceRangeMax: z.number().optional(),
  locationRadius: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alert = await db.alert.findFirst({
      where: { id: params.id },
      include: {
        part: {
          include: { project: true },
        },
      },
    });

    if (!alert || alert.part.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...alert,
      keywords: JSON.parse(alert.keywords || "[]"),
    });
  } catch (error) {
    console.error("Error fetching alert:", error);
    return NextResponse.json(
      { error: "Failed to fetch alert" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = updateAlertSchema.parse(body);

    const alert = await db.alert.findFirst({
      where: { id: params.id },
      include: {
        part: {
          include: { project: true },
        },
      },
    });

    if (!alert || alert.part.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const updateData: any = { ...data };
    if (data.keywords) {
      updateData.keywords = JSON.stringify(data.keywords);
    }

    const updated = await db.alert.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      ...updated,
      keywords: JSON.parse(updated.keywords || "[]"),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating alert:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const alert = await db.alert.findFirst({
      where: { id: params.id },
      include: {
        part: {
          include: { project: true },
        },
      },
    });

    if (!alert || alert.part.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    await db.alert.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json(
      { error: "Failed to delete alert" },
      { status: 500 }
    );
  }
}
