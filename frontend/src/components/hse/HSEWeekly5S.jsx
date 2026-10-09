import { useState, useEffect } from 'react';
import { RefreshCw, X, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { getHSEWeeklyData } from '../../services/googleSheetsService';

const HSEWeekly5S = () => {
  const [rows,      setRows]      = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  const fetchData = async () => {
    setIsLoading(true); setError(null);
    try { setRows(await getHSEWeeklyData()); }
    catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading Weekly 5S...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <X className="w-5 h-5 text-red-600 mt-0.5" />
        <div>
          <p className="font-semibold text-red-900 mb-1">Gagal memuat data</p>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Coba Lagi
          </button>
        </div>
      </div>
    </div>
  );

  if (rows.length === 0) return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
      <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500">Tidak ada data</p>
    </div>
  );

  // Row 0 = headers, Row 1+ = data
  const headers  = rows[0] || [];
  const dataRows = rows.slice(1);

  // Detect if a value is a URL
  const isUrl  = (v) => v && (String(v).startsWith('http://') || String(v).startsWith('https://'));
  // Detect if it looks like a checklist (✓ / ✗ / Yes / No / ya / tidak)
  const isCheck = (v) => /^(✓|✔|yes|ya|true|1)$/i.test(String(v).trim());
  const isCross = (v) => /^(✗|✘|no|tidak|false|0)$/i.test(String(v).trim());

  const renderCell = (val) => {
    if (!val || String(val).trim() === '') return <span className="text-gray-300 text-xs">—</span>;
    if (isUrl(val)) return (
      <a href={val} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-xs font-medium">
        <CheckCircle className="w-4 h-4" />
        <ExternalLink className="w-3 h-3" />
      </a>
    );
    if (isCheck(val)) return <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />;
    if (isCross(val)) return <XCircle className="w-5 h-5 text-red-500 mx-auto" />;
    return <span className="text-xs text-gray-700 break-words">{val}</span>;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Weekly 5S</h2>
          <p className="text-sm text-gray-500 mt-0.5">Checklist kebersihan dan keselamatan mingguan</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-green-600 to-emerald-700 text-white">
                {headers.map((h, i) => (
                  <th key={i}
                    className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                    {h || `Col ${i + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dataRows.length === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertTriangle className="w-10 h-10 text-gray-200" />
                      <p className="text-gray-400 text-sm">Belum ada data 5S untuk minggu ini</p>
                    </div>
                  </td>
                </tr>
              ) : (
                dataRows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-green-50/30 transition-colors">
                    {headers.map((_, ci) => (
                      <td key={ci} className="px-3 py-3 align-middle">
                        {renderCell(row[ci])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HSEWeekly5S;
