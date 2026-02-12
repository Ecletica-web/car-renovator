import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateDiagnosis } from "@/lib/diagnosis-engine";

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
      include: {
        problems: true,
        photos: true,
        documents: true,
        replacements: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Collect AI findings from photos
    const aiFindings = project.photos
      .map((photo) => {
        if (!photo.aiAnalysis) return [];
        try {
          const analysis = JSON.parse(photo.aiAnalysis);
          return analysis.issues || [];
        } catch {
          return [];
        }
      })
      .flat();

    // Collect document findings
    const documentFindings = project.documents.map((doc) => ({
      type: doc.type,
      text: doc.extractedText || "",
    }));

    // Generate diagnosis
    const diagnosisOutput = generateDiagnosis({
      projectId: params.id,
      make: project.make,
      model: project.model,
      year: project.year,
      userProblems: project.problems.map((p) => ({
        title: p.title,
        description: p.description || undefined,
        category: p.category,
      })),
      aiFindings,
      documentFindings,
      replacements: project.replacements.map((r) => ({
        partName: r.partName,
        date: r.date || undefined,
      })),
    });

    // Save diagnosis
    const existingDiagnosis = await db.diagnosis.findUnique({
      where: { projectId: params.id },
    });

    let diagnosis;
    if (existingDiagnosis) {
      // Delete old items
      await db.diagnosisItem.deleteMany({
        where: { diagnosisId: existingDiagnosis.id },
      });

      diagnosis = await db.diagnosis.update({
        where: { id: existingDiagnosis.id },
        data: {
          summary: diagnosisOutput.summary,
          updatedAt: new Date(),
        },
      });
    } else {
      diagnosis = await db.diagnosis.create({
        data: {
          projectId: params.id,
          summary: diagnosisOutput.summary,
        },
      });
    }

    // Create diagnosis items with tree structure
    const parentItems: Record<string, string> = {};
    const itemsToCreate = diagnosisOutput.items.map((item, index) => ({
      ...item,
      order: index,
    }));

    // Group items by category to create parent nodes
    const itemsByCategory: Record<string, typeof itemsToCreate> = {};
    itemsToCreate.forEach((item) => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });

    // First pass: create parent category nodes
    for (const [category, categoryItems] of Object.entries(itemsByCategory)) {
      if (categoryItems.length > 0) {
        const parentItem = categoryItems.find((item) => 
          item.title.includes(category) || item.title.includes("Engine") || item.title.includes("Electrical")
        ) || categoryItems[0];

        const parent = await db.diagnosisItem.create({
          data: {
            diagnosisId: diagnosis.id,
            title: getSpecialistCategoryTitle(category),
            description: `${categoryItems.length} issue(s) require attention from ${getSpecialistCategoryTitle(category)}`,
            category: category,
            severity: getHighestSeverity(categoryItems.map(i => ({ severity: i.severity }))),
            priority: Object.keys(itemsByCategory).indexOf(category) * 10,
            estimatedCost: estimateCategoryCost(categoryItems.map(i => ({ severity: i.severity }))),
            estimatedTime: estimateCategoryTime(categoryItems.map(i => ({ severity: i.severity }))),
            order: Object.keys(itemsByCategory).indexOf(category) * 10,
          },
        });
        parentItems[category] = parent.id;

        // Second pass: create child items for this category
        for (const item of categoryItems) {
          const problemId = project.problems.find(
            (p) => p.title.toLowerCase() === item.title.toLowerCase() && p.category === item.category
          )?.id;

          await db.diagnosisItem.create({
            data: {
              diagnosisId: diagnosis.id,
              problemId: problemId || undefined,
              title: item.title,
              description: item.description,
              category: item.category,
              severity: item.severity,
              priority: item.priority,
              parentId: parent.id,
              order: item.order,
            },
          });
        }
      }
    }

    // Generate placeholder specialist contacts
    const categories = new Set(diagnosisOutput.items.map((i) => i.category));
    for (const category of categories) {
      const items = await db.diagnosisItem.findMany({
        where: {
          diagnosisId: diagnosis.id,
          category,
          parentId: null,
        },
      });

      for (const item of items) {
        // Create placeholder contacts
        await db.specialistContact.createMany({
          data: [
            {
              diagnosisItemId: item.id,
              name: `Sample ${getSpecialistName(category)} 1`,
              type: category,
              phone: "+351 XXX XXX XXX",
              email: `contact1@${category.replace("_", "")}.pt`,
              city: project.city || "Lisboa",
              isPlaceholder: true,
            },
            {
              diagnosisItemId: item.id,
              name: `Sample ${getSpecialistName(category)} 2`,
              type: category,
              phone: "+351 XXX XXX XXX",
              email: `contact2@${category.replace("_", "")}.pt`,
              city: project.city || "Lisboa",
              isPlaceholder: true,
            },
          ],
        });
      }
    }

    // Update project
    await db.carProject.update({
      where: { id: params.id },
      data: {
        diagnosisCompleted: true,
        diagnosisCompletedAt: new Date(),
      },
    });

    return NextResponse.json({ diagnosis, items: diagnosisOutput.items });
  } catch (error) {
    console.error("Error generating diagnosis:", error);
    return NextResponse.json(
      { error: "Failed to generate diagnosis", details: String(error) },
      { status: 500 }
    );
  }
}

function getSpecialistName(category: string): string {
  const names: Record<string, string> = {
    mechanic: "Mechanic",
    electrician: "Electrician",
    body_shop: "Body Shop",
    suspension: "Suspension Specialist",
    brakes: "Brake Specialist",
    transmission: "Transmission Specialist",
    interior: "Interior Specialist",
    paint: "Paint Shop",
    other: "Specialist",
  };
  return names[category] || "Specialist";
}

function getSpecialistCategoryTitle(category: string): string {
  const titles: Record<string, string> = {
    mechanic: "Engine & Mechanical",
    electrician: "Electrical System",
    body_shop: "Body & Rust Repair",
    suspension: "Suspension & Steering",
    brakes: "Brake System",
    transmission: "Transmission",
    interior: "Interior & Upholstery",
    paint: "Paint & Finish",
    other: "Other Services",
  };
  return titles[category] || category;
}

function getHighestSeverity(items: Array<{ severity: string }>): string {
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  let highest = "low";
  let maxValue = 0;

  items.forEach((item) => {
    const value = severityOrder[item.severity as keyof typeof severityOrder] || 0;
    if (value > maxValue) {
      maxValue = value;
      highest = item.severity;
    }
  });

  return highest;
}

function estimateCategoryCost(items: Array<{ severity: string }>): number {
  const baseCosts = { critical: 2000, high: 1000, medium: 500, low: 200 };
  let total = 0;

  items.forEach((item) => {
    total += baseCosts[item.severity as keyof typeof baseCosts] || 0;
  });

  return total;
}

function estimateCategoryTime(items: Array<{ severity: string }>): string {
  const days = Math.ceil(items.length * 1.5);
  if (days === 1) return "1 day";
  if (days <= 7) return `${days} days`;
  return `${Math.ceil(days / 7)} weeks`;
}
