import { useState, useEffect } from 'react';
import {
  RefreshCw, X, Play, RotateCcw, CheckCircle, XCircle, 
  Loader2, Activity, Clock, Layers
} from 'lucide-react';
import { 
  getMonitorSDHOData, 
  runMonitorSDHOScraper, 
  getMonitorSDHOScraperStatus 
} from '../../services/googleSheetsService';
import SDHODataTable from './SDHODataTable';

// Kolom untuk Status CREATED (A:G)
const CREATED_COLS = [
  { key: 'Order Number',      label: 'Order Number',     width: 'min-w-[160px]' },
  { key: 'Pickup Point ID',   label: 'Pickup Point ID',  width: 'min-w-[140px]' },
  { key: 'Pickup Attempts',   label: 'Attempts',         width: 'min-w-[90px]'  },
  { key: 'ETA',               label: 'ETA',              width: 'min-w-[140px]' },
  { key: 'Status',            label: 'Status',           width: 'min-w-[110px]' },
  { key: 'Create Time',       label: 'Create Time',      width: 'min-w-[140px]' },
  { key: 'Last Update',       label: 'Last Update',      width: 'min-w-[150px]' },
];

// Kolom untuk Status ASSIGNED (N:R - 5 kolom)
const ASSIGNED_COLS = [
  { key: 'Pickup Task ID',     label: 'Pickup Task ID',   width: 'min-w-[160px]' },
  { key: 'Pickup Point Name',  label: 'Pickup Point',     width: 'min-w-[150px]' },
  { key: 'Driver',             label: 'Driver',           width: 'min-w-[130px]' },
  { key: 'Accepted Time',      label: 'Accepted Time',    width: 'min-w-[140px]' },
  { key: 'Status',             label: 'Status',           width: 'min-w-[110px]' },
];

