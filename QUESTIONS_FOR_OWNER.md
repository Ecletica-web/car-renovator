# Questions for Owner

This file consolidates any questions or decisions needed from the project owner.

## Current Status

No blocking questions at this time. The project has been implemented according to the specification.

## Optional Decisions

### IMAP Integration
**Question**: Do you want automatic IMAP email ingestion, or is manual .eml upload sufficient?
**Impact**: IMAP requires email server credentials and adds complexity
**Recommendation**: Start with .eml upload, add IMAP later if needed

### Email Provider Setup
**Question**: For production, do you have SMTP credentials for NextAuth email provider?
**Impact**: Needed for email-based authentication
**Current**: Dev mode works without email setup

### Deployment Target
**Question**: Where do you plan to deploy this application?
**Impact**: Affects database choice (SQLite vs PostgreSQL) and environment setup
**Recommendation**: Vercel + PostgreSQL for production

### Facebook Marketplace
**Question**: Should we add Facebook Marketplace monitoring in future versions?
**Impact**: Requires compliance review and different approach than OLX
**Current**: Not included in v1 due to compliance concerns

## Future Enhancements

If you'd like to prioritize any of these, let me know:
- IMAP automatic ingestion
- More marketplace integrations
- Parts photo uploads
- Cost tracking
- Timeline/progress tracking
