import { useRef, useState, useEffect } from 'react';

import { advancedBulletPool } from '../../../game-systems/memory/AdvancedBulletPool';

export const useGameEffects = (unlockingSlots: Set<number>) => {
  // Screen shake effect
  const [screenShake, setScreenShake] = useState(false);
  const [screenShakeIntensity, setScreenShakeIntensity] = useState(0);
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
      setScreenShakeIntensity(5); // Default intensity for slot unlocking
      screenShakeTimerRef.current = window.setTimeout(() => {
        setScreenShake(false);
        setScreenShakeIntensity(0);
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
      setScreenShakeIntensity(0);
    }
  }, [unlockingSlots]);

  // Boss phase transition screen shake
  useEffect(() => {
    const handleScreenShake = (event: CustomEvent) => {
      const { intensity = 5, duration = 600, _frequency = 0.02 } = event.detail;
      
      // Clear any existing timer
      if (screenShakeTimerRef.current) {
        clearTimeout(screenShakeTimerRef.current);
      }
      
      setScreenShake(true);
      setScreenShakeIntensity(intensity);
      
      screenShakeTimerRef.current = window.setTimeout(() => {
        setScreenShake(false);
        setScreenShakeIntensity(0);
        screenShakeTimerRef.current = null;
      }, duration);
    };

    window.addEventListener('screenShake', handleScreenShake as EventListener);
    
    return () => {
      window.removeEventListener('screenShake', handleScreenShake as EventListener);
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

      advancedBulletPool.clear();
      
      if (screenShakeTimerRef.current) {
        clearTimeout(screenShakeTimerRef.current);
      }
      
  
    };
  }, []);

  return {
    screenShake,
    screenShakeIntensity,
    dimensions
  };
}; 