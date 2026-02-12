import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateOutreachSchema = z.object({
  status: z
    .enum([
      "not_contacted",
      "contacted",
      "awaiting_reply",
      "found_lead",
      "closed",
    ])
    .optional(),
  notes: z.string().optional(),
  messageDraft: z.string().optional(),
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

    const outreach = await db.outreach.findFirst({
      where: { id: params.id },
      include: {
        project: true,
        part: true,
        scrapyard: true,
      },
    });

    if (!outreach || outreach.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Outreach not found" }, { status: 404 });
    }

    return NextResponse.json(outreach);
  } catch (error) {
    console.error("Error fetching outreach:", error);
    return NextResponse.json(
      { error: "Failed to fetch outreach" },
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
    const data = updateOutreachSchema.parse(body);

    const outreach = await db.outreach.findFirst({
      where: { id: params.id },
      include: { project: true },
    });

    if (!outreach || outreach.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Outreach not found" }, { status: 404 });
    }

    const updateData: any = { ...data };
    if (data.status === "contacted" && outreach.status !== "contacted") {
      updateData.lastContactedAt = new Date();
    }

    const updated = await db.outreach.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating outreach:", error);
    return NextResponse.json(
      { error: "Failed to update outreach" },
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

    const outreach = await db.outreach.findFirst({
      where: { id: params.id },
      include: { project: true },
    });

    if (!outreach || outreach.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Outreach not found" }, { status: 404 });
    }

    await db.outreach.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting outreach:", error);
    return NextResponse.json(
      { error: "Failed to delete outreach" },
      { status: 500 }
    );
  }
}
