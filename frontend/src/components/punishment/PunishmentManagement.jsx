import { FileText, Database } from 'lucide-react';
import SPGenerator from './SPGenerator';
import SPRecord from './SPRecord';

const PunishmentManagement = ({ activeSubPage }) => {
  const tabs = [
    { id: 'sp-generator', label: 'SP Generator', icon: FileText },
    { id: 'sp-record', label: 'SP Record', icon: Database },
  ];

  const activePage = activeSubPage || 'sp-generator';

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Punishment Management</h1>
            <p className="text-sm text-gray-500">Kelola Surat Peringatan (SP) Kurir</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-5 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activePage === tab.id;
            return (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activePage === 'sp-generator' && (
          <div className="h-full" style={{ minHeight: '70vh' }}>
            <SPGenerator />
          </div>
        )}
        {activePage === 'sp-record' && (
          <SPRecord />
        )}
      </div>
    </div>
  );
};

export default PunishmentManagement;
