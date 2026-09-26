import { Loader } from 'lucide-react';

/**
 * Loading Spinner Component
 * Reusable loading indicator
 */
function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader className={`${sizeClasses[size]} text-purple-600 animate-spin mb-3`} />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

export default LoadingSpinner;
