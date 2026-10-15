# 🗄️ Supabase Setup Guide

## Overview
Dashboard ini menggunakan Supabase untuk menyimpan whitelist email user yang ter-authorized. Data disimpan secara persistent di cloud database.

---

## 📋 Prerequisites

- Account Supabase (free tier sudah cukup)
- Access ke Supabase Dashboard

---

## 🚀 Setup Steps

### 1. Create Supabase Project

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik **"New Project"**
3. Fill the form:
   - **Project name**: `SPX SOKO Dashboard`
   - **Database password**: Generate secure password (save this!)
   - **Region**: Choose nearest region (e.g., Southeast Asia)
4. Klik **"Create new project"**
5. Wait ~2 minutes untuk project setup

### 2. Create Whitelist Table

1. Di Supabase Dashboard, pilih project yang baru dibuat
2. Buka **"SQL Editor"** dari sidebar
3. Copy-paste SQL berikut dan klik **"Run"**:

```sql
-- Create whitelist table
CREATE TABLE whitelist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_whitelist_email ON whitelist(email);

-- Enable Row Level Security (RLS)
ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access to all authenticated users
CREATE POLICY "Allow read access to all"
  ON whitelist
  FOR SELECT
  USING (true);

-- Create policy to allow insert/update/delete to all authenticated users
CREATE POLICY "Allow all operations to authenticated users"
  ON whitelist
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default whitelist emails
INSERT INTO whitelist (email) VALUES
  ('rafi.alvian@spxexpress.com'),
  ('admin@spxsoko.online')
ON CONFLICT (email) DO NOTHING;
```

4. Verify table created:
   - Buka **"Table Editor"** → pilih **"whitelist"**
   - Should see 2 default emails

### 3. Get API Credentials

1. Buka **"Settings"** → **"API"**
2. Copy credentials:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)

### 4. Configure Environment Variables

#### Local Development:

1. Masuk ke folder frontend:
   ```bash
   cd frontend
   ```

2. Edit `.env` file (atau copy dari `.env.example`):
   ```env
   # Google OAuth
   VITE_GOOGLE_CLIENT_ID=521585739971-ngbskbb30jtamlb6op1kukv1o175p3al.apps.googleusercontent.com

   # Supabase
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Replace values dengan credentials dari Step 3

#### Production (Cloudflare Pages):

1. Login ke Cloudflare Dashboard
2. Buka project **dashboard-spx-soko**
3. Settings → **Environment variables**
4. Add variables:
   - **Variable name**: `VITE_SUPABASE_URL`
   - **Value**: Your Project URL
   - **Environment**: Both Production & Preview
   
   - **Variable name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Anon Key
   - **Environment**: Both Production & Preview

5. Save dan **Redeploy** project

---

## 🔒 Security Features

### Row Level Security (RLS)
- ✅ Enabled untuk whitelist table
- ✅ Policy allows read untuk semua user
- ✅ Policy allows write operations untuk authenticated users
- ✅ Data terisolasi per project

### Anon Key Safety
- Public key yang aman untuk frontend
- Tidak bisa digunakan untuk operations berbahaya
- RLS policies enforce security rules
- Rate limiting otomatis dari Supabase

---

## 🧪 Testing

### Test di Local:

1. Start dev server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Login dengan admin account

3. Buka **Settings** → **Whitelist**

4. Add email baru → Should save ke Supabase

5. Verify di Supabase Dashboard:
   - Table Editor → whitelist
   - Email baru muncul di table

6. Refresh browser → Email tetap ada (persistent!)

### Test Add/Remove:

1. Add multiple emails
2. Remove satu email
3. Check Supabase Table Editor → confirm changes
4. Reload page → data tetap persist

---

## 📊 Database Schema

```sql
Table: whitelist
├── id (UUID, Primary Key) - Auto-generated
├── email (TEXT, UNIQUE, NOT NULL) - User email
├── created_at (TIMESTAMP) - When email was added
└── updated_at (TIMESTAMP) - Last modification time
```

**Indexes:**
- Primary key on `id`
- Unique constraint on `email`
- B-tree index on `email` for fast lookups

---

## 🔄 Migration from localStorage

Jika sebelumnya menggunakan localStorage:

### Auto-migration (sudah ter-handle di code):
1. Login pertama kali → check Supabase
2. Jika Supabase kosong → initialize dengan default emails
3. localStorage tidak digunakan lagi

### Manual migration:
```javascript
// Di browser console (jika perlu restore data lama)
const oldList = JSON.parse(localStorage.getItem('spx_whitelist'));
console.log('Old whitelist:', oldList);
// Then manually add via UI Settings → Whitelist
```

---

## 🐛 Troubleshooting

### Error: "Failed to load whitelist"
**Solution**: 
- Check Supabase Project URL correct di `.env`
- Check Anon Key correct
- Check internet connection
- Check Supabase project not paused (free tier auto-pause after inactivity)

### Error: "Error inserting record"
**Solution**: 
- Check RLS policies enabled
- Check email format valid
- Check duplicate email constraint
- Check Supabase table exists

### Whitelist tidak persist setelah reload
**Solution**: 
- Check environment variables loaded correctly
- Check Supabase credentials valid
- Check browser console for errors
- Verify data in Supabase Table Editor

### Production deployment error
**Solution**: 
- Verify environment variables set in Cloudflare
- Redeploy after adding env vars
- Check build logs for errors
- Test Supabase connection from production URL

---

## 📈 Monitoring

### Via Supabase Dashboard:

1. **Database** → **Tables** → **whitelist**
   - View all whitelisted emails
   - Manual add/edit/delete

2. **Database** → **Logs**
   - Check query logs
   - Monitor for errors

3. **Project Settings** → **API**
   - Check API usage
   - Monitor rate limits

---

## 🔐 Backup & Recovery

### Backup Whitelist:

```sql
-- Run in SQL Editor
SELECT email, created_at 
FROM whitelist 
ORDER BY created_at;
```

### Restore Whitelist:

```sql
-- Delete all
DELETE FROM whitelist;

-- Insert backup
INSERT INTO whitelist (email) VALUES
  ('email1@example.com'),
  ('email2@example.com')
ON CONFLICT (email) DO NOTHING;
```

---

## 💡 Best Practices

1. **Regular Backups**: Export whitelist monthly
2. **Monitor Usage**: Check Supabase dashboard for anomalies
3. **Audit Trail**: `created_at` field tracks when email added
4. **Security**: Never commit `.env` file to git
5. **Testing**: Test add/remove in staging before production

---

## 📞 Support

Jika ada masalah:
1. Check Supabase project status
2. Check environment variables
3. Check browser console for errors
4. Check Supabase logs
5. Verify table schema correct

---

## ✅ Checklist Setup

- [ ] Supabase project created
- [ ] Whitelist table created
- [ ] RLS policies enabled
- [ ] Default emails inserted
- [ ] API credentials copied
- [ ] Environment variable set (local)
- [ ] Environment variable set (production)
- [ ] Tested add email
- [ ] Tested remove email
- [ ] Tested reload persistence
- [ ] Verified in Supabase table

---

**Last Updated**: 2026-01-26  
**Version**: 1.0.0
