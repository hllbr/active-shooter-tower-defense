import { getAccessibilityPalette, applyAccessibilityColors, type ColorblindPalette } from './ColorblindPalettes';
import type { Settings } from '../settings';

/**
 * Accessibility Manager
 * Handles colorblind mode, UI scaling, and other accessibility features
 */
export class AccessibilityManager {
  private static instance: AccessibilityManager;
  private currentSettings: Settings;
  private listeners: Array<(settings: Settings) => void> = [];

  private constructor() {
    this.currentSettings = {
      musicVolume: 0.7,
      sfxVolume: 0.7,
      mute: false,
      healthBarAlwaysVisible: false,
      accessibilityMode: 'normal',
      uiScale: 1.0,
      colorblindType: 'deuteranopia'
    };
  }

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  /**
   * Initialize accessibility manager with current settings
   */
  initialize(settings: Settings): void {
    this.currentSettings = { ...settings };
    this.applyAccessibilitySettings();
  }

  /**
   * Update accessibility settings
   */
  updateSettings(newSettings: Partial<Settings>): void {
    this.currentSettings = { ...this.currentSettings, ...newSettings };
    this.applyAccessibilitySettings();
    this.notifyListeners();
  }

  /**
   * Get current accessibility settings
   */
  getSettings(): Settings {
    return { ...this.currentSettings };
  }

  /**
   * Apply all accessibility settings to the DOM
   */
  private applyAccessibilitySettings(): void {
    this.applyColorblindMode();
    this.applyUIScaling();
    this.applyReducedMotion();
  }

  /**
   * Apply colorblind mode and color adjustments
   */
  private applyColorblindMode(): void {
    const { accessibilityMode, colorblindType } = this.currentSettings;
    
    if (accessibilityMode === 'normal') {
      this.resetColors();
      return;
    }

    const palette = getAccessibilityPalette(accessibilityMode, colorblindType);
    applyAccessibilityColors(palette);
  }

  /**
   * Apply UI scaling
   */
  private applyUIScaling(): void {
    const { uiScale } = this.currentSettings;
    const root = document.documentElement;
    
    // Apply UI scaling as CSS custom property
    root.style.setProperty('--ui-scale', uiScale.toString());
    
    // Apply scaling to body for global scaling
    document.body.style.transform = `scale(${uiScale})`;
    document.body.style.transformOrigin = 'top left';
    
    // Adjust viewport height to account for scaling
    const adjustedHeight = 100 / uiScale;
    root.style.setProperty('--vh', `${adjustedHeight}vh`);
  }

  /**
   * Apply reduced motion settings
   */
  private applyReducedMotion(): void {
    const { accessibilityMode } = this.currentSettings;
    const root = document.documentElement;
    
    if (accessibilityMode === 'reducedMotion') {
      root.style.setProperty('--motion-preference', 'reduce');
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.setProperty('--motion-preference', 'auto');
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--transition-duration', '0.2s');
    }
  }

  /**
   * Reset colors to normal mode
   */
  private resetColors(): void {
    const root = document.documentElement;
    
    // Reset health bar colors
    root.style.removeProperty('--health-good');
    root.style.removeProperty('--health-warning');
    root.style.removeProperty('--health-bad');
    root.style.removeProperty('--health-background');
    
    // Reset UI colors
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--secondary-color');
    root.style.removeProperty('--accent-color');
    root.style.removeProperty('--danger-color');
    root.style.removeProperty('--success-color');
    root.style.removeProperty('--warning-color');
    root.style.removeProperty('--info-color');
  }

  /**
   * Get current color palette
   */
  getCurrentPalette(): ColorblindPalette {
    const { accessibilityMode, colorblindType } = this.currentSettings;
    return getAccessibilityPalette(accessibilityMode, colorblindType);
  }

  /**
   * Check if colorblind mode is active
   */
  isColorblindMode(): boolean {
    return this.currentSettings.accessibilityMode === 'colorblind';
  }

  /**
   * Check if high contrast mode is active
   */
  isHighContrastMode(): boolean {
    return this.currentSettings.accessibilityMode === 'highContrast';
  }

  /**
   * Check if reduced motion is active
   */
  isReducedMotion(): boolean {
    return this.currentSettings.accessibilityMode === 'reducedMotion';
  }

  /**
   * Get current UI scale
   */
  getUIScale(): number {
    return this.currentSettings.uiScale;
  }

  /**
   * Add listener for settings changes
   */
  addListener(listener: (settings: Settings) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of settings changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.currentSettings);
          } catch {
      // Error in accessibility listener silently handled
    }
    });
  }

  /**
   * Get accessibility mode description
   */
  getAccessibilityModeDescription(mode: string): string {
    switch (mode) {
      case 'normal':
        return 'Normal mode - Standard colors and animations';
      case 'colorblind':
        return 'Colorblind mode - Alternative color palettes for color vision deficiency';
      case 'highContrast':
        return 'High contrast mode - Maximum contrast for better visibility';
      case 'reducedMotion':
        return 'Reduced motion mode - Minimized animations for motion sensitivity';
      default:
        return 'Unknown mode';
    }
  }

  /**
   * Get colorblind type description
   */
  getColorblindTypeDescription(type: string): string {
    switch (type) {
      case 'deuteranopia':
        return 'Deuteranopia - Red-green colorblindness (most common)';
      case 'protanopia':
        return 'Protanopia - Red colorblindness';
      case 'tritanopia':
        return 'Tritanopia - Blue-yellow colorblindness';
      case 'achromatopsia':
        return 'Achromatopsia - Complete colorblindness (high contrast)';
      default:
        return 'Unknown type';
    }
  }

  /**
   * Validate UI scale value
   */
  validateUIScale(scale: number): number {
    return Math.max(0.8, Math.min(1.5, scale));
  }

  /**
   * Get recommended UI scale based on screen size
   */
  getRecommendedUIScale(): number {
    const screenWidth = window.innerWidth;
    const _screenHeight = window.innerHeight;
    
    // Small screens (mobile)
    if (screenWidth < 768) {
      return 0.9;
    }
    
    // Medium screens (tablet)
    if (screenWidth < 1024) {
      return 1.0;
    }
    
    // Large screens (desktop)
    if (screenWidth < 1920) {
      return 1.1;
    }
    
    // Extra large screens
    return 1.2;
  }
}

// Export singleton instance
export const accessibilityManager = AccessibilityManager.getInstance(); 