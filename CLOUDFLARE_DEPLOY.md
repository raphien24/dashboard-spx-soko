# Deploy ke Cloudflare (Frontend + Backend)

Panduan lengkap deploy Dashboard SPX SOKO ke Cloudflare Pages + Workers.

## 🎯 Architecture

- **Frontend**: Cloudflare Pages (Static Site)
- **Backend**: Cloudflare Workers (Serverless API)
- **Database**: Google Sheets (via Service Account)

---

## 📦 Step 1: Deploy Frontend ke Cloudflare Pages

### 1.1 Login ke Cloudflare

```bash
cd "d:\SPX\DASHBOARD SPX SOKO\frontend"
wrangler login
```

Browser akan terbuka → Login dengan akun Cloudflare Anda.

### 1.2 Build Frontend

```bash
npm run build
```

### 1.3 Deploy ke Cloudflare Pages

```bash
npx wrangler pages deploy dist --project-name=dashboard-spx-soko
```

Output akan menampilkan URL deployment, contoh:
```
✨ Deployment complete! Take a peek over at https://dashboard-spx-soko.pages.dev
```

**SAVE URL INI!** Kita akan butuh untuk setup backend.

---

## 🔧 Step 2: Deploy Backend ke Cloudflare Workers

### 2.1 Create Worker Project

```bash
cd "d:\SPX\DASHBOARD SPX SOKO"
mkdir cloudflare-backend
cd cloudflare-backend
npm init -y
```

### 2.2 Install Dependencies

```bash
npm install
npm install -D wrangler
```

### 2.3 Create Worker Script

Saya akan buatkan file worker.js yang compatible dengan Cloudflare Workers.

### 2.4 Setup Service Account Credentials

Untuk Cloudflare Workers, kita perlu encode Service Account JSON sebagai environment variable.

**Di terminal:**
```bash
# Baca file JSON dan encode ke base64
cd "d:\SPX\DASHBOARD SPX SOKO\backend"
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("service-account-key.json")) | Out-File -FilePath service-account-base64.txt
```

Copy isi file `service-account-base64.txt` - ini akan jadi environment variable.

### 2.5 Deploy Worker

```bash
cd cloudflare-backend
wrangler deploy
```

### 2.6 Set Environment Variables

Via Cloudflare Dashboard:
1. Go to **Workers & Pages** → Select your worker
2. **Settings** → **Variables**
3. Add:
   - `SPREADSHEET_ID`: `1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA`
   - `GOOGLE_SERVICE_ACCOUNT`: [paste base64 dari step 2.4]

### 2.7 Get Worker URL

Setelah deploy, copy Worker URL (contoh: `https://backend-spx-soko.your-subdomain.workers.dev`)

---

## 🔗 Step 3: Connect Frontend ke Backend

### 3.1 Update Frontend Environment

Via Cloudflare Pages Dashboard:
1. Go to **Pages** → **dashboard-spx-soko**
2. **Settings** → **Environment Variables**
3. Add for **Production**:
   ```
   VITE_API_BASE_URL=https://backend-spx-soko.your-subdomain.workers.dev/api
   VITE_SPREADSHEET_ID=1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA
   VITE_API_REFRESH_INTERVAL=30000
   ```

### 3.2 Redeploy Frontend

```bash
cd "d:\SPX\DASHBOARD SPX SOKO\frontend"
npm run build
npx wrangler pages deploy dist --project-name=dashboard-spx-soko
```

---

## ✅ Done!

Dashboard online di: `https://dashboard-spx-soko.pages.dev`

---

## 🚀 Quick Deploy (Alternative - Via Dashboard)

Lebih mudah via Cloudflare Dashboard:

### Frontend (Pages):
1. Login: https://dash.cloudflare.com
2. **Workers & Pages** → **Create application** → **Pages**
3. **Connect to Git** atau **Direct Upload**
4. **Direct Upload**: Upload folder `dist/`
5. Set environment variables
6. Deploy!

### Backend (Workers):
1. **Workers & Pages** → **Create application** → **Workers**
2. Upload worker script
3. Set environment variables
4. Deploy!

---

## 🔍 Testing

Test backend:
```bash
curl https://your-worker-url.workers.dev/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

---

## 💡 Tips

1. **Custom Domain**: 
   - Pages: Settings → Custom domains → Add domain
   - Workers: Settings → Triggers → Add Custom Domain

2. **CORS**: Backend worker sudah configured untuk allow frontend domain

3. **Monitoring**: 
   - Cloudflare Dashboard → Analytics
   - View requests, errors, performance

4. **Free Tier Limits**:
   - Pages: Unlimited requests
   - Workers: 100,000 requests/day (free)
   - Enough untuk dashboard internal!

---

## 🐛 Troubleshooting

**"Permission denied" on Worker:**
- Check Service Account credentials
- Verify spreadsheet shared with service account

**Frontend can't connect to backend:**
- Check VITE_API_BASE_URL is correct
- Verify Worker is deployed and running
- Check CORS settings

**Build fails:**
- Clear cache: `rm -rf node_modules dist`
- Reinstall: `npm install`
- Rebuild: `npm run build`

---

**Need help?** Check docs:
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Cloudflare Workers: https://developers.cloudflare.com/workers/
