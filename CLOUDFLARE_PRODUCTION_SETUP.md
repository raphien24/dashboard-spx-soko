# 🚀 Setup Cloudflare Pages Production Environment

## ⚠️ Current Issue

Production site (spxsoko.online) menunjukkan error:
```
Uncaught Error: supabaseUrl is required
```

**Penyebab:** Environment variables belum di-set di Cloudflare Pages

---

## 📝 Environment Variables yang Perlu Ditambahkan

Buka: https://dash.cloudflare.com

1. **Workers & Pages** → Pilih project: **spxsoko-online** (atau nama project Anda)
2. **Settings** → **Environment variables**
3. Klik **Add variable** untuk setiap variable berikut:

---

### Variable 1: VITE_GOOGLE_CLIENT_ID

```
Variable name: VITE_GOOGLE_CLIENT_ID
Value: 521585739971-ngbskbb30jtamlb6op1kukv1o175p3al.apps.googleusercontent.com
Environment: ✅ Production ✅ Preview
```

---

### Variable 2: VITE_SUPABASE_URL

```
Variable name: VITE_SUPABASE_URL
Value: https://tnzwrnvggqrkstokcrrr.supabase.co
Environment: ✅ Production ✅ Preview
```

---

### Variable 3: VITE_SUPABASE_ANON_KEY ⭐ (PALING PENTING)

```
Variable name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuendybnZnZ3Fya3N0b2tjcnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MzU4MDQsImV4cCI6MjEwNzMxMTgwNH0.nOKe_zx40M9JCOdCG0YUSpX75Q474qRFQBYdcZL-Fls
Environment: ✅ Production ✅ Preview
```

---

### Variable 4: VITE_API_BASE_URL

```
Variable name: VITE_API_BASE_URL
Value: https://dashboard-spx-soko-backend.spxsoko.workers.dev
Environment: ✅ Production ✅ Preview
```

**⚠️ Note:** JANGAN tambahkan `/api` di akhir URL!

---

### Variable 5: VITE_SPREADSHEET_ID

```
Variable name: VITE_SPREADSHEET_ID
Value: 1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA
Environment: ✅ Production ✅ Preview
```

---

### Variable 6: VITE_API_REFRESH_INTERVAL

```
Variable name: VITE_API_REFRESH_INTERVAL
Value: 30000
Environment: ✅ Production ✅ Preview
```

---

## 📋 Quick Copy-Paste (All Variables)

Untuk mempercepat, berikut semua values yang perlu di-paste:

```env
VITE_GOOGLE_CLIENT_ID=521585739971-ngbskbb30jtamlb6op1kukv1o175p3al.apps.googleusercontent.com

VITE_SUPABASE_URL=https://tnzwrnvggqrkstokcrrr.supabase.co

VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuendybnZnZ3Fya3N0b2tjcnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MzU4MDQsImV4cCI6MjEwNzMxMTgwNH0.nOKe_zx40M9JCOdCG0YUSpX75Q474qRFQBYdcZL-Fls

VITE_API_BASE_URL=https://dashboard-spx-soko-backend.spxsoko.workers.dev

VITE_SPREADSHEET_ID=1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA

VITE_API_REFRESH_INTERVAL=30000
```

---

## 🔄 Redeploy Setelah Set Variables

Setelah **semua 6 variables** di-save:

### Option A: Trigger Redeploy via Dashboard

1. Klik tab **Deployments**
2. Pilih deployment terakhir
3. Klik **"..."** (three dots)
4. Klik **"Retry deployment"**

### Option B: Trigger via Git Push

```bash
git commit --allow-empty -m "chore: trigger redeploy with env vars"
git push origin main
```

---

## ⏱️ Tunggu Deployment

1. Deployment akan memakan waktu **2-5 menit**
2. Check status di tab **Deployments**
3. Tunggu hingga status: **✅ Success**

---

## ✅ Test Production

Setelah deployment selesai:

