import React, { useState, useEffect } from 'react';
import { THEME_COLORS, ACCESSIBILITY_MODES } from './themeConstants';
import type { ThemeType, AccessibilityMode } from './themeConstants';
import { ThemeContext } from './ThemeContext';
import type { ThemeContextType } from './ThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>('normal');

  // Sistem tercihlerini algıla
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setAccessibilityMode('reducedMotion');
      }
    };

    // İlk yükleme
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    if (prefersReducedMotion.matches) {
      setAccessibilityMode('reducedMotion');
    }

    // Dinleyicileri ekle
    mediaQuery.addEventListener('change', handleThemeChange);
    prefersReducedMotion.addEventListener('change', handleMotionChange);

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
      prefersReducedMotion.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // CSS değişkenlerini güncelle
  useEffect(() => {
    const root = document.documentElement;
    const colors = THEME_COLORS;
    const accessibility = ACCESSIBILITY_MODES[accessibilityMode];

    // Tema renkleri
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--danger-color', colors.danger);
    root.style.setProperty('--success-color', colors.success);
    root.style.setProperty('--warning-color', colors.warning);
    root.style.setProperty('--info-color', colors.info);

    // Tema modu renkleri
    const themeColors = colors[theme];
    root.style.setProperty('--background-color', themeColors.background);
    root.style.setProperty('--surface-color', themeColors.surface);
    root.style.setProperty('--border-color', themeColors.border);
    root.style.setProperty('--text-color', themeColors.text);
    root.style.setProperty('--text-secondary-color', themeColors.textSecondary);

    // Erişilebilirlik ayarları
    root.style.setProperty('--contrast-multiplier', accessibility.contrast.toString());
    root.style.setProperty('--saturation-multiplier', accessibility.saturation.toString());
    root.style.setProperty('--motion-preference', accessibility.motion);

    // Glass morphism efektleri
    root.style.setProperty('--glass-background', theme === 'dark' 
      ? 'rgba(26, 26, 46, 0.8)' 
      : 'rgba(255, 255, 255, 0.8)');
    root.style.setProperty('--glass-border', theme === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)');
    root.style.setProperty('--glass-shadow', theme === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
      : '0 8px 32px rgba(0, 0, 0, 0.1)');

    // Holographic efektler
    root.style.setProperty('--holographic-gradient', 
      'linear-gradient(45deg, #00ffff, #ff00ff, #ffff00, #00ffff)');
    root.style.setProperty('--neon-glow', 
      '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(0, 255, 255, 0.3)');

  }, [theme, accessibilityMode]);

  const value: ThemeContextType = {
    theme,
    accessibilityMode,
    setTheme,
    setAccessibilityMode,
    colors: THEME_COLORS,
    accessibility: ACCESSIBILITY_MODES[accessibilityMode],
    isReducedMotion: accessibilityMode === 'reducedMotion'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 