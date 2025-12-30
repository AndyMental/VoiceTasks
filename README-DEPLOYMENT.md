# Deployment Setup

## GitHub Auto-Deployment to Vercel

This project is set up to automatically deploy to Vercel when you push to the `main` branch.

### Setup Instructions

1. **Connect Vercel to GitHub** (Recommended - Easier):
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically set up GitHub integration
   - Every push to `main` will trigger a deployment

2. **Or use GitHub Actions** (Manual setup):
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VERCEL_TOKEN`: Get from [Vercel Settings → Tokens](https://vercel.com/account/tokens)
     - `VERCEL_ORG_ID`: Get from Vercel project settings
     - `VERCEL_PROJECT_ID`: Get from Vercel project settings
   - The workflow in `.github/workflows/deploy.yml` will handle deployments

### Database Migration

If you encounter `userId` constraint errors:

1. **Option 1: Run migration manually** (if you have database access):
   ```bash
   npx prisma migrate deploy
   ```

2. **Option 2: Reset database** (for fresh start):
   - In Vercel, go to your project → Settings → Environment Variables
   - Update `DATABASE_URL` to point to a fresh database
   - Or run the SQL script: `scripts/reset-db.sql`

### Local Development

```bash
# Clean and rebuild
npm run rebuild

# Or step by step:
npm run clean          # Remove .next and cache
npm install            # Reinstall dependencies
npx prisma generate    # Regenerate Prisma Client
npm run build          # Build the project
```

