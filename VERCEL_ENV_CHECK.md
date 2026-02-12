# Vercel Environment Variables - Verification Checklist

## ⚠️ Current Issue
The app is still trying to use SQLite, which means `DATABASE_URL` is either:
- Not set in Vercel
- Set incorrectly (still pointing to SQLite)
- Not saved properly

## ✅ Step-by-Step Fix

### 1. Go to Vercel Environment Variables

1. Visit: https://vercel.com/dashboard
2. Click your **`car-renovator`** project
3. Go to **Settings** → **Environment Variables**

### 2. Check DATABASE_URL

Look for `DATABASE_URL` in the list:

**❌ WRONG (SQLite - won't work):**
```
DATABASE_URL=file:./dev.db
```

**✅ CORRECT (PostgreSQL - what you need):**
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xkykfslmcplnibmqsbyp.supabase.co:5432/postgres
```

### 3. If DATABASE_URL is Missing or Wrong

**To Add/Update:**
1. Click **"Add New"** (or edit existing)
2. Key: `DATABASE_URL`
3. Value: `postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xkykfslmcplnibmqsbyp.supabase.co:5432/postgres`
   - **Replace `YOUR_ACTUAL_PASSWORD`** with your Supabase database password
   - If password has special characters, URL-encode them:
     - `@` → `%40`
     - `#` → `%23`
     - `$` → `%24`
     - `%` → `%25`
     - `&` → `%26`
     - `+` → `%2B`
     - `=` → `%3D`
4. **Environment**: Check all three:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Click **Save**

### 4. Verify Other Required Variables

Make sure these are also set:

**NEXTAUTH_URL**
- Value: `https://car-renovator.vercel.app` (or your actual Vercel URL)

**NEXTAUTH_SECRET**
- Value: Any random string (generate at https://generate-secret.vercel.app/32)

**DEV_AUTH_ENABLED**
- Value: `true`

### 5. Redeploy After Changes

**IMPORTANT:** After updating environment variables:

1. Go to **Deployments** tab
2. Click **⋯** on the latest deployment
3. Click **Redeploy**
4. **OR** push a new commit to trigger auto-deploy

Environment variables are only applied on new deployments!

### 6. Verify Connection String Format

Your connection string should look exactly like this (with your password):
```
postgresql://postgres:your-password-here@db.xkykfslmcplnibmqsbyp.supabase.co:5432/postgres
```

**Common mistakes:**
- ❌ Forgetting to replace `[YOUR-PASSWORD]` or `YOUR_ACTUAL_PASSWORD`
- ❌ Using `file:./dev.db` (SQLite)
- ❌ Missing `postgresql://` prefix
- ❌ Wrong port (should be `:5432`)
- ❌ Not URL-encoding special characters in password

## Quick Test

After updating and redeploying:

1. Visit: `https://car-renovator.vercel.app`
2. Click **"Continue as Guest"**
3. If it works → ✅ Database connected!
4. If still shows error → Check Vercel build logs for database connection errors

## Still Not Working?

Check Vercel build logs:
1. Go to **Deployments**
2. Click on latest deployment
3. Check **Build Logs** for database errors
4. Look for messages about connection failures
