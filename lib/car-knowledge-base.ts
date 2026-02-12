/**
 * Knowledge base of common problems by car make/model
 * This can be expanded with real data or connected to an external API
 */

export interface CommonProblem {
  category: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  specialist: string;
  commonYears?: number[];
}

export interface CarModelProblems {
  make: string;
  model: string;
  problems: CommonProblem[];
}

const knowledgeBase: CarModelProblems[] = [
  {
    make: "BMW",
    model: "E30",
    problems: [
      {
        category: "electrical",
        title: "Rust in trunk area",
        description: "Common rust issues in trunk floor and battery tray area",
        severity: "high",
        specialist: "body_shop",
      },
      {
        category: "engine",
        title: "Timing belt replacement",
        description: "Timing belt should be replaced every 60,000 miles",
        severity: "critical",
        specialist: "mechanic",
      },
      {
        category: "electrical",
        title: "Dashboard electrical issues",
        description: "Common problems with instrument cluster and wiring",
        severity: "medium",
        specialist: "electrician",
      },
      {
        category: "suspension",
        title: "Worn suspension bushings",
        description: "Front and rear suspension bushings wear out over time",
        severity: "medium",
        specialist: "mechanic",
      },
    ],
  },
  {
    make: "Mercedes-Benz",
    model: "W124",
    problems: [
      {
        category: "body",
        title: "Rust in wheel arches",
        description: "Common rust in rear wheel arches and sills",
        severity: "high",
        specialist: "body_shop",
      },
      {
        category: "engine",
        title: "Head gasket issues",
        description: "Head gasket may need replacement in older models",
        severity: "critical",
        specialist: "mechanic",
      },
      {
        category: "electrical",
        title: "Wiring harness degradation",
        description: "Biodegradable wiring harnesses degrade over time",
        severity: "high",
        specialist: "electrician",
      },
    ],
  },
  {
    make: "Porsche",
    model: "911",
    problems: [
      {
        category: "engine",
        title: "Oil leaks",
        description: "Common oil leaks from various seals",
        severity: "medium",
        specialist: "mechanic",
      },
      {
        category: "body",
        title: "Rust in floor pans",
        description: "Rust can develop in floor pans and sills",
        severity: "high",
        specialist: "body_shop",
      },
    ],
  },
];

export function getCommonProblems(
  make: string,
  model: string,
  year?: number
): CommonProblem[] {
  const normalizedMake = make.toLowerCase().trim();
  const normalizedModel = model.toLowerCase().trim();

  const modelProblems = knowledgeBase.find(
    (kb) =>
      kb.make.toLowerCase() === normalizedMake &&
      kb.model.toLowerCase() === normalizedModel
  );

  if (!modelProblems) {
    // Return generic problems if specific model not found
    return [
      {
        category: "engine",
        title: "General engine maintenance",
        description: "Regular engine maintenance and inspection recommended",
        severity: "medium",
        specialist: "mechanic",
      },
      {
        category: "body",
        title: "Rust inspection",
        description: "Check for rust in common areas (wheel arches, sills, floor pans)",
        severity: "medium",
        specialist: "body_shop",
      },
      {
        category: "electrical",
        title: "Electrical system check",
        description: "Inspect wiring and electrical components",
        severity: "low",
        specialist: "electrician",
      },
    ];
  }

  // Filter by year if provided
  if (year) {
    return modelProblems.problems.filter(
      (p) => !p.commonYears || p.commonYears.includes(year)
    );
  }

  return modelProblems.problems;
}

export function getSpecialistLabel(type: string): string {
  const labels: Record<string, string> = {
    mechanic: "Mechanic / Engine Specialist",
    electrician: "Auto Electrician",
    body_shop: "Body Shop / Rust Repair",
    interior: "Interior / Upholstery",
    paint: "Paint Shop",
    suspension: "Suspension Specialist",
    brakes: "Brake Specialist",
    transmission: "Transmission Specialist",
    other: "Other Specialist",
  };
  return labels[type] || type;
}
