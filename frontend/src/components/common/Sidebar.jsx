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
  X,
  ClipboardCheck,
  AlertTriangle,
  ChevronDown,
  Zap,
  Truck,
  Activity,
  GitMerge,
  ShieldCheck
} from 'lucide-react';

const Sidebar = ({ activePage = 'productivity', onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    {
      id: 'productivity',
      label: 'Productivity',
      icon: TrendingUp,
      active: true,
      hasSubmenu: true,
      submenu: [
        { id: 'productivity-dashboard', label: 'Dashboard Weekly',  parent: 'productivity' },
        { id: 'productivity-monthly',   label: 'Dashboard Monthly', parent: 'productivity' },
        { id: 'adjust-target',          label: 'Adjust Target',     parent: 'productivity' },
      ],
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: ClipboardCheck,
      active: false,
      external: true,
      url: 'https://absensi.spxsoko.online/admin',
    },
    {
      id: 'punishment',
      label: 'Punishment Management',
      icon: AlertTriangle,
      active: false,
      hasSubmenu: true,
      submenu: [
        { id: 'sp-generator', label: 'SP Generator', parent: 'punishment' },
        { id: 'sp-record',    label: 'SP Record',    parent: 'punishment' },
      ],
    },
    {
      id: 'expedite',
      label: 'Expedite Tracker',
      icon: Zap,
      active: false,
    },
    {
      id: 'backlog-lm',
      label: 'Backlog LM',
      icon: Package,
      active: false,
    },
    {
      id: 'hse',
      label: 'HSE',
      icon: ShieldCheck,
      active: false,
      hasSubmenu: true,
      submenu: [
        { id: 'hse-daily',  label: 'Daily Briefing', parent: 'hse' },
        { id: 'hse-weekly', label: 'Weekly 5S',       parent: 'hse' },
      ],
    },
    {
      id: 'buyer-rr',
      label: 'Buyer RR',
      icon: Truck,
      active: false,
    },
    {
      id: 'monitor-sdho',
      label: 'Monitor SDHO',
      icon: Activity,
      active: false,
    },
    {
      id: 'control-stuck-fm',
      label: 'Control Stuck FM',
      icon: GitMerge,
      active: false,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      active: false,
      hasSubmenu: true,
      submenu: [
        { id: 'theme-settings', label: 'Theme', parent: 'settings' },
        { id: 'cookie-manager', label: 'Cookie Manager', parent: 'settings' },
        { id: 'animation-demo', label: '🎨 Animation Demo', parent: 'settings' },
      ],
    },
  ];

  const handleNavigate = (item) => {
    // If external link, open in new tab
    if (item.external && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
      setIsMobileOpen(false);
      return;
    }
    
    // If has submenu, toggle expansion
    if (item.hasSubmenu) {
      setExpandedMenus(prev => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
      return;
    }
    
    // Internal navigation
    if (onNavigate && !item.disabled) {
      onNavigate(item.id);
      setIsMobileOpen(false);
    }
  };

  const toggleSubmenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
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
          fixed lg:relative h-screen relative
          bg-white dark:bg-slate-900/70 dark:backdrop-blur-xl
          transition-all duration-300 ease-in-out flex flex-col z-40
          border-r border-gray-200 dark:border-slate-700/50 shadow-lg dark:shadow-2xl
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 w-64'}
        `}
      >
      {/* Space Theme Background - Dark Mode Only */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 pointer-events-none transition-opacity duration-300 bg-gradient-to-b from-slate-900/50 via-indigo-950/50 to-slate-900/50"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(147, 197, 253, 0.1) 0%, transparent 70%)
          `,
        }}
      />
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200 dark:border-indigo-700/50 relative z-10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 dark:bg-white rounded-lg flex items-center justify-center shadow-lg">
                <LayoutDashboard className="w-6 h-6 text-white dark:text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">SPX SOKO</h1>
                <p className="text-xs text-gray-500 dark:text-indigo-300">Dashboard</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-indigo-600 dark:bg-white rounded-lg flex items-center justify-center mx-auto shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-white dark:text-indigo-600" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto relative z-10">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activePage || (item.submenu && item.submenu.some(sub => sub.id === activePage));
          const isDisabled = item.disabled;
          const isExternal = item.external;
          const hasSubmenu = item.hasSubmenu;
          const isExpanded = expandedMenus[item.id];

          return (
            <div key={item.id}>
              {/* Main Menu Item */}
              <button
                onClick={() => handleNavigate(item)}
                disabled={isDisabled}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-indigo-50 dark:bg-white text-indigo-600 dark:text-indigo-900 shadow-lg' 
                    : isDisabled
                    ? 'text-gray-400 dark:text-white/50 cursor-not-allowed opacity-50'
                    : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : ''}`} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {isDisabled && (
                      <span className="text-xs bg-gray-200 dark:bg-white/20 px-2 py-0.5 rounded-full">
                        Soon
                      </span>
                    )}
                    {isExternal && (
                      <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    )}
                    {hasSubmenu && (
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    )}
                  </>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {item.label}
                    {isDisabled && <span className="ml-2 text-gray-400 dark:text-slate-500">(Soon)</span>}
                    {isExternal && <span className="ml-2 text-gray-400 dark:text-slate-500">(External)</span>}
                  </div>
                )}
              </button>

              {/* Submenu Items */}
              {hasSubmenu && isExpanded && !isCollapsed && item.submenu && (
                <div className="mt-1 ml-4 space-y-1">
                  {item.submenu.map((subItem) => {
                    const isSubActive = subItem.id === activePage;
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          if (onNavigate) {
                            onNavigate(subItem.id);
                            setIsMobileOpen(false);
                          }
                        }}
                        className={`
                          w-full flex items-center space-x-3 px-4 py-2 rounded-lg
                          transition-all duration-200 text-sm
                          ${isSubActive
                            ? 'bg-indigo-100 dark:bg-white/20 text-indigo-700 dark:text-white font-medium'
                            : 'text-gray-600 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/10'
                          }
                        `}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span className="flex-1 text-left">{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer - Version Info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-indigo-700/50 relative z-10">
          <div className="text-xs text-gray-500 dark:text-indigo-300">
            <p className="font-semibold">Version 1.0.0</p>
            <p className="mt-1">© 2026 SPX SOKO</p>
          </div>
        </div>
      )}

      {/* Collapse Toggle Button (Desktop Only) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-lg items-center justify-center text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors z-10 border border-gray-200 dark:border-indigo-700"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
      </div>
    </>
  );
};

export default Sidebar;
