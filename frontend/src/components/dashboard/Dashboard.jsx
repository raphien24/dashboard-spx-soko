import { useEffect } from 'react';
import { Loader, RefreshCw, AlertCircle } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import ErrorBoundary from '../common/ErrorBoundary';
import KPICardsSection from './KPICardsSection';
import SecondaryMetricsSection from './SecondaryMetricsSection';
import PerformanceByContractChart from '../charts/PerformanceByContractChart';
import TopZonesChart from '../charts/TopZonesChart';
import FleetCompositionChart from '../charts/FleetCompositionChart';
import WeeklyScheduleTable from '../schedule/WeeklyScheduleTable';

function Dashboard({ autoRefreshEnabled = true }) {
  const {
    kpiMetrics,
    summaryMetrics,
    performanceData,
    zonesData,
    fleetData,
    courierSchedule,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    fetchDashboardData,
    refreshDashboardData,
    fetchCourierSchedule,
  } = useDashboardStore();

  // Initial data fetch
  useEffect(() => {
    // Calculate current week range for initial load
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    const currentWeekRange = { start: monday, end: sunday };
    
    // Fetch data for current week
    fetchDashboardData(currentWeekRange);
    fetchCourierSchedule(currentWeekRange);
  }, [fetchDashboardData, fetchCourierSchedule]);

  // Auto-refresh every 30 seconds (configurable and controllable)
  useAutoRefresh(() => {
    if (autoRefreshEnabled) {
      refreshDashboardData();
    }
  }, 30000, autoRefreshEnabled);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg font-medium">Loading dashboard data...</p>
        <p className="text-gray-500 text-sm mt-2">Fetching real-time data from Google Sheets</p>
      </div>
    );
  }

  // Error state
  if (error && !kpiMetrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Dashboard</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => fetchDashboardData()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safety check - if no data after loading, show empty state
  if (!isLoading && !kpiMetrics && !summaryMetrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-yellow-600 mb-4" />
        <p className="text-gray-600 text-lg font-medium">No data available</p>
        <p className="text-gray-500 text-sm mt-2">Please check your data source</p>
        <button
          onClick={() => fetchDashboardData()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const formatTimeAgo = (date) => {
    if (!date) return 'Never';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
            <h2 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
              KEY STRATEGIC PERFORMANCE DRIVERS
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs text-indigo-600 font-medium">Primary Metrics</span>
            {lastUpdated && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  Updated: {formatTimeAgo(lastUpdated)}
                </span>
              </>
            )}
            {isRefreshing && (
              <>
                <span className="text-xs text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />
                  <span className="text-xs text-indigo-600">Syncing...</span>
                </div>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => refreshDashboardData()}
          disabled={isRefreshing}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 border border-indigo-200"
        >
          <RefreshCw className={`w-4 h-4 inline mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Error Banner (non-blocking) */}
      {error && kpiMetrics && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                Some data may be outdated. Last error: {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards (3 main cards) */}
      <ErrorBoundary componentName="KPICardsSection">
        {kpiMetrics && <KPICardsSection kpiData={kpiMetrics} />}
      </ErrorBoundary>

      {/* Secondary Metrics (5 small cards) */}
      <ErrorBoundary componentName="SecondaryMetricsSection">
        {summaryMetrics && <SecondaryMetricsSection summaryData={summaryMetrics} />}
      </ErrorBoundary>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Contract Type */}
        <ErrorBoundary componentName="PerformanceByContractChart">
          {performanceData && performanceData.length > 0 && (
            <PerformanceByContractChart data={performanceData} />
          )}
        </ErrorBoundary>

        {/* Top Zones by Parcel Volume */}
        <ErrorBoundary componentName="TopZonesChart">
          {zonesData && zonesData.length > 0 && (
            <TopZonesChart data={zonesData} />
          )}
        </ErrorBoundary>
      </div>

      {/* Weekly Schedule Table */}
      <ErrorBoundary componentName="WeeklyScheduleTable">
        <WeeklyScheduleTable 
          data={courierSchedule || []}
          onWeekChange={(direction, weekRange) => {
            const dateRange = { 
              start: weekRange.monday, 
              end: weekRange.sunday 
            };
            // Fetch both dashboard data and courier schedule for the selected week
            fetchDashboardData(dateRange);
            fetchCourierSchedule(dateRange);
          }}
        />
      </ErrorBoundary>

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Dashboard Information</p>
            <p className="text-blue-700">
              Data is synced in real-time from Google Sheets (Sheet: "raw"). 
              Auto-refresh is {autoRefreshEnabled ? 'enabled' : 'disabled'}. 
              All calculations are based on active courier records with delivered packages &gt; 0.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
