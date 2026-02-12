import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createPartSchema = z.object({
  projectId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createPartSchema.parse(body);

    // Verify project belongs to user
    const project = await db.carProject.findFirst({
      where: {
        id: data.projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const part = await db.part.create({
      data: {
        ...data,
        keywords: JSON.stringify(data.keywords),
      },
    });

    return NextResponse.json(part, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating part:", error);
    return NextResponse.json(
      { error: "Failed to create part" },
      { status: 500 }
    );
  }
}
