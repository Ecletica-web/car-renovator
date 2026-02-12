# Quick PostgreSQL Setup for Vercel

## The Problem
SQLite doesn't work on Vercel because it requires write access to the filesystem, which Vercel doesn't allow.

## Solution: Use Supabase (Free PostgreSQL)

### Step 1: Create Supabase Account (2 minutes)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (easiest)
4. Create a new project:
   - Name: `car-renovator` (or any name)
   - Database Password: **Save this password!** You'll need it
   - Region: Choose closest to you
   - Click "Create new project"
5. Wait 2-3 minutes for project to be ready

### Step 2: Get Connection String

1. In your Supabase project, go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with the password you saved
6. It will look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### Step 3: Update Prisma Schema

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 4: Update Vercel Environment Variables

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on `car-renovator` project
3. Go to **Settings** → **Environment Variables**
4. Update `DATABASE_URL`:
   - Key: `DATABASE_URL`
   - Value: Your Supabase connection string (from Step 2)
   - Environment: Production, Preview, Development (select all)
5. Click **Save**

### Step 5: Push Database Schema

Run locally (or use Vercel CLI):

```bash
npm run db:push
```

Or set up a script to run migrations automatically.

### Step 6: Redeploy

1. Go to Vercel dashboard
2. Click **Deployments**
3. Click the **⋯** menu on latest deployment
4. Click **Redeploy**

Or just push a new commit to trigger auto-deploy.

## Alternative: Neon (Another Free PostgreSQL Option)

1. Go to https://neon.tech
2. Sign up with GitHub
3. Create a project
4. Copy the connection string
5. Follow steps 3-6 above

## After Setup

Once PostgreSQL is configured:
- ✅ Guest sign-in will work
- ✅ All database features will work
- ✅ File uploads will work (but consider cloud storage for production)

## Quick Test

After setup, try:
1. Refresh your Vercel app
2. Click "Continue as Guest"
3. Should work now! 🎉
