import { useState } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import PunishmentManagement from './components/punishment/PunishmentManagement';
import useDashboardStore from './store/dashboardStore';

function App() {
  const [activePage, setActivePage] = useState('productivity');
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
    'productivity': 'Soko Hub Productivity Dashboard',
    'sp-generator': 'Punishment Management',
    'sp-record': 'Punishment Management',
  };

  const pageSubtitles = {
    'productivity': 'Fleet Operations Dashboard',
    'sp-generator': 'SP Generator — Surat Peringatan',
    'sp-record': 'SP Record — Database',
  };

  const currentTitle = pageTitles[activePage] || 'SPX SOKO Dashboard';
  const currentSubtitle = pageSubtitles[activePage] || '';

  // Is the active page a punishment management sub-page?
  const isPunishmentPage = activePage === 'sp-generator' || activePage === 'sp-record';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar activePage={activePage} onNavigate={handleNavigation} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div className="pl-12 lg:pl-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                  {currentTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                  <p className="text-xs sm:text-sm text-gray-500">
                    {currentSubtitle}
                  </p>
                  {!isPunishmentPage && (
                    <>
                      <span className="hidden sm:inline text-gray-300">•</span>
                      <div className="flex items-center gap-1.5">
                        {autoRefreshEnabled ? (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs text-green-600 font-medium">Live Synced</span>
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                            <span className="text-xs text-gray-500">Paused</span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Controls — only show refresh controls on productivity page */}
              {!isPunishmentPage && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Last Update Display */}
                  <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-600">Last Update:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {dataDateRange?.latest ? formatLastUpdate(dataDateRange.latest) : 'Loading...'}
                    </span>
                  </div>

                  {/* Auto-refresh Toggle */}
                  <button
                    onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      autoRefreshEnabled
                        ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
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
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
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
        <main className="flex-1 overflow-y-auto">
          <div className={`${isPunishmentPage ? 'p-3 sm:p-4 md:p-6 h-full' : 'p-3 sm:p-4 md:p-6'}`}>
            {activePage === 'productivity' && (
              <Dashboard autoRefreshEnabled={autoRefreshEnabled} />
            )}
            {isPunishmentPage && (
              <PunishmentManagement activeSubPage={activePage} />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm gap-2 sm:gap-0">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <p className="text-gray-600 text-center">
                Data synced from{' '}
                <a
                  href="https://docs.google.com/spreadsheets/d/1wrQhe7ySqkITVe-L3f9aK3lo368WVzolL1nViONKYCA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Google Sheets
                </a>
              </p>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span className="text-xs text-gray-500">
                {autoRefreshEnabled ? '30s refresh' : 'Manual'}
              </span>
            </div>
            
            <div className="text-xs text-gray-500">
              © 2026 SPX SOKO
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
