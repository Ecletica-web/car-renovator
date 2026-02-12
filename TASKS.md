# Task List

## Completed Tasks

- [x] Initialize Next.js project with TypeScript, Tailwind, and shadcn/ui
- [x] Configure Prisma with PostgreSQL/SQLite and create schema for all models
- [x] Implement NextAuth with email provider or dev mode
- [x] Build CarProject CRUD and dashboard UI
- [x] Implement parts wishlist CRUD and management UI
- [x] Create alert configuration UI per part (keywords, filters)
- [x] Build OLX email parser with fixtures and unit tests
- [x] Implement .eml file upload endpoint and UI
- [x] Create listings feed with deduplication and status management
- [x] Build scrapyard directory CRUD
- [x] Implement outreach draft generator and tracking board
- [x] Create dashboard with stats (new listings, open outreaches)
- [x] Complete README, SPEC.md, DECISIONS.md, and TASKS.md

## Remaining Tasks

### Optional Enhancements

- [ ] Add optional IMAP ingestion (feature-flagged, requires env vars)
  - Create IMAP service
  - Add "Run ingestion now" button
  - Track processed emails
  - Add error handling

- [ ] UI Polish
  - Add loading skeletons for better UX
  - Improve error boundaries
  - Add toast notifications for actions
  - Enhance mobile responsiveness
  - Add keyboard shortcuts

- [ ] Testing
  - Add integration tests for critical flows
  - Add E2E tests for main user journeys
  - Test email parser with real OLX emails
  - Test deduplication logic

- [ ] Verification Script
  - Create scripts/verify.ts
  - Test database connections
  - Verify email parser
  - Check API endpoints
  - Validate data integrity

### Future Features

- [ ] Parts photo uploads
- [ ] Cost tracking per part/project
- [ ] Timeline/progress tracking
- [ ] Parts compatibility database
- [ ] More marketplace integrations
- [ ] Advanced search and filtering
- [ ] Export functionality (CSV, PDF reports)
- [ ] Multi-user collaboration
- [ ] Mobile app

## Notes

- IMAP integration is marked as optional and can be added later
- Focus on core functionality first, polish can come after
- Testing can be expanded incrementally
- Future features depend on user feedback
