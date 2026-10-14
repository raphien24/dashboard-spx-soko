import { useState } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import DashboardMonthly from './components/productivity/DashboardMonthly';
import AdjustTargetPage from './components/productivity/AdjustTargetPage';
import PunishmentManagement from './components/punishment/PunishmentManagement';
import ExpeditePage from './components/expedite/ExpeditePage';
import BuyerRRPage from './components/buyerrr/BuyerRRPage';
import MonitorSDHOPage from './components/monitorsdho/MonitorSDHOPage';
import CookieManagerPage from './components/settings/CookieManagerPage';
import ThemeSettings from './pages/ThemeSettings';
import AnimationDemo from './pages/AnimationDemo';
import ControlStuckFMPage from './components/controlstuckfm/ControlStuckFMPage';
import BacklogLMPage from './components/backlog/BacklogLMPage';
import HSEDailyBriefing from './components/hse/HSEDailyBriefing';
import HSEWeekly5S from './components/hse/HSEWeekly5S';
import useDashboardStore from './store/dashboardStore';
import { ThemeProvider } from './contexts/ThemeContext';
import StarfieldBackground from './components/animations/StarfieldBackground';

function App() {
  const [activePage, setActivePage] = useState('productivity-dashboard');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  
  // Get raw data to detect last update date
  const { rawCourierData, detectDateRangeFromData } = useDashboardStore();
  const dataDateRange = rawCourierData ? detectDateRangeFromData(rawCourierData) : null;
  
  // Format last update date
  const formatLastUpdate = (date) => {
    if (!date) return 'Loading...';
    const d = new Date(date);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  };

  const handleNavigation = (pageId) => {
    setActivePage(pageId);
  };

  // Determine page title based on active page
  const pageTitles = {
    'productivity-dashboard': 'Soko Hub Productivity Dashboard',
    'productivity-monthly':   'Monthly Productivity Dashboard',
    'adjust-target':          'Adjust Weekly Target',
    'productivity':           'Soko Hub Productivity Dashboard',
    'sp-generator': 'Punishment Management',
    'sp-record':    'Punishment Management',
    'expedite':          'Expedite Tracker',
    'backlog-lm':        'Backlog LM',
    'hse-daily':         'HSE',
    'hse-weekly':        'HSE',
    'buyer-rr':      'Buyer RR',
    'monitor-sdho':      'Monitor SDHO',
    'cookie-manager':    'Settings',
    'theme-settings':    'Settings',
    'animation-demo':    'Settings',
    'control-stuck-fm':  'Control Stuck FM',
  };

  const pageSubtitles = {
    'productivity-dashboard': 'Weekly Fleet Operations Dashboard',
    'productivity-monthly':   'Monthly Aggregated Performance Metrics',
    'adjust-target':          'Manage target appeal after approval',
    'productivity':           'Fleet Operations Dashboard',
    'sp-generator': 'SP Generator — Surat Peringatan',
    'sp-record':    'SP Record — Database',
    'expedite':          'Monitor & track paket expedite',
    'backlog-lm':        'Monitor backlog last mile',
    'hse-daily':         'Daily Briefing — Keselamatan Harian',
    'hse-weekly':        'Weekly 5S — Checklist Mingguan',
    'buyer-rr':      'Monitor & track buyer return request',
    'monitor-sdho':      'Monitor SDHO pickup data',
    'cookie-manager':    'Cookie Manager — SPX FMS Portal',
    'theme-settings':    'Theme — Light / Dark Mode',
    'animation-demo':    '🎨 Animation Demo — Modern UI Effects',
    'control-stuck-fm':  'Control Stuck FM',
  };

  const currentTitle = pageTitles[activePage] || 'SPX SOKO Dashboard';
  const currentSubtitle = pageSubtitles[activePage] || '';

  // Is the active page a punishment management sub-page?
  const isProductivityDash = activePage === 'productivity-dashboard' || activePage === 'productivity';
  const isProductivityMonthly = activePage === 'productivity-monthly';
  const isAdjustTarget     = activePage === 'adjust-target';
  const isPunishmentPage  = activePage === 'sp-generator' || activePage === 'sp-record';
  const isExpeditePage    = activePage === 'expedite';
  const isBacklogLMPage   = activePage === 'backlog-lm';
  const isHSEPage         = activePage === 'hse-daily' || activePage === 'hse-weekly';
  const isBuyerRRPage     = activePage === 'buyer-rr';
  const isMonitorSDHOPage  = activePage === 'monitor-sdho';
  const isSettingsPage     = activePage === 'cookie-manager' || activePage === 'theme-settings';
  const isControlStuckPage = activePage === 'control-stuck-fm';

  return (
    <ThemeProvider>
      {/* Animated Starfield Background - Dark mode only */}
      <StarfieldBackground />
      
      <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar activePage={activePage} onNavigate={handleNavigation} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-slate-800">
            <div className="px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="pl-12 lg:pl-0">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {currentTitle}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                      {currentSubtitle}
                    </p>
                    {!isPunishmentPage && !isExpeditePage && !isBuyerRRPage && !isMonitorSDHOPage && !isSettingsPage && !isControlStuckPage && !isBacklogLMPage && !isHSEPage && !isAdjustTarget && (
                      <>
                        <span className="hidden sm:inline text-gray-300 dark:text-slate-700">•</span>
                        <div className="flex items-center gap-1.5">
                          {autoRefreshEnabled ? (
                            <>
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 dark:bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 dark:bg-green-400"></span>
                              </span>
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live Synced</span>
                            </>
                          ) : (
                            <>
                              <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-slate-600"></span>
                              <span className="text-xs text-gray-500 dark:text-slate-400">Paused</span>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Controls — only show on productivity page */}
                {!isPunishmentPage && !isExpeditePage && !isBuyerRRPage && !isMonitorSDHOPage && !isSettingsPage && !isControlStuckPage && !isBacklogLMPage && !isHSEPage && !isAdjustTarget && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Last Update Display */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                      <span className="text-sm text-gray-600 dark:text-slate-400">Last Update:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-slate-200">
                        {dataDateRange?.latest ? formatLastUpdate(dataDateRange.latest) : 'Loading...'}
                      </span>
                    </div>

                    {/* Auto-refresh Toggle */}
                    <button
                      onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        autoRefreshEnabled
                          ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 border border-green-200 dark:border-green-800'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700'
                      }`}
                      title={autoRefreshEnabled ? 'Pause auto-refresh' : 'Resume auto-refresh'}
                    >
                      {autoRefreshEnabled ? (
                        <>
                          <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Auto-Refresh On</span>
                          <span className="sm:hidden">Auto</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Auto-Refresh Off</span>
                          <span className="sm:hidden">Off</span>
                        </>
                      )}
                    </button>

                    {/* Manual Refresh */}
                    <button
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
                      title="Refresh data now"
                    >
                      <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Refresh</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main Content - Scrollable */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950">
            <div className={`${isPunishmentPage ? 'p-3 sm:p-4 md:p-6 h-full' : 'p-3 sm:p-4 md:p-6'}`}>
              {isProductivityDash && <Dashboard autoRefreshEnabled={autoRefreshEnabled} />}
              {isProductivityMonthly && <DashboardMonthly />}
              {isAdjustTarget     && <AdjustTargetPage />}
              {isPunishmentPage && (
                <PunishmentManagement activeSubPage={activePage} />
              )}
              {isExpeditePage      && <ExpeditePage />}
              {isBacklogLMPage     && <BacklogLMPage />}
              {activePage === 'hse-daily'  && <HSEDailyBriefing />}
              {activePage === 'hse-weekly' && <HSEWeekly5S />}
              {isBuyerRRPage     && <BuyerRRPage />}
              {isMonitorSDHOPage   && <MonitorSDHOPage />}
              {activePage === 'cookie-manager' && <CookieManagerPage />}
              {activePage === 'theme-settings' && <ThemeSettings />}
              {activePage === 'animation-demo' && <AnimationDemo />}
              {isControlStuckPage  && <ControlStuckFMPage />}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-3 sm:px-6 py-2 sm:py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm gap-2 sm:gap-0">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                <p className="text-gray-600 dark:text-slate-400 text-center">
                  Data synced from{' '}
                  <a
                    href="https://docs.google.com/spreadsheets/d/1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                  >
                    Google Sheets
                  </a>
                </p>
                <span className="hidden sm:inline text-gray-300 dark:text-slate-700">•</span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {autoRefreshEnabled ? '30s refresh' : 'Manual'}
                </span>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-slate-400">
                © 2026 SPX SOKO
              </div>
            </div>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
