# Classic Car Project Hub - Specification

## Overview

A web application to help classic car owners manage renovation projects by organizing parts sourcing, monitoring marketplace listings, and managing outreach to scrapyards.

## Problem Statement

Classic car restoration requires:
- Finding rare parts that are no longer manufactured
- Monitoring multiple marketplaces for parts availability
- Contacting scrapyards and dismantlers to locate donor cars
- Organizing the renovation workflow across different specialists
- Tracking communication with multiple contacts

Current solutions are fragmented and require manual tracking across multiple platforms.

## Target Users

**Primary User**: Classic car enthusiast working on a restoration project
- May not be technically savvy about cars
- Needs simple interface to manage complex project
- Wants to minimize manual research and tracking

**Secondary Users**: 
- Professional restorers managing multiple projects
- Car clubs organizing group projects

## Core Features

### 1. Project Management
- Create car projects (make, model, year, location)
- Track project status and notes
- Organize by project

### 2. Parts Wishlist
- Add parts with descriptions and keywords
- Link parts to projects
- Track parts status (needed, found, purchased)

### 3. OLX Alert Configuration
- Configure keyword-based alerts per part
- Set price range filters
- Set location radius filters
- Enable/disable alerts

### 4. Email Ingestion
- Upload .eml files from OLX email alerts
- Parse HTML emails to extract listings
- Match listings to parts based on keywords
- Deduplicate listings by URL
- Track processed emails

### 5. Listings Feed
- View all found listings
- Filter by status (new, viewed, contacted, purchased, expired)
- Filter by part
- Mark listings as viewed/contacted
- Link to original listing

### 6. Scrapyard Directory
- Add scrapyards with contact information
- Store location, phone, email
- Add tags for categorization
- Link to projects

### 7. Outreach Management
- Generate personalized outreach messages
- Support email and WhatsApp formats
- Track outreach status (not contacted, contacted, awaiting reply, found lead, closed)
- Copy messages to clipboard
- Track last contacted date
- Add notes on replies

## User Flows

### Flow 1: Initial Setup
1. User signs in (dev mode or email)
2. Creates first project
3. Adds parts to wishlist
4. Configures OLX alerts for parts

### Flow 2: Parts Discovery
1. User receives OLX email alert
2. Saves email as .eml file
3. Uploads file in app
4. System parses email and extracts listings
5. Listings matched to parts based on keywords
6. User sees new listings in feed
7. User marks listings as viewed/contacted

### Flow 3: Scrapyard Outreach
1. User adds scrapyard to directory
2. Selects part and scrapyard
3. Generates outreach message
4. Copies message and sends via email/WhatsApp
5. Marks as "contacted"
6. Updates status when receives reply
7. Adds notes about response

## Data Model

### User
- Authentication information
- Projects

### CarProject
- Car details (make, model, year, trim)
- Location (city, region)
- Parts
- Outreaches

### Part
- Name, description
- Keywords (for matching)
- Notes
- Alerts
- Listings
- Outreaches

### Alert
- Part reference
- Keywords array
- Price range (min/max)
- Location radius
- Active status

### Listing
- Source (olx_email)
- Title, URL (unique)
- Price, location
- Posted date
- Status (new, viewed, contacted, purchased, expired)
- Linked to part and alert

### Scrapyard
- Name, contact info
- Location
- Tags
- Outreaches

### Outreach
- Project, part, scrapyard references
- Channel (email/whatsapp)
- Message draft
- Status
- Last contacted date
- Notes

### EmailIngestion
- Message hash (for deduplication)
- Source
- Listing count
- Ingested date

## Technical Architecture

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Server Components where possible

### Backend
- Next.js API routes
- Prisma ORM
- SQLite (dev) / PostgreSQL (production)

### Authentication
- NextAuth.js
- Email provider (production)
- Dev mode (development)

### Email Parsing
- Custom parser for OLX email HTML
- Cheerio for HTML parsing
- .eml file parsing
- Optional IMAP integration

## Non-Goals (v1)

- Facebook Marketplace scraping (compliance concerns)
- Automatic message sending (safety)
- Payment processing
- Multi-user collaboration
- Mobile app
- Advanced analytics
- Image recognition for parts

## Future Enhancements

- IMAP automatic ingestion
- More marketplace integrations
- Parts compatibility database
- Cost tracking
- Timeline/progress tracking
- Photo uploads for parts
- Parts condition assessment
- Integration with car parts databases

## Success Metrics

- Users can successfully create projects and add parts
- Email ingestion correctly parses and matches listings
- Outreach messages are generated correctly
- Users can track their renovation progress
- System reduces manual research time
