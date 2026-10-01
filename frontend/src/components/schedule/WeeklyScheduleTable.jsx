import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, CheckCircle, XCircle, Eye, Edit, Trash2, Calendar } from 'lucide-react';

/**
 * Weekly Schedule Table Component
 * Displays courier schedule data in table format
 * Filters are now managed by DashboardFilters component
 */
function WeeklyScheduleTable({ data }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState('Full Week (Sen-Min)');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Safely handle data
  const safeData = data || [];
  const hasData = safeData.length > 0;

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  // Apply search filter and sorting
  const filteredData = useMemo(() => {
    if (!hasData) return [];

    let result = safeData.filter(item => {
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

      return true;
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle null/undefined values
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';

        // String comparison for text fields
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [safeData, hasData, searchQuery, sortConfig]);

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

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Weekly Courier Schedule</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-indigo-600 font-medium">Productivity Overview</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-green-600 font-medium">{filteredData.length} couriers</span>
            </div>
          </div>
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

      {/* Search Bar */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search couriers by Name, Driver ID, District, or Zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Active Filters Info */}
        <div className="flex items-center gap-2 text-xs">
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
              <th 
                onClick={() => handleSort('name')}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px] cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Unique Courier
                  {getSortIcon('name')}
                </div>
              </th>
              <th 
                onClick={() => handleSort('district')}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  District
                  {getSortIcon('district')}
                </div>
              </th>
              <th 
                onClick={() => handleSort('zone')}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Zone
                  {getSortIcon('zone')}
                </div>
              </th>
              <th 
                onClick={() => handleSort('contract')}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Contract
                  {getSortIcon('contract')}
                </div>
              </th>
              <th 
                onClick={() => handleSort('vehicle')}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Vehicle
                  {getSortIcon('vehicle')}
                </div>
              </th>
              <th 
                onClick={() => handleSort('productivityPercentage')}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  Weekly Productivity vs Target
                  {getSortIcon('productivityPercentage')}
                </div>
              </th>
              <th 
                onClick={() => handleSort('avgDaily')}
                className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  Avg Daily / Target
                  {getSortIcon('avgDaily')}
                </div>
              </th>
              <th 
                onClick={() => handleSort('totalWeekDeliv')}
                className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  Total Week Deliv
                  {getSortIcon('totalWeekDeliv')}
                </div>
              </th>
              <th 
                onClick={() => handleSort('successRate')}
                className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  Success %
                  {getSortIcon('successRate')}
                </div>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} couriers
            </div>
            
            {/* Rows per page selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="rows-per-page" className="text-sm text-gray-600">
                Rows per page:
              </label>
              <select
                id="rows-per-page"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
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
