import { useState, useEffect } from 'react';
import {
  RefreshCw, X, RotateCcw,
  CheckCircle, XCircle, Loader2, Clock,
  ArrowRight, ArrowLeft, BarChart2, AlertTriangle
} from 'lucide-react';
import { getControlStuckFMData, runControlStuckFMScraper, getControlStuckFMStatus } from '../../services/googleSheetsService';

/**
 * Struktur sheet A1:P3 (index 0-15):
 *
 * idx  subHeader (row2)                    data (row3)
 *  0   Hub Name                            Soko First Mile Hub
 *  1   FMHub_Pickup_done                   nilai
 *  2   FMhub_Pickup_Handedover_to_Station  nilai
 *  3   FMHub_Received                      nilai
 *  4   FMHub_Packing                       nilai
 *  5   FMHub_Packed                        nilai
 *  6   (kosong/separator)
 *  7   Return_FMHub_Received               nilai
 *  8   Return_FMHub_Assigning              nilai
 *  9   Return_FMHub_Assigned               nilai
 * 10   Return_FMHub_Returning              nilai
 * 11   Return_FMHub_Onhold                 nilai
 * 12   Total                               nilai
 * 13   REMAKS
 * 14   Update 1 (Last Update)              jam
 * 15   Update 2                            jam
 */

const FORWARD = [
  { idx: 1,  label: 'FMHub Pickup Done',       short: 'Pickup Done'   },
  { idx: 2,  label: 'Handedover to Station',    short: 'Handedover'    },
  { idx: 3,  label: 'FMHub Received',           short: 'Received'      },
  { idx: 4,  label: 'FMHub Packing',            short: 'Packing'       },
  { idx: 5,  label: 'FMHub Packed',             short: 'Packed'        },
];

const REVERSE = [
  { idx: 7,  label: 'Return Received',          short: 'Received'      },
  { idx: 8,  label: 'Return Assigning',         short: 'Assigning'     },
  { idx: 9,  label: 'Return Assigned',          short: 'Assigned'      },
  { idx: 10, label: 'Return Returning',         short: 'Returning'     },
  { idx: 11, label: 'Return Onhold',            short: 'Onhold'        },
];

