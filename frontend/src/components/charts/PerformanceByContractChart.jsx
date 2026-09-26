import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatNumber, formatPercentage, getContractBadgeColor } from '../../utils/formatters';
import { CONTRACT_COLORS } from '../../utils/constants';

/**
 * Performance by Contract Type Chart Component
 * Horizontal bar chart showing performance metrics by contract type
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

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{data.contractType}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              Couriers: <span className="font-semibold text-gray-900">{formatNumber(data.couriers)}</span>
            </p>
            <p className="text-gray-600">
              Accounts: <span className="font-semibold text-gray-900">{formatNumber(data.accounts)}</span>
            </p>
            <p className="text-gray-600">
              Performance: <span className="font-semibold text-purple-600">{formatPercentage(data.performance)}</span>
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
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          📊 Performance by Contract Type
        </h3>
        <p className="text-sm text-gray-500">
          {formatNumber(data.reduce((sum, item) => sum + item.couriers, 0))} total couriers
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
          />
          <YAxis 
            type="category" 
            dataKey="contractType" 
            width={120}
            stroke="#9CA3AF"
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.1)' }} />
          <Bar 
            dataKey="performance" 
            radius={[0, 8, 8, 0]}
            label={{ position: 'right', fill: '#6B7280', fontSize: 12 }}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={CONTRACT_COLORS[entry.contractType] || '#7C3AED'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend with additional info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: CONTRACT_COLORS[item.contractType] || '#7C3AED' }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.contractType}</p>
                  <p className="text-xs text-gray-500">
                    {formatNumber(item.couriers)} couriers
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-purple-600">
                  {formatPercentage(item.performance, 1)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatNumber(item.accounts)} accts
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PerformanceByContractChart;
