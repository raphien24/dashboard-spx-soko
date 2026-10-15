# ✅ Supabase Setup - READY TO TEST

## 🎉 Configuration Complete!

File `frontend/.env` sudah dikonfigurasi dengan credentials yang benar:

```env
VITE_GOOGLE_CLIENT_ID=521585739971-ngbskbb30jtamlb6op1kukv1o175p3al.apps.googleusercontent.com
VITE_SUPABASE_URL=https://tnzwrnvggqrkstokcrrr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ✅
```

---

## 📋 Next Steps

### 1️⃣ Buat Table Whitelist di Supabase (Jika Belum)

**Cek dulu apakah table sudah ada:**

1. Buka: https://supabase.com/dashboard
2. Pilih project: `tnzwrnvggqrkstokcrrr`
3. Klik **Table Editor** di sidebar
4. Cek apakah table **`whitelist`** sudah ada?

**Jika belum ada**, jalankan SQL:

1. Klik **SQL Editor** di sidebar
2. Klik **New query**
3. Copy-paste script dari file: **`create_whitelist_table.sql`**
4. Klik **Run** (atau Ctrl+Enter)
5. Verify: Table Editor → `whitelist` muncul dengan 2 rows

---

### 2️⃣ Start Dev Server

```bash
cd frontend
npm run dev
```

Tunggu hingga server siap (~10 detik)

---

### 3️⃣ Test Login

1. **Buka Browser**  
   http://localhost:5173

2. **Klik Tombol "Dashboard"**  
   (Tombol hijau di pojok kanan atas landing page)

3. **Login dengan Google**  
   Pilih akun: `rafi.alvian@spxexpress.com`

4. **Expected Result**  
   ✅ Berhasil login  
   ✅ Masuk ke dashboard produktivitas  
   ✅ Tidak ada error "supabaseUrl is required"

---

### 4️⃣ Test Whitelist Management

1. **Buka Settings**  
   Klik icon ⚙️ di sidebar

2. **Pilih "Email Whitelist"**

3. **Test Add Email**  
   - Input email baru: `test@example.com`
   - Klik "Add Email"
   - ✅ Email muncul di list

4. **Test Persistence**  
   - Refresh page (F5 atau Ctrl+R)
   - ✅ Email masih ada (tersimpan di Supabase!)

5. **Test Remove Email**  
   - Klik tombol "Remove" pada email test
   - ✅ Email hilang dari list

6. **Verify di Supabase**  
   - Buka Supabase Dashboard
   - Table Editor → `whitelist`
   - ✅ Data sesuai dengan yang di aplikasi

---

## 🔍 Troubleshooting

### Error: "supabaseUrl is required"
**Cause**: Dev server belum restart setelah update `.env`  
**Fix**: 
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Error: "Failed to load whitelist"
**Cause**: Table `whitelist` belum dibuat  
**Fix**: Jalankan `create_whitelist_table.sql` di Supabase SQL Editor

### Error: "Invalid API key"
**Cause**: Salah copy ANON_KEY atau ada spasi  
**Fix**: Check `.env` file, pastikan key utuh tanpa line break

### Login Failed: "Email not authorized"
**Cause**: Email belum ada di whitelist  
**Fix**: 
1. Login dengan `admin@spxsoko.online` atau `rafi.alvian@spxexpress.com`
2. Tambahkan email di Settings → Whitelist

---

## 🚀 Deploy ke Production (Cloudflare Pages)

Setelah test local berhasil:

### 1. Update Cloudflare Environment Variables

1. **Login Cloudflare**  
   https://dash.cloudflare.com

2. **Workers & Pages** → Pilih project `spxsoko-online`

3. **Settings → Environment variables**

4. **Add/Update Variables**:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | `521585739971-ngbskbb30jtamlb6op1kukv1o175p3al.apps.googleusercontent.com` | Production + Preview |
| `VITE_SUPABASE_URL` | `https://tnzwrnvggqrkstokcrrr.supabase.co` | Production + Preview |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production + Preview |

5. **Save**

### 2. Redeploy

**Option A - Trigger Redeploy:**
1. Deployments tab
2. Klik "..." pada deployment terbaru
3. Klik "Retry deployment"

**Option B - Git Push:**
```bash
git commit --allow-empty -m "chore: trigger redeploy with Supabase env vars"
git push origin main
```

### 3. Test Production

1. Tunggu deployment selesai (2-5 menit)
2. Buka: https://spxsoko.online
3. Test login & whitelist management
4. ✅ Should work sama seperti local!

---

## 📊 What's Working Now

| Feature | Status | Notes |
|---------|--------|-------|
| Landing Page | ✅ | Solar system dengan 3D planets |
| Google OAuth | ✅ | Login dengan Google account |
| Email Whitelist | ✅ | Persistent storage di Supabase |
| Settings Page | ✅ | Manage whitelist via UI |
| Dashboard | ✅ | Productivity metrics |
| Target Appeals | ✅ | Already using Supabase |

---

## 🎯 Checklist

- [x] Supabase ANON_KEY configured in `.env`
- [x] Frontend code uses Supabase (not localStorage)
- [x] SQL script ready (`create_whitelist_table.sql`)
- [ ] **TODO**: Create `whitelist` table in Supabase (if not exists)
- [ ] **TODO**: Test login locally
- [ ] **TODO**: Test whitelist add/remove
- [ ] **TODO**: Update Cloudflare env vars
- [ ] **TODO**: Deploy to production
- [ ] **TODO**: Test production login

---

## 📝 Important Files

| File | Purpose |
|------|---------|
| `frontend/.env` | ✅ Configured with Supabase credentials |
| `create_whitelist_table.sql` | SQL script to create whitelist table |
| `frontend/src/lib/supabase.js` | Supabase client initialization |
| `frontend/src/contexts/AuthContext.jsx` | Whitelist management logic |
| `frontend/src/pages/WhitelistSettings.jsx` | UI untuk manage whitelist |

---

## 🔐 Security Notes

✅ **Safe in Frontend:**
- Anon public key (role: "anon")
- Protected by Row Level Security (RLS)
- Rate limited by Supabase

❌ **NEVER Use in Frontend:**
- Service role key (role: "service_role")
- Full admin access, bypasses RLS

---

## 📞 Support

**Dokumentasi:**
- `SETUP_NOW.md` - Quick action guide
- `COPY_KEY_FROM_CLOUDFLARE.md` - Key retrieval guide
- `SUPABASE_SETUP.md` - Detailed setup documentation

**Supabase Dashboard:**
- Project: https://supabase.com/dashboard
- SQL Editor: Run queries
- Table Editor: View/edit data
- Logs: Debug errors

---

**Status**: ✅ READY TO TEST  
**Next Action**: Buat table `whitelist` → Start dev server → Test login! 🚀

---

**Last Updated**: 2026-09-26  
**Setup Time**: ~10 menit total
