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
  const [targetValue, setTargetValue] = useState(0);

  // Update target value when value prop changes
  useEffect(() => {
    if (value !== targetValue) {
      setTargetValue(value);
      // Reset animation state when value changes significantly
      if (!hasAnimated && value > 0) {
        setHasAnimated(false);
      }
    }
  }, [value, targetValue, hasAnimated]);

  const props = useSpring({
    val: (inView || !triggerOnce) ? targetValue : 0,
    config: { duration },
    onRest: () => {
      if (inView && triggerOnce) setHasAnimated(true);
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
