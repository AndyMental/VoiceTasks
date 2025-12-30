# Deployment Setup

## GitHub Auto-Deployment to Vercel

This project can automatically deploy to Vercel when you push to the `main` branch.

### Recommended: Vercel GitHub Integration (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project" or "Import Project"
3. Select your GitHub repository (`AndyMental/VoiceTasks`)
4. Vercel will automatically:
   - Detect Next.js
   - Set up GitHub integration
   - Deploy on every push to `main`
5. Add environment variables in Vercel:
   - `DATABASE_URL` - Use Prisma Accelerate URL: `prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19nUDdEQkZ0UDdneWJmQlQ2Z3VfZjAiLCJhcGlfa2V5IjoiMDFLRE1SN0tFSjlaNEhYMDdUUlJIMk5CUEMiLCJ0ZW5hbnRfaWQiOiJkZGYxMDA0ZTNlODA0MjJiMDhiZjZiYjYyZmZhOWNjMDQxMGM0OTk2MjY2MzY1OWNjZDI5N2VmZjljYTgwMmQzIiwiaW50ZXJuYWxfc2VjcmV0IjoiMDk1ZjQzMjEtODQ1OS00MDRmLWJkZDctMDQ3OTYyOGZlNmQ4In0.CMHE1MVuqPyQa73t82nBPftQncucuij8FiCWBZcRcLI`
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_DEPLOYMENT`
   - `AZURE_GPT4_1_NANO_ENDPOINT`
   - `AZURE_GPT4_1_NANO_API_KEY`
   - `AZURE_GPT4_1_NANO_API_VERSION` (optional)

**That's it!** Every push to `main` will automatically deploy.

### Alternative: GitHub Actions (Manual Setup)

If you prefer GitHub Actions, you need to set up secrets:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `VERCEL_TOKEN`: Get from [Vercel Settings → Tokens](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID`: Get from Vercel project settings → General
   - `VERCEL_PROJECT_ID`: Get from Vercel project settings → General
3. The workflow in `.github/workflows/deploy.yml` will handle deployments

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

