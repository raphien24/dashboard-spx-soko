import { useEffect } from 'react';
import useDashboardStore from '../../store/dashboardStore';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import FilterBar from './FilterBar';
import CourierTable from './CourierTable';
import { Loader } from 'lucide-react';
import { API_CONFIG } from '../../utils/constants';

function ScheduleTable({ autoRefreshEnabled = true }) {
  const {
    courierSchedule,
    isLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
    fetchCourierSchedule,
  } = useDashboardStore();

  // Fetch data on mount
  useEffect(() => {
    fetchCourierSchedule();
  }, [fetchCourierSchedule]);

  // Auto-refresh courier schedule
  useAutoRefresh(() => {
    if (autoRefreshEnabled) {
      fetchCourierSchedule();
    }
  }, API_CONFIG.REFRESH_INTERVAL, autoRefreshEnabled);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200">
          <div className="flex flex-col items-center justify-center">
            <Loader className="w-8 h-8 text-purple-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading courier schedule...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Courier Table */}
      {!isLoading && !error && (
        <CourierTable data={courierSchedule} />
      )}
    </div>
  );
}

export default ScheduleTable;
