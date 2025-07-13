import { musicManager } from './musicManager';
import { getSettings } from '../settings';
import { useGameStore } from '../../models/store';
import { enhancedAudioManager } from './EnhancedAudioManager';


export const audioCache: Record<string, HTMLAudioElement> = {};
export const gameAudio: HTMLAudioElement | null = null;

const soundCache = new Map<string, HTMLAudioElement>();
const missingSounds = new Set<string>();

// 🔊 COOLDOWN SYSTEM: Prevent sound spam and overlapping
const soundCooldowns = new Map<string, number>();
const soundLastPlayed = new Map<string, number>();

// Cooldown süreleri (milisaniye cinsinden) - ses türüne göre ayarlanmış
const SOUND_COOLDOWN_DURATIONS: Record<string, number> = {
  // Çok sık çalınan UI sesleri - kısa cooldown (REDUCED for better responsiveness)
  'click': 25,
  'hover': 50,
  'error': 100,
  
  // Orta sıklıkta çalınan sesler - orta cooldown (REDUCED for purchase responsiveness)
  'coin-collect': 75,
  'gold-drop': 100,
  'lock-break': 150,
  'dice-roll': 100, // Further reduced for better dice responsiveness
  'pickup-common': 125,
  'pickup-rare': 150,
  'notification': 250,
  'countdown-beep': 400,
  
  // Purchase & Upgrade sesleri - kısa cooldown (responsive UI için)
  'upgrade-purchase': 50,
  
  // Loot sesleri - kısa cooldown (hızlı toplamalar için)
  'loot-common': 50,
  'loot-rare': 75,
  'loot-epic': 100,
  'loot-legendary': 125,
  
  // Oyun aksiyonu sesleri - orta cooldown
  'explosion-large': 200,
  'explosion-small': 150,
  'tower-attack-explosive': 100,
  'tower-attack-laser': 80,
  'tower-attack-plasma': 120,
  'tower-attack-sniper': 300,
  'freeze-effect': 200,
  'slow-effect': 200,
  'shield-activate': 100, // REDUCED for purchase responsiveness
  'shield-break': 300,
  'energy-recharge': 150,
  
  // Kule sesleri - uzun cooldown
  'tower-create-sound': 400,
  'tower-levelup-sound': 500,
  'tower-destroy': 600,
  'tower-repair': 400,
  
  // Boss sesleri - uzun cooldown
  'boss-bombing': 800,
  'boss-charge': 1000,
  'boss-defeat': 2000,
  'boss-entrance': 3000,
  'boss-ground-slam': 600,
  'boss-missile': 400,
  'boss-phase-transition': 2000,
  'boss-reality-tear': 1500,
  'boss-spawn-minions': 800,
  
  // Özel sesler - çok uzun cooldown
  'gameover': 3000,
  'levelupwav': 2000,
  'victory-fanfare': 3000,
  'wave-complete': 2000,
  'defeat-heavy': 1500,
  
  // Ambient sesler - orta cooldown
  'ambient-battle': 5000,
  'ambient-wind': 8000,
  
  // Varsayılan cooldown
  'default': 200
};

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

const isGameSceneSound = (sound: string): boolean => {
  return (SOUND_CATEGORIES.GAME_SCENE as readonly string[]).includes(sound);
};

/**
 * Ses için cooldown kontrolü yapar
 */
function canPlaySound(soundName: string): boolean {
  const now = Date.now();
  const lastPlayed = soundLastPlayed.get(soundName) || 0;
  const cooldownDuration = SOUND_COOLDOWN_DURATIONS[soundName] || SOUND_COOLDOWN_DURATIONS.default;
  
  return (now - lastPlayed) >= cooldownDuration;
}

/**
 * Ses çalındığında cooldown kaydeder
 */
function recordSoundPlayed(soundName: string): void {
  soundLastPlayed.set(soundName, Date.now());
}

// Volume ayarlarını gerçek zamanlı güncellemek için
export function updateAllSoundVolumes(): void {
  // Use enhanced audio manager for smooth transitions
  const settings = getSettings();
  enhancedAudioManager.updateSFXVolume(settings.sfxVolume);
  enhancedAudioManager.updateMusicVolume(settings.musicVolume);
}

// Test fonksiyonu - volume ayarlarının çalışıp çalışmadığını kontrol et
export function testVolumeControls(): void {
  const _settings = getSettings();
  
  // Test sesi çal
  playSound('dice-roll');
}

export function playSound(sound: string): void {
  if (missingSounds.has(sound)) return;

  const { isRefreshing } = useGameStore.getState();
  if (isRefreshing && isGameSceneSound(sound)) return;

  // 🔊 COOLDOWN CHECK: Ses çok sık çalınıyorsa engelle
  if (!canPlaySound(sound)) {
    return;
  }
  
  try {
    let audio = soundCache.get(sound);
    if (!audio) {
      audio = new Audio(`/assets/sounds/${sound}.wav`);
      soundCache.set(sound, audio);
      // Register with enhanced audio manager
      enhancedAudioManager.addAudioElement(sound, audio);
    }
    
    // Volume is now managed by enhanced audio manager
    audio.currentTime = 0;
    
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => {
        // Ses başarıyla çalındığında cooldown kaydet
        recordSoundPlayed(sound);
      }).catch(() => {
        missingSounds.add(sound);
      });
    }
  } catch {
    missingSounds.add(sound);
  }
}

/**
 * 🔊 TEST MODE: Ses çalma (cooldown bypass)
 * Test butonları için kullanılır
 */
export function playSoundForTest(sound: string): void {
  if (missingSounds.has(sound)) return;
  
  try {
    let audio = soundCache.get(sound);
    if (!audio) {
      audio = new Audio(`/assets/sounds/${sound}.wav`);
      soundCache.set(sound, audio);
      // Register with enhanced audio manager
      enhancedAudioManager.addAudioElement(sound, audio);
    }
    
    // Volume is now managed by enhanced audio manager
    audio.currentTime = 0;
    
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => {
        // Test modu için cooldown kaydetme
      }).catch(() => {
        missingSounds.add(sound);
      });
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
  soundCooldowns.clear();
  soundLastPlayed.clear();
  musicManager.stop();
}

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


