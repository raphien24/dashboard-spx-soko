import React from 'react';
import { Users, Package, Target, TrendingUp, AlertTriangle } from 'lucide-react';

const SecondaryMetricsSection = ({ summaryData }) => {
  if (!summaryData) return null;

  const {
    uniqueHeadcount = {},
    totalDelivered = {},
    metQuota = {},
    totalAssigned = {},
    exceptions = {}
  } = summaryData;

  const metrics = [
    {
      id: 'headcount',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      label: uniqueHeadcount.label || 'Unique Headcount',
      value: uniqueHeadcount.value || 0,
      subtitle: uniqueHeadcount.subtitle,
      detail: uniqueHeadcount.detail,
      detail2: uniqueHeadcount.detail2
    },
    {
      id: 'delivered',
      icon: Package,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      label: totalDelivered.label || 'Total Delivered',
      value: totalDelivered.value || 0,
      subtitle: totalDelivered.subtitle,
      detail: totalDelivered.detail,
      detail2: totalDelivered.detail2
    },
    {
      id: 'quota',
      icon: Target,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      label: metQuota.label || 'Met Quota',
      value: metQuota.value || 0,
      subtitle: metQuota.subtitle,
      detail: metQuota.detail,
      detail2: metQuota.detail2
    },
    {
      id: 'assigned',
      icon: TrendingUp,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      label: totalAssigned.label || 'Total Assigned',
      value: totalAssigned.value || 0,
      subtitle: totalAssigned.subtitle,
      detail: totalAssigned.detail,
      detail2: totalAssigned.detail2
    },
    {
      id: 'exceptions',
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      label: exceptions.label || 'Exceptions',
      value: exceptions.value || 0,
      subtitle: exceptions.subtitle,
      detail: exceptions.detail,
      detail2: exceptions.detail2
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isException = metric.id === 'exceptions';
        const isPositive = metric.id === 'delivered' || metric.id === 'quota';

        return (
          <div
            key={metric.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            {/* Icon & Label */}
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${metric.iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${metric.iconColor}`} />
              </div>
            </div>

            {/* Label */}
            <div className="mb-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {metric.label}
              </h4>
            </div>

            {/* Main Value */}
            <div className="mb-2">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${
                  isException ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {typeof metric.value === 'number' 
                    ? metric.value.toLocaleString() 
                    : metric.value || '0'}
                </span>
                {metric.subtitle && (
                  <span className={`text-sm font-semibold ${
                    isException 
                      ? 'text-red-600' 
                      : isPositive 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {metric.subtitle}
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1">
              {metric.detail && (
                <p className="text-xs text-gray-600">
                  {metric.detail}
                </p>
              )}
              {metric.detail2 && (
                <p className="text-xs text-gray-500">
                  {metric.detail2}
                </p>
              )}
            </div>

            {/* Status Indicator */}
            {metric.id === 'quota' && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-yellow-700 font-medium">
                    Target Hit!
                  </span>
                </div>
              </div>
            )}

            {metric.id === 'exceptions' && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs text-red-700 font-medium">
                    0 stick
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SecondaryMetricsSection;
