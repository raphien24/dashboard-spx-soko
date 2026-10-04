import { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw, Search, X, Download, Image,
  ChevronUp, ChevronDown, Package, Play,
  RotateCcw, CheckCircle, XCircle, Loader2,
  Activity, BarChart3, Clock, Layers
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { getMonitorSDHOData, runMonitorSDHOScraper, getMonitorSDHOScraperStatus } from '../../services/googleSheetsService';

// Kolom A:G detail
const DETAIL_COLS = [
  { key: 'SPX Tracking Number', label: 'Tracking Number', width: 'min-w-[160px]' },
  { key: 'Pickup Point Name',   label: 'Pickup Point',    width: 'min-w-[150px]' },
  { key: 'Pickup Attempts',     label: 'Attempts',        width: 'min-w-[90px]'  },
  { key: 'ETA',                 label: 'ETA',             width: 'min-w-[140px]' },
  { key: 'Status',              label: 'Status',          width: 'min-w-[110px]' },
  { key: 'Created Time',        label: 'Created',         width: 'min-w-[140px]' },
  { key: 'Last Update',         label: 'Last Update',     width: 'min-w-[150px]' },
];

// Warna card summary berdasarkan status
const summaryCardStyle = (status) => {
  if (!status) return { border: 'border-gray-200', bg: 'bg-gray-50', icon: 'text-gray-500', iconBg: 'bg-gray-100', text: 'text-gray-700' };
  const s = String(status).toLowerCase();
  if (s.includes('total'))    return { border: 'border-indigo-200', bg: 'bg-indigo-50', icon: 'text-indigo-600', iconBg: 'bg-indigo-100', text: 'text-indigo-700' };
  if (s.includes('assigned')) return { border: 'border-green-200',  bg: 'bg-green-50',  icon: 'text-green-600',  iconBg: 'bg-green-100',  text: 'text-green-700'  };
  if (s.includes('created'))  return { border: 'border-blue-200',   bg: 'bg-blue-50',   icon: 'text-blue-600',   iconBg: 'bg-blue-100',   text: 'text-blue-700'   };
  return { border: 'border-gray-200', bg: 'bg-gray-50', icon: 'text-gray-500', iconBg: 'bg-gray-100', text: 'text-gray-700' };
};

const summaryIcon = (status) => {
  const s = String(status).toLowerCase();
  if (s.includes('total'))    return Layers;
  if (s.includes('assigned')) return CheckCircle;
  if (s.includes('created'))  return Clock;
  return BarChart3;
};

const MonitorSDHOPage = () => {
  const [detail,      setDetail]      = useState([]);
  const [summary,     setSummary]     = useState([]);
  const [lastUpdate,  setLastUpdate]  = useState(null);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState(null);

  // Scraper
  const [scraperState,    setScraperState]    = useState('idle');
  const [scraperProgress, setScraperProgress] = useState(null);
  const pollRef = useState(null);

  // Filters
  const [search,       setSearch]       = useState('');
  const [filterPickup, setFilterPickup] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sort
  const [sortKey, setSortKey] = useState('ETA');
  const [sortDir, setSortDir] = useState('asc');

  // ── Fetch ─────────────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { detail: d, summary: s } = await getMonitorSDHOData();
      setDetail(d);
      setSummary(s);
      // Last update dari summary TOTAL row
      const totalRow = s.find(r => String(r['Status']).includes('TOTAL'));
      if (totalRow?.['Last Update']) setLastUpdate(totalRow['Last Update']);
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
      await runMonitorSDHOScraper(action);
      await new Promise(r => setTimeout(r, 3000));
      const interval = setInterval(async () => {
        try {
          const result = await getMonitorSDHOScraperStatus();
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

  // ── Filter options ─────────────────────────────────────────
  const pickupOptions = useMemo(() => [...new Set(detail.map(r => r['Pickup Point Name']).filter(Boolean))].sort(), [detail]);
  const statusOptions = useMemo(() => [...new Set(detail.map(r => r['Status']).filter(Boolean))].sort(), [detail]);

  // ── Filtered + sorted ──────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...detail];
    if (filterPickup !== 'all') data = data.filter(r => r['Pickup Point Name'] === filterPickup);
    if (filterStatus !== 'all') data = data.filter(r => r['Status']            === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r => DETAIL_COLS.some(c => String(r[c.key] ?? '').toLowerCase().includes(q)));
    }
    data.sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      if (sortKey === 'Pickup Attempts') return sortDir === 'asc' ? parseInt(av) - parseInt(bv) : parseInt(bv) - parseInt(av);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return data;
  }, [detail, filterPickup, filterStatus, search, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ── Export CSV ─────────────────────────────────────────────
  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = DETAIL_COLS.map(c => c.label);
    const rows = filtered.map(r => DETAIL_COLS.map(c => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `MonitorSDHO-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── Export PNG ─────────────────────────────────────────────
  const exportToPng = async () => {
    if (!filtered.length) return;
    const now     = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const summaryHtml = summary.map(s => {
      const style = summaryCardStyle(s['Status']);
      return `
        <div style="flex:1;min-width:140px;border:1px solid #e5e7eb;border-radius:10px;padding:12px 16px;background:#fff;">
          <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;">${s['Status'] || ''}</div>
          <div style="font-size:28px;font-weight:700;color:#1e293b;margin:4px 0;">${s['Total Count'] || '0'}</div>
          <div style="font-size:10px;color:#94a3b8;">${s['Mode'] || ''} · ${s['Last Update'] || ''}</div>
        </div>
      `;
    }).join('');

    const tbodyHtml = filtered.map((row, i) => `
      <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8f9ff'};">
        ${DETAIL_COLS.map(col => `
          <td style="padding:7px 12px;font-size:12px;color:#374151;border-bottom:1px solid #e5e7eb;white-space:nowrap;">
            ${row[col.key] || '—'}
          </td>
        `).join('')}
      </tr>
    `).join('');

    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;background:#fff;width:100%;">
        <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:20px 24px;color:#fff;">
          <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;opacity:.7;margin-bottom:6px;">SPX SOKO — Monitor SDHO</div>
          <div style="font-size:18px;font-weight:700;">Monitor SDHO</div>
          <div style="font-size:12px;opacity:.8;margin-top:4px;">${dateStr} · Export: ${timeStr} WIB</div>
        </div>
        <div style="padding:16px 24px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
          <div style="font-size:11px;font-weight:600;color:#475569;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;">Summary</div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">${summaryHtml}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#0f172a;">
              ${DETAIL_COLS.map(col => `
                <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#fff;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;">${col.label}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>${filtered.length > 0 ? tbodyHtml : `
            <tr><td colspan="${DETAIL_COLS.length}" style="padding:32px;text-align:center;color:#94a3b8;font-size:13px;">Belum ada data detail</td></tr>
          `}</tbody>
        </table>
        <div style="background:#f8fafc;border-top:2px solid #e2e8f0;padding:10px 24px;display:flex;justify-content:space-between;">
          <span style="font-size:11px;color:#94a3b8;">SPX SOKO Dashboard · spxsoko.online</span>
          <span style="font-size:11px;color:#94a3b8;">Made with ❤️</span>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;background:#fff;z-index:-1;width:900px;';
    container.innerHTML = html;
    document.body.appendChild(container);
    try {
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
      const a = document.createElement('a');
      a.download = `MonitorSDHO-${new Date().toISOString().split('T')[0]}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (err) {
      console.error('Export PNG error:', err);
    } finally {
      document.body.removeChild(container);
    }
  };

  // ── Loading / Error ────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading Monitor SDHO...</p>
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
            {scraperState === 'idle'    && <Activity className="w-5 h-5 text-gray-400" />}
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {scraperState === 'idle'    && 'Monitor SDHO Scraper'}
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
                <p className="mt-1 text-red-500">• Cookie expired → update via bookmarklet &nbsp;• API down → coba lagi &nbsp;• Timeout → klik Resume</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Summary Cards (kolom I:L) ── */}
      {summary.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {summary.map((row, i) => {
            const style = summaryCardStyle(row['Status']);
            const Icon  = summaryIcon(row['Status']);
            return (
              <div key={i} className={`bg-white rounded-xl shadow-sm border ${style.border} p-5`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${style.iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${style.icon}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${style.text}`}>{row['Total Count'] || '0'}</p>
                    <p className="text-xs text-gray-500">{row['Status']}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-2">
                  <span>{row['Mode'] || ''}</span>
                  <span>{row['Last Update'] || ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tabel Detail (kolom A:G) ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                Data Detail
                <span className="ml-1 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full font-medium">
                  {filtered.length}
                </span>
              </h3>
              {lastUpdate && (
                <p className="text-xs text-gray-400 mt-0.5">Last update: {lastUpdate}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari TN, pickup point..."
                  className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm w-52 focus:ring-2 focus:ring-indigo-500" />
                {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-4 h-4" /></button>}
              </div>

              {/* Filter Pickup Point */}
              <select value={filterPickup} onChange={e => setFilterPickup(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                <option value="all">Semua Pickup Point</option>
                {pickupOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {/* Filter Status */}
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500">
                <option value="all">Semua Status</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Reset */}
              {(search || filterPickup !== 'all' || filterStatus !== 'all') && (
                <button onClick={() => { setSearch(''); setFilterPickup('all'); setFilterStatus('all'); }}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <X className="w-3.5 h-3.5" /> Reset
                </button>
              )}

              {/* Export CSV */}
              <button onClick={exportCSV} disabled={!filtered.length}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium">
                <Download className="w-4 h-4" /> CSV
              </button>

              {/* Export PNG */}
              <button onClick={exportToPng}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                <Image className="w-4 h-4" /> PNG
              </button>

              {/* Refresh */}
              <button onClick={fetchData}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                {DETAIL_COLS.map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-600 select-none ${col.width}`}>
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {sortKey === col.key
                        ? sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-slate-300" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                        : <ChevronUp className="w-3.5 h-3.5 opacity-30" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={DETAIL_COLS.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="w-12 h-12 text-gray-200" />
                      <p className="text-gray-500 font-medium">
                        {detail.length === 0 ? 'Belum ada data detail — jalankan scraper untuk mengisi data' : 'Tidak ada data sesuai filter'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={i} className="hover:bg-indigo-50/30 transition-colors">
                    {DETAIL_COLS.map(col => (
                      <td key={col.key} className="px-4 py-3 align-middle">
                        {col.key === 'SPX Tracking Number'
                          ? <span className="font-mono text-xs font-medium text-gray-800">{row[col.key] || '—'}</span>
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

        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            <strong className="text-gray-700">{filtered.length}</strong> record ditampilkan
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorSDHOPage;
