# ☁️ Cloudflare Environment Variables Setup

## Google OAuth Client ID Configuration

### 🔑 Credentials:

```
Client ID: 521585739971-ngbskbb30jtamlb6op1kukv1o175p3al.apps.googleusercontent.com
```

**Note:** Client Secret tidak diperlukan untuk frontend OAuth flow.

---

## 📝 Setup Steps:

### 1. Login ke Cloudflare Dashboard

Buka: https://dash.cloudflare.com

### 2. Pilih Project

- Klik **"Workers & Pages"** di sidebar
- Pilih project: **dashboard-spx-soko**

### 3. Buka Settings

- Klik tab **"Settings"**
- Scroll ke section **"Environment variables"**

### 4. Add Environment Variable

Klik **"Add variable"** atau **"Edit variables"**

**Variable 1:**
- **Variable name**: `VITE_GOOGLE_CLIENT_ID`
- **Value**: `521585739971-ngbskbb30jtamlb6op1kukv1o175p3al.apps.googleusercontent.com`
- **Type**: Plain text
- **Environment**: 
  - ✅ Production
  - ✅ Preview

Klik **"Save"**

### 5. Redeploy

Setelah save environment variable:

**Option A - Via Dashboard:**
- Klik tab **"Deployments"**
- Klik **"..."** pada deployment terakhir
- Klik **"Retry deployment"**

**Option B - Via Git Push:**
```bash
git commit --allow-empty -m "Trigger redeploy after env setup"
git push
```

---

## ✅ Verification

### Test di Local:

1. Pastikan `.env` file sudah ada di `/frontend/`
2. Restart dev server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Buka http://localhost:5173
4. Harusnya muncul login page
5. Inspect element → Console, check error

### Test di Production:

1. Tunggu deployment selesai (2-5 menit)
2. Buka production URL
3. Harusnya muncul login page
4. Klik "Sign in with Google"
5. Pilih akun Google

**Expected:**
- Jika email NOT in whitelist: Error "Email not authorized"
- Jika email IN whitelist: Success login ✅

---

## 🔧 Troubleshooting

### Error: "Invalid Client ID"

**Solution:**
- Double check Client ID di Cloudflare
- Pastikan tidak ada space atau typo
- Redeploy setelah fix

### Error: "redirect_uri_mismatch"

**Solution:**
- Buka Google Cloud Console
- Edit OAuth Client ID
- Add authorized JavaScript origins:
  ```
  https://dashboard-spx-soko.pages.dev
  https://spxsoko.online
  ```
- Add authorized redirect URIs (same as origins)

### Login button tidak muncul

**Solution:**
- Check browser console untuk error
- Pastikan Google script loaded
- Check network tab untuk blocked requests

### Environment variable tidak ter-apply

**Solution:**
- Redeploy project
- Clear Cloudflare cache
- Wait 5 minutes for propagation

---

## 🎯 Default Whitelist

First time setup, default whitelist email adalah:
```
admin@spxsoko.online
```

Untuk menggunakan email lain:

### Option 1: Browser Console (Temporary)
```javascript
localStorage.setItem('spx_whitelist', JSON.stringify(['your-email@company.com']));
location.reload();
```

### Option 2: Login as Admin → Add via Settings
1. Login dengan `admin@spxsoko.online`
2. Buka Settings → Whitelist
3. Add email Anda
4. Logout
5. Login dengan email baru

---

## 📋 Current Setup Status

✅ Google Client ID: **Configured**
✅ Local `.env`: **Created**
⏳ Cloudflare Env: **Pending** (please setup manually)
⏳ Redeploy: **Pending** (after env setup)

---

## 🔐 Security Note

**JANGAN** commit Client Secret ke git!
- Client Secret **TIDAK** diperlukan untuk frontend
- Hanya Client ID yang digunakan
- `.env` sudah di-gitignore

---

**Next Steps:**
1. ✅ Setup Cloudflare environment variable
2. ✅ Redeploy project
3. ✅ Test login di production
4. ✅ Setup whitelist dengan email yang benar
5. ✅ Inform team untuk test login

---

**Setup Date**: 2026-01-XX
