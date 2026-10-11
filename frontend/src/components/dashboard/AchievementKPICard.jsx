import { Trophy, TrendingUp, Target } from 'lucide-react';

/**
 * AchievementKPICard
 * Displays % Achievement after threshold for Dedicated 2WH, Kurir Plus 2WH, and Total
 *
 * Formula per type:
 *   threshold_value = target × 75%
 *   result >= target       → 100%
 *   result >= threshold_v  → (result - threshold_v) / (target - threshold_v) × 100
 *   result <  threshold_v  → 0%
 *   Total = avg(dedicated, plus)
 */
const AchievementKPICard = ({ achievement }) => {
  if (!achievement) return null;

  const { dedicated, plus, total, hasDedicated, hasPlus,
          dedicatedResult, dedicatedTarget, plusResult, plusTarget, threshold } = achievement;

  // Color logic
  const achvColor = (pct) => {
    if (pct >= 100) return { bar: 'bg-green-500',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700'  };
    if (pct >= 75)  return { bar: 'bg-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' };
    if (pct >= 50)  return { bar: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' };
    return           { bar: 'bg-red-500',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700'    };
  };

  const totalColor = achvColor(total);
  const dedColor   = achvColor(dedicated);
  const plusColor  = achvColor(plus);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Achievement KPI Productivity
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">After Threshold {threshold}%</p>
          </div>
        </div>
        <div className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded">
          THRESHOLD
        </div>
      </div>

      {/* Total Achievement — big number */}
      <div className="mb-5">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-5xl font-bold ${totalColor.text}`}>
            {total.toFixed(1)}
          </span>
          <span className="text-xl text-gray-500 font-medium">%</span>
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${totalColor.badge}`}>
            {total >= 100 ? 'Achieved' : total >= 75 ? 'On Track' : total >= 50 ? 'At Risk' : 'Below'}
          </span>
        </div>
        {/* Total bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-700 ${totalColor.bar}`}
            style={{ width: `${Math.min(total, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">% Achievement Total</p>
      </div>

      {/* Breakdown: Dedicated vs Plus */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">

        {/* Dedicated */}
        <div className={`rounded-lg p-3 ${hasDedicated ? 'bg-gray-50' : 'bg-gray-50 opacity-50'}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500 font-medium">Dedicated 2WH</p>
            <span className={`text-sm font-bold ${dedColor.text}`}>
              {hasDedicated ? `${dedicated.toFixed(1)}%` : 'N/A'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-1">
            <div className={`h-1.5 rounded-full ${dedColor.bar}`}
              style={{ width: hasDedicated ? `${Math.min(dedicated, 100)}%` : '0%' }} />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {dedicatedResult.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" /> {dedicatedTarget.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Kurir Plus */}
        <div className={`rounded-lg p-3 ${hasPlus ? 'bg-gray-50' : 'bg-gray-50 opacity-50'}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500 font-medium">Kurir Plus 2WH</p>
            <span className={`text-sm font-bold ${plusColor.text}`}>
              {hasPlus ? `${plus.toFixed(1)}%` : 'N/A'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-1">
            <div className={`h-1.5 rounded-full ${plusColor.bar}`}
              style={{ width: hasPlus ? `${Math.min(plus, 100)}%` : '0%' }} />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {plusResult.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" /> {plusTarget.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Formula hint */}
      <p className="text-xs text-gray-400 italic mt-3">
        Formula: (Result − Target×{threshold}%) ÷ (Target − Target×{threshold}%)
      </p>
    </div>
  );
};

export default AchievementKPICard;
