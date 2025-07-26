import { throttle } from '../../utils/performance';

export interface ScreenSize {
  width: number;
  height: number;
  isLandscape: boolean;
  isPortrait: boolean;
}

export interface ResponsiveConfig {
  screenSize: 'mobile' | 'tablet' | 'desktop';
  isTouchDevice: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface TouchConfig {
  tapTargetSize: number;
  doubleTapDelay: number;
  longPressDelay: number;
  scrollThreshold: number;
  preventZoom: boolean;
}

export interface ResponsiveStyles {
  container: React.CSSProperties;
  content: React.CSSProperties;
  grid: React.CSSProperties;
  button: React.CSSProperties;
  text: React.CSSProperties;
}

/**
 * ResponsiveUIManager - SOLID Principles Implementation
 * 
 * Single Responsibility: Manages responsive UI logic and touch controls
 * Open/Closed: Extensible for new screen sizes and interaction types
 * Liskov Substitution: Consistent interface for different device types
 * Interface Segregation: Separate concerns for different UI aspects
 * Dependency Inversion: Depends on abstractions, not concrete implementations
 */
export class ResponsiveUIManager {
  private currentConfig: ResponsiveConfig;
  private touchConfig: TouchConfig;
  private resizeHandler: (() => void) | null = null;
  private orientationHandler: (() => void) | null = null;
  private listeners: Set<(config: ResponsiveConfig) => void> = new Set();

  constructor() {
    // Initialize with default values first
    this.touchConfig = this.getDefaultTouchConfig();
    
    // Then detect initial config
    this.currentConfig = this.detectInitialConfig();
    
    // Finally initialize event listeners
    this.initializeEventListeners();
  }

  /**
   * Detect initial responsive configuration
   */
  private detectInitialConfig(): ResponsiveConfig {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const height = typeof window !== 'undefined' ? window.innerHeight : 1080;
    const isLandscape = width > height;
    const isPortrait = !isLandscape;
    const isTouchDevice = this.detectTouchDevice();

    return {
      screenSize: this.getScreenSizeCategory(width),
      isTouchDevice,
      isLandscape,
      isPortrait,
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1025
      }
    };
  }

