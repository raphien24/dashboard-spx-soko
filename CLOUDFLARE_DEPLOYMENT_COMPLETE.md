# ✅ Cloudflare Deployment Guide - SPX SOKO Dashboard

## 🎉 Backend Sudah Berhasil di-Deploy!

**Backend Worker URL:** `https://dashboard-spx-soko-backend.spxsoko.workers.dev`

Endpoint yang tersedia:
- Health check: `https://dashboard-spx-soko-backend.spxsoko.workers.dev/health`
- Get range: `https://dashboard-spx-soko-backend.spxsoko.workers.dev/api/sheets/range/[RANGE]`
- Batch ranges: `https://dashboard-spx-soko-backend.spxsoko.workers.dev/api/sheets/batch` (POST)

## 📋 Langkah Selanjutnya: Update Frontend Environment Variables

Frontend Anda sudah di-deploy ke Cloudflare Pages, tapi masih menggunakan `localhost:3001`. Sekarang perlu update environment variables di Cloudflare Pages dashboard.

### Cara Update Environment Variables di Cloudflare Pages:

1. **Buka Cloudflare Pages Dashboard**
   - Login ke https://dash.cloudflare.com
   - Pilih **Pages** di sidebar
   - Klik project **dashboard-spx-soko**

2. **Masuk ke Settings**
   - Klik tab **Settings**
   - Scroll ke bagian **Environment Variables**

3. **Tambahkan Variables untuk Production**
   - Klik **Add variables**
   - Tambahkan 2 environment variables berikut:

   | Variable Name | Value |
   |---------------|-------|
   | `VITE_API_BASE_URL` | `https://dashboard-spx-soko-backend.spxsoko.workers.dev/api` |
   | `VITE_SPREADSHEET_ID` | `1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA` |

   - Klik **Save**

4. **Redeploy Frontend**
   
   Setelah environment variables di-set, Cloudflare Pages akan otomatis redeploy. 
   
   **Atau** Anda bisa redeploy manual dengan command:
   ```powershell
   cd "d:\SPX\DASHBOARD SPX SOKO\frontend"
   npm run build
   npx wrangler pages deploy dist --project-name=dashboard-spx-soko
   ```

5. **Test Dashboard Anda**
   
   Buka URL frontend Anda (dari deployment output sebelumnya, biasanya seperti):
   - `https://dashboard-spx-soko.pages.dev`
   
   Dashboard sekarang akan fetch data real-time dari Google Sheets!

## 🔧 Jika Perlu Update Backend

Jika nanti Anda perlu update kode Worker:

```powershell
cd "d:\SPX\DASHBOARD SPX SOKO\cloudflare-backend"
wrangler deploy
```

## 📊 Cara Monitoring

### Melihat Logs Worker:
```powershell
cd "d:\SPX\DASHBOARD SPX SOKO\cloudflare-backend"
wrangler tail
```

### Test Endpoint Backend:
```powershell
# Health check
curl https://dashboard-spx-soko-backend.spxsoko.workers.dev/health

# Test data fetch
curl "https://dashboard-spx-soko-backend.spxsoko.workers.dev/api/sheets/range/raw!A1:Z10"
```

## 🔐 Security Notes

- Service Account credentials disimpan sebagai **encrypted secret** di Cloudflare Worker
- Spreadsheet ID di-expose di frontend (ini aman karena spreadsheet sudah restricted)
- CORS sudah di-configure di backend untuk allow requests dari frontend

## ✨ Features

Dashboard Anda sekarang:
- ✅ Online 24/7 di Cloudflare global network
- ✅ Auto-refresh data setiap 30 detik (toggleable)
- ✅ Real-time data dari Google Sheets organizational account
- ✅ Fast loading dengan Cloudflare CDN
- ✅ Free hosting (dalam Cloudflare free tier limits)

## 🚀 Next Steps (Optional)

1. **Custom Domain**: Tambahkan custom domain di Cloudflare Pages settings
2. **Analytics**: Enable Cloudflare Web Analytics untuk tracking visitors
3. **Caching**: Configure cache rules untuk optimize performance
4. **Alerts**: Setup Cloudflare alerts untuk monitoring uptime

---

**Catatan:** Jangan lupa save file `service-account-key.json` dan `service-account-base64.txt` di tempat aman (jangan commit ke git!). File-file ini sudah ada di `.gitignore`.
