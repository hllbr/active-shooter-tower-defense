import React, { useEffect, useState, useCallback } from 'react';
import { useTheme } from '../theme/ThemeProvider';

interface MobileOptimizationsProps {
  children: React.ReactNode;
  performanceMode?: 'high' | 'medium' | 'low';
  enableTouchOptimizations?: boolean;
  enableGestureSupport?: boolean;
  enableHapticFeedback?: boolean;
}

interface PerformanceSettings {
  particleCount: number;
  shadowQuality: 'high' | 'medium' | 'low';
  animationFrameRate: number;
  textureQuality: 'high' | 'medium' | 'low';
  effectIntensity: number;
  blurQuality: 'high' | 'medium' | 'low';
}

export const MobileOptimizations: React.FC<MobileOptimizationsProps> = ({
  children,
  performanceMode = 'medium',
  enableTouchOptimizations = true,
  enableGestureSupport = true,
  enableHapticFeedback = true,
}) => {
  const { isReducedMotion } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [_screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [performanceSettings, setPerformanceSettings] = useState<PerformanceSettings>({
    particleCount: 50,
    shadowQuality: 'medium',
    animationFrameRate: 60,
    textureQuality: 'medium',
    effectIntensity: 0.7,
    blurQuality: 'medium',
  });

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply performance settings based on mode
  useEffect(() => {
    const getPerformanceSettings = (mode: string): PerformanceSettings => {
      switch (mode) {
        case 'high':
          return {
            particleCount: 100,
            shadowQuality: 'high',
            animationFrameRate: 60,
            textureQuality: 'high',
            effectIntensity: 1.0,
            blurQuality: 'high',
          };
        case 'low':
          return {
            particleCount: 20,
            shadowQuality: 'low',
            animationFrameRate: 30,
            textureQuality: 'low',
            effectIntensity: 0.3,
            blurQuality: 'low',
          };
        default: // medium
          return {
            particleCount: 50,
            shadowQuality: 'medium',
            animationFrameRate: 60,
            textureQuality: 'medium',
            effectIntensity: 0.7,
            blurQuality: 'medium',
          };
      }
    };

    setPerformanceSettings(getPerformanceSettings(performanceMode));
  }, [performanceMode]);

  // Apply CSS variables for mobile optimizations
  useEffect(() => {
    const root = document.documentElement;
    
    // Performance settings
    root.style.setProperty('--mobile-particle-count', performanceSettings.particleCount.toString());
    root.style.setProperty('--mobile-animation-fps', performanceSettings.animationFrameRate.toString());
    root.style.setProperty('--mobile-effect-intensity', performanceSettings.effectIntensity.toString());
    
    // Mobile-specific settings
    root.style.setProperty('--mobile-touch-target-size', isMobile ? '44px' : '32px');
    root.style.setProperty('--mobile-gesture-area-size', isMobile ? '60px' : '40px');
    root.style.setProperty('--mobile-text-scale', isMobile ? '1.1' : '1.0');
    root.style.setProperty('--mobile-icon-scale', isMobile ? '1.2' : '1.0');
    
    // Reduced motion support
    if (isReducedMotion) {
      root.style.setProperty('--mobile-animation-duration', '0s');
      root.style.setProperty('--mobile-transition-duration', '0s');
    } else {
      root.style.setProperty('--mobile-animation-duration', '0.3s');
      root.style.setProperty('--mobile-transition-duration', '0.2s');
    }
  }, [isMobile, performanceSettings, isReducedMotion]);

  // Touch optimization handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableTouchOptimizations) return;
    
    // Prevent zoom on double tap
    e.preventDefault();
    
    // Haptic feedback
    if (enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [enableTouchOptimizations, enableHapticFeedback]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!enableTouchOptimizations) return;
    
    // Optimize touch scrolling
    e.stopPropagation();
  }, [enableTouchOptimizations]);

  // Gesture support
  useEffect(() => {
    if (!enableGestureSupport || !isMobile) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleGestureStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleGestureEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      
      // Detect swipe gestures
      if (deltaTime < 300 && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          console.log('🔄 Swipe right detected');
          // Handle swipe right
        } else {
          console.log('🔄 Swipe left detected');
          // Handle swipe left
        }
      }
      
      if (deltaTime < 300 && Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          console.log('🔄 Swipe down detected');
          // Handle swipe down
        } else {
          console.log('🔄 Swipe up detected');
          // Handle swipe up
        }
      }
    };

    document.addEventListener('touchstart', handleGestureStart);
    document.addEventListener('touchend', handleGestureEnd);

    return () => {
      document.removeEventListener('touchstart', handleGestureStart);
      document.removeEventListener('touchend', handleGestureEnd);
    };
  }, [enableGestureSupport, isMobile]);

  // Performance monitoring
  useEffect(() => {
    if (!isMobile) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;

    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // Auto-adjust performance if FPS is too low
        if (fps < 30 && performanceMode !== 'low') {
          console.log(`📱 Mobile: Low FPS detected (${fps}), adjusting performance settings`);
          setPerformanceSettings(prev => ({
            ...prev,
            particleCount: Math.max(20, prev.particleCount - 10),
            effectIntensity: Math.max(0.3, prev.effectIntensity - 0.1),
          }));
        }
      }
      
      requestAnimationFrame(measurePerformance);
    };

    requestAnimationFrame(measurePerformance);
  }, [isMobile, performanceMode]);

  return (
    <div
      className="mobile-optimizations"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{
        // Mobile-specific styles
        touchAction: isMobile ? 'manipulation' : 'auto',
        userSelect: isMobile ? 'none' : 'auto',
        WebkitUserSelect: isMobile ? 'none' : 'auto',
        WebkitTouchCallout: isMobile ? 'none' : undefined,
        WebkitTapHighlightColor: isMobile ? 'transparent' : 'auto',
      }}
    >
      {children}
    </div>
  );
};

