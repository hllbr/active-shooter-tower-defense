import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import type { ThemeType, AccessibilityMode } from './themeConstants';
import { THEME_COLORS, ACCESSIBILITY_MODES } from './themeConstants';

interface ThemeContextType {
  theme: ThemeType;
  accessibilityMode: AccessibilityMode;
  setTheme: (theme: ThemeType) => void;
  setAccessibilityMode: (mode: AccessibilityMode) => void;
  colors: typeof THEME_COLORS;
  accessibility: typeof ACCESSIBILITY_MODES[AccessibilityMode];
  isReducedMotion: boolean;
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 