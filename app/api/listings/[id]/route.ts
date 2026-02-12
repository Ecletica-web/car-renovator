import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateListingSchema = z.object({
  status: z.enum(["new", "viewed", "contacted", "purchased", "expired"]).optional(),
  isNew: z.boolean().optional(),
});

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
    const data = updateListingSchema.parse(body);

    // Verify listing belongs to user's project
    const listing = await db.listing.findFirst({
      where: { id: params.id },
      include: {
        part: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!listing || !listing.part || listing.part.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const updated = await db.listing.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}
