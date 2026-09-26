/**
 * Application constants and configuration
 */

// API Configuration
export const API_CONFIG = {
  REFRESH_INTERVAL: parseInt(import.meta.env.VITE_API_REFRESH_INTERVAL) || 30000,
  SPREADSHEET_ID: import.meta.env.VITE_SPREADSHEET_ID,
  API_KEY: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
};

// Sheet Names (adjust based on your actual sheet names)
export const SHEET_NAMES = {
  DASHBOARD: 'Dashboard',
  SCHEDULE: 'Schedule',
  RAW_DATA: 'Raw Data',
};

// Filter Options
export const FILTER_OPTIONS = {
  viewModes: [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ],
  
  zones: [
    { value: 'all', label: 'All Zones' },
    { value: 'JKT-20', label: 'JKT-20' },
    { value: 'JKT-21', label: 'JKT-21' },
    { value: 'JKT-22', label: 'JKT-22' },
    { value: 'JKT P-30', label: 'JKT P-30' },
    { value: 'JKT P-33', label: 'JKT P-33' },
  ],
  
  contracts: [
    { value: 'all', label: 'All Contracts' },
    { value: 'Dedicated', label: 'Dedicated' },
    { value: 'Kiloan', label: 'Kiloan' },
    { value: 'Group-based', label: 'Group-based' },
    { value: 'Kora Plus', label: 'Kora Plus' },
  ],
  
  vehicles: [
    { value: 'all', label: 'All Vehicles' },
    { value: 'JMA', label: 'JMA (Motorcycle)' },
    { value: 'SOKO', label: 'SOKO' },
    { value: 'Unassigned', label: 'Unassigned' },
  ],
  
  targetStatuses: [
    { value: 'all', label: 'All Target Statuses' },
    { value: 'above', label: 'Above Target' },
    { value: 'ontrack', label: 'On Track' },
    { value: 'below', label: 'Below Target' },
  ],
};

// Chart Colors
export const CHART_COLORS = {
  primary: '#7C3AED',    // Purple
  secondary: '#3B82F6',  // Blue
  success: '#10B981',    // Green
  warning: '#F59E0B',    // Orange
  danger: '#EF4444',     // Red
  info: '#06B6D4',       // Cyan
  gray: '#6B7280',       // Gray
};

// Contract Type Colors (for charts)
export const CONTRACT_COLORS = {
  'Dedicated': '#7C3AED',
  'Kiloan': '#3B82F6',
  'Group-based': '#10B981',
  'Kora Plus': '#F59E0B',
};

// Days of Week
export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  EXCELLENT: 100,
  GOOD: 80,
  FAIR: 60,
  POOR: 0,
};

// Table Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  INPUT: 'yyyy-MM-dd',
  FULL: 'dd MMMM yyyy HH:mm',
};

// Error Messages
export const ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to fetch data from Google Sheets',
  API_KEY_MISSING: 'Google Sheets API key is not configured',
  SPREADSHEET_ID_MISSING: 'Spreadsheet ID is not configured',
  NETWORK_ERROR: 'Network error. Please check your connection',
  PERMISSION_DENIED: 'Permission denied. Please check spreadsheet sharing settings',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  DATA_LOADED: 'Data loaded successfully',
  DATA_REFRESHED: 'Data refreshed successfully',
};

// Loading States
export const LOADING_MESSAGES = {
  FETCHING: 'Fetching data...',
  REFRESHING: 'Refreshing data...',
  LOADING: 'Loading...',
};
