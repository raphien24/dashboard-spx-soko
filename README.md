# 📊 SPX SOKO Productivity Dashboard

Dashboard untuk monitoring produktivitas kurir SPX SOKO dengan real-time data dari Google Sheets.

![Dashboard Preview](https://img.shields.io/badge/Status-Live-success)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-8-purple)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange)

## 🌟 Features

- ✅ **Real-time Data Sync** - Auto-refresh dari Google Sheets setiap 30 detik
- 📈 **Interactive Charts** - Performance by contract, top zones, fleet composition
- 📋 **Smart Table** - Filter, sort, dan pagination untuk courier schedule
- 🎯 **KPI Metrics** - Total couriers, deliveries, success rate, fleet utilization
- 🚀 **Fast & Global** - Deployed on Cloudflare Pages & Workers
- 🔐 **Secure** - Google Service Account authentication

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite 8** - Build tool
- **TailwindCSS 3** - Styling
- **Recharts** - Charts visualization
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Cloudflare Workers** - Serverless backend
- **Google Sheets API** - Data source
- **Service Account** - Authentication

## 📦 Project Structure

```
dashboard-spx-soko/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── dashboard/   # Dashboard components
│   │   │   ├── common/      # Reusable components
│   │   │   └── schedule/    # Schedule table components
│   │   ├── services/        # API services
│   │   ├── store/           # Zustand state management
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   └── package.json
├── backend/                  # Local development backend (Express)
│   ├── server.js
│   └── package.json
├── cloudflare-backend/       # Cloudflare Worker (Production)
│   ├── worker.js
│   └── wrangler.toml
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Google Cloud Service Account dengan akses ke Spreadsheet
- Cloudflare account (untuk deployment)

### Local Development

1. **Clone repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/dashboard-spx-soko.git
   cd dashboard-spx-soko
   ```

2. **Setup Backend (Local)**
   ```bash
   cd backend
   npm install
   
   # Copy .env.example ke .env dan isi credentials
   cp .env.example .env
   
   # Tambahkan service-account-key.json
   # (download dari Google Cloud Console)
   
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   
   # Copy .env.example ke .env
   cp .env.example .env
   
   npm run dev
   ```

4. **Open browser**: http://localhost:5173

## 🌐 Deployment

### Frontend (Cloudflare Pages)

```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=dashboard-spx-soko
```

### Backend (Cloudflare Workers)

```bash
cd cloudflare-backend
npm install

# Set secret untuk Service Account
wrangler secret put GOOGLE_SERVICE_ACCOUNT
# Paste base64 encoded service account JSON

wrangler deploy
```

### Environment Variables

**Frontend (.env)**
```env
VITE_API_BASE_URL=https://your-worker.workers.dev/api
VITE_SPREADSHEET_ID=your-spreadsheet-id
VITE_API_REFRESH_INTERVAL=30000
```

**Cloudflare Worker (wrangler.toml)**
```toml
[vars]
SPREADSHEET_ID = "your-spreadsheet-id"
```

**Cloudflare Worker (Secret)**
```bash
GOOGLE_SERVICE_ACCOUNT = "base64-encoded-service-account-json"
```

## 📊 Google Sheets Setup

1. Buat Google Cloud Project
2. Enable Google Sheets API
3. Buat Service Account
4. Download JSON credentials
5. Share spreadsheet dengan service account email
6. Format sheet dengan columns:
   - District, ID, Name, Date, Driver Name, Contract Type, Vehicle Type, Zone ID, Assigned, Assigned Target, Delivery Progress, Delivered, dll.

Lihat [BACKEND_SETUP.md](./BACKEND_SETUP.md) untuk detail lengkap.

## 🔐 Security Notes

- ⚠️ **JANGAN** commit file `service-account-key.json` ke Git
- ⚠️ **JANGAN** commit file `.env` dengan credentials
- ✅ Gunakan Cloudflare Workers secrets untuk production
- ✅ Service Account hanya memiliki read-only access
- ✅ CORS sudah di-configure untuk frontend domain

## 📖 Documentation

- [Product Requirements Document](./PRD.md)
- [Backend Setup Guide](./BACKEND_SETUP.md)
- [Cloudflare Deployment Guide](./CLOUDFLARE_DEPLOYMENT_COMPLETE.md)
- [Quick Start Guide](./QUICK_START.md)

## 🔄 Auto-refresh

Dashboard secara otomatis refresh data setiap 30 detik. Anda bisa:
- Pause/Play auto-refresh dengan toggle button
- Manual refresh dengan klik refresh icon
- Adjust interval di environment variable `VITE_API_REFRESH_INTERVAL`

## 📱 Features Detail

### KPI Cards
- Total Couriers
- Total Deliveries
- Average Success Rate
- Fleet Utilization

### Metrics Cards
- Today's Deliveries
- Active Routes
- On-Time Delivery Rate

### Charts
1. **Performance by Contract Type** - Perbandingan Dedicated vs Mitra
2. **Top 10 Performing Zones** - Zone dengan delivery terbanyak
3. **Fleet Composition** - Distribusi 2WH vs 4WH

### Schedule Table
- Real-time courier schedules
- Filter by contract type (All/Dedicated/Mitra)
- Sort by any column
- Pagination (10 items per page)
- Search functionality (coming soon)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is private and proprietary to SPX SOKO.

## 👥 Team

Developed with ❤️ by SPX SOKO Team

## 🐛 Issues & Support

If you encounter any issues or have questions:
1. Check existing documentation
2. Open an issue on GitHub
3. Contact the development team

---

**Live Demo:** https://dashboard-spx-soko.pages.dev

**API Status:** https://dashboard-spx-soko-backend.spxsoko.workers.dev/health
