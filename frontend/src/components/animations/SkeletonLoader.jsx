import { motion } from 'framer-motion';

/**
 * SkeletonLoader Component
 * Animated skeleton for loading states
 */
const SkeletonLoader = ({ 
  className = '', 
  variant = 'default',
  count = 1 
}) => {
  const variants = {
    default: 'h-4 rounded',
    text: 'h-4 rounded w-3/4',
    title: 'h-8 rounded w-1/2',
    circle: 'w-12 h-12 rounded-full',
    card: 'h-32 rounded-xl',
  };

  const shimmer = {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  };

  const baseClass = 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 bg-[length:200%_100%]';

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className={`${baseClass} ${variants[variant]} ${className}`}
          animate={shimmer.animate}
          transition={shimmer.transition}
          style={{ backgroundSize: '200% 100%' }}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;
