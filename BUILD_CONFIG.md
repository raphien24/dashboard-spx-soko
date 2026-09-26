# 🔧 Cloudflare Pages Build Configuration - CORRECT SETTINGS

## PROBLEM: 404 Error

Error 404 terjadi karena build configuration salah atau build gagal.

## SOLUTION: Update Build Settings

Go to Cloudflare Dashboard → Settings → Build configuration → Click Edit ✏️

### ✅ CORRECT Configuration:

```
Framework preset: Vite
Root directory (important!): frontend
Build command: npm install && npm run build
Build output directory: dist
Node version: 18 (default)
```

### ❌ WRONG Configuration (Kemungkinan Current):

```
Root directory: / atau kosong
Build command: cd frontend && npm install && npm run build
Build output directory: frontend/dist
```

## Why This Matters:

- **Root directory: frontend** → Cloudflare akan masuk ke folder `frontend` dulu
- **Build output: dist** → Relatif dari root directory, jadi `frontend/dist`
- **Build command** → Tidak perlu `cd frontend` karena sudah di root directory

## After Updating Settings:

1. **Save** the configuration
2. Go to **Deployments** tab
3. Click **"Retry deployment"** on the latest one
4. Wait for build to complete (~2-3 minutes)
5. Check logs for any errors
6. Test the URL again

## Environment Variables - VERIFY!

Make sure these are set in Settings → Environment variables:

**Production environment:**
```
VITE_API_BASE_URL=https://dashboard-spx-soko-backend.spxsoko.workers.dev/api
VITE_SPREADSHEET_ID=1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA
VITE_API_REFRESH_INTERVAL=30000
```

---

## Manual Deploy Alternative (If GitHub Deploy Still Fails):

If automatic deployment from GitHub continues to fail, you can deploy manually:

```powershell
cd "d:\SPX\DASHBOARD SPX SOKO\frontend"
npm run build
npx wrangler pages deploy dist --project-name=dashboard-spx-soko
```

But this won't have auto-deployment from GitHub pushes.

---

## Expected Build Log Output:

When build succeeds, you should see:
```
✓ 2531 modules transformed
dist/index.html                   0.45 kB
dist/assets/index-C6D-5Ncp.css   18.83 kB
dist/assets/index-CcquJO7L.js   701.82 kB
✓ built in ~1-2s
```

If you see errors like:
- "Command not found" → Build command is wrong
- "No such file or directory" → Root directory is wrong
- "Module not found" → Dependencies not installed

---

## Test URLs:

After fixing and redeploying, test these URLs:
- Production: https://spxsoko.online
- Cloudflare URL: https://dashboard-spx-soko.pages.dev
