import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateScrapyardSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
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

    const scrapyard = await db.scrapyard.findUnique({
      where: { id: params.id },
      include: {
        outreaches: {
          include: {
            part: true,
            project: true,
          },
        },
      },
    });

    if (!scrapyard) {
      return NextResponse.json({ error: "Scrapyard not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...scrapyard,
      tags: JSON.parse(scrapyard.tags || "[]"),
    });
  } catch (error) {
    console.error("Error fetching scrapyard:", error);
    return NextResponse.json(
      { error: "Failed to fetch scrapyard" },
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
    const data = updateScrapyardSchema.parse(body);

    const updateData: any = { ...data };
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }
    if (data.email !== undefined) {
      updateData.email = data.email || null;
    }

    const updated = await db.scrapyard.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      ...updated,
      tags: JSON.parse(updated.tags || "[]"),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating scrapyard:", error);
    return NextResponse.json(
      { error: "Failed to update scrapyard" },
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

    await db.scrapyard.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting scrapyard:", error);
    return NextResponse.json(
      { error: "Failed to delete scrapyard" },
      { status: 500 }
    );
  }
}
