import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * ScaleIn Animation Component
 * Scales up and fades in when element enters viewport
 */
const ScaleIn = ({ 
  children, 
  delay = 0, 
  duration = 0.4,
  className = '',
  threshold = 0.1,
  triggerOnce = true,
  scale = 0.8
}) => {
  const [ref, inView] = useInView({
    triggerOnce,
    threshold,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        scale 
      }}
      animate={{ 
        opacity: inView ? 1 : 0, 
        scale: inView ? 1 : scale 
      }}
      transition={{
        duration,
        delay,
        ease: [0.34, 1.56, 0.64, 1], // Bouncy easing
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScaleIn;
