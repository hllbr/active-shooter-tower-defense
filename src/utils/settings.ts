export interface Settings {
  musicVolume: number;
  sfxVolume: number;
  mute: boolean;
  healthBarAlwaysVisible: boolean;
  // Accessibility settings
  accessibilityMode: 'normal' | 'colorblind' | 'highContrast' | 'reducedMotion';
  uiScale: number; // 0.8 to 1.5 (80% to 150%)
  colorblindType: 'deuteranopia' | 'protanopia' | 'tritanopia' | 'achromatopsia';
  // Gameplay settings
  defaultTargetingMode: 'nearest' | 'lowest_hp' | 'highest_hp' | 'fastest' | 'highest_value' | 'threat_assessment';
}

const SETTINGS_KEY = 'game_settings';

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // localStorage erişim hatası
  }
  return { 
    musicVolume: 0.7, 
    sfxVolume: 0.7, 
    mute: false, 
    healthBarAlwaysVisible: false,
    accessibilityMode: 'normal',
    uiScale: 1.0,
    colorblindType: 'deuteranopia',
    defaultTargetingMode: 'nearest'
  };
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // localStorage erişim hatası
  }
} 