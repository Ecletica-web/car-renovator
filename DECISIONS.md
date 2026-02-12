# Design Decisions

This document records key design decisions made during development.

## 2024-02-12: Initial Setup

### Database Choice: SQLite for Dev, PostgreSQL for Production
**Decision**: Use SQLite for local development, PostgreSQL for production
**Rationale**: 
- SQLite requires no setup, perfect for local dev
- Prisma supports both, easy to switch
- PostgreSQL better for production (concurrency, features)

### Authentication: Dev Mode + Email Provider
**Decision**: Support both dev mode (credentials) and email provider
**Rationale**:
- Dev mode allows immediate testing without email setup
- Email provider ready for production
- NextAuth supports both patterns

### Email Parsing: Custom Parser + .eml Upload
**Decision**: Start with .eml file upload, optional IMAP later
**Rationale**:
- .eml upload works immediately, no credentials needed
- Users can manually save emails
- IMAP can be added later as optional feature
- Avoids blocking on email server configuration

### UI Framework: shadcn/ui
**Decision**: Use shadcn/ui component library
**Rationale**:
- Modern, accessible components
- Tailwind-based, consistent styling
- Copy-paste components, no heavy dependencies
- Good TypeScript support

### Data Storage: JSON Arrays in Prisma
**Decision**: Store arrays (keywords, tags) as JSON strings in Prisma
**Rationale**:
- SQLite doesn't have native array support
- JSON strings work across SQLite and PostgreSQL
- Easy to parse/stringify in application code
- Simpler than separate tables for simple arrays

## 2024-02-12: Email Parsing Strategy

### Parser Approach: Multiple Selector Patterns
**Decision**: Try multiple HTML selector patterns for robustness
**Rationale**:
- OLX email format may vary
- Multiple patterns increase success rate
- Fallback patterns ensure we catch listings even if format changes

### Deduplication: URL-based
**Decision**: Use URL as unique identifier for listings
**Rationale**:
- URLs are stable identifiers
- Prevents duplicate listings from same email or multiple emails
- Simple unique constraint in database

### Matching: Keyword-based
**Decision**: Match listings to parts using keyword matching
**Rationale**:
- Simple and effective
- Users control keywords
- No ML/AI complexity needed for v1
- Can be improved later with fuzzy matching

## 2024-02-12: Outreach Generation

### Message Format: Template-based
**Decision**: Use simple template-based message generation
**Rationale**:
- Predictable, user-friendly messages
- Easy to customize per channel
- No AI complexity needed
- Users can edit before sending

### Channel Support: Email + WhatsApp
**Decision**: Support both email and WhatsApp formats
**Rationale**:
- Two most common communication channels
- Different formats (formal vs casual)
- Easy to add more channels later

### Auto-send: Not in v1
**Decision**: Generate drafts only, no automatic sending
**Rationale**:
- Safety: users review before sending
- Avoids spam concerns
- Users maintain control
- Can add auto-send later with confirmation

## 2024-02-12: Scrapyard Directory

### Scope: Global Directory
**Decision**: Scrapyards are shared across all projects
**Rationale**:
- Scrapyards are reusable resources
- Simpler data model
- Users can reuse contacts across projects
- Can add project-specific notes in outreach

## 2024-02-12: Status Tracking

### Listing Status: Simple Enum
**Decision**: Use simple status enum (new, viewed, contacted, purchased, expired)
**Rationale**:
- Covers main workflow states
- Simple to understand and use
- Easy to extend later
- No complex state machine needed

### Outreach Status: Workflow-based
**Decision**: Use workflow statuses (not_contacted → contacted → awaiting_reply → found_lead/closed)
**Rationale**:
- Matches real communication flow
- Helps users track progress
- Clear next actions

## 2024-02-12: UI/UX Decisions

### Navigation: Tab-based Project View
**Decision**: Use tabs for project sections (Parts, Listings, Scrapyards, Outreach)
**Rationale**:
- Keeps related content together
- Easy to navigate
- Familiar pattern
- Mobile-friendly

### Empty States: Action-oriented
**Decision**: Show helpful empty states with clear CTAs
**Rationale**:
- Guides users on next steps
- Reduces confusion
- Encourages engagement

### Mobile: Responsive Design
**Decision**: Mobile-first responsive design
**Rationale**:
- Users may check on mobile
- Tailwind makes responsive easy
- Important for accessibility
