import { useState, useEffect, useMemo, useRef } from 'react';
import {
  RefreshCw, Search, X, Download, Image,
  ChevronUp, ChevronDown, Package, Clock, AlertTriangle,
  Play, RotateCcw, CheckCircle, XCircle, Loader2, Truck,
  ListChecks, ClipboardList
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { getBuyerRRData, runBuyerRRScraper, getBuyerRRScraperStatus } from '../../services/googleSheetsService';

// ── Columns ──────────────────────────────────────────────────
const CREATED_COLS = [
  { key: 'SPX Tracking Number', label: 'Tracking Number', width: 'min-w-[160px]' },
  { key: 'Pickup Point Name',   label: 'Pickup Point',    width: 'min-w-[150px]' },
  { key: 'Pickup Attempts',     label: 'Attempts',        width: 'min-w-[90px]'  },
  { key: 'ETA',                 label: 'ETA',             width: 'min-w-[140px]' },
  { key: 'Status',              label: 'Status',          width: 'min-w-[100px]' },
  { key: 'Created Time',        label: 'Created',         width: 'min-w-[140px]' },
  { key: 'Last Update',         label: 'Last Update',     width: 'min-w-[150px]' },
];

const ASSIGNED_COLS = [
  { key: 'Pickup Task ID',  label: 'Task ID',       width: 'min-w-[140px]' },
  { key: 'Pickup Point Name', label: 'Pickup Point', width: 'min-w-[150px]' },
  { key: 'Driver',          label: 'Driver',        width: 'min-w-[140px]' },
  { key: 'Accepted Time',   label: 'Accepted Time', width: 'min-w-[150px]' },
  { key: 'Status_Assigned', label: 'Status',        width: 'min-w-[110px]' },
];

// ── Helpers ───────────────────────────────────────────────────
const agingColor = (etaStr) => {
  if (!etaStr) return '';
  const eta  = new Date(etaStr);
  const now  = new Date();
  const diff = (now - eta) / (1000 * 60 * 60); // hours overdue
  if (diff > 48)  return 'bg-red-50/50';
  if (diff > 24)  return 'bg-orange-50/40';
  return '';
};

const attemptsColor = (n) => {
  if (n >= 5) return 'text-red-600 font-bold';
  if (n >= 3) return 'text-orange-500 font-semibold';
  if (n >= 2) return 'text-yellow-600 font-medium';
  return 'text-gray-700';
};

// ── Reusable sortable table ───────────────────────────────────
const SortableTable = ({ cols, rows, emptyText, rowClass }) => {
  const [sortKey, setSortKey] = useState(cols[0]?.key || '');
  const [sortDir, setSortDir] = useState('asc');

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      if (sortKey === 'Pickup Attempts') {
        return sortDir === 'asc' ? parseInt(av) - parseInt(bv) : parseInt(bv) - parseInt(av);
      }
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [rows, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
            {cols.map(col => (
              <th key={col.key} onClick={() => handleSort(col.key)}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-indigo-800 select-none ${col.width}`}>
                <div className="flex items-center gap-1.5">
                  {col.label}
                  {sortKey === col.key
                    ? sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-indigo-200" /> : <ChevronDown className="w-3.5 h-3.5 text-indigo-200" />
                    : <ChevronUp className="w-3.5 h-3.5 opacity-30" />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={cols.length} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Package className="w-10 h-10 text-gray-200" />
                  <p className="text-gray-400 text-sm">{emptyText || 'Tidak ada data'}</p>
                </div>
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <tr key={i} className={`hover:bg-indigo-50/40 transition-colors ${rowClass ? rowClass(row) : ''}`}>
                {cols.map(col => (
                  <td key={col.key} className="px-4 py-3 align-middle">
                    {col.key === 'SPX Tracking Number'
                      ? <span className="font-mono text-xs font-medium text-gray-800">{row[col.key] || '—'}</span>
                      : col.key === 'Pickup Attempts'
                      ? <span className={`text-sm ${attemptsColor(parseInt(row[col.key]))}`}>{row[col.key] || '—'}</span>
                      : <span className="text-sm text-gray-700 whitespace-nowrap">{row[col.key] || '—'}</span>
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const BuyerRRPage = () => {
  const [rawData,    setRawData]    = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Scraper
  const [scraperState,    setScraperState]    = useState('idle');
  const [scraperProgress, setScraperProgress] = useState(null);
  const pollRef = useState(null);

  // Filters Created
  const [searchCreated, setSearchCreated]       = useState('');
  const [filterPickup,  setFilterPickup]        = useState('all');
  const [filterAttempts,setFilterAttempts]      = useState('all');

  // Filters Assigned
  const [searchAssigned, setSearchAssigned]     = useState('');
  const [filterDriver,   setFilterDriver]       = useState('all');

  // ── Fetch ────────────────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, headers } = await getBuyerRRData();
      setRawData(data);
      // Last update dari header timestamp
      const tsKey = headers.find(h => /\d{4}-\d{2}-\d{2}/.test(h));
      if (tsKey) setLastUpdate(tsKey);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Split data ───────────────────────────────────────────────
  // Created: baris yang punya SPX Tracking Number (kolom A-G)
  const createdRows = useMemo(() =>
    rawData.filter(r => r['SPX Tracking Number'] && String(r['SPX Tracking Number']).trim() !== ''),
  [rawData]);

  // Assigned: baris yang punya Driver (kolom O) — Pickup Task ID bisa saja "-"
  // Rename kolom "Status" terakhir ke "Status_Assigned" agar tidak konflik dengan kolom E
  const assignedRows = useMemo(() =>
    rawData
      .filter(r => r['Driver'] && String(r['Driver']).trim() !== '' && String(r['Driver']).trim() !== '-')
      .map(r => ({ ...r, Status_Assigned: r['Status'] || '—' })),
  [rawData]);

  // ── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    // Pickup attempts breakdown (1x-6x)
    const attemptMap = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };
    createdRows.forEach(r => {
      const n = parseInt(r['Pickup Attempts']) || 0;
      if (n >= 1 && n <= 6) attemptMap[n]++;
      else if (n > 6) attemptMap[6]++;
    });

    // Overdue by ETA
    const now = new Date();
    const overdue48 = createdRows.filter(r => {
      if (!r['ETA']) return false;
      return (now - new Date(r['ETA'])) / (1000 * 60 * 60) > 48;
    }).length;
    const overdue24 = createdRows.filter(r => {
      if (!r['ETA']) return false;
      const h = (now - new Date(r['ETA'])) / (1000 * 60 * 60);
      return h > 24 && h <= 48;
    }).length;

    return {
      totalCreated:  createdRows.length,
      totalAssigned: assignedRows.length,
      overdue48,
      overdue24,
      attemptMap,
      pickupOptions: [...new Set(createdRows.map(r => r['Pickup Point Name']).filter(Boolean))].sort(),
      driverOptions: [...new Set(assignedRows.map(r => r['Driver']).filter(Boolean))].sort(),
    };
  }, [createdRows, assignedRows]);

  // ── Filtered created ─────────────────────────────────────────
  const filteredCreated = useMemo(() => {
    let data = [...createdRows];
    if (filterPickup !== 'all') data = data.filter(r => r['Pickup Point Name'] === filterPickup);
    if (filterAttempts !== 'all') data = data.filter(r => String(r['Pickup Attempts']) === filterAttempts);
    if (searchCreated.trim()) {
      const q = searchCreated.toLowerCase();
      data = data.filter(r => CREATED_COLS.some(c => String(r[c.key] ?? '').toLowerCase().includes(q)));
    }
    return data;
  }, [createdRows, filterPickup, filterAttempts, searchCreated]);

  // ── Filtered assigned ────────────────────────────────────────
  const filteredAssigned = useMemo(() => {
    let data = [...assignedRows];
    if (filterDriver !== 'all') data = data.filter(r => r['Driver'] === filterDriver);
    if (searchAssigned.trim()) {
      const q = searchAssigned.toLowerCase();
      data = data.filter(r => ASSIGNED_COLS.some(c => String(r[c.key] ?? '').toLowerCase().includes(q)));
    }
    return data;
  }, [assignedRows, filterDriver, searchAssigned]);

  // ── Scraper ──────────────────────────────────────────────────
  const startScraper = async (action = 'run') => {
    setScraperState('running');
    setScraperProgress({ percent: 0, message: 'Mengirim perintah ke GAS...', updatedAt: '' });
    if (pollRef[0]) { clearInterval(pollRef[0]); pollRef[0] = null; }
    try {
      await runBuyerRRScraper(action);
      await new Promise(r => setTimeout(r, 3000));
      const interval = setInterval(async () => {
        try {
          const result = await getBuyerRRScraperStatus();
          if (!result) return;
          setScraperProgress(result.status);
          if (result.isDone || (result.command === 'IDLE' && result.status?.percent === 100)) {
            clearInterval(interval); pollRef[0] = null;
            const isError = result.status?.message?.startsWith('❌');
            setScraperState(isError ? 'error' : 'done');
            if (!isError) setTimeout(() => fetchData(), 2000);
          } else if (result.isRunning) setScraperState('running');
        } catch (_) {}
      }, 4000);
      pollRef[0] = interval;
    } catch (err) {
      setScraperState('error');
      setScraperProgress({ percent: 0, message: '❌ ' + err.message, updatedAt: '' });
    }
  };

  useEffect(() => () => { if (pollRef[0]) clearInterval(pollRef[0]); }, []);

  // ── Refs untuk export PNG ────────────────────────────────────
  const createdTableRef  = useRef(null);
  const assignedTableRef = useRef(null);

  // ── Export PNG ───────────────────────────────────────────────
  const exportToPng = async (ref, filename) => {
    if (!ref.current) return;
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export PNG error:', err);
    }
  };

  // ── Export CSV ───────────────────────────────────────────────
  const exportCSV = (cols, rows, filename) => {
    const headers = cols.map(c => c.label);
    const data = rows.map(r => cols.map(c => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`));
    const csv = [headers.join(','), ...data.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = filename;
    a.click();
  };

  // ── Loading / Error ──────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading Buyer RR data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-900 mb-1">Gagal memuat data</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Coba Lagi
          </button>
        </div>
      </div>
    </div>
  );

  // ── Main render ──────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Scraper Panel ── */}
      <div className={`rounded-xl border p-4 shadow-sm ${
        scraperState === 'running' ? 'bg-blue-50 border-blue-200' :
        scraperState === 'done'    ? 'bg-green-50 border-green-200' :
        scraperState === 'error'   ? 'bg-red-50 border-red-200' :
        'bg-white border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {scraperState === 'running' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
            {scraperState === 'done'    && <CheckCircle className="w-5 h-5 text-green-600" />}
            {scraperState === 'error'   && <XCircle className="w-5 h-5 text-red-600" />}
            {scraperState === 'idle'    && <Truck className="w-5 h-5 text-gray-400" />}
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {scraperState === 'idle'    && 'Buyer RR Scraper'}
                {scraperState === 'running' && 'Scraper sedang berjalan...'}
                {scraperState === 'done'    && 'Scraper selesai!'}
                {scraperState === 'error'   && 'Scraper gagal'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {scraperState === 'idle' && 'Klik "Run Scraper" untuk update data dari SPX'}
                {scraperProgress?.message && scraperState !== 'idle' && scraperProgress.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => startScraper('run')} disabled={scraperState === 'running'}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium">
              {scraperState === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Scraper
            </button>
            <button onClick={() => startScraper('resume')} disabled={scraperState === 'running'}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-300">
              <RotateCcw className="w-4 h-4" /> Resume
            </button>
          </div>
        </div>
        {scraperProgress && scraperState !== 'idle' && (
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{scraperProgress.percent}%</span>
                {scraperProgress.updatedAt && <span className="text-gray-400">Updated: {scraperProgress.updatedAt}</span>}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all duration-500 ${
                  scraperProgress.message?.startsWith('❌') ? 'bg-red-500' :
                  scraperState === 'done' ? 'bg-green-500' :
                  scraperProgress.message?.startsWith('⚠️') ? 'bg-yellow-400' : 'bg-indigo-500'
                }`} style={{ width: `${scraperProgress.percent}%` }} />
              </div>
            </div>
            {scraperProgress.message?.startsWith('❌') && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-600">
                <p className="font-semibold mb-1">Detail Error:</p>
                <p className="font-mono break-all">{scraperProgress.message.replace('❌ ', '')}</p>
                <p className="mt-2 text-red-500">• Cookie expired → update via bookmarklet &nbsp;• API down → coba lagi &nbsp;• Timeout → klik Resume</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-700">{stats.totalCreated}</p>
              <p className="text-xs text-gray-500">Status Created</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.totalAssigned}</p>
              <p className="text-xs text-gray-500">Status Assigned</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.overdue48}</p>
              <p className="text-xs text-gray-500">ETA Overdue &gt;48 jam</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{stats.overdue24}</p>
              <p className="text-xs text-gray-500">ETA Overdue 24–48 jam</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pickup Attempts Recap ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          Recap Pickup Attempts (Status Created)
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[1,2,3,4,5,6].map(n => {
            const count = stats.attemptMap[n] || 0;
            const pct   = stats.totalCreated > 0 ? Math.round((count / stats.totalCreated) * 100) : 0;
            const color = n >= 5 ? 'border-red-200 bg-red-50' : n >= 3 ? 'border-orange-200 bg-orange-50' : n >= 2 ? 'border-yellow-200 bg-yellow-50' : 'border-indigo-100 bg-indigo-50';
            const textColor = n >= 5 ? 'text-red-700' : n >= 3 ? 'text-orange-600' : n >= 2 ? 'text-yellow-700' : 'text-indigo-700';
            return (
              <div key={n} className={`rounded-lg border p-3 ${color}`}>
                <p className={`text-2xl font-bold ${textColor}`}>{count}</p>
                <p className="text-xs font-medium text-gray-700 mt-0.5">{n === 6 ? '6x+' : n + 'x'} Attempts</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${n >= 5 ? 'bg-red-500' : n >= 3 ? 'bg-orange-400' : n >= 2 ? 'bg-yellow-400' : 'bg-indigo-500'}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tabel Created ── */}
      <div ref={createdTableRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-600" />
                Status Created
                <span className="ml-1 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full font-medium">
                  {filteredCreated.length}
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {lastUpdate && `Last update: ${lastUpdate}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type="text" value={searchCreated} onChange={e => setSearchCreated(e.target.value)}
                  placeholder="Cari TN, pickup point..."
                  className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm w-52 focus:ring-2 focus:ring-indigo-500" />
                {searchCreated && <button onClick={() => setSearchCreated('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
              </div>
              <select value={filterPickup} onChange={e => setFilterPickup(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                <option value="all">Semua Pickup Point</option>
                {stats.pickupOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={filterAttempts} onChange={e => setFilterAttempts(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                <option value="all">Semua Attempts</option>
                {[1,2,3,4,5,6].map(n => <option key={n} value={String(n)}>{n}x</option>)}
              </select>
              {(searchCreated || filterPickup !== 'all' || filterAttempts !== 'all') && (
                <button onClick={() => { setSearchCreated(''); setFilterPickup('all'); setFilterAttempts('all'); }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <X className="w-3.5 h-3.5" /> Reset
                </button>
              )}
              <button onClick={() => exportCSV(CREATED_COLS, filteredCreated, `BuyerRR-Created-${new Date().toISOString().split('T')[0]}.csv`)}
                disabled={!filteredCreated.length}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button onClick={() => exportToPng(createdTableRef, `BuyerRR-Created-${new Date().toISOString().split('T')[0]}.png`)}
                disabled={!filteredCreated.length}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
                <Image className="w-4 h-4" /> Export PNG
              </button>
              <button onClick={fetchData}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>
        </div>
        <SortableTable
          cols={CREATED_COLS}
          rows={filteredCreated}
          emptyText="Tidak ada data Created"
          rowClass={row => agingColor(row['ETA'])}
        />
        {filteredCreated.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <span><strong className="text-gray-700">{filteredCreated.length}</strong> order ditampilkan</span>
            {stats.overdue48 > 0 && <span className="text-red-600 font-medium">⚠ {stats.overdue48} order ETA overdue &gt;48 jam</span>}
          </div>
        )}
      </div>

      {/* ── Tabel Assigned ── */}
      <div ref={assignedTableRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-green-600" />
                Status Assigned
                <span className="ml-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                  {filteredAssigned.length}
                </span>
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type="text" value={searchAssigned} onChange={e => setSearchAssigned(e.target.value)}
                  placeholder="Cari task ID, driver..."
                  className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm w-52 focus:ring-2 focus:ring-indigo-500" />
                {searchAssigned && <button onClick={() => setSearchAssigned('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
              </div>
              <select value={filterDriver} onChange={e => setFilterDriver(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                <option value="all">Semua Driver</option>
                {stats.driverOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {(searchAssigned || filterDriver !== 'all') && (
                <button onClick={() => { setSearchAssigned(''); setFilterDriver('all'); }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <X className="w-3.5 h-3.5" /> Reset
                </button>
              )}
              <button onClick={() => exportCSV(ASSIGNED_COLS, filteredAssigned, `BuyerRR-Assigned-${new Date().toISOString().split('T')[0]}.csv`)}
                disabled={!filteredAssigned.length}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
                <Download className="w-4 h-4" /> Export CSV
              </button>
              <button onClick={() => exportToPng(assignedTableRef, `BuyerRR-Assigned-${new Date().toISOString().split('T')[0]}.png`)}
                disabled={!filteredAssigned.length}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
                <Image className="w-4 h-4" /> Export PNG
              </button>
            </div>
          </div>
        </div>
        <SortableTable
          cols={ASSIGNED_COLS}
          rows={filteredAssigned}
          emptyText="Tidak ada data Assigned"
        />
        {filteredAssigned.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            <strong className="text-gray-700">{filteredAssigned.length}</strong> task ditampilkan
          </div>
        )}
      </div>

    </div>
  );
};

export default BuyerRRPage;
