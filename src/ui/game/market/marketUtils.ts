import { useState, useEffect } from 'react';

// Responsive hook for market components
export const useResponsiveMarket = () => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsLandscape(width > height);
      
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  return {
    screenSize,
    isLandscape,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop'
  };
};

// Responsive grid configuration
export const getResponsiveGridConfig = (screenSize: 'mobile' | 'tablet' | 'desktop') => {
  switch (screenSize) {
    case 'mobile':
      return {
        gridTemplateColumns: '1fr',
        gap: '12px',
        itemMinWidth: '280px',
        maxHeight: '60vh'
      };
    case 'tablet':
      return {
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        itemMinWidth: '300px',
        maxHeight: '70vh'
      };
    case 'desktop':
    default:
      return {
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
        itemMinWidth: '320px',
        maxHeight: '300px'
      };
  }
};

// Responsive category tab configuration
export const getResponsiveCategoryConfig = (screenSize: 'mobile' | 'tablet' | 'desktop') => {
  switch (screenSize) {
    case 'mobile':
      return {
        flexDirection: 'column' as const,
        gap: '8px',
        fontSize: '14px',
        padding: '10px 12px'
      };
    case 'tablet':
      return {
        flexDirection: 'row' as const,
        gap: '8px',
        fontSize: '14px',
        padding: '12px 16px'
      };
    case 'desktop':
    default:
      return {
        flexDirection: 'row' as const,
        gap: '8px',
        fontSize: '14px',
        padding: '12px 16px'
      };
  }
}; 