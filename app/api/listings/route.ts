import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const filter = searchParams.get("filter") || "all";

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // Verify project belongs to user
    const project = await db.carProject.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get all parts for this project
    const parts = await db.part.findMany({
      where: { projectId },
      select: { id: true },
    });

    const partIds = parts.map((p) => p.id);

    // Build where clause
    const where: any = {
      partId: { in: partIds },
    };

    if (filter !== "all") {
      where.status = filter;
    }

    const listings = await db.listing.findMany({
      where,
      include: {
        part: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { ingestedAt: "desc" },
    });

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}
