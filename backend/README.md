# Backend Proxy Server

Backend proxy untuk handle Google Sheets API requests menggunakan Service Account.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Letakkan Service Account JSON file:**
   - Download dari Google Cloud Console
   - Rename menjadi `service-account-key.json`
   - Letakkan di folder ini (`backend/`)

3. **Setup environment:**
```bash
cp .env.example .env
# Edit .env jika perlu
```

4. **Run server:**
```bash
# Development
npm run dev

# Production
npm start
```

Server akan running di `http://localhost:3001`

## Endpoints

- `GET /health` - Health check
- `GET /api/sheets/range/:range` - Get single range
- `POST /api/sheets/batch` - Get multiple ranges

## Frontend Integration

Update frontend `.env`:
```env
VITE_API_BASE_URL=http://localhost:3001/api
```
