/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('id-ID');
}

/**
 * Format percentage
 * @param {number} num - Number to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage string
 */
export function formatPercentage(num, decimals = 1) {
  if (num === null || num === undefined) return '0%';
  return `${num.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K, M suffix
 * @param {number} num - Number to format
 * @returns {string} - Formatted number with suffix
 */
export function formatCompactNumber(num) {
  if (num === null || num === undefined) return '0';
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format date to locale string
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date and time string
 */
export function formatDateTime(date) {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get color for performance value
 * @param {number} value - Performance value
 * @param {number} target - Target value
 * @returns {string} - Tailwind color class
 */
export function getPerformanceColor(value, target = 100) {
  const percentage = (value / target) * 100;
  
  if (percentage >= 100) return 'text-green-600';
  if (percentage >= 80) return 'text-blue-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get background color for performance value
 * @param {number} value - Performance value
 * @param {number} target - Target value
 * @returns {string} - Tailwind bg color class
 */
export function getPerformanceBgColor(value, target = 100) {
  const percentage = (value / target) * 100;
  
  if (percentage >= 100) return 'bg-green-100';
  if (percentage >= 80) return 'bg-blue-100';
  if (percentage >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
}

/**
 * Get progress bar color
 * @param {number} percentage - Percentage value
 * @returns {string} - Tailwind color class
 */
export function getProgressColor(percentage) {
  if (percentage >= 100) return 'bg-green-500';
  if (percentage >= 80) return 'bg-blue-500';
  if (percentage >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} target - Target value
 * @returns {number} - Percentage
 */
export function calculatePercentage(value, target) {
  if (!target || target === 0) return 0;
  return (value / target) * 100;
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get contract type badge color
 * @param {string} contractType - Contract type
 * @returns {string} - Tailwind color classes
 */
export function getContractBadgeColor(contractType) {
  const type = contractType?.toLowerCase() || '';
  
  if (type.includes('dedicated')) return 'bg-purple-100 text-purple-700';
  if (type.includes('kiloan')) return 'bg-blue-100 text-blue-700';
  if (type.includes('group')) return 'bg-green-100 text-green-700';
  if (type.includes('kora')) return 'bg-orange-100 text-orange-700';
  
  return 'bg-gray-100 text-gray-700';
}

/**
 * Get time ago string
 * @param {Date} date - Date to compare
 * @returns {string} - Time ago string
 */
export function getTimeAgo(date) {
  if (!date) return 'Never';
  
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}
