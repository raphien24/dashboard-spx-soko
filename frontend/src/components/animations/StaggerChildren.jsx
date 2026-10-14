import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * StaggerChildren Component
 * Animates children with stagger delay
 */
const StaggerChildren = ({ 
  children, 
  staggerDelay = 0.1,
  className = '',
  triggerOnce = true
}) => {
  const [ref, inView] = useInView({
    triggerOnce,
    threshold: 0.1,
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Child item variant for use with StaggerChildren
export const StaggerItem = ({ children, className = '' }) => {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
};

export default StaggerChildren;
