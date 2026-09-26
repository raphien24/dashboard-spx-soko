# Product Requirements Document (PRD)
## Dashboard Productivity SPX SOKO - Web Application

### 1. Overview
Migrasi dashboard productivity SPX SOKO dari Google Sheets Canvas ke aplikasi web modern dengan real-time data synchronization dari Google Sheets sebagai data source.

### 2. Objectives
- Menyediakan dashboard interaktif yang dapat diakses via web browser
- Real-time data sync dari Google Sheets (auto-refresh)
- User interface yang modern dan responsive
- Performa cepat untuk visualisasi data 3 bulan terakhir
- Kemudahan deployment dan maintenance

### 3. Data Source
- **Primary Source**: Google Sheets API v4
- **Spreadsheet ID**: `1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA`
- **Data Range**: 3 bulan terakhir
- **Update Frequency**: Real-time (auto-refresh setiap 30 detik)

### 4. Features & Components

#### 4.1 Dashboard Overview Page

##### Top Section - Key Performance Indicators (KPI Cards)
1. **Weekly Avg Productivity**
   - Metric: Delivered / Courier / Shift
   - Current Value dengan trend indicator
   - Progress bar dengan target
   - Sub-metrics: WEEKLY, D1W vs D1W-d7day

2. **Unloaded vs Plan**
   - Metric: % Avg Unloaded Output
   - Current percentage
   - Progress bar
   - Sub-metrics: JKN-A packages

3. **Daily Active**
   - Metric: Weekly Attendance Rate
   - Current percentage
   - Progress bar
   - Sub-metrics: Avg D1-2 / # couriers / day

##### Middle Section - Summary Metrics (Mini Cards)
- **Unique Warehouses**: Count dengan badge
- **Total Employees**: Count dengan badge
- **B&D Logistic**: Count
- **Total Accounts**: Count
- **Relationships**: Count dengan badge

##### Bottom Section - Visualizations

1. **Performance by Contract Type** (Horizontal Bar Chart)
   - Contract types: Dedicated, Kiloan, Group-based, Kora Plus
   - Shows: Total couriers, Accounts count, Performance percentage
   - Color-coded bars

2. **Top Zones by Parcel Volume** (Horizontal Bar Chart)
   - Top 5 zones by delivery volume
   - Format: Zone code (Date range)
   - Shows: Parcel count and percentage
   - Sorted descending

3. **Quote & Fleet Composition** (Donut Chart)
   - Shows distribution percentages
   - Center shows: Main quota target (28%)
   - Bottom shows: Fleet counts (Motorcycles, Fleet Motors, Fleet Pickups)
   - Additional info: Avg target per courier, Total packages

#### 4.2 Schedule Filter & Data Table Page

##### Filters
- **View Mode**: Weekly / Monthly toggle
- **Date Range**: Start date - End date selector
- **Status**: Unique Status dropdown
- **Warehouse**: All Warehouses dropdown
- **Contract**: All Contracts dropdown
- **Vehicle**: All Vehicles dropdown
- **Target Status**: All Target Statuses dropdown

##### Data Table Columns
1. **Unique Courier** - Name with employee ID
2. **Disable** - Zone assignment
3. **Zone** - Zone code
4. **Contract** - Contract type (badge)
5. **Vehicle** - Vehicle type
6. **Weekly Productivity vs Target** - Progress bar with actual/target values
7. **Avg Delivery / Target** - Numbers with target comparison
8. **Total Week Delivery** - Total deliveries
9. **Success %** - Success rate percentage
10. **Active Days** - Days worked breakdown (Mon-Sun)
11. **Actions** - Edit/Delete icons

##### Table Features
- Sortable columns
- Pagination
- Row highlighting
- Inline progress bars
- Status badges with colors
- Responsive design

### 5. Technical Stack

#### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **State Management**: React Context API / Zustand
- **HTTP Client**: Axios for API calls

