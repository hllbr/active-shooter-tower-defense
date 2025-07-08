import { musicManager } from './musicManager';
import { getSettings } from '../settings';
import { GAME_CONSTANTS } from '../constants';

export const audioCache: Record<string, HTMLAudioElement> = {};
export const gameAudio: HTMLAudioElement | null = null;

const soundCache = new Map<string, HTMLAudioElement>();
const missingSounds = new Set<string>();

// Volume ayarlarını gerçek zamanlı güncellemek için
export function updateAllSoundVolumes(): void {
  const settings = getSettings();
  const targetVolume = settings.mute ? 0 : settings.sfxVolume;
  
  // Cache'deki tüm ses dosyalarının volume'unu güncelle
  soundCache.forEach(audio => {
    if (audio) {
      audio.volume = targetVolume;
    }
  });
}

// Test fonksiyonu - volume ayarlarının çalışıp çalışmadığını kontrol et
export function testVolumeControls(): void {
  const settings = getSettings();
  
  // Test sesi çal
  playSound('dice-roll');
}

export function playSound(sound: string): void {
  if (missingSounds.has(sound)) return;
  try {
    let audio = soundCache.get(sound);
    if (!audio) {
      audio = new Audio(`/assets/sounds/${sound}.wav`);
      soundCache.set(sound, audio);
    }
    
    // Her ses çalınırken güncel ayarları al
    const settings = getSettings();
    audio.volume = settings.mute ? 0 : settings.sfxVolume;
    audio.currentTime = 0;
    
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => missingSounds.add(sound));
    }
  } catch {
    missingSounds.add(sound);
  }
}

export function playContextualSound(context: 'victory' | 'defeat' | 'warning' | 'purchase' | 'click' | 'unlock' | 'tower-build' | 'tower-upgrade' | 'death' | 'dice-roll'): void {
  const soundMap: Record<string, string> = {
    victory: 'levelupwav',
    defeat: 'gameover',
    death: 'death-soundü',
    warning: 'gameover',
    purchase: 'lock-break',        // 🔊 UI_MARKET category - plays during upgrade
    'tower-build': 'tower-create-sound',  // 🎮 GAME_SCENE category - paused during upgrade
    'tower-upgrade': 'tower-levelup-sound', // 🎮 GAME_SCENE category - paused during upgrade
    'dice-roll': 'dice-roll',      // 🔊 UI_MARKET category - plays during upgrade
    click: '',
    unlock: 'lock-break'           // 🔊 UI_MARKET category - plays during upgrade
  };
  const soundFile = soundMap[context];
  if (soundFile) playSound(soundFile);
}

export const playTowerBuildSound = () => playContextualSound('tower-build');
export const playTowerUpgradeSound = () => playContextualSound('tower-upgrade');
export const playDeathSound = () => playContextualSound('death');
export const playVictorySound = () => playContextualSound('victory');
export const playDefeatSound = () => playContextualSound('defeat');
export const playPurchaseSound = () => playContextualSound('purchase');
export const playUnlockSound = () => playContextualSound('unlock');
export const playDiceRollSound = () => playContextualSound('dice-roll');

export function clearSoundCache(): void {
  soundCache.clear();
  missingSounds.clear();
  musicManager.stop();
}

// 🎮 Sound categories for better management
const SOUND_CATEGORIES = {
  // Game scene sounds - paused during upgrade
  GAME_SCENE: [
    'explosion-large',
    'explosion-small', 
    'tower-attack-explosive',
    'tower-attack-laser',
    'tower-attack-plasma',
    'tower-attack-sniper',
    'tower-create-sound',
    'tower-destroy',
    'tower-levelup-sound',
    'tower-repair',
    'defeat-heavy',
    'boss-bombing',
    'boss-charge',
    'boss-defeat',
    'boss-entrance',
    'boss-ground-slam',
    'boss-missile',
    'boss-phase-transition',
    'boss-reality-tear',
    'boss-spawn-minions',
    'ambient-battle',
    'ambient-wind',
    'energy-recharge',
    'freeze-effect',
    'slow-effect',
    'shield-activate',
    'shield-break',
    'gameover',
    'wave-complete',
    'victory-fanfare'
  ],
  
  // UI/Market sounds - continue during upgrade
  UI_MARKET: [
    'dice-roll',
    'click',
    'hover',
    'lock-break',
    'coin-collect',
    'gold-drop',
    'loot-common',
    'loot-rare',
    'loot-epic',
    'loot-legendary',
    'pickup-common',
    'pickup-rare',
    'notification',
    'error',
    'countdown-beep'
  ]
} as const;

/**
 * 🎮 UPGRADE SCREEN: Stop only game scene sounds (keep UI/market sounds)
 */
export function pauseGameSceneSounds(): void {
  // Only pause game scene sounds
  SOUND_CATEGORIES.GAME_SCENE.forEach(soundName => {
    const audio = soundCache.get(soundName);
    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
  
  // Stop background music (this is game scene)
  musicManager.stop();
  
  if (GAME_CONSTANTS.DEBUG_MODE) {
  }
}

/**
 * 🔊 UPGRADE SCREEN: Resume game scene sounds after upgrade
 */
export function resumeGameSceneSounds(): void {
  // Resume background music (main game scene audio)
  import('./musicManager').then(({ startBackgroundMusic }) => {
    setTimeout(() => {
      startBackgroundMusic();
    }, 500); // Small delay to prevent audio overlap
  });
  
  if (GAME_CONSTANTS.DEBUG_MODE) {
  }
}

/**
 * 🔇 LEGACY: Keep old function name for backward compatibility
 * @deprecated Use pauseGameSceneSounds() instead
 */
export function pauseAllSounds(): void {
  console.warn('⚠️ pauseAllSounds() is deprecated, use pauseGameSceneSounds()');
  pauseGameSceneSounds();
}

/**
 * 🔊 LEGACY: Keep old function name for backward compatibility
 * @deprecated Use resumeGameSceneSounds() instead
 */
export function resumeAllSounds(): void {
  console.warn('⚠️ resumeAllSounds() is deprecated, use resumeGameSceneSounds()');
  resumeGameSceneSounds();
}

export function getMissingSounds(): string[] {
  return Array.from(missingSounds);
}

export function validateSounds(): { available: string[]; missing: string[] } {
  const required = ['gamesound', 'gameover', 'levelupwav', 'lock-break', 'death-soundü', 'tower-create-sound', 'tower-levelup-sound'];
  const available: string[] = [];
  const missing: string[] = [];
  required.forEach(sound => {
    if (missingSounds.has(sound)) missing.push(sound); else available.push(sound);
  });
  return { available, missing };
}

/**
 * 🔍 DEBUG: Show sound categories for testing
 */
export function debugSoundCategories(): void {
}

// Add debug function to window for console access
if (typeof window !== 'undefined') {
  (window as Window & { debugSoundCategories?: () => void }).debugSoundCategories = debugSoundCategories;
}
