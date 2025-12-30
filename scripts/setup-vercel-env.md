# Setting up Vercel Environment Variables

## Quick Setup via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/andymentals-projects/voice-tasks/settings/environment-variables
2. Add these variables for **Production**, **Preview**, and **Development**:

### Required Variables:

```
DATABASE_URL
```
Value:
```
prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19nUDdEQkZ0UDdneWJmQlQ2Z3VfZjAiLCJhcGlfa2V5IjoiMDFLRE1SN0tFSjlaNEhYMDdUUlJIMk5CUEMiLCJ0ZW5hbnRfaWQiOiJkZGYxMDA0ZTNlODA0MjJiMDhiZjZiYjYyZmZhOWNjMDQxMGM0OTk2MjY2MzY1OWNjZDI5N2VmZjljYTgwMmQzIiwiaW50ZXJuYWxfc2VjcmV0IjoiMDk1ZjQzMjEtODQ1OS00MDRmLWJkZDctMDQ3OTYyOGZlNmQ4In0.CMHE1MVuqPyQa73t82nBPftQncucuij8FiCWBZcRcLI
```

```
AZURE_OPENAI_ENDPOINT
```
Value: (from your .env file)
```
https://anand-m9ky8ewh-eastus2.openai.azure.com
```

```
AZURE_OPENAI_API_KEY
```
Value: (from your .env file)

```
AZURE_OPENAI_DEPLOYMENT
```
Value:
```
gpt-realtime-mini
```

```
AZURE_GPT4_1_NANO_ENDPOINT
```
Value:
```
https://anand-m9ky8ewh-eastus2.openai.azure.com/openai/deployments/gpt-4.1-nano
```

```
AZURE_GPT4_1_NANO_API_KEY
```
Value: (from your .env file)

```
AZURE_GPT4_1_NANO_API_VERSION
```
Value:
```
2025-01-01-preview
```

## Alternative: Using Vercel CLI

```bash
# Set DATABASE_URL
vercel env add DATABASE_URL production
# Paste: prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19nUDdEQkZ0UDdneWJmQlQ2Z3VfZjAiLCJhcGlfa2V5IjoiMDFLRE1SN0tFSjlaNEhYMDdUUlJIMk5CUEMiLCJ0ZW5hbnRfaWQiOiJkZGYxMDA0ZTNlODA0MjJiMDhiZjZiYjYyZmZhOWNjMDQxMGM0OTk2MjY2MzY1OWNjZDI5N2VmZjljYTgwMmQzIiwiaW50ZXJuYWxfc2VjcmV0IjoiMDk1ZjQzMjEtODQ1OS00MDRmLWJkZDctMDQ3OTYyOGZlNmQ4In0.CMHE1MVuqPyQa73t82nBPftQncucuij8FiCWBZcRcLI

# Repeat for other variables...
```

## After Setting Environment Variables

1. **Redeploy** your project to apply the new environment variables:
   ```bash
   vercel --prod
   ```

2. **Run database migrations** (if needed):
   ```bash
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

