# ⚡ Setup Supabase - Quick Action Guide

## ✅ Yang Sudah Diketahui:
- Supabase Project ID: `tnzwrnvggqrkstokcrrr`
- Supabase URL: `https://tnzwrnvggqrkstokcrrr.supabase.co` ✅
- Project sudah ada table: `target_appeals` ✅

## ⏳ Yang Perlu Dilakukan (5 menit):

---

## 1️⃣ Copy ANON Key (2 menit)

### A. Buka Supabase Dashboard:
🌐 https://supabase.com/dashboard

### B. Pilih project: `tnzwrnvggqrkstokcrrr`

### C. Settings → API
Copy **anon public** key (yang panjang, dimulai `eyJhbGci...`)

⚠️ **JANGAN copy service_role key!**

---

## 2️⃣ Update .env File (1 menit)

Buka file: `frontend/.env`

Ganti baris ini:
```env
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Dengan:
```env
VITE_SUPABASE_ANON_KEY=eyJhbGci... (paste key yang di-copy)
```

Save file!

---

## 3️⃣ Buat Table Whitelist (2 menit)

### A. Di Supabase Dashboard, buka **SQL Editor**

### B. Klik "New query"

### C. Copy-paste isi file: `create_whitelist_table.sql`

Atau copy script ini:

```sql
CREATE TABLE IF NOT EXISTS whitelist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whitelist_email ON whitelist(email);

ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON whitelist
  FOR ALL USING (true);

INSERT INTO whitelist (email) VALUES 
  ('rafi.alvian@spxexpress.com'),
  ('admin@spxsoko.online')
ON CONFLICT (email) DO NOTHING;
```

### D. Klik **Run** (atau Ctrl+Enter)

### E. Verifikasi:
- Buka **Table Editor**
- Table `whitelist` harus muncul
- Ada 2 rows dengan email default

---

## 4️⃣ Test Aplikasi (1 menit)

```bash
cd frontend
npm run dev
```

Buka: http://localhost:5173

Test:
1. Klik tombol "Dashboard" (hijau, pojok kanan atas)
2. Login dengan: `rafi.alvian@spxexpress.com`
3. ✅ Harusnya berhasil masuk!

Test Whitelist:
1. Klik icon ⚙️ (Settings)
2. Pilih "Email Whitelist"
3. Tambah email baru
4. **Refresh page** → email masih ada? ✅

---

## 🎯 Quick Checklist:

- [ ] Copy ANON key dari Supabase Dashboard
- [ ] Update `frontend/.env` dengan ANON key
- [ ] Jalankan SQL script di SQL Editor
- [ ] Verify table `whitelist` di Table Editor (2 rows)
- [ ] Restart dev server: `npm run dev`
- [ ] Test login di http://localhost:5173
- [ ] Test add/remove email di Settings

---

## 🚨 Current Error:

```
Uncaught Error: supabaseUrl is required
```

**Why**: `.env` belum punya ANON key yang valid

**Fix**: Ikuti step 1-2 di atas

---

## 📁 Files Ready:

| File | Purpose |
|------|---------|
| `GET_SUPABASE_KEY.md` | Detail panduan lengkap |
| `create_whitelist_table.sql` | SQL script siap pakai |
| `frontend/.env` | Sudah ada URL, tinggal isi KEY |
| `SETUP_NOW.md` | **⭐ File ini - Quick guide** |

---

## 🔐 Security:

✅ ANON key **AMAN** untuk frontend (protected by RLS)  
❌ Service role key **BAHAYA** - jangan dipakai!

---

**Total Time**: ~5 menit  
**Next Action**: Copy ANON key → Update .env → Run SQL → Test! 🚀
