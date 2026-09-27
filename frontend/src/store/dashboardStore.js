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
  error: null,

  // Last updated timestamp
  lastUpdated: null,

  // Current active date range filter
  activeDateRange: null,

  // Filter states
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
   * Load ALL raw data from Google Sheets once
   */
  loadRawData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('[Store] Loading ALL raw data from Google Sheets...');
      const rawData = await googleSheetsService.getRange('raw!A2:Z1000');
      console.log('[Store] Loaded', rawData?.length || 0, 'rows');
      
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
   * Compute ALL dashboard data from cached raw data (INSTANT - no API call)
   */
  computeDashboardData: async (dateRange) => {
    const { rawCourierData } = get();
    
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
    
    console.log('[Store] Computing dashboard data for date range:', dateRange);
    const startTime = performance.now();
    
    try {
      // For now, still use the service methods (they will call API)
      // TODO: Refactor service methods to accept raw data
      const filters = dateRange ? { dateRange } : {};
      
      // Compute all metrics - service methods will handle their own data fetching for now
      const [kpiMetrics, summaryMetrics, performanceData, zonesData] = await Promise.all([
        googleSheetsService.getKPIMetrics(filters),
        googleSheetsService.getSummaryMetrics(filters),
        googleSheetsService.getPerformanceByContract(filters),
        googleSheetsService.getTopZones(filters),
      ]);
      
      // Compute courier schedule from cached raw data (client-side filtering)
      const courierSchedule = googleSheetsService.processCourierScheduleFromRaw(rawCourierData, dateRange);
      
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
        activeDateRange: dateRange,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('[Store] Error computing dashboard:', error);
      set({ 
        kpiMetrics: null,
        summaryMetrics: null,
        performanceData: null,
        zonesData: null,
        courierSchedule: [],
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
    
    // Recompute all dashboard data instantly
    get().computeDashboardData(dateRange);
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
   * Refresh data from API (preserve active date range)
   */
  refreshDashboardData: async () => {
    const { activeDateRange } = get();
    set({ isRefreshing: true });
    
    try {
      console.log('[Store] Refreshing data, preserving date range:', activeDateRange);
      const rawData = await googleSheetsService.getRange('raw!A2:Z1000');
      console.log('[Store] Refreshed', rawData?.length || 0, 'rows');
      
      set({
        rawCourierData: rawData,
        lastUpdated: new Date(),
        error: null,
      });
      
      // Recompute with preserved date range
      await get().computeDashboardData(activeDateRange);
      
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
