import { useState } from 'react';
import { Play, Pause, RefreshCw, LogOut, User } from 'lucide-react';
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
import WhitelistSettings from './pages/WhitelistSettings';
import ControlStuckFMPage from './components/controlstuckfm/ControlStuckFMPage';
import BacklogLMPage from './components/backlog/BacklogLMPage';
import HSEDailyBriefing from './components/hse/HSEDailyBriefing';
import HSEWeekly5S from './components/hse/HSEWeekly5S';
import LandingPage from './pages/LandingPage';
import useDashboardStore from './store/dashboardStore';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import StarfieldBackground from './components/animations/StarfieldBackground';

function App() {
  const [activePage, setActivePage] = useState('landing');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  
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

  // Is the active page a landing page?
  const isLandingPage = activePage === 'landing';
  
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
  const isSettingsPage     = activePage === 'cookie-manager' || activePage === 'theme-settings' || activePage === 'whitelist-settings';
  const isControlStuckPage = activePage === 'control-stuck-fm';

  return (
    <ThemeProvider>
      {/* Only show starfield and sidebar if NOT on landing page */}
      {!isLandingPage && <StarfieldBackground />}
      
      {isLandingPage ? (
        /* Landing Page - Full Screen */
        <LandingPage onNavigate={handleNavigation} />
      ) : (
        /* Normal Dashboard Layout with Sidebar */
        <div className="flex h-screen bg-transparent overflow-hidden relative touch-none" style={{ height: '100vh', height: '100dvh' }}>
          {/* Solid background layer - Colorful gradient for light mode, dark slate for dark mode */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 -z-10" />
          
          {/* Sidebar */}
          <Sidebar activePage={activePage} onNavigate={handleNavigation} />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Header */}
            <header className="bg-white/95 dark:bg-slate-900/70 backdrop-blur-md shadow-lg shadow-purple-100/50 dark:shadow-none border-b-2 border-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:border-slate-700/50 relative flex-shrink-0 z-10">
              <div className="px-3 sm:px-6 py-2 sm:py-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div className="w-full sm:w-auto">
                    <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-slate-100 leading-tight">
                      {currentTitle}
                    </h1>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mt-0.5 sm:mt-1">
                      <p className="text-[10px] sm:text-xs lg:text-sm text-gray-500 dark:text-slate-400">
                        {currentSubtitle}
                      </p>
                      {!isPunishmentPage && !isExpeditePage && !isBuyerRRPage && !isMonitorSDHOPage && !isSettingsPage && !isControlStuckPage && !isBacklogLMPage && !isHSEPage && !isAdjustTarget && (
                        <>
                          <span className="hidden sm:inline text-gray-300 dark:text-slate-700">•</span>
                          <div className="flex items-center gap-1">
                            {autoRefreshEnabled ? (
                              <>
                                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 dark:bg-green-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-green-500 dark:bg-green-400"></span>
                                </span>
                                <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium">Live Synced</span>
                              </>
                            ) : (
                              <>
                                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-gray-400 dark:bg-slate-600"></span>
                                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-slate-400">Paused</span>
                              </>
                            )}
                          </div>
                          <span className="hidden sm:inline text-gray-300 dark:text-slate-700">•</span>
                          <div className="px-2 py-1 sm:px-3 sm:py-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                            <span className="text-[10px] sm:text-xs text-gray-600 dark:text-slate-400">
                              Last Update: {dataDateRange?.latest ? formatLastUpdate(dataDateRange.latest) : 'Loading...'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {user?.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="w-7 h-7 rounded-full border-2 border-indigo-200 dark:border-indigo-700"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-slate-300">
                        {user?.name?.split(' ')[0] || 'User'}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-40 overflow-hidden">
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-slate-400 truncate">
                              {user?.email}
                            </p>
                          </div>

                          {/* Logout Button */}
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                </div>
              </div>
            </header>

            {/* Main Content - Scrollable */}
            <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-transparent relative overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className={`${isPunishmentPage ? 'p-2 sm:p-3 md:p-4 lg:p-6 h-full' : 'p-2 sm:p-3 md:p-4 lg:p-6'}`}>
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
                {activePage === 'whitelist-settings' && <WhitelistSettings />}
                {activePage === 'animation-demo' && <AnimationDemo />}
                {isControlStuckPage  && <ControlStuckFMPage />}
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-transparent px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 relative flex-shrink-0">
              <div className="flex items-center justify-center text-[10px] sm:text-xs text-gray-500 dark:text-slate-500">
                © 2026 SPX SOKO
              </div>
            </footer>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}

export default App;
