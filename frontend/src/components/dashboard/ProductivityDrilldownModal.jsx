import { X, TrendingUp, Activity, BarChart2, ChevronUp, ChevronDown } from 'lucide-react';

/**
 * ProductivityDrilldownModal
 * Shows daily productivity + daily active rate for the selected week
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   weekLabel: string  — e.g. "2 Oct – 8 Oct 2026"
 *   dailyData: Array<{
 *     dayLabel, activeShifts, totalDelivered,
 *     avgProductivity, dailyActiveRate
 *   }>
 *   weeklyTarget: number  — avg target for progress bar reference
 *   filters: { contract, vehicle } — for display
 */
const ProductivityDrilldownModal = ({
  isOpen,
  onClose,
  weekLabel,
  dailyData = [],
  weeklyTarget = 0,
  filters = {},
}) => {
  if (!isOpen) return null;

  const maxProductivity = Math.max(...dailyData.map(d => d.avgProductivity), weeklyTarget, 1);
  const weekAvgProductivity = dailyData.length > 0
    ? dailyData.reduce((s, d) => s + d.avgProductivity, 0) / dailyData.length
    : 0;
  const weekAvgActive = dailyData.length > 0
    ? dailyData.reduce((s, d) => s + d.dailyActiveRate, 0) / dailyData.length
    : 0;

  const productivityColor = (val) => {
    if (weeklyTarget <= 0) return 'bg-indigo-500';
    const pct = (val / weeklyTarget) * 100;
    if (pct >= 100) return 'bg-green-500';
    if (pct >= 90)  return 'bg-yellow-400';
    return 'bg-orange-500';
  };

  const productivityTextColor = (val) => {
    if (weeklyTarget <= 0) return 'text-indigo-700';
    const pct = (val / weeklyTarget) * 100;
    if (pct >= 100) return 'text-green-700 font-bold';
    if (pct >= 90)  return 'text-yellow-700 font-semibold';
    return 'text-orange-700';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5 rounded-t-2xl flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">Daily Productivity Breakdown</h2>
              </div>
              <p className="text-purple-200 text-sm">{weekLabel}</p>
              {(filters.contract || filters.vehicle) && (
                <div className="flex gap-2 mt-2">
                  {filters.contract && filters.contract !== 'all' && (
                    <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                      {filters.contract}
                    </span>
                  )}
                  {filters.vehicle && filters.vehicle !== 'all' && (
                    <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                      {filters.vehicle}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Summary Strip */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-200 bg-gray-50">
            <div className="px-5 py-3 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Productivity</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {weekAvgProductivity.toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">pkgs</span>
              </p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Target</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {weeklyTarget.toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">pkgs</span>
              </p>
            </div>
            <div className="px-5 py-3 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Avg Daily Active</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                {weekAvgActive.toFixed(1)}
                <span className="text-sm font-normal text-gray-500 ml-1">%</span>
              </p>
            </div>
          </div>

          {/* Body — scrollable */}
          <div className="overflow-y-auto flex-1 p-5">
            {dailyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <BarChart2 className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Tidak ada data untuk periode ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyData.map((day, i) => {
                  const pct = weeklyTarget > 0
                    ? Math.min((day.avgProductivity / weeklyTarget) * 100, 100)
                    : Math.min((day.avgProductivity / maxProductivity) * 100, 100);
                  const isAboveTarget = weeklyTarget > 0 && day.avgProductivity >= weeklyTarget;

                  return (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-indigo-200 transition-colors">
                      {/* Row header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-800">
                            {day.dayLabel}
                          </span>
                          {isAboveTarget && (
                            <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                              <ChevronUp className="w-3.5 h-3.5" /> On Target
                            </span>
                          )}
                          {!isAboveTarget && weeklyTarget > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-orange-500 font-medium">
                              <ChevronDown className="w-3.5 h-3.5" />
                              -{(weeklyTarget - day.avgProductivity).toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{day.activeShifts} shifts</span>
                          <span className="text-gray-300">|</span>
                          <span>{day.totalDelivered.toLocaleString()} pkgs</span>
                        </div>
                      </div>

                      {/* Productivity bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Avg Productivity
                          </span>
                          <span className={`font-bold ${productivityTextColor(day.avgProductivity)}`}>
                            {day.avgProductivity.toFixed(1)} pkgs/shift
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all ${productivityColor(day.avgProductivity)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {/* Target line marker */}
                        {weeklyTarget > 0 && (
                          <div className="relative h-1 mt-0.5">
                            <div
                              className="absolute top-0 w-px h-3 bg-gray-400 -translate-y-1"
                              style={{ left: `${Math.min((weeklyTarget / maxProductivity) * 100, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Daily Active bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Daily Active (2WH D+Plus)
                          </span>
                          <span className={`font-semibold ${
                            day.dailyActiveRate >= 80 ? 'text-green-600' :
                            day.dailyActiveRate >= 60 ? 'text-yellow-600' : 'text-red-500'
                          }`}>
                            {day.dailyActiveRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              day.dailyActiveRate >= 80 ? 'bg-green-500' :
                              day.dailyActiveRate >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${Math.min(day.dailyActiveRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <p className="text-xs text-gray-400 text-center">
              Productivity = Total Delivered ÷ Active Shifts &nbsp;·&nbsp;
              Daily Active = 2WH Dedicated+Plus kurir aktif ÷ total unik kurir
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductivityDrilldownModal;
