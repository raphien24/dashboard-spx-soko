import { useState } from 'react';
import { ChevronUp, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { 
  formatNumber, 
  formatPercentage, 
  getContractBadgeColor, 
  getProgressColor,
  calculatePercentage 
} from '../../utils/formatters';
import { DAYS_OF_WEEK } from '../../utils/constants';

/**
 * Courier Table Component
 * Interactive table displaying courier schedule and performance data
 */
function CourierTable({ data }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
        <p className="text-gray-500">No courier data available</p>
      </div>
    );
  }

  // Sorting logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Sort header component
  const SortHeader = ({ label, sortKey }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className="flex items-center gap-1 hover:text-purple-600 transition-colors"
    >
      {label}
      {sortConfig.key === sortKey && (
        sortConfig.direction === 'asc' ? 
          <ChevronUp className="w-4 h-4" /> : 
          <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Courier Schedule</h3>
            <p className="text-sm text-gray-500 mt-1">
              Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of {data.length} couriers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <SortHeader label="Courier" sortKey="name" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <SortHeader label="Zone" sortKey="zone" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Contract
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <SortHeader label="Productivity" sortKey="productivityActual" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                <SortHeader label="Success %" sortKey="successRate" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Active Days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((courier, index) => {
              const progressPercent = calculatePercentage(courier.productivityActual, courier.productivityTarget);
              const progressColor = getProgressColor(progressPercent);
              
              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  {/* Courier Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{courier.name}</div>
                      <div className="text-xs text-gray-500">{courier.id}</div>
                    </div>
                  </td>

                  {/* Zone */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{courier.zone}</span>
                  </td>

                  {/* Contract */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContractBadgeColor(courier.contract)}`}>
                      {courier.contract}
                    </span>
                  </td>

                  {/* Vehicle */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{courier.vehicle}</span>
                  </td>

                  {/* Productivity with Progress Bar */}
                  <td className="px-6 py-4">
                    <div className="w-40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">
                          {courier.productivityActual.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          {courier.productivityTarget}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${progressColor} transition-all duration-300`}
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Success Rate */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${
                      courier.successRate >= 95 ? 'text-green-600' :
                      courier.successRate >= 80 ? 'text-blue-600' :
                      courier.successRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(courier.successRate, 1)}
                    </span>
                  </td>

                  {/* Active Days */}
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {DAYS_OF_WEEK.map((day, idx) => {
                        const dayKey = day.toLowerCase();
                        const isActive = courier.activeDays?.[dayKey];
                        return (
                          <div
                            key={idx}
                            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                              isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                            title={`${day}: ${isActive ? 'Active' : 'Off'}`}
                          >
                            {day.charAt(0)}
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1 text-sm font-medium rounded-lg ${
                    currentPage === idx + 1
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourierTable;
