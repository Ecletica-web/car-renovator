# Diagnosis Features - Implementation Summary

## Overview

The application has been enhanced with a comprehensive car diagnosis system that analyzes problems, photos, documents, and generates a structured diagnosis with specialist recommendations.

## Key Features Implemented

### 1. Enhanced Project Creation
- **Multi-step form** with 3 steps:
  1. Car Information (make, model, year, location, VIN, mileage)
  2. Problems & Media (problems, photos, documents, replacements)
  3. Review & Generate Diagnosis

### 2. Problem Reporting
- Users can add multiple problems with:
  - Title and description
  - Category (engine, electrical, body, suspension, brakes, transmission, interior, other)
  - Automatic severity detection

### 3. Photo Upload & AI Analysis
- Upload multiple car photos
- **AI Image Analysis** using OpenAI Vision API:
  - Detects visible issues (rust, damage, wear)
  - Categorizes problems
  - Assigns severity levels
  - Provides recommendations
- Falls back to mock analysis if API key not configured

### 4. Document Upload
- Upload service records, repair invoices, manuals
- Text extraction from documents (ready for implementation)
- Problem extraction from service records

### 5. Previous Replacements Tracking
- Record past repairs and replacements
- Track part names, dates, costs, workshops
- Used in diagnosis to avoid duplicate recommendations

### 6. Diagnosis Engine
Combines multiple data sources:
- **User-reported problems**
- **AI findings** from photo analysis
- **Document findings** from service records
- **Knowledge base** of common problems for car make/model
- **Previous replacements** to avoid duplicates

### 7. Knowledge Base
- Pre-loaded common problems for popular classic cars:
  - BMW E30
  - Mercedes-Benz W124
  - Porsche 911
- Generic problems for unknown models
- Expandable with more car models

### 8. Structured Diagnosis Output
- **Tree structure** organized by specialist category:
  - Engine & Mechanical
  - Electrical System
  - Body & Rust Repair
  - Suspension & Steering
  - Brake System
  - Transmission
  - Interior & Upholstery
  - Paint & Finish
  - Other Services

### 9. Specialist Contacts
- **Placeholder contacts** generated automatically
- 2 contacts per specialist category
- Includes phone, email, location
- Marked as placeholders for easy identification
- Can be updated with real contacts later

### 10. Diagnosis Tree View
- **Hierarchical display** of problems
- Expandable/collapsible categories
- Color-coded severity indicators
- Estimated costs and time
- Direct contact buttons (phone/email)
- Clean, modern UI

## Technical Implementation

### Database Schema Updates
- `Problem` - User-reported problems
- `Photo` - Car photos with AI analysis
- `Document` - Uploaded documents
- `Replacement` - Previous repairs
- `Diagnosis` - Generated diagnosis
- `DiagnosisItem` - Individual diagnosis items (tree structure)
- `SpecialistContact` - Contact information

### API Endpoints
- `POST /api/projects/[id]/upload` - File uploads (photos/documents)
- `POST /api/projects/[id]/problems` - Add problems
- `POST /api/projects/[id]/replacements` - Add replacements
- `POST /api/projects/[id]/diagnosis/generate` - Generate diagnosis

### Key Libraries
- **OpenAI Vision API** - Image analysis (optional)
- **Cheerio** - HTML parsing (for documents)
- **Prisma** - Database ORM
- **Next.js** - Framework

## Usage Flow

1. **Create Project**
   - Enter car information
   - Click "Next: Add Problems"

2. **Add Information**
   - Report problems
   - Upload photos (AI analyzes automatically)
   - Upload documents
   - Add previous replacements

3. **Generate Diagnosis**
   - Click "Generate Diagnosis"
   - System combines all information
   - Creates structured diagnosis tree

4. **View Diagnosis**
   - Navigate to diagnosis page
   - See organized problems by specialist
   - View contacts for each specialist
   - Expand/collapse categories

## Configuration

### OpenAI API (Optional)
Add to `.env`:
```
OPENAI_API_KEY="your-key-here"
```

If not configured, the system uses mock analysis (still functional for testing).

## Future Enhancements

- Real document text extraction (PDF parsing)
- More car models in knowledge base
- User-editable specialist contacts
- Cost tracking and estimates
- Timeline/progress tracking
- Photo gallery with annotations
- Export diagnosis as PDF

## Notes

- Placeholder contacts are clearly marked and can be replaced
- AI analysis requires OpenAI API key (optional)
- Diagnosis is regenerated each time (updates existing)
- All file uploads stored in `/public/uploads/[projectId]/`
