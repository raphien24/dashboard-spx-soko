import { useState, useMemo } from 'react';
import {
  Search, X, Download, ChevronUp, ChevronDown, Package, RefreshCw
} from 'lucide-react';

const SDHODataTable = ({ 
  title, 
  data, 
  columns, 
  statusColor = 'indigo',
  onRefresh 
}) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(columns[0]?.key || '');
  const [sortDir, setSortDir] = useState('asc');

  // Filter dan sort
  const filtered = useMemo(() => {
    let result = [...data];
    
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(row => 
        columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
      );
    }
    
    // Sort
    result.sort((a, b) => {
      const av = String(a[sortKey] ?? '');
      const bv = String(b[sortKey] ?? '');
      
      // Numeric sort for "Attempts"
      if (sortKey.includes('Attempts')) {
        return sortDir === 'asc' 
          ? parseInt(av || 0) - parseInt(bv || 0)
          : parseInt(bv || 0) - parseInt(av || 0);
      }
      
      // String sort
      return sortDir === 'asc' 
        ? av.localeCompare(bv) 
        : bv.localeCompare(av);
    });
    
    return result;
  }, [data, search, sortKey, sortDir, columns]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // Export CSV
  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = columns.map(c => c.label);
    const rows = filtered.map(r => 
      columns.map(c => `"${String(r[c.key] ?? '').replace(/"/g, '""')}"`)
    );
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div>
            <h3 className={`text-base font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2`}>
              <Package className={`w-4 h-4 text-${statusColor}-600`} />
              {title}
              <span className={`ml-1 px-2 py-0.5 text-xs bg-${statusColor}-100 dark:bg-${statusColor}-950 text-${statusColor}-700 rounded-full font-medium`}>
                {filtered.length}
              </span>
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
              Total {data.length} records
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
              <input 
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 w-52 focus:ring-2 focus:ring-indigo-500" 
              />
              {search && (
                <button 
                  onClick={() => setSearch('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Export CSV */}
            <button 
              onClick={exportCSV} 
              disabled={!filtered.length}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
            >
              <Download className="w-4 h-4" /> CSV
            </button>

            {/* Refresh */}
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className={`flex items-center gap-1.5 px-3 py-2 bg-${statusColor}-600 hover:bg-${statusColor}-700 text-white rounded-lg text-sm font-medium`}
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
              {columns.map(col => (
                <th 
                  key={col.key} 
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-slate-600 select-none ${col.width}`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === 'asc' 
                        ? <ChevronUp className="w-3.5 h-3.5 text-slate-300" /> 
                        : <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 opacity-30" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Package className="w-12 h-12 text-gray-200" />
                    <p className="text-gray-500 dark:text-slate-500 font-medium">
                      {data.length === 0 
                        ? 'Belum ada data — jalankan scraper untuk mengisi data' 
                        : 'Tidak ada data sesuai pencarian'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={i} className={`hover:bg-${statusColor}-50 dark:hover:bg-slate-800/30 transition-colors`}>
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3 align-middle">
                      {col.key.includes('Order Number') || col.key.includes('Task ID') ? (
                        <span className="font-mono text-xs font-medium text-gray-800 dark:text-slate-200">
                          {row[col.key] || '—'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-700 dark:text-slate-300 whitespace-nowrap">
                          {row[col.key] || '—'}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-500">
          <strong className="text-gray-700 dark:text-slate-300">{filtered.length}</strong> record{filtered.length !== 1 && 's'} ditampilkan
          {filtered.length !== data.length && ` dari ${data.length} total`}
        </div>
      )}
    </div>
  );
};

export default SDHODataTable;
