# Testing Target Appeal Feature dengan Supabase

## ✅ Backend Tests - ALL PASSED

### 1. Health Check
```bash
GET https://dashboard-spx-soko-backend.spxsoko.workers.dev/api/target-appeals/health
```
**Response:**
```json
{
  "status": "ok",
  "message": "Supabase connected successfully",
  "supabaseConfigured": true,
  "tableExists": true
}
```

### 2. Get All Appeals (Empty)
```bash
GET https://dashboard-spx-soko-backend.spxsoko.workers.dev/api/target-appeals
```
**Response:**
```json
{
  "success": true,
  "data": []
}
```

### 3. Submit Target Appeal
```bash
POST https://dashboard-spx-soko-backend.spxsoko.workers.dev/api/target-appeals
Content-Type: application/json

{
  "weekStart": "2024-01-08",
  "contract": "DPK",
  "vehicleType": "2WH",
  "appealTarget": 95,
  "updatedBy": "Admin Test"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Target appeal saved successfully"
}
```

### 4. Get All Appeals (With Data)
```bash
GET https://dashboard-spx-soko-backend.spxsoko.workers.dev/api/target-appeals
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "weekStart": "2024-01-08",
      "contract": "DPK",
      "vehicleType": "2WH",
      "appealTarget": 95,
      "lastUpdated": "2026-10-11T19:08:13.251178+00:00",
      "updatedBy": "Admin Test"
    }
  ]
}
```

### 5. Delete Target Appeal
```bash
POST https://dashboard-spx-soko-backend.spxsoko.workers.dev/api/target-appeals/delete
Content-Type: application/json

{
  "weekStart": "2024-01-08",
  "contract": "DPK",
  "vehicleType": "2WH"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Target appeal deleted successfully"
}
```

---

## 🧪 Frontend Testing Steps

### Prerequisites
- Dev server running: `npm run dev` (Port 5173)
- Backend deployed with Supabase secrets configured

### Test Flow

1. **Navigate to Adjust Target Page**
   - Open http://localhost:5173
   - Click sidebar: **Productivity** → **Adjust Target**

2. **Submit New Target Appeal**
   - Select Week: `Week 2 (Jan 8 - 14)`
   - Select Contract: `DPK`
   - Select Vehicle: `2WH`
   - Input Target: `95`
   - Click **Submit Appeal**
   - ✅ Should show success message
   - ✅ Should clear form
   - ✅ Should appear in History table below

3. **Verify in History Table**
   - Check data appears with:
     - Week Start: `2024-01-08`
     - Contract: `DPK`
     - Vehicle: `2WH`
     - Appeal Target: `95`
     - Last Updated: (current timestamp)
     - Updated By: `Unknown` (default)

4. **Test Update (Upsert)**
   - Select same Week/Contract/Vehicle
   - Input different Target: `100`
   - Click **Submit Appeal**
   - ✅ Should update existing record (not create duplicate)
   - ✅ History table shows updated target

5. **Test Multiple Appeals**
   - Submit appeal for different combinations:
     - Week 2, DPK, 4WH → 88
     - Week 2, SPX, 2WH → 92
     - Week 3, DPK, 2WH → 97
   - ✅ All should appear in History table
   - ✅ Sorted by week_start DESC (newest first)

6. **Test Delete**
   - Click **Delete** button on any row
   - ✅ Confirm dialog appears
   - ✅ After confirm, row disappears
   - ✅ Data removed from database

7. **Test Integration with Achievement KPI**
   - Go to **Productivity** → **Dashboard**
   - Check Achievement KPI cards (2WH & 4WH)
   - ✅ Should use appeal target for calculations (if submitted for current week)
   - ✅ Original target still shown when toggle is ON

---

## 🔍 Verification in Supabase Dashboard

### Check Data in Database
1. Open https://supabase.com/dashboard
2. Select project: `tnzwrnvggqrkstokcrrr`
3. Click **Table Editor** → `target_appeals`
4. ✅ Should see all submitted appeals
5. ✅ Unique constraint enforced (no duplicates for week_start + contract + vehicle_type)

