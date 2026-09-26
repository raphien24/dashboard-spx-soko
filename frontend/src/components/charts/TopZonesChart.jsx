import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatNumber, formatPercentage, formatCompactNumber } from '../../utils/formatters';
import { CHART_COLORS } from '../../utils/constants';

/**
 * Top Zones by Parcel Volume Chart Component
 * Horizontal bar chart showing top performing zones
 */
function TopZonesChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📍 Top Zones by Parcel Volume
        </h3>
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Generate color gradient for bars
  const getBarColor = (index) => {
    const colors = [
      '#7C3AED', // Purple
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Orange
      '#EF4444', // Red
    ];
    return colors[index % colors.length];
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{data.zone}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              Parcels: <span className="font-semibold text-gray-900">{formatNumber(data.parcels)}</span>
            </p>
            <p className="text-gray-600">
              Share: <span className="font-semibold text-purple-600">{formatPercentage(data.percentage)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalParcels = data.reduce((sum, item) => sum + item.parcels, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          📍 Top Zones by Parcel Volume
        </h3>
        <p className="text-sm text-gray-500">
          {formatCompactNumber(totalParcels)} total parcels across top zones
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number" 
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => formatCompactNumber(value)}
          />
          <YAxis 
            type="category" 
            dataKey="zone" 
            width={140}
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.1)' }} />
          <Bar 
            dataKey="parcels" 
            radius={[0, 8, 8, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(index)} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Detailed List */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="space-y-3">
          {data.map((item, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Left: Rank and Zone */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: getBarColor(index) }}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.zone}</p>
                  <p className="text-xs text-gray-500">Zone Code</p>
                </div>
              </div>

              {/* Right: Stats */}
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCompactNumber(item.parcels)}
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: getBarColor(index)
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {formatPercentage(item.percentage, 0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Volume</span>
          <span className="font-semibold text-gray-900">
            {formatNumber(totalParcels)} parcels
          </span>
        </div>
      </div>
    </div>
  );
}

export default TopZonesChart;
