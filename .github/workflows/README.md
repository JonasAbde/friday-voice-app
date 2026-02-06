# GitHub Actions Backup Deployment

This workflow is a **backup plan** if Cloudflare Pages' built-in GitHub integration doesn't work.

## When to Use This

- Cloudflare Pages GitHub integration fails
- Need more control over build process
- Want to add custom pre/post-build steps

## Setup (Only if Needed)

### 1. Get Cloudflare API Credentials

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use template: **Edit Cloudflare Workers**
4. Copy the API token

### 2. Get Cloudflare Account ID

1. Go to https://dash.cloudflare.com
2. Select your Pages project
3. Account ID is in the URL or in project settings

### 3. Add GitHub Secrets

1. Go to your GitHub repo: https://github.com/JonasAbde/friday-voice-app
2. Settings → Secrets and variables → Actions
3. Click **New repository secret**

Add these secrets:
- `CLOUDFLARE_API_TOKEN` - Your API token from step 1
- `CLOUDFLARE_ACCOUNT_ID` - Your account ID from step 2

### 4. Enable Workflow

The workflow is already in `.github/workflows/deploy-cloudflare-pages.yml`

Every push to `master` will trigger the workflow.

## How It Works

1. **Checkout** - Gets latest code from GitHub
2. **Setup Flutter** - Installs Flutter SDK
3. **Get dependencies** - Runs `flutter pub get`
4. **Build web** - Runs `flutter build web --release`
5. **Deploy** - Uploads `flutter/build/web` to Cloudflare Pages

## Monitoring

- Go to GitHub repo → **Actions** tab
- See all workflow runs
- Click on a run to see detailed logs

## Advantages

✅ Full control over build process  
✅ Can add custom build steps  
✅ GitHub manages Flutter SDK caching  
✅ Same result as Cloudflare Pages built-in

## Disadvantages

❌ Uses GitHub Actions minutes (2,000/month free tier)  
❌ Requires Cloudflare API token setup  
❌ More complex than built-in integration  

## Recommendation

**Use Cloudflare Pages built-in GitHub integration first!**

Only use this workflow if:
- Built-in integration fails
- You need custom build steps
- You want GitHub Actions logs

## Cost

**GitHub Actions free tier:**
- 2,000 minutes/month
- ~2 minutes per build
- = ~1,000 builds/month (plenty!)

**Cloudflare Pages free tier:**
- 500 builds/month
- Unlimited bandwidth

Combined = more than enough for Friday Voice App! 🚀
