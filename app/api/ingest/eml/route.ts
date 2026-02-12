import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseEMLFile, parseOLXEmail } from "@/lib/email-parser";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const emlContent = await file.text();
    const { html, date } = await parseEMLFile(emlContent);

    if (!html) {
      return NextResponse.json(
        { error: "No HTML content found in email" },
        { status: 400 }
      );
    }

    // Parse listings from HTML
    const parsedListings = parseOLXEmail(html, date);

    if (parsedListings.length === 0) {
      return NextResponse.json(
        { error: "No listings found in email" },
        { status: 400 }
      );
    }

    // Create hash of email content to track if we've processed it
    const messageIdHash = crypto
      .createHash("sha256")
      .update(emlContent)
      .digest("hex");

    // Check if we've already processed this email
    const existingIngestion = await db.emailIngestion.findUnique({
      where: { messageIdHash },
    });

    if (existingIngestion) {
      return NextResponse.json(
        {
          message: "Email already processed",
          listingsCount: existingIngestion.listingCount,
        },
        { status: 200 }
      );
    }

    // Get user's parts and alerts to match listings
    const userProjects = await db.carProject.findMany({
      where: { userId: session.user.id },
      include: {
        parts: {
          include: {
            alerts: true,
          },
        },
      },
    });

    const allParts = userProjects.flatMap((p) => p.parts);
    const allAlerts = allParts.flatMap((p) => p.alerts);

    // Match listings to parts/alerts based on keywords
    const listingsToCreate = [];
    for (const listing of parsedListings) {
      // Find matching alert based on keywords
      let matchedAlert = null;
      let matchedPart = null;

      for (const alert of allAlerts) {
        if (!alert.isActive) continue;

        const alertKeywords = JSON.parse(alert.keywords || "[]");
        const listingTitleLower = listing.title.toLowerCase();

        // Check if any alert keyword matches the listing title
        const hasMatch = alertKeywords.some((keyword: string) =>
          listingTitleLower.includes(keyword.toLowerCase())
        );

        if (hasMatch) {
          matchedAlert = alert;
          matchedPart = allParts.find((p) =>
            p.alerts.some((a) => a.id === alert.id)
          );
          break;
        }
      }

      // If no alert match, try to match by part keywords
      if (!matchedPart) {
        for (const part of allParts) {
          const partKeywords = JSON.parse(part.keywords || "[]");
          const listingTitleLower = listing.title.toLowerCase();

          const hasMatch = partKeywords.some((keyword: string) =>
            listingTitleLower.includes(keyword.toLowerCase())
          );

          if (hasMatch) {
            matchedPart = part;
            break;
          }
        }
      }

      listingsToCreate.push({
        partId: matchedPart?.id || null,
        alertId: matchedAlert?.id || null,
        source: "olx_email",
        title: listing.title,
        url: listing.url,
        price: listing.price || null,
        location: listing.location || null,
        postedAt: listing.postedAt || null,
        isNew: true,
        status: "new",
      });
    }

    // Create listings (with deduplication by URL)
    let createdCount = 0;
    for (const listingData of listingsToCreate) {
      try {
        await db.listing.create({
          data: listingData,
        });
        createdCount++;
      } catch (error: any) {
        // Ignore duplicate URL errors (unique constraint)
        if (error.code !== "P2002") {
          throw error;
        }
      }
    }

    // Record ingestion
    await db.emailIngestion.create({
      data: {
        messageIdHash,
        source: "olx_email",
        listingCount: createdCount,
      },
    });

    return NextResponse.json({
      success: true,
      listingsFound: parsedListings.length,
      listingsCreated: createdCount,
      listingsMatched: listingsToCreate.filter((l) => l.partId).length,
    });
  } catch (error) {
    console.error("Error ingesting email:", error);
    return NextResponse.json(
      { error: "Failed to ingest email", details: String(error) },
      { status: 500 }
    );
  }
}
