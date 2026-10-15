# 🔑 Cara Mendapatkan Supabase ANON Key

## Project Info
- **Project ID**: `tnzwrnvggqrkstokcrrr`
- **Project URL**: `https://tnzwrnvggqrkstokcrrr.supabase.co`
- **Existing Tables**: `target_appeals` (already working)

---

## 📋 Step-by-Step

### 1. Login ke Supabase Dashboard
Buka: https://supabase.com/dashboard

### 2. Pilih Project yang Sudah Ada
Klik project dengan ID: **tnzwrnvggqrkstokcrrr**

### 3. Buka Settings → API
- Klik icon **⚙️ Settings** di sidebar kiri
- Pilih **API**

### 4. Copy ANON Key
Di bagian **Project API keys**, akan ada 2 keys:

```
✅ anon/public key (Copy this one!)
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....

❌ service_role key (DO NOT use for frontend!)
```

**IMPORTANT**: Copy yang **anon public key**, bukan service_role!

### 5. Update Frontend .env
Buka file: `frontend/.env`

Replace `your_anon_key_here` dengan key yang di-copy:

```env
VITE_SUPABASE_URL=https://tnzwrnvggqrkstokcrrr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

### 6. Restart Dev Server
```bash
cd frontend
npm run dev
```

---

## 🗄️ Setup Database Table - Whitelist

Karena project Supabase sudah ada, kita hanya perlu **menambahkan table baru** untuk whitelist.

### SQL Script:

Di **SQL Editor**, jalankan script ini:

```sql
-- Create whitelist table
CREATE TABLE IF NOT EXISTS whitelist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookup
CREATE INDEX IF NOT EXISTS idx_whitelist_email ON whitelist(email);

-- Enable Row Level Security
ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

-- Allow all operations (sesuaikan dengan kebutuhan security)
DROP POLICY IF EXISTS "Allow all operations" ON whitelist;
CREATE POLICY "Allow all operations" ON whitelist
  FOR ALL USING (true);

-- Insert default whitelist emails
INSERT INTO whitelist (email) VALUES 
  ('rafi.alvian@spxexpress.com'),
  ('admin@spxsoko.online')
ON CONFLICT (email) DO NOTHING;
```

### Verifikasi:

1. Buka **Table Editor** di Supabase Dashboard
2. Seharusnya ada 2 tables:
   - ✅ `target_appeals` (sudah ada)
   - ✅ `whitelist` (baru dibuat)
3. Klik table `whitelist`
4. Seharusnya ada 2 rows dengan email default

---

## 🚀 Update Cloudflare Environment

Karena Cloudflare backend (`worker.js`) sudah punya SUPABASE_ANON_KEY, **gunakan key yang sama** untuk frontend!

### Check Current Cloudflare Env:

1. Buka: https://dash.cloudflare.com
2. **Workers & Pages** → Pilih project
3. **Settings** → **Environment variables**
4. Cari variable: `SUPABASE_ANON_KEY`
5. Copy value-nya

### Add Frontend Variable:

Tambahkan variable baru:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_SUPABASE_ANON_KEY` | (same as SUPABASE_ANON_KEY) | Production + Preview |

**Note**: Variable untuk Vite harus prefix `VITE_`, tapi value-nya sama!

---

## ✅ Quick Test

Setelah setup selesai:

```bash
cd frontend
npm run dev
```

Test di browser console:

```javascript
// Check connection
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key configured:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

// Test query (setelah login)
// Buka Settings → Whitelist
// Add/Remove email
// Refresh → data harusnya tetap ada
```

---

## 🔐 Security Notes

### ✅ Safe to Use in Frontend:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (public key, RLS-protected)

### ❌ NEVER Use in Frontend:
- `service_role` key (bypass RLS, full admin access!)

### 🛡️ RLS (Row Level Security):
- Table `whitelist` sudah enable RLS
- Current policy: Allow all (untuk development)
- **TODO Production**: Restrict policy, hanya admin yang bisa edit

---

## 📊 Summary

**What You Need:**
1. Copy ANON key dari Supabase Dashboard
2. Update `frontend/.env`
3. Jalankan SQL script untuk buat table `whitelist`
4. Restart dev server
5. Test login & whitelist management

**Estimated Time**: 5 menit

**Current Status**:
- ✅ Supabase URL: **Known** (`https://tnzwrnvggqrkstokcrrr.supabase.co`)
- ⏳ ANON Key: **Need to copy from dashboard**
- ⏳ Whitelist table: **Need to create with SQL**
- ⏳ Frontend .env: **Need to update**

---

**Next**: Copy ANON key dan update `.env` file! 🚀
