import { create } from 'zustand';
import googleSheetsService from '../services/googleSheetsService';

/**
 * Dashboard Store using Zustand
 * Manages global state for dashboard data and loading states
 */
const useDashboardStore = create((set, get) => ({
  // Data states
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
   * Set date range filter
   */
  setDateRange: (startDate, endDate) => {
    set({ 
      filters: { 
        ...get().filters, 
        dateRange: { start: startDate, end: endDate } 
      } 
    });
  },

  /**
   * Fetch all dashboard data with optional date range
   */
  fetchDashboardData: async (dateRange = null) => {
    set({ isLoading: true, error: null });
    
    try {
      const filters = dateRange ? { dateRange } : { dateRange: get().filters.dateRange };
      
      const [kpi, summary, performance, zones, fleet] = await Promise.all([
        googleSheetsService.getKPIMetrics(filters),
        googleSheetsService.getSummaryMetrics(filters),
        googleSheetsService.getPerformanceByContract(filters),
        googleSheetsService.getTopZones(filters),
        googleSheetsService.getFleetComposition(filters),
      ]);

      set({
        kpiMetrics: kpi,
        summaryMetrics: summary,
        performanceData: performance,
        zonesData: zones,
        fleetData: fleet,
        isLoading: false,
        lastUpdated: new Date(),
        error: null,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch dashboard data',
      });
    }
  },

  /**
   * Refresh dashboard data (non-blocking)
   */
  refreshDashboardData: async (dateRange = null) => {
    set({ isRefreshing: true });
    
    try {
      const filters = dateRange ? { dateRange } : { dateRange: get().filters.dateRange };
      
      const [kpi, summary, performance, zones, fleet] = await Promise.all([
        googleSheetsService.getKPIMetrics(filters),
        googleSheetsService.getSummaryMetrics(filters),
        googleSheetsService.getPerformanceByContract(filters),
        googleSheetsService.getTopZones(filters),
        googleSheetsService.getFleetComposition(filters),
      ]);

      set({
        kpiMetrics: kpi,
        summaryMetrics: summary,
        performanceData: performance,
        zonesData: zones,
        fleetData: fleet,
        isRefreshing: false,
        lastUpdated: new Date(),
        error: null,
      });
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      set({ isRefreshing: false });
    }
  },

  /**
   * Fetch courier schedule data with filters
   */
  fetchCourierSchedule: async (dateRange = null) => {
    const filters = dateRange ? { dateRange } : get().filters;
    set({ isLoading: true, error: null });
    
    try {
      const couriers = await googleSheetsService.getCourierSchedule(filters);
      
      set({
        courierSchedule: couriers,
        isLoading: false,
        lastUpdated: new Date(),
        error: null,
      });
    } catch (error) {
      console.error('Error fetching courier schedule:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch courier schedule',
      });
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
