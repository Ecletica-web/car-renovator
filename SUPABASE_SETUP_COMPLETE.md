# Supabase Setup - Final Steps

## Your Supabase Project Details

- **Project URL**: https://xkykfslmcplnibmqsbyp.supabase.co
- **Direct Connection**: `postgresql://postgres:[YOUR-PASSWORD]@db.xkykfslmcplnibmqsbyp.supabase.co:5432/postgres`

## Important: Get Your Database Password

1. Go to: https://supabase.com/dashboard/project/xkykfslmcplnibmqsbyp
2. Go to **Settings** → **Database**
3. Scroll to **Database password**
4. If you don't remember it:
   - Click **"Reset database password"**
   - Save the new password somewhere safe
5. Copy your password

## Recommended: Use Connection Pooling

For Vercel/serverless, use the **pooled connection** (better performance):

1. In Supabase Dashboard → **Settings** → **Database**
2. Scroll to **Connection pooling**
3. Select **Session mode**
4. Copy the connection string (it uses port `6543`)
5. It will look like:
   ```
   postgresql://postgres.xkykfslmcplnibmqsbyp:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with your actual password

## Update Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click your `car-renovator` project
3. **Settings** → **Environment Variables**
4. Update `DATABASE_URL`:

   **Option A: Direct Connection (Port 5432)**
   ```
   postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xkykfslmcplnibmqsbyp.supabase.co:5432/postgres
   ```

   **Option B: Pooled Connection (Port 6543) - RECOMMENDED**
   ```
   postgresql://postgres.xkykfslmcplnibmqsbyp:YOUR_ACTUAL_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

5. **Replace `YOUR_ACTUAL_PASSWORD`** with your Supabase database password
6. **Environment**: Check all three (Production, Preview, Development)
7. Click **Save**

## URL-Encode Password if Needed

If your password has special characters:
- `+` → `%2B`
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `=` → `%3D`

## After Updating

1. **Redeploy** in Vercel (Deployments → ⋯ → Redeploy)
2. Wait 2-3 minutes
3. Test: Visit your app and click "Continue as Guest"
4. Should work! ✅

## Verify Connection

After redeploying, check:
- Browser console (F12) - should see no database errors
- Guest sign-in should work
- Can create projects
