# Deploy GAS untuk Spreadsheet Productivity

**Target Appeal** membutuhkan GAS deployment terpisah dari Expedite karena menggunakan spreadsheet yang berbeda.

## Langkah Deploy

### 1. Buka Spreadsheet Productivity
- URL: `https://docs.google.com/spreadsheets/d/1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA/edit`
- Spreadsheet ini berisi data kurir, productivity, attendance, dll

### 2. Buka Apps Script Editor
- Klik: **Extensions → Apps Script**
- Akan membuka editor dengan nama project (misal: "Productivity Script")

### 3. Upload 2 File Script

#### File 1: `doPost`
- Klik tombol **"+"** → **File**
- Nama: `doPost` (tanpa .gs)
- Copy seluruh isi file: `gas-scripts/doPost.gs`
- Paste ke editor
- **Save** (Ctrl+S)

#### File 2: `TargetAppeal`
- Klik tombol **"+"** → **File**
- Nama: `TargetAppeal` (tanpa .gs)
- Copy seluruh isi file: `gas-scripts/TargetAppeal.gs`
- Paste ke editor
- **Save** (Ctrl+S)

### 4. Deploy Web App
1. Klik **Deploy** (kanan atas) → **New deployment**
2. Settings:
   - **Type**: Web app
   - **Description**: "Productivity API v1" (atau apapun)
   - **Execute as**: Me (`[your-email]@gmail.com`)
   - **Who has access**: **Anyone**
3. Klik **Deploy**
4. **Authorize** (first time):
   - Review permissions
   - Click "Advanced" → "Go to [Project name] (unsafe)"
   - Allow
5. **Copy Web App URL**
   - Format: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`
   - **Save URL ini** — akan dipakai di Cloudflare

### 5. Set Cloudflare Secret

Buka terminal di folder `cloudflare-backend`:

```bash
cd "d:\SPX\DASHBOARD SPX SOKO\cloudflare-backend"
npx wrangler secret put GAS_PRODUCTIVITY_URL
```

Saat diminta, **paste Web App URL** dari langkah 4.

### 6. Deploy Cloudflare Worker

```bash
npx wrangler deploy
```

### 7. Test

1. Buka dashboard: `https://[your-dashboard-url]`
2. Menu: **Productivity → Adjust Target**
3. Halaman harus load tanpa error
4. Submit test appeal untuk week tertentu
5. Check spreadsheet Productivity → sheet **TARGET_APPEAL** otomatis dibuat

## Troubleshooting

### Error: "Script function not found: doGet"
- **Cause**: File `doPost` tidak ada atau tidak di-save
- **Fix**: Pastikan file `doPost` ada di sidebar dan sudah save

### Error: 403 Permission Denied
- **Cause**: Deployment execute as "User accessing" instead of "Me"
- **Fix**: Deploy → Manage deployments → Edit → Execute as: **Me** → Update

### Error: Sheet TARGET_APPEAL not found
- **Cause**: Script tidak punya permission create sheet
- **Fix**: 
  1. Buka spreadsheet
  2. Manual create sheet bernama `TARGET_APPEAL`
  3. Header: `Week Start | Contract | Vehicle | Appeal Target | Last Updated | Updated By`

### Worker masih return empty array
- **Cause**: Cloudflare secret belum di-set atau salah URL
- **Fix**: 
  ```bash
  npx wrangler secret list  # Check apakah GAS_PRODUCTIVITY_URL ada
  npx wrangler secret put GAS_PRODUCTIVITY_URL  # Set ulang jika perlu
  ```

## File Structure di GAS Editor

```
📁 Productivity Script
├── doPost.gs          ← Handle doGet/doPost (web app entry point)
└── TargetAppeal.gs    ← Target Appeal CRUD functions
```

## Deployment URL Relationship

```
Frontend
   ↓ fetch
Cloudflare Worker (uses GAS_PRODUCTIVITY_URL)
   ↓ fetch
Google Apps Script (Productivity spreadsheet)
   ↓ read/write
TARGET_APPEAL sheet
```

## Update Script (Future Changes)

Jika ada update di local files:

1. Copy code baru dari `gas-scripts/[filename].gs`
2. Paste ke GAS editor (overwrite existing)
3. Save
4. Deploy → Manage deployments → Edit → **New version** → Deploy
5. Tidak perlu set Cloudflare secret lagi (URL tidak berubah)

---

**Done!** Target Appeal sekarang fully functional dengan GAS deployment terpisah.
