import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Search, Download, X, FileText, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { getSPRecordData } from '../../services/googleSheetsService';

// Columns to display (in order)
const COLUMNS = [
  { key: 'No',                    label: 'No',                   width: 'w-12'   },
  { key: 'No Surat',              label: 'No Surat',             width: 'w-44'   },
  { key: 'Tanggal',               label: 'Tanggal',              width: 'w-32'   },
  { key: 'Nama',                  label: 'Nama',                 width: 'w-40'   },
  { key: 'Jabatan',               label: 'Jabatan',              width: 'w-32'   },
  { key: 'Jenis Pelanggaran',     label: 'Jenis Pelanggaran',    width: 'w-40'   },
  { key: 'Deskripsi pelanggaran', label: 'Deskripsi',            width: 'w-64'   },
  { key: 'Jenis SP',              label: 'Jenis SP',             width: 'w-24'   },
  { key: 'Berakhir sampai',       label: 'Berakhir Sampai',      width: 'w-32'   },
  { key: 'Link pdf',              label: 'Dokumen PDF',          width: 'w-28'   },
];

// SP badge colors
const SP_COLORS = {
  'SP-I':  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'SP-II': 'bg-orange-100 text-orange-800 border-orange-200',
  'SP-III':'bg-red-100    text-red-800    border-red-200',
};

// Format date from YYYY-MM-DD to "16 Sep 2026"
const formatDate = (val) => {
  if (!val) return '-';
  const d = new Date(val);
  if (isNaN(d)) return val;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const SPRecord = () => {
  const [records,   setRecords]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  // Filters
  const [search,     setSearch]     = useState('');
  const [filterSP,   setFilterSP]   = useState('all');
  const [filterJenis,setFilterJenis]= useState('all');

  // Sort
  const [sortKey, setSortKey] = useState('No');
  const [sortDir, setSortDir] = useState('asc');

  // ── Fetch ────────────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSPRecordData();
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Derived filter options ────────────────────────────────
  const spOptions    = useMemo(() => [...new Set(records.map(r => r['Jenis SP']).filter(Boolean))].sort(), [records]);
  const jenisOptions = useMemo(() => [...new Set(records.map(r => r['Jenis Pelanggaran']).filter(Boolean))].sort(), [records]);

  // ── Filtered + sorted data ────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...records];

    if (filterSP !== 'all')    data = data.filter(r => r['Jenis SP'] === filterSP);
    if (filterJenis !== 'all') data = data.filter(r => r['Jenis Pelanggaran'] === filterJenis);

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r =>
        COLUMNS.some(col => String(r[col.key] ?? '').toLowerCase().includes(q))
      );
    }

    data.sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      // Numeric sort for "No"
      if (sortKey === 'No') return sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return data;
  }, [records, search, filterSP, filterJenis, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  // ── CSV Export ───────────────────────────────────────────
  const handleExport = () => {
    if (!filtered.length) return;
    const headers = COLUMNS.map(c => c.label);
    const rows = filtered.map(r => COLUMNS.map(c => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `SP-Record-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── Render cell ──────────────────────────────────────────
  const renderCell = (row, col) => {
    const val = row[col.key];

    if (col.key === 'Link pdf') {
      return val ? (
        <a
          href={val}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-medium transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          Lihat PDF
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : <span className="text-gray-300 text-xs">—</span>;
    }

    if (col.key === 'Jenis SP') {
      const colorClass = SP_COLORS[val] || 'bg-gray-100 text-gray-700 border-gray-200';
      return val ? (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
          {val}
        </span>
      ) : '—';
    }

    if (col.key === 'Tanggal' || col.key === 'Berakhir sampai') {
      return <span className="text-gray-600">{formatDate(val)}</span>;
    }

    if (col.key === 'Deskripsi pelanggaran') {
      return (
        <span className="block max-w-xs text-gray-600 leading-relaxed" title={val}>
          {val || '—'}
        </span>
      );
    }

    return <span className="text-gray-700">{val || '—'}</span>;
  };

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading SP Records...</p>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────
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

  // ── Main render ──────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">

          {/* Title */}
          <div>
            <h2 className="text-lg font-bold text-gray-900">SP Record Database</h2>
            <p className="text-sm text-gray-500">
              {filtered.length} dari {records.length} record
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">

            {/* Search */}
            <div className="relative flex-1 lg:flex-none lg:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama, no surat..."
                className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Jenis SP */}
            <select
              value={filterSP}
              onChange={e => setFilterSP(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="all">Semua Jenis SP</option>
              {spOptions.map(sp => (
                <option key={sp} value={sp}>{sp}</option>
              ))}
            </select>

            {/* Filter Jenis Pelanggaran */}
            <select
              value={filterJenis}
              onChange={e => setFilterJenis(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="all">Semua Pelanggaran</option>
              {jenisOptions.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>

            {/* Reset filters */}
            {(search || filterSP !== 'all' || filterJenis !== 'all') && (
              <button
                onClick={() => { setSearch(''); setFilterSP('all'); setFilterJenis('all'); }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            )}

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={!filtered.length}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>

            {/* Refresh */}
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            {/* Header */}
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-indigo-800 transition-colors select-none ${col.width}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.label}
                      {sortKey === col.key
                        ? sortDir === 'asc'
                          ? <ChevronUp className="w-3.5 h-3.5 text-indigo-200" />
                          : <ChevronDown className="w-3.5 h-3.5 text-indigo-200" />
                        : <ChevronUp className="w-3.5 h-3.5 text-indigo-400 opacity-40" />
                      }
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 text-gray-200" />
                      <p className="text-gray-500 font-medium">Tidak ada data</p>
                      <p className="text-xs text-gray-400">Coba ubah filter atau kata kunci pencarian</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => (
                  <tr key={i} className="hover:bg-indigo-50/40 transition-colors">
                    {COLUMNS.map(col => (
                      <td key={col.key} className="px-4 py-3 align-top">
                        {renderCell(row, col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <span>Total <strong className="text-gray-700">{filtered.length}</strong> record ditampilkan</span>
            <a
              href="https://docs.google.com/spreadsheets/d/1sTSltnZ68zxkvqV6_IldXaW9XhddyribC6ne5jKMJFE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              Lihat Google Sheets <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SPRecord;
