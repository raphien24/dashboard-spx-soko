# Backend Setup Guide - Service Account Method

Panduan setup backend proxy untuk organisational Google Sheets.

## 🎯 Kenapa Perlu Backend?

Karena spreadsheet menggunakan **organizational email** yang tidak bisa di-set public, kita perlu:
1. **Service Account** untuk akses spreadsheet (lebih aman)
2. **Backend proxy** untuk handle Service Account credentials (tidak bisa di frontend)

---

## 📝 Step-by-Step Setup

### Step 1: Create Service Account & Download Credentials

1. **Buka Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: `SPX-SOKO-Dashboard`
3. **Enable Google Sheets API**:
   - Menu: "APIs & Services" → "Library"
   - Search & Enable: "Google Sheets API"

4. **Create Service Account**:
   - Menu: "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "Service Account"
   - Name: `soko-dashboard-reader`
   - Role: **"Viewer"** (read-only)
   - Click "DONE"

5. **Download JSON Key**:
   - Click on created service account
   - Tab "KEYS" → "ADD KEY" → "Create new key"
   - Type: **JSON**
   - Download file

6. **Save JSON File**:
   ```bash
   # Rename downloaded file to:
   service-account-key.json
   
   # Move to backend folder:
   mv ~/Downloads/soko-dashboard-*.json "d:\SPX\DASHBOARD SPX SOKO\backend\service-account-key.json"
   ```

### Step 2: Share Spreadsheet dengan Service Account

1. **Open JSON file**, find `client_email`:
   ```json
   {
     "client_email": "soko-dashboard-reader@project-id.iam.gserviceaccount.com"
   }
   ```

2. **Copy that email**

3. **Share Spreadsheet**:
   - Open: https://docs.google.com/spreadsheets/d/1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA
   - Click "Share"
   - Paste service account email
   - Permission: **"Viewer"**
   - **Uncheck** "Notify people"
   - Click "Share"

### Step 3: Install Backend Dependencies

```bash
cd "d:\SPX\DASHBOARD SPX SOKO\backend"
npm install
```

### Step 4: Setup Environment

```bash
# Create .env file
cp .env.example .env

# Edit if needed (default values are fine)
```

### Step 5: Start Backend Server

```bash
npm run dev
```

Server will run on `http://localhost:3001`

**Leave this terminal running!**

### Step 6: Test Backend

Open new terminal:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

---

## 🚀 Run Full Stack

Anda perlu 2 terminals:

### Terminal 1: Backend
```bash
cd "d:\SPX\DASHBOARD SPX SOKO\backend"
npm run dev
```

### Terminal 2: Frontend
```bash
cd "d:\SPX\DASHBOARD SPX SOKO\frontend"
npm run dev
```

Buka: http://localhost:5173

---

## ✅ Checklist

- [ ] Service Account created in Google Cloud
- [ ] JSON key file downloaded
- [ ] JSON file saved as `backend/service-account-key.json`
- [ ] Service account email copied
- [ ] Spreadsheet shared with service account (Viewer permission)
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend `.env` configured
- [ ] Backend running (`npm run dev`)
- [ ] Frontend `.env` updated (`VITE_API_BASE_URL`)
- [ ] Frontend running
- [ ] Dashboard displays real data

---

## 🐛 Troubleshooting

### "Permission denied" error
- Verify spreadsheet is shared with service account email
- Check email address is correct
- Permission must be "Viewer" or higher

### "File not found: service-account-key.json"
- File must be named exactly `service-account-key.json`
- File must be in `backend/` folder
- Check file is valid JSON

### Backend can't start
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules
npm install
```

### Frontend can't connect to backend
- Make sure backend is running (`http://localhost:3001`)
- Check `frontend/.env` has `VITE_API_BASE_URL=http://localhost:3001/api`
- Restart frontend dev server

---

## 🔐 Security Notes

**NEVER commit these files to Git:**
- ❌ `backend/service-account-key.json`
- ❌ `backend/.env`
- ❌ `frontend/.env`

They are already in `.gitignore` but double-check!

---

## 📦 Production Deployment

For production, deploy backend to:
- **Heroku** / **Railway** / **Render** (Node.js hosting)
- **Vercel** / **Netlify** (with serverless functions)
- **Cloud Run** / **App Engine** (Google Cloud)

Update `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://your-backend-url.com/api
```

---

**Ready to test!** 🎉
