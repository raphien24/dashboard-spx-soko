# 🔐 Google Authentication Setup Guide

## Overview
Dashboard ini menggunakan Google OAuth untuk authentication. Hanya user yang email-nya terdaftar di whitelist yang bisa akses.

---

## 📋 Prerequisites

- Google Cloud Project
- Google Workspace account (untuk user login)
- Access ke Google Cloud Console

---

## 🚀 Setup Steps

### 1. Create Google Cloud Project

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Klik **"Select a project"** → **"New Project"**
3. Project name: `SPX SOKO Dashboard`
4. Klik **"Create"**

### 2. Enable Google Sign-In API

1. Di Google Cloud Console, pilih project yang baru dibuat
2. Buka menu **"APIs & Services"** → **"Library"**
3. Search: **"Google+ API"** atau **"Google Identity"**
4. Klik **"Enable"**

### 3. Configure OAuth Consent Screen

1. Buka **"APIs & Services"** → **"OAuth consent screen"**
2. Pilih **"Internal"** (untuk Google Workspace) atau **"External"**
3. Fill the form:
   - **App name**: `SPX SOKO Productivity Dashboard`
   - **User support email**: Your email
   - **Developer contact**: Your email
4. **Scopes**: Tambahkan:
   - `email`
   - `profile`
   - `openid`
5. Klik **"Save and Continue"**

### 4. Create OAuth Client ID

1. Buka **"APIs & Services"** → **"Credentials"**
2. Klik **"+ Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `SPX SOKO Dashboard Web`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:5174
   https://spxsoko.online
   https://dashboard-spx-soko.pages.dev
   ```
6. **Authorized redirect URIs**: (Same as origins)
   ```
   http://localhost:5173
   https://spxsoko.online
   https://dashboard-spx-soko.pages.dev
   ```
7. Klik **"Create"**
8. **COPY** Client ID yang muncul

### 5. Configure Environment Variables

#### Local Development:

1. Masuk ke folder frontend:
   ```bash
   cd frontend
   ```

2. Copy `.env.example` ke `.env`:
   ```bash
   copy .env.example .env
   ```

3. Edit `.env` file:
   ```env
   VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
   ```

4. Replace `YOUR_CLIENT_ID_HERE` dengan Client ID dari step 4

#### Production (Cloudflare Pages):

1. Login ke Cloudflare Dashboard
2. Buka project **dashboard-spx-soko**
3. Settings → **Environment variables**
4. Add variable:
   - **Variable name**: `VITE_GOOGLE_CLIENT_ID`
   - **Value**: Your Client ID
   - **Environment**: Both Production & Preview
5. Save

6. **Redeploy** project

---

## 🔑 Whitelist Management

### Default Admin

Default whitelist email (bisa diubah di localStorage):
- `admin@spxsoko.online`

### Menambah User Baru

1. Login ke dashboard
2. Buka **Settings** → **Whitelist**
3. Masukkan email user baru
4. Klik **"Add Email"**
5. User tersebut sekarang bisa login

### Menghapus User

1. Buka **Settings** → **Whitelist**
2. Klik tombol **trash** di sebelah email
3. Confirm

**Note**: 
- ❌ Tidak bisa hapus email sendiri
- ❌ Tidak bisa hapus email terakhir
- ✅ Minimal 1 email harus ada di whitelist

---

## 🧪 Testing

### Test di Local:

1. Start dev server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Buka http://localhost:5173

3. Harusnya muncul Login Page

4. Klik **"Sign in with Google"**

5. Pilih akun Google Workspace

6. Jika email di whitelist → masuk dashboard

7. Jika tidak → error "Email not authorized"

### Test Whitelist:

1. Login dengan admin account
2. Buka Settings → Whitelist
3. Add email baru
4. Logout
5. Login dengan email yang baru ditambahkan
6. Harusnya berhasil ✅

---

## 🔒 Security Features

1. **Google OAuth**: Secure login via Google
2. **Whitelist**: Only authorized emails can access
3. **Token Validation**: JWT token verification
4. **Auto Logout**: When token expires
5. **Email Verification**: Only verified emails accepted
6. **Workspace Only**: Optional restriction to specific domain

---

## 🐛 Troubleshooting

### Error: "popup_closed_by_user"
**Solution**: User closed popup. Try again.

### Error: "redirect_uri_mismatch"
**Solution**: 
- Check authorized redirect URIs in Google Console
- Must match exactly (including http/https)

### Error: "Email not authorized"
**Solution**: 
- Email tidak ada di whitelist
- Admin harus add email ke whitelist dulu

### Login berhasil tapi auto logout
**Solution**: 
- Check localStorage
- Clear browser cache
- Check if email still in whitelist

### Development mode tidak bisa login
**Solution**:
- Pastikan `.env` file sudah dibuat
- Pastikan `VITE_GOOGLE_CLIENT_ID` sudah diisi
- Restart dev server: `npm run dev`

---

## 📝 Whitelist Storage

Whitelist disimpan di **localStorage** browser dengan key:
- `spx_whitelist` - Array of whitelisted emails
- `spx_user` - Current logged in user data

### Export Whitelist:
```javascript
// Di browser console
console.log(JSON.parse(localStorage.getItem('spx_whitelist')))
```

### Import/Reset Whitelist:
```javascript
// Di browser console
const newList = ['admin@spxsoko.online', 'user@spxsoko.online'];
localStorage.setItem('spx_whitelist', JSON.stringify(newList));
location.reload();
```

---

## 🔄 Migration from Old System

Jika sudah ada user yang akses dashboard sebelumnya:

1. Kumpulkan list email user
2. Login dengan admin account
3. Add semua email ke whitelist
4. Inform user untuk login dengan Google account mereka

---

## 📞 Support

Jika ada masalah:
1. Check Google Cloud Console credentials
2. Check environment variables
3. Check browser console for errors
4. Clear cache & cookies
5. Try incognito mode

---

## ✅ Checklist Setup

- [ ] Google Cloud Project created
- [ ] OAuth consent screen configured
- [ ] OAuth Client ID created
- [ ] JavaScript origins added
- [ ] Environment variable set (local)
- [ ] Environment variable set (production)
- [ ] Tested login di local
- [ ] Tested login di production
- [ ] Whitelist configured
- [ ] Test users added
- [ ] Documentation shared with team

---

**Last Updated**: 2026-01-XX
**Version**: 1.0.0
