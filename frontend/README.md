# Soko Hub Productivity Dashboard

Web dashboard interaktif untuk monitoring productivity SPX SOKO dengan real-time data sync dari Google Sheets.

## 🚀 Features

- **Real-time Data Sync**: Automatic data refresh dari Google Sheets
- **Interactive Dashboard**: KPI cards, charts, dan visualisasi data
- **Schedule Management**: Filter dan table view untuk courier schedules
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Built with React, TailwindCSS, dan Recharts

## 📋 Prerequisites

- Node.js 18+ dan npm
- Google Cloud Project dengan Sheets API enabled
- API Key atau Service Account credentials

## 🛠️ Installation

1. **Clone atau gunakan project ini**

2. **Install dependencies**
```bash
npm install
```

3. **Setup Environment Variables**
```bash
cp .env.example .env
```

Edit `.env` dan isi dengan credentials Anda:
```env
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
VITE_SPREADSHEET_ID=1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA
```

4. **Run Development Server**
```bash
npm run dev
```

Dashboard akan tersedia di `http://localhost:5173`

## 🔑 Google Sheets API Setup

### Opsi 1: API Key (Recommended untuk Read-only)

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih existing project
3. Enable **Google Sheets API**:
   - Navigasi ke "APIs & Services" > "Library"
   - Search "Google Sheets API"
   - Click "Enable"
4. Create API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy API key ke `.env` file
5. **PENTING**: Set Google Sheets permission ke "Anyone with the link can view"

### Opsi 2: Service Account (Untuk Private Sheets)

1. Create Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Download JSON key file
2. Share Google Sheets dengan service account email
3. Update kode untuk menggunakan service account authentication

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/       # Dashboard overview components
│   │   │   └── Dashboard.jsx
│   │   ├── charts/          # Chart components (Recharts)
│   │   ├── schedule/        # Schedule & filter components
│   │   │   └── ScheduleTable.jsx
│   │   └── common/          # Reusable components
│   ├── services/            # API services (Google Sheets)
│   ├── store/               # State management (Zustand)
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Helper functions
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── .env                     # Environment variables
└── package.json
```

## 🎨 Tech Stack

- **Frontend Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Date Utilities**: date-fns

## 📊 Dashboard Components

### Overview Page
1. **KPI Cards** (3 main metrics)
   - Weekly Avg Productivity
   - Unloaded vs Plan
   - Daily Active Attendance

2. **Summary Metrics** (5 cards)
   - Unique Warehouses
   - Total Employees
   - B&D Logistic
   - Total Accounts
   - Relationships

3. **Charts**
   - Performance by Contract Type (Horizontal Bar)
   - Top Zones by Parcel Volume (Horizontal Bar)
   - Quote & Fleet Composition (Donut Chart)

### Schedule Filter Page
- Multiple filter dropdowns
- Interactive data table
- Sortable columns
- Progress bars
- Status badges

## 🔄 Data Sync

Dashboard secara otomatis refresh data dari Google Sheets setiap 30 detik. Interval bisa diubah di `.env`:

```env
VITE_API_REFRESH_INTERVAL=30000  # in milliseconds
```

## 🚀 Build & Deploy

### Build untuk Production

```bash
npm run build
```

Output akan tersedia di folder `dist/`

### Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy ke Netlify

```bash
# Build
npm run build

# Deploy dist/ folder via Netlify UI atau CLI
```

**Jangan lupa set environment variables di platform deployment!**

## 🔧 Configuration

### Tailwind Config
Edit `tailwind.config.js` untuk customize theme, colors, dll.

### Vite Config
Edit `vite.config.js` untuk build settings, plugins, dll.

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GOOGLE_SHEETS_API_KEY` | Google Sheets API key | Yes |
| `VITE_SPREADSHEET_ID` | Spreadsheet ID dari URL | Yes |
| `VITE_API_REFRESH_INTERVAL` | Auto-refresh interval (ms) | No (default: 30000) |

## 🐛 Troubleshooting

### API Key Error
- Pastikan Google Sheets API sudah enabled
- Cek API key valid dan tidak ada typo
- Pastikan spreadsheet permission sudah "Anyone with link can view"

### Data Tidak Muncul
- Cek browser console untuk errors
- Verify spreadsheet ID benar
- Pastikan sheet names sesuai dengan kode

### Build Error
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

## 📖 Documentation

Untuk dokumentasi lengkap, lihat:
- [PRD.md](../PRD.md) - Product Requirements Document
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [React Docs](https://react.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [Recharts Docs](https://recharts.org/)

## 🤝 Contributing

1. Fork the project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 📞 Support

Untuk pertanyaan atau issues, silakan buka issue di repository atau hubungi tim development.

---

**Built with ❤️ for SPX SOKO Team**
