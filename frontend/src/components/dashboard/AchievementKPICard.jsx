import { Trophy, TrendingUp, Target } from 'lucide-react';

/**
 * AchievementKPICard — reusable untuk 2WH dan 4WH
 * Props:
 *   achievement: object dari computeAchievementKPI / computeAchievement4WH
 *   title: override title (optional)
 */
const AchievementKPICard = ({ achievement, title }) => {
  if (!achievement) return null;

  const { dedicated, plus, total, hasDedicated, hasPlus,
          dedicatedResult, dedicatedTarget, plusResult, plusTarget,
          threshold, vehicle } = achievement;

  const is4WH = vehicle === '4WH';

  // Safely convert to numbers with fallback
  const safeDedicated = typeof dedicated === 'number' ? dedicated : 0;
  const safePlus = typeof plus === 'number' ? plus : 0;
  const safeTotal = typeof total === 'number' ? total : 0;
  const safeDedicatedResult = typeof dedicatedResult === 'number' ? dedicatedResult : 0;
  const safeDedicatedTarget = typeof dedicatedTarget === 'number' ? dedicatedTarget : 0;
  const safePlusResult = typeof plusResult === 'number' ? plusResult : 0;
  const safePlusTarget = typeof plusTarget === 'number' ? plusTarget : 0;
  const safeThreshold = typeof threshold === 'number' ? threshold : 75;

  const achvColor = (pct) => {
    if (pct >= 100) return { bar: 'bg-green-500',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700'  };
    if (pct >= 75)  return { bar: 'bg-yellow-400', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' };
    if (pct >= 50)  return { bar: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' };
    return           { bar: 'bg-red-500',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700'    };
  };

  const totalColor = achvColor(safeTotal);
  const dedColor   = achvColor(safeDedicated);
  const plusColor  = hasPlus ? achvColor(safePlus) : null;

  const cardTitle  = title || (is4WH
    ? 'Achievement KPI Productivity (4W)'
    : 'Achievement KPI Productivity (2W)');

  const badgeLabel = safeTotal >= 100 ? 'Achieved' : safeTotal >= 75 ? 'On Track' : safeTotal >= 50 ? 'At Risk' : 'Below';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-amber-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">
              {cardTitle}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">Threshold: 75% of Target</p>
          </div>
        </div>
        <div className={`px-2 py-1 text-xs font-semibold rounded ${is4WH ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
          {is4WH ? '4WH' : '2WH'}
        </div>
      </div>

      {/* Total Achievement */}
      <div className="mb-5">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-5xl font-bold ${totalColor.text}`}>
            {safeTotal.toFixed(1)}
          </span>
          <span className="text-xl text-gray-500 dark:text-slate-500 font-medium">%</span>
          <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${totalColor.badge}`}>
            {badgeLabel}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <div className={`h-3 rounded-full transition-all duration-700 ${totalColor.bar}`}
            style={{ width: `${Math.min(safeTotal, 100)}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-right">
          {is4WH ? '% Achievement Dedicated 4WH' : '% Achievement Total'}
        </p>
      </div>

      {/* Breakdown */}
      <div className={`grid gap-4 pt-4 border-t border-gray-100 dark:border-slate-800 ${!is4WH && hasPlus ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Dedicated */}
        <div className={`rounded-lg p-3 ${hasDedicated ? 'bg-gray-50 dark:bg-slate-800' : 'bg-gray-50 dark:bg-slate-800 opacity-50'}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500 dark:text-slate-500 font-medium">Dedicated {is4WH ? '4WH' : '2WH'}</p>
            <span className={`text-sm font-bold ${dedColor.text}`}>
              {hasDedicated ? `${safeDedicated.toFixed(1)}%` : 'N/A'}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mb-1">
            <div className={`h-1.5 rounded-full ${dedColor.bar}`}
              style={{ width: hasDedicated ? `${Math.min(safeDedicated, 100)}%` : '0%' }} />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{safeDedicatedResult.toFixed(1)}</span>
            <span className="flex items-center gap-1"><Target className="w-3 h-3" />{safeDedicatedTarget.toFixed(1)}</span>
          </div>
        </div>

        {/* Kurir Plus — only for 2WH */}
        {!is4WH && hasPlus && plusColor && (
          <div className="rounded-lg p-3 bg-gray-50 dark:bg-slate-800">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500 dark:text-slate-500 font-medium">Kurir Plus 2WH</p>
              <span className={`text-sm font-bold ${plusColor.text}`}>{safePlus.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mb-1">
              <div className={`h-1.5 rounded-full ${plusColor.bar}`}
                style={{ width: `${Math.min(safePlus, 100)}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{safePlusResult.toFixed(1)}</span>
              <span className="flex items-center gap-1"><Target className="w-3 h-3" />{safePlusTarget.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Formula hint */}
      <p className="text-xs text-gray-400 italic mt-3">
        Formula: (Result − Target×{safeThreshold}%) ÷ (Target − Target×{safeThreshold}%)
      </p>
    </div>
  );
};

export default AchievementKPICard;
