import { motion } from 'framer-motion';

/**
 * GlassCard Component with Glassmorphism effect
 * Modern card with backdrop blur and subtle animations
 */
const GlassCard = ({ 
  children, 
  className = '',
  hover = true,
  glow = false,
  ...props 
}) => {
  const baseClasses = 'backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border border-white/20 dark:border-slate-700/50 shadow-xl rounded-2xl';
  
  const hoverAnimation = hover ? {
    scale: 1.02,
    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: 0.3,
      ease: [0.34, 1.56, 0.64, 1],
    },
  } : {};

  const glowClasses = glow ? 'shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] dark:shadow-[0_0_30px_-5px_rgba(139,92,246,0.4)]' : '';

  return (
    <motion.div
      className={`${baseClasses} ${glowClasses} ${className}`}
      whileHover={hoverAnimation}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
