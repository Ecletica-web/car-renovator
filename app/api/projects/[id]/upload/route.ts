import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { analyzeCarImage } from "@/lib/ai-image-analyzer";

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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", params.id);
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/${params.id}/${filename}`;

    if (type === "photo") {
      // Analyze image with AI
      const fullUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}${url}`;
      const analysis = await analyzeCarImage(
        fullUrl,
        project.make,
        project.model,
        project.year
      );

      const photo = await db.photo.create({
        data: {
          projectId: params.id,
          url,
          filename: file.name,
          aiAnalysis: JSON.stringify(analysis),
        },
      });

      return NextResponse.json({ photo, analysis });
    } else if (type === "document") {
      const document = await db.document.create({
        data: {
          projectId: params.id,
          url,
          filename: file.name,
          type: "other", // Could be determined from filename or user input
        },
      });

      return NextResponse.json({ document });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