  /**
   * Detect if device supports touch
   */
  private detectTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia?.('(pointer: coarse)').matches ||
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
  }

  /**
   * Get screen size category based on width
   */
  private getScreenSizeCategory(width: number): 'mobile' | 'tablet' | 'desktop' {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Get default touch configuration
   */
  private getDefaultTouchConfig(): TouchConfig {
    return {
      tapTargetSize: 44, // iOS/Android accessibility standard
      doubleTapDelay: 300,
      longPressDelay: 500,
      scrollThreshold: 10,
      preventZoom: true
    };
  }

  /**
   * Initialize event listeners with throttling
   */
  private initializeEventListeners(): void {
    if (typeof window === 'undefined') return;

    this.resizeHandler = throttle(() => {
      this.updateConfig();
    }, 100);

    this.orientationHandler = throttle(() => {
      this.updateConfig();
    }, 100);

    window.addEventListener('resize', this.resizeHandler, { passive: true });
    window.addEventListener('orientationchange', this.orientationHandler, { passive: true });
  }

  /**
   * Update configuration and notify listeners
   */
  private updateConfig(): void {
    const newConfig = this.detectInitialConfig();
    
    if (this.hasConfigChanged(newConfig)) {
      this.currentConfig = newConfig;
      this.notifyListeners();
    }
  }

  /**
   * Check if configuration has changed
   */
  private hasConfigChanged(newConfig: ResponsiveConfig): boolean {
    return (
      this.currentConfig.screenSize !== newConfig.screenSize ||
      this.currentConfig.isLandscape !== newConfig.isLandscape ||
      this.currentConfig.isPortrait !== newConfig.isPortrait
    );
  }

  /**
   * Notify all listeners of configuration changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentConfig);
              } catch (_error) {
          // Error in responsive UI listener handled silently
        }
    });
  }

  /**
   * Get current responsive configuration
   */
  public getConfig(): ResponsiveConfig {
    return { ...this.currentConfig };
  }

  /**
   * Get current screen size
   */
  public getScreenSize(): 'mobile' | 'tablet' | 'desktop' {
    return this.currentConfig.screenSize;
  }

  /**
   * Check if current device is mobile
   */
  public isMobile(): boolean {
    return this.currentConfig.screenSize === 'mobile';
  }

  /**
   * Check if current device is tablet
   */
  public isTablet(): boolean {
    return this.currentConfig.screenSize === 'tablet';
  }

  /**
   * Check if current device is desktop
   */
  public isDesktop(): boolean {
    return this.currentConfig.screenSize === 'desktop';
  }

  /**
   * Check if device supports touch
   */
  public isTouchDevice(): boolean {
    return this.currentConfig.isTouchDevice;
  }

  /**
   * Check if device is in landscape mode
   */
  public isLandscape(): boolean {
    return this.currentConfig.isLandscape;
  }

  /**
   * Check if device is in portrait mode
   */
  public isPortrait(): boolean {
    return this.currentConfig.isPortrait;
  }

  /**
   * Get touch configuration
   */
  public getTouchConfig(): TouchConfig {
    return { ...this.touchConfig };
  }

  /**
   * Update touch configuration
   */
  public updateTouchConfig(config: Partial<TouchConfig>): void {
    this.touchConfig = { ...this.touchConfig, ...config };
  }

  /**
   * Get responsive styles for different components
   */
  public getResponsiveStyles(): ResponsiveStyles {
    const { screenSize, isLandscape } = this.currentConfig;

    return {
      container: this.getContainerStyles(screenSize, isLandscape),
      content: this.getContentStyles(screenSize, isLandscape),
      grid: this.getGridStyles(screenSize),
      button: this.getButtonStyles(screenSize),
      text: this.getTextStyles(screenSize)
    };
  }

  /**
   * Get container styles based on screen size
   */
  private getContainerStyles(screenSize: string, isLandscape: boolean): React.CSSProperties {
    const baseStyles: React.CSSProperties = {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    };

    switch (screenSize) {
      case 'mobile':
        return {
          ...baseStyles,
          padding: isLandscape ? '8px' : '0px',
        };
      case 'tablet':
        return {
          ...baseStyles,
          padding: '16px',
        };
      default:
        return {
          ...baseStyles,
          padding: '24px',
        };
    }
  }

  /**
   * Get content styles based on screen size
   */
  private getContentStyles(screenSize: string, isLandscape: boolean): React.CSSProperties {
    const baseStyles: React.CSSProperties = {
      backgroundColor: '#1A202C',
      border: '2px solid #4A5568',
      overflow: 'hidden',
      position: 'relative' as const,
      width: '100%',
      height: '100%',
    };

    switch (screenSize) {
      case 'mobile':
        return {
          ...baseStyles,
          borderRadius: isLandscape ? '8px' : '0px',
          padding: isLandscape ? '12px' : '16px',
          maxWidth: '100%',
          maxHeight: isLandscape ? '95vh' : '100%',
        };
      case 'tablet':
        return {
          ...baseStyles,
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '95%',
          maxHeight: '90vh',
        };
      default:
        return {
          ...baseStyles,
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '900px',
          maxHeight: '85vh',
        };
    }
  }

  /**
   * Get grid styles based on screen size
   */
  private getGridStyles(screenSize: string): React.CSSProperties {
    switch (screenSize) {
      case 'mobile':
        return {
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '12px',
          padding: '8px',
        };
      case 'tablet':
        return {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          padding: '12px',
        };
      default:
        return {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          padding: '16px',
        };
    }
  }

  /**
   * Get button styles based on screen size
   */
  private getButtonStyles(screenSize: string): React.CSSProperties {
    const baseStyles: React.CSSProperties = {
      cursor: 'pointer',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    };

    switch (screenSize) {
      case 'mobile':
        return {
          ...baseStyles,
          minHeight: '44px',
          minWidth: '44px',
          fontSize: '14px',
          padding: '12px 16px',
        };
      case 'tablet':
        return {
          ...baseStyles,
          minHeight: '40px',
          minWidth: '40px',
          fontSize: '14px',
          padding: '10px 14px',
        };
      default:
        return {
          ...baseStyles,
          minHeight: '36px',
          minWidth: '36px',
          fontSize: '13px',
          padding: '8px 12px',
        };
    }
  }

  /**
   * Get text styles based on screen size
   */
  private getTextStyles(screenSize: string): React.CSSProperties {
    switch (screenSize) {
      case 'mobile':
        return {
          fontSize: '14px',
          lineHeight: '1.4',
        };
      case 'tablet':
        return {
          fontSize: '15px',
          lineHeight: '1.5',
        };
      default:
        return {
          fontSize: '16px',
          lineHeight: '1.6',
        };
    }
  }

  /**
   * Add configuration change listener
   */
  public addListener(listener: (config: ResponsiveConfig) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Remove configuration change listener
   */
  public removeListener(listener: (config: ResponsiveConfig) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Cleanup event listeners
   */
  public destroy(): void {
    if (this.resizeHandler && typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.orientationHandler && typeof window !== 'undefined') {
      window.removeEventListener('orientationchange', this.orientationHandler);
    }
    this.listeners.clear();
  }

  /**
   * Get optimal tap target size for current device
   */
  public getOptimalTapTargetSize(): number {
    if (this.isTouchDevice()) {
      return this.touchConfig.tapTargetSize;
    }
    return 32; // Default for mouse devices
  }

  /**
   * Check if hover effects should be disabled
   */
  public shouldDisableHover(): boolean {
    return this.isTouchDevice();
  }

  /**
   * Get optimal font size for current device
   */
  public getOptimalFontSize(baseSize: number): number {
    switch (this.currentConfig.screenSize) {
      case 'mobile':
        return Math.max(baseSize * 0.9, 12);
      case 'tablet':
        return Math.max(baseSize * 0.95, 14);
      default:
        return baseSize;
    }
  }

  /**
   * Get optimal spacing for current device
   */
  public getOptimalSpacing(baseSpacing: number): number {
    switch (this.currentConfig.screenSize) {
      case 'mobile':
        return Math.max(baseSpacing * 0.8, 8);
      case 'tablet':
        return Math.max(baseSpacing * 0.9, 12);
      default:
        return baseSpacing;
    }
  }
}

// Singleton instance - lazy initialization
let responsiveUIManagerInstance: ResponsiveUIManager | null = null;

export const responsiveUIManager = (() => {
  if (!responsiveUIManagerInstance) {
    responsiveUIManagerInstance = new ResponsiveUIManager();
  }
  return responsiveUIManagerInstance;
})();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (responsiveUIManagerInstance) {
      responsiveUIManagerInstance.destroy();
    }
  });
} 