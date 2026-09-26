# 📤 Instruksi Push ke GitHub

## Opsi 1: Menggunakan GitHub CLI (Recommended jika sudah login)

Jika GitHub CLI sudah berhasil login (`gh auth status` menunjukkan logged in):

```powershell
cd "d:\SPX\DASHBOARD SPX SOKO"

# Create repository dan push sekaligus
gh repo create dashboard-spx-soko --private --source=. --remote=origin --push

# Atau jika ingin public:
gh repo create dashboard-spx-soko --public --source=. --remote=origin --push
```

## Opsi 2: Manual Create di GitHub (Paling Mudah)

### Step 1: Create Repository di GitHub

1. Buka browser dan pergi ke: https://github.com/new
2. Isi form:
   - **Repository name**: `dashboard-spx-soko`
   - **Description**: `📊 SPX SOKO Productivity Dashboard - Real-time monitoring dari Google Sheets`
   - **Visibility**: Pilih **Private** atau **Public**
   - ❌ **JANGAN** centang "Add a README file"
   - ❌ **JANGAN** centang "Add .gitignore"
3. Klik **"Create repository"**

### Step 2: Push dari Command Line

Setelah repository dibuat, **ganti `YOUR_USERNAME`** dengan username GitHub Anda:

```powershell
cd "d:\SPX\DASHBOARD SPX SOKO"

# Set remote (ganti YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/dashboard-spx-soko.git

# Rename branch ke main
git branch -M main

# Push ke GitHub
git push -u origin main
```

**Contoh:** Jika username Anda adalah `johndoe`:
```powershell
git remote add origin https://github.com/johndoe/dashboard-spx-soko.git
git branch -M main
git push -u origin main
```

### Step 3: Authenticate (Jika diminta)

Saat pertama kali push, Anda akan diminta authenticate:

**Windows:**
- Windows akan membuka browser untuk GitHub authentication
- Login dan authorize
- Push akan otomatis lanjut

**Manual Token (jika perlu):**
1. Buat Personal Access Token: https://github.com/settings/tokens/new
2. Pilih scope: `repo` (full control)
3. Copy token
4. Paste token sebagai password saat diminta

## Opsi 3: Menggunakan Script

Jalankan script yang sudah disediakan:

```powershell
cd "d:\SPX\DASHBOARD SPX SOKO"
.\push-to-github.ps1
```

Script akan memandu Anda step-by-step.

## ✅ Verify Push Berhasil

1. Buka repository di browser: `https://github.com/YOUR_USERNAME/dashboard-spx-soko`
2. Pastikan semua files terupload
3. Pastikan README.md tampil dengan baik
4. **PENTING:** Verify tidak ada file sensitif:
   - ❌ `service-account-key.json`
   - ❌ `.env`
   - ❌ `node_modules/`

## 🆘 Troubleshooting

### Error: remote origin already exists
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/dashboard-spx-soko.git
```

### Error: Authentication failed
```powershell
# Gunakan GitHub CLI
gh auth login

# Atau buat Personal Access Token di:
# https://github.com/settings/tokens
```

### Error: Repository not found
- Pastikan repository sudah dibuat di GitHub
- Pastikan username benar
- Pastikan repository name: `dashboard-spx-soko`

---

**Setelah berhasil push, langkah berikutnya:** Connect dengan Cloudflare Pages untuk auto-deployment!
