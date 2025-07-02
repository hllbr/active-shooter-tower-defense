export interface Settings {
  musicVolume: number;
  sfxVolume: number;
  mute: boolean;
}

const SETTINGS_KEY = 'game_settings';

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // localStorage erişim hatası
  }
  return { musicVolume: 0.7, sfxVolume: 0.7, mute: false };
}

export function saveSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // localStorage erişim hatası
  }
} 