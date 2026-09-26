# 🚀 Quick Deploy ke Cloudflare

Panduan cepat deploy Dashboard SPX SOKO ke Cloudflare (10-15 menit).

## 📋 Prerequisites

- [x] Akun Cloudflare (gratis di https://dash.cloudflare.com)
- [x] Wrangler CLI sudah terinstall
- [x] Build frontend sukses
- [x] Service Account JSON dari Google Cloud

---

## ⚡ Quick Steps

### 1. Login Cloudflare (1 menit)

```bash
wrangler login
```

Browser akan terbuka → Login → Authorize

### 2. Deploy Frontend (2 menit)

```bash
cd "d:\SPX\DASHBOARD SPX SOKO\frontend"
npm run build
npx wrangler pages deploy dist --project-name=dashboard-spx-soko
```

**SAVE URL** yang muncul! (contoh: `https://dashboard-spx-soko.pages.dev`)

### 3. Encode Service Account (1 menit)

```powershell
cd "d:\SPX\DASHBOARD SPX SOKO\backend"
$bytes = [System.IO.File]::ReadAllBytes("service-account-key.json")
$base64 = [Convert]::ToBase64String($bytes)
$base64 | Out-File service-account-base64.txt
Write-Host "Base64 saved to service-account-base64.txt"
```

### 4. Deploy Backend Worker (3 menit)

```bash
cd "d:\SPX\DASHBOARD SPX SOKO\cloudflare-backend"
npm install
wrangler deploy
```

**SAVE Worker URL** yang muncul!

### 5. Set Backend Secret (2 menit)

```bash
cd "d:\SPX\DASHBOARD SPX SOKO\cloudflare-backend"

# Paste base64 dari file service-account-base64.txt ketika diminta
wrangler secret put GOOGLE_SERVICE_ACCOUNT
```

Paste base64 string → Enter

### 6. Update Frontend Environment (3 menit)

Via Cloudflare Dashboard:
1. Go to: https://dash.cloudflare.com
2. **Workers & Pages** → **dashboard-spx-soko**
3. **Settings** → **Environment variables** → **Production**
4. Add variable:
   ```
   Variable name: VITE_API_BASE_URL
   Value: https://dashboard-spx-soko-backend.YOUR-SUBDOMAIN.workers.dev/api
   ```
   (ganti YOUR-SUBDOMAIN dengan subdomain Worker Anda)

5. Add variable:
   ```
   Variable name: VITE_SPREADSHEET_ID
   Value: 1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA
   ```

6. **Save**

### 7. Redeploy Frontend (1 menit)

```bash
cd "d:\SPX\DASHBOARD SPX SOKO\frontend"
npx wrangler pages deploy dist --project-name=dashboard-spx-soko
```

### 8. Test! (1 menit)

Buka: `https://dashboard-spx-soko.pages.dev`

Dashboard seharusnya:
- ✅ Load dengan styling yang benar
- ✅ Menampilkan data dari Google Sheets
- ✅ Auto-refresh setiap 30 detik
- ✅ All features working

---

## 🎉 Done!

Dashboard online di:
**https://dashboard-spx-soko.pages.dev**

---

## 🔧 Troubleshooting

### Frontend Deploy Error

```bash
# Clear cache dan rebuild
cd "d:\SPX\DASHBOARD SPX SOKO\frontend"
rm -rf node_modules dist
npm install
npm run build
npx wrangler pages deploy dist --project-name=dashboard-spx-soko
```

### Backend Worker Error

**Test worker:**
```bash
curl https://dashboard-spx-soko-backend.YOUR-SUBDOMAIN.workers.dev/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-..."}
```

**Check logs:**
```bash
cd "d:\SPX\DASHBOARD SPX SOKO\cloudflare-backend"
wrangler tail
```

### Data Tidak Muncul

1. **Check environment variables** di Cloudflare Dashboard
2. **Verify Worker URL** correct di `VITE_API_BASE_URL`
3. **Check Service Account secret:**
   ```bash
   wrangler secret put GOOGLE_SERVICE_ACCOUNT
   # Re-paste base64
   ```

---

## 💡 Tips

### Custom Domain

**For Pages:**
1. Dashboard → **dashboard-spx-soko** → **Custom domains**
2. Add: `dashboard.your-domain.com`
3. Follow DNS instructions

**For Worker:**
1. Dashboard → **dashboard-spx-soko-backend** → **Settings** → **Triggers**
2. **Custom Domains** → Add domain
3. Update `VITE_API_BASE_URL` in Pages environment variables

### Monitoring

View analytics:
- https://dash.cloudflare.com
- **Workers & Pages** → Select project → **Analytics**

### Updates

**Update Frontend:**
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=dashboard-spx-soko
```

**Update Backend:**
```bash
cd cloudflare-backend
wrangler deploy
```

---

## 📊 Free Tier Limits

- **Pages**: Unlimited requests, 500 builds/month
- **Workers**: 100,000 requests/day
- **Google Sheets API**: 500 requests/100 seconds

Cukup untuk dashboard internal team!

---

## 🆘 Need Help?

Check:
- `CLOUDFLARE_DEPLOY.md` untuk detail lengkap
- Cloudflare Docs: https://developers.cloudflare.com/
- Google Sheets API: https://developers.google.com/sheets/api

---

**Selamat! Dashboard sudah online! 🎉**
