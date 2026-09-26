import { Package, TrendingUp, Users } from 'lucide-react';
import KPICard from './KPICard';

/**
 * KPI Cards Section Component
 * Displays the 3 main KPI cards in a grid
 */
function KPICardsSection({ kpiMetrics }) {
  if (!kpiMetrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  const { weeklyProductivity, unloadedVsPlan, dailyActive } = kpiMetrics;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Weekly Avg Productivity */}
      <KPICard
        title="Weekly Avg Productivity"
        value={weeklyProductivity.value}
        unit={weeklyProductivity.unit}
        target={weeklyProductivity.target}
        trend={weeklyProductivity.trend}
        subMetrics={weeklyProductivity.subMetrics}
        color="purple"
        icon={Package}
      />

      {/* Card 2: Unloaded vs Plan */}
      <KPICard
        title="Unloaded vs Plan"
        value={unloadedVsPlan.value}
        unit={unloadedVsPlan.unit}
        percentage={unloadedVsPlan.value}
        subMetrics={unloadedVsPlan.subMetrics}
        color="blue"
        icon={TrendingUp}
      />

      {/* Card 3: Daily Active */}
      <KPICard
        title="Daily Active"
        value={dailyActive.value}
        unit={dailyActive.unit}
        percentage={dailyActive.value}
        subMetrics={dailyActive.subMetrics}
        color="green"
        icon={Users}
      />
    </div>
  );
}

export default KPICardsSection;
