# Fixing Supabase Connection Issue

## Current Error
"Can't reach database server at `db.xkykfslmcplnibmqsbyp.supabase.co:5432`"

This means DATABASE_URL is correct, but the connection is failing.

## Common Causes & Fixes

### 1. Supabase Project is Paused (Most Common!)

**Free tier Supabase projects pause after inactivity.**

**Fix:**
1. Go to: https://supabase.com/dashboard
2. Find your project
3. If it shows "Paused" → Click **"Restore"** or **"Resume"**
4. Wait 1-2 minutes for it to start
5. Try again

### 2. Check Connection String Format

Your connection string should be:
```
postgresql://postgres:PASSWORD@db.xkykfslmcplnibmqsbyp.supabase.co:5432/postgres
```

**Verify in Supabase:**
1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the exact string
5. Replace `[YOUR-PASSWORD]` with your actual password
6. Update in Vercel

### 3. Check Password Encoding

If password has special characters, try URL-encoding:
- `+` → `%2B`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `=` → `%3D`

### 4. Verify Database is Running

1. Go to Supabase Dashboard
2. Check project status
3. Should show "Active" or "Running"
4. If paused → Resume it

### 5. Check Connection Pooling (Optional)

Supabase recommends using connection pooling for serverless (Vercel).

**Try using the pooled connection string:**
1. In Supabase Dashboard → Settings → Database
2. Look for **Connection pooling**
3. Use the **Session mode** connection string
4. It will look like: `postgresql://postgres.xxx:6543/postgres`
5. Port will be `6543` instead of `5432`

### 6. Test Connection Locally

Test if the connection string works:

```bash
# Add to .env.local
DATABASE_URL="your-connection-string"

# Test
npx prisma db push
```

If this works locally but not on Vercel → It's a Vercel environment variable issue.

## Quick Checklist

- [ ] Supabase project is **Active** (not paused)
- [ ] Connection string copied from Supabase Dashboard
- [ ] Password replaced (no `[YOUR-PASSWORD]` placeholder)
- [ ] Special characters URL-encoded if needed
- [ ] DATABASE_URL set in Vercel for **all environments**
- [ ] Redeployed after setting DATABASE_URL

## Most Likely Fix

**90% chance:** Your Supabase project is paused. Go to dashboard and resume it!
