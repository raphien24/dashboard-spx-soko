import { useEffect, useRef } from 'react';

/**
 * Custom hook for auto-refreshing data at specified intervals
 * @param {Function} callback - Function to call on each refresh
 * @param {number} interval - Refresh interval in milliseconds
 * @param {boolean} enabled - Whether auto-refresh is enabled
 */
function useAutoRefresh(callback, interval = 30000, enabled = true) {
  const savedCallback = useRef();
  const intervalId = useRef();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (!enabled) {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
      return;
    }

    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    intervalId.current = setInterval(tick, interval);

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [interval, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, []);
}

export default useAutoRefresh;
