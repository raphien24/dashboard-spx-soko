import { formatNumber } from '../../utils/formatters';

/**
 * Metric Card Component
 * Small card for displaying summary metrics
 */
function MetricCard({ title, value, badge, icon: Icon, color = 'gray' }) {
  // Color variations
  const colorClasses = {
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-600',
      text: 'text-gray-900',
      badge: 'bg-gray-200 text-gray-700',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-900',
      badge: 'bg-purple-200 text-purple-700',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-900',
      badge: 'bg-blue-200 text-blue-700',
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-900',
      badge: 'bg-green-200 text-green-700',
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      text: 'text-orange-900',
      badge: 'bg-orange-200 text-orange-700',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-900',
      badge: 'bg-red-200 text-red-700',
    },
  };

  const colors = colorClasses[color] || colorClasses.gray;

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-5 hover:shadow-md transition-all duration-200 cursor-default`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
          {Icon && <Icon className={`w-5 h-5 ${colors.icon}`} />}
        </div>
        {badge && (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
            {badge}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${colors.text}`}>
          {typeof value === 'number' ? formatNumber(value) : value}
        </p>
      </div>
    </div>
  );
}

export default MetricCard;
