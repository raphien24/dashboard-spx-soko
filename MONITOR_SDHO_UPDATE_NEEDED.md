# 📋 Monitor SDHO - Update Required

## 🎯 **Requirement:**

Halaman Monitor SDHO perlu disesuaikan dengan data di spreadsheet:

1. **2 Tabel Terpisah:**
   - Tabel 1: Status "Created" (Kolom A:G)
   - Tabel 2: Status "Assigned" (Kolom N:T)

2. **Header harus sesuai dengan spreadsheet**

---

## 📊 **Current Implementation:**

Saat ini component menampilkan:
- ✅ 1 tabel untuk semua data (kolom A:G)
- ✅ Summary cards
- ✅ Filters dan search

**Issue**: Tidak menampilkan data "Assigned" dari kolom N:T

---

## 🔧 **Changes Needed:**

### **1. Backend API Response**

File: `cloudflare-backend/worker.js`

API endpoint `/api/monitor-sdho` perlu mengembalikan 2 dataset:

```javascript
{
  success: true,
  dataCreated: [...], // Data dari kolom A:G (status Created)
  dataAssigned: [...], // Data dari kolom N:T (status Assigned)
  summary: [...]
}
```

**Current**: Hanya return `detail` (single dataset)  
**Needed**: Return `dataCreated` dan `dataAssigned` terpisah

### **2. Frontend Component**

File: `frontend/src/components/monitorsdho/MonitorSDHOPage.jsx`

**Changes:**

#### A. Update State:
```javascript
const [dataCreated, setDataCreated] = useState([]);
const [dataAssigned, setDataAssigned] = useState([]);
```

#### B. Update fetch function:
```javascript
const { dataCreated, dataAssigned, summary } = await getMonitorSDHOData();
setDataCreated(dataCreated);
setDataAssigned(dataAssigned);
```

#### C. Render 2 Tables:
```jsx
{/* Table 1: Status Created */}
<DataTable 
  title="Status: Created (A:G)"
  data={dataCreated}
  columns={CREATED_COLS}
/>

{/* Table 2: Status Assigned */}
<DataTable 
  title="Status: Assigned (N:T)"
  data={dataAssigned}
  columns={ASSIGNED_COLS}
/>
```

---

## 📝 **Column Mapping:**

### **Tabel 1: Created (A:G)**
```
A: SPX Tracking Number
B: Pickup Point Name
C: Pickup Attempts
D: ETA
E: Status
F: Created Time
G: Last Update
```

### **Tabel 2: Assigned (N:T)**
```
N: SPX Tracking Number
O: Pickup Point Name
P: Pickup Attempts
Q: ETA
R: Status
S: Created Time
T: Last Update
```

**Note**: Kolom names mungkin berbeda, perlu disesuaikan dengan actual spreadsheet headers.

---

## ⚠️ **Backend Changes Required:**

### **Google Sheets Service:**

Perlu update function yang fetch data dari sheets untuk:

1. **Read kolom A:G** → filter by status "Created"
2. **Read kolom N:T** → filter by status "Assigned"  
3. Return both datasets separately

**Current code location:**  
- `cloudflare-backend/worker.js` → handler untuk `/api/monitor-sdho`
- Atau Google Apps Script jika data processing di GAS

---

## 🚀 **Implementation Steps:**

### **Step 1: Update Backend API**

1. Modify endpoint `/api/monitor-sdho`
2. Read both ranges: `A:G` and `N:T`
3. Return separate arrays

### **Step 2: Update Frontend Service**

File: `frontend/src/services/googleSheetsService.js`

```javascript
export async function getMonitorSDHOData() {
  const response = await fetch(`${backendUrl}/api/monitor-sdho`);
  const json = await response.json();
  return {
    dataCreated: json.dataCreated || [],
    dataAssigned: json.dataAssigned || [],
    summary: json.summary || []
  };
}
```

### **Step 3: Update Frontend Component**

1. Update state variables
2. Update fetchData function
3. Duplicate table rendering code for 2 tables
4. Update filters to work with both tables

### **Step 4: Test**

1. Verify data Created displays correctly
2. Verify data Assigned displays correctly  
3. Check filters work on both tables
4. Test export (CSV/PNG) for both tables

---

## 💡 **Quick Fix Option:**

Jika backend belum ready, bisa temporary filter frontend:

```javascript
const dataCreated = allData.filter(row => 
  String(row.Status).toLowerCase().includes('created')
);

const dataAssigned = allData.filter(row => 
  String(row.Status).toLowerCase().includes('assigned')
);
```

**Tapi** ini hanya works jika backend sudah send all data (A:T).

---

## 📋 **Checklist:**

- [ ] Check spreadsheet actual column headers
- [ ] Update backend to read A:G and N:T
- [ ] Update API response structure
- [ ] Update frontend service
- [ ] Update component state
- [ ] Duplicate table rendering
- [ ] Update filters for both tables
- [ ] Test with real data
- [ ] Update export functions

---

## 🔍 **Need to Check:**

1. **Spreadsheet URL/Sheet name** - mana sheet yang digunakan?
2. **Actual column headers** - apa nama exact di row 1?
3. **Backend implementation** - GAS atau Cloudflare Worker?
4. **Current API response** - apa format sekarang?

---

**Status**: 📝 Documentation created  
**Next**: Check spreadsheet headers & update backend API  
**File backed up**: `MonitorSDHOPage.jsx.backup`  
**Estimated time**: ~30-45 minutes untuk full implementation
