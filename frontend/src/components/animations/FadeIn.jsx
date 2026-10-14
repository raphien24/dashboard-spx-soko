import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * FadeIn Animation Component
 * Fades in and slides up when element enters viewport
 */
const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  direction = 'up',
  className = '',
  threshold = 0.1,
  triggerOnce = true
}) => {
  const [ref, inView] = useInView({
    triggerOnce,
    threshold,
  });

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  const initial = {
    opacity: 0,
    ...directions[direction],
  };

  const animate = {
    opacity: inView ? 1 : 0,
    x: inView ? 0 : directions[direction].x,
    y: inView ? 0 : directions[direction].y,
  };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1], // Custom easing similar to GPT
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
