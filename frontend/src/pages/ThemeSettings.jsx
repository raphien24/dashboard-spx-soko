import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSettings = () => {
  const { themeMode, setThemeMode, effectiveTheme } = useTheme();

  const themeOptions = [
    {
      id: 'light',
      label: 'Light Mode',
      description: 'Always use light theme',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      description: 'Always use dark theme',
      icon: Moon,
    },
    {
      id: 'system',
      label: 'System',
      description: 'Follow device settings',
      icon: Monitor,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            {effectiveTheme === 'dark' ? (
              <Moon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Sun className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Theme Settings</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize how the dashboard looks
            </p>
          </div>
        </div>
      </div>

      {/* Current Theme Info */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {effectiveTheme === 'dark' ? (
              <Moon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Sun className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Currently using</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {effectiveTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              {themeMode === 'system' && (
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                  (from system)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Theme Options */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Choose Theme
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = themeMode === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => setThemeMode(option.id)}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-800'
                  }
                `}
              >
                {/* Check Mark */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center mb-4
                  ${isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Label */}
                <h3 className={`
                  text-lg font-semibold mb-1
                  ${isSelected
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-900 dark:text-white'
                  }
                `}>
                  {option.label}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
              About Theme Settings
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• <strong>Light Mode:</strong> Dashboard always uses light theme</li>
              <li>• <strong>Dark Mode:</strong> Dashboard always uses dark theme</li>
              <li>• <strong>System:</strong> Automatically matches your device's theme preference</li>
            </ul>
            <p className="text-xs text-blue-700 dark:text-blue-500 mt-2">
              Your preference is saved and will persist across sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
