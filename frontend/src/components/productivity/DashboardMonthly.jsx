import { useEffect, useState, useMemo } from 'react';
import { Calendar, TrendingUp, Loader, AlertCircle } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import googleSheetsService from '../../services/googleSheetsService';
import AchievementKPICard from '../dashboard/AchievementKPICard';

const DashboardMonthly = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedContract, setSelectedContract] = useState('Dedicated');
  const [selectedVehicle, setSelectedVehicle] = useState('2WH');
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyMetrics, setMonthlyMetrics] = useState(null);
  
  const { rawCourierData, fetchDashboardData } = useDashboardStore();
  
  // Appeal targets
  const [appealTargetsMap, setAppealTargetsMap] = useState(null);
  const [useAppealTargets] = useState(true);
  
  useEffect(() => {
    // Set default to current month
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${yyyy}-${mm}`);
  }, []);

  // Load raw data on mount
  useEffect(() => {
    if (!rawCourierData) {
      fetchDashboardData(null);
    }
    loadAppealMap();
  }, [rawCourierData, fetchDashboardData]);

  const loadAppealMap = async () => {
    const map = await googleSheetsService.loadAppealTargetsMap();
    setAppealTargetsMap(map);
  };

  // Re-load appeal map periodically
  useEffect(() => {
    const interval = setInterval(() => {
      loadAppealMap();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Remove auto-load on filter change - only load when button clicked

  const handleLoadMonthlyData = () => {
    if (!selectedMonth || !rawCourierData) return;

    setIsLoading(true);
    
    try {
      // Parse selected month (YYYY-MM format)
      const [year, month] = selectedMonth.split('-').map(Number);
      
      // Get month start and end dates
      const monthStart = new Date(year, month - 1, 1); // First day of month
      const monthEnd = new Date(year, month, 0); // Last day of month
      monthEnd.setHours(23, 59, 59, 999);
      
      // Process monthly metrics using same approach as weekly but with month boundaries
      const metrics = googleSheetsService.processMonthlyMetrics(rawCourierData, {
        dateRange: { start: monthStart, end: monthEnd },
        contract: selectedContract,
        vehicle: selectedVehicle,
        useAppeal: useAppealTargets,
        appealMap: appealTargetsMap,
      });
      
      setMonthlyMetrics(metrics);
    } catch (error) {
      console.error('Error processing monthly data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format month display
  const formatMonthDisplay = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Get available contracts and vehicles from raw data
  const availableContracts = useMemo(() => {
    if (!rawCourierData) return ['Dedicated', 'Kurir Plus', 'Mitra'];
    const contracts = new Set(rawCourierData.map(row => row[5]).filter(Boolean));
    return Array.from(contracts).sort();
  }, [rawCourierData]);

  const availableVehicles = useMemo(() => {
    if (!rawCourierData) return ['2WH', '4WH'];
    const vehicles = new Set(rawCourierData.map(row => row[6]).filter(Boolean));
    return Array.from(vehicles).sort();
  }, [rawCourierData]);

  if (!rawCourierData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg font-medium">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monthly Productivity Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Monthly aggregated productivity metrics and trends</p>
        </div>
      </div>

      {/* Month and Filters Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Month Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Month
            </label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Contract Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contract Type</label>
            <select
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {availableContracts.map(contract => (
                <option key={contract} value={contract}>{contract}</option>
              ))}
            </select>
          </div>

          {/* Vehicle Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {availableVehicles.map(vehicle => (
                <option key={vehicle} value={vehicle}>{vehicle}</option>
              ))}
            </select>
          </div>

          {/* Load Button */}
          <div className="flex items-end">
            <button 
              onClick={handleLoadMonthlyData}
              disabled={isLoading}
              className="w-full px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Load Data
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selected Month Display */}
        {selectedMonth && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing data for: <span className="font-semibold text-indigo-600">{formatMonthDisplay(selectedMonth)}</span>
              {' '} | {selectedContract} | {selectedVehicle}
            </p>
          </div>
        )}
      </div>

      {/* Monthly Metrics */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
          <p className="text-gray-600">Processing monthly data...</p>
        </div>
      )}

      {!isLoading && monthlyMetrics && (
        <>
          {/* Achievement KPI Card */}
          {monthlyMetrics.achievement && (
            <AchievementKPICard achievement={monthlyMetrics.achievement} />
          )}

          {/* Summary Stats Grid */}
          {monthlyMetrics.summary && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Delivered</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{monthlyMetrics.summary.totalDelivered.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Parcels delivered this month</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Active Shifts</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{monthlyMetrics.summary.totalActiveShifts.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Total active courier shifts</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Avg Daily Productivity</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {monthlyMetrics.summary.avgProductivity != null 
                    ? monthlyMetrics.summary.avgProductivity.toFixed(1) 
                    : '0.0'}
                </p>
                <p className="text-sm text-gray-500 mt-1">Delivered per shift</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-indigo-200 p-6 bg-indigo-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-indigo-700">Monthly Target</h3>
                </div>
                <p className="text-3xl font-bold text-indigo-900">
                  {monthlyMetrics.summary.avgTarget != null 
                    ? monthlyMetrics.summary.avgTarget.toFixed(1) 
                    : '0.0'}
                </p>
                <p className="text-sm text-indigo-600 mt-1">Target per shift (avg)</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Operating Days</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{monthlyMetrics.summary.operatingDays}</p>
                <p className="text-sm text-gray-500 mt-1">Days with activity</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Monthly Calculation Method</p>
                <p className="text-blue-700">
                  Monthly Achievement = Total Delivered ÷ Total Active Shifts (daily active manpower).
                  Cross-month weeks are split by month boundaries with daily targets from appeal or Monday baseline.
                  Threshold-based achievement calculation applies (75% threshold).
                </p>
              </div>
            </div>
          </div>

          {/* Daily Breakdown Table */}
          {monthlyMetrics.dailyBreakdown && monthlyMetrics.dailyBreakdown.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Day</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Delivered</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Shifts</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg/Shift</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Target</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Achievement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyMetrics.dailyBreakdown.map((day, index) => {
                      const achievementColor = 
                        day.achievement >= 100 ? 'text-green-700 bg-green-50' :
                        day.achievement >= 75 ? 'text-yellow-700 bg-yellow-50' :
                        day.achievement >= 50 ? 'text-orange-700 bg-orange-50' :
                        'text-red-700 bg-red-50';

                      const isAboveTarget = day.avgProductivity >= day.target;

                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{day.date}</td>
                          <td className="py-3 px-4 text-gray-600">{day.dayName}</td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">{day.delivered.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-gray-600">{day.activeShifts}</td>
                          <td className={`py-3 px-4 text-right font-semibold ${isAboveTarget ? 'text-green-700' : 'text-gray-900'}`}>
                            {day.avgProductivity.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-right text-indigo-700 font-medium">{day.target.toFixed(1)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-1 rounded-md font-semibold ${achievementColor}`}>
                              {day.achievement.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-300">
                      <td className="py-3 px-4 font-bold text-gray-900" colSpan="2">TOTAL / AVERAGE</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">{monthlyMetrics.summary.totalDelivered.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">{monthlyMetrics.summary.totalActiveShifts}</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-900">{monthlyMetrics.summary.avgProductivity.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-700">{monthlyMetrics.summary.avgTarget.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-900">
                        {monthlyMetrics.achievement.achievement.toFixed(1)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!isLoading && !monthlyMetrics && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border-2 border-dashed border-indigo-200 p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Month and Load Data</h3>
            <p className="text-gray-600">
              Choose a month and click "Load Data" to view monthly productivity metrics
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMonthly;
