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
   * Fetch all dashboard data
   */
  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const [kpi, summary, performance, zones, fleet] = await Promise.all([
        googleSheetsService.getKPIMetrics(),
        googleSheetsService.getSummaryMetrics(),
        googleSheetsService.getPerformanceByContract(),
        googleSheetsService.getTopZones(),
        googleSheetsService.getFleetComposition(),
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
  refreshDashboardData: async () => {
    set({ isRefreshing: true });
    
    try {
      const [kpi, summary, performance, zones, fleet] = await Promise.all([
        googleSheetsService.getKPIMetrics(),
        googleSheetsService.getSummaryMetrics(),
        googleSheetsService.getPerformanceByContract(),
        googleSheetsService.getTopZones(),
        googleSheetsService.getFleetComposition(),
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
  fetchCourierSchedule: async () => {
    const { filters } = get();
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
