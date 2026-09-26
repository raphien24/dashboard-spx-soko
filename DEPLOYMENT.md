# Deployment Guide - Dashboard SPX SOKO

Panduan deployment aplikasi dashboard ke production environment.

## 📋 Pre-Deployment Checklist

- [ ] Google Sheets API sudah dikonfigurasi dengan benar
- [ ] API Key atau Service Account credentials valid
- [ ] Spreadsheet sudah public atau dishare dengan service account
- [ ] Environment variables sudah disiapkan
- [ ] Build production berhasil locally
- [ ] Testing semua fitur sudah dilakukan

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel adalah platform deployment yang paling mudah dan terintegrasi langsung dengan Git.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login ke Vercel

```bash
vercel login
```

#### Step 3: Deploy dari Project Folder

```bash
cd "d:\SPX\DASHBOARD SPX SOKO\frontend"
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Pilih personal atau team account
- **Link to existing project?** → No (first time) atau Yes (re-deploy)
- **Project name?** → spx-soko-dashboard (atau nama lain)
- **Directory?** → `./` (current directory)

#### Step 4: Configure Environment Variables

Di Vercel Dashboard:
1. Go to **Project Settings** → **Environment Variables**
2. Add variables:
   ```
   VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
   VITE_SPREADSHEET_ID=1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA
   VITE_API_REFRESH_INTERVAL=30000
   ```
3. Click **Save**

#### Step 5: Redeploy dengan Environment Variables

```bash
vercel --prod
```

✅ **Done!** Dashboard akan tersedia di URL seperti: `https://spx-soko-dashboard.vercel.app`

#### Auto-Deploy dari Git (Optional)

1. Push project ke GitHub/GitLab/Bitbucket
2. Import project di Vercel Dashboard
3. Connect repository
4. Set environment variables
5. Deploy automatically on every push to main branch

---

### Option 2: Netlify

Netlify adalah alternatif yang bagus dengan fitur serupa Vercel.

#### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 2: Login ke Netlify

```bash
netlify login
```

#### Step 3: Build Project

```bash
cd "d:\SPX\DASHBOARD SPX SOKO\frontend"
npm run build
```

#### Step 4: Deploy

```bash
netlify deploy
```

Follow prompts:
- **Create & configure a new site?** → Yes
- **Team?** → Select your team
- **Site name?** → spx-soko-dashboard
- **Publish directory?** → `dist`

#### Step 5: Deploy to Production

```bash
netlify deploy --prod
```

#### Step 6: Set Environment Variables

Via Netlify Dashboard:
1. Go to **Site Settings** → **Environment Variables**
2. Add all VITE_* variables
3. Trigger redeploy

✅ **Done!** Dashboard akan tersedia di: `https://spx-soko-dashboard.netlify.app`

---

### Option 3: Manual Deployment (Any Static Host)

Deploy ke any static hosting (GitHub Pages, Firebase Hosting, AWS S3, dll.)

#### Step 1: Create .env.production

```bash
cd "d:\SPX\DASHBOARD SPX SOKO\frontend"
```

Create `.env.production`:
```env
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
VITE_SPREADSHEET_ID=1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA
VITE_API_REFRESH_INTERVAL=30000
```

#### Step 2: Build for Production

```bash
npm run build
```

Output akan tersedia di folder `dist/`

#### Step 3: Upload dist/ ke Hosting

**GitHub Pages:**
```bash
npm install -g gh-pages
npm run build
gh-pages -d dist
```

**Firebase Hosting:**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select dist as public directory
firebase deploy
```

**AWS S3:**
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

---

## 🔐 Security Best Practices

### 1. API Key Protection

**❌ JANGAN:**
- Commit API key ke Git
- Share API key publicly
- Hardcode API key di source code

**✅ LAKUKAN:**
- Gunakan environment variables
- Store di platform deployment (Vercel/Netlify)
- Rotate API key secara berkala
- Set API key restrictions di Google Cloud Console

### 2. Spreadsheet Permissions

**Untuk API Key:**
- Set spreadsheet ke "Anyone with link can VIEW"
- JANGAN set ke "can EDIT"

**Untuk Service Account:**
- Share spreadsheet dengan service account email dengan permission "Viewer"
- Simpan JSON credentials dengan aman (jangan commit ke Git!)

### 3. Domain & CORS

Jika menggunakan API Key, restrict by domain:
1. Go to Google Cloud Console → Credentials
2. Edit API Key
3. Application restrictions → HTTP referrers
4. Add: `https://your-domain.com/*`

