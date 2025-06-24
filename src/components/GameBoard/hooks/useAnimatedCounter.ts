import { useState, useEffect } from 'react';

export const useAnimatedCounter = (endValue: number, isActive: boolean = true) => {
  const [count, setCount] = useState(0);
  const duration = 1000; // 1 second animation

  useEffect(() => {
    if (!isActive) return;
    
    let startTime: number | null = null;
    
    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const current = Math.min(Math.floor(progress / duration * endValue), endValue);
      setCount(current);
      
      if (progress < duration) {
        requestAnimationFrame(animateCount);
      }
    };
    
    requestAnimationFrame(animateCount);
  }, [endValue, isActive, duration]);

  return count;
}; 