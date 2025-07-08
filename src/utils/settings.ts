export interface Settings {
  musicVolume: number;
  sfxVolume: number;
  mute: boolean;
}

const SETTINGS_KEY = 'game_settings';

import { secureLocalStorage } from '../security/SecurityEnhancements';
import { Logger } from './Logger';

export function getSettings(): Settings {
  try {
    const raw = secureLocalStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // localStorage erişim hatası
  }
  return { musicVolume: 0.7, sfxVolume: 0.7, mute: false };
}

export function saveSettings(settings: Settings) {
  try {
    const success = secureLocalStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (!success) {
      Logger.warn('🔒 Security: Settings save blocked due to security validation');
    }
  } catch {
    // localStorage erişim hatası
  }
} 