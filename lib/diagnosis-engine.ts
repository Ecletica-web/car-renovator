import { getCommonProblems } from "./car-knowledge-base";

export interface DiagnosisInput {
  projectId: string;
  make: string;
  model: string;
  year?: number;
  userProblems: Array<{
    title: string;
    description?: string;
    category?: string;
  }>;
  aiFindings: Array<{
    category: string;
    description: string;
    severity: string;
  }>;
  documentFindings: Array<{
    type: string;
    text: string;
  }>;
  replacements: Array<{
    partName: string;
    date?: Date;
  }>;
}

export interface DiagnosisOutput {
  items: Array<{
    title: string;
    description: string;
    category: string;
    severity: string;
    priority: number;
    parentId?: string;
    estimatedCost?: number;
    estimatedTime?: string;
  }>;
  summary: string;
}

export function generateDiagnosis(input: DiagnosisInput): DiagnosisOutput {
  const items: DiagnosisOutput["items"] = [];
  const categoryMap: Record<string, Array<DiagnosisOutput["items"][0]>> = {};

  // 1. Add user-reported problems
  input.userProblems.forEach((problem, index) => {
    const category = problem.category || categorizeProblem(problem.title);
    const item = {
      title: problem.title,
      description: problem.description || problem.title,
      category,
      severity: determineSeverity(problem.title, problem.description),
      priority: 100 + index, // User problems get higher priority
    };
    items.push(item);
    if (!categoryMap[category]) categoryMap[category] = [];
    categoryMap[category].push(item);
  });

  // 2. Add AI findings from image analysis
  input.aiFindings.forEach((finding, index) => {
    const item = {
      title: finding.description,
      description: `AI-detected issue: ${finding.description}`,
      category: finding.category,
      severity: finding.severity as any,
      priority: 200 + index,
    };
    items.push(item);
    if (!categoryMap[item.category]) categoryMap[item.category] = [];
    categoryMap[item.category].push(item);
  });

  // 3. Add common problems from knowledge base
  const commonProblems = getCommonProblems(input.make, input.model, input.year);
  commonProblems.forEach((problem, index) => {
    // Check if already added
    const exists = items.some(
      (item) =>
        item.title.toLowerCase() === problem.title.toLowerCase() &&
        item.category === problem.category
    );

    if (!exists) {
      const item = {
        title: problem.title,
        description: problem.description,
        category: problem.category,
        severity: problem.severity,
        priority: 300 + index,
      };
      items.push(item);
      if (!categoryMap[item.category]) categoryMap[item.category] = [];
      categoryMap[item.category].push(item);
    }
  });

  // 4. Process document findings
  input.documentFindings.forEach((doc, index) => {
    if (doc.type === "service_record" || doc.type === "repair_invoice") {
      // Extract problems from service records
      const extractedProblems = extractProblemsFromText(doc.text);
      extractedProblems.forEach((prob, probIndex) => {
        const item = {
          title: prob.title,
          description: `Found in ${doc.type}: ${prob.description}`,
          category: prob.category,
          severity: prob.severity,
          priority: 400 + index * 10 + probIndex,
        };
        items.push(item);
        if (!categoryMap[item.category]) categoryMap[item.category] = [];
        categoryMap[item.category].push(item);
      });
    }
  });

  // 5. Organize into tree structure by specialist category
  const organizedItems: DiagnosisOutput["items"] = [];
  const specialistOrder = [
    "mechanic",
    "electrician",
    "body_shop",
    "suspension",
    "brakes",
    "transmission",
    "interior",
    "paint",
    "other",
  ];

  specialistOrder.forEach((specialist, specialistIndex) => {
    const categoryItems = categoryMap[specialist] || [];
    if (categoryItems.length > 0) {
      // Create parent category node
      const parentItem = {
        title: getSpecialistCategoryTitle(specialist),
        description: `${categoryItems.length} issue(s) require attention from ${getSpecialistCategoryTitle(specialist)}`,
        category: specialist,
        severity: getHighestSeverity(categoryItems),
        priority: specialistIndex * 10,
        estimatedCost: estimateCategoryCost(categoryItems),
        estimatedTime: estimateCategoryTime(categoryItems),
      };
      organizedItems.push(parentItem);

      // Add children (will be linked by parentId in database)
      categoryItems.forEach((item, itemIndex) => {
        organizedItems.push({
          ...item,
          priority: specialistIndex * 10 + itemIndex + 1,
        });
      });
    }
  });

  // Generate summary
  const summary = generateSummary(organizedItems, input);

  return {
    items: organizedItems,
    summary,
  };
}

function categorizeProblem(title: string, description?: string): string {
  const text = `${title} ${description || ""}`.toLowerCase();

  if (text.match(/\b(engine|motor|oil|coolant|overheating)\b/)) return "mechanic";
  if (text.match(/\b(electrical|wiring|battery|fuse|lights|dashboard)\b/)) return "electrician";
  if (text.match(/\b(rust|body|dent|scratch|paint|panel)\b/)) return "body_shop";
  if (text.match(/\b(suspension|shock|strut|bushing)\b/)) return "suspension";
  if (text.match(/\b(brake|braking|pad|rotor|disc)\b/)) return "brakes";
  if (text.match(/\b(transmission|gear|clutch)\b/)) return "transmission";
  if (text.match(/\b(interior|seat|upholstery|dashboard|trim)\b/)) return "interior";
  if (text.match(/\b(paint|clearcoat|finish)\b/)) return "paint";

  return "other";
}

function determineSeverity(title: string, description?: string): string {
  const text = `${title} ${description || ""}`.toLowerCase();

  if (text.match(/\b(critical|urgent|dangerous|safety|fail|broken|severe)\b/)) {
    return "critical";
  }
  if (text.match(/\b(serious|major|important|significant)\b/)) {
    return "high";
  }
  if (text.match(/\b(minor|small|slight|cosmetic)\b/)) {
    return "low";
  }
  return "medium";
}

function extractProblemsFromText(text: string): Array<{
  title: string;
  description: string;
  category: string;
  severity: string;
}> {
  const problems: Array<{
    title: string;
    description: string;
    category: string;
    severity: string;
  }> = [];

  // Simple extraction - look for common problem indicators
  const problemPatterns = [
    /(?:replaced|repaired|fixed|serviced)[:\s]+([^,\n]+)/gi,
    /(?:issue|problem|fault)[:\s]+([^,\n]+)/gi,
  ];

  problemPatterns.forEach((pattern) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const description = match[1]?.trim();
      if (description && description.length > 3) {
        problems.push({
          title: description.substring(0, 50),
          description,
          category: categorizeProblem(description),
          severity: determineSeverity(description),
        });
      }
    }
  });

  return problems;
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

function generateSummary(items: DiagnosisOutput["items"], input: DiagnosisInput): string {
  const criticalCount = items.filter((i) => i.severity === "critical").length;
  const highCount = items.filter((i) => i.severity === "high").length;
  const categories = new Set(items.map((i) => i.category));

  let summary = `Diagnosis for ${input.year || ""} ${input.make} ${input.model}:\n\n`;
  summary += `Found ${items.length} issue(s) across ${categories.size} specialist category(ies).\n\n`;

  if (criticalCount > 0) {
    summary += `⚠️ ${criticalCount} critical issue(s) require immediate attention.\n`;
  }
  if (highCount > 0) {
    summary += `🔴 ${highCount} high-priority issue(s) should be addressed soon.\n`;
  }

  summary += `\nSpecialists needed: ${Array.from(categories).map(getSpecialistCategoryTitle).join(", ")}.`;

  return summary;
}
