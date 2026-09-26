import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * Top Zones by Parcel Volume Chart Component
 * Horizontal bar chart showing top zones with volume and success rate
 */
function TopZonesChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🌍 Top Zones by Parcel Volume
        </h3>
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Add ranking to data
  const rankedData = data.map((item, index) => ({
    ...item,
    rank: index + 1
  }));

  // Color gradient from darkest to lightest
  const colors = ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
              #{item.rank}
            </div>
            <p className="font-semibold text-gray-900">{item.zone}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              Delivered: <span className="font-semibold text-gray-900">{item.delivered?.toLocaleString()}</span>
            </p>
            <p className="text-gray-600">
              Total: <span className="font-semibold text-gray-900">{item.total?.toLocaleString()}</span>
            </p>
            <p className="text-green-600 font-semibold">
              Success Rate: {item.successRate}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label showing delivered/total and percentage
  const CustomLabel = (props) => {
    const { x, y, width, value, payload } = props;
    return (
      <text 
        x={x + width + 5} 
        y={y + 10} 
        fill="#374151" 
        fontSize={11}
        fontWeight={600}
      >
        {payload.delivered?.toLocaleString()}/{payload.total?.toLocaleString()} {payload.successRate}%
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <h3 className="text-lg font-semibold text-gray-900">
            Top Zones by Parcel Volume
          </h3>
        </div>
        <p className="text-sm text-gray-500">
          Operational zone breakdown
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={rankedData}
          layout="vertical"
          margin={{ top: 5, right: 120, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            hide
          />
          <YAxis 
            type="category" 
            dataKey="zone" 
            width={80}
            stroke="#9CA3AF"
            tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
          <Bar 
            dataKey="delivered" 
            radius={[0, 6, 6, 0]}
            label={<CustomLabel />}
          >
            {rankedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[index] || colors[colors.length - 1]} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Zone rankings */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {rankedData.map((item) => (
            <div key={item.zone} className="flex items-center justify-between text-sm py-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                  #{item.rank}
                </div>
                <span className="font-medium text-gray-700">{item.zone}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-900 font-semibold text-xs">
                  {item.delivered?.toLocaleString()}/{item.total?.toLocaleString()}
                </span>
                <span className="ml-2 text-green-600 font-semibold text-xs">
                  {item.successRate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TopZonesChart;
