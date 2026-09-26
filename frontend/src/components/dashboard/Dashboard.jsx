import { useEffect } from 'react';
import { Loader, RefreshCw, AlertCircle } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import KPICardsSection from './KPICardsSection';
import MetricsCardsSection from './MetricsCardsSection';
import PerformanceByContractChart from '../charts/PerformanceByContractChart';
import TopZonesChart from '../charts/TopZonesChart';
import FleetCompositionChart from '../charts/FleetCompositionChart';
import { getTimeAgo } from '../../utils/formatters';
import { API_CONFIG } from '../../utils/constants';

function Dashboard({ autoRefreshEnabled = true }) {
  const {
    kpiMetrics,
    summaryMetrics,
    performanceData,
    zonesData,
    fleetData,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    fetchDashboardData,
    refreshDashboardData,
  } = useDashboardStore();

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 30 seconds (configurable and controllable)
  useAutoRefresh(() => {
    if (autoRefreshEnabled) {
      refreshDashboardData();
    }
  }, API_CONFIG.REFRESH_INTERVAL, autoRefreshEnabled);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Loading dashboard data...</p>
        <p className="text-gray-500 text-sm mt-2">Fetching data from Google Sheets</p>
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

  return (
    <div className="space-y-6">
      {/* Refresh Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRefreshing && (
            <>
              <RefreshCw className="w-4 h-4 text-purple-600 animate-spin" />
              <span className="text-sm text-gray-600">Refreshing data...</span>
            </>
          )}
          {lastUpdated && !isRefreshing && (
            <span className="text-sm text-gray-500">
              Last updated: {getTimeAgo(lastUpdated)}
            </span>
          )}
        </div>
        <button
          onClick={() => refreshDashboardData()}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Now
        </button>
      </div>

      {/* Error Banner (non-blocking) */}
      {error && kpiMetrics && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Warning: {error}. Showing cached data.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Section */}
      <KPICardsSection kpiMetrics={kpiMetrics} />

      {/* Summary Metrics Section */}
      <MetricsCardsSection summaryMetrics={summaryMetrics} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Contract Type */}
        <PerformanceByContractChart data={performanceData} />

        {/* Top Zones by Parcel Volume */}
        <TopZonesChart data={zonesData} />
      </div>

      {/* Fleet Composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FleetCompositionChart data={fleetData} />
        </div>
        
        {/* Additional Info Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-4">📊 Key Insights</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-purple-100">Total Parcels Delivered</span>
                <span className="font-bold">
                  {zonesData ? zonesData.reduce((sum, z) => sum + z.parcels, 0).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-100">Active Zones</span>
                <span className="font-bold">{zonesData ? zonesData.length : 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-100">Contract Types</span>
                <span className="font-bold">{performanceData ? performanceData.length : 0}</span>
              </div>
            </div>
          </div>

          {/* Performance Summary Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-4">🎯 Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Avg Productivity</span>
                <span className="font-bold">
                  {kpiMetrics?.weeklyProductivity?.value || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Attendance Rate</span>
                <span className="font-bold">
                  {kpiMetrics?.dailyActive?.value ? `${kpiMetrics.dailyActive.value}%` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-100">Unload Rate</span>
                <span className="font-bold">
                  {kpiMetrics?.unloadedVsPlan?.value ? `${kpiMetrics.unloadedVsPlan.value}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