1. **Buka:** https://spxsoko.online
2. **Hard refresh:** Ctrl+Shift+R (atau Cmd+Shift+R di Mac)
3. **Test login** dengan: `rafi.alvian@spxexpress.com`

**Expected Result:**
- ✅ Landing page muncul (space theme)
- ✅ Klik "Dashboard" → login page
- ✅ Login berhasil
- ✅ **TIDAK ADA** error "supabaseUrl is required"
- ✅ Dashboard loading data
- ✅ Settings → Whitelist berfungsi

---

## 🔍 Verify di Production

Buka browser console (F12) di spxsoko.online:

```javascript
console.log('Production Config Check:');
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Backend URL:', import.meta.env.VITE_API_BASE_URL);
console.log('Sheets ID:', import.meta.env.VITE_SPREADSHEET_ID);
```

**Expected Output:**
```
Production Config Check:
Supabase URL: https://tnzwrnvggqrkstokcrrr.supabase.co ✅
Backend URL: https://dashboard-spx-soko-backend.spxsoko.workers.dev ✅
Sheets ID: 1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA ✅
```

---

## 🐛 Troubleshooting

### Issue: Variables tidak ter-apply setelah redeploy

**Solution:**
1. Verify semua 6 variables saved
2. Check Environment: **Production** dan **Preview** keduanya checked ✅
3. Redeploy ulang
4. Clear browser cache (Ctrl+Shift+Delete)
5. Hard refresh (Ctrl+Shift+R)

### Issue: Masih error "supabaseUrl is required"

**Solution:**
1. Check spelling variable name (case-sensitive!)
   - ✅ `VITE_SUPABASE_URL` (correct)
   - ❌ `VITE_SUPABASE_url` (wrong)
2. Check tidak ada spasi di value
3. Check deployment logs untuk error

### Issue: "Invalid API key"

**Solution:**
1. Verify ANON_KEY di-copy dengan benar (full token)
2. Pastikan tidak ada line break di tengah key
3. Regenerate key di Supabase jika perlu

---

## 📊 Checklist Setup Production

- [ ] Login ke Cloudflare Dashboard
- [ ] Buka project: spxsoko-online
- [ ] Settings → Environment variables
- [ ] Add `VITE_GOOGLE_CLIENT_ID` ✅ Prod ✅ Preview
- [ ] Add `VITE_SUPABASE_URL` ✅ Prod ✅ Preview
- [ ] Add `VITE_SUPABASE_ANON_KEY` ✅ Prod ✅ Preview
- [ ] Add `VITE_API_BASE_URL` ✅ Prod ✅ Preview
- [ ] Add `VITE_SPREADSHEET_ID` ✅ Prod ✅ Preview
- [ ] Add `VITE_API_REFRESH_INTERVAL` ✅ Prod ✅ Preview
- [ ] Save all variables
- [ ] Trigger redeploy
- [ ] Wait for deployment success (2-5 min)
- [ ] Test at spxsoko.online
- [ ] Verify login works
- [ ] Verify whitelist management works
- [ ] Verify dashboard data loads

---

## 🎯 Summary

**Local Development:** ✅ Working (localhost:5173)  
**Production:** ⏳ Waiting for env vars + redeploy

**Time Required:** ~10 minutes
1. Add 6 variables (5 min)
2. Trigger redeploy (30 sec)
3. Wait deployment (2-5 min)
4. Test production (2 min)

---

## 🔐 Security Note

Semua keys yang digunakan adalah **safe for frontend**:
- ✅ `VITE_SUPABASE_ANON_KEY` (anon role, RLS-protected)
- ✅ `VITE_GOOGLE_CLIENT_ID` (public OAuth client)
- ✅ All other configs are URLs/IDs

**Never expose:**
- ❌ Service role keys
- ❌ Private API keys
- ❌ Database passwords

---

**Next Action:** Login ke Cloudflare Dashboard dan add 6 environment variables! 🚀

**Cloudflare Dashboard:** https://dash.cloudflare.com
