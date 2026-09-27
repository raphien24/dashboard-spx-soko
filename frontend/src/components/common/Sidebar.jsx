import { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ activePage = 'productivity', onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    {
      id: 'productivity',
      label: 'Productivity',
      icon: TrendingUp,
      active: true,
    },
    {
      id: 'fleet',
      label: 'Fleet Management',
      icon: Package,
      active: false,
      disabled: true,
    },
    {
      id: 'couriers',
      label: 'Couriers',
      icon: Users,
      active: false,
      disabled: true,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      active: false,
      disabled: true,
    },
  ];

  const handleNavigate = (itemId) => {
    if (onNavigate && !menuItems.find(item => item.id === itemId)?.disabled) {
      onNavigate(itemId);
      setIsMobileOpen(false); // Close mobile menu after navigation
    }
  };

  return (
    <>
      {/* Mobile Menu Button (Fixed Top-Left) */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          fixed lg:relative h-screen bg-gradient-to-b from-indigo-900 via-indigo-800 to-indigo-900 
          text-white transition-all duration-300 ease-in-out flex flex-col z-40
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 w-64'}
        `}
      >
      {/* Logo Section */}
      <div className="p-6 border-b border-indigo-700/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold">SPX SOKO</h1>
                <p className="text-xs text-indigo-300">Dashboard</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto">
              <LayoutDashboard className="w-6 h-6 text-indigo-600" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activePage;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              disabled={isDisabled}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                transition-all duration-200 group relative
                ${isActive 
                  ? 'bg-white text-indigo-900 shadow-lg' 
                  : isDisabled
                  ? 'text-indigo-400 cursor-not-allowed opacity-50'
                  : 'text-indigo-100 hover:bg-indigo-700/50'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : ''}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left font-medium">{item.label}</span>
                  {isDisabled && (
                    <span className="text-xs bg-indigo-700 px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </>
              )}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {item.label}
                  {isDisabled && <span className="ml-2 text-gray-400">(Soon)</span>}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer - Version Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-indigo-700/50">
          <div className="text-xs text-indigo-300">
            <p className="font-semibold">Version 1.0.0</p>
            <p className="mt-1">© 2026 SPX SOKO</p>
          </div>
        </div>
      )}

      {/* Collapse Toggle Button (Desktop Only) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white rounded-full shadow-lg items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors z-10"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </>
  );
};

export default Sidebar;
