import React from 'react';
import { TrendingUp, Users, Activity } from 'lucide-react';

const KPICardsSection = ({ kpiData }) => {
  if (!kpiData) return null;

  const { weeklyProductivity, dedicatedVsPlus, dailyActive } = kpiData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Card 1: Weekly Avg Productivity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">
                  {weeklyProductivity?.label || 'WEEKLY AVG PRODUCTIVITY'}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {weeklyProductivity?.unit || 'Weekly Delivered • Active Shifts'}
              </p>
            </div>
          </div>
          <div className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
            {weeklyProductivity?.badge || 'CORE KPI'}
          </div>
        </div>

        {/* Main Value */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-gray-900">
              {weeklyProductivity?.value?.toFixed(1) || '0.0'}
            </span>
            <span className="text-lg text-gray-500 font-medium">
              {weeklyProductivity?.unit?.split(' ')[0] || 'DELIVERED'} / COURIER / SHIFT
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Productivity vs Target</span>
            <span className="font-semibold">
              {weeklyProductivity?.value?.toFixed(1) || '0'} / {weeklyProductivity?.target?.toFixed(1) || '0'} pkgs
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                (weeklyProductivity?.progress || 0) >= 100 
                  ? 'bg-green-500' 
                  : (weeklyProductivity?.progress || 0) >= 90 
                  ? 'bg-yellow-500' 
                  : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min(weeklyProductivity?.progress || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Sub Metrics */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">TOTAL VOLUME</p>
            <p className="text-sm font-bold text-gray-900">
              {weeklyProductivity?.subMetrics?.totalVolume?.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ACTIVE SHIFTS</p>
            <p className="text-sm font-bold text-gray-900">
              {weeklyProductivity?.subMetrics?.activeShifts?.toLocaleString() || '0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">SHIFT TARGET</p>
            <p className="text-sm font-bold text-gray-900">
              {weeklyProductivity?.subMetrics?.shiftTarget?.toFixed(1) || '0.0'}
            </p>
          </div>
        </div>

        {/* Formula Info */}
        <div className="mt-3 text-xs text-gray-400 italic">
          Formula: {weeklyProductivity?.subMetrics?.formula || 'Total Deliv ÷ Total Active Shifts'}
        </div>

        {/* Status Badge */}
        <div className="mt-3">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            (weeklyProductivity?.progress || 0) >= 100
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
          }`}>
            {(weeklyProductivity?.progress || 0).toFixed(1)}% of Target
          </div>
        </div>
      </div>

      {/* Card 2: Dedicated VS Plus */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">
                  {dedicatedVsPlus?.label || 'DEDICATED VS PLUS'}
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Ratio: 2W Plus ÷ 2W Dedicated
              </p>
            </div>
          </div>
          <div className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded">
            {dedicatedVsPlus?.badge || '2WH FLEET'}
          </div>
        </div>

        {/* Main Value */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-gray-900">
              {dedicatedVsPlus?.value?.toFixed(1) || '0.0'}
            </span>
            <span className="text-lg text-gray-500 font-medium">%</span>
            <span className="text-sm text-gray-500 font-medium">
              PLUS : DEDICATED OUTPUT
            </span>
          </div>
        </div>

        {/* Comparison Badge */}
        <div className="mb-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
            {dedicatedVsPlus?.diff?.toFixed(1) || '0.0'}% diff
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          {/* 2W Kurir Plus */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-blue-700">● 2W Kurir Plus</span>
              <span className="font-semibold text-gray-900">
                {dedicatedVsPlus?.subMetrics?.kurirPlusAvg?.toFixed(1) || '0.0'} pkgs/shift
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${Math.min((dedicatedVsPlus?.value || 0), 100)}%` }}
              />
            </div>
          </div>

          {/* 2W Dedicated */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-purple-700">● 2W Dedicated</span>
              <span className="font-semibold text-gray-900">
                {dedicatedVsPlus?.subMetrics?.dedicatedAvg?.toFixed(1) || '0.0'} pkgs/shift
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-purple-500"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Sub Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-3 mt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">PLUS PROD</p>
            <p className="text-sm font-bold text-gray-900">
              {dedicatedVsPlus?.subMetrics?.kurirPlusAvg?.toFixed(1) || '0.0'} /shift
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">DEDICATED PROD</p>
            <p className="text-sm font-bold text-gray-900">
              {dedicatedVsPlus?.subMetrics?.dedicatedAvg?.toFixed(1) || '0.0'} /shift
            </p>
          </div>
        </div>

        {/* Formula Info */}
        <div className="mt-3 text-xs text-gray-400 italic">
          Formula: {dedicatedVsPlus?.subMetrics?.formula || '(2W Plus ÷ 2w Dedicated) × 100'}
        </div>

        {/* Badge */}
        <div className="mt-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            2wh Only
          </div>
        </div>
      </div>

      {/* Card 3: Daily Active */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">
                  {dailyActive?.label || 'DAILY ACTIVE'}
                </h3>
                <div className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">2W</span>
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">D(0)+PLUS</span>
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                    {dailyActive?.badge || 'DELIV >0'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Weekly Attendance • Active &gt; Delivering
              </p>
            </div>
          </div>
          <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
            KEEP UP
          </div>
        </div>

        {/* Main Value */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-gray-900">
              {dailyActive?.value?.toFixed(1) || '0.0'}
            </span>
            <span className="text-lg text-gray-500 font-medium">%</span>
            <span className="text-sm text-gray-500 font-medium">
              WEEKLY ATTENDANCE RATE
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Active Fleet Turnout</span>
            <span className="font-semibold">
              Avg {dailyActive?.subMetrics?.avgCouriersPerDay?.toFixed(1) || '0'} / {dailyActive?.subMetrics?.totalCouriers || '0'} couriers / day
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full bg-green-500"
              style={{ width: `${Math.min(dailyActive?.value || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* Sub Metrics */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">ACTIVE SHIFTS (DELIV)</p>
            <p className="text-sm font-bold text-gray-900">
              {dailyActive?.subMetrics?.activeShifts || '0'} shifts
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">TOTAL HEADCOUNT</p>
            <p className="text-sm font-bold text-gray-900">
              {dailyActive?.subMetrics?.totalCouriers || '0'} couriers
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">OP DAYS</p>
            <p className="text-sm font-bold text-gray-900">
              {dailyActive?.subMetrics?.operatingDays || '0'} days
            </p>
          </div>
        </div>

        {/* Formula Info */}
        <div className="mt-3 text-xs text-gray-400 italic">
          Formula: {dailyActive?.subMetrics?.formula || 'Active Shifts ÷ (Unique Headcount × Op Days)'}
        </div>

        {/* Filter Info */}
        <div className="mt-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
            Filters: {dailyActive?.filters || '2W | D(0)+PLUS | DELIV >0'}
          </div>
        </div>

        {/* Badge */}
        <div className="mt-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            Weekly Attendance
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICardsSection;
