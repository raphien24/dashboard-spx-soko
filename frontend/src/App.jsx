import { useState } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/dashboard/Dashboard';

function App() {
  const [activePage, setActivePage] = useState('productivity');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const handleNavigation = (pageId) => {
    setActivePage(pageId);
  };

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
              <div className="pl-12 lg:pl-0"> {/* Padding for mobile menu button */}
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                  Soko Hub Productivity Dashboard
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                  <p className="text-xs sm:text-sm text-gray-500">
                    Fleet Operations Dashboard
                  </p>
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
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Date Range Display - Hidden on Mobile, shown on tablet+ */}
                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm text-gray-600">Scope:</span>
                  <span className="text-sm font-semibold text-gray-900">21 Sep – 27 Sep</span>
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
            </div>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6">
            {activePage === 'productivity' && (
              <Dashboard autoRefreshEnabled={autoRefreshEnabled} />
            )}
            {/* Future pages will go here */}
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
