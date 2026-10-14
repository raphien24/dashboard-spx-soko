import React from 'react';
import { TrendingUp, Users, Activity } from 'lucide-react';
import AnimatedKPICard from './AnimatedKPICard';
import { StaggerChildren } from '../animations';

const KPICardsSection = ({ kpiData, onProductivityClick }) => {
  if (!kpiData) return null;

  const { weeklyProductivity, dedicatedVsPlus, dailyActive } = kpiData;

  // Map data to KPICard format
  const cards = [
    {
      id: 'weekly-productivity',
      title: weeklyProductivity?.label || 'WEEKLY AVG PRODUCTIVITY',
      subtitle: weeklyProductivity?.unit || 'Weekly Delivered • Active Shifts',
      value: weeklyProductivity?.value || 0,
      unit: 'DELIVERED / COURIER / SHIFT',
      icon: TrendingUp,
      color: 'purple',
      badge: weeklyProductivity?.badge || 'CORE KPI',
      badgeColor: 'orange',
      progress: {
        label: 'Productivity vs Target',
        value: weeklyProductivity?.progress || 0,
        current: weeklyProductivity?.value?.toFixed(1) || '0',
        target: weeklyProductivity?.target?.toFixed(1) || '0',
        unit: 'pkgs'
      },
      subMetrics: [
        { label: 'TOTAL VOLUME', value: weeklyProductivity?.subMetrics?.totalVolume?.toLocaleString() || '0' },
        { label: 'ACTIVE SHIFTS', value: weeklyProductivity?.subMetrics?.activeShifts?.toLocaleString() || '0' },
        { label: 'SHIFT TARGET', value: weeklyProductivity?.subMetrics?.shiftTarget?.toFixed(1) || '0.0' }
      ],
      formula: weeklyProductivity?.subMetrics?.formula || 'Total Deliv ÷ Total Active Shifts',
      statusBadge: {
        text: `${(weeklyProductivity?.progress || 0).toFixed(1)}% of Target`,
        color: (weeklyProductivity?.progress || 0) >= 100 ? 'green' : 'orange'
      },
      onClick: onProductivityClick,
      clickHint: 'Lihat detail',
      borderColor: 'purple'
    },
    {
      id: 'dedicated-vs-plus',
      title: dedicatedVsPlus?.label || 'DEDICATED VS PLUS',
      subtitle: 'Ratio: 2W Plus ÷ 2W Dedicated',
      value: dedicatedVsPlus?.value || 0,
      unit: '%',
      secondaryUnit: 'PLUS : DEDICATED OUTPUT',
      icon: Activity,
      color: 'indigo',
      badge: dedicatedVsPlus?.badge || '2WH FLEET',
      badgeColor: 'indigo',
      comparisonBadge: {
        text: `${dedicatedVsPlus?.diff?.toFixed(1) || '0.0'}% diff`,
        color: 'orange'
      },
      progressBars: [
        {
          label: '● 2W Kurir Plus',
          value: dedicatedVsPlus?.subMetrics?.kurirPlusAvg?.toFixed(1) || '0.0',
          unit: 'pkgs/shift',
          percent: Math.min((dedicatedVsPlus?.value || 0), 100),
          color: 'blue'
        },
        {
          label: '● 2W Dedicated',
          value: dedicatedVsPlus?.subMetrics?.dedicatedAvg?.toFixed(1) || '0.0',
          unit: 'pkgs/shift',
          percent: 100,
          color: 'purple'
        }
      ],
      subMetrics: [
        { label: 'PLUS PROD', value: `${dedicatedVsPlus?.subMetrics?.kurirPlusAvg?.toFixed(1) || '0.0'} /shift` },
        { label: 'DEDICATED PROD', value: `${dedicatedVsPlus?.subMetrics?.dedicatedAvg?.toFixed(1) || '0.0'} /shift` }
      ],
      formula: dedicatedVsPlus?.subMetrics?.formula || '(2W Plus ÷ 2w Dedicated) × 100',
      extraBadge: { text: '2wh Only', color: 'blue' }
    },
    {
      id: 'daily-active',
      title: dailyActive?.label || 'DAILY ACTIVE',
      subtitle: 'Weekly Attendance • Active > Delivering',
      value: dailyActive?.value || 0,
      unit: '%',
      secondaryUnit: 'WEEKLY ATTENDANCE RATE',
      icon: Users,
      color: 'green',
      badge: dailyActive?.badge || 'DELIV >0',
      badgeColor: 'green',
      topBadges: [
        { text: '2W', color: 'blue' },
        { text: 'D(0)+PLUS', color: 'purple' },
        { text: dailyActive?.badge || 'DELIV >0', color: 'green' }
      ],
      rightBadge: { text: 'KEEP UP', color: 'green' },
      progress: {
        label: 'Active Fleet Turnout',
        value: dailyActive?.value || 0,
        current: `Avg ${dailyActive?.subMetrics?.avgCouriersPerDay?.toFixed(1) || '0'} / ${dailyActive?.subMetrics?.totalCouriers || '0'} couriers / day`
      },
      subMetrics: [
        { label: 'ACTIVE SHIFTS (DELIV)', value: `${dailyActive?.subMetrics?.activeShifts || '0'} shifts` },
        { label: 'TOTAL HEADCOUNT', value: `${dailyActive?.subMetrics?.totalCouriers || '0'} couriers` },
        { label: 'OP DAYS', value: `${dailyActive?.subMetrics?.operatingDays || '0'} days` }
      ],
      formula: dailyActive?.subMetrics?.formula || 'Active Shifts ÷ (Unique Headcount × Op Days)',
      filterBadge: { text: `Filters: ${dailyActive?.filters || '2W | D(0)+PLUS | DELIV >0'}`, color: 'gray' },
      statusBadge: { text: 'Weekly Attendance', color: 'green' }
    }
  ];

  return (
    <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cards.map((card, index) => (
        <AnimatedKPICard
          key={card.id}
          {...card}
          delay={index * 0.15}
        />
      ))}
    </StaggerChildren>
  );
};

export default KPICardsSection;