### Check SQL Queries
```sql
-- Get all appeals
SELECT * FROM target_appeals ORDER BY week_start DESC;

-- Get appeals for specific week
SELECT * FROM target_appeals WHERE week_start = '2024-01-08';

-- Get appeals for specific contract
SELECT * FROM target_appeals WHERE contract = 'DPK';

-- Count total appeals
SELECT COUNT(*) FROM target_appeals;
```

---

## 🚀 Architecture Changes

### Before (GAS-based)
```
Frontend → Cloudflare Worker → Google Apps Script → Google Sheets
```
❌ Blocked by Google Workspace org restrictions
❌ Slow (multiple HTTP hops)
❌ Complex deployment

### After (Supabase)
```
Frontend → Cloudflare Worker → Supabase PostgreSQL
```
✅ No Google Workspace restrictions
✅ Fast (direct database access)
✅ Simple deployment
✅ SQL database with proper indexing
✅ Real-time subscriptions ready (if needed later)

---

## 📊 Database Schema

### Table: `target_appeals`

| Column        | Type        | Constraints                    |
|---------------|-------------|--------------------------------|
| id            | BIGSERIAL   | PRIMARY KEY                    |
| week_start    | DATE        | NOT NULL                       |
| contract      | TEXT        | NOT NULL                       |
| vehicle_type  | TEXT        | NOT NULL, CHECK (IN '2WH','4WH') |
| appeal_target | INTEGER     | NOT NULL, CHECK (> 0)          |
| created_at    | TIMESTAMPTZ | DEFAULT NOW()                  |
| updated_at    | TIMESTAMPTZ | DEFAULT NOW()                  |
| updated_by    | TEXT        |                                |

**Unique Constraint:** (week_start, contract, vehicle_type)

**Indexes:**
- `idx_target_appeals_lookup` ON (week_start, contract, vehicle_type)
- `idx_target_appeals_date` ON (week_start DESC)

---

## 🔐 Security

- **Row Level Security (RLS)**: Enabled
- **Policy**: Allow all operations for anon key (public access)
- **API Key**: Stored as Cloudflare Worker secret
- **CORS**: Enabled with wildcard (*)

### Future Improvements
- Add user authentication
- Restrict RLS policies to authenticated users
- Add audit log for changes
- Add approval workflow

---

## 📝 Next Steps

1. ✅ Test all CRUD operations in frontend
2. ✅ Verify Achievement KPI integration
3. ✅ Test with real weekly data
4. 📋 Add user authentication (optional)
5. 📋 Add export to Excel feature (optional)
6. 📋 Add email notifications on appeal submission (optional)

---

## 🐛 Troubleshooting

### Issue: "SUPABASE_ANON_KEY not configured"
**Solution:**
```bash
cd cloudflare-backend
echo 'eyJhbGc...' | wrangler secret put SUPABASE_ANON_KEY
```

### Issue: "Table does not exist"
**Solution:** Run `supabase/schema.sql` in Supabase SQL Editor

### Issue: "Duplicate key violation"
**Solution:** This is expected - upsert will update existing record

### Issue: Data not appearing in frontend
**Solution:**
1. Check browser console for errors
2. Verify Worker deployed: `wrangler deploy`
3. Test API directly with curl/Postman
4. Check Supabase dashboard for data

---

## ✅ Status Summary

| Component           | Status | Notes                          |
|---------------------|--------|--------------------------------|
| Supabase Database   | ✅     | Table created, indexed         |
| Worker Backend      | ✅     | Deployed with secrets          |
| API Endpoints       | ✅     | All tested and working         |
| Frontend UI         | ⏳     | Ready, needs testing           |
| Achievement KPI     | ✅     | Integration ready              |
| Documentation       | ✅     | Complete                       |

**Ready for frontend testing!** 🚀
