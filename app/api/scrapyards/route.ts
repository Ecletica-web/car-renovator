import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createScrapyardSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all scrapyards (they're shared across projects for now)
    const scrapyards = await db.scrapyard.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      scrapyards.map((s) => ({
        ...s,
        tags: JSON.parse(s.tags || "[]"),
      }))
    );
  } catch (error) {
    console.error("Error fetching scrapyards:", error);
    return NextResponse.json(
      { error: "Failed to fetch scrapyards" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createScrapyardSchema.parse(body);

    const scrapyard = await db.scrapyard.create({
      data: {
        ...data,
        tags: JSON.stringify(data.tags),
        email: data.email || null,
      },
    });

    return NextResponse.json(
      {
        ...scrapyard,
        tags: JSON.parse(scrapyard.tags || "[]"),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating scrapyard:", error);
    return NextResponse.json(
      { error: "Failed to create scrapyard" },
      { status: 500 }
    );
  }
}
