import { useState, useEffect, useCallback } from 'react';
import { responsiveUIManager, type ResponsiveConfig, type ResponsiveStyles } from './ResponsiveUIManager';

/**
 * React hook for responsive UI management
 * Provides easy access to responsive configuration and styles
 */
export const useResponsiveUI = () => {
  const [config, setConfig] = useState<ResponsiveConfig>(responsiveUIManager.getConfig());
  const [styles, setStyles] = useState<ResponsiveStyles>(responsiveUIManager.getResponsiveStyles());

  useEffect(() => {
    // Subscribe to configuration changes
    const unsubscribe = responsiveUIManager.addListener((newConfig) => {
      setConfig(newConfig);
      setStyles(responsiveUIManager.getResponsiveStyles());
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Convenience methods
  const isMobile = useCallback(() => responsiveUIManager.isMobile(), []);
  const isTablet = useCallback(() => responsiveUIManager.isTablet(), []);
  const isDesktop = useCallback(() => responsiveUIManager.isDesktop(), []);
  const isTouchDevice = useCallback(() => responsiveUIManager.isTouchDevice(), []);
  const isLandscape = useCallback(() => responsiveUIManager.isLandscape(), []);
  const isPortrait = useCallback(() => responsiveUIManager.isPortrait(), []);
  const shouldDisableHover = useCallback(() => responsiveUIManager.shouldDisableHover(), []);
  const getOptimalTapTargetSize = useCallback(() => responsiveUIManager.getOptimalTapTargetSize(), []);
  const getOptimalFontSize = useCallback((baseSize: number) => responsiveUIManager.getOptimalFontSize(baseSize), []);
  const getOptimalSpacing = useCallback((baseSpacing: number) => responsiveUIManager.getOptimalSpacing(baseSpacing), []);

  return {
    // Configuration
    config,
    screenSize: config.screenSize,
    isTouchDevice: config.isTouchDevice,
    isLandscape: config.isLandscape,
    isPortrait: config.isPortrait,
    
    // Convenience methods
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    isLandscape,
    isPortrait,
    shouldDisableHover,
    
    // Utility methods
    getOptimalTapTargetSize,
    getOptimalFontSize,
    getOptimalSpacing,
    
    // Styles
    styles,
    
    // Direct manager access for advanced usage
    manager: responsiveUIManager
  };
}; 