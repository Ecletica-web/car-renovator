import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
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

    const parts = await db.part.findMany({
      where: { projectId: params.id },
      include: {
        alerts: true,
        listings: {
          orderBy: { ingestedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      parts.map((part) => ({
        ...part,
        keywords: JSON.parse(part.keywords || "[]"),
      }))
    );
  } catch (error) {
    console.error("Error fetching parts:", error);
    return NextResponse.json(
      { error: "Failed to fetch parts" },
      { status: 500 }
    );
  }
}
