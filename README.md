# Classic Car Project Hub

A web-based tool to help classic car owners manage renovation projects, track parts sourcing via OLX marketplace alerts, and manage outreach to scrapyards/dismantlers.

## Features

- **Project Management**: Create and manage classic car renovation projects
- **Parts Wishlist**: Track parts you need for your project
- **OLX Alerts**: Configure keyword-based alerts for parts on OLX marketplace
- **Email Ingestion**: Upload OLX email alerts (.eml files) to automatically import listings
- **Listings Feed**: View and manage found listings with status tracking
- **Scrapyard Directory**: Maintain a directory of scrapyards and dismantlers
- **Outreach Tracker**: Generate personalized outreach messages and track communication

## Quickstart

### Prerequisites

- Node.js 18+ and npm
- SQLite (default) or PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd car-renovator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - Database connection string (default: `file:./dev.db` for SQLite)
- `NEXTAUTH_URL` - Your app URL (default: `http://localhost:3000`)
- `NEXTAUTH_SECRET` - Generate a random secret
- `DEV_AUTH_ENABLED` - Set to `"true"` for dev mode (no email required)

4. Set up the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Using Dev Auth Mode

When `DEV_AUTH_ENABLED=true` in `.env`, you can sign in with any email address. The system will automatically create a user account.

## Usage

### Creating a Project

1. Sign in to your account
2. Click "New Project"
3. Enter your car details (make, model, year, location)
4. Click "Create Project"

### Adding Parts

1. Open your project
2. Go to the "Parts" tab
3. Click "Add Part"
4. Enter part name, description, and keywords
5. Keywords are used for matching OLX listings

### Configuring OLX Alerts

1. Open a part from your wishlist
2. Scroll to "OLX Alerts" section
3. Click "Create Alert"
4. Enter keywords (comma-separated)
5. Optionally set price range and location radius
6. Click "Create Alert"

### Uploading OLX Email Alerts

1. Set up saved searches on OLX for your parts
2. When you receive email alerts, save them as .eml files
3. In your project, go to "Listings" tab
4. Click "Upload Email"
5. Select the .eml file
6. Listings will be automatically matched to your parts

### Managing Scrapyards

1. Go to "Scrapyards" tab in your project
2. Click "Add Scrapyard"
3. Enter scrapyard details (name, contact info, location)
4. Add tags for easy filtering

### Creating Outreach

1. Go to "Outreach" tab in your project
2. Select a part and scrapyard
3. Choose channel (Email or WhatsApp)
4. Click "Generate Outreach"
5. Copy the generated message
6. Mark as "Contacted" after sending
7. Track replies and update status

## Project Structure

```
car-renovator/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── projects/          # Project pages
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   └── ...                # Feature components
├── lib/                    # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   ├── email-parser.ts    # OLX email parser
│   └── outreach-generator.ts # Outreach message generator
├── prisma/                 # Prisma schema
│   └── schema.prisma      # Database schema
└── tests/                  # Test files
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create database migration
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run tests

## Database

The project uses Prisma ORM with SQLite by default (for local development) or PostgreSQL (for production).

To use PostgreSQL, update `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/car_renovator"
```

Then update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Run `npm run db:push` to apply changes.

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `DATABASE_URL` - Database connection string
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth secret (generate with `openssl rand -base64 32`)
- `DEV_AUTH_ENABLED` - Enable dev auth mode (set to `"true"`)

Optional (for email provider):
- `EMAIL_SERVER_HOST` - SMTP server host
- `EMAIL_SERVER_PORT` - SMTP server port
- `EMAIL_SERVER_USER` - SMTP username
- `EMAIL_SERVER_PASSWORD` - SMTP password
- `EMAIL_FROM` - From email address

Optional (for IMAP ingestion):
- `IMAP_HOST` - IMAP server host
- `IMAP_PORT` - IMAP server port
- `IMAP_USER` - IMAP username
- `IMAP_PASS` - IMAP password
- `IMAP_FOLDER` - IMAP folder to check

## Testing

Run tests with:
```bash
npm test
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Other Platforms

1. Build the project: `npm run build`
2. Set environment variables
3. Run migrations: `npm run db:migrate`
4. Start server: `npm start`

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## License

MIT
