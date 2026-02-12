import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updatePartSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  notes: z.string().optional(),
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

    const part = await db.part.findFirst({
      where: { id: params.id },
      include: {
        project: true,
        alerts: true,
        listings: true,
      },
    });

    if (!part || part.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...part,
      keywords: JSON.parse(part.keywords || "[]"),
    });
  } catch (error) {
    console.error("Error fetching part:", error);
    return NextResponse.json(
      { error: "Failed to fetch part" },
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
    const data = updatePartSchema.parse(body);

    const part = await db.part.findFirst({
      where: { id: params.id },
      include: { project: true },
    });

    if (!part || part.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    const updateData: any = { ...data };
    if (data.keywords) {
      updateData.keywords = JSON.stringify(data.keywords);
    }

    const updated = await db.part.update({
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
    console.error("Error updating part:", error);
    return NextResponse.json(
      { error: "Failed to update part" },
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

    const part = await db.part.findFirst({
      where: { id: params.id },
      include: { project: true },
    });

    if (!part || part.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    await db.part.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting part:", error);
    return NextResponse.json(
      { error: "Failed to delete part" },
      { status: 500 }
    );
  }
}