const MonitorSDHOPage = () => {
  // Data state
  const [dataCreated,  setDataCreated]  = useState([]);
  const [dataAssigned, setDataAssigned] = useState([]);
  const [summary,      setSummary]      = useState([]);
  const [lastUpdate,   setLastUpdate]   = useState(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState(null);

  // Scraper state
  const [scraperState,    setScraperState]    = useState('idle');
  const [scraperProgress, setScraperProgress] = useState(null);
  const [pollInterval,    setPollInterval]    = useState(null);

  // ── Fetch Data ────────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMonitorSDHOData();
      
      // Pisahkan data berdasarkan struktur yang dikembalikan backend
      // Jika backend sudah return dataCreated & dataAssigned:
      if (result.dataCreated && result.dataAssigned) {
        setDataCreated(result.dataCreated);
        setDataAssigned(result.dataAssigned);
      } 
      // Fallback: jika masih return 'detail' saja
      else if (result.detail) {
        const all = result.detail;
        const created = all.filter(row => {
          // Cek apakah row punya kolom dari CREATED (Order Number)
          return row['Order Number'] && !row['Pickup Task ID'];
        });
        const assigned = all.filter(row => {
          // Cek apakah row punya kolom dari ASSIGNED (Pickup Task ID)
          return row['Pickup Task ID'];
        });
        setDataCreated(created);
        setDataAssigned(assigned);
      }
      
      setSummary(result.summary || []);
      
      // Last update dari summary TOTAL
      const totalRow = (result.summary || []).find(r => 
        String(r['Status']).includes('TOTAL')
      );
      if (totalRow?.['Last Update']) {
        setLastUpdate(totalRow['Last Update']);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  // ── Scraper Functions ──────────────────────────────────────
  const startScraper = async (action = 'run') => {
    setScraperState('running');
    setScraperProgress({ 
      percent: 0, 
      message: 'Mengirim perintah ke GAS...', 
      updatedAt: '' 
    });
    
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    
    try {
      await runMonitorSDHOScraper(action);
      await new Promise(r => setTimeout(r, 3000));
      
      const interval = setInterval(async () => {
        try {
          const result = await getMonitorSDHOScraperStatus();
          if (!result) return;
          
          setScraperProgress(result.status);
          
          if (result.isDone || (result.command === 'IDLE' && result.status?.percent === 100)) {
            clearInterval(interval);
            setPollInterval(null);
            
            const isError = result.status?.message?.startsWith('❌');
            setScraperState(isError ? 'error' : 'done');
            
            if (!isError) {
              setTimeout(() => fetchData(), 2000);
            }
          } else if (result.isRunning) {
            setScraperState('running');
          }
        } catch (err) {
          console.error('Poll error:', err);
        }
      }, 4000);
      
      setPollInterval(interval);
    } catch (err) {
      setScraperState('error');
      setScraperProgress({ 
        percent: 0, 
        message: '❌ ' + err.message, 
        updatedAt: '' 
      });
    }
  };

  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // ── Loading & Error ────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-slate-500">Loading Monitor SDHO...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Gagal memuat data</h3>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button 
              onClick={fetchData} 
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Scraper Panel ── */}
      <div className={`rounded-xl border p-4 shadow-sm ${
        scraperState === 'running' ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900' :
        scraperState === 'done'    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900' :
        scraperState === 'error'   ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900' :
        'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {scraperState === 'running' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />}
            {scraperState === 'done'    && <CheckCircle className="w-5 h-5 text-green-600" />}
            {scraperState === 'error'   && <XCircle className="w-5 h-5 text-red-600" />}
            {scraperState === 'idle'    && <Activity className="w-5 h-5 text-gray-400 dark:text-slate-500" />}
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                {scraperState === 'idle'    && 'Monitor SDHO Scraper'}
                {scraperState === 'running' && 'Scraper sedang berjalan...'}
                {scraperState === 'done'    && 'Scraper selesai!'}
                {scraperState === 'error'   && 'Scraper gagal'}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
                {scraperState === 'idle' && 'Klik "Run Scraper" untuk update data dari SPX'}
                {scraperProgress?.message && scraperState !== 'idle' && scraperProgress.message}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => startScraper('run')} 
              disabled={scraperState === 'running'}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-gray-300 dark:border-slate-700"
            >
              <RotateCcw className="w-4 h-4" /> Resume
            </button>
          </div>
        </div>
        
        {scraperProgress && scraperState !== 'idle' && (
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
                <span>{scraperProgress.percent}%</span>
                {scraperProgress.updatedAt && (
                  <span className="text-gray-400 dark:text-slate-500">
                    Updated: {scraperProgress.updatedAt}
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    scraperProgress.message?.startsWith('❌') ? 'bg-red-500' :
                    scraperState === 'done' ? 'bg-green-500' :
                    scraperProgress.message?.startsWith('⚠️') ? 'bg-yellow-400' : 
                    'bg-indigo-500'
                  }`} 
                  style={{ width: `${scraperProgress.percent}%` }} 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-indigo-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-700">
                {dataCreated.length + dataAssigned.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-500">Total Pickup Tasks</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-blue-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{dataCreated.length}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">Status Created</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{dataAssigned.length}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500">Status Assigned</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-purple-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {lastUpdate ? lastUpdate.split(' ')[1] || 'N/A' : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-500">Last Update</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recap Pickup Attempts ── */}
      {dataCreated.length > 0 && (() => {
        // Hitung attempts breakdown (termasuk 0x)
        const attemptMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
        dataCreated.forEach(row => {
          const attemptsValue = row['Pickup Attempts'] || row['Attempts'] || '0';
          const n = parseInt(attemptsValue) || 0;
          
          if (n === 0) {
            attemptMap[0]++;
          } else if (n >= 1 && n <= 5) {
            attemptMap[n]++;
          } else if (n >= 6) {
            attemptMap[6]++;
          }
        });

        return (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-4">
              Recap Pickup Attempts (Status Created)
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
              {[0, 1, 2, 3, 4, 5, 6].map(n => {
                const count = attemptMap[n] || 0;
                const pct = dataCreated.length > 0 
                  ? Math.round((count / dataCreated.length) * 100) 
                  : 0;
                const color = 
                  n === 0 ? 'border-gray-300 dark:border-slate-700 bg-gray-100 dark:bg-slate-800' :
                  n >= 5 ? 'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950' : 
                  n >= 3 ? 'border-orange-300 dark:border-orange-900 bg-orange-50 dark:bg-orange-950' : 
                  n >= 2 ? 'border-yellow-300 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950' : 
                  'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950';
                const textColor = 
                  n === 0 ? 'text-gray-700 dark:text-slate-300' :
                  n >= 5 ? 'text-red-700 dark:text-red-400' : 
                  n >= 3 ? 'text-orange-600 dark:text-orange-400' : 
                  n >= 2 ? 'text-yellow-700 dark:text-yellow-400' : 
                  'text-blue-700 dark:text-blue-400';
                const barColor = 
                  n === 0 ? 'bg-gray-400' :
                  n >= 5 ? 'bg-red-500' : 
                  n >= 3 ? 'bg-orange-400' : 
                  n >= 2 ? 'bg-yellow-400' : 
                  'bg-blue-500';

                return (
                  <div key={n} className={`rounded-lg border p-3 ${color}`}>
                    <p className={`text-2xl font-bold ${textColor}`}>{count}</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mt-0.5">
                      {n === 0 ? '0x' : n === 6 ? '6x+' : n + 'x'} Attempts
                    </p>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${barColor}`}
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Tabel 1: Status CREATED ── */}
      <SDHODataTable
        title="Status: CREATED"
        data={dataCreated}
        columns={CREATED_COLS}
        statusColor="blue"
        onRefresh={fetchData}
      />

      {/* ── Tabel 2: Status ASSIGNED ── */}
      <SDHODataTable
        title="Status: ASSIGNED"
        data={dataAssigned}
        columns={ASSIGNED_COLS}
        statusColor="green"
        onRefresh={fetchData}
      />
    </div>
  );
};

export default MonitorSDHOPage;
