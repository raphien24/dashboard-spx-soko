import { X, Calendar, Package, TrendingUp, CheckCircle } from 'lucide-react';

/**
 * Courier Detail Modal
 * Shows daily productivity breakdown when a courier row is clicked
 */
function CourierDetailModal({ courier, onClose }) {
  if (!courier) return null;

  // Sort shifts by date
  const sortedShifts = [...(courier.shifts || [])].sort((a, b) => {
    const dateA = a.parsedDate || new Date(a.date);
    const dateB = b.parsedDate || new Date(b.date);
    return dateA - dateB;
  });

  // Day name mapping
  const getDayName = (date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{courier.name}</h2>
                <div className="flex items-center gap-3 mt-2 text-indigo-100">
                  <span className="text-sm">ID: {courier.id}</span>
                  <span>•</span>
                  <span className="text-sm">{courier.district}</span>
                  <span>•</span>
                  <span className="text-sm">{courier.zone}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-white/20 dark:bg-slate-800/50 rounded text-xs font-medium">
                    {courier.contract}
                  </span>
                  <span className="px-2 py-1 bg-white/20 dark:bg-slate-800/50 rounded text-xs font-medium">
                    {courier.vehicle}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 dark:hover:bg-slate-800/50 rounded-lg p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Total Shifts</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{courier.shiftsCount || 0}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">days worked</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-xs font-medium">Avg Daily</span>
              </div>
              <p className="text-2xl font-bold text-indigo-600">{courier.avgDaily?.toFixed(1) || 0}</p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">packages/day</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Target</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{courier.target?.toFixed(0) || 0}</p>
              <p className={`text-xs font-medium mt-1 ${
                (courier.productivityPercentage || 0) >= 100 ? 'text-green-600' : 'text-orange-600'
              }`}>
                {courier.productivityPercentage?.toFixed(1)}% achieved
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-medium">Success Rate</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{courier.successRate?.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">delivery success</p>
            </div>
          </div>

          {/* Daily Breakdown Table */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-350px)]">
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">Daily Productivity Breakdown</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                      Day
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                      Handed Over
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                      Delivered
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                      Success Rate
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase">
                      vs Target
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
                  {sortedShifts.map((shift, index) => {
                    const date = shift.parsedDate || new Date(shift.date);
                    const dayName = getDayName(date);
                    const successRate = shift.handedOver > 0 
                      ? (shift.delivered / shift.handedOver) * 100 
                      : 0;
                    const vsTarget = shift.delivered - (courier.target || 0);
                    const metTarget = shift.delivered >= (courier.target || 0);

                    return (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-slate-100">
                          {shift.date}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
                          {dayName}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-slate-100">
                          {shift.handedOver || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-bold text-indigo-600">
                          {shift.delivered || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className={`font-medium ${
                            successRate >= 95 ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {successRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className={`font-bold ${
                            metTarget ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {metTarget ? '+' : ''}{vsTarget.toFixed(0)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-slate-800 border-t-2 border-gray-300 dark:border-slate-700">
                  <tr>
                    <td colSpan="2" className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-slate-100">
                      TOTAL / AVERAGE
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-900 dark:text-slate-100">
                      {courier.totalHandedOver || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-indigo-600">
                      {courier.totalWeekDeliv || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600">
                      {courier.successRate?.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      <span className={
                        (courier.productivityPercentage || 0) >= 100 
                          ? 'text-green-600' 
                          : 'text-orange-600'
                      }>
                        {courier.productivityPercentage?.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourierDetailModal;
