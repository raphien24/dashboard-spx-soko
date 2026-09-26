import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import Dashboard from './components/dashboard/Dashboard';
import ScheduleTable from './components/schedule/ScheduleTable';

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'schedule'
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Soko Hub Productivity Dashboard
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">
                    Live Operations Dashboard
                  </p>
                  <div className="flex items-center gap-1">
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
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-4">
              {/* Auto-refresh Toggle */}
              <button
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefreshEnabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={autoRefreshEnabled ? 'Pause auto-refresh' : 'Resume auto-refresh'}
              >
                {autoRefreshEnabled ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {autoRefreshEnabled ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
                </span>
              </button>

              {/* View Tabs */}
              <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('schedule')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'schedule'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'dashboard' ? (
          <Dashboard autoRefreshEnabled={autoRefreshEnabled} />
        ) : (
          <ScheduleTable autoRefreshEnabled={autoRefreshEnabled} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600">
                Data synced from{' '}
                <a
                  href="https://docs.google.com/spreadsheets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Google Sheets
                </a>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Auto-refresh interval: {autoRefreshEnabled ? '30 seconds' : 'Disabled'}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>© 2024 SPX SOKO Team</span>
              <span>•</span>
              <a href="#" className="hover:text-purple-600">Documentation</a>
              <span>•</span>
              <a href="#" className="hover:text-purple-600">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
