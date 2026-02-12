#!/usr/bin/env ts-node

/**
 * Setup database schema for production
 * Run this after deployment or manually via Vercel CLI
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up database schema...");
  
  try {
    // Test connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    
    // Push schema
    const { execSync } = require("child_process");
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    
    console.log("✅ Database schema pushed successfully");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
