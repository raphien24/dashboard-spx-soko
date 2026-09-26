# 🔗 Cloudflare Pages + GitHub Integration

## Setup Auto-Deployment dari GitHub

### Step 1: Buka Cloudflare Pages Dashboard

1. Login ke Cloudflare: https://dash.cloudflare.com
2. Di sidebar kiri, klik **"Workers & Pages"**
3. Klik tab **"Pages"**
4. Klik tombol **"Create application"** atau **"Connect to Git"**

### Step 2: Connect GitHub Repository

1. **Select Git Provider**
   - Pilih **"Connect to Git"**
   - Pilih **"GitHub"**

2. **Authorize Cloudflare**
   - Klik **"Connect GitHub"**
   - Window popup akan muncul untuk authorize Cloudflare
   - Login ke GitHub jika diminta
   - Klik **"Authorize Cloudflare-Pages"**

3. **Install Cloudflare Pages App**
   - Pilih **"Install & Authorize"**
   - Pilih account: **raphien24**
   - Pilih repository access:
     - **Recommended:** "Only select repositories"
     - Pilih repository: **dashboard-spx-soko**
   - Klik **"Install"**

### Step 3: Configure Build Settings

Setelah repository terhubung, configure project:

#### Project Configuration

**Project name:** `dashboard-spx-soko` (atau akan otomatis terisi)

**Production branch:** `main`

#### Build Settings

**Framework preset:** `Vite`

**Build command:**
```bash
cd frontend && npm install && npm run build
```

**Build output directory:**
```
frontend/dist
```

**Root directory (advanced):** 
```
/
```
(biarkan kosong atau isi `/`)

#### Environment Variables (Production)

Tambahkan environment variables berikut:

| Variable Name | Value |
|---------------|-------|
| `VITE_API_BASE_URL` | `https://dashboard-spx-soko-backend.spxsoko.workers.dev/api` |
| `VITE_SPREADSHEET_ID` | `1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA` |
| `VITE_API_REFRESH_INTERVAL` | `30000` |

**Cara tambah:**
1. Scroll ke bagian **"Environment variables (advanced)"**
2. Klik **"Add variable"** untuk setiap variable
3. Isi **Variable name** dan **Value**
4. Pastikan pilih **"Production"** environment

### Step 4: Save and Deploy

1. Review semua settings
2. Klik **"Save and Deploy"**
3. Cloudflare akan mulai build dan deploy otomatis
4. Tunggu beberapa menit (biasanya 1-3 menit)

### Step 5: Verify Deployment

Setelah deployment selesai:

1. Anda akan melihat **"Success!"** message
2. URL production akan muncul: `https://dashboard-spx-soko.pages.dev`
3. Klik URL untuk test dashboard
4. Verify bahwa data muncul dari Google Sheets

## 🔄 Auto-Deployment Workflow

Setelah setup, setiap kali Anda push ke GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Cloudflare Pages akan **otomatis**:
1. Detect perubahan di GitHub
2. Build aplikasi (run `npm install && npm run build`)
3. Deploy versi baru
4. Update live site dalam ~2-3 menit

## 📊 Monitoring Deployments

### Di Cloudflare Dashboard

1. Go to: Workers & Pages > Pages > dashboard-spx-soko
2. Tab **"Deployments"** - lihat history semua deployments
3. Klik deployment untuk lihat:
   - Build logs
   - Deployment status
   - Preview URL
   - Production URL

### Deployment Status

- 🟢 **Success** - Deployment berhasil, live di production
- 🟡 **Building** - Sedang build
- 🔴 **Failed** - Build gagal, check logs untuk error

### Preview Deployments

Setiap commit di **branch non-main** akan create preview deployment:
- URL format: `https://[commit-hash].dashboard-spx-soko.pages.dev`
- Perfect untuk testing sebelum merge ke main

## 🔧 Build Settings (Reference)

Jika perlu edit build settings nanti:

1. Go to: Workers & Pages > Pages > dashboard-spx-soko
2. Klik tab **"Settings"**
3. Section **"Builds & deployments"**
4. Edit sesuai kebutuhan

**Current settings:**
```yaml
Framework preset: Vite
Build command: cd frontend && npm install && npm run build
Build output directory: frontend/dist
Root directory: /
Node version: 18 (default)
```

## 🌍 Custom Domain (Optional)

Untuk menggunakan custom domain:

1. Go to: Workers & Pages > Pages > dashboard-spx-soko
2. Tab **"Custom domains"**
3. Klik **"Set up a custom domain"**
4. Masukkan domain Anda (e.g., `dashboard.spxsoko.com`)
5. Follow DNS setup instructions
6. Cloudflare akan otomatis provision SSL certificate

## 🔐 Environment Variables Per Branch

Anda bisa set environment variables berbeda untuk:
- **Production** (branch: main)
- **Preview** (branch: lainnya)

Berguna untuk:
- Development API endpoints
- Debug modes
- Testing credentials

## 📱 Cloudflare Pages Features

Features yang otomatis aktif:

- ✅ **Global CDN** - Fast loading di seluruh dunia
- ✅ **Automatic HTTPS** - SSL certificate gratis
- ✅ **Unlimited bandwidth** (dalam free tier)
- ✅ **Build caching** - Faster subsequent builds
- ✅ **Atomic deployments** - Zero downtime deploys
- ✅ **Instant rollbacks** - Rollback ke deployment sebelumnya dalam 1 klik

## 🆘 Troubleshooting

### Build Failed

**Check build logs:**
1. Go to deployment page
2. Click **"View build logs"**
3. Look for errors

**Common issues:**
- Missing dependencies: Check `package.json`
- Environment variables: Check all VITE_ variables
- Build command path: Make sure `cd frontend` is correct
- Node version: Default is Node 18

### Environment Variables Not Working

- Variable harus diawali dengan `VITE_` untuk Vite apps
- Redeploy setelah menambah variables
- Check case sensitivity (VITE_API_BASE_URL ≠ vite_api_base_url)

### Site Shows Old Version

- Clear browser cache (Ctrl + Shift + R)
- Check deployment status (should be "Success")
- Verify latest commit is deployed

### Deploy Webhook (Advanced)

Untuk trigger manual deployment:

1. Go to: Settings > Builds & deployments
2. Scroll to **"Build hooks"**
3. Create hook untuk manual trigger via API/webhook

---

## ✅ Checklist Setelah Setup

- [ ] Repository terhubung dengan Cloudflare Pages
- [ ] Environment variables sudah diset
- [ ] Build settings sudah correct
- [ ] Deployment pertama berhasil (Success)
- [ ] Site accessible di `https://dashboard-spx-soko.pages.dev`
- [ ] Data muncul dari Google Sheets
- [ ] Test push commit baru (untuk verify auto-deploy)

---

**Next Step:** Test auto-deployment dengan commit perubahan kecil!
