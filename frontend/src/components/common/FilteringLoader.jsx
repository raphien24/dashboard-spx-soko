import { Loader2, Filter, TrendingUp, BarChart3, Users } from 'lucide-react';

/**
 * Filtering Loader Component
 * Fun loading animation when applying filters
 */
function FilteringLoader() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Icons */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Center spinning loader */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
          </div>
          
          {/* Orbiting icons */}
          <div className="absolute inset-0 animate-spin-slow">
            <Filter className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 text-indigo-400" />
          </div>
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDelay: '0.5s' }}>
            <TrendingUp className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 text-indigo-400" />
          </div>
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDelay: '1s' }}>
            <BarChart3 className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400" />
          </div>
          <div className="absolute inset-0 animate-spin-slow" style={{ animationDelay: '1.5s' }}>
            <Users className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">
            Applying Filters
          </h3>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-sm text-gray-600">
            Crunching numbers and filtering data...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-64 mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilteringLoader;
