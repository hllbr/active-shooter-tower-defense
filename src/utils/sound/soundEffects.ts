import { musicManager } from './musicManager';
import { getSettings } from '../settings';

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
  console.log('🔊 Ses Ayarları Testi:');
  console.log('Mute:', settings.mute);
  console.log('Müzik Volume:', settings.musicVolume);
  console.log('SFX Volume:', settings.sfxVolume);
  console.log('Cache boyutu:', soundCache.size);
  
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
    purchase: 'lock-break',
    'tower-build': 'tower-create-sound',
    'tower-upgrade': 'tower-levelup-sound',
    'dice-roll': 'dice-roll',
    click: '',
    unlock: 'lock-break'
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
