# Quick Start Guide - SPX SOKO Dashboard

## ⚠️ Setup Required

Aplikasi memerlukan konfigurasi Supabase sebelum dapat dijalankan. Ikuti langkah berikut:

## 1. Setup Supabase Project

### A. Buat Project Supabase (5 menit)
1. Buka https://supabase.com/dashboard
2. Klik "New Project"
3. Isi detail project:
   - Name: `spx-soko-dashboard` (atau nama lain)
   - Database Password: Buat password yang kuat (simpan password ini!)
   - Region: Pilih yang terdekat (Singapore atau Tokyo)
4. Klik "Create new project"
5. Tunggu ~2 menit hingga project selesai dibuat

### B. Buat Database Table (2 menit)
1. Di dashboard Supabase, buka **SQL Editor** (icon </> di sidebar kiri)
2. Klik "New query"
3. Copy-paste script SQL berikut:

```sql
-- Create whitelist table
CREATE TABLE whitelist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX idx_whitelist_email ON whitelist(email);

-- Enable Row Level Security
ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for now)
CREATE POLICY "Allow all operations" ON whitelist
  FOR ALL USING (true);

-- Insert default whitelist emails
INSERT INTO whitelist (email) VALUES 
  ('rafi.alvian@spxexpress.com'),
  ('admin@spxsoko.online')
ON CONFLICT (email) DO NOTHING;
```

4. Klik "Run" atau tekan `Ctrl+Enter`
5. Verifikasi di **Table Editor** → tabel `whitelist` sudah muncul dengan 2 email

### C. Dapatkan Credentials (1 menit)
1. Buka **Settings** → **API** (icon ⚙️ di sidebar kiri)
2. Copy 2 nilai ini:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: String panjang dimulai dengan `eyJhbGci...`

## 2. Konfigurasi Frontend

### A. Update File .env
1. Buka file `frontend/.env`
2. Replace placeholder dengan credentials Supabase Anda:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=521585739971-ngbskbb30jtamlb6op1kukv1o175p3al.apps.googleusercontent.com

# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

3. Save file

### B. Restart Development Server
```bash
cd frontend
npm run dev
```

## 3. Test Aplikasi

1. Buka http://localhost:5173
2. Klik tombol "Dashboard" (tombol hijau di pojok kanan atas)
3. Login dengan email: `rafi.alvian@spxexpress.com`
4. Seharusnya berhasil masuk

### Test Whitelist Management
1. Klik icon ⚙️ (Settings) di sidebar
2. Pilih "Email Whitelist"
3. Tambahkan email baru
4. Refresh halaman → email masih ada (tersimpan di cloud!)
5. Verifikasi di Supabase: **Table Editor** → `whitelist` → lihat data terbaru

## 4. Deploy ke Production (Cloudflare Pages)

### A. Set Environment Variables
1. Buka Cloudflare Dashboard
2. Pilih project: **spxsoko-online**
3. **Settings** → **Environment variables**
4. Tambahkan 3 variabel berikut:

| Variable Name | Value |
|---------------|-------|
| `VITE_GOOGLE_CLIENT_ID` | `521585739971-ngbskbb30jtamlb6op1kukv1o175p3al.apps.googleusercontent.com` |
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` (dari Supabase) |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` (dari Supabase) |

5. Pilih environment: **Production** dan **Preview**
6. Klik "Save"

### B. Redeploy
1. Buat perubahan kecil atau trigger manual redeploy
2. Tunggu build selesai
3. Test di https://spxsoko.online

## 📚 Documentation Lengkap

Lihat file berikut untuk detail lebih lanjut:
- `SUPABASE_SETUP.md` - Detail setup Supabase
- `CLOUDFLARE_ENV_SETUP.md` - Detail setup Cloudflare
- `PRD.md` - Product Requirements

## 🆘 Troubleshooting

### Error: "supabaseUrl is required"
❌ **Penyebab**: File `.env` belum dikonfigurasi
✅ **Solusi**: Ikuti langkah 2.A di atas

### Error: "Invalid API key"
❌ **Penyebab**: Salah copy ANON_KEY atau ada spasi ekstra
✅ **Solusi**: Copy ulang dari Supabase Dashboard → Settings → API

### Login gagal "Email not authorized"
❌ **Penyebab**: Email belum ada di whitelist
✅ **Solusi**: Tambahkan email di Settings → Whitelist atau langsung di Supabase Table Editor

### Data whitelist tidak tersimpan
❌ **Penyebab**: RLS policy belum dibuat atau salah konfigurasi
✅ **Solusi**: Jalankan ulang SQL script di langkah 1.B

## 🎯 Next Steps

Setelah setup selesai:
1. ✅ Test semua fitur login & whitelist
2. ✅ Verifikasi data tersimpan di Supabase
3. ✅ Deploy ke production
4. 🔒 (Opsional) Setup RLS policy lebih ketat untuk security
5. 📊 Mulai input data produktivitas kurir

---

**Status**: ⏳ Waiting for Supabase configuration
**Estimated Setup Time**: ~10 menit
