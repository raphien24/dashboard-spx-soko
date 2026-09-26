# 🔐 Cloudflare Pages Environment Variables

## Environment Variables yang Perlu Ditambahkan

Di Cloudflare Pages dashboard:
1. Go to: **Settings** tab (yang sedang terbuka)
2. Scroll ke bagian **"Environment variables"**
3. Klik **"Add variable"** untuk setiap variable di bawah

### Production Environment Variables

Tambahkan 3 variables berikut untuk **Production**:

#### 1. VITE_API_BASE_URL
```
Variable name: VITE_API_BASE_URL
Value: https://dashboard-spx-soko-backend.spxsoko.workers.dev/api
Environment: Production
```

#### 2. VITE_SPREADSHEET_ID
```
Variable name: VITE_SPREADSHEET_ID
Value: 1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA
Environment: Production
```

#### 3. VITE_API_REFRESH_INTERVAL
```
Variable name: VITE_API_REFRESH_INTERVAL
Value: 30000
Environment: Production
```

## Copy-Paste Ready

Untuk mempercepat, copy values ini:

```
VITE_API_BASE_URL=https://dashboard-spx-soko-backend.spxsoko.workers.dev/api
VITE_SPREADSHEET_ID=1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA
VITE_API_REFRESH_INTERVAL=30000
```

## Setelah Menambahkan Variables

1. Klik **"Save"** untuk setiap variable
2. Setelah semua tersimpan, klik **"Deployments"** tab
3. Klik **"Retry deployment"** atau **"Create deployment"** untuk trigger rebuild dengan environment variables baru
4. Tunggu build selesai (~2-3 menit)

## Verify Variables

Setelah deployment selesai, verify dengan:
1. Buka dashboard di browser
2. Buka Developer Tools (F12)
3. Check Console untuk errors
4. Verify data muncul dari Google Sheets

---

**Note:** Environment variables hanya akan aktif setelah rebuild. Manual deployment yang sudah ada tidak akan punya variables ini.
