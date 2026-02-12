# Deployment Guide - Vercel (Recommended)

## Quick Deploy to Vercel

### Option 1: Deploy via GitHub (Easiest - Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with your GitHub account
3. **Click "Add New Project"**
4. **Import your repository**:
   - Select `Ecletica-web/car-renovator`
   - Click "Import"
5. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
6. **Environment Variables**:
   - Add these variables:
     ```
     DATABASE_URL=file:./dev.db
     NEXTAUTH_URL=https://your-app-name.vercel.app
     NEXTAUTH_SECRET=generate-a-random-string-here
     DEV_AUTH_ENABLED=true
     ```
   - For NEXTAUTH_SECRET, generate one: https://generate-secret.vercel.app/32
7. **Click "Deploy"**
8. **Wait for deployment** (2-3 minutes)
9. **Your app will be live!** 🎉

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd "c:\Users\migue\OneDrive\Ambiente de Trabalho\Pessoal\Cursor\car-renovator"
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? car-renovator
# - Directory? ./
# - Override settings? No
```

## Important Notes for Production

### Database Considerations

**SQLite won't work on Vercel** (read-only filesystem). You need to switch to PostgreSQL:

1. **Get a free PostgreSQL database**:
   - Option A: [Supabase](https://supabase.com) (free tier)
   - Option B: [Neon](https://neon.tech) (free tier)
   - Option C: [Railway](https://railway.app) (free tier)

2. **Update Prisma Schema**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Update DATABASE_URL** in Vercel environment variables:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

4. **Run migrations**:
   ```bash
   npm run db:push
   ```

### Environment Variables for Production

Add these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=your-postgresql-connection-string
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-secret-key
DEV_AUTH_ENABLED=false
OPENAI_API_KEY=your-openai-key (optional)
```

## Alternative Deployment Options

### Netlify
- Similar to Vercel
- Good for Next.js
- Free tier available
- https://netlify.com

### Railway
- Includes PostgreSQL database
- Easy deployment
- Free tier available
- https://railway.app

### Render
- Good free tier
- PostgreSQL included
- https://render.com

## Post-Deployment Checklist

- [ ] Test the live URL
- [ ] Set up custom domain (optional)
- [ ] Configure environment variables
- [ ] Set up database (PostgreSQL)
- [ ] Test authentication
- [ ] Test file uploads
- [ ] Set up monitoring (optional)

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Check for TypeScript errors

### Database Issues
- SQLite doesn't work on Vercel - use PostgreSQL
- Check DATABASE_URL is correct
- Run migrations after deployment

### File Uploads Not Working
- Vercel has file size limits (4.5MB)
- Consider using cloud storage (S3, Cloudinary) for production