#### Backend/API
- **Google Sheets API v4** integration
- **Authentication**: Service Account (OAuth 2.0)
- Optional: Node.js Express proxy untuk security

#### Deployment
- **Frontend**: Vercel / Netlify
- **Environment**: Node.js 18+

### 6. UI/UX Requirements

#### Design System
- **Color Palette**:
  - Primary: Purple (#7C3AED)
  - Success: Green (#10B981)
  - Warning: Orange (#F59E0B)
  - Danger: Red (#EF4444)
  - Info: Blue (#3B82F6)

- **Typography**:
  - Font: Inter / System fonts
  - Sizes: Responsive scale

- **Layout**:
  - Responsive grid system
  - Mobile-first approach
  - Breakpoints: sm(640), md(768), lg(1024), xl(1280), 2xl(1536)

#### Interactions
- Smooth transitions and animations
- Loading states for data fetching
- Error handling with user-friendly messages
- Hover effects on interactive elements
- Real-time data update indicators

### 7. Data Flow

```
Google Sheets (Source)
    ↓
Google Sheets API v4
    ↓
Frontend Service Layer
    ↓
React Components (State)
    ↓
UI Rendering
    ↓
Auto-refresh (30s interval)
```

### 8. API Structure

#### Endpoints Needed
1. `GET /api/kpi` - Fetch KPI metrics
2. `GET /api/metrics` - Fetch summary metrics
3. `GET /api/performance` - Fetch performance by contract type
4. `GET /api/zones` - Fetch top zones data
5. `GET /api/fleet` - Fetch fleet composition
6. `GET /api/couriers` - Fetch courier list with filters
7. `GET /api/refresh` - Manual refresh trigger

### 9. Google Sheets Structure Expected

#### Sheet 1: Dashboard Data
- KPI metrics rows
- Summary metrics
- Performance data by contract
- Zone statistics
- Fleet composition

#### Sheet 2: Courier Schedule
- Courier details
- Daily performance data
- Target vs achievement
- Attendance records

### 10. Security Requirements
- API key/credentials stored in environment variables
- CORS configuration for production domain
- Rate limiting for API calls
- Input validation for filters
- Read-only access to Google Sheets

### 11. Performance Requirements
- Initial load time: < 3 seconds
- Chart rendering: < 1 second
- Auto-refresh: Non-blocking, background process
- Smooth scrolling and interactions
- Efficient data caching

### 12. Browser Support
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### 13. Future Enhancements (Out of Scope for MVP)
- User authentication and authorization
- Export to PDF/Excel functionality
- Custom date range selection
- Email notifications for alerts
- Mobile app version
- Dark mode support
- Advanced filtering and search
- Data comparison between periods

### 14. Success Metrics
- Dashboard loads within 3 seconds
- Real-time data updates working correctly
- All charts and visualizations render properly
- Mobile responsive design functional
- Zero critical bugs in production

### 15. Timeline Estimate
- **Phase 1**: Setup & Infrastructure (Day 1)
- **Phase 2**: Core Components Development (Day 2-3)
- **Phase 3**: Data Integration & API (Day 4-5)
- **Phase 4**: Testing & Refinement (Day 6)
- **Phase 5**: Deployment & Documentation (Day 7)

### 16. Dependencies
- Google Cloud Project with Sheets API enabled
- Service Account credentials JSON
- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

### 17. Risks & Mitigations
- **Risk**: Google Sheets API quota limits
  - **Mitigation**: Implement caching, optimize API calls
  
- **Risk**: Slow data loading for 3 months data
  - **Mitigation**: Pagination, lazy loading, data aggregation

- **Risk**: API authentication issues
  - **Mitigation**: Proper credential management, error handling

### 18. Documentation Required
- Setup and installation guide
- Google Sheets API configuration guide
- Environment variables documentation
- Component usage documentation
- Deployment guide
- Troubleshooting guide
