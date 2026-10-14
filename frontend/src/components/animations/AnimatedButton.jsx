import { motion } from 'framer-motion';

/**
 * AnimatedButton Component
 * Button with ripple effect and smooth animations
 */
const AnimatedButton = ({ 
  children, 
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50',
    secondary: 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50',
    danger: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/50',
  };

  return (
    <motion.button
      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${variants[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      whileHover={!disabled ? { 
        scale: 1.05,
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.3)',
      } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 17 
      }}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
