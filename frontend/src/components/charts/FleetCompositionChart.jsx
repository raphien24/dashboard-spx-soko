import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Target } from 'lucide-react';

/**
 * Quota & Fleet Composition Chart Component
 * Shows % met quota target and fleet vehicle breakdown
 */
function FleetCompositionChart({ data }) {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎯 Quota & Fleet Composition
        </h3>
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Fleet composition data for donut chart
  const fleetData = [
    { name: '2WH (4WBS)', value: data.count2WH || 0, color: '#3B82F6' },
    { name: '4WH (PABM)', value: data.count4WH || 0, color: '#F59E0B' },
  ];

  // Custom tooltip for donut chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const total = fleetData.reduce((sum, d) => sum + d.value, 0);
      const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
          <p className="text-gray-600 text-xs">
            {item.value} vehicles ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label for center of donut
  const CenterLabel = ({ viewBox }) => {
    const { cx, cy } = viewBox;
    return (
      <g>
        <text 
          x={cx} 
          y={cy - 10} 
          textAnchor="middle" 
          dominantBaseline="central"
          className="text-4xl font-bold fill-gray-900"
        >
          {data.metQuotaPercentage || 0}%
        </text>
        <text 
          x={cx} 
          y={cy + 15} 
          textAnchor="middle" 
          dominantBaseline="central"
          className="text-xs fill-gray-500"
        >
          Met Quota Target
        </text>
        <text 
          x={cx} 
          y={cy + 30} 
          textAnchor="middle" 
          dominantBaseline="central"
          className="text-xs fill-gray-400"
        >
          {data.metQuotaCount || 0} of {data.totalCouriers || 0} couriers
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          <h3 className="text-lg font-semibold text-gray-900">
            Quota & Fleet Composition
          </h3>
        </div>
        <p className="text-sm text-gray-500">
          Probable assigned adherence & fleet mix
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={fleetData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            label={CenterLabel}
          >
            {fleetData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Fleet Breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <p className="text-xs font-semibold text-gray-600 uppercase">2WH (4WBS)</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{data.count2WH || 0}</p>
            <p className="text-xs text-gray-500">Total Vehicles Dispatched</p>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <p className="text-xs font-semibold text-gray-600 uppercase">4WH (PABM)</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">{data.count4WH || 0}</p>
            <p className="text-xs text-gray-500">Total Vehicles Dispatched</p>
          </div>
        </div>

        {/* Average Target Info */}
        <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Target className="w-4 h-4 text-gray-600" />
          <div className="text-center">
            <p className="text-xs text-gray-500">Avg Target per courier:</p>
            <p className="text-lg font-bold text-gray-900">{data.avgTargetPerCourier || 0} packages</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FleetCompositionChart;
