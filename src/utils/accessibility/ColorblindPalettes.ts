/**
 * Colorblind-Friendly Color Palettes
 * Provides alternative color schemes for different types of colorblindness
 */

export interface ColorblindPalette {
  healthGood: string;      // Good health (100%–50% HP)
  healthWarning: string;   // Warning health (49%–20% HP)
  healthBad: string;       // Bad health (19% and below)
  healthBackground: string; // Health bar background
  primary: string;         // Primary UI color
  secondary: string;       // Secondary UI color
  accent: string;          // Accent color
  danger: string;          // Danger color
  success: string;         // Success color
  warning: string;         // Warning color
  info: string;           // Info color
}

// Normal color palette (baseline)
export const NORMAL_PALETTE: ColorblindPalette = {
  healthGood: '#00ff00',      // Green
  healthWarning: '#ffff00',   // Yellow
  healthBad: '#ff0000',       // Red
  healthBackground: '#333333', // Dark gray
  primary: '#1E3A8A',         // Deep blue
  secondary: '#F59E0B',       // Amber
  accent: '#10B981',          // Emerald
  danger: '#EF4444',          // Red
  success: '#22C55E',         // Green
  warning: '#F59E0B',         // Amber
  info: '#3B82F6',           // Blue
};

// Deuteranopia (red-green colorblindness) - most common
export const DEUTERANOPIA_PALETTE: ColorblindPalette = {
  healthGood: '#00BFFF',      // Sky blue
  healthWarning: '#FF8C00',   // Dark orange
  healthBad: '#FF1493',       // Deep pink
  healthBackground: '#333333', // Dark gray
  primary: '#1E3A8A',         // Deep blue
  secondary: '#FF8C00',       // Dark orange
  accent: '#00BFFF',          // Sky blue
  danger: '#FF1493',          // Deep pink
  success: '#00BFFF',         // Sky blue
  warning: '#FF8C00',         // Dark orange
  info: '#1E3A8A',           // Deep blue
};

// Protanopia (red colorblindness)
export const PROTANOPIA_PALETTE: ColorblindPalette = {
  healthGood: '#00CED1',      // Dark turquoise
  healthWarning: '#FFA500',   // Orange
  healthBad: '#FF69B4',       // Hot pink
  healthBackground: '#333333', // Dark gray
  primary: '#1E3A8A',         // Deep blue
  secondary: '#FFA500',       // Orange
  accent: '#00CED1',          // Dark turquoise
  danger: '#FF69B4',          // Hot pink
  success: '#00CED1',         // Dark turquoise
  warning: '#FFA500',         // Orange
  info: '#1E3A8A',           // Deep blue
};

// Tritanopia (blue-yellow colorblindness)
export const TRITANOPIA_PALETTE: ColorblindPalette = {
  healthGood: '#32CD32',      // Lime green
  healthWarning: '#FF6347',   // Tomato red
  healthBad: '#8A2BE2',       // Blue violet
  healthBackground: '#333333', // Dark gray
  primary: '#1E3A8A',         // Deep blue
  secondary: '#FF6347',       // Tomato red
  accent: '#32CD32',          // Lime green
  danger: '#8A2BE2',          // Blue violet
  success: '#32CD32',         // Lime green
  warning: '#FF6347',         // Tomato red
  info: '#1E3A8A',           // Deep blue
};

// Achromatopsia (complete colorblindness) - high contrast
export const ACHROMATOPSIA_PALETTE: ColorblindPalette = {
  healthGood: '#FFFFFF',      // White
  healthWarning: '#CCCCCC',   // Light gray
  healthBad: '#666666',       // Dark gray
  healthBackground: '#000000', // Black
  primary: '#FFFFFF',         // White
  secondary: '#CCCCCC',       // Light gray
  accent: '#FFFFFF',          // White
  danger: '#666666',          // Dark gray
  success: '#FFFFFF',         // White
  warning: '#CCCCCC',         // Light gray
  info: '#FFFFFF',           // White
};

// High contrast palette for general accessibility
export const HIGH_CONTRAST_PALETTE: ColorblindPalette = {
  healthGood: '#00FF00',      // Bright green
  healthWarning: '#FFFF00',   // Bright yellow
  healthBad: '#FF0000',       // Bright red
  healthBackground: '#000000', // Black
  primary: '#FFFFFF',         // White
  secondary: '#FFFF00',       // Bright yellow
  accent: '#00FF00',          // Bright green
  danger: '#FF0000',          // Bright red
  success: '#00FF00',         // Bright green
  warning: '#FFFF00',         // Bright yellow
  info: '#00FFFF',           // Bright cyan
};

export type ColorblindType = 'normal' | 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia' | 'highContrast';

export const COLORBLIND_PALETTES: Record<ColorblindType, ColorblindPalette> = {
  normal: NORMAL_PALETTE,
  deuteranopia: DEUTERANOPIA_PALETTE,
  protanopia: PROTANOPIA_PALETTE,
  tritanopia: TRITANOPIA_PALETTE,
  achromatopsia: ACHROMATOPSIA_PALETTE,
  highContrast: HIGH_CONTRAST_PALETTE,
};

/**
 * Get the appropriate color palette based on accessibility mode and colorblind type
 */
export function getAccessibilityPalette(
  accessibilityMode: string,
  colorblindType: string
): ColorblindPalette {
  if (accessibilityMode === 'highContrast') {
    return HIGH_CONTRAST_PALETTE;
  }
  
  if (accessibilityMode === 'colorblind') {
    return COLORBLIND_PALETTES[colorblindType as ColorblindType] || NORMAL_PALETTE;
  }
  
  return NORMAL_PALETTE;
}

/**
 * Apply accessibility colors to CSS custom properties
 */
export function applyAccessibilityColors(palette: ColorblindPalette): void {
  const root = document.documentElement;
  
  // Health bar colors
  root.style.setProperty('--health-good', palette.healthGood);
  root.style.setProperty('--health-warning', palette.healthWarning);
  root.style.setProperty('--health-bad', palette.healthBad);
  root.style.setProperty('--health-background', palette.healthBackground);
  
  // UI colors
  root.style.setProperty('--primary-color', palette.primary);
  root.style.setProperty('--secondary-color', palette.secondary);
  root.style.setProperty('--accent-color', palette.accent);
  root.style.setProperty('--danger-color', palette.danger);
  root.style.setProperty('--success-color', palette.success);
  root.style.setProperty('--warning-color', palette.warning);
  root.style.setProperty('--info-color', palette.info);
} 