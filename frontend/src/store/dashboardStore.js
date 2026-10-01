import { create } from 'zustand';
import googleSheetsService from '../services/googleSheetsService';

/**
 * Dashboard Store using Zustand
 * Strategy: Load ALL raw data once, filter client-side for instant week navigation
 */
const useDashboardStore = create((set, get) => ({
  // Raw data cache (loaded once)
  rawCourierData: null,
  
  // Computed/filtered data
  kpiMetrics: null,
  summaryMetrics: null,
  performanceData: null,
  zonesData: null,
  fleetData: null,
  courierSchedule: null,

  // Loading states
  isLoading: false,
  isRefreshing: false,
  isFiltering: false, // NEW: Loading state for filter application
  error: null,

  // Last updated timestamp
  lastUpdated: null,

  // Current active date range filter
  activeDateRange: null,

  // Active filters (applied filters)
  activeFilters: {
    dateRange: null,
    contract: 'all',
    vehicle: 'all',
  },

  // Filter states (for UI compatibility - may be deprecated)
  filters: {
    dateRange: {
      start: null,
      end: null,
    },
    zone: 'all',
    contract: 'all',
    vehicle: 'all',
    targetStatus: 'all',
  },

  /**
   * Set filter and recompute dashboard
   */
  setFilter: (filterName, filterValue) => {
    console.log('[Store] Setting filter:', filterName, '=', filterValue);
    
    set({ 
      filters: { 
        ...get().filters, 
        [filterName]: filterValue 
      } 
    });
    
    // Recompute with new filters
    const { activeDateRange, filters } = get();
    const updatedFilters = {
      dateRange: activeDateRange,
      contract: filterName === 'contract' ? filterValue : filters.contract,
      vehicle: filterName === 'vehicle' ? filterValue : filters.vehicle,
    };
    
    get().computeDashboardData(updatedFilters);
  },

  /**
   * Load ALL raw data from Google Sheets once
   */
  loadRawData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('[Store] Loading ALL raw data from Google Sheets...');
      const rawData = await googleSheetsService.getRange('raw!A2:Z'); // No row limit - fetch all data
      console.log('[Store] Loaded', rawData?.length || 0, 'rows');
      
      // Log first and last row dates to verify full range
      if (rawData && rawData.length > 0) {
        const firstDate = rawData[0][3]; // First row date
        const lastDate = rawData[rawData.length - 1][3]; // Last row date
        console.log('[Store] Data date range:', { firstDate, lastDate, totalRows: rawData.length });
      }
      
      // Detect date range from actual data
      const dateRange = get().detectDateRangeFromData(rawData);
      console.log('[Store] Detected date range from data:', dateRange);
      
      set({
        rawCourierData: rawData,
        isLoading: false,
        lastUpdated: new Date(),
        error: null,
      });
      
      // Compute initial metrics (no date filter = show all data)
      await get().computeDashboardData(null);
      
      return true;
    } catch (error) {
      console.error('[Store] Error loading raw data:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to load raw data',
      });
      return false;
    }
  },

  /**
   * Detect earliest and latest dates from raw data
   */
  detectDateRangeFromData: (rawData) => {
    if (!rawData || rawData.length === 0) return null;
    
    const dates = [];
    
    rawData.forEach(row => {
      const dateStr = row[3]; // Date column (MM/DD/YYYY)
      if (dateStr) {
        const date = googleSheetsService.parseDate(dateStr);
        if (date) {
          dates.push(date);
        }
      }
    });
    
    if (dates.length === 0) return null;
    
    // Sort dates
    dates.sort((a, b) => a - b);
    
    const earliest = dates[0];
    const latest = dates[dates.length - 1];
    
    console.log('[detectDateRangeFromData] Data range:', {
      earliest: earliest.toISOString(),
      latest: latest.toISOString(),
      totalDates: dates.length
    });
    
    return { earliest, latest };
  },

  /**
   * Compute ALL dashboard data from cached raw data (INSTANT - no API call)
   */
  computeDashboardData: async (filtersOrDateRange) => {
    const { rawCourierData, filters: storeFilters } = get();
    
    if (!rawCourierData || rawCourierData.length === 0) {
      console.warn('[Store] No raw data available to compute dashboard');
      set({ 
        kpiMetrics: null,
        summaryMetrics: null,
        performanceData: null,
        zonesData: null,
        courierSchedule: [],
      });
      return;
    }
    
    // Handle both old signature (dateRange only) and new signature (filters object)
    let filters = {};
    if (filtersOrDateRange && filtersOrDateRange.dateRange !== undefined) {
      // New signature: full filters object
      filters = filtersOrDateRange;
    } else if (filtersOrDateRange && (filtersOrDateRange.start || filtersOrDateRange.end)) {
      // Old signature: dateRange object only
      filters = { dateRange: filtersOrDateRange };
    } else {
      // Use current store filters
      filters = {
        dateRange: filtersOrDateRange,
        contract: storeFilters.contract,
        vehicle: storeFilters.vehicle,
      };
    }
    
    console.log('[Store] Computing dashboard data with filters:', filters);
    const startTime = performance.now();
    
    // Set filtering state
    set({ isFiltering: true });
    
    try {
      // Use client-side processing for KPI and Summary (respects all filters)
      const kpiMetrics = googleSheetsService.processKPIMetricsFromRaw(rawCourierData, filters);
      const summaryMetrics = googleSheetsService.processSummaryMetricsFromRaw(rawCourierData, filters);
      
      // Charts still use API (only date filter - will refactor later if needed)
      const apiFilters = filters.dateRange ? { dateRange: filters.dateRange } : {};
      const [performanceData, zonesData] = await Promise.all([
        googleSheetsService.getPerformanceByContract(apiFilters),
        googleSheetsService.getTopZones(apiFilters),
      ]);
      
      // Compute courier schedule from cached raw data (client-side filtering)
      const courierSchedule = googleSheetsService.processCourierScheduleFromRaw(
        rawCourierData, 
        filters.dateRange,
        { contract: filters.contract, vehicle: filters.vehicle }
      );
      
      const endTime = performance.now();
      console.log('[Store] Dashboard computed in', (endTime - startTime).toFixed(2), 'ms');
      console.log('[Store] Results:', {
        kpiMetrics: !!kpiMetrics,
        summaryMetrics: !!summaryMetrics,
        performanceData: performanceData?.length || 0,
        zonesData: zonesData?.length || 0,
        courierSchedule: courierSchedule?.length || 0,
      });
      
      set({
        kpiMetrics,
        summaryMetrics,
        performanceData,
        zonesData,
        courierSchedule,
        activeDateRange: filters.dateRange,
        activeFilters: filters, // ✅ Save all active filters for refresh
        lastUpdated: new Date(),
        isFiltering: false, // Clear filtering state
      });
    } catch (error) {
      console.error('[Store] Error computing dashboard:', error);
      set({ 
        kpiMetrics: null,
        summaryMetrics: null,
        performanceData: null,
        zonesData: null,
        courierSchedule: [],
        isFiltering: false, // Clear filtering state even on error
      });
    }
  },

  /**
   * Compute courier schedule from cached raw data (INSTANT - no API call)
   */
  computeCourierSchedule: (dateRange) => {
    const { rawCourierData } = get();
    
    if (!rawCourierData || rawCourierData.length === 0) {
      console.warn('[Store] No raw data available to compute schedule');
      set({ courierSchedule: [] });
      return;
    }
    
    console.log('[Store] Computing courier schedule for date range:', dateRange);
    const startTime = performance.now();
    
    try {
      // Process courier schedule with client-side filtering
      const schedule = googleSheetsService.processCourierScheduleFromRaw(rawCourierData, dateRange);
      
      const endTime = performance.now();
      console.log('[Store] Schedule computed in', (endTime - startTime).toFixed(2), 'ms');
      console.log('[Store] Result:', schedule.length, 'couriers');
      
      set({
        courierSchedule: schedule,
        activeDateRange: dateRange,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('[Store] Error computing schedule:', error);
      set({ courierSchedule: [] });
    }
  },

  /**
   * Set date range and recompute (INSTANT - no loading)
   */
  setDateRange: (dateRangeObj) => {
    const dateRange = dateRangeObj && dateRangeObj.start && dateRangeObj.end ? dateRangeObj : null;
    
    console.log('[Store] Setting date range:', dateRange);
    
    set({ 
      filters: { 
        ...get().filters, 
        dateRange: dateRange 
      } 
    });
    
    // Recompute all dashboard data instantly with current filters
    const { filters } = get();
    get().computeDashboardData({
      dateRange,
      contract: filters.contract,
      vehicle: filters.vehicle,
    });
  },

  /**
   * Legacy compatibility - redirect to new flow
   */
  fetchDashboardData: async (dateRange = null) => {
    if (!get().rawCourierData) {
      await get().loadRawData();
    } else if (dateRange) {
      get().computeDashboardData(dateRange);
    }
  },

  /**
   * Legacy compatibility
   */
  fetchCourierSchedule: async (dateRange = null) => {
    if (!get().rawCourierData) {
      await get().loadRawData();
    } else if (dateRange) {
      get().computeCourierSchedule(dateRange);
    }
  },

  /**
   * Refresh data from API (preserve ALL active filters)
   */
  refreshDashboardData: async () => {
    const { activeFilters } = get(); // ✅ Get all active filters
    set({ isRefreshing: true });
    
    try {
      console.log('[Store] Refreshing data, preserving filters:', activeFilters);
      const rawData = await googleSheetsService.getRange('raw!A2:Z'); // No row limit - fetch all data
      console.log('[Store] Refreshed', rawData?.length || 0, 'rows');
      
      // Log first and last row dates to verify full range
      if (rawData && rawData.length > 0) {
        const firstDate = rawData[0][3]; // First row date
        const lastDate = rawData[rawData.length - 1][3]; // Last row date
        console.log('[Store] Data date range after refresh:', { firstDate, lastDate, totalRows: rawData.length });
      }
      
      set({
        rawCourierData: rawData,
        lastUpdated: new Date(),
        error: null,
      });
      
      // Recompute with ALL preserved filters (date + contract + vehicle)
      await get().computeDashboardData(activeFilters);
      
    } catch (error) {
      console.error('[Store] Error refreshing data:', error);
      set({ error: error.message || 'Failed to refresh data' });
    } finally {
      set({ isRefreshing: false });
    }
  },

  /**
   * Update filters and refetch data
   */
  updateFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
    get().fetchCourierSchedule();
  },

  /**
   * Reset all filters
   */
  resetFilters: () => {
    set({
      filters: {
        dateRange: { start: null, end: null },
        zone: 'all',
        contract: 'all',
        vehicle: 'all',
        targetStatus: 'all',
      },
    });
    get().fetchCourierSchedule();
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  },
}));

export default useDashboardStore;
