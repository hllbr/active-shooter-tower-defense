import { useRef, useState, useEffect } from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { performMemoryCleanup } from '../../../game-systems/Effects';
import { bulletPool } from '../../../game-systems/bullet-system/BulletPool';

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

  // Legacy screen shake support
  useEffect(() => {
    const legacyShakeTimerRef = { current: null as number | null };
    
    const onScreenShake = () => {
      if (legacyShakeTimerRef.current) {
        clearTimeout(legacyShakeTimerRef.current);
      }
      
      setScreenShake(true);
      legacyShakeTimerRef.current = window.setTimeout(() => {
        setScreenShake(false);
        legacyShakeTimerRef.current = null;
      }, 600);
    };
    
    window.addEventListener('screenShake', onScreenShake, { passive: true });
    return () => {
      window.removeEventListener('screenShake', onScreenShake);
      if (legacyShakeTimerRef.current) {
        clearTimeout(legacyShakeTimerRef.current);
      }
    };
  }, []);

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
      performMemoryCleanup();
      bulletPool.clear();
      
      if (screenShakeTimerRef.current) {
        clearTimeout(screenShakeTimerRef.current);
      }
      
      if (GAME_CONSTANTS.DEBUG_MODE) {
        console.log('🧹 GameBoard: Global memory cleanup completed');
        const bulletStats = bulletPool.getStats();
        console.log(`📊 Bullet Pool Stats: Created: ${bulletStats.created}, Reused: ${bulletStats.reused}, Reuse Rate: ${bulletStats.reuseRate.toFixed(1)}%`);
      }
    };
  }, []);

  return {
    screenShake,
    dimensions
  };
}; 