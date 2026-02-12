# Testing Guide

## Step 1: Verify Database Connection

### Check in Supabase:
1. Go to your Supabase dashboard
2. Go to **Table Editor**
3. You should see all these tables:
   - User
   - Account
   - Session
   - CarProject
   - Part
   - Problem
   - Photo
   - Document
   - Replacement
   - Diagnosis
   - DiagnosisItem
   - SpecialistContact
   - Alert
   - Listing
   - Scrapyard
   - Outreach
   - EmailIngestion
   - VerificationToken

If you see all tables ✅ = Database is set up correctly!

## Step 2: Verify Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click your `car-renovator` project
3. Go to **Settings** → **Environment Variables**
4. Verify these exist:
   - ✅ `DATABASE_URL` - Should be your Supabase connection string
   - ✅ `NEXTAUTH_URL` - Your Vercel app URL
   - ✅ `NEXTAUTH_SECRET` - Random secret string
   - ✅ `DEV_AUTH_ENABLED` - Set to `true`

## Step 3: Test Guest Sign-In

1. **Visit your Vercel app**: `https://car-renovator.vercel.app`
2. You should see the login page
3. **Click "Continue as Guest"**
4. **Expected result**: 
   - ✅ Should redirect to dashboard/projects page
   - ✅ No error messages
   - ✅ You should see "My Projects" or dashboard

## Step 4: Test Creating a Project

1. After signing in as guest, click **"New Project"**
2. Fill in:
   - Make: `BMW`
   - Model: `E30`
   - Year: `1990`
   - Click **"Next: Add Problems"**
3. **Expected result**:
   - ✅ Project should be created
   - ✅ Should move to step 2 (Problems & Media)

## Step 5: Test Adding Problems

1. In step 2, go to **"Problems"** tab
2. Add a problem:
   - Title: `Engine overheating`
   - Description: `Car overheats after 10 minutes`
   - Category: `Engine`
   - Click **"Add"**
3. **Expected result**:
   - ✅ Problem should appear in the list
   - ✅ Can add multiple problems

## Step 6: Test Photo Upload

1. Go to **"Photos"** tab
2. Click **"Upload Photos"** and select an image
3. **Expected result**:
   - ✅ Photo should upload
   - ✅ Preview should show
   - ✅ AI analysis should run (or show mock results)

## Step 7: Generate Diagnosis

1. After adding problems/photos, click **"Generate Diagnosis"**
2. **Expected result**:
   - ✅ Should process
   - ✅ Should redirect to diagnosis page
   - ✅ Should show organized problems by specialist
   - ✅ Should show placeholder contacts

## Step 8: Check Database

1. Go back to Supabase **Table Editor**
2. Check these tables have data:
   - **User** - Should have your guest user
   - **CarProject** - Should have your project
   - **Problem** - Should have your problems
   - **Photo** - Should have uploaded photos

## Troubleshooting

### If guest sign-in fails:
- Check Vercel build logs for errors
- Verify DATABASE_URL is correct in Vercel
- Check Supabase project is active

### If project creation fails:
- Check browser console for errors (F12)
- Verify database tables exist
- Check Vercel function logs

### If photos don't upload:
- Check file size (Vercel has 4.5MB limit)
- Check browser console for errors
- Verify uploads directory permissions

## Quick Test Checklist

- [ ] Can sign in as guest
- [ ] Can create a project
- [ ] Can add problems
- [ ] Can upload photos
- [ ] Can generate diagnosis
- [ ] Diagnosis shows organized by specialist
- [ ] Can see placeholder contacts

If all checked ✅ = Everything works!