// Warna per index
const COLORS = [
  null,
  { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400',   val: 'text-blue-900'   }, // 1 pickup done
  { bg: 'bg-cyan-50',   text: 'text-cyan-700',   dot: 'bg-cyan-400',   val: 'text-cyan-900'   }, // 2 handedover
  { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-400', val: 'text-indigo-900' }, // 3 received
  { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-400', val: 'text-violet-900' }, // 4 packing
  { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-400', val: 'text-purple-900' }, // 5 packed
  null,
  { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-400', val: 'text-orange-900' }, // 7
  { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  val: 'text-amber-900'  }, // 8
  { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-400', val: 'text-yellow-900' }, // 9
  { bg: 'bg-rose-50',   text: 'text-rose-700',   dot: 'bg-rose-400',   val: 'text-rose-900'   }, // 10
  { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-400',    val: 'text-red-900'    }, // 11
];

const ControlStuckFMPage = () => {
  const [subHeaders,  setSubHeaders]  = useState([]);
  const [dataRow,     setDataRow]     = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [error,       setError]       = useState(null);

  // Scraper
  const [scraperState,    setScraperState]    = useState('idle');
  const [scraperProgress, setScraperProgress] = useState(null);
  const pollRef = useState(null);

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
      const { subHeaders: sh, data: d } = await getControlStuckFMData();
      setSubHeaders(sh);
      setDataRow(d);
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
      await runControlStuckFMScraper(action);
      await new Promise(r => setTimeout(r, 3000));
      const startedAt = Date.now();
      const interval = setInterval(async () => {
        try {
          const result  = await getControlStuckFMStatus();
          if (!result) return;
          if (result.status) setScraperProgress(result.status);

          const elapsed = Date.now() - startedAt;
          const isIdle  = result.command === 'IDLE';
          const msg     = result.status?.message || '';

          // Selesai jika: percent 100, pesan ✅, atau IDLE setelah 30 detik
          const done = result.isDone ||
                       result.status?.percent >= 100 ||
                       msg.startsWith('✅') ||
                       (isIdle && elapsed > 30000);

          if (done) {
            clearInterval(interval); pollRef[0] = null;
            const isError = msg.startsWith('❌');
            setScraperState(isError ? 'error' : 'done');
            setScraperProgress(prev => ({
              percent:    100,
              message:    isError ? msg : (msg.startsWith('✅') ? msg : '✅ Update selesai!'),
              updatedAt:  result.status?.updatedAt || prev?.updatedAt || '',
            }));
            if (!isError) setTimeout(() => fetchData(), 2000);
          } else if (result.isRunning || result.command === 'RUNNING') {
            setScraperState('running');
          }
        } catch (_) {}
      }, 3000);
      pollRef[0] = interval;
    } catch (err) {
      setScraperState('error');
      setScraperProgress({ percent: 0, message: '❌ ' + err.message, updatedAt: '' });
    }
  };

  useEffect(() => () => { if (pollRef[0]) clearInterval(pollRef[0]); }, []);

  // ── Helpers ────────────────────────────────────────────────
  const val = (idx) => dataRow[idx] !== undefined && dataRow[idx] !== '' ? dataRow[idx] : '0';
  const hubName    = dataRow[0]  || 'Soko First Mile Hub';
  const total      = val(12);
  const remarks    = dataRow[13] || '';
  const update1    = dataRow[14] || '';
  const update2    = dataRow[15] || '';

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
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium">
              {scraperState === 'running' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Update
            </button>
            <button onClick={() => startScraper('resume')} disabled={scraperState === 'running'}
              title="Resume: lanjutkan tanpa fetch ulang dari awal"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-lg text-sm font-medium border border-gray-300">
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
                  {scraperProgress?.percent > 0 ? `${scraperProgress.percent}%` : 'Menunggu progress...'}
                </span>
                {scraperProgress?.updatedAt && <span className="text-gray-400">Updated: {scraperProgress.updatedAt}</span>}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                {scraperProgress?.percent > 0 ? (
                  <div className={`h-2.5 rounded-full transition-all duration-500 ${
                    scraperProgress.message?.startsWith('❌') ? 'bg-red-500' :
                    scraperState === 'done' ? 'bg-green-500' :
                    scraperProgress.message?.startsWith('⚠️') ? 'bg-yellow-400' : 'bg-indigo-500'
                  }`} style={{ width: `${scraperProgress.percent}%` }} />
                ) : (
                  /* Animated indeterminate bar saat percent masih 0 */
                  <div className="h-2.5 bg-indigo-500 rounded-full animate-pulse w-1/3" 
                    style={{ animation: 'slideRight 1.5s ease-in-out infinite' }} />
                )}
              </div>
            </div>
            {scraperProgress?.message && scraperProgress.message !== 'Mengirim perintah ke GAS...' && scraperProgress.message !== 'Memulai...' && (
              <p className="text-xs text-gray-600 font-mono bg-gray-50 px-3 py-2 rounded-lg border">
                {scraperProgress.message}
              </p>
            )}
            {scraperProgress?.message?.startsWith('❌') && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-xs text-red-600">
                <p className="font-semibold mb-1">Detail Error:</p>
                <p className="font-mono break-all">{scraperProgress.message.replace('❌ ', '')}</p>
                <p className="mt-1 text-red-500">• Cookie expired → update via bookmarklet &nbsp;• API down → coba lagi &nbsp;• Timeout → klik Resume</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Hub Info + Last Update ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Hub</p>
            <p className="text-xl font-bold text-gray-900">{hubName}</p>
          </div>
          <div className="flex items-center gap-3">
            {update1 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-200">
                <Clock className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="text-xs text-indigo-500">Update 1 (max 16.00)</p>
                  <p className="text-sm font-bold text-indigo-800">{update1}</p>
                </div>
              </div>
            )}
            {update2 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Update 2 (max 01.00)</p>
                  <p className="text-sm font-bold text-gray-800">{update2}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {remarks && remarks !== '( ISI SESUAI CONTOH KOLOM T )' && (
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y divide-gray-100">
          {FORWARD.map(({ idx, label }) => {
            const c = COLORS[idx] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-300', val: 'text-gray-900' };
            const v = val(idx);
            return (
              <div key={idx} className={`p-5 ${c.bg}`}>
                <div className={`w-2 h-2 rounded-full ${c.dot} mb-3`} />
                <p className={`text-4xl font-bold ${c.val} mb-2`}>{v}</p>
                <p className={`text-xs font-medium ${c.text} leading-snug`}>{label}</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y divide-gray-100">
          {REVERSE.map(({ idx, label }) => {
            const c = COLORS[idx] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-300', val: 'text-gray-900' };
            const v = val(idx);
            return (
              <div key={idx} className={`p-5 ${c.bg}`}>
                <div className={`w-2 h-2 rounded-full ${c.dot} mb-3`} />
                <p className={`text-4xl font-bold ${c.val} mb-2`}>{v}</p>
                <p className={`text-xs font-medium ${c.text} leading-snug`}>{label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Total Card ── */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <BarChart2 className="w-7 h-7 text-gray-300" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total Stuck</p>
            <p className="text-5xl font-bold text-white mt-0.5">{total}</p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-400 space-y-1">
          <p>Forward + Reverse</p>
          <p className="text-gray-500 text-xs">Combined count</p>
        </div>
      </div>

    </div>
  );
};

export default ControlStuckFMPage;
