import React from 'react';
import { TrendingUp, Users, Activity, MousePointerClick } from 'lucide-react';

const KPICardsSection = ({ kpiData, onProductivityClick }) => {
  if (!kpiData) return null;

  const { weeklyProductivity, dedicatedVsPlus, dailyActive } = kpiData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Card 1: Weekly Avg Productivity — CLICKABLE */}
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-purple-200 dark:border-purple-800 p-6 hover:shadow-lg transition-all cursor-pointer group ring-0 hover:ring-2 hover:ring-purple-300 dark:hover:ring-purple-700 relative"
        onClick={onProductivityClick}
        title="Klik untuk lihat breakdown harian"
      >
        {/* Click hint */}
        <div className="absolute top-3 right-14 flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-950 text-purple-500 dark:text-purple-400 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <MousePointerClick className="w-3 h-3" />
          Lihat detail
        </div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase">
                  {weeklyProductivity?.label || 'WEEKLY AVG PRODUCTIVITY'}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
                {weeklyProductivity?.unit || 'Weekly Delivered • Active Shifts'}
              </p>
            </div>
          </div>
          <div className="px-2 py-1 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-xs font-semibold rounded">
            {weeklyProductivity?.badge || 'CORE KPI'}
          </div>
        </div>

        {/* Main Value */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-gray-900 dark:text-slate-100">
              {weeklyProductivity?.value?.toFixed(1) || '0.0'}
            </span>
            <span className="text-lg text-gray-500 dark:text-slate-400 font-medium">
              {weeklyProductivity?.unit?.split(' ')[0] || 'DELIVERED'} / COURIER / SHIFT
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
            <span>Productivity vs Target</span>
            <span className="font-semibold">
              {weeklyProductivity?.value?.toFixed(1) || '0'} / {weeklyProductivity?.target?.toFixed(1) || '0'} pkgs
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                (weeklyProductivity?.progress || 0) >= 100 
                  ? 'bg-green-500 dark:bg-green-400' 
                  : (weeklyProductivity?.progress || 0) >= 90 
                  ? 'bg-yellow-500 dark:bg-yellow-400' 
                  : 'bg-orange-500 dark:bg-orange-400'
              }`}
              style={{ width: `${Math.min(weeklyProductivity?.progress || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Sub Metrics */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-500">TOTAL VOLUME</p>
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
              {weeklyProductivity?.subMetrics?.totalVolume?.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-500">ACTIVE SHIFTS</p>
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
              {weeklyProductivity?.subMetrics?.activeShifts?.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-500">SHIFT TARGET</p>
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
              {weeklyProductivity?.subMetrics?.shiftTarget?.toFixed(1) || '0.0'}
            </p>
          </div>
        </div>

        {/* Formula Info */}
        <div className="mt-3 text-xs text-gray-400 dark:text-slate-500 italic">
          Formula: {weeklyProductivity?.subMetrics?.formula || 'Total Deliv ÷ Total Active Shifts'}
        </div>

        {/* Status Badge */}
        <div className="mt-3">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            (weeklyProductivity?.progress || 0) >= 100
              ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
              : 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400'
          }`}>
            {(weeklyProductivity?.progress || 0).toFixed(1)}% of Target
          </div>
        </div>
      </div>

      {/* Card 2: Dedicated VS Plus */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
              <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase">
                  {dedicatedVsPlus?.label || 'DEDICATED VS PLUS'}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
                Ratio: 2W Plus ÷ 2W Dedicated
              </p>
            </div>
          </div>
          <div className="px-2 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-xs font-semibold rounded">
            {dedicatedVsPlus?.badge || '2WH FLEET'}
          </div>
        </div>

        {/* Main Value */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-gray-900 dark:text-slate-100">
              {dedicatedVsPlus?.value?.toFixed(1) || '0.0'}
            </span>
            <span className="text-lg text-gray-500 dark:text-slate-400 font-medium">%</span>
            <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
              PLUS : DEDICATED OUTPUT
            </span>
          </div>
        </div>

        {/* Comparison Badge */}
        <div className="mb-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 text-sm font-semibold">
            {dedicatedVsPlus?.diff?.toFixed(1) || '0.0'}% diff
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          {/* 2W Kurir Plus */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-blue-700 dark:text-blue-400">● 2W Kurir Plus</span>
              <span className="font-semibold text-gray-900 dark:text-slate-100">
                {dedicatedVsPlus?.subMetrics?.kurirPlusAvg?.toFixed(1) || '0.0'} pkgs/shift
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-blue-500 dark:bg-blue-400"
                style={{ width: `${Math.min((dedicatedVsPlus?.value || 0), 100)}%` }}
              />
            </div>
          </div>

          {/* 2W Dedicated */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-purple-700 dark:text-purple-400">● 2W Dedicated</span>
              <span className="font-semibold text-gray-900 dark:text-slate-100">
                {dedicatedVsPlus?.subMetrics?.dedicatedAvg?.toFixed(1) || '0.0'} pkgs/shift
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-purple-500 dark:bg-purple-400"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Sub Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-gray-100 dark:border-slate-800">
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-500">PLUS PROD</p>
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
              {dedicatedVsPlus?.subMetrics?.kurirPlusAvg?.toFixed(1) || '0.0'} /shift
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-500">DEDICATED PROD</p>
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
              {dedicatedVsPlus?.subMetrics?.dedicatedAvg?.toFixed(1) || '0.0'} /shift
            </p>
          </div>
        </div>

        {/* Formula Info */}
        <div className="mt-3 text-xs text-gray-400 dark:text-slate-500 italic">
          Formula: {dedicatedVsPlus?.subMetrics?.formula || '(2W Plus ÷ 2w Dedicated) × 100'}
        </div>

        {/* Badge */}
        <div className="mt-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-semibold">
            2wh Only
          </div>
        </div>
      </div>

      {/* Card 3: Daily Active */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase">
                  {dailyActive?.label || 'DAILY ACTIVE'}
                </h3>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">2W</span>
                  <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded">D(0)+PLUS</span>
                  <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
                    {dailyActive?.badge || 'DELIV >0'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">
                Weekly Attendance • Active &gt; Delivering
              </p>
            </div>
          </div>
          <div className="px-2 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
            KEEP UP
          </div>
        </div>

        {/* Main Value */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-gray-900 dark:text-slate-100">
              {dailyActive?.value?.toFixed(1) || '0.0'}
            </span>
            <span className="text-lg text-gray-500 dark:text-slate-400 font-medium">%</span>
            <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
              WEEKLY ATTENDANCE RATE
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
            <span>Active Fleet Turnout</span>
            <span className="font-semibold">
              Avg {dailyActive?.subMetrics?.avgCouriersPerDay?.toFixed(1) || '0'} / {dailyActive?.subMetrics?.totalCouriers || '0'} couriers / day
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full bg-green-500 dark:bg-green-400"
              style={{ width: `${Math.min(dailyActive?.value || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Sub Metrics */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-500">ACTIVE SHIFTS (DELIV)</p>
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
              {dailyActive?.subMetrics?.activeShifts || '0'} shifts
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-500">TOTAL HEADCOUNT</p>
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
              {dailyActive?.subMetrics?.totalCouriers || '0'} couriers
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-500">OP DAYS</p>
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100">
              {dailyActive?.subMetrics?.operatingDays || '0'} days
            </p>
          </div>
        </div>

        {/* Formula Info */}
        <div className="mt-3 text-xs text-gray-400 dark:text-slate-500 italic">
          Formula: {dailyActive?.subMetrics?.formula || 'Active Shifts ÷ (Unique Headcount × Op Days)'}
        </div>

        {/* Filter Info */}
        <div className="mt-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-medium">
            Filters: {dailyActive?.filters || '2W | D(0)+PLUS | DELIV >0'}
          </div>
        </div>

        {/* Badge */}
        <div className="mt-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 text-xs font-semibold">
            Weekly Attendance
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICardsSection;