---

## 🧪 Testing Production Build Locally

Sebelum deploy, test production build locally:

```bash
# Build
npm run build

# Preview (using Vite preview)
npm run preview
```

Atau menggunakan serve:
```bash
npm install -g serve
serve -s dist
```

Buka `http://localhost:4173` (vite preview) atau `http://localhost:3000` (serve)

---

## 📊 Monitoring & Analytics

### Add Google Analytics (Optional)

1. **Install package:**
```bash
npm install react-ga4
```

2. **Initialize in App.jsx:**
```javascript
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');
```

3. **Track page views:**
```javascript
useEffect(() => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
}, [currentView]);
```

### Monitor API Usage

Check Google Sheets API quota:
- Go to Google Cloud Console → APIs & Services → Dashboard
- Click "Google Sheets API"
- View usage metrics

**Free tier limits:**
- 500 requests per 100 seconds per project
- 100 requests per 100 seconds per user

---

## 🐛 Troubleshooting Deployment

### Build Fails

**Error: Environment variables not found**
- Solution: Set all `VITE_*` variables in deployment platform

**Error: Out of memory**
- Solution: Increase Node memory:
  ```bash
  NODE_OPTIONS=--max_old_space_size=4096 npm run build
  ```

### API Errors in Production

**401 Unauthorized:**
- API key not set correctly
- Check environment variables in deployment platform
- Verify API key is valid

**403 Forbidden:**
- Spreadsheet not public/shared
- API key restrictions too strict
- Check domain restrictions in Google Cloud Console

**429 Too Many Requests:**
- API quota exceeded
- Reduce refresh interval
- Implement caching

### Blank Page After Deploy

**Check:**
1. Browser console for errors
2. Base URL configuration in `vite.config.js`
3. Asset paths (should be relative, not absolute)

**Fix for subdirectory deployment:**
```javascript
// vite.config.js
export default {
  base: '/subdirectory/', // if deployed in subdirectory
}
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          VITE_GOOGLE_SHEETS_API_KEY: ${{ secrets.VITE_GOOGLE_SHEETS_API_KEY }}
          VITE_SPREADSHEET_ID: ${{ secrets.VITE_SPREADSHEET_ID }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
```

---

## 📈 Performance Optimization

### 1. Code Splitting

Vite sudah melakukan code splitting automatically.

### 2. Lazy Loading Charts

```javascript
import { lazy, Suspense } from 'react';

const PerformanceChart = lazy(() => import('./PerformanceByContractChart'));

// Usage
<Suspense fallback={<LoadingSpinner />}>
  <PerformanceChart data={performanceData} />
</Suspense>
```

### 3. Image Optimization

- Use WebP format
- Compress images
- Use CDN for static assets

### 4. Caching Strategy

Add to `vite.config.js`:
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'recharts': ['recharts'],
        'lucide': ['lucide-react'],
      }
    }
  }
}
```

---

## ✅ Post-Deployment Checklist

- [ ] Dashboard accessible via URL
- [ ] All components loading correctly
- [ ] Data fetching from Google Sheets works
- [ ] Charts rendering properly
- [ ] Auto-refresh working (check every 30s)
- [ ] Filters functioning
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance acceptable (< 3s load time)
- [ ] SSL certificate active (HTTPS)

---

## 🆘 Support & Rollback

### Rollback di Vercel

```bash
vercel rollback
```

Or via Dashboard → Deployments → Click "..." → Promote to Production

### Rollback di Netlify

Via Dashboard → Deploys → Click old deploy → Publish deploy

---

## 📞 Contact

Jika ada masalah deployment:
1. Check logs di deployment platform
2. Review error messages
3. Consult SETUP_GUIDE.md
4. Contact development team

---

**Happy Deploying! 🚀**
