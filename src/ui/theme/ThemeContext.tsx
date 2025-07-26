import { createContext } from 'react';
import { THEME_COLORS, ACCESSIBILITY_MODES } from './themeConstants';
import type { ThemeType, AccessibilityMode } from './themeConstants';

interface ThemeContextType {
  theme: ThemeType;
  accessibilityMode: AccessibilityMode;
  setTheme: (theme: ThemeType) => void;
  setAccessibilityMode: (mode: AccessibilityMode) => void;
  colors: typeof THEME_COLORS;
  accessibility: typeof ACCESSIBILITY_MODES[AccessibilityMode];
  isReducedMotion: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined); 