import { useEffect, useState, useMemo } from 'react';
import { Calendar, TrendingUp, Loader, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import googleSheetsService from '../../services/googleSheetsService';
import AchievementKPICard from '../dashboard/AchievementKPICard';

const DashboardMonthly = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedContract, setSelectedContract] = useState('Dedicated');
  const [selectedVehicle, setSelectedVehicle] = useState('2WH');
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyMetrics, setMonthlyMetrics] = useState(null);
  const [isFormulaExpanded, setIsFormulaExpanded] = useState(false); // Default collapsed
  
  const { rawCourierData, fetchDashboardData } = useDashboardStore();
  
  // Appeal targets
  const [appealTargetsMap, setAppealTargetsMap] = useState(null);
  const [useAppealTargets] = useState(true);
  const [hasAutoLoaded, setHasAutoLoaded] = useState(false);
  
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

  // Auto-load data on mount (after appealMap is ready)
  useEffect(() => {
    if (!hasAutoLoaded && selectedMonth && rawCourierData && appealTargetsMap) {
      setHasAutoLoaded(true);
      handleLoadMonthlyData();
    }
  }, [selectedMonth, rawCourierData, appealTargetsMap, hasAutoLoaded]);

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
        <p className="text-gray-600 dark:text-slate-400 text-lg font-medium">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Monthly Productivity Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">Monthly aggregated productivity metrics and trends</p>
        </div>
      </div>

      {/* Month and Filters Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Month Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Month
            </label>
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Contract Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Contract Type</label>
            <select
              value={selectedContract}
              onChange={(e) => setSelectedContract(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {availableContracts.map(contract => (
                <option key={contract} value={contract}>{contract}</option>
              ))}
            </select>
          </div>

          {/* Vehicle Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Vehicle Type</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
            <p className="text-sm text-gray-600 dark:text-slate-400">
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
          <p className="text-gray-600 dark:text-slate-400">Processing monthly data...</p>
        </div>
      )}

      {!isLoading && monthlyMetrics && (
        <>
          {/* Core KPI Cards - Compact Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Productivity 2WH KPI */}
            {monthlyMetrics.productivity2WHKPI && (
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">PRODUCTIVITY 2WH</h3>
                      <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded">
                        CORE KPI
                      </span>
                    </div>
                    <p className="text-indigo-100 text-xs">Avg: Dedicated 2WH + Kurir Plus 2WH</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-white">
                      {monthlyMetrics.productivity2WHKPI.achievement.toFixed(1)}%
                    </div>
                    <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold mt-1 ${
                      monthlyMetrics.productivity2WHKPI.achievement >= 100 ? 'bg-green-400 text-green-900' :
                      monthlyMetrics.productivity2WHKPI.achievement >= 75 ? 'bg-yellow-300 text-yellow-900' :
                      'bg-red-400 text-red-900'
                    }`}>
                      {monthlyMetrics.productivity2WHKPI.achievement >= 100 ? '✓ MET' :
                       monthlyMetrics.productivity2WHKPI.achievement >= 75 ? '◐ PROGRESS' :
                       '✗ BELOW'}
                    </div>
                  </div>
                </div>

                {/* Sub-metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Dedicated 2WH */}
                  <div className="bg-white dark:bg-slate-900/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-xs font-semibold">Dedicated</span>
                      <span className="text-white text-lg font-bold">
                        {monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.achievement.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-white dark:bg-slate-900 dark:bg-slate-900/20 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${
                          monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.achievement >= 100 ? 'bg-green-400' :
                          monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.achievement >= 75 ? 'bg-yellow-300' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${Math.min(monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.achievement, 100)}%` }}
                      />
                    </div>
                    <div className="text-indigo-100 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span>Avg:</span>
                        <span className="font-semibold">{monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.avg}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target:</span>
                        <span className="font-semibold">{monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.target}</span>
                      </div>
                      <div className="flex justify-between text-yellow-300">
                        <span>Thr 75%:</span>
                        <span className="font-semibold">{monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.threshold}</span>
                      </div>
                    </div>
                  </div>

                  {/* Kurir Plus 2WH */}
                  <div className="bg-white dark:bg-slate-900/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-xs font-semibold">Kurir Plus</span>
                      <span className="text-white text-lg font-bold">
                        {monthlyMetrics.productivity2WHKPI.subMetrics.kurirPlus.achievement.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-white dark:bg-slate-900 dark:bg-slate-900/20 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${
                          monthlyMetrics.productivity2WHKPI.subMetrics.kurirPlus.achievement >= 100 ? 'bg-green-400' :
                          monthlyMetrics.productivity2WHKPI.subMetrics.kurirPlus.achievement >= 75 ? 'bg-yellow-300' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${Math.min(monthlyMetrics.productivity2WHKPI.subMetrics.kurirPlus.achievement, 100)}%` }}
                      />
                    </div>
                    <div className="text-indigo-100 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span>Avg:</span>
                        <span className="font-semibold">{monthlyMetrics.productivity2WHKPI.subMetrics.kurirPlus.avg}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target:</span>
                        <span className="font-semibold">{monthlyMetrics.productivity2WHKPI.subMetrics.kurirPlus.target}</span>
                      </div>
                      <div className="flex justify-between text-yellow-300">
                        <span>Thr 75%:</span>
                        <span className="font-semibold">{monthlyMetrics.productivity2WHKPI.subMetrics.kurirPlus.threshold}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formula Toggle */}
                <button
                  onClick={() => setIsFormulaExpanded(!isFormulaExpanded)}
                  className="w-full mt-3 px-3 py-2 bg-white dark:bg-slate-900 dark:bg-slate-900/10 hover:bg-white dark:bg-slate-900/20 rounded-lg transition-colors text-indigo-100 text-xs font-medium flex items-center justify-between"
                >
                  <span>📊 View Calculation Formula</span>
                  {isFormulaExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}

            {/* Productivity 4WH Dedicated KPI */}
            {monthlyMetrics.productivity4WHDedicatedKPI && (
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">PRODUCTIVITY 4WH</h3>
                      <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded">
                        CORE KPI
                      </span>
                    </div>
                    <p className="text-purple-100 text-xs">Dedicated 4WH Only</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-black text-white">
                      {monthlyMetrics.productivity4WHDedicatedKPI.achievement.toFixed(1)}%
                    </div>
                    <div className={`inline-block px-2 py-1 rounded text-[10px] font-bold mt-1 ${
                      monthlyMetrics.productivity4WHDedicatedKPI.achievement >= 100 ? 'bg-green-400 text-green-900' :
                      monthlyMetrics.productivity4WHDedicatedKPI.achievement >= 75 ? 'bg-yellow-300 text-yellow-900' :
                      'bg-red-400 text-red-900'
                    }`}>
                      {monthlyMetrics.productivity4WHDedicatedKPI.achievement >= 100 ? '✓ MET' :
                       monthlyMetrics.productivity4WHDedicatedKPI.achievement >= 75 ? '◐ PROGRESS' :
                       '✗ BELOW'}
                    </div>
                  </div>
                </div>

                {/* Metrics Card */}
                <div className="bg-white dark:bg-slate-900/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  {/* Progress Bar */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-semibold">Dedicated 4WH</span>
                    <span className="text-white text-xl font-bold">
                      {monthlyMetrics.productivity4WHDedicatedKPI.subMetrics.achievement.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-white dark:bg-slate-900 dark:bg-slate-900/20 rounded-full h-2.5 mb-4">
                    <div 
                      className={`h-2.5 rounded-full ${
                        monthlyMetrics.productivity4WHDedicatedKPI.subMetrics.achievement >= 100 ? 'bg-green-400' :
                        monthlyMetrics.productivity4WHDedicatedKPI.subMetrics.achievement >= 75 ? 'bg-yellow-300' :
                        'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(monthlyMetrics.productivity4WHDedicatedKPI.subMetrics.achievement, 100)}%` }}
                    />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900/5 rounded p-2">
                      <p className="text-purple-200 text-[10px] mb-1">Avg Productivity</p>
                      <p className="text-white text-lg font-bold">
                        {monthlyMetrics.productivity4WHDedicatedKPI.subMetrics.avg}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900/5 rounded p-2">
                      <p className="text-purple-200 text-[10px] mb-1">Target</p>
                      <p className="text-white text-lg font-bold">
                        {monthlyMetrics.productivity4WHDedicatedKPI.subMetrics.target}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900/5 rounded p-2">
                      <p className="text-purple-200 text-[10px] mb-1">Threshold 75%</p>
                      <p className="text-yellow-300 text-lg font-bold">
                        {monthlyMetrics.productivity4WHDedicatedKPI.subMetrics.threshold}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900/5 rounded p-2">
                      <p className="text-purple-200 text-[10px] mb-1">Total Shifts</p>
                      <p className="text-white text-lg font-bold">
                        {monthlyMetrics.productivity4WHDedicatedKPI.subMetrics.shifts.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Calculation Formula - Collapsible */}
          {monthlyMetrics.productivity2WHKPI && isFormulaExpanded && (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200 dark:border-slate-800">
                <h4 className="text-gray-900 dark:text-slate-100 font-bold text-sm flex items-center gap-2">
                  📊 Detailed Calculation Formula - Productivity 2WH KPI
                </h4>
              </div>
              <div className="p-5 space-y-4">
                {/* Step 1 */}
                <div className="pb-4 border-b border-gray-200 dark:border-slate-800">
                  <h5 className="text-indigo-600 font-semibold text-sm mb-2">Step 1: Calculate Average Productivity</h5>
                  <div className="text-gray-700 dark:text-slate-300 text-xs space-y-1 ml-3">
                    <p className="font-mono bg-gray-50 dark:bg-slate-800 p-2 rounded border border-gray-200 dark:border-slate-800">Avg Productivity = Total Delivered ÷ Total Active Shifts</p>
                    <p className="mt-2">Example for Dedicated 2WH:</p>
                    <p className="ml-2">• Total Delivered: {monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.delivered.toLocaleString()}</p>
                    <p className="ml-2">• Total Shifts: {monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.shifts.toLocaleString()}</p>
                    <p className="ml-2">• <span className="text-gray-900 dark:text-slate-100 font-semibold">Result: {monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.avg}</span> per shift</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="pb-4 border-b border-gray-200 dark:border-slate-800">
                  <h5 className="text-indigo-600 font-semibold text-sm mb-2">Step 2: Get Target (Appeal → Original)</h5>
                  <div className="text-gray-700 dark:text-slate-300 text-xs space-y-1 ml-3">
                    <p>Priority: <span className="font-semibold">Appeal Target</span> (Supabase) → <span className="font-semibold">Monday Original</span> (Raw data)</p>
                    <p className="ml-2">• Dedicated 2WH Target: {monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.target}</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="pb-4 border-b border-gray-200 dark:border-slate-800">
                  <h5 className="text-indigo-600 font-semibold text-sm mb-2">Step 3: Calculate Threshold (75%)</h5>
                  <div className="text-gray-700 dark:text-slate-300 text-xs space-y-1 ml-3">
                    <p className="font-mono bg-gray-50 dark:bg-slate-800 p-2 rounded border border-gray-200 dark:border-slate-800">Threshold = Target × 0.75</p>
                    <p className="ml-2">• Dedicated 2WH: {monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.threshold} = {monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.target} × 0.75</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="pb-4 border-b border-gray-200 dark:border-slate-800">
                  <h5 className="text-indigo-600 font-semibold text-sm mb-2">Step 4: Apply Threshold Formula</h5>
                  <div className="text-gray-700 dark:text-slate-300 text-xs space-y-1 ml-3">
                    <p className="font-mono bg-gray-50 dark:bg-slate-800 p-2 rounded border border-gray-200 dark:border-slate-800">Achievement = (Result − Threshold) ÷ (Target − Threshold) × 100%</p>
                    <p className="mt-2">Then cap between 0-100%</p>
                    <p className="ml-2 mt-2">Example for Dedicated 2WH:</p>
                    <p className="ml-2">• Result: {monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.avg}</p>
                    <p className="ml-2">• Threshold: {monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.threshold}</p>
                    <p className="ml-2">• Target: {monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.target}</p>
                    <p className="ml-2">• Achievement: <span className="text-gray-900 dark:text-slate-100 font-bold">{monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.achievement.toFixed(1)}%</span></p>
                  </div>
                </div>

                {/* Step 5 */}
                <div>
                  <h5 className="text-indigo-600 font-semibold text-sm mb-2">Step 5: Average Both Contract Types</h5>
                  <div className="text-gray-700 dark:text-slate-300 text-xs space-y-1 ml-3">
                    <p className="font-mono bg-gray-50 dark:bg-slate-800 p-2 rounded border border-gray-200 dark:border-slate-800">Final KPI = (Dedicated Achievement + Kurir Plus Achievement) ÷ 2</p>
                    <p className="mt-2">Current calculation:</p>
                    <p className="ml-2">• Dedicated: {monthlyMetrics.productivity2WHKPI.subMetrics.dedicated.achievement.toFixed(1)}%</p>
                    <p className="ml-2">• Kurir Plus: {monthlyMetrics.productivity2WHKPI.subMetrics.kurirPlus.achievement.toFixed(1)}%</p>
                    <p className="ml-2 mt-1">• <span className="text-indigo-600 font-bold text-base">Final = {monthlyMetrics.productivity2WHKPI.achievement}%</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats Grid */}
          {monthlyMetrics.summary && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Delivered</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{monthlyMetrics.summary.totalDelivered.toLocaleString()}</p>
                <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">Parcels delivered this month</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400">Active Shifts</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{monthlyMetrics.summary.totalActiveShifts.toLocaleString()}</p>
                <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">Total active courier shifts</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400">Avg Daily Productivity</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                  {monthlyMetrics.summary.avgProductivity != null 
                    ? monthlyMetrics.summary.avgProductivity.toFixed(1) 
                    : '0.0'}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">Delivered per shift</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-indigo-200 p-6 bg-indigo-50">
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

              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-slate-400">Operating Days</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-slate-100">{monthlyMetrics.summary.operatingDays}</p>
                <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">Days with activity</p>
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
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Daily Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-800">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Day</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Delivered</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Shifts</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Productivity</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Target</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-slate-300">Achievement</th>
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
                        <tr key={index} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:bg-slate-800">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-slate-100">{day.date}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-slate-400">{day.dayName}</td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-slate-100">{day.delivered.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-gray-600 dark:text-slate-400">{day.activeShifts}</td>
                          <td className={`py-3 px-4 text-right font-semibold ${isAboveTarget ? 'text-green-700' : 'text-gray-900 dark:text-slate-100'}`}>
                            {day.avgProductivity.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-right text-indigo-700 font-medium">{day.target.toFixed(1)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-1 rounded-md font-semibold ${achievementColor}`}>
                              {day.pureAchievement.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 dark:bg-slate-800 border-t-2 border-gray-300 dark:border-slate-700">
                      <td className="py-3 px-4 font-bold text-gray-900 dark:text-slate-100" colSpan="2">TOTAL / AVERAGE</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-slate-100">{monthlyMetrics.summary.totalDelivered.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-slate-100">{monthlyMetrics.summary.totalActiveShifts}</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-900">{monthlyMetrics.summary.avgProductivity.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-700">{monthlyMetrics.summary.avgTarget.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-900">
                        {monthlyMetrics.achievement.pureAchievement.toFixed(1)}%
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">Select Month and Load Data</h3>
            <p className="text-gray-600 dark:text-slate-400">
              Choose a month and click "Load Data" to view monthly productivity metrics
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMonthly;
