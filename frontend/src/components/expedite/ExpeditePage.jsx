import { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw, Search, X, Download,
  ChevronUp, ChevronDown, Package, Clock, AlertTriangle,
  Play, RotateCcw, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { getExpediteData, runExpediteScaper, getExpediteScraperStatus } from '../../services/googleSheetsService';

// Columns to display
const COLUMNS = [
  { key: 'SPX TN',                    label: 'Tracking Number',      width: 'min-w-[160px]' },
  { key: 'Zone ID',                   label: 'Zone',                 width: 'min-w-[100px]' },
  { key: 'Zone Name',                 label: 'Zone Name',            width: 'min-w-[140px]' },
  { key: 'Order Account',             label: 'Account',              width: 'min-w-[130px]' },
  { key: 'Create Time',               label: 'Create Time',          width: 'min-w-[160px]' },
  { key: 'Last Operator/Driver Name', label: 'Last Driver',          width: 'min-w-[150px]' },
  { key: 'Latest Status',             label: 'Status',               width: 'min-w-[160px]' },
  { key: 'Latest Operation Time',     label: 'Last Operation',       width: 'min-w-[160px]' },
  { key: 'To Expedite Tag',           label: 'Expedite Tag',         width: 'min-w-[130px]' },
  { key: 'Expedite Aging Time',       label: 'Aging (hrs)',          width: 'min-w-[110px]' },
  { key: 'Scenario',                  label: 'Scenario',             width: 'min-w-[140px]' },
  { key: 'Last Update',               label: 'Last Update',          width: 'min-w-[160px]' },
];

// Status badge colors
const STATUS_COLORS = {
  'Delivering':           'bg-blue-100   text-blue-800   border-blue-200',
  'Failed Delivery':      'bg-red-100    text-red-800    border-red-200',
  'Stuck at Delivering':  'bg-orange-100 text-orange-800 border-orange-200',
  'On Hold':              'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Delivered':            'bg-green-100  text-green-800  border-green-200',
};

// Aging color — red if >24, orange if >12, else green
const agingColor = (val) => {
  const n = parseFloat(val);
  if (isNaN(n)) return 'text-gray-500';
  if (n > 24) return 'text-red-600 font-semibold';
  if (n > 12) return 'text-orange-500 font-medium';
  return 'text-green-600';
};

const ExpeditePage = () => {
  const [records,   setRecords]   = useState([]);
  const [lastUpdate,setLastUpdate]= useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  // Scraper state
  const [scraperState, setScraperState] = useState('idle'); // idle | running | done | error
  const [scraperProgress, setScraperProgress] = useState(null); // { percent, message, done, error }
  const [scraperError, setScraperError] = useState(null);
  const pollRef = useState(null); // interval ref

  // Filters
  const [search,      setSearch]      = useState('');
  const [filterZone,  setFilterZone]  = useState('all');
  const [filterStatus,setFilterStatus]= useState('all');
  const [filterTag,   setFilterTag]   = useState('all');

  // Sort
  const [sortKey, setSortKey] = useState('Expedite Aging Time');
  const [sortDir, setSortDir] = useState('desc');

  // ── Fetch ─────────────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, headers } = await getExpediteData();
      // Last row might be a timestamp — detect and strip it
      const cleaned = data.filter(r => r['SPX TN'] && String(r['SPX TN']).trim() !== '');
      // Get last update from data (last column header that looks like a timestamp)
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

  // ── Scraper trigger ───────────────────────────────────────
  const startScraper = async (action = 'run') => {
    // Reset state dulu sebelum mulai
    setScraperState('running');
    setScraperError(null);
    setScraperProgress({ percent: 0, message: 'Mengirim perintah ke GAS...', updatedAt: '' });

    // Stop polling lama jika masih jalan
    if (pollRef[0]) {
      clearInterval(pollRef[0]);
      pollRef[0] = null;
    }

    try {
      // Write RUN/RESUME to trigger cell via Worker
      await runExpediteScaper(action);

      // Tunggu 3 detik beri waktu GAS reset cell status
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Start polling status every 4s
      const interval = setInterval(async () => {
        try {
          const result = await getExpediteScraperStatus();
          if (!result) return;

          setScraperProgress(result.status);

          if (result.isDone || result.command === 'IDLE' && result.status?.percent === 100) {
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
      setScraperError(err.message);
      setScraperState('error');
      setScraperProgress({ percent: 0, message: '❌ ' + err.message, updatedAt: '' });
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (pollRef[0]) clearInterval(pollRef[0]); };
  }, []);

  // ── Filter options (dynamic) ──────────────────────────────
  const zoneOptions   = useMemo(() => [...new Set(records.map(r => r['Zone ID']).filter(Boolean))].sort(), [records]);
  const statusOptions = useMemo(() => [...new Set(records.map(r => r['Latest Status']).filter(Boolean))].sort(), [records]);
  const tagOptions    = useMemo(() => [...new Set(records.map(r => r['To Expedite Tag']).filter(Boolean))].sort(), [records]);

  // ── Summary stats ─────────────────────────────────────────
  const stats = useMemo(() => {
    // Scenario breakdown — group by scenario value
    const scenarioMap = {};
    records.forEach(r => {
      const s = r['Scenario'] ? String(r['Scenario']).trim() : '—';
      scenarioMap[s] = (scenarioMap[s] || 0) + 1;
    });
    // Sort by count desc
    const scenarioList = Object.entries(scenarioMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total:        records.length,
      aging24:      records.filter(r => parseFloat(r['Expedite Aging Time']) > 24).length,
      aging12:      records.filter(r => { const n = parseFloat(r['Expedite Aging Time']); return n > 12 && n <= 24; }).length,
      zones:        new Set(records.map(r => r['Zone ID']).filter(Boolean)).size,
      scenarioList,
    };
  }, [records]);

  // ── Filtered + sorted ─────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...records];
    if (filterZone   !== 'all') data = data.filter(r => r['Zone ID']        === filterZone);
    if (filterStatus !== 'all') data = data.filter(r => r['Latest Status']  === filterStatus);
    if (filterTag    !== 'all') data = data.filter(r => r['To Expedite Tag'] === filterTag);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r => COLUMNS.some(c => String(r[c.key] ?? '').toLowerCase().includes(q)));
    }
    data.sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (sortKey === 'Expedite Aging Time') {
        return sortDir === 'asc' ? parseFloat(av) - parseFloat(bv) : parseFloat(bv) - parseFloat(av);
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return data;
  }, [records, search, filterZone, filterStatus, filterTag, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ── CSV Export ────────────────────────────────────────────
  const handleExport = () => {
    if (!filtered.length) return;
    const headers = COLUMNS.map(c => c.label);
    const rows = filtered.map(r => COLUMNS.map(c => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Expedite-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── Render cell ───────────────────────────────────────────
  const renderCell = (row, col) => {
    const val = row[col.key];

    if (col.key === 'Latest Status') {
      const colorClass = STATUS_COLORS[val] || 'bg-gray-100 text-gray-700 border-gray-200';
      return val
        ? <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass} whitespace-nowrap`}>{val}</span>
        : '—';
    }

    if (col.key === 'Expedite Aging Time') {
      return <span className={`text-sm ${agingColor(val)}`}>{val ? `${parseFloat(val).toFixed(1)} hrs` : '—'}</span>;
    }

    if (col.key === 'SPX TN') {
      return <span className="font-mono text-xs text-gray-800 font-medium">{val || '—'}</span>;
    }

    return <span className="text-sm text-gray-700 whitespace-nowrap">{val || '—'}</span>;
  };

  // ── Loading ───────────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading Expedite data...</p>
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

  // ── Main ──────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Scraper Control Panel ── */}
      <div className={`rounded-xl border p-4 ${
        scraperState === 'running' ? 'bg-blue-50 border-blue-200' :
        scraperState === 'done'    ? 'bg-green-50 border-green-200' :
        scraperState === 'error'   ? 'bg-red-50 border-red-200' :
        'bg-white border-gray-200'
      } shadow-sm`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {scraperState === 'running' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
            {scraperState === 'done'    && <CheckCircle className="w-5 h-5 text-green-600" />}
            {scraperState === 'error'   && <XCircle className="w-5 h-5 text-red-600" />}
            {scraperState === 'idle'    && <Play className="w-5 h-5 text-gray-400" />}
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {scraperState === 'idle'    && 'SPX Expedite Scraper'}
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

          {/* Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => startScraper('run')}
              disabled={scraperState === 'running'}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              {scraperState === 'running'
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Play className="w-4 h-4" />
              }
              Run Scraper
            </button>
            <button
              onClick={() => startScraper('resume')}
              disabled={scraperState === 'running'}
              title="Resume: isi hanya baris yang scenario-nya kosong, tanpa download ulang"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg text-sm font-medium transition-colors border border-gray-300"
            >
              <RotateCcw className="w-4 h-4" />
              Resume
            </button>
          </div>
        </div>

        {/* Progress bar + error detail */}
        {scraperProgress && scraperState !== 'idle' && (
          <div className="mt-4 space-y-2">
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span className={scraperProgress.message?.startsWith('❌') ? 'text-red-600 font-medium' : ''}>
                  {scraperProgress.percent}%
                </span>
                {scraperProgress.updatedAt && (
                  <span className="text-gray-400">Updated: {scraperProgress.updatedAt}</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    scraperProgress.message?.startsWith('❌') ? 'bg-red-500' :
                    scraperState === 'done'                   ? 'bg-green-500' :
                    scraperProgress.message?.startsWith('⚠️') ? 'bg-yellow-400' :
                    'bg-indigo-500'
                  }`}
                  style={{ width: `${scraperProgress.percent}%` }}
                />
              </div>
            </div>

            {/* Error detail box */}
            {scraperProgress.message?.startsWith('❌') && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-red-700 mb-1">Detail Error:</p>
                <p className="text-xs text-red-600 font-mono break-all">
                  {scraperProgress.message.replace('❌ ', '')}
                </p>
                <div className="mt-2 text-xs text-red-500 space-y-0.5">
                  <p>Kemungkinan penyebab:</p>
                  <p>• Cookie expired → update cookie via bookmarklet lalu coba lagi</p>
                  <p>• SPX API down → tunggu beberapa menit lalu coba lagi</p>
                  <p>• Timeout → klik Resume untuk melanjutkan tanpa download ulang</p>
                </div>
              </div>
            )}

            {/* Warning detail box */}
            {scraperProgress.message?.startsWith('⚠️') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                <p className="text-xs text-yellow-700">
                  {scraperProgress.message}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  → Klik <strong>Resume</strong> untuk mengisi baris yang belum dapat scenario
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Paket</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.aging24}</p>
              <p className="text-xs text-gray-500">Aging &gt; 24 jam</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">{stats.aging12}</p>
              <p className="text-xs text-gray-500">Aging 12–24 jam</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.zones}</p>
              <p className="text-xs text-gray-500">Zona Aktif</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scenario Breakdown ── */}
      {stats.scenarioList.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
            Breakdown by Scenario
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {stats.scenarioList.map(({ name, count }) => {
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              const isDash = name === '—' || name === '-';
              return (
                <div
                  key={name}
                  className={`rounded-lg border p-3 ${isDash ? 'border-gray-200 bg-gray-50' : 'border-indigo-100 bg-indigo-50'}`}
                >
                  <p className={`text-lg font-bold ${isDash ? 'text-gray-500' : 'text-indigo-700'}`}>
                    {count}
                  </p>
                  <p className="text-xs font-medium text-gray-700 mt-0.5 leading-tight line-clamp-2" title={name}>
                    {name}
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${isDash ? 'bg-gray-400' : 'bg-indigo-500'}`}
                      style={{ width: `${pct}%` }}
                    />
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
          <div>
            <p className="text-sm text-gray-500">
              Menampilkan <strong className="text-gray-800">{filtered.length}</strong> dari <strong className="text-gray-800">{records.length}</strong> paket
              {lastUpdate && <span className="ml-2 text-gray-400">· Last update: {lastUpdate}</span>}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 lg:flex-none lg:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari TN, driver..."
                className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Zone */}
            <select value={filterZone} onChange={e => setFilterZone(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="all">Semua Zone</option>
              {zoneOptions.map(z => <option key={z} value={z}>{z}</option>)}
            </select>

            {/* Filter Status */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="all">Semua Status</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Filter Tag */}
            <select value={filterTag} onChange={e => setFilterTag(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white">
              <option value="all">Semua Tag</option>
              {tagOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Reset */}
            {(search || filterZone !== 'all' || filterStatus !== 'all' || filterTag !== 'all') && (
              <button
                onClick={() => { setSearch(''); setFilterZone('all'); setFilterStatus('all'); setFilterTag('all'); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            )}

            {/* Export */}
            <button onClick={handleExport} disabled={!filtered.length}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
              <Download className="w-4 h-4" /> Export
            </button>

            {/* Refresh */}
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
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-indigo-800 transition-colors select-none ${col.width}`}>
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
                  <tr key={i} className={`hover:bg-indigo-50/40 transition-colors ${parseFloat(row['Expedite Aging Time']) > 24 ? 'bg-red-50/30' : ''}`}>
                    {COLUMNS.map(col => (
                      <td key={col.key} className="px-4 py-3 align-middle">
                        {renderCell(row, col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            <strong className="text-gray-700">{filtered.length}</strong> paket ditampilkan
            {stats.aging24 > 0 && (
              <span className="ml-3 text-red-600 font-medium">⚠ {stats.aging24} paket aging &gt;24 jam perlu segera ditangani</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpeditePage;
