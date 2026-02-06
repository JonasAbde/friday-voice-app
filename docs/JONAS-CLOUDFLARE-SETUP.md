# Cloudflare Pages Setup Instructions for Jonas

**Time required:** 5 minutes (one-time setup)

## What This Does

Gets your Friday Voice App live on the web with:
- ✅ Stable URL (`https://friday-voice-app.pages.dev`)
- ✅ Auto-deploy on git push
- ✅ No local Flutter SDK needed
- ✅ Production-grade hosting (free!)

---

## Step 1: Login to Cloudflare

Go to: https://dash.cloudflare.com

(If you don't have an account, sign up - it's free)

---

## Step 2: Go to Pages

1. Look at left sidebar
2. Click **Pages**
3. Click **Create a project** button

---

## Step 3: Connect GitHub

1. Click **Connect to Git**
2. Click **GitHub**
3. Authorize Cloudflare (approve access)
4. Select repository: **JonasAbde/friday-voice-app**
5. Click **Begin setup**

---

## Step 4: Configure Build

**Production branch:**
- Select: `master`

**Build settings:**

| Setting | Value |
|---------|-------|
| Framework preset | None |
| Build command | `cd flutter && flutter pub get && flutter build web --release` |
| Build output directory | `flutter/build/web` |
| Root directory | `/` |

**Environment variables:**
- Leave empty (none needed)

---

## Step 5: Deploy

1. Click **Save and Deploy**
2. Wait 5-10 minutes for first build
3. Watch the build logs (cool to see!)

---

## ✅ Done!

You'll see:
```
Success! Your project is live at:
https://friday-voice-app.pages.dev
```

Click the URL to test your app!

---

## Auto-Deploy Magic

Every time you push to GitHub:
1. Cloudflare detects the change
2. Automatically rebuilds
3. Deploys new version
4. Done in ~2-3 minutes

No manual steps needed! 🚀

---

## Optional: Custom Domain

Want `friday.rendetalje.dk` instead of `.pages.dev`?

1. Go to your project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `friday.rendetalje.dk`
4. Follow DNS instructions

---

## Troubleshooting

### Build failed?

1. Click on the failed deployment
2. Read the build log
3. Usually it's just Flutter downloading (first time is slow)
4. Click **Retry deployment**

### App not loading?

- Check build output directory is `flutter/build/web`
- Check build command has `cd flutter &&` prefix
- Clear browser cache and refresh

---

## What Happens Next

After deployment:
1. Test the app in your browser
2. Share the URL with testers
3. Every git push = automatic update
4. Monitor builds in Cloudflare dashboard

---

## Need Help?

Full documentation: `docs/CLOUDFLARE-PAGES-DEPLOY.md`

Or just message Friday! 💬
