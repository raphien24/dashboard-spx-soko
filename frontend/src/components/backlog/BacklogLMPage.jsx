import { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw, Search, X, Download,
  ChevronUp, ChevronDown, Package, Clock, AlertTriangle,
  Play, RotateCcw, CheckCircle, XCircle, Loader2,
  ShieldCheck, ShieldX, BarChart2, MapPin, Copy, Check
} from 'lucide-react';
import { getBacklogLMData, runBacklogLMScraper, getBacklogLMStatus } from '../../services/googleSheetsService';

const COLUMNS = [
  { key: 'Shipment ID',               label: 'Shipment ID',       width: 'min-w-[160px]' },
  { key: 'Zone ID',                   label: 'Zone',              width: 'min-w-[90px]'  },
  { key: 'Zone Name',                 label: 'Zone Name',         width: 'min-w-[110px]' },
  { key: 'Order Account',             label: 'Account',           width: 'min-w-[90px]'  },
  { key: 'Inbound Time',              label: 'Inbound',           width: 'min-w-[140px]' },
  { key: 'LM Hub Aging',              label: 'Aging',             width: 'min-w-[110px]' },
  { key: 'LM Hub Days',               label: 'Days',              width: 'min-w-[70px]'  },
  { key: 'No. Attempts',              label: 'Attempts',          width: 'min-w-[80px]'  },
  { key: 'Latest Status',             label: 'Status',            width: 'min-w-[150px]' },
  { key: 'Latest Operation Time',     label: 'Last Operation',    width: 'min-w-[140px]' },
  { key: 'Apakah sudah SLS triggered?', label: 'SLS Triggered',  width: 'min-w-[110px]' },
];

const SLS_COL = 'Apakah sudah SLS triggered?';

