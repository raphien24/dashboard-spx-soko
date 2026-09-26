import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber, formatPercentage, getProgressColor } from '../../utils/formatters';

/**
 * KPI Card Component
 * Displays key performance indicators with progress bars and trends
 */
function KPICard({ 
  title, 
  value, 
  unit, 
  target, 
  percentage, 
  trend, 
  subMetrics,
  color = 'purple',
  icon: Icon 
}) {
  const progressPercentage = percentage || (target ? (value / target) * 100 : 0);
  const progressColor = getProgressColor(progressPercentage);
  
  // Color variations
  const colorClasses = {
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      icon: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-700',
    },
  };

  const colors = colorClasses[color] || colorClasses.purple;

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {Icon && <Icon className={`w-5 h-5 ${colors.icon}`} />}
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {title}
            </h3>
          </div>
          <p className="text-xs text-gray-500">{unit}</p>
        </div>
        
        {/* Trend Indicator */}
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-xs font-semibold">
              {trend === 'up' ? '↑' : '↓'}
            </span>
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${colors.text}`}>
            {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}
          </span>
          {target && (
            <span className="text-lg text-gray-400">
              / {formatNumber(target)}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500">Progress</span>
          <span className={`text-xs font-semibold ${colors.text}`}>
            {formatPercentage(progressPercentage, 1)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Sub Metrics */}
      {subMetrics && (
        <div className="space-y-2 pt-3 border-t border-gray-200">
          {Object.entries(subMetrics).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-xs font-medium text-gray-900">
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KPICard;
