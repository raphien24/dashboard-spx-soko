import { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';

/**
 * AnimatedCounter Component
 * Animates number counting up when in view
 */
const AnimatedCounter = ({ 
  value, 
  duration = 1500, 
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  triggerOnce = true
}) => {
  const [ref, inView] = useInView({
    triggerOnce,
    threshold: 0.3,
  });

  const [hasAnimated, setHasAnimated] = useState(false);

  const props = useSpring({
    val: inView && !hasAnimated ? value : 0,
    config: { duration },
    onRest: () => {
      if (inView) setHasAnimated(true);
    },
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      <animated.span>
        {props.val.to(val => val.toFixed(decimals))}
      </animated.span>
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
