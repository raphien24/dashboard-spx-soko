import { useState, useEffect } from 'react';
import {
  RefreshCw, X, Play, RotateCcw,
  CheckCircle, XCircle, Loader2, Clock,
  ArrowRight, ArrowLeft, BarChart2, AlertTriangle
} from 'lucide-react';
import { getControlStuckFMData, runControlStuckFMScraper, getControlStuckFMStatus } from '../../services/googleSheetsService';

// ── Warna per status ─────────────────────────────────────────
const STATUS_COLORS = {
  'FMHub_Pickup_done':       { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-400'   },
  'Handedover_to_Station':   { bg: 'bg-cyan-50',    border: 'border-cyan-200',   text: 'text-cyan-700',   dot: 'bg-cyan-400'   },
  'FMHub_Received':          { bg: 'bg-indigo-50',  border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-400' },
  'FMHub_Packing':           { bg: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-400' },
  'FMHub_Packed':            { bg: 'bg-purple-50',  border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-400' },
  'Return_FMHub_Received':   { bg: 'bg-orange-50',  border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-400' },
  'Return_FMHub_Assigning':  { bg: 'bg-amber-50',   border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-400'  },
  'Return_FMHub_Assigned':   { bg: 'bg-yellow-50',  border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  'Return_FMHub_Returning':  { bg: 'bg-rose-50',    border: 'border-rose-200',   text: 'text-rose-700',   dot: 'bg-rose-400'   },
  'Return_FMHub_Onhold':     { bg: 'bg-red-50',     border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-400'    },
  'ESB_Packed':              { bg: 'bg-green-50',   border: 'border-green-200',  text: 'text-green-700',  dot: 'bg-green-400'  },
  'Total':                   { bg: 'bg-gray-100',   border: 'border-gray-300',   text: 'text-gray-800',   dot: 'bg-gray-500'   },
};

const getColor = (key) => STATUS_COLORS[key] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', dot: 'bg-gray-300' };

// Forward statuses (in order)
const FORWARD_STATUSES = [
  'FMHub_Pickup_done',
  'Handedover_to_Station',
  'FMHub_Received',
  'FMHub_Packing',
  'FMHub_Packed',
];

// Reverse statuses (in order)
const REVERSE_STATUSES = [
  'Return_FMHub_Received',
  'Return_FMHub_Assigning',
  'Return_FMHub_Assigned',
  'Return_FMHub_Returning',
  'Return_FMHub_Onhold',
];

const ControlStuckFMPage = () => {
  const [rawHeaders, setRawHeaders] = useState([]);
  const [rawData,    setRawData]    = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');
  const [hubName,    setHubName]    = useState('');
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);

  // Scraper
  const [scraperState,    setScraperState]    = useState('idle');
  const [scraperProgress, setScraperProgress] = useState(null);
  const pollRef = useState(null);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { headers, data } = await getControlStuckFMData();
      setRawHeaders(headers);
      setRawData(data);

      // Row 1 (index 0) = sub-headers (status names)
      // Row 2 (index 1) = actual data values
      if (data.length >= 1) {
        // Hub name is in the first column of the sub-header row
        const firstKey = headers[0] || '';
        setHubName(data[1]?.[firstKey] || data[0]?.[firstKey] || '');
        // Last update from "Last Update [Jam]" column
        setLastUpdate(data[1]?.['Last Update [Jam]'] || data[0]?.['Last Update [Jam]'] || '');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Parse values ───────────────────────────────────────────
  // Map sub-header row (row index 0) → status name → column key
  // Map data row (row index 1) → status name → count value
  const parseStatusValues = () => {
    if (rawData.length < 2) return {};
    const subHeaderRow = rawData[0]; // row 2 in sheet = status names
    const dataRow      = rawData[1]; // row 3 in sheet = values

    // Build: statusName → value
    const result = {};
    rawHeaders.forEach(colKey => {
      const statusName = subHeaderRow[colKey];
      const value      = dataRow[colKey];
      if (statusName && statusName !== 'Hub Name' && statusName !== '') {
        result[statusName] = value || '0';
      }
    });
    return result;
  };

  const statusValues = parseStatusValues();
  const remarks = rawData[1]?.['REMAKS'] || rawData[0]?.['REMAKS'] || '';

  // ── Scraper ────────────────────────────────────────────────
  const startScraper = async (action = 'run') => {
    setScraperState('running');
    setScraperProgress({ percent: 0, message: 'Mengirim perintah ke GAS...', updatedAt: '' });
    if (pollRef[0]) { clearInterval(pollRef[0]); pollRef[0] = null; }
    try {
      await runControlStuckFMScraper(action);
      await new Promise(r => setTimeout(r, 3000));
      const interval = setInterval(async () => {
        try {
          const result = await getControlStuckFMStatus();
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

  // ── Loading / Error ────────────────────────────────────────
  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading Control Stuck FM...</p>
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
    <div className="space-y-5">

      {/* ── Scraper / Update Panel ── */}
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
                {scraperState === 'idle'    && 'Control Stuck FM Scraper'}
                {scraperState === 'running' && 'Update sedang berjalan...'}
                {scraperState === 'done'    && 'Update selesai!'}
                {scraperState === 'error'   && 'Update gagal'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {scraperState === 'idle' && 'Klik "Update" untuk mengambil data terbaru dari SPX'}
                {scraperProgress?.message && scraperState !== 'idle' && scraperProgress.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => startScraper('run')} disabled={scraperState === 'running'}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors">
              {scraperState === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Update
            </button>
            <button onClick={fetchData}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium border border-gray-300">
              <RefreshCw className="w-4 h-4" /> Refresh
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
                <p className="mt-1 text-red-500">• Cookie expired → update via bookmarklet &nbsp;• API down → coba lagi</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Info Card: Hub + Last Update ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Hub</p>
            <p className="text-xl font-bold text-gray-900">{hubName || 'Soko First Mile Hub'}</p>
          </div>
          {lastUpdate && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Last Update</p>
                <p className="text-sm font-semibold text-gray-900">{lastUpdate}</p>
              </div>
            </div>
          )}
        </div>
        {remarks && (
          <div className="mt-3 flex items-start gap-2 px-4 py-2.5 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 font-medium">{remarks}</p>
          </div>
        )}
      </div>

      {/* ── Forward Section ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <ArrowRight className="w-5 h-5 text-white" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Forward</h3>
          <span className="text-blue-200 text-xs">Paket masuk ke FM Hub</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 divide-x divide-y divide-gray-100">
          {FORWARD_STATUSES.map(status => {
            const color = getColor(status);
            const value = statusValues[status] ?? '—';
            const numVal = parseInt(value) || 0;
            return (
              <div key={status} className={`p-5 ${color.bg}`}>
                <div className={`w-2 h-2 rounded-full ${color.dot} mb-3`} />
                <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
                <p className={`text-xs font-medium ${color.text} leading-snug`}>
                  {status.replace(/_/g, ' ')}
                </p>
                {numVal > 0 && (
                  <div className={`mt-2 h-1 rounded-full ${color.dot} opacity-30`}
                    style={{ width: '100%' }}>
                    <div className={`h-1 rounded-full ${color.dot}`}
                      style={{ width: `${Math.min(numVal * 10, 100)}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Reverse Section ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-red-500">
          <ArrowLeft className="w-5 h-5 text-white" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Reverse</h3>
          <span className="text-orange-100 text-xs">Paket return di FM Hub</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-0 divide-x divide-y divide-gray-100">
          {REVERSE_STATUSES.map(status => {
            const color = getColor(status);
            const value = statusValues[status] ?? '—';
            const numVal = parseInt(value) || 0;
            return (
              <div key={status} className={`p-5 ${color.bg}`}>
                <div className={`w-2 h-2 rounded-full ${color.dot} mb-3`} />
                <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
                <p className={`text-xs font-medium ${color.text} leading-snug`}>
                  {status.replace(/_/g, ' ')}
                </p>
                {numVal > 0 && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                    <div className={`h-1 rounded-full ${color.dot}`}
                      style={{ width: `${Math.min(numVal * 10, 100)}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Total Card ── */}
      {statusValues['Total'] !== undefined && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-6 h-6 text-gray-300" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total Stuck</p>
              <p className="text-4xl font-bold text-white mt-0.5">{statusValues['Total']}</p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Forward + Reverse</p>
            <p className="mt-1 text-gray-500">Combined count</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default ControlStuckFMPage;
