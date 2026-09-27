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
      get().computeCourierSchedule(null);
      
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
  setDateRange: (startDate, endDate) => {
    const dateRange = startDate && endDate ? { start: startDate, end: endDate } : null;
    
    console.log('[Store] Setting date range:', dateRange);
    
    set({ 
      filters: { 
        ...get().filters, 
        dateRange: dateRange 
      } 
    });
    
    // Recompute schedule instantly
    get().computeCourierSchedule(dateRange);
  },

  /**
   * Legacy compatibility - redirect to new flow
   */
  fetchDashboardData: async (dateRange = null) => {
    if (!get().rawCourierData) {
      await get().loadRawData();
    }
    if (dateRange) {
      get().computeCourierSchedule(dateRange);
    }
  },

  /**
   * Legacy compatibility
   */
  fetchCourierSchedule: async (dateRange = null) => {
    if (!get().rawCourierData) {
      await get().loadRawData();
    }
    if (dateRange) {
      get().computeCourierSchedule(dateRange);
    }
  },

  /**
   * Refresh data from API
   */
  refreshDashboardData: async () => {
    set({ isRefreshing: true });
    await get().loadRawData();
    set({ isRefreshing: false });
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
