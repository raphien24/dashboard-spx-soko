import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, CheckCircle, XCircle, Eye, Edit, Trash2, Calendar } from 'lucide-react';

/**
 * Weekly Schedule Table Component
 * Matches canvas spreadsheet table with all columns and features
 */
function WeeklyScheduleTable({ data, onWeekChange }) {
  const [filters, setFilters] = useState({
    specificDate: 'All Specific Dates',
    district: 'All Districts',
    zone: 'All Zones',
    contract: 'All Contracts',
    vehicle: 'All Vehicles',
    targetStatus: 'All Target Statuses',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState('Full Week (Mon-Sun)');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // 0 = current week, -1 = prev week, +1 = next week
  const itemsPerPage = 10;

  // Calculate week range based on offset
  const getWeekRange = (offset) => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Convert to Monday-based week
    
    // Get Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday + (offset * 7));
    monday.setHours(0, 0, 0, 0);
    
    // Get Sunday of current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
  };

  const currentWeekRange = getWeekRange(currentWeekOffset);
  
  const formatWeekLabel = () => {
    const { monday, sunday } = currentWeekRange;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${monday.getDate()} ${monthNames[monday.getMonth()]} — ${sunday.getDate()} ${monthNames[sunday.getMonth()]}, ${sunday.getFullYear()}`;
  };

  const handleWeekChange = (direction) => {
    const newOffset = direction === 'prev' ? currentWeekOffset - 1 : currentWeekOffset + 1;
    console.log('[WeeklyScheduleTable] Week changed:', { direction, oldOffset: currentWeekOffset, newOffset });
    setCurrentWeekOffset(newOffset);
    
    const newWeekRange = getWeekRange(newOffset);
    console.log('[WeeklyScheduleTable] New week range:', {
      monday: newWeekRange.monday.toISOString(),
      sunday: newWeekRange.sunday.toISOString()
    });
    
    if (onWeekChange) {
      onWeekChange(direction, newWeekRange);
    }
  };

  const goToCurrentWeek = () => {
    console.log('[WeeklyScheduleTable] Go to current week');
    setCurrentWeekOffset(0);
    if (onWeekChange) {
      onWeekChange('current', getWeekRange(0));
    }
  };

  // Safely handle data
  const safeData = data || [];
  const hasData = safeData.length > 0;

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!hasData) {
      return {
        districts: ['All Districts'],
        zones: ['All Zones'],
        contracts: ['All Contracts'],
        vehicles: ['All Vehicles'],
        targetStatuses: ['All Target Statuses', 'Met Target', 'Below Target'],
      };
    }

    return {
      districts: ['All Districts', ...new Set(safeData.map(item => item.district).filter(Boolean))],
      zones: ['All Zones', ...new Set(safeData.map(item => item.zone).filter(Boolean))],
      contracts: ['All Contracts', ...new Set(safeData.map(item => item.contract).filter(Boolean))],
      vehicles: ['All Vehicles', ...new Set(safeData.map(item => item.vehicle).filter(Boolean))],
      targetStatuses: ['All Target Statuses', 'Met Target', 'Below Target'],
    };
  }, [safeData, hasData]);

  // Apply filters and search
  const filteredData = useMemo(() => {
    if (!hasData) return [];

    return safeData.filter(item => {
      // Search filter
      if (searchQuery) {
        const search = searchQuery.toLowerCase();
        const matchesSearch = 
          item.name?.toLowerCase().includes(search) ||
          item.id?.toLowerCase().includes(search) ||
          item.zone?.toLowerCase().includes(search) ||
          item.district?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // District filter
      if (filters.district !== 'All Districts' && item.district !== filters.district) {
        return false;
      }

      // Zone filter
      if (filters.zone !== 'All Zones' && item.zone !== filters.zone) {
        return false;
      }

      // Contract filter
      if (filters.contract !== 'All Contracts' && item.contract !== filters.contract) {
        return false;
      }

      // Vehicle filter
      if (filters.vehicle !== 'All Vehicles' && item.vehicle !== filters.vehicle) {
        return false;
      }

      // Target status filter
      if (filters.targetStatus !== 'All Target Statuses') {
        const metTarget = item.productivityPercentage >= 100;
        if (filters.targetStatus === 'Met Target' && !metTarget) return false;
        if (filters.targetStatus === 'Below Target' && metTarget) return false;
      }

      return true;
    });
  }, [safeData, hasData, filters, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Day tabs with counts (Indonesian)
  const dayTabs = [
    { id: 'full', label: 'Full Week (Sen-Min)', count: filteredData.length },
    { id: 'sen', label: 'Sen', count: filteredData.filter(c => c.activeDays?.sen).length },
    { id: 'sel', label: 'Sel', count: filteredData.filter(c => c.activeDays?.sel).length },
    { id: 'rab', label: 'Rab', count: filteredData.filter(c => c.activeDays?.rab).length },
    { id: 'kam', label: 'Kam', count: filteredData.filter(c => c.activeDays?.kam).length },
    { id: 'jum', label: 'Jum', count: filteredData.filter(c => c.activeDays?.jum).length },
    { id: 'sab', label: 'Sab', count: filteredData.filter(c => c.activeDays?.sab).length },
    { id: 'min', label: 'Min', count: filteredData.filter(c => c.activeDays?.min).length },
  ];

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page
  };

  const resetFilters = () => {
    setFilters({
      specificDate: 'All Specific Dates',
      district: 'All Districts',
      zone: 'All Zones',
      contract: 'All Contracts',
      vehicle: 'All Vehicles',
      targetStatus: 'All Target Statuses',
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Weekly Schedule Filter</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm text-indigo-600 font-medium">Monday - Sunday</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-green-600 font-medium">Unique Names • Weekly Avg Productivity</span>
                </div>
              </div>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleWeekChange('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex flex-col items-center">
              <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 min-w-[280px]">
                <p className="text-sm font-semibold text-gray-900 text-center">
                  Week: {formatWeekLabel()}
                </p>
                <p className="text-xs text-gray-500 text-center mt-0.5">
                  {currentWeekOffset === 0 
                    ? 'Current Week' 
                    : currentWeekOffset < 0 
                    ? `${Math.abs(currentWeekOffset)} week${Math.abs(currentWeekOffset) > 1 ? 's' : ''} ago`
                    : `${currentWeekOffset} week${currentWeekOffset > 1 ? 's' : ''} ahead`
                  }
                </p>
              </div>
              {currentWeekOffset !== 0 && (
                <button
                  onClick={goToCurrentWeek}
                  className="mt-1 flex items-center gap-1 px-2 py-1 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                >
                  <Calendar className="w-3 h-3" />
                  Go to Current Week
                </button>
              )}
            </div>

            <button
              onClick={() => handleWeekChange('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Active Week Info */}
        <div className="text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg inline-block">
          Active Week: Mon {currentWeekRange.monday.toLocaleDateString('en-GB')} to Sun {currentWeekRange.sunday.toLocaleDateString('en-GB')} | 
          <span className="font-medium text-blue-700 ml-1">
            {currentWeekOffset === 0 ? 'Current Week' : formatWeekLabel()}
          </span> | 
          <span className="text-gray-600 ml-1">({filteredData.length} unique couriers evaluated)</span>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-semibold text-gray-500 uppercase mr-2">HARI (SEN-MIN):</span>
          {dayTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedDay(tab.label)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedDay === tab.label
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs ${
                selectedDay === tab.label ? 'text-indigo-200' : 'text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search unique couriers by Name, Driver ID, District, or Zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <select
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {filterOptions.districts?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <select
            value={filters.zone}
            onChange={(e) => handleFilterChange('zone', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {filterOptions.zones?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <select
            value={filters.contract}
            onChange={(e) => handleFilterChange('contract', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {filterOptions.contracts?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <select
            value={filters.vehicle}
            onChange={(e) => handleFilterChange('vehicle', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {filterOptions.vehicles?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <select
            value={filters.targetStatus}
            onChange={(e) => handleFilterChange('targetStatus', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {filterOptions.targetStatuses?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Reset Filters
          </button>
        </div>

        {/* Active Filters Info */}
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-gray-500">Showing {paginatedData.length} of {filteredData.length} couriers</span>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-green-600 font-medium">Zero Duplicate Names</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-indigo-600 font-medium">Aggregated Weekly View</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                Unique Courier
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                District
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Zone
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contract
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px]">
                Weekly Productivity vs Target
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Avg Daily / Target
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Total Week Deliv
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Success %
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Active Days
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="12" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      {!hasData ? 'Tidak Ada Data untuk Week Ini' : 'Tidak Ada Data yang Sesuai Filter'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      {!hasData 
                        ? 'Tidak ada courier dengan aktivitas pada rentang tanggal yang dipilih. Coba pilih week yang berbeda.'
                        : 'Ubah filter atau pencarian untuk melihat data courier.'
                      }
                    </p>
                    {!hasData && currentWeekOffset !== 0 && (
                      <button
                        onClick={goToCurrentWeek}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                        Kembali ke Week Saat Ini
                      </button>
                    )}
                    {hasData && (
                      <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <Filter className="w-4 h-4" />
                        Reset Semua Filter
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((courier, index) => {
              const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
              const metTarget = (courier.productivityPercentage || 0) >= 100;
              const targetDiff = (courier.avgDaily || 0) - (courier.target || 0);

              return (
                <tr key={courier.id} className="hover:bg-gray-50 transition-colors">
                  {/* Row Number */}
                  <td className="px-4 py-4 text-sm text-gray-500 font-medium">
                    {rowNumber}
                  </td>

                  {/* Courier Info */}
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{courier.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">ID: {courier.id || '-'}</p>
                      <p className="text-xs text-blue-600">{courier.shiftsCount || 0} shifts in week</p>
                    </div>
                  </td>

                  {/* District */}
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {courier.district || '-'}
                  </td>

                  {/* Zone */}
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {courier.zone || 'N/A'}
                    </span>
                  </td>

                  {/* Contract */}
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      (courier.contract || '').includes('Dedicated')
                        ? 'bg-purple-100 text-purple-700'
                        : (courier.contract || '').includes('Plus')
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {courier.contract || 'N/A'}
                    </span>
                  </td>

                  {/* Vehicle */}
                  <td className="px-4 py-4 text-sm font-medium text-gray-700">
                    {courier.vehicle || 'N/A'}
                  </td>

                  {/* Weekly Productivity vs Target */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`font-bold ${metTarget ? 'text-green-700' : 'text-orange-700'}`}>
                          {courier.productivityPercentage?.toFixed(1)}%
                        </span>
                        <span className={`text-xs ${metTarget ? 'text-green-600' : 'text-orange-600'}`}>
                          {metTarget ? '✓ Met' : 'vs Target'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${metTarget ? 'bg-green-500' : 'bg-orange-500'}`}
                          style={{ width: `${Math.min(courier.productivityPercentage || 0, 100)}%` }}
                        />
                      </div>
                      <p className={`text-xs ${metTarget ? 'text-green-600' : 'text-orange-600'}`}>
                        {metTarget ? `+${targetDiff.toFixed(1)} /day` : `${targetDiff.toFixed(1)} /day`}
                      </p>
                    </div>
                  </td>

                  {/* Avg Daily / Target */}
                  <td className="px-4 py-4 text-right">
                    <p className="text-sm font-bold text-gray-900">{courier.avgDaily?.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">tgt: {courier.target?.toFixed(0)} /day</p>
                  </td>

                  {/* Total Week Deliv */}
                  <td className="px-4 py-4 text-right">
                    <p className="text-sm font-bold text-gray-900">{courier.totalWeekDeliv || 0}</p>
                    <p className="text-xs text-gray-500">of 1 SM</p>
                  </td>

                  {/* Success % */}
                  <td className="px-4 py-4 text-right">
                    <p className={`text-sm font-bold ${
                      courier.successRate >= 95 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {courier.successRate?.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">of 1 SM</p>
                  </td>

                  {/* Active Days */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      {[
                        { key: 'sen', label: 'S' },  // Senin
                        { key: 'sel', label: 'S' },  // Selasa
                        { key: 'rab', label: 'R' },  // Rabu
                        { key: 'kam', label: 'K' },  // Kamis
                        { key: 'jum', label: 'J' },  // Jumat
                        { key: 'sab', label: 'S' },  // Sabtu
                        { key: 'min', label: 'M' }   // Minggu
                      ].map(day => {
                        const isActive = courier.activeDays?.[day.key] || false;
                        return (
                          <div
                            key={day.key}
                            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                              isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-400'
                            }`}
                            title={`${day.key.charAt(0).toUpperCase() + day.key.slice(1)}: ${isActive ? 'Aktif' : 'Tidak Aktif'}`}
                          >
                            {day.label}
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="p-1 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        className="p-1 hover:bg-yellow-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-yellow-600" />
                      </button>
                      <button
                        className="p-1 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} couriers
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>

            <span className="text-sm text-gray-600 ml-2">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyScheduleTable;
