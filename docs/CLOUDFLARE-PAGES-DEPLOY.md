# Cloudflare Pages Deployment Guide

## Prerequisites
- GitHub repo: https://github.com/JonasAbde/friday-voice-app
- Cloudflare account (Jonas needs to provide)
- Flutter project in `/flutter/` directory

## Overview

Cloudflare Pages will automatically build and deploy the Friday Voice App web version directly from GitHub. No local Flutter SDK needed!

## Setup Steps

### 1. Connect GitHub Repo
1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Pages** → **Create a project**
3. Click **Connect to Git**
4. Authorize Cloudflare to access GitHub
5. Select repository: `JonasAbde/friday-voice-app`

### 2. Build Configuration

**Framework preset:** None (manual configuration)

**Build settings:**
- **Build command:** `cd flutter && flutter pub get && flutter build web --release`
- **Build output directory:** `flutter/build/web`
- **Root directory:** `/` (project root)

**Important:** Cloudflare Pages will automatically install Flutter SDK during build.

### 3. Environment Variables

None required for basic build. 

Optional (for advanced features):
- `FLUTTER_VERSION` - Pin specific Flutter version (default: stable)

### 4. Deploy

Click **Save and Deploy**

Cloudflare will:
1. Clone your GitHub repo
2. Install Flutter SDK
3. Run build command
4. Deploy to global CDN

**First build:** ~5-10 minutes (Flutter SDK download + build)  
**Subsequent builds:** ~2-3 minutes (cached)

### 5. Result

You'll get a URL like:
```
https://friday-voice-app.pages.dev
```

Every git push to `master` → Automatic rebuild + deploy!

## Custom Domain (Optional)

If you want `friday.rendetalje.dk`:

1. Go to Pages → Your Project → Custom domains
2. Click **Set up a custom domain**
3. Enter: `friday.rendetalje.dk`
4. Add CNAME record in Cloudflare DNS:
   - Type: `CNAME`
   - Name: `friday`
   - Target: `friday-voice-app.pages.dev`
   - Proxy: ✅ Proxied

## Build Output Structure

After successful build:
```
flutter/build/web/
├── index.html
├── flutter.js
├── main.dart.js
├── assets/
├── canvaskit/
└── icons/
```

## Troubleshooting

### Build Fails with Flutter SDK Error

**Solution:** Cloudflare auto-installs Flutter. If it fails, check:
- Build command is correct
- Output directory is `flutter/build/web` (not just `build/web`)

### 404 on Routes

**Solution:** SPA routing handled by `.cloudflare/pages.json` config (already committed).

### Asset Loading Issues

**Check:** Base href in `flutter/web/index.html` should be `/` (default).

## Monitoring

- **Build logs:** Pages → Your Project → Deployments → Click deployment
- **Analytics:** Pages → Your Project → Analytics
- **Performance:** Available in Cloudflare dashboard

## Advanced Features

### Preview Deployments

Every Pull Request gets a unique preview URL:
```
https://[PR-number].friday-voice-app.pages.dev
```

### Rollback

1. Go to Pages → Deployments
2. Find previous successful deployment
3. Click **...** → **Rollback to this deployment**

## Cost

**Free tier includes:**
- Unlimited requests
- Unlimited bandwidth
- 500 builds/month
- 1 build at a time

Perfect for Friday Voice App! 🚀

## Next Steps

1. Deploy to Cloudflare Pages ✅
2. Test web app functionality
3. (Optional) Add custom domain
4. Monitor build logs
5. Iterate and improve

## Support

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Flutter Web Docs](https://flutter.dev/web)
- [Community Forum](https://community.cloudflare.com/c/developers/pages/)
