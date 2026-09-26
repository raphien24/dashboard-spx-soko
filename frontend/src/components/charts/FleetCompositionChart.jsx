import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Bike, Car, Truck } from 'lucide-react';
import { formatNumber, formatPercentage } from '../../utils/formatters';

/**
 * Fleet Composition Donut Chart Component
 * Shows fleet composition and quota information
 */
function FleetCompositionChart({ data }) {
  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🚗 Quote & Fleet Composition
        </h3>
        <div className="h-80 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  const { mainTarget, motorcycles, fleetMotors, fleetPickups, avgTargetPerCourier, totalPackages } = data;

  // Prepare data for donut chart
  const chartData = [
    { name: 'Motorcycles', value: motorcycles, color: '#7C3AED', icon: Bike },
    { name: 'Fleet Motors', value: fleetMotors, color: '#3B82F6', icon: Car },
    { name: 'Fleet Pickups', value: fleetPickups, color: '#10B981', icon: Truck },
  ].filter(item => item.value > 0);

  const totalFleet = motorcycles + fleetMotors + fleetPickups;

  // Custom label for center
  const renderCustomLabel = ({ cx, cy }) => {
    return (
      <g>
        <text 
          x={cx} 
          y={cy - 10} 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="text-4xl font-bold fill-purple-600"
        >
          {mainTarget}%
        </text>
        <text 
          x={cx} 
          y={cy + 15} 
          textAnchor="middle" 
          dominantBaseline="middle"
          className="text-sm fill-gray-500"
        >
          Main Quota Target
        </text>
      </g>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalFleet) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-semibold text-gray-900">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Share: <span className="font-semibold" style={{ color: data.payload.color }}>
              {percentage}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          🚗 Quote & Fleet Composition
        </h3>
        <p className="text-sm text-gray-500">
          {formatNumber(totalFleet)} total fleet vehicles
        </p>
      </div>

      {/* Chart */}
      <div className="flex items-center justify-center mb-6">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Fleet Breakdown */}
      <div className="space-y-3 mb-6">
        {chartData.map((item, index) => {
          const Icon = item.icon;
          const percentage = ((item.value / totalFleet) * 100).toFixed(1);
          
          return (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{percentage}% of fleet</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500">vehicles</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="pt-4 border-t border-gray-200 space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
            <span className="text-sm text-gray-600">Avg Target per Courier</span>
          </div>
          <span className="text-sm font-semibold text-purple-600">
            {avgTargetPerCourier > 0 ? formatNumber(avgTargetPerCourier) : 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span className="text-sm text-gray-600">Total Packages</span>
          </div>
          <span className="text-sm font-semibold text-blue-600">
            {formatNumber(totalPackages)} packages
          </span>
        </div>
      </div>
    </div>
  );
}

export default FleetCompositionChart;
