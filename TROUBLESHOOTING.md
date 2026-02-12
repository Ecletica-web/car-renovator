# Troubleshooting Database Connection Issues

## Current Error
"Database connection issue. SQLite doesn't work on Vercel - you need PostgreSQL."

## Checklist

### ✅ Step 1: Verify Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Click your `car-renovator` project
3. Go to **Settings** → **Environment Variables**
4. Verify `DATABASE_URL` exists and is correct:
   - Should start with: `postgresql://postgres:`
   - Should NOT contain `[YOUR-PASSWORD]` - must have actual password
   - Should point to: `db.xkykfslmcplnibmqsbyp.supabase.co:5432/postgres`

### ✅ Step 2: Check Password Encoding

If your Supabase password contains special characters, URL-encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

### ✅ Step 3: Test Connection String Format

Your connection string should look like:
```
postgresql://postgres:your-actual-password@db.xkykfslmcplnibmqsbyp.supabase.co:5432/postgres
```

### ✅ Step 4: Push Database Schema

After adding DATABASE_URL to Vercel:

**Option A: Via Vercel CLI (Recommended)**
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login
vercel login

# Link project
cd car-renovator
vercel link

# Push schema
vercel env pull .env.local
npx prisma db push
```

**Option B: Via Supabase Dashboard**
1. Go to Supabase Dashboard
2. Go to **SQL Editor**
3. Run the SQL from your Prisma schema manually

**Option C: Wait for Auto-Deploy**
The schema should be pushed automatically on next deployment, but you may need to trigger it manually first.

### ✅ Step 5: Verify All Environment Variables

Make sure these are set in Vercel:

- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `NEXTAUTH_URL` - Your Vercel app URL
- ✅ `NEXTAUTH_SECRET` - Random secret string
- ✅ `DEV_AUTH_ENABLED` - Set to `true` (optional)

### ✅ Step 6: Redeploy

1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Wait for build to complete

## Common Issues

### Issue: "Can't reach database server"
- Check if Supabase project is active
- Verify connection string is correct
- Check if IP is whitelisted (Supabase allows all by default)

### Issue: "Authentication failed"
- Password is incorrect
- Password needs URL encoding
- Check Supabase project settings

### Issue: "Relation does not exist"
- Database schema not pushed
- Run `npx prisma db push` manually
- Or use Supabase SQL Editor to create tables

## Quick Test

Test your connection string locally:

```bash
# Add to .env.local
DATABASE_URL="your-connection-string"

# Test connection
npx prisma db push
```

If this works locally, the issue is with Vercel environment variables.

## Still Not Working?

1. Check Vercel build logs for database errors
2. Verify Supabase project is running
3. Try regenerating connection string in Supabase
4. Check Vercel environment variables are saved correctly
