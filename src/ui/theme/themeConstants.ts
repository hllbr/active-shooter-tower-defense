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