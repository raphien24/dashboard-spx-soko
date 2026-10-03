import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, CheckCircle, XCircle, Calendar, Download, ChevronDown } from 'lucide-react';
import CourierDetailModal from './CourierDetailModal';
import html2canvas from 'html2canvas';

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
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const tableRef = useRef(null);

  // Safely handle data
  const safeData = data || [];
  const hasData = safeData.length > 0;

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

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

  // Export functions
  const exportToImage = async (filterType) => {
    setIsExporting(true);
    setShowExportMenu(false);

    try {
      // Determine which couriers to export based on filter
      let exportData = [];
      let exportLabel = '';
      
      switch(filterType) {
        case 'achieved':
          exportData = filteredData.filter(c => (c.productivityPercentage || 0) >= 100);
          exportLabel = 'Achieved Target';
          break;
        case 'not-achieved':
          exportData = filteredData.filter(c => (c.productivityPercentage || 0) < 100);
          exportLabel = 'Not Achieved Target';
          break;
        case 'all':
        default:
          exportData = filteredData;
          exportLabel = 'All Filtered';
          break;
      }

      if (exportData.length === 0) {
        alert(`No couriers found for: ${exportLabel}`);
        setIsExporting(false);
        return;
      }

      // Find latest date from courier shifts data
      let latestDate = null;
      exportData.forEach(courier => {
        if (courier.shifts && courier.shifts.length > 0) {
          courier.shifts.forEach(shift => {
            const shiftDate = shift.parsedDate || new Date(shift.date);
            if (!latestDate || shiftDate > latestDate) {
              latestDate = shiftDate;
            }
          });
        }
      });

      // Format date same as dashboard header: "2 Oct 2026"
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const lastUpdateDate = latestDate 
        ? `${latestDate.getDate()} ${monthNames[latestDate.getMonth()]} ${latestDate.getFullYear()}`
        : 'N/A';

      // Create temporary container for export
      const exportContainer = document.createElement('div');
      exportContainer.style.position = 'fixed';
      exportContainer.style.left = '-9999px';
      exportContainer.style.top = '0';
      exportContainer.style.width = '1400px';
      exportContainer.style.backgroundColor = 'white';
      exportContainer.style.padding = '20px';
      document.body.appendChild(exportContainer);

      exportContainer.innerHTML = `
        <div style="font-family: system-ui, -apple-system, sans-serif;">
          <!-- Header -->
          <div style="border-bottom: 3px solid #4F46E5; padding-bottom: 16px; margin-bottom: 20px;">
            <h1 style="font-size: 24px; font-weight: bold; color: #1F2937; margin: 0 0 8px 0;">
              SPX SOKO - Weekly Courier Productivity
            </h1>
            <div style="display: flex; gap: 16px; font-size: 14px; color: #6B7280;">
              <span><strong>Export Type:</strong> ${exportLabel}</span>
              <span>•</span>
              <span><strong>Total Couriers:</strong> ${exportData.length}</span>
              <span>•</span>
              <span><strong>Last Updated:</strong> ${lastUpdateDate}</span>
            </div>
          </div>

          <!-- Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #F3F4F6; border-bottom: 2px solid #E5E7EB;">
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #374151;">#</th>
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #374151;">Courier Name</th>
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #374151;">ID</th>
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #374151;">District</th>
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #374151;">Zone</th>
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #374151;">Contract</th>
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #374151;">Vehicle</th>
                <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151;">Avg Daily</th>
                <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151;">+/- Per Day</th>
                <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151;">Productivity</th>
                <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151;">Total Deliv</th>
                ${filterType === 'not-achieved' ? '<th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151;">Pkgs Needed</th>' : ''}
                <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151;">Success %</th>
              </tr>
            </thead>
            <tbody>
              ${exportData.map((courier, index) => {
                const metTarget = (courier.productivityPercentage || 0) >= 100;
                const bgColor = index % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
                const prodColor = metTarget ? '#059669' : '#EA580C';
                
                // Calculate +/- per day
                const diffPerDay = (courier.avgDaily || 0) - (courier.target || 0);
                const diffColor = diffPerDay >= 0 ? '#059669' : '#EA580C';
                const diffSign = diffPerDay >= 0 ? '+' : '';
                
                // Calculate packages needed to achieve target (for not achieved only)
                const shiftsLeft = courier.shiftsCount || 0;
                const currentTotal = courier.totalWeekDeliv || 0;
                const targetWeekly = (courier.target || 0) * shiftsLeft;
                const packagesNeeded = Math.max(0, Math.ceil(targetWeekly - currentTotal));
                
                return `
                  <tr style="background-color: ${bgColor}; border-bottom: 1px solid #E5E7EB;">
                    <td style="padding: 10px 8px; color: #6B7280;">${index + 1}</td>
                    <td style="padding: 10px 8px; font-weight: 600; color: #111827;">${courier.name || 'Unknown'}</td>
                    <td style="padding: 10px 8px; color: #6B7280;">${courier.id || '-'}</td>
                    <td style="padding: 10px 8px; color: #6B7280;">${courier.district || '-'}</td>
                    <td style="padding: 10px 8px; color: #6B7280;">${courier.zone || 'N/A'}</td>
                    <td style="padding: 10px 8px; color: #6B7280;">${courier.contract || 'N/A'}</td>
                    <td style="padding: 10px 8px; color: #6B7280;">${courier.vehicle || 'N/A'}</td>
                    <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: #4F46E5;">${courier.avgDaily?.toFixed(1) || 0}</td>
                    <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: ${diffColor};">${diffSign}${diffPerDay.toFixed(1)}</td>
                    <td style="padding: 10px 8px; text-align: right; font-weight: 700; color: ${prodColor};">${courier.productivityPercentage?.toFixed(1) || 0}%</td>
                    <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: #111827;">${courier.totalWeekDeliv || 0}</td>
                    ${filterType === 'not-achieved' ? `<td style="padding: 10px 8px; text-align: right; font-weight: 700; color: #DC2626;">${packagesNeeded}</td>` : ''}
                    <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: ${courier.successRate >= 95 ? '#059669' : '#D97706'};">${courier.successRate?.toFixed(1) || 0}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Footer -->
          <div style="margin-top: 20px; padding-top: 16px; border-top: 2px solid #E5E7EB; font-size: 11px; color: #6B7280; text-align: center;">
            Generated from SPX SOKO Dashboard • Last Updated: ${lastUpdateDate}
          </div>
        </div>
      `;

      // Capture with html2canvas
      const canvas = await html2canvas(exportContainer, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1400,
      });

      // Remove temp container
      document.body.removeChild(exportContainer);

      // Download image
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `SPX-SOKO-Couriers-${exportLabel.replace(/\s+/g, '-')}-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
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

          {/* Export Button with Dropdown */}
          <div className="relative export-menu-container">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting || filteredData.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export to Image'}
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showExportMenu && !isExporting && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-100">
                    Export Options
                  </div>
                  
                  <button
                    onClick={() => exportToImage('achieved')}
                    className="w-full flex items-start gap-3 px-3 py-3 hover:bg-green-50 rounded-lg transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Achieved Target</p>
                      <p className="text-xs text-gray-500">
                        {filteredData.filter(c => (c.productivityPercentage || 0) >= 100).length} couriers
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => exportToImage('not-achieved')}
                    className="w-full flex items-start gap-3 px-3 py-3 hover:bg-orange-50 rounded-lg transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Not Achieved Target</p>
                      <p className="text-xs text-gray-500">
                        {filteredData.filter(c => (c.productivityPercentage || 0) < 100).length} couriers
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => exportToImage('all')}
                    className="w-full flex items-start gap-3 px-3 py-3 hover:bg-indigo-50 rounded-lg transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Filter className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">All Filtered Couriers</p>
                      <p className="text-xs text-gray-500">
                        {filteredData.length} couriers
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="11" className="px-4 py-12 text-center">
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
                <tr 
                  key={courier.id} 
                  onClick={() => setSelectedCourier(courier)}
                  className="hover:bg-indigo-50 transition-colors cursor-pointer"
                >
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

      {/* Courier Detail Modal */}
      {selectedCourier && (
        <CourierDetailModal 
          courier={selectedCourier} 
          onClose={() => setSelectedCourier(null)} 
        />
      )}
    </div>
  );
}

export default WeeklyScheduleTable;
