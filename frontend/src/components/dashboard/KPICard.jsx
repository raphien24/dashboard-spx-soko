import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { formatNumber, formatPercentage, getProgressColor } from '../../utils/formatters';
import AnimatedCounter from '../animations/AnimatedCounter';

/**
 * Animated KPI Card Component with modern animations
 * Displays key performance indicators with smooth animations and hover effects
 */
function KPICard({ 
  title, 
  value, 
  unit, 
  target, 
  percentage, 
  trend, 
  subMetrics,
  color = 'purple',
  icon: Icon,
  delay = 0
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const progressPercentage = percentage || (target ? (value / target) * 100 : 0);
  const progressColor = getProgressColor(progressPercentage);
  
  // Color variations with glassmorphism
  const colorClasses = {
    purple: {
      bg: 'bg-gradient-to-br from-purple-50/80 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20',
      border: 'border-purple-200/50 dark:border-purple-800/50',
      text: 'text-purple-700 dark:text-purple-300',
      icon: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      glow: 'hover:shadow-purple-500/20',
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50/80 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20',
      border: 'border-blue-200/50 dark:border-blue-800/50',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      glow: 'hover:shadow-blue-500/20',
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50/80 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20',
      border: 'border-green-200/50 dark:border-green-800/50',
      text: 'text-green-700 dark:text-green-300',
      icon: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      glow: 'hover:shadow-green-500/20',
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-50/80 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20',
      border: 'border-indigo-200/50 dark:border-indigo-800/50',
      text: 'text-indigo-700 dark:text-indigo-300',
      icon: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
      glow: 'hover:shadow-indigo-500/20',
    },
  };

  const colors = colorClasses[color] || colorClasses.purple;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.5,
        delay: delay * 0.1,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
      }}
      className={`${colors.bg} backdrop-blur-sm border ${colors.border} rounded-2xl p-6 shadow-lg ${colors.glow} hover:shadow-2xl transition-all duration-300 relative overflow-hidden group`}
    >
      {/* Background gradient animation on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        initial={false}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <motion.div
                className={`${colors.iconBg} p-2 rounded-xl`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              </motion.div>
            )}
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-500 ml-12">{unit}</p>
        </div>
        
        {/* Trend Indicator */}
        {trend && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={inView ? { scale: 1, rotate: 0 } : {}}
            transition={{ 
              delay: delay * 0.1 + 0.3,
              type: 'spring',
              stiffness: 200,
              damping: 15
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
              trend === 'up' 
                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' 
                : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
            } shadow-sm`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </motion.div>
        )}
      </div>

      {/* Main Value with animated counter */}
      <div className="mb-4 relative z-10">
        <div className="flex items-baseline gap-2">
          <AnimatedCounter 
            value={typeof value === 'number' ? value : parseFloat(value) || 0}
            decimals={typeof value === 'number' && value % 1 !== 0 ? 1 : 0}
            className={`text-4xl font-bold ${colors.text}`}
            duration={1500}
            triggerOnce={true}
          />
          {target && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: delay * 0.1 + 0.5 }}
              className="text-lg text-gray-400 dark:text-slate-500"
            >
              / {formatNumber(target)}
            </motion.span>
          )}
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="mb-4 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600 dark:text-slate-400">Progress</span>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: delay * 0.1 + 0.4 }}
            className={`text-xs font-bold ${colors.text}`}
          >
            {formatPercentage(progressPercentage, 1)}
          </motion.span>
        </div>
        <div className="w-full bg-gray-200/50 dark:bg-slate-700/50 rounded-full h-3 overflow-hidden backdrop-blur-sm shadow-inner">
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={inView ? { 
              width: `${Math.min(progressPercentage, 100)}%`,
              opacity: 1
            } : {}}
            transition={{
              duration: 1.5,
              delay: delay * 0.1 + 0.3,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className={`h-full ${progressColor} rounded-full`}
          />
        </div>
        </div>
      </div>

      {/* Sub Metrics */}
      {subMetrics && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: delay * 0.1 + 0.6 }}
          className="space-y-2 pt-3 border-t border-gray-200/50 dark:border-slate-700/50 relative z-10"
        >
          {Object.entries(subMetrics).map(([key, value], idx) => (
            <motion.div 
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: delay * 0.1 + 0.7 + (idx * 0.1) }}
              className="flex items-center justify-between group/item"
            >
              <span className="text-xs text-gray-600 dark:text-slate-400 capitalize group-hover/item:text-gray-800 dark:group-hover/item:text-slate-300 transition-colors">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-xs font-semibold text-gray-900 dark:text-slate-100">
                {value}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

export default KPICard;
