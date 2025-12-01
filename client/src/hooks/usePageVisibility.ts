import { useState, useEffect } from 'react';

/**
 * Hook to detect if the page/tab is visible
 * Returns true when page is visible, false when hidden
 */
export const usePageVisibility = (): boolean => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};
