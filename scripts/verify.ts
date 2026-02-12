#!/usr/bin/env ts-node

/**
 * Verification script for Classic Car Project Hub
 * 
 * This script verifies that the core components are working correctly:
 * - Database connection
 * - Email parser
 * - API endpoints (basic checks)
 */

import { PrismaClient } from "@prisma/client";
import { parseOLXEmail, parseEMLFile } from "../lib/email-parser";
import * as fs from "fs";
import * as path from "path";

const db = new PrismaClient();

interface VerificationResult {
  name: string;
  status: "pass" | "fail";
  message: string;
}

const results: VerificationResult[] = [];

function addResult(name: string, status: "pass" | "fail", message: string) {
  results.push({ name, status, message });
  const icon = status === "pass" ? "✅" : "❌";
  console.log(`${icon} ${name}: ${message}`);
}

async function verifyDatabase() {
  try {
    await db.$connect();
    const userCount = await db.user.count();
    addResult("Database Connection", "pass", `Connected successfully (${userCount} users)`);
    return true;
  } catch (error: any) {
    addResult("Database Connection", "fail", error.message);
    return false;
  }
}

async function verifyEmailParser() {
  try {
    // Test with sample HTML
    const sampleHTML = `
      <html>
        <body>
          <a href="https://www.olx.pt/item/123456">Test Part €100</a>
        </body>
      </html>
    `;

    const listings = parseOLXEmail(sampleHTML);
    
    if (listings.length > 0 && listings[0].url.includes("olx.pt")) {
      addResult("Email Parser (HTML)", "pass", `Parsed ${listings.length} listing(s)`);
      return true;
    } else {
      addResult("Email Parser (HTML)", "fail", "Failed to parse sample HTML");
      return false;
    }
  } catch (error: any) {
    addResult("Email Parser (HTML)", "fail", error.message);
    return false;
  }
}

async function verifyEMLParser() {
  try {
    const fixturePath = path.join(__dirname, "../tests/fixtures/sample-olx-email.eml");
    
    if (!fs.existsSync(fixturePath)) {
      addResult("Email Parser (.eml)", "fail", "Fixture file not found");
      return false;
    }

    const emlContent = fs.readFileSync(fixturePath, "utf-8");
    const { html, date } = await parseEMLFile(emlContent);

    if (html && html.length > 0) {
      addResult("Email Parser (.eml)", "pass", "Successfully parsed .eml file");
      return true;
    } else {
      addResult("Email Parser (.eml)", "fail", "Failed to extract HTML from .eml");
      return false;
    }
  } catch (error: any) {
    addResult("Email Parser (.eml)", "fail", error.message);
    return false;
  }
}

async function verifySchema() {
  try {
    // Try to query each model
    await db.user.findMany({ take: 1 });
    await db.carProject.findMany({ take: 1 });
    await db.part.findMany({ take: 1 });
    await db.alert.findMany({ take: 1 });
    await db.listing.findMany({ take: 1 });
    await db.scrapyard.findMany({ take: 1 });
    await db.outreach.findMany({ take: 1 });
    await db.emailIngestion.findMany({ take: 1 });

    addResult("Database Schema", "pass", "All models accessible");
    return true;
  } catch (error: any) {
    addResult("Database Schema", "fail", error.message);
    return false;
  }
}

async function verifyOutreachGenerator() {
  try {
    const { generateOutreachDraft } = await import("../lib/outreach-generator");

    const draft = generateOutreachDraft({
      carMake: "BMW",
      carModel: "E30",
      carYear: 1990,
      partName: "Front Bumper",
      partKeywords: ["bumper", "front"],
      scrapyardName: "Test Scrapyard",
      userLocation: "Lisboa",
      channel: "email",
    });

    if (draft && draft.includes("BMW") && draft.includes("Front Bumper")) {
      addResult("Outreach Generator", "pass", "Generated draft successfully");
      return true;
    } else {
      addResult("Outreach Generator", "fail", "Generated draft missing expected content");
      return false;
    }
  } catch (error: any) {
    addResult("Outreach Generator", "fail", error.message);
    return false;
  }
}

async function main() {
  console.log("🔍 Verifying Classic Car Project Hub...\n");

  const checks = [
    verifyDatabase,
    verifySchema,
    verifyEmailParser,
    verifyEMLParser,
    verifyOutreachGenerator,
  ];

  for (const check of checks) {
    await check();
  }

  console.log("\n📊 Summary:");
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const total = results.length;

  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    console.log("\n❌ Some checks failed. Please review the errors above.");
    process.exit(1);
  } else {
    console.log("\n✅ All checks passed!");
    process.exit(0);
  }
}

main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
