# 🚀 GitHub Repository Setup Guide

## Step 1: Create GitHub Repository

1. **Buka GitHub** dan login
   - Go to: https://github.com/new

2. **Repository Details**
   - **Repository name**: `dashboard-spx-soko`
   - **Description**: `📊 SPX SOKO Productivity Dashboard - Real-time monitoring dari Google Sheets`
   - **Visibility**: 
     - ✅ **Private** (recommended untuk project internal)
     - atau **Public** jika ingin open source
   
3. **Initialize Repository**
   - ❌ **JANGAN** centang "Add a README file" (kita sudah punya)
   - ❌ **JANGAN** tambah .gitignore (kita sudah punya)
   - ❌ **JANGAN** tambah license (optional)

4. **Klik "Create repository"**

## Step 2: Connect Local Repository ke GitHub

Setelah repository dibuat, GitHub akan menampilkan command. **ATAU** gunakan command di bawah:

**Ganti `YOUR_USERNAME` dengan username GitHub Anda!**

```powershell
# Set remote repository
git remote add origin https://github.com/YOUR_USERNAME/dashboard-spx-soko.git

# Rename branch ke main (optional, GitHub default)
git branch -M main

# Push ke GitHub
git push -u origin main
```

## Step 3: Verify Push Berhasil

1. Refresh halaman GitHub repository Anda
2. Anda akan melihat semua files sudah terupload
3. Pastikan README.md tampil di halaman utama

## ⚠️ PENTING: Verify Keamanan

Setelah push, pastikan file-file sensitif TIDAK terupload:

1. Buka repository di GitHub
2. Gunakan search (tekan `/` lalu ketik filename)
3. Pastikan TIDAK ADA file berikut:
   - ❌ `service-account-key.json`
   - ❌ `service-account-base64.txt`
   - ❌ `.env` (di frontend atau backend)
   - ❌ `node_modules/`

4. Jika ada file sensitif yang ter-commit:
   ```powershell
   # STOP! Jangan lanjut
   # Hubungi admin untuk remove sensitive data dari Git history
   ```

## Alternative: GitHub CLI

Jika Anda punya GitHub CLI (`gh`):

```powershell
# Create repository dan push sekaligus
gh repo create dashboard-spx-soko --private --source=. --remote=origin --push
```

## Troubleshooting

### Error: Authentication Failed
```powershell
# Setup GitHub credentials
gh auth login
# atau gunakan Personal Access Token
```

### Error: Remote Already Exists
```powershell
# Remove existing remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/YOUR_USERNAME/dashboard-spx-soko.git
```

### Error: Branch Already Exists
```powershell
# Force push (hati-hati!)
git push -u origin main --force
```

---

**Next Step:** Setelah berhasil push, lanjut ke connect dengan Cloudflare Pages!
