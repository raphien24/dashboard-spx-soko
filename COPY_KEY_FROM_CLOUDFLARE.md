# 🔑 Copy Supabase ANON Key dari Cloudflare

## 📍 Masalahnya

Anda sudah pernah setup Supabase ANON_KEY di Cloudflare Workers untuk backend, tapi sekarang perlu key yang sama untuk frontend.

Key tersebut disimpan sebagai **Cloudflare Worker Secret** (encrypted), jadi tidak bisa di-copy langsung dari dashboard.

---

## ✅ Solusi: 2 Opsi

### Opsi 1: Ambil dari Supabase Dashboard (RECOMMENDED) ⭐

Karena Cloudflare secret adalah encrypted dan tidak bisa dibaca, **lebih mudah ambil ulang dari Supabase**.

#### Step-by-Step:

1. **Login ke Supabase**  
   🌐 https://supabase.com/dashboard

2. **Pilih Project**  
   Klik project: `tnzwrnvggqrkstokcrrr`

3. **Buka Settings → API**  
   - Sidebar kiri: Click icon ⚙️ **Settings**
   - Pilih **API**

4. **Copy Anon Key**  
   Di section **Project API keys**:
   ```
   anon public
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuend...
   ```
   
   Klik icon **Copy** atau select all → Ctrl+C

5. **Update Frontend .env**  
   Buka: `frontend/.env`
   
   Ganti baris ini:
   ```env
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
   
   Dengan:
   ```env
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
   ```

6. **Save & Restart**
   ```bash
   cd frontend
   npm run dev
   ```

---

### Opsi 2: Query dari Cloudflare Worker (Advanced)

Jika benar-benar tidak bisa akses Supabase dashboard, bisa query dari worker:

#### Method A: Via Wrangler CLI

```bash
cd cloudflare-backend

# Login ke Cloudflare (jika belum)
wrangler login

# List secrets (will only show names, not values)
wrangler secret list

# Output:
# [
#   {
#     "name": "SUPABASE_ANON_KEY",
#     "type": "secret_text"
#   },
#   {
#     "name": "GOOGLE_SERVICE_ACCOUNT",
#     "type": "secret_text"
#   }
# ]
```

⚠️ **Note**: Wrangler **tidak bisa** membaca nilai secret (by design untuk security)

#### Method B: Temporary Echo Endpoint

1. **Edit `worker.js`** - Tambahkan route sementara:

```javascript
// Temporary - for debugging only, DELETE after use!
if (url.pathname === '/api/debug/show-key' && request.method === 'GET') {
  return new Response(JSON.stringify({
    key: env.SUPABASE_ANON_KEY || 'NOT_SET',
    url: env.SUPABASE_URL || 'NOT_SET'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
```

2. **Deploy**:
```bash
wrangler deploy
```

3. **Query**:
```bash
curl https://dashboard-spx-soko-backend.spxsoko.workers.dev/api/debug/show-key
```

4. **Copy key dari response**

5. **⚠️ HAPUS route tersebut** dan deploy lagi (SECURITY!)

---

### Opsi 3: Check di Cloudflare Dashboard

Meskipun tidak bisa melihat nilai secret, Anda bisa verify bahwa secret exists:

1. **Login Cloudflare**  
   🌐 https://dash.cloudflare.com

2. **Workers & Pages**  
   Pilih worker: `dashboard-spx-soko-backend`

3. **Settings → Variables**  
   Check ada variable: `SUPABASE_ANON_KEY`
   
   Tapi value-nya akan hidden: `••••••••••••••`

---

## 🎯 Recommendation

**Gunakan Opsi 1** (ambil dari Supabase) karena:
- ✅ Paling mudah dan cepat (2 menit)
- ✅ Paling aman (no temporary debug endpoint)
- ✅ Tidak perlu deploy worker
- ✅ Key yang sama tetap valid

Key anon public **tidak pernah berubah** kecuali Anda regenerate di Supabase, jadi aman untuk ambil ulang kapan saja.

---

## 📋 After You Get The Key

1. Update `frontend/.env`:
   ```env
   VITE_SUPABASE_URL=https://tnzwrnvggqrkstokcrrr.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci... (paste here)
   ```

2. Verify whitelist table exists (jalankan `create_whitelist_table.sql` jika belum)

3. Restart dev server:
   ```bash
   cd frontend
   npm run dev
   ```

4. Test login: http://localhost:5173

5. Update Cloudflare Pages environment variables (for production):
   - Dashboard → Workers & Pages → `spxsoko-online`
   - Settings → Environment variables
   - Add: `VITE_SUPABASE_ANON_KEY` = (same key)

---

## ✅ Quick Verification

After setup, test in browser console:

```javascript
// Check env loaded
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('Key length:', import.meta.env.VITE_SUPABASE_ANON_KEY?.length);

// Should output:
// URL: https://tnzwrnvggqrkstokcrrr.supabase.co
// Key exists: true
// Key length: ~300+ characters
```

---

## 🔐 Security Note

**Anon public key is SAFE for frontend** because:
- Protected by Row Level Security (RLS) policies
- Rate limited by Supabase
- Cannot perform admin operations
- Cannot access service_role functions

**Service role key** = ❌ NEVER use in frontend!

---

**Estimated Time**: 2 minutes  
**Recommended**: Opsi 1 (Supabase Dashboard) ⭐
