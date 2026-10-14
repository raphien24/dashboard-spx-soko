import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MousePointerClick } from 'lucide-react';
import AnimatedCounter from '../animations/AnimatedCounter';

/**
 * AnimatedKPICard - Flexible animated card for complex KPI data
 * Used in KPICardsSection for Weekly, Monthly dashboards
 */
const AnimatedKPICard = ({ 
  title,
  subtitle,
  value,
  unit,
  secondaryUnit,
  icon: Icon,
  color = 'purple',
  badge,
  badgeColor = 'orange',
  topBadges,
  rightBadge,
  comparisonBadge,
  progress,
  progressBars,
  subMetrics,
  formula,
  statusBadge,
  filterBadge,
  extraBadge,
  onClick,
  clickHint,
  borderColor,
  delay = 0
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Color maps
  const iconBgColors = {
    purple: 'bg-purple-100 dark:bg-purple-950',
    indigo: 'bg-indigo-100 dark:bg-indigo-950',
    green: 'bg-green-100 dark:bg-green-950',
    blue: 'bg-blue-100 dark:bg-blue-950',
    amber: 'bg-amber-100 dark:bg-amber-950',
  };

  const iconColors = {
    purple: 'text-purple-600 dark:text-purple-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    green: 'text-green-600 dark:text-green-400',
    blue: 'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
  };

  const badgeColors = {
    orange: 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400',
    purple: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400',
    indigo: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
    gray: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300',
    amber: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
  };

  const borderColors = {
    purple: 'border-purple-200 dark:border-purple-800 hover:ring-purple-300 dark:hover:ring-purple-700',
    indigo: 'border-gray-200 dark:border-slate-800',
    green: 'border-gray-200 dark:border-slate-800',
  };

  const progressColors = {
    green: 'bg-green-500 dark:bg-green-400',
    yellow: 'bg-yellow-500 dark:bg-yellow-400',
    orange: 'bg-orange-500 dark:bg-orange-400',
    blue: 'bg-blue-500 dark:bg-blue-400',
    purple: 'bg-purple-500 dark:bg-purple-400',
  };

  const getProgressColor = (percent) => {
    if (percent >= 100) return progressColors.green;
    if (percent >= 90) return progressColors.yellow;
    return progressColors.orange;
  };

  const cardClasses = onClick 
    ? `bg-white dark:bg-slate-900 rounded-xl shadow-sm border ${borderColors[borderColor] || borderColors.indigo} p-6 hover:shadow-lg transition-all cursor-pointer group ring-0 hover:ring-2 relative`
    : `bg-white dark:bg-slate-900 rounded-xl shadow-sm border ${borderColors[borderColor] || borderColors.indigo} p-6 hover:shadow-md transition-shadow`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 0.6,
        delay: delay,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      whileHover={{ 
        scale: 1.02,
        y: -5,
        transition: { duration: 0.3 }
      }}
      className={cardClasses}
      onClick={onClick}
    >
      {/* Click hint */}
      {onClick && clickHint && (
        <div className="absolute top-3 right-14 flex items-center gap-1 px-2 py-0.5 bg-purple-50 dark:bg-purple-950 text-purple-500 dark:text-purple-400 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <MousePointerClick className="w-3 h-3" />
          {clickHint}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          {Icon && (
            <motion.div
              className={`w-12 h-12 rounded-lg ${iconBgColors[color]} flex items-center justify-center`}
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <Icon className={`w-6 h-6 ${iconColors[color]}`} />
            </motion.div>
          )}
          
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-slate-400 uppercase">
                {title}
              </h3>
              {/* Top badges */}
              {topBadges && (
                <div className="flex items-center gap-1">
                  {topBadges.map((b, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      animate={inView ? { scale: 1 } : {}}
                      transition={{ delay: delay + 0.2 + (i * 0.1) }}
                      className={`px-1.5 py-0.5 ${badgeColors[b.color]} text-xs font-semibold rounded`}
                    >
                      {b.text}
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        
        {/* Right badge */}
        {(rightBadge || badge) && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={inView ? { scale: 1, rotate: 0 } : {}}
            transition={{ delay: delay + 0.3, type: 'spring' }}
            className={`px-2 py-1 ${badgeColors[(rightBadge || badge) ? (rightBadge?.color || badgeColor) : badgeColor]} text-xs font-semibold rounded`}
          >
            {(rightBadge?.text || badge)}
          </motion.div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <AnimatedCounter
            value={value}
            decimals={1}
            className="text-5xl font-bold text-gray-900 dark:text-slate-100"
            duration={1500}
            triggerOnce={true}
          />
          <span className="text-lg text-gray-500 dark:text-slate-400 font-medium">{unit}</span>
          {secondaryUnit && (
            <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
              {secondaryUnit}
            </span>
          )}
        </div>
      </div>

      {/* Comparison Badge */}
      {comparisonBadge && (
        <div className="mb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: delay + 0.4 }}
            className={`inline-flex items-center px-3 py-1 rounded-full ${badgeColors[comparisonBadge.color]} text-sm font-semibold`}
          >
            {comparisonBadge.text}
          </motion.div>
        </div>
      )}

      {/* Progress Bar (single) */}
      {progress && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 mb-1">
            <span>{progress.label}</span>
            <span className="font-semibold">
              {progress.current} {progress.target && `/ ${progress.target} ${progress.unit}`}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={inView ? { width: `${Math.min(progress.value, 100)}%` } : {}}
              transition={{ duration: 1.5, delay: delay + 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className={`h-2.5 rounded-full ${getProgressColor(progress.value)}`}
            />
          </div>
        </div>
      )}

      {/* Progress Bars (multiple) */}
      {progressBars && (
        <div className="space-y-3 mb-4">
          {progressBars.map((bar, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-medium text-${bar.color}-700 dark:text-${bar.color}-400`}>
                  {bar.label}
                </span>
                <span className="font-semibold text-gray-900 dark:text-slate-100">
                  {bar.value} {bar.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${bar.percent}%` } : {}}
                  transition={{ duration: 1.5, delay: delay + 0.5 + (i * 0.1), ease: [0.34, 1.56, 0.64, 1] }}
                  className={`h-2 rounded-full ${progressColors[bar.color]}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub Metrics */}
      {subMetrics && subMetrics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: delay + 0.6 }}
          className={`grid grid-cols-${subMetrics.length} gap-3 pt-3 ${progress || progressBars ? 'mt-3' : ''} border-t border-gray-100 dark:border-slate-800`}
        >
          {subMetrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: delay + 0.7 + (i * 0.1) }}
            >
              <p className="text-xs text-gray-500 dark:text-slate-500">{metric.label}</p>
              <p className="text-sm font-bold text-gray-900 dark:text-slate-100">{metric.value}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Formula Info */}
      {formula && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: delay + 0.8 }}
          className="mt-3 text-xs text-gray-400 dark:text-slate-500 italic"
        >
          Formula: {formula}
        </motion.div>
      )}

      {/* Filter Badge */}
      {filterBadge && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: delay + 0.9 }}
          className="mt-3"
        >
          <div className={`inline-flex items-center px-3 py-1 rounded-full ${badgeColors[filterBadge.color]} text-xs font-medium`}>
            {filterBadge.text}
          </div>
        </motion.div>
      )}

      {/* Extra Badge */}
      {extraBadge && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: delay + 0.9 }}
          className="mt-3"
        >
          <div className={`inline-flex items-center px-3 py-1 rounded-full ${badgeColors[extraBadge.color]} text-xs font-semibold`}>
            {extraBadge.text}
          </div>
        </motion.div>
      )}

      {/* Status Badge */}
      {statusBadge && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: delay + 1.0 }}
          className="mt-3"
        >
          <div className={`inline-flex items-center px-3 py-1 rounded-full ${badgeColors[statusBadge.color]} text-xs font-semibold`}>
            {statusBadge.text}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnimatedKPICard;
