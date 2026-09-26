import { Warehouse, Users, Truck, Building, Network } from 'lucide-react';
import MetricCard from './MetricCard';

/**
 * Metrics Cards Section Component
 * Displays 5 summary metric cards in a grid
 */
function MetricsCardsSection({ summaryMetrics }) {
  if (!summaryMetrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  const {
    uniqueWarehouses,
    totalEmployees,
    bdLogistic,
    totalAccounts,
    relationships,
  } = summaryMetrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Unique Warehouses */}
      <MetricCard
        title="Unique Warehouses"
        value={uniqueWarehouses}
        badge={uniqueWarehouses > 50 ? "High" : "Active"}
        icon={Warehouse}
        color="purple"
      />

      {/* Total Employees */}
      <MetricCard
        title="Total Employees"
        value={totalEmployees}
        badge="Active"
        icon={Users}
        color="blue"
      />

      {/* B&D Logistic */}
      <MetricCard
        title="B&D Logistic"
        value={bdLogistic}
        icon={Truck}
        color="green"
      />

      {/* Total Accounts */}
      <MetricCard
        title="Total Accounts"
        value={totalAccounts}
        badge="Managed"
        icon={Building}
        color="orange"
      />

      {/* Relationships */}
      <MetricCard
        title="Relationships"
        value={relationships}
        badge="Active"
        icon={Network}
        color="red"
      />
    </div>
  );
}

export default MetricsCardsSection;
