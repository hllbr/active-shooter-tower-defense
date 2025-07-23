import { useRef, useState, useEffect } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';

import { advancedBulletPool } from '../../../game-systems/memory/AdvancedBulletPool';

export const useGameEffects = (unlockingSlots: Set<number>) => {
  // Screen shake effect
  const [screenShake, setScreenShake] = useState(false);
  const screenShakeTimerRef = useRef<number | null>(null);

  // Viewport dimensions cache
  const [dimensions, setDimensions] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }));

  // Screen shake effect management
  useEffect(() => {
    // Clear any existing timer to prevent overlap
    if (screenShakeTimerRef.current) {
      clearTimeout(screenShakeTimerRef.current);
      screenShakeTimerRef.current = null;
    }

    if (unlockingSlots.size > 0) {
      setScreenShake(true);
      screenShakeTimerRef.current = window.setTimeout(() => {
        setScreenShake(false);
        screenShakeTimerRef.current = null;
      }, 600);
      
      return () => {
        if (screenShakeTimerRef.current) {
          clearTimeout(screenShakeTimerRef.current);
          screenShakeTimerRef.current = null;
        }
      };
    } else {
      setScreenShake(false);
    }
  }, [unlockingSlots]);



  // Viewport dimensions management with passive listeners
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Use passive listeners for better performance
    window.addEventListener('resize', updateDimensions, { passive: true });
    window.addEventListener('orientationchange', updateDimensions, { passive: true });
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  // Global memory cleanup
  useEffect(() => {
    return () => {

      advancedBulletPool.clear();
      
      if (screenShakeTimerRef.current) {
        clearTimeout(screenShakeTimerRef.current);
      }
      
      if (GAME_CONSTANTS.DEBUG_MODE) {
        const _bulletStats = advancedBulletPool.getStats();
      }
    };
  }, []);

  return {
    screenShake,
    dimensions
  };
}; 