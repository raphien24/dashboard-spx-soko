import { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw, Search, X, Download,
  ChevronUp, ChevronDown, Package, Clock, AlertTriangle,
  Play, RotateCcw, CheckCircle, XCircle, Loader2,
  BarChart2, MapPin, Copy, Check, DollarSign, TrendingUp
} from 'lucide-react';
import { getStuckOnholdData, runStuckOnholdScraper, getStuckOnholdStatus } from '../../services/googleSheetsService';

const COLUMNS = [
  { key: 'Order ID',                       label: 'Order ID',              width: 'min-w-[160px]' },
  { key: 'District Name',                  label: 'District',              width: 'min-w-[120px]' },
  { key: 'Current Station Received Time',  label: 'Received Time',         width: 'min-w-[160px]' },
  { key: 'OnHold Time',                    label: 'OnHold Time',           width: 'min-w-[160px]' },
  { key: 'OnHoldReason',                   label: 'Reason',                width: 'min-w-[200px]' },
  { key: 'Status',                         label: 'Status',                width: 'min-w-[120px]' },
  { key: 'COD Amount',                     label: 'COD',                   width: 'min-w-[100px]' },
  { key: 'Order Account',                  label: 'Account',               width: 'min-w-[90px]'  },
  { key: 'Total of On Hold Times',         label: 'Hold Times',            width: 'min-w-[100px]' },
  { key: 'Pickup Station',                 label: 'Pickup Station',        width: 'min-w-[150px]' },
  { key: 'Size Type',                      label: 'Size',                  width: 'min-w-[80px]'  },
];

const StuckOnholdPage = () => {
  const [records,    setRecords]    = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);

  // Scraper
  const [scraperState,    setScraperState]    = useState('idle');
  const [scraperProgress, setScraperProgress] = useState(null);
  const pollRef = useState(null);

  // Filters
  const [search,          setSearch]          = useState('');
  const [filterDistrict,  setFilterDistrict]  = useState('all');
  const [filterStatus,    setFilterStatus]    = useState('all');
  const [filterAccount,   setFilterAccount]   = useState('all');
  const [filterDateFrom,  setFilterDateFrom]  = useState('');
  const [filterDateTo,    setFilterDateTo]    = useState('');

  // Sort
  const [sortKey, setSortKey] = useState('OnHold Time');
  const [sortDir, setSortDir] = useState('desc');

  // Copy all filtered Order IDs
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = () => {
    const ids = filtered.map(r => r['Order ID']).filter(Boolean).join('\n');
    if (!ids) return;
    navigator.clipboard.writeText(ids).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  // ── Fetch ──────────────────────────────────────────────────
  const fetchData = async () => {
    if (scraperState !== 'running') {
      setScraperState('idle');
      setScraperProgress(null);
      if (pollRef[0]) { clearInterval(pollRef[0]); pollRef[0] = null; }
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, headers } = await getStuckOnholdData();
      setRecords(data.filter(r => r['Order ID'] && String(r['Order ID']).trim() !== ''));
      // Last update from header if available
      const tsKey = headers.find(h => /\d{2}\/\d{2}\/\d{4}/.test(h));
      if (tsKey) setLastUpdate(tsKey);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Load last status on mount
  useEffect(() => {
    getStuckOnholdStatus().then(result => {
      if (!result?.status) return;
      const msg = result.status.message || '';
      const isError = msg.startsWith('❌');
      const isDone  = msg.startsWith('✅') || result.status.percent >= 100;
      if (isDone || isError) {
        setScraperState(isError ? 'error' : 'done');
        setScraperProgress(result.status);
      }
    }).catch(() => {});
  }, []);

  // ── Scraper ────────────────────────────────────────────────
  const startScraper = async (action = 'run') => {
    setScraperState('running');

    // Show last known status as context
    try {
      const last = await getStuckOnholdStatus();
      setScraperProgress({
        percent: 0,
        message: `Mengirim perintah ke GAS...${last?.status?.message ? ` (terakhir: ${last.status.message})` : ''}`,
        updatedAt: '',
      });
    } catch (_) {
      setScraperProgress({ percent: 0, message: 'Mengirim perintah ke GAS...', updatedAt: '' });
    }
    if (pollRef[0]) { clearInterval(pollRef[0]); pollRef[0] = null; }

    try {
      await runStuckOnholdScraper(action);
      await new Promise(r => setTimeout(r, 3000));
      const startedAt = Date.now();
      const interval = setInterval(async () => {
        try {
          const result = await getStuckOnholdStatus();
          if (!result) return;
          if (result.status) setScraperProgress(result.status);
          const elapsed = Date.now() - startedAt;
          const msg     = result.status?.message || '';
          const done    = result.isDone || result.status?.percent >= 100 ||
                          msg.startsWith('✅') || msg.startsWith('⚠️') ||
                          (result.command === 'IDLE' && elapsed > 30000);
          if (done) {
            clearInterval(interval); pollRef[0] = null;
            const isError = msg.startsWith('❌');
            setScraperState(isError ? 'error' : 'done');
            setScraperProgress({
              percent: 100,
              message: isError ? msg : (msg || '✅ Selesai! Data berhasil diperbarui.'),
              updatedAt: result.status?.updatedAt || '',
            });
            if (!isError) setTimeout(() => fetchData(), 2000);
          } else if (result.isRunning) setScraperState('running');
        } catch (_) {}
      }, 3000);
      pollRef[0] = interval;
    } catch (err) {
      setScraperState('error');
      setScraperProgress({ percent: 0, message: '❌ ' + err.message, updatedAt: '' });
    }
  };

  useEffect(() => () => { if (pollRef[0]) clearInterval(pollRef[0]); }, []);

  // ── Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total   = records.length;
    const districtOptions = [...new Set(records.map(r => r['District Name']).filter(Boolean))].sort();
    const statusOptions   = [...new Set(records.map(r => r['Status']).filter(Boolean))].sort();
    const accountOptions  = [...new Set(records.map(r => r['Order Account']).filter(Boolean))].sort();
    
    // Calculate total COD amount
    const totalCOD = records.reduce((sum, r) => {
      const cod = parseFloat(String(r['COD Amount'] || '0').replace(/[^0-9.-]/g, ''));
      return sum + (isNaN(cod) ? 0 : cod);
    }, 0);

    // Average hold times
    const avgHoldTimes = total > 0
      ? (records.reduce((s, r) => s + (parseFloat(r['Total of On Hold Times']) || 0), 0) / total).toFixed(1)
      : '0';

    // Count by hold times
    const holdTime1 = records.filter(r => parseFloat(r['Total of On Hold Times']) === 1).length;
    const holdTime2Plus = records.filter(r => parseFloat(r['Total of On Hold Times']) >= 2).length;

    return { total, districtOptions, statusOptions, accountOptions, totalCOD, avgHoldTimes, holdTime1, holdTime2Plus };
  }, [records]);

  // ── Filtered + sorted ──────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...records];
    if (filterDistrict !== 'all') data = data.filter(r => r['District Name'] === filterDistrict);
    if (filterStatus   !== 'all') data = data.filter(r => r['Status'] === filterStatus);
    if (filterAccount  !== 'all') data = data.filter(r => r['Order Account'] === filterAccount);
    
    // Filter by date range (Received Time)
    if (filterDateFrom || filterDateTo) {
      data = data.filter(r => {
        const receivedTime = r['Current Station Received Time'];
        if (!receivedTime) return false;
        
        // Parse date from string (format: YYYY-MM-DD HH:MM:SS or similar)
        const dateStr = String(receivedTime).split(' ')[0]; // Get date part only
        const recordDate = new Date(dateStr);
        
        if (isNaN(recordDate.getTime())) return false; // Invalid date
        
        // Compare with filters
        if (filterDateFrom) {
          const fromDate = new Date(filterDateFrom);
          if (recordDate < fromDate) return false;
        }
        if (filterDateTo) {
          const toDate = new Date(filterDateTo);
          toDate.setHours(23, 59, 59, 999); // End of day
          if (recordDate > toDate) return false;
        }
        
        return true;
      });
    }
    
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r => COLUMNS.some(c => String(r[c.key] ?? '').toLowerCase().includes(q)));
    }
    data.sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (sortKey === 'Total of On Hold Times' || sortKey === 'COD Amount') {
        return sortDir === 'asc' ? parseFloat(av) - parseFloat(bv) : parseFloat(bv) - parseFloat(av);
      }
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return data;
  }, [records, filterDistrict, filterStatus, filterAccount, filterDateFrom, filterDateTo, search, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ── Export ─────────────────────────────────────────────────
  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = COLUMNS.map(c => c.label);
    const rows = filtered.map(r => COLUMNS.map(c => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `StuckOnhold-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── Render cell ────────────────────────────────────────────
  const renderCell = (row, col) => {
    const val = row[col.key];
    if (col.key === 'Order ID') return <span className="font-mono text-xs font-medium text-gray-800 dark:text-slate-200">{val || '—'}</span>;
    if (col.key === 'Total of On Hold Times') {
      const n = parseFloat(val) || 0;
      return <span className={`text-sm font-bold ${n >= 2 ? 'text-red-600' : 'text-yellow-600'}`}>{val || '0'}</span>;
    }
    if (col.key === 'COD Amount') {
      const cod = parseFloat(String(val || '0').replace(/[^0-9.-]/g, ''));
      if (isNaN(cod) || cod === 0) return <span className="text-gray-400 dark:text-slate-500 text-xs">—</span>;
      return <span className="text-sm font-semibold text-green-600 dark:text-green-400">Rp {cod.toLocaleString('id-ID')}</span>;
    }
    if (col.key === 'Status') {
      return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">{val || '—'}</span>;
    }
    return <span className="text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">{val || '—'}</span>;
  };

  // ── Loading / Error ────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-slate-500">Loading Stuck Onhold...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-900 dark:text-red-400 mb-1">Gagal memuat data</h3>
          <p className="text-sm text-red-700 dark:text-red-400 mb-4">{error}</p>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Coba Lagi
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* ── Scraper Panel ── */}
      <div className={`rounded-xl border p-4 shadow-sm ${
        scraperState === 'running' ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900' :
        scraperState === 'done'    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900' :
        scraperState === 'error'   ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900' :
        'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {scraperState === 'running' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
            {scraperState === 'done'    && <CheckCircle className="w-5 h-5 text-green-600" />}
            {scraperState === 'error'   && <XCircle className="w-5 h-5 text-red-600" />}
            {scraperState === 'idle'    && <BarChart2 className="w-5 h-5 text-gray-400 dark:text-slate-500" />}
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                {scraperState === 'idle'    && 'Stuck Onhold Scraper'}
                {scraperState === 'running' && 'Scraper sedang berjalan...'}
                {scraperState === 'done'    && '✅ Scraper selesai!'}
                {scraperState === 'error'   && '❌ Scraper gagal'}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
                {scraperState === 'idle'  && 'Klik "Run" untuk mengambil data terbaru dari SPX (D-15 to D-1)'}
                {scraperState === 'done'  && 'Data sudah diperbarui. Klik "Run" lagi untuk update berikutnya.'}
                {scraperState === 'error' && 'Cek detail error di bawah, atau klik "Run" untuk coba lagi.'}
                {scraperProgress?.message && scraperState === 'running' && scraperProgress.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => startScraper('run')} disabled={scraperState === 'running'}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium">
              {scraperState === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run
            </button>
            <button onClick={fetchData} disabled={scraperState === 'running'}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-gray-300 dark:border-slate-700">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {scraperState !== 'idle' && (
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                <span className="font-medium">
                  {scraperProgress?.percent > 0 ? `${scraperProgress.percent}%` : scraperState === 'running' ? 'Berjalan...' : '100%'}
                </span>
                {scraperProgress?.updatedAt && <span className="text-gray-400 dark:text-slate-500">{scraperProgress.updatedAt}</span>}
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                {scraperProgress?.percent > 0 ? (
                  <div className={`h-2.5 rounded-full transition-all duration-500 ${
                    scraperState === 'error' ? 'bg-red-500' :
                    scraperState === 'done'  ? 'bg-green-500' :
                    scraperProgress?.message?.startsWith('⚠️') ? 'bg-yellow-400' : 'bg-indigo-500'
                  }`} style={{ width: `${Math.min(scraperProgress.percent, 100)}%` }} />
                ) : (
                  <div className="h-2.5 bg-indigo-400 rounded-full w-1/3"
                    style={{ animation: scraperState === 'running' ? 'slideRight 1.5s ease-in-out infinite' : 'none',
                             width: scraperState !== 'running' ? '100%' : undefined,
                             background: scraperState === 'done' ? '#22c55e' : scraperState === 'error' ? '#ef4444' : undefined }} />
                )}
              </div>
            </div>
            {scraperProgress?.message && scraperProgress.message !== 'Mengirim perintah ke GAS...' && (
              <p className="text-xs text-gray-600 dark:text-slate-400 font-mono bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-lg border dark:border-slate-700 truncate">
                {scraperProgress.message}
              </p>
            )}
            {scraperState === 'error' && scraperProgress?.message?.startsWith('❌') && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-4 py-3 text-xs text-red-600 dark:text-red-400">
                <p className="font-semibold mb-1">Detail Error:</p>
                <p className="font-mono break-all">{scraperProgress.message.replace('❌ ', '')}</p>
                <p className="mt-1">• Cookie expired → update via bookmarklet &nbsp;• API down → coba lagi &nbsp;• Timeout → tunggu beberapa menit</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-indigo-200 dark:border-indigo-900 p-4 col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-900 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-950 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.holdTime1}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">Hold 1x</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-red-200 dark:border-red-900 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-950 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.holdTime2Plus}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">Hold 2x+</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-green-200 dark:border-green-900 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">Rp {(stats.totalCOD / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">Total COD</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-orange-200 dark:border-orange-900 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.avgHoldTimes}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">Avg Hold Times</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar + Table ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                Stuck Onhold Detail
                <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-full">{filtered.length}</span>
              </h3>
              {lastUpdate && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Last update: {lastUpdate}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari order ID..."
                  className="pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 w-48 focus:ring-2 focus:ring-indigo-500" />
                {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"><X className="w-4 h-4" /></button>}
              </div>
              {/* Filter District */}
              <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500">
                <option value="all">Semua District</option>
                {stats.districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {/* Filter Status */}
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500">
                <option value="all">Semua Status</option>
                {stats.statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {/* Filter Account */}
              <select value={filterAccount} onChange={e => setFilterAccount(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500">
                <option value="all">Semua Account</option>
                {stats.accountOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {/* Date Filter From */}
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => setFilterDateFrom(e.target.value)}
                placeholder="Dari tanggal"
                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                title="Received Time - Dari"
              />
              {/* Date Filter To */}
              <input
                type="date"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
                placeholder="Sampai tanggal"
                className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                title="Received Time - Sampai"
              />
              {/* Reset */}
              {(search || filterDistrict !== 'all' || filterStatus !== 'all' || filterAccount !== 'all' || filterDateFrom || filterDateTo) && (
                <button onClick={() => { setSearch(''); setFilterDistrict('all'); setFilterStatus('all'); setFilterAccount('all'); setFilterDateFrom(''); setFilterDateTo(''); }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-slate-400 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800">
                  <X className="w-3.5 h-3.5" /> Reset
                </button>
              )}
              {/* Copy All IDs */}
              <button
                onClick={handleCopyAll}
                disabled={!filtered.length}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  copiedAll
                    ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-900'
                    : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-slate-500 disabled:border-gray-200 dark:disabled:border-slate-800'
                }`}
                title={`Copy ${filtered.length} Order ID ke clipboard`}
              >
                {copiedAll
                  ? <><Check className="w-4 h-4" /> Copied {filtered.length} IDs</>
                  : <><Copy className="w-4 h-4" /> Copy {filtered.length} IDs</>
                }
              </button>

              {/* Export */}
              <button onClick={exportCSV} disabled={!filtered.length}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
                <Download className="w-4 h-4" /> CSV
              </button>
            </div>
          </div>
        </div>

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
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="w-12 h-12 text-gray-200 dark:text-slate-700" />
                      <p className="text-gray-500 dark:text-slate-500 font-medium">Tidak ada data</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={i} className={`hover:bg-indigo-50 dark:hover:bg-slate-800/40 transition-colors ${
                    parseFloat(row['Total of On Hold Times']) >= 2 ? 'bg-red-50/20 dark:bg-red-950/10' : ''
                  }`}>
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
          <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-500 flex items-center justify-between">
            <span><strong className="text-gray-700 dark:text-slate-300">{filtered.length}</strong> orders</span>
            <div className="flex items-center gap-4">
              <span className="text-yellow-600 font-medium">🟡 Hold 1x: {filtered.filter(r => parseFloat(r['Total of On Hold Times']) === 1).length}</span>
              <span className="text-red-600 font-medium">🔴 Hold 2x+: {filtered.filter(r => parseFloat(r['Total of On Hold Times']) >= 2).length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StuckOnholdPage;
