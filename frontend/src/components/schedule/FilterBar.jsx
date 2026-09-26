import { Calendar, Filter } from 'lucide-react';
import { FILTER_OPTIONS } from '../../utils/constants';

/**
 * Filter Bar Component
 * Contains all filter controls for the schedule table
 */
function FilterBar({ filters, onFilterChange, onReset }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Date Range
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => onFilterChange({
                dateRange: { ...filters.dateRange, start: e.target.value }
              })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="date"
              value={filters.dateRange?.end || ''}
              onChange={(e) => onFilterChange({
                dateRange: { ...filters.dateRange, end: e.target.value }
              })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Zone Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zone
          </label>
          <select
            value={filters.zone || 'all'}
            onChange={(e) => onFilterChange({ zone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {FILTER_OPTIONS.zones.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Contract Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contract Type
          </label>
          <select
            value={filters.contract || 'all'}
            onChange={(e) => onFilterChange({ contract: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {FILTER_OPTIONS.contracts.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle
          </label>
          <select
            value={filters.vehicle || 'all'}
            onChange={(e) => onFilterChange({ vehicle: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {FILTER_OPTIONS.vehicles.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.zone !== 'all' || filters.contract !== 'all' || filters.vehicle !== 'all') && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.zone !== 'all' && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                Zone: {FILTER_OPTIONS.zones.find(z => z.value === filters.zone)?.label}
              </span>
            )}
            {filters.contract !== 'all' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                Contract: {FILTER_OPTIONS.contracts.find(c => c.value === filters.contract)?.label}
              </span>
            )}
            {filters.vehicle !== 'all' && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Vehicle: {FILTER_OPTIONS.vehicles.find(v => v.value === filters.vehicle)?.label}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterBar;
