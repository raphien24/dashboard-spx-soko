import { useState, useEffect } from 'react';
import { RefreshCw, X, ExternalLink, CheckCircle, XCircle, AlertTriangle, Calendar } from 'lucide-react';
import { getHSEDailyData } from '../../services/googleSheetsService';

const HSEDailyBriefing = () => {
  const [rows,      setRows]      = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  const fetchData = async () => {
    setIsLoading(true); setError(null);
    try { setRows(await getHSEDailyData()); }
    catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading Daily Briefing...</p>
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

  // Row 0 = headers: [Facility, Weekly Submission, date1, date2, ...]
  const headers = rows[0] || [];
  const dataRows = rows.slice(1);
  const facility   = headers[0] || 'Facility';
  const weekly     = headers[1] || 'Weekly Submission';
  const dates      = headers.slice(2); // date columns

  // Parse % value
  const parsePct = (val) => {
    if (!val) return 0;
    return parseFloat(String(val).replace(',', '.').replace('%', '')) || 0;
  };

  const pctColor = (pct) => {
    if (pct >= 80) return 'text-green-700 bg-green-100';
    if (pct >= 40) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  // Check if a cell value is a Google Drive link
  const isDriveLink = (val) => val && (String(val).startsWith('http') || String(val).startsWith('https'));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Daily Briefing</h2>
          <p className="text-sm text-gray-500 mt-0.5">Status submission briefing harian per fasilitas</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Cards per facility */}
      <div className="space-y-4">
        {dataRows.map((row, ri) => {
          const facilityName = row[0] || `Facility ${ri + 1}`;
          const weeklyPct    = parsePct(row[1]);
          const dayLinks     = row.slice(2); // one per date column

          return (
            <div key={ri} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Facility header */}
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-green-600 to-emerald-600">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{facilityName}</p>
                    <p className="text-xs text-green-100">Daily Safety Briefing</p>
                  </div>
                </div>
                {/* Weekly submission % */}
                <div className="text-right">
                  <p className="text-xs text-green-100 mb-1">Weekly Submission</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${pctColor(weeklyPct)} bg-white/90`}>
                    {row[1] || '0,00%'}
                  </span>
                </div>
              </div>

              {/* Daily submission grid */}
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {dates.map((date, di) => {
                    const cellVal = dayLinks[di] || '';
                    const hasLink = isDriveLink(cellVal);
                    const isEmpty = !cellVal || cellVal.trim() === '';

                    return (
                      <div key={di} className={`rounded-lg border p-3 text-center ${
                        hasLink  ? 'bg-green-50 border-green-200' :
                        isEmpty  ? 'bg-gray-50 border-gray-200' :
                        'bg-yellow-50 border-yellow-200'
                      }`}>
                        <p className="text-xs font-semibold text-gray-600 mb-2">{date}</p>
                        {hasLink ? (
                          <a
                            href={cellVal}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-col items-center gap-1 text-green-700 hover:text-green-800"
                          >
                            <CheckCircle className="w-6 h-6" />
                            <span className="text-xs font-medium flex items-center gap-1">
                              Lihat <ExternalLink className="w-3 h-3" />
                            </span>
                          </a>
                        ) : isEmpty ? (
                          <div className="flex flex-col items-center gap-1 text-gray-400">
                            <XCircle className="w-6 h-6" />
                            <span className="text-xs">Belum</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-yellow-600">
                            <AlertTriangle className="w-6 h-6" />
                            <span className="text-xs truncate w-full text-center" title={cellVal}>{cellVal}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HSEDailyBriefing;
