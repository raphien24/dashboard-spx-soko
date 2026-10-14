import React, { useState } from 'react';
import { Users, Package, Target, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const SecondaryMetricsSection = ({ summaryData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    <div className="mb-6">
      {/* Toggle Button - Mobile Only */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="lg:hidden w-full mb-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
            Summary Metrics
          </span>
          <span className="text-xs text-gray-500 dark:text-slate-400">
            ({metrics.length} cards)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Cards Grid - Hidden on mobile when collapsed */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 ${isExpanded ? '' : 'hidden lg:grid'}`}>
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isException = metric.id === 'exceptions';
        const isPositive = metric.id === 'delivered' || metric.id === 'quota';

        return (
          <div
            key={metric.id}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow"
          >
            {/* Icon & Label */}
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${metric.iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${metric.iconColor}`} />
              </div>
            </div>

            {/* Label */}
            <div className="mb-2">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wide">
                {metric.label}
              </h4>
            </div>

            {/* Main Value */}
            <div className="mb-2">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${
                  isException ? 'text-red-600' : 'text-gray-900 dark:text-slate-100'
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
                <p className="text-xs text-gray-600 dark:text-slate-400">
                  {metric.detail}
                </p>
              )}
              {metric.detail2 && (
                <p className="text-xs text-gray-500 dark:text-slate-500">
                  {metric.detail2}
                </p>
              )}
            </div>

            {/* Status Indicator */}
            {metric.id === 'quota' && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-yellow-700 font-medium">
                    Target Hit!
                  </span>
                </div>
              </div>
            )}

            {metric.id === 'exceptions' && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
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
    </div>
  );
};

export default SecondaryMetricsSection;
