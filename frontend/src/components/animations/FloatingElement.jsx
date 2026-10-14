import { motion } from 'framer-motion';

/**
 * FloatingElement Component
 * Creates subtle floating animation effect
 */
const FloatingElement = ({ 
  children, 
  duration = 3,
  yOffset = 10,
  className = '' 
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -yOffset, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};

export default FloatingElement;
