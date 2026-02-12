import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createReplacementSchema = z.object({
  partName: z.string().min(1),
  description: z.string().optional(),
  date: z.string().optional(),
  cost: z.number().optional(),
  workshop: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await db.carProject.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = createReplacementSchema.parse(body);

    const replacement = await db.replacement.create({
      data: {
        projectId: params.id,
        ...data,
        date: data.date ? new Date(data.date) : null,
      },
    });

    return NextResponse.json(replacement, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating replacement:", error);
    return NextResponse.json(
      { error: "Failed to create replacement" },
      { status: 500 }
    );
  }
}
