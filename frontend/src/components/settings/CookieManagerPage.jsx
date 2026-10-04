import { useState, useEffect } from 'react';
import {
  RefreshCw, X, Cookie, CheckCircle, AlertTriangle,
  Eye, EyeOff, Copy, Check, Clock, ShieldCheck, ShieldX
} from 'lucide-react';
import { getConfigData } from '../../services/googleSheetsService';

const CookieManagerPage = () => {
  const [cookies,     setCookies]     = useState([]);
  const [validStatus, setValidStatus] = useState('');
  const [codeInfo,    setCodeInfo]    = useState('');
  const [lastUpdate,  setLastUpdate]  = useState('');
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState(null);
  const [showValues,  setShowValues]  = useState(false);
  const [copiedKey,   setCopiedKey]   = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getConfigData();
      setCookies(data.cookies);
      setValidStatus(data.validStatus);
      setCodeInfo(data.codeInfo);
      setLastUpdate(data.lastUpdate);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCopy = (value, key) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  // Mask value — tampilkan 4 karakter pertama dan terakhir
  const maskValue = (val) => {
    if (!val || val.length <= 8) return '••••••••';
    return val.substring(0, 4) + ' •••••••••••• ' + val.substring(val.length - 4);
  };

  const isValid = String(validStatus).toUpperCase().includes('VALID');

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading Cookie Manager...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <X className="w-5 h-5 text-red-600 mt-0.5" />
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
    <div className="space-y-5 max-w-3xl">

      {/* ── Header Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Top banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Cookie Manager</h2>
                <p className="text-indigo-200 text-xs mt-0.5">Status cookie SPX FMS Portal</p>
              </div>
            </div>
            <button onClick={fetchData}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm font-medium transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Status + Last Update */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Valid Status (kolom G) */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            isValid
              ? 'bg-green-50 border-green-200'
              : validStatus
              ? 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            {isValid
              ? <ShieldCheck className="w-8 h-8 text-green-500 flex-shrink-0" />
              : <ShieldX className="w-8 h-8 text-red-500 flex-shrink-0" />
            }
            <div>
              <p className={`text-sm font-bold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
                {validStatus || 'Status tidak diketahui'}
              </p>
              {codeInfo && (
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{codeInfo}</p>
              )}
            </div>
          </div>

          {/* Last Update (H2) */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
            <Clock className="w-8 h-8 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Terakhir Diperbarui</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {lastUpdate || '—'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">via bookmarklet</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Cara Update ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-1">Cara update cookie:</p>
          <p>Gunakan <strong>bookmarklet</strong> di browser yang sudah login ke SPX FMS Portal. Cookie akan otomatis terupdate di spreadsheet dan status di atas akan berubah.</p>
        </div>
      </div>

      {/* ── Cookie Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              Cookie Keys
              <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">{cookies.length}</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Kolom A–C dari sheet Config</p>
          </div>
          <button
            onClick={() => setShowValues(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showValues ? 'Sembunyikan' : 'Tampilkan'} nilai
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {cookies.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Cookie className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Tidak ada cookie ditemukan</p>
            </div>
          ) : (
            cookies.map((cookie, i) => {
              const isCopied  = copiedKey === cookie.nama;
              const hasValue  = cookie.value && cookie.value.length > 4;

              return (
                <div key={i} className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors group">

                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    hasValue ? (isValid ? 'bg-green-400' : 'bg-yellow-400') : 'bg-red-400'
                  }`} />

                  {/* Key + description */}
                  <div className="w-44 flex-shrink-0">
                    <p className="text-sm font-mono font-semibold text-gray-800">{cookie.nama}</p>
                    {cookie.keterangan && (
                      <p className="text-xs text-gray-400 mt-0.5">{cookie.keterangan}</p>
                    )}
                  </div>

                  {/* Value */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-mono truncate ${
                      showValues ? 'text-gray-700' : 'text-gray-400 select-none'
                    }`}>
                      {showValues ? cookie.value : maskValue(cookie.value)}
                    </p>
                  </div>

                  {/* Copy button */}
                  <button
                    onClick={() => handleCopy(cookie.value, cookie.nama)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 rounded-lg transition-all"
                  >
                    {isCopied
                      ? <><Check className="w-3.5 h-3.5 text-green-600" /> Copied!</>
                      : <><Copy className="w-3.5 h-3.5" /> Copy</>
                    }
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-400 flex items-center justify-between">
          <span>{cookies.length} cookie keys terdaftar</span>
          <a
            href="https://docs.google.com/spreadsheets/d/1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0/edit"
            target="_blank" rel="noopener noreferrer"
            className="text-indigo-500 hover:text-indigo-700 font-medium"
          >
            Buka Google Sheets →
          </a>
        </div>
      </div>

    </div>
  );
};

export default CookieManagerPage;
