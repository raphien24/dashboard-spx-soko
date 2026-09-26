import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * Performance by Contract Type Chart Component
 * Horizontal bar chart showing success rate by contract type
 */
function PerformanceByContractChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Performance by Contract Type
        </h3>
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Colors for different contract types
  const colors = {
    'Dedicated': '#10B981',
    'Mitra': '#8B5CF6',
    'Kurir Plus': '#3B82F6',
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{item.contractType}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">{item.couriers} couriers</span>
            </p>
            <p className="text-green-600 font-semibold">
              {item.successRate}% success
            </p>
            <p className="text-gray-500 text-xs">
              Delivered {item.delivered?.toLocaleString()} / {item.total?.toLocaleString()}
            </p>
            <p className="text-red-500 text-xs">
              Failed: {item.failed?.toLocaleString()}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <h3 className="text-lg font-semibold text-gray-900">
            Performance by Contract Type
          </h3>
        </div>
        <p className="text-sm text-gray-500">
          Assigned vs Delivered volume
        </p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            domain={[0, 100]}
          />
          <YAxis 
            type="category" 
            dataKey="contractType" 
            width={100}
            stroke="#9CA3AF"
            tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }} />
          <Bar 
            dataKey="successRate" 
            radius={[0, 6, 6, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={colors[entry?.contractType] || '#7C3AED'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend with details */}
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm py-1.5">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: colors[item?.contractType] || '#7C3AED' }}
              ></div>
              <span className="font-medium text-gray-700">● {item?.contractType || 'Unknown'}</span>
              <span className="text-gray-500">({item?.couriers || 0} couriers)</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-green-600 font-semibold">{item?.successRate || 0}% success</span>
              <span className="text-gray-600">
                Delivered {item?.delivered?.toLocaleString() || 0}/{item?.total?.toLocaleString() || 0}
              </span>
              <span className="text-red-500">Failed: {item?.failed?.toLocaleString() || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PerformanceByContractChart;
