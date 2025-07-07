import React, { createContext, useContext, useState, useEffect } from 'react';

// Tema Renk Paleti
export const THEME_COLORS = {
  primary: '#1E3A8A', // Deep blue
  secondary: '#F59E0B', // Amber
  accent: '#10B981', // Emerald
  danger: '#EF4444', // Red
  success: '#22C55E', // Green
  warning: '#F59E0B', // Amber
  info: '#3B82F6', // Blue
  dark: {
    background: '#0F0F23',
    surface: '#1A1A2E',
    border: '#2D3748',
    text: '#FFFFFF',
    textSecondary: '#A0AEC0'
  },
  light: {
    background: '#FFFFFF',
    surface: '#F7FAFC',
    border: '#E2E8F0',
    text: '#1A202C',
    textSecondary: '#4A5568'
  }
} as const;

// Erişilebilirlik Modları
export const ACCESSIBILITY_MODES = {
  normal: {
    contrast: 1.0,
    saturation: 1.0,
    motion: 'normal'
  },
  highContrast: {
    contrast: 1.5,
    saturation: 1.3,
    motion: 'normal'
  },
  colorblind: {
    contrast: 1.2,
    saturation: 0.8,
    motion: 'normal'
  },
  reducedMotion: {
    contrast: 1.0,
    saturation: 1.0,
    motion: 'reduced'
  }
} as const;

// Tema Tipleri
export type ThemeType = 'dark' | 'light';
export type AccessibilityMode = keyof typeof ACCESSIBILITY_MODES;

interface ThemeContextType {
  theme: ThemeType;
  accessibilityMode: AccessibilityMode;
  setTheme: (theme: ThemeType) => void;
  setAccessibilityMode: (mode: AccessibilityMode) => void;
  colors: typeof THEME_COLORS;
  accessibility: typeof ACCESSIBILITY_MODES[AccessibilityMode];
  isReducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

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