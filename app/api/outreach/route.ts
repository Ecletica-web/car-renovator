import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateOutreachDraft } from "@/lib/outreach-generator";
import { z } from "zod";

const createOutreachSchema = z.object({
  projectId: z.string(),
  partId: z.string(),
  scrapyardId: z.string(),
  channel: z.enum(["email", "whatsapp"]).default("email"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createOutreachSchema.parse(body);

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

    // Get part and scrapyard
    const part = await db.part.findFirst({
      where: {
        id: data.partId,
        projectId: data.projectId,
      },
    });

    const scrapyard = await db.scrapyard.findUnique({
      where: { id: data.scrapyardId },
    });

    if (!part || !scrapyard) {
      return NextResponse.json(
        { error: "Part or scrapyard not found" },
        { status: 404 }
      );
    }

    // Generate draft message
    const partKeywords = JSON.parse(part.keywords || "[]");
    const messageDraft = generateOutreachDraft({
      carMake: project.make,
      carModel: project.model,
      carYear: project.year,
      partName: part.name,
      partKeywords,
      scrapyardName: scrapyard.name,
      userLocation: project.city || project.region || undefined,
      channel: data.channel,
    });

    // Check if outreach already exists
    const existing = await db.outreach.findFirst({
      where: {
        projectId: data.projectId,
        partId: data.partId,
        scrapyardId: data.scrapyardId,
      },
    });

    if (existing) {
      // Update existing outreach
      const updated = await db.outreach.update({
        where: { id: existing.id },
        data: {
          messageDraft,
          channel: data.channel,
        },
      });

      return NextResponse.json(updated, { status: 200 });
    }

    // Create new outreach
    const outreach = await db.outreach.create({
      data: {
        ...data,
        messageDraft,
        status: "not_contacted",
      },
    });

    return NextResponse.json(outreach, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating outreach:", error);
    return NextResponse.json(
      { error: "Failed to create outreach" },
      { status: 500 }
    );
  }
}
