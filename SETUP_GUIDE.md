# Setup Guide - Dashboard SPX SOKO

Panduan lengkap untuk setup dan konfigurasi dashboard web aplikasi.

## 📋 Prerequisites

Pastikan Anda sudah install:
- **Node.js** versi 18 atau lebih baru ([Download](https://nodejs.org/))
- **npm** (included dengan Node.js)
- **Git** (optional, untuk version control)
- **Google Account** dengan akses ke spreadsheet

## 🔧 Step-by-Step Setup

### 1. Setup Google Sheets API

#### A. Buat Google Cloud Project

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a Project"** → **"New Project"**
3. Isi nama project (contoh: "SPX-SOKO-Dashboard")
4. Click **"Create"**

#### B. Enable Google Sheets API

1. Di dashboard Google Cloud Console, klik **"APIs & Services"** → **"Library"**
2. Search **"Google Sheets API"**
3. Click pada hasil, lalu click **"Enable"**
4. Tunggu beberapa detik sampai API enabled

#### C. Create API Credentials

**Opsi 1: API Key (Paling Mudah - untuk Public/View-only Sheets)**

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"API Key"**
3. Copy API key yang muncul (contoh: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
4. (Optional) Click **"Restrict Key"** untuk security:
   - API restrictions: Pilih "Google Sheets API"
   - Application restrictions: Sesuaikan dengan kebutuhan
5. Click **"Save"**

**Opsi 2: Service Account (untuk Private Sheets)**

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"Service Account"**
3. Isi detail:
   - Service account name: `dashboard-spx-soko`
   - Service account ID: auto-generated
4. Click **"Create and Continue"**
5. Grant role: **"Viewer"** (cukup untuk read-only)
6. Click **"Done"**
7. Klik service account yang baru dibuat
8. Go to **"Keys"** tab → **"Add Key"** → **"Create new key"**
9. Pilih **JSON** format
10. Download file JSON (simpan dengan aman!)

#### D. Setup Spreadsheet Permissions

**Untuk API Key:**
1. Buka Google Sheets Anda
2. Click **"Share"** button
3. Set permission: **"Anyone with the link"** → **"Viewer"**
4. Click **"Done"**

**Untuk Service Account:**
1. Buka Google Sheets Anda
2. Click **"Share"** button
3. Paste email service account (contoh: `dashboard-spx-soko@project-id.iam.gserviceaccount.com`)
4. Set role: **"Viewer"**
5. Click **"Send"**

### 2. Setup Project Aplikasi

#### A. Navigate ke Folder Project

```bash
cd "d:\SPX\DASHBOARD SPX SOKO\frontend"
```

#### B. Verify Dependencies Installed

```bash
npm install
```

Jika ada error, coba:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### C. Setup Environment Variables

1. Copy file template:
```bash
cp .env.example .env
```

2. Edit file `.env`:
```env
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_SPREADSHEET_ID=1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA
VITE_API_REFRESH_INTERVAL=30000
```

**Penjelasan:**
- `VITE_GOOGLE_SHEETS_API_KEY`: API key dari step 1C
- `VITE_SPREADSHEET_ID`: ID spreadsheet dari URL (bagian setelah `/d/` dan sebelum `/edit`)
- `VITE_API_REFRESH_INTERVAL`: Interval refresh dalam milliseconds (30000 = 30 detik)

#### D. Get Spreadsheet ID

Dari URL spreadsheet:
```
https://docs.google.com/spreadsheets/d/1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA/edit#gid=...
                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                      Ini adalah Spreadsheet ID
```

### 3. Adjust Sheet Names (Important!)

Edit file `src/services/googleSheetsService.js` sesuai dengan nama sheets di spreadsheet Anda:

```javascript
// Line ~90
async getKPIMetrics() {
  const data = await this.getRange('Dashboard!A1:F20'); // Sesuaikan nama sheet & range
  // ...
}
```

**Tips:** Buka spreadsheet Anda, lihat nama tab di bawah, dan sesuaikan nama sheet di kode.

### 4. Run Development Server

```bash
npm run dev
```

Output:
```
VITE v8.3.1  ready in 619 ms
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Buka browser dan akses: `http://localhost:5173/`

### 5. Verify Data Loading

1. Buka browser console (F12)
2. Cek apakah ada error
3. Dashboard seharusnya menampilkan data dari spreadsheet
4. Tunggu 30 detik, data akan auto-refresh

## 🔍 Troubleshooting

### Error: "API key not valid"

**Penyebab:**
- API key salah atau typo
- Google Sheets API belum di-enable

**Solusi:**
1. Verify API key di Google Cloud Console
2. Pastikan Google Sheets API sudah enabled
3. Re-create API key jika perlu
4. Update `.env` file

### Error: "The caller does not have permission"

**Penyebab:**
- Spreadsheet tidak public atau tidak dishare dengan service account

**Solusi:**
- Set spreadsheet ke "Anyone with link can view"
- Atau share dengan service account email

### Error: "Failed to fetch"

**Penyebab:**
- CORS issue (biasa terjadi di localhost)
- Network problem

**Solusi:**
- Restart dev server
- Check internet connection
- Clear browser cache

### Data Tidak Muncul (Blank)

**Penyebab:**
- Sheet names atau ranges salah
- Data structure tidak sesuai dengan kode

**Solusi:**
1. Buka browser console, lihat error
2. Check nama sheet di spreadsheet vs kode
3. Adjust ranges di `googleSheetsService.js`
4. Verify data ada di spreadsheet

### Mock Data Muncul

**Kondisi Normal:**
- Jika API belum dikonfigurasi, aplikasi akan menampilkan mock data
- Ini untuk keperluan development/testing

**Untuk Menggunakan Real Data:**
- Setup API key dengan benar
- Pastikan spreadsheet accessible
- Restart dev server

## 📊 Mapping Data Spreadsheet ke Aplikasi

### KPI Cards Mapping

Dashboard perlu data dari spreadsheet dengan struktur:

**Sheet: Dashboard**
```
Row 1: Weekly Avg Productivity | 100.7 | 100
Row 2: Sub metric 1            | 52,761
Row 3: Sub metric 2            | D1W vs...
...
Row 5: Unloaded vs Plan        | 71.6% | 100%
Row 6: Sub metric              | 219.8
...
Row 9: Daily Active            | 85.5% | 100%
Row 10: Sub metric             | Avg D1-2...
```

Sesuaikan range di code (line ~90-150 di `googleSheetsService.js`) dengan struktur actual spreadsheet Anda.

### Schedule Data Mapping

**Sheet: Schedule**
Header di Row 1:
```
| Unique Courier | Name | Zone | Contract | Vehicle | Productivity Actual | Target | ... |
```

Data dimulai dari Row 2.

## 🚀 Next Steps

Setelah setup berhasil:

1. **Customize Layout**: Edit components di `src/components/`
2. **Adjust Data Parsing**: Modify `googleSheetsService.js` sesuai struktur data
3. **Styling**: Customize warna/styling di `tailwind.config.js`
4. **Add Features**: Tambah fitur baru sesuai kebutuhan
5. **Deployment**: Deploy ke Vercel/Netlify (lihat DEPLOYMENT.md)

## 📞 Need Help?

Jika masih ada masalah:
1. Check browser console untuk error messages
2. Verify semua environment variables
3. Test API key dengan Google Sheets API Explorer
4. Review kode di `googleSheetsService.js` untuk debugging

## ✅ Checklist Setup

- [ ] Node.js 18+ installed
- [ ] Google Cloud Project created
- [ ] Google Sheets API enabled
- [ ] API Key/Service Account created
- [ ] Spreadsheet permissions configured
- [ ] `.env` file created and configured
- [ ] Dependencies installed (`npm install`)
- [ ] Sheet names adjusted in code
- [ ] Dev server running successfully
- [ ] Dashboard displays data correctly
- [ ] Auto-refresh working

Selamat! Dashboard Anda sudah siap digunakan! 🎉
