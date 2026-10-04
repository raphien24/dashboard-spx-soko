import { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw, Search, X, Download,
  ChevronUp, ChevronDown, Package, Clock, AlertTriangle,
  Play, RotateCcw, CheckCircle, XCircle, Loader2, Truck
} from 'lucide-react';
import { getBuyerRRData, runBuyerRRScraper, getBuyerRRScraperStatus } from '../../services/googleSheetsService';

const COLUMNS = [
  { key: 'SPX Tracking Number', label: 'Tracking Number', width: 'min-w-[160px]' },
  { key: 'Pickup Point Name',   label: 'Pickup Point',    width: 'min-w-[150px]' },
  { key: 'Pickup Attempts',     label: 'Attempts',        width: 'min-w-[90px]'  },
  { key: 'ETA',                 label: 'ETA',             width: 'min-w-[150px]' },
  { key: 'Status',              label: 'Status',          width: 'min-w-[120px]' },
  { key: 'Created Time',        label: 'Created',         width: 'min-w-[150px]' },
  { key: 'Last Update',         label: 'Last Update',     width: 'min-w-[150px]' },
  { key: 'Summary',             label: 'Summary',         width: 'min-w-[180px]' },
  { key: 'Driver',              label: 'Driver',          width: 'min-w-[130px]' },
  { key: 'Accepted Time',       label: 'Accepted Time',   width: 'min-w-[150px]' },
];

const STATUS_COLORS = {
  'Completed':  'bg-green-100  text-green-800  border-green-200',
  'Pending':    'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Failed':     'bg-red-100    text-red-800    border-red-200',
  'Assigned':   'bg-blue-100   text-blue-800   border-blue-200',
  '-':          'bg-gray-100   text-gray-500   border-gray-200',
};

