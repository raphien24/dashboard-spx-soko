import { motion } from 'framer-motion';
import { Package, TrendingUp } from 'lucide-react';

/**
 * Courier Delivery Loading Animation
 * Shows an animated courier delivering packages
 */
const CourierLoadingAnimation = ({ message = "Loading dashboard data...", subtitle = "Fetching real-time data from Google Sheets" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Animation Container */}
      <div className="relative w-64 h-32 mb-8">
        {/* Road/Path */}
        <div className="absolute bottom-8 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
            animate={{
              x: ['-100%', '300%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        {/* Courier on Motorcycle */}
        <motion.div
          className="absolute bottom-8 left-0"
          animate={{
            x: [0, 240],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Motorcycle body */}
          <div className="relative">
            {/* Delivery Box/Package on back */}
            <motion.div
              className="absolute -top-6 left-2 w-8 h-8"
              animate={{
                y: [-2, 2, -2],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
            </motion.div>

            {/* Courier/Rider */}
            <svg width="48" height="48" viewBox="0 0 48 48" className="text-indigo-600 dark:text-indigo-400">
              {/* Helmet */}
              <circle cx="20" cy="12" r="6" fill="currentColor" opacity="0.8" />
              {/* Body */}
              <rect x="16" y="16" width="8" height="12" rx="2" fill="currentColor" />
              {/* Legs */}
              <rect x="16" y="26" width="3" height="8" rx="1.5" fill="currentColor" opacity="0.7" />
              <rect x="21" y="26" width="3" height="8" rx="1.5" fill="currentColor" opacity="0.7" />
              {/* Motorcycle */}
              <circle cx="12" cy="34" r="4" fill="currentColor" opacity="0.6" />
              <circle cx="32" cy="34" r="4" fill="currentColor" opacity="0.6" />
              <rect x="12" y="30" width="20" height="2" rx="1" fill="currentColor" opacity="0.5" />
            </svg>
          </div>
        </motion.div>

        {/* Floating Packages (being delivered) */}
        <motion.div
          className="absolute top-2 right-8"
          animate={{
            y: [0, -10, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Package className="w-6 h-6 text-green-500 dark:text-green-400" />
        </motion.div>

        <motion.div
          className="absolute top-8 right-20"
          animate={{
            y: [0, -8, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 2.5,
            delay: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Package className="w-5 h-5 text-blue-500 dark:text-blue-400" />
        </motion.div>
      </div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <p className="text-gray-900 dark:text-slate-100 text-lg font-semibold mb-2 flex items-center gap-2 justify-center">
          <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          {message}
        </p>
        <p className="text-gray-500 dark:text-slate-500 text-sm">{subtitle}</p>
      </motion.div>

      {/* Loading Dots */}
      <div className="flex items-center gap-2 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CourierLoadingAnimation;
