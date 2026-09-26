# Cloudflare Pages Environment Variables Update

## ❗ PENTING: Update Environment Variable

Ada perubahan pada konfigurasi API base URL. Anda perlu update environment variable di Cloudflare Pages Dashboard.

## Langkah-langkah Update:

### 1. Buka Cloudflare Pages Dashboard
- Login ke https://dash.cloudflare.com
- Pilih **Workers & Pages** dari sidebar
- Klik project **dashboard-spx-soko**

### 2. Update Environment Variables
- Klik tab **Settings**
- Scroll ke section **Environment variables**
- Edit variable `VITE_API_BASE_URL`

### 3. Nilai yang Benar:

**SEBELUM (SALAH - menyebabkan 404):**
```
VITE_API_BASE_URL=https://dashboard-spx-soko-backend.spxsoko.workers.dev/api
```

**SESUDAH (BENAR):**
```
VITE_API_BASE_URL=https://dashboard-spx-soko-backend.spxsoko.workers.dev
```

**Penjelasan:**
- Service frontend sudah menambahkan `/api/sheets/...` secara otomatis
- Jika base URL sudah include `/api`, akan jadi double: `/api/api/sheets/...` → 404 Error
- Base URL harus hanya domain Worker saja, tanpa `/api` suffix

### 4. Environment Variables Lengkap:

Set 3 environment variables berikut di Cloudflare Pages:

```
VITE_API_BASE_URL=https://dashboard-spx-soko-backend.spxsoko.workers.dev
VITE_SPREADSHEET_ID=1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA
VITE_API_REFRESH_INTERVAL=30000
```

### 5. Trigger Re-deployment
Setelah update environment variables:
- Cloudflare akan otomatis trigger re-deployment
- **ATAU** Anda bisa manual trigger dengan:
  - Klik tab **Deployments**
  - Klik tombol **Retry deployment** pada deployment terakhir
  - **ATAU** push commit baru ke GitHub

### 6. Verifikasi
Setelah deployment selesai:
- Buka https://dashboard-spx-soko.pages.dev
- Check browser console (F12)
- Pastikan tidak ada error 404
- Dashboard harus load data dengan benar

---

## Troubleshooting

### Jika masih error 404:
1. Pastikan Worker backend masih running: https://dashboard-spx-soko-backend.spxsoko.workers.dev/health
2. Check environment variables sudah benar (tanpa `/api`)
3. Re-deploy frontend (push commit atau retry deployment)

### Jika error "Cannot read properties of undefined":
1. Ini normal saat pertama load (data belum ready)
2. Jika persist setelah beberapa detik, check browser console untuk error API
3. Pastikan Worker backend punya secret `GOOGLE_SERVICE_ACCOUNT`

---

## File yang Sudah Diupdate Lokal:
- ✅ `frontend/.env` - Fixed base URL
- ✅ `frontend/.env.example` - Updated with correct example
- ✅ `frontend/src/components/schedule/WeeklyScheduleTable.jsx` - Added null safety

## Status:
- Backend: ✅ Deployed dan berfungsi
- Frontend: ⚠️ Perlu update env variable di Cloudflare Pages