const BuyerRRPage = () => {
  const [records,    setRecords]    = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);

  // Scraper state
  const [scraperState,    setScraperState]    = useState('idle');
  const [scraperProgress, setScraperProgress] = useState(null);
  const pollRef = useState(null);

  // Filters
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPickup, setFilterPickup] = useState('all');

  // Sort
  const [sortKey, setSortKey] = useState('ETA');
  const [sortDir, setSortDir] = useState('asc');

  // ── Fetch ──────────────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, headers } = await getBuyerRRData();
      const cleaned = data.filter(r => r['SPX Tracking Number'] && String(r['SPX Tracking Number']).trim() !== '');
      const tsKey = headers.find(h => /\d{4}-\d{2}-\d{2}/.test(h));
      if (tsKey) setLastUpdate(tsKey);
      setRecords(cleaned);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Scraper ────────────────────────────────────────────────
  const startScraper = async (action = 'run') => {
    setScraperState('running');
    setScraperProgress({ percent: 0, message: 'Mengirim perintah ke GAS...', updatedAt: '' });
    if (pollRef[0]) { clearInterval(pollRef[0]); pollRef[0] = null; }

    try {
      await runBuyerRRScraper(action);
      await new Promise(resolve => setTimeout(resolve, 3000));

      const interval = setInterval(async () => {
        try {
          const result = await getBuyerRRScraperStatus();
          if (!result) return;
          setScraperProgress(result.status);
          if (result.isDone || (result.command === 'IDLE' && result.status?.percent === 100)) {
            clearInterval(interval);
            pollRef[0] = null;
            const isError = result.status?.message?.startsWith('❌');
            setScraperState(isError ? 'error' : 'done');
            if (!isError) setTimeout(() => fetchData(), 2000);
          } else if (result.isRunning) {
            setScraperState('running');
          }
        } catch (_) {}
      }, 4000);
      pollRef[0] = interval;
    } catch (err) {
      setScraperState('error');
      setScraperProgress({ percent: 0, message: '❌ ' + err.message, updatedAt: '' });
    }
  };

  useEffect(() => { return () => { if (pollRef[0]) clearInterval(pollRef[0]); }; }, []);

  // ── Filter options ─────────────────────────────────────────
  const statusOptions = useMemo(() => [...new Set(records.map(r => r['Status']).filter(v => v && v !== ''))].sort(), [records]);
  const pickupOptions = useMemo(() => [...new Set(records.map(r => r['Pickup Point Name']).filter(v => v && v !== ''))].sort(), [records]);

  // ── Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const statusMap = {};
    records.forEach(r => {
      const s = r['Status'] ? String(r['Status']).trim() : '—';
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    const statusList = Object.entries(statusMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const attempts = records.map(r => parseInt(r['Pickup Attempts']) || 0);
    const maxAttempts = attempts.length ? Math.max(...attempts) : 0;
    const multiAttempts = records.filter(r => parseInt(r['Pickup Attempts']) > 1).length;

    return {
      total: records.length,
      multiAttempts,
      maxAttempts,
      pickupPoints: new Set(records.map(r => r['Pickup Point Name']).filter(Boolean)).size,
      statusList,
    };
  }, [records]);

  // ── Filtered + sorted ──────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...records];
    if (filterStatus !== 'all') data = data.filter(r => r['Status'] === filterStatus);
    if (filterPickup !== 'all') data = data.filter(r => r['Pickup Point Name'] === filterPickup);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r => COLUMNS.some(c => String(r[c.key] ?? '').toLowerCase().includes(q)));
    }
    data.sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      if (sortKey === 'Pickup Attempts') {
        return sortDir === 'asc' ? parseInt(av) - parseInt(bv) : parseInt(bv) - parseInt(av);
      }
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return data;
  }, [records, search, filterStatus, filterPickup, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ── Export ─────────────────────────────────────────────────
  const handleExport = () => {
    if (!filtered.length) return;
    const headers = COLUMNS.map(c => c.label);
    const rows = filtered.map(r => COLUMNS.map(c => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `BuyerRR-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── Render cell ────────────────────────────────────────────
  const renderCell = (row, col) => {
    const val = row[col.key];
    if (col.key === 'Status') {
      const colorClass = STATUS_COLORS[val] || 'bg-gray-100 text-gray-600 border-gray-200';
      return val
        ? <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass} whitespace-nowrap`}>{val}</span>
        : '—';
    }
    if (col.key === 'Pickup Attempts') {
      const n = parseInt(val);
      return <span className={`text-sm font-semibold ${n > 1 ? 'text-orange-600' : 'text-gray-700'}`}>{val || '—'}</span>;
    }
    if (col.key === 'SPX Tracking Number') {
      return <span className="font-mono text-xs text-gray-800 font-medium">{val || '—'}</span>;
    }
    if (col.key === 'Summary') {
      return <span className="text-xs text-gray-600 whitespace-normal leading-relaxed">{val || '—'}</span>;
    }
    return <span className="text-sm text-gray-700 whitespace-nowrap">{val || '—'}</span>;
  };

  // ── Loading ────────────────────────────────────────────────
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

  return (
    <div className="space-y-4">

      {/* ── Scraper Control Panel ── */}
      <div className={`rounded-xl border p-4 shadow-sm ${
        scraperState === 'running' ? 'bg-blue-50 border-blue-200' :
        scraperState === 'done'    ? 'bg-green-50 border-green-200' :
        scraperState === 'error'   ? 'bg-red-50 border-red-200' :
        'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {scraperState === 'running' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
            {scraperState === 'done'    && <CheckCircle className="w-5 h-5 text-green-600" />}
            {scraperState === 'error'   && <XCircle className="w-5 h-5 text-red-600" />}
            {scraperState === 'idle'    && <Truck className="w-5 h-5 text-gray-400" />}
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {scraperState === 'idle'    && 'SPX Buyer RR Scraper'}
                {scraperState === 'running' && 'Scraper sedang berjalan...'}
                {scraperState === 'done'    && 'Scraper selesai!'}
                {scraperState === 'error'   && 'Scraper gagal'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {scraperState === 'idle' && 'Klik "Run Scraper" untuk mengambil data terbaru dari SPX'}
                {scraperProgress?.message && scraperState !== 'idle' && scraperProgress.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => startScraper('run')}
              disabled={scraperState === 'running'}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              {scraperState === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Scraper
            </button>
            <button
              onClick={() => startScraper('resume')}
              disabled={scraperState === 'running'}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg text-sm font-medium border border-gray-300"
            >
              <RotateCcw className="w-4 h-4" /> Resume
            </button>
          </div>
        </div>

        {scraperProgress && scraperState !== 'idle' && (
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span className={scraperProgress.message?.startsWith('❌') ? 'text-red-600 font-medium' : ''}>
                  {scraperProgress.percent}%
                </span>
                {scraperProgress.updatedAt && <span className="text-gray-400">Updated: {scraperProgress.updatedAt}</span>}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full transition-all duration-500 ${
                  scraperProgress.message?.startsWith('❌') ? 'bg-red-500' :
                  scraperState === 'done'                   ? 'bg-green-500' :
                  scraperProgress.message?.startsWith('⚠️') ? 'bg-yellow-400' :
                  'bg-indigo-500'
                }`} style={{ width: `${scraperProgress.percent}%` }} />
              </div>
            </div>
            {scraperProgress.message?.startsWith('❌') && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-red-700 mb-1">Detail Error:</p>
                <p className="text-xs text-red-600 font-mono break-all">{scraperProgress.message.replace('❌ ', '')}</p>
                <div className="mt-2 text-xs text-red-500 space-y-0.5">
                  <p>Kemungkinan penyebab:</p>
                  <p>• Cookie expired → update cookie via bookmarklet lalu coba lagi</p>
                  <p>• SPX API down → tunggu beberapa menit lalu coba lagi</p>
                  <p>• Timeout → klik Resume untuk melanjutkan</p>
                </div>
              </div>
            )}
            {scraperProgress.message?.startsWith('⚠️') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                <p className="text-xs text-yellow-700">{scraperProgress.message}</p>
                <p className="text-xs text-yellow-600 mt-1">→ Klik <strong>Resume</strong> untuk melanjutkan</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Order</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{stats.multiAttempts}</p>
              <p className="text-xs text-gray-500">Multi Attempts (&gt;1)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{stats.maxAttempts}</p>
              <p className="text-xs text-gray-500">Max Attempts</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pickupPoints}</p>
              <p className="text-xs text-gray-500">Pickup Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Status Breakdown ── */}
      {stats.statusList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Breakdown by Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {stats.statusList.map(({ name, count }) => {
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              const isDash = name === '—' || name === '-';
              return (
                <div key={name} className={`rounded-lg border p-3 ${isDash ? 'border-gray-200 bg-gray-50' : 'border-indigo-100 bg-indigo-50'}`}>
                  <p className={`text-lg font-bold ${isDash ? 'text-gray-500' : 'text-indigo-700'}`}>{count}</p>
                  <p className="text-xs font-medium text-gray-700 mt-0.5 leading-tight line-clamp-2" title={name}>{name}</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${isDash ? 'bg-gray-400' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Menampilkan <strong className="text-gray-800">{filtered.length}</strong> dari <strong className="text-gray-800">{records.length}</strong> order
            {lastUpdate && <span className="ml-2 text-gray-400">· Last update: {lastUpdate}</span>}
          </p>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 lg:flex-none lg:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari TN, driver..."
                className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
              {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
              <option value="all">Semua Status</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterPickup} onChange={e => setFilterPickup(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
              <option value="all">Semua Pickup Point</option>
              {pickupOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {(search || filterStatus !== 'all' || filterPickup !== 'all') && (
              <button onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPickup('all'); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            )}
            <button onClick={handleExport} disabled={!filtered.length}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                {COLUMNS.map(col => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="w-12 h-12 text-gray-200" />
                      <p className="text-gray-500 font-medium">Tidak ada data</p>
                      <p className="text-xs text-gray-400">Coba ubah filter atau kata kunci pencarian</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={i} className={`hover:bg-indigo-50/40 transition-colors ${parseInt(row['Pickup Attempts']) > 1 ? 'bg-orange-50/20' : ''}`}>
                    {COLUMNS.map(col => (
                      <td key={col.key} className="px-4 py-3 align-middle">{renderCell(row, col)}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <strong className="text-gray-700">{filtered.length}</strong>&nbsp;order ditampilkan
            {stats.multiAttempts > 0 && (
              <span className="text-orange-600 font-medium">⚠ {stats.multiAttempts} order dengan multiple pickup attempts</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerRRPage;
