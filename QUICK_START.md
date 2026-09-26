# Quick Start Guide - Dashboard SPX SOKO

Panduan cepat untuk menjalankan dashboard dalam 5 menit!

## ⚡ Super Quick Start

```bash
# 1. Masuk ke folder frontend
cd "d:\SPX\DASHBOARD SPX SOKO\frontend"

# 2. Install dependencies (first time only)
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Edit .env dan isi API key (lihat step di bawah)

# 5. Run!
npm run dev

# 6. Open browser: http://localhost:5173
```

---

## 🔑 Mendapatkan Google Sheets API Key (5 menit)

### Step 1: Create Google Cloud Project
1. Buka: https://console.cloud.google.com/
2. Click "Select a Project" → "New Project"
3. Nama: "SPX-SOKO-Dashboard" → Create

### Step 2: Enable Google Sheets API
1. Menu: "APIs & Services" → "Library"
2. Search: "Google Sheets API"
3. Click → "Enable"

### Step 3: Create API Key
1. "APIs & Services" → "Credentials"
2. "+ CREATE CREDENTIALS" → "API Key"
3. **Copy the API key** (example: AIzaSyBxxx...)

### Step 4: Configure Spreadsheet
1. Buka Google Sheets yang ingin digunakan
2. Click "Share" button
3. Set: **"Anyone with the link"** → **"Viewer"**
4. Copy Spreadsheet ID dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[COPY_THIS_PART]/edit
   ```

### Step 5: Update .env File
Edit `frontend/.env`:
```env
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyBxxx...  # Paste API key here
VITE_SPREADSHEET_ID=1wrQhe7ySqkITVe...     # Paste spreadsheet ID here
VITE_API_REFRESH_INTERVAL=30000
```

---

## 🎯 Testing with Mock Data

Jika belum setup Google Sheets API, aplikasi akan otomatis menggunakan **mock data** untuk testing:

```bash
# Just run without API key
npm run dev
```

Dashboard akan menampilkan data sample. Ini sangat berguna untuk:
- Testing layout dan UI
- Development tanpa API quota
- Demo purposes

---

## 🚀 Deploy ke Production

### Option 1: Vercel (Paling Mudah)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Atau deploy langsung dari Git
# 1. Push ke GitHub
# 2. Import project di vercel.com
# 3. Done!
```

**Jangan lupa set environment variables di Vercel dashboard!**

### Option 2: Build Manual

```bash
# Build
npm run build

# Output ada di folder dist/
# Upload dist/ ke hosting apa saja
```

---

## 📖 Commands Cheat Sheet

```bash
# Development
npm run dev              # Run dev server

# Build
npm run build            # Build for production
npm run preview          # Preview production build

# Linting
npm run lint             # Check code quality

# Dependencies
npm install              # Install all dependencies
npm update               # Update dependencies
```

---

## 🔧 Troubleshooting

### "API key not valid"
- Cek API key di `.env` file
- Pastikan Google Sheets API sudah enabled
- Verify spreadsheet is public atau shared

### "Failed to fetch"
- Check internet connection
- Verify spreadsheet ID benar
- Check browser console untuk error details

### Data tidak muncul
- Buka browser console (F12)
- Lihat error messages
- Jika API belum setup, aplikasi akan show mock data

### Build error
```bash
# Clear cache dan reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📂 File Structure (Yang Penting)

```
frontend/
├── .env                    # Environment variables (BUAT INI!)
├── src/
│   ├── App.jsx            # Main app
│   ├── components/        # UI components
│   └── services/          # Google Sheets integration
└── package.json
```

---

## 🎨 Customization Quick Tips

### Change Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#7C3AED', // Change this!
  }
}
```

### Change Refresh Interval
Edit `.env`:
```env
VITE_API_REFRESH_INTERVAL=60000  # 60 seconds
```

### Adjust Sheet Names
Edit `frontend/src/services/googleSheetsService.js`:
```javascript
async getKPIMetrics() {
  const data = await this.getRange('YourSheetName!A1:F20');
  // ...
}
```

---

## 📚 Need More Help?

- **Setup Issues**: Baca `SETUP_GUIDE.md`
- **Deployment**: Baca `DEPLOYMENT.md`
- **Full Docs**: Baca `PROJECT_SUMMARY.md`
- **API Details**: Baca `PRD.md`

---

## ✅ Quick Checklist

Before running:
- [ ] Node.js 18+ installed
- [ ] npm working
- [ ] `.env` file created
- [ ] API key obtained (or using mock data)
- [ ] Spreadsheet public (if using real API)

Ready to deploy:
- [ ] Build successful (`npm run build`)
- [ ] Tested locally
- [ ] Environment variables ready
- [ ] Hosting platform chosen

---

## 🎉 That's It!

Dashboard sekarang sudah running! 

**Development**: http://localhost:5173

**Production**: Deploy dengan Vercel/Netlify

---

**Questions?** Check the full documentation in the project folder!
