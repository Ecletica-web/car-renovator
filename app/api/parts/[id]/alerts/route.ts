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

    const part = await db.part.findFirst({
      where: { id: params.id },
      include: {
        project: true,
        alerts: true,
      },
    });

    if (!part || part.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    return NextResponse.json(
      part.alerts.map((alert) => ({
        ...alert,
        keywords: JSON.parse(alert.keywords || "[]"),
      }))
    );
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