// Mobile-specific CSS
const mobileOptimizationStyles = `
.mobile-optimizations {
  /* Touch optimizations */
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  
  /* Performance optimizations */
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Mobile touch targets */
@media (max-width: 768px) {
  .mobile-optimizations button,
  .mobile-optimizations [role="button"] {
    min-height: var(--mobile-touch-target-size);
    min-width: var(--mobile-touch-target-size);
    padding: 12px;
    font-size: calc(16px * var(--mobile-text-scale));
  }
  
  .mobile-optimizations input,
  .mobile-optimizations select {
    font-size: calc(16px * var(--mobile-text-scale));
    padding: 12px;
  }
  
  .mobile-optimizations img,
  .mobile-optimizations svg {
    transform: scale(var(--mobile-icon-scale));
  }
}

/* Performance-based particle reduction */
@media (max-width: 768px) {
  .particle-effect {
    --particle-count: var(--mobile-particle-count);
  }
  
  .animation-element {
    animation-duration: calc(var(--mobile-animation-duration) * var(--mobile-effect-intensity));
  }
  
  .transition-element {
    transition-duration: calc(var(--mobile-transition-duration) * var(--mobile-effect-intensity));
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .mobile-optimizations * {
    animation-duration: 0s !important;
    transition-duration: 0s !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .mobile-optimizations button {
    border-width: 3px;
    font-weight: bold;
  }
}

/* Landscape orientation adjustments */
@media (max-width: 768px) and (orientation: landscape) {
  .mobile-optimizations {
    --mobile-touch-target-size: 36px;
    --mobile-text-scale: 0.9;
    --mobile-icon-scale: 1.0;
  }
}

/* Very small screens */
@media (max-width: 320px) {
  .mobile-optimizations {
    --mobile-touch-target-size: 48px;
    --mobile-text-scale: 1.2;
    --mobile-icon-scale: 1.3;
  }
}
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = mobileOptimizationStyles;
  document.head.appendChild(styleSheet);
} 