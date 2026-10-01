import { useState, useEffect } from 'react';
import { Filter, X, Calendar } from 'lucide-react';

/**
 * Dashboard Filters Component
 * Centralized filters for the entire dashboard (date, contract, vehicle)
 * Changes only apply when user clicks "Apply Filter" button
 */
function DashboardFilters({ onApplyFilter, initialFilters, dataDateRange }) {
  const [tempFilters, setTempFilters] = useState({
    weekOffset: 0,
    contract: 'Dedicated', // Default: Dedicated
    vehicle: '2WH',        // Default: 2WH
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Update temp filters when initial filters change (external updates)
  useEffect(() => {
    if (initialFilters) {
      setTempFilters({
        weekOffset: initialFilters.weekOffset || 0,
        contract: initialFilters.contract || 'Dedicated',
        vehicle: initialFilters.vehicle || '2WH',
      });
      setHasChanges(false);
    }
  }, [initialFilters]);

  // Calculate week range based on offset
  const getWeekRange = (offset) => {
    const referenceDate = dataDateRange?.latest ? new Date(dataDateRange.latest) : new Date();
    
    const currentDayOfWeek = referenceDate.getDay();
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    
    const monday = new Date(referenceDate);
    monday.setDate(referenceDate.getDate() - daysFromMonday + (offset * 7));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
  };

  const formatWeekLabel = (offset) => {
    const { monday, sunday } = getWeekRange(offset);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${monday.getDate()} ${monthNames[monday.getMonth()]} — ${sunday.getDate()} ${monthNames[sunday.getMonth()]}, ${sunday.getFullYear()}`;
  };

  const handleFilterChange = (filterName, value) => {
    setTempFilters(prev => ({ ...prev, [filterName]: value }));
    setHasChanges(true);
  };

  const handleWeekChange = (direction) => {
    const newOffset = direction === 'prev' ? tempFilters.weekOffset - 1 : 
                     direction === 'next' ? tempFilters.weekOffset + 1 : 
                     0; // current
    
    setTempFilters(prev => ({ ...prev, weekOffset: newOffset }));
    setHasChanges(true);
  };

  const handleApplyFilter = () => {
    const weekRange = getWeekRange(tempFilters.weekOffset);
    
    onApplyFilter({
      dateRange: {
        start: weekRange.monday,
        end: weekRange.sunday,
      },
      contract: tempFilters.contract,
      vehicle: tempFilters.vehicle,
      weekOffset: tempFilters.weekOffset,
    });
    
    setHasChanges(false);
  };

  const handleResetFilter = () => {
    setTempFilters({
      weekOffset: 0,
      contract: 'all',
      vehicle: 'all',
    });
    setHasChanges(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Dashboard Filters</h3>
        </div>
        {hasChanges && (
          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
            Unapplied Changes
          </span>
        )}
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Week Picker */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 inline mr-1" />
            Week Range
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleWeekChange('prev')}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              title="Previous week"
            >
              ←
            </button>
            <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <span className="text-sm font-medium text-gray-900">
                {formatWeekLabel(tempFilters.weekOffset)}
              </span>
            </div>
            <button
              onClick={() => handleWeekChange('next')}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              title="Next week"
            >
              →
            </button>
          </div>
          <button
            onClick={() => handleWeekChange('current')}
            className="w-full px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition-colors"
          >
            Go to Latest Week
          </button>
        </div>

        {/* Contract Type Filter */}
        <div className="space-y-2">
          <label htmlFor="contract-filter" className="block text-sm font-medium text-gray-700">
            Contract Type
          </label>
          <select
            id="contract-filter"
            value={tempFilters.contract}
            onChange={(e) => handleFilterChange('contract', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Contracts</option>
            <option value="Dedicated">Dedicated</option>
            <option value="Kurir Plus">Kurir Plus</option>
            <option value="Mitra">Mitra</option>
          </select>
        </div>

        {/* Vehicle Type Filter */}
        <div className="space-y-2">
          <label htmlFor="vehicle-filter" className="block text-sm font-medium text-gray-700">
            Vehicle Type
          </label>
          <select
            id="vehicle-filter"
            value={tempFilters.vehicle}
            onChange={(e) => handleFilterChange('vehicle', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Vehicles</option>
            <option value="2WH">2WH (Two Wheeler)</option>
            <option value="4WH">4WH (Four Wheeler)</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleApplyFilter}
          disabled={!hasChanges}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            hasChanges
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Filter className="w-4 h-4 inline mr-2" />
          Apply Filter
        </button>
        
        <button
          onClick={handleResetFilter}
          className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <X className="w-4 h-4 inline mr-2" />
          Reset
        </button>

        {hasChanges && (
          <div className="text-sm text-gray-500 sm:ml-auto self-center">
            Click "Apply Filter" to update dashboard
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardFilters;
