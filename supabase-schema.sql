-- SQL Schema for Classic Car Project Hub
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- Account table
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- Session table
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");

-- VerificationToken table
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CarProject table
CREATE TABLE IF NOT EXISTS "CarProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "trim" TEXT,
    "city" TEXT,
    "region" TEXT,
    "mileage" INTEGER,
    "vin" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "diagnosisCompleted" BOOLEAN NOT NULL DEFAULT false,
    "diagnosisCompletedAt" TIMESTAMP(3),

    CONSTRAINT "CarProject_pkey" PRIMARY KEY ("id")
);

-- Part table
CREATE TABLE IF NOT EXISTS "Part" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "keywords" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- Alert table
CREATE TABLE IF NOT EXISTS "Alert" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "priceRangeMin" DOUBLE PRECISION,
    "priceRangeMax" DOUBLE PRECISION,
    "locationRadius" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- Listing table
CREATE TABLE IF NOT EXISTS "Listing" (
    "id" TEXT NOT NULL,
    "partId" TEXT,
    "alertId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'olx_email',
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "location" TEXT,
    "postedAt" TIMESTAMP(3),
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'new',

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Listing_url_key" ON "Listing"("url");

-- Scrapyard table
CREATE TABLE IF NOT EXISTS "Scrapyard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "notes" TEXT,
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scrapyard_pkey" PRIMARY KEY ("id")
);

-- Outreach table
CREATE TABLE IF NOT EXISTS "Outreach" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "scrapyardId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "messageDraft" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_contacted',
    "lastContactedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outreach_pkey" PRIMARY KEY ("id")
);

-- EmailIngestion table
CREATE TABLE IF NOT EXISTS "EmailIngestion" (
    "id" TEXT NOT NULL,
    "messageIdHash" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listingCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EmailIngestion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EmailIngestion_messageIdHash_key" ON "EmailIngestion"("messageIdHash");

-- Problem table
CREATE TABLE IF NOT EXISTS "Problem" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "reportedBy" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- Photo table
CREATE TABLE IF NOT EXISTS "Photo" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "description" TEXT,
    "aiAnalysis" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- Document table
CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "extractedText" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- Replacement table
CREATE TABLE IF NOT EXISTS "Replacement" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "cost" DOUBLE PRECISION,
    "workshop" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Replacement_pkey" PRIMARY KEY ("id")
);

-- Diagnosis table
CREATE TABLE IF NOT EXISTS "Diagnosis" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "summary" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Diagnosis_projectId_key" ON "Diagnosis"("projectId");

-- DiagnosisItem table
CREATE TABLE IF NOT EXISTS "DiagnosisItem" (
    "id" TEXT NOT NULL,
    "diagnosisId" TEXT NOT NULL,
    "problemId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DOUBLE PRECISION,
    "estimatedTime" TEXT,
    "parentId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosisItem_pkey" PRIMARY KEY ("id")
);

-- SpecialistContact table
CREATE TABLE IF NOT EXISTS "SpecialistContact" (
    "id" TEXT NOT NULL,
    "diagnosisItemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "rating" DOUBLE PRECISION,
    "notes" TEXT,
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecialistContact_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CarProject" ADD CONSTRAINT "CarProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Part" ADD CONSTRAINT "Part_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CarProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Outreach" ADD CONSTRAINT "Outreach_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CarProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Outreach" ADD CONSTRAINT "Outreach_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Outreach" ADD CONSTRAINT "Outreach_scrapyardId_fkey" FOREIGN KEY ("scrapyardId") REFERENCES "Scrapyard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CarProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CarProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Document" ADD CONSTRAINT "Document_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CarProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Replacement" ADD CONSTRAINT "Replacement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CarProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CarProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiagnosisItem" ADD CONSTRAINT "DiagnosisItem_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "Diagnosis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DiagnosisItem" ADD CONSTRAINT "DiagnosisItem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DiagnosisItem" ADD CONSTRAINT "DiagnosisItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DiagnosisItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SpecialistContact" ADD CONSTRAINT "SpecialistContact_diagnosisItemId_fkey" FOREIGN KEY ("diagnosisItemId") REFERENCES "DiagnosisItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
