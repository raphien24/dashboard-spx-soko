# 📱 Cara Clear Cache di HP Android

## Jika tampilan belum berubah setelah git push:

### ✅ Opsi 1: Hard Refresh di Browser (Paling Mudah)

**Chrome Android:**
1. Buka website di Chrome
2. Tap icon titik tiga (⋮) di pojok kanan atas
3. Pilih **"Settings"** / **"Setelan"**
4. Pilih **"Privacy and security"** / **"Privasi dan keamanan"**
5. Pilih **"Clear browsing data"** / **"Hapus data penjelajahan"**
6. Pilih **"Cached images and files"** / **"Gambar dan file dalam cache"**
7. Time range: **"Last hour"** / **"1 jam terakhir"** (atau **"All time"** untuk bersih total)
8. Tap **"Clear data"** / **"Hapus data"**
9. Refresh website (pull down atau F5)

**Firefox Android:**
1. Tap icon titik tiga (⋮)
2. Pilih **"Settings"**
3. Pilih **"Delete browsing data"**
4. Centang **"Cached images and files"**
5. Tap **"Delete browsing data"**

### ✅ Opsi 2: Incognito/Private Mode (Cepat untuk Testing)

**Chrome:**
1. Tap icon titik tiga (⋮)
2. Pilih **"New incognito tab"** / **"Tab samaran baru"**
3. Buka website di tab incognito

**Firefox:**
1. Tap icon titik tiga (⋮)
2. Pilih **"New private tab"**
3. Buka website di private tab

### ✅ Opsi 3: Force Reload URL dengan Parameter

1. Buka browser
2. Di address bar, tambahkan `?v=2` atau `?nocache=1` di akhir URL
   
   **Contoh:**
   ```
   https://spxsoko.online/?v=2
   ```
   
3. Enter / Go

### ✅ Opsi 4: Clear Site-Specific Data (Chrome)

1. Buka website
2. Tap icon **padlock** 🔒 atau **info (i)** di sebelah URL
3. Pilih **"Site settings"** / **"Setelan situs"**
4. Scroll ke bawah, tap **"Clear & reset"** / **"Hapus dan atur ulang"**
5. Confirm

---

## 🔍 Cara Cek Deployment Status di Cloudflare

1. Login ke **Cloudflare Dashboard**: https://dash.cloudflare.com
2. Pilih **"Workers & Pages"** di sidebar
3. Klik project **"dashboard-spx-soko"** (atau nama project Anda)
4. Lihat di tab **"Deployments"**
5. Cek status build terakhir:
   - ✅ **Success** = Build selesai, sudah live
   - 🔄 **Building** = Sedang proses build (tunggu 2-5 menit)
   - ❌ **Failed** = Build gagal (cek logs untuk error)

### Last Deployment Info:
- Commit: `8315ad2` - "Fix mobile sidebar overlay and menu button visibility"
- Time: Cek di Cloudflare dashboard
- Status: Cek di Cloudflare dashboard

---

## 🚀 Cara Manual Deploy (Jika Auto-Deploy Bermasalah)

### Opsi A: Trigger Redeploy di Cloudflare

1. Buka Cloudflare Pages dashboard
2. Pilih project
3. Klik tab **"Deployments"**
4. Klik **"Retry deployment"** pada deployment terakhir

### Opsi B: Manual Build & Deploy

```bash
# Di terminal/command prompt
cd "d:\SPX\DASHBOARD SPX SOKO"

# Build frontend
cd frontend
npm run build

# Deploy ke Cloudflare Pages (jika ada wrangler)
npm run deploy
```

---

## 📞 Troubleshooting

### Masalah: Tampilan masih lama setelah clear cache
**Solusi:**
1. Cek di Cloudflare apakah build sudah **Success**
2. Tunggu 1-2 menit setelah build success (propagasi CDN)
3. Close browser sepenuhnya, buka lagi
4. Restart HP (extreme case)

### Masalah: Build gagal di Cloudflare
**Solusi:**
1. Cek build logs di Cloudflare
2. Pastikan `package.json` di frontend tidak ada error
3. Cek apakah ada dependency yang missing
4. Re-push dengan commit baru

---

## ✨ Quick Test: Verifikasi Perubahan

Setelah clear cache, cek di HP:
- ✅ Sidebar tersembunyi secara default (tidak menutupi konten)
- ✅ Tombol menu hamburger (☰) terlihat jelas di kiri atas (putih dengan border biru)
- ✅ Tap tombol menu untuk buka sidebar
- ✅ Ada overlay gelap blur saat sidebar terbuka
- ✅ Tap overlay atau X untuk tutup sidebar
- ✅ Konten dashboard terlihat full screen

---

**Commit terakhir yang di-push:**
- `8315ad2` - Fix mobile sidebar overlay and menu button visibility
- Files: `Sidebar.jsx`, `App.jsx`
