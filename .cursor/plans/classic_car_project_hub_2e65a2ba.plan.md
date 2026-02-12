---
name: Classic Car Project Hub
overview: Build a complete v1 web application for managing classic car renovation projects, focusing on parts sourcing via OLX email alerts and scrapyard outreach management, with a modern UI and autonomous development workflow.
todos:
  - id: init-project
    content: Initialize Next.js project with TypeScript, Tailwind, and shadcn/ui
    status: completed
  - id: setup-database
    content: Configure Prisma with PostgreSQL/SQLite and create schema for all models
    status: completed
  - id: setup-auth
    content: Implement NextAuth with email provider or dev mode
    status: completed
  - id: project-crud
    content: Build CarProject CRUD and dashboard UI
    status: completed
  - id: parts-crud
    content: Implement parts wishlist CRUD and management UI
    status: completed
  - id: alerts-config
    content: Create alert configuration UI per part (keywords, filters)
    status: completed
  - id: email-parser
    content: Build OLX email parser with fixtures and unit tests
    status: completed
  - id: eml-upload
    content: Implement .eml file upload endpoint and UI
    status: completed
  - id: listings-feed
    content: Create listings feed with deduplication and status management
    status: completed
  - id: imap-optional
    content: Add optional IMAP ingestion (feature-flagged, requires env vars)
    status: pending
  - id: scrapyard-crud
    content: Build scrapyard directory CRUD
    status: completed
  - id: outreach-system
    content: Implement outreach draft generator and tracking board
    status: completed
  - id: ui-polish
    content: Add empty states, loading skeletons, error handling, and mobile responsiveness
    status: pending
  - id: dashboard-stats
    content: Create dashboard with stats (new listings, open outreaches)
    status: completed
  - id: verification-script
    content: Write scripts/verify.ts for end-to-end validation
    status: completed
  - id: documentation
    content: Complete README, SPEC.md, DECISIONS.md, and TASKS.md
    status: completed
isProject: false
---

