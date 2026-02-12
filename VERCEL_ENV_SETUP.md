# Vercel Environment Variables Setup

## Step 1: Prepare Your Connection String

Your Supabase connection string:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xkykfslmcplnibmqsbyp.supabase.co:5432/postgres
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

If your password contains special characters, you may need to URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- etc.

## Step 2: Add to Vercel

1. Go to: https://vercel.com/dashboard
2. Click on your `car-renovator` project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

### Required Variables:

**DATABASE_URL**
- Key: `DATABASE_URL`
- Value: `postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xkykfslmcplnibmqsbyp.supabase.co:5432/postgres`
- Environment: ✅ Production, ✅ Preview, ✅ Development (check all three)
- Click **Save**

**NEXTAUTH_URL**
- Key: `NEXTAUTH_URL`
- Value: `https://car-renovator.vercel.app` (or your actual Vercel URL)
- Environment: ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

**NEXTAUTH_SECRET**
- Key: `NEXTAUTH_SECRET`
- Value: Generate a random secret (use: https://generate-secret.vercel.app/32)
- Environment: ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

**DEV_AUTH_ENABLED** (Optional - for guest access)
- Key: `DEV_AUTH_ENABLED`
- Value: `true`
- Environment: ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

## Step 3: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click **⋯** on the latest deployment
3. Click **Redeploy**
4. Or just push a new commit to trigger auto-deploy

## Step 4: Push Database Schema

After deployment, the Prisma schema will be pushed automatically. If it doesn't work, you can run:

```bash
npm run db:push
```

Or set up a Vercel build command to do it automatically.

## Verify It Works

1. Wait for deployment to complete
2. Visit your Vercel URL
3. Click "Continue as Guest"
4. Should work now! ✅