const BacklogLMPage = () => {
  const [records,    setRecords]    = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);

  // Scraper
  const [scraperState,    setScraperState]    = useState('idle');
  const [scraperProgress, setScraperProgress] = useState(null);
  const pollRef = useState(null);

  // Filters
  const [search,       setSearch]       = useState('');
  const [filterZone,   setFilterZone]   = useState('all');
  const [filterSLS,    setFilterSLS]    = useState('all');
  const [filterAccount,setFilterAccount]= useState('all');

  // Sort
  const [sortKey, setSortKey] = useState('LM Hub Days');
  const [sortDir, setSortDir] = useState('desc');

  // Copy all filtered Shipment IDs
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = () => {
    const ids = filtered.map(r => r['Shipment ID']).filter(Boolean).join('\n');
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
      const { data, headers } = await getBacklogLMData();
      setRecords(data.filter(r => r['Shipment ID'] && String(r['Shipment ID']).trim() !== ''));
      // Last update from column Q header
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
    getBacklogLMStatus().then(result => {
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
      const last = await getBacklogLMStatus();
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
      await runBacklogLMScraper(action);
      await new Promise(r => setTimeout(r, 3000));
      const startedAt = Date.now();
      const interval = setInterval(async () => {
        try {
          const result = await getBacklogLMStatus();
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
    const sudah   = records.filter(r => r[SLS_COL] === 'Sudah').length;
    const belum   = records.filter(r => r[SLS_COL] === 'Belum').length;
    const unknown = total - sudah - belum;
    const avgDays = total > 0
      ? (records.reduce((s, r) => s + (parseFloat(r['LM Hub Days']) || 0), 0) / total).toFixed(1)
      : '0';
    const zoneOptions    = [...new Set(records.map(r => r['Zone ID']).filter(Boolean))].sort();
    const accountOptions = [...new Set(records.map(r => r['Order Account']).filter(Boolean))].sort();
    return { total, sudah, belum, unknown, avgDays, zoneOptions, accountOptions };
  }, [records]);

  // ── Filtered + sorted ──────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...records];
    if (filterZone    !== 'all') data = data.filter(r => r['Zone ID']       === filterZone);
    if (filterAccount !== 'all') data = data.filter(r => r['Order Account'] === filterAccount);
    if (filterSLS     !== 'all') data = data.filter(r => r[SLS_COL]         === filterSLS);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r => COLUMNS.some(c => String(r[c.key] ?? '').toLowerCase().includes(q)));
    }
    data.sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (sortKey === 'LM Hub Days' || sortKey === 'No. Attempts') {
        return sortDir === 'asc' ? parseFloat(av) - parseFloat(bv) : parseFloat(bv) - parseFloat(av);
      }
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return data;
  }, [records, filterZone, filterAccount, filterSLS, search, sortKey, sortDir]);

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
    a.download = `BacklogLM-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── Render cell ────────────────────────────────────────────
  const renderCell = (row, col) => {
    const val = row[col.key];
    if (col.key === SLS_COL) {
      if (val === 'Sudah') return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3 h-3" /> Sudah
        </span>
      );
      if (val === 'Belum') return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-full text-xs font-semibold">
          <ShieldX className="w-3 h-3" /> Belum
        </span>
      );
      return <span className="text-gray-400 text-xs">—</span>;
    }
    if (col.key === 'LM Hub Days') {
      const n = parseFloat(val) || 0;
      return <span className={`text-sm font-bold ${n > 7 ? 'text-red-600' : n > 5 ? 'text-orange-500' : 'text-yellow-600'}`}>{val || '—'}</span>;
    }
    if (col.key === 'Shipment ID') return <span className="font-mono text-xs font-medium text-gray-800">{val || '—'}</span>;
    return <span className="text-sm text-gray-700 whitespace-nowrap">{val || '—'}</span>;
  };

  // ── Loading / Error ────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading Backlog LM...</p>
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
            {scraperState === 'idle'    && <BarChart2 className="w-5 h-5 text-gray-400" />}
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {scraperState === 'idle'    && 'Backlog LM Scraper'}
                {scraperState === 'running' && 'Scraper sedang berjalan...'}
                {scraperState === 'done'    && '✅ Scraper selesai!'}
                {scraperState === 'error'   && '❌ Scraper gagal'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {scraperState === 'idle'  && 'Klik "Run" untuk mengambil data terbaru dari SPX'}
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
            <button onClick={() => startScraper('resume')} disabled={scraperState === 'running'}
              title="Resume: isi ulang hanya baris SLS yang kosong/Error"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-300">
              <RotateCcw className="w-4 h-4" /> Resume
            </button>
            <button onClick={fetchData} disabled={scraperState === 'running'}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-300">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {scraperState !== 'idle' && (
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span className="font-medium">
                  {scraperProgress?.percent > 0 ? `${scraperProgress.percent}%` : scraperState === 'running' ? 'Berjalan...' : '100%'}
                </span>
                {scraperProgress?.updatedAt && <span className="text-gray-400">{scraperProgress.updatedAt}</span>}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
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
              <p className="text-xs text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-lg border truncate">
                {scraperProgress.message}
              </p>
            )}
            {scraperState === 'error' && scraperProgress?.message?.startsWith('❌') && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-600">
                <p className="font-semibold mb-1">Detail Error:</p>
                <p className="font-mono break-all">{scraperProgress.message.replace('❌ ', '')}</p>
                <p className="mt-1">• Cookie expired → update via bookmarklet &nbsp;• API down → coba lagi &nbsp;• Timeout → klik Resume</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-4 col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Backlog</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.sudah}</p>
              <p className="text-xs text-gray-500">SLS Sudah</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ShieldX className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.belum}</p>
              <p className="text-xs text-gray-500">SLS Belum</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{stats.unknown}</p>
              <p className="text-xs text-gray-500">Belum Dicek</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.avgDays}</p>
              <p className="text-xs text-gray-500">Avg Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar + Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                Backlog LM Detail
                <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">{filtered.length}</span>
              </h3>
              {lastUpdate && <p className="text-xs text-gray-400 mt-0.5">Last update: {lastUpdate}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari shipment ID..."
                  className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm w-48 focus:ring-2 focus:ring-indigo-500" />
                {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
              </div>
              {/* Filter SLS */}
              <select value={filterSLS} onChange={e => setFilterSLS(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                <option value="all">Semua SLS</option>
                <option value="Sudah">SLS Sudah</option>
                <option value="Belum">SLS Belum</option>
              </select>
              {/* Filter Zone */}
              <select value={filterZone} onChange={e => setFilterZone(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                <option value="all">Semua Zone</option>
                {stats.zoneOptions.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              {/* Filter Account */}
              <select value={filterAccount} onChange={e => setFilterAccount(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                <option value="all">Semua Account</option>
                {stats.accountOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {/* Reset */}
              {(search || filterZone !== 'all' || filterSLS !== 'all' || filterAccount !== 'all') && (
                <button onClick={() => { setSearch(''); setFilterZone('all'); setFilterSLS('all'); setFilterAccount('all'); }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <X className="w-3.5 h-3.5" /> Reset
                </button>
              )}
              {/* Copy All IDs */}
              <button
                onClick={handleCopyAll}
                disabled={!filtered.length}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  copiedAll
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200'
                }`}
                title={`Copy ${filtered.length} Shipment ID ke clipboard`}
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
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="w-12 h-12 text-gray-200" />
                      <p className="text-gray-500 font-medium">Tidak ada data</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={i} className={`hover:bg-indigo-50/40 transition-colors ${
                    parseFloat(row['LM Hub Days']) > 7 ? 'bg-red-50/20' : ''
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
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <span><strong className="text-gray-700">{filtered.length}</strong> shipment</span>
            <div className="flex items-center gap-4">
              <span className="text-red-600 font-medium">🔴 SLS Sudah: {filtered.filter(r => r[SLS_COL] === 'Sudah').length}</span>
              <span className="text-yellow-600 font-medium">🟡 SLS Belum: {filtered.filter(r => r[SLS_COL] === 'Belum').length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BacklogLMPage;
