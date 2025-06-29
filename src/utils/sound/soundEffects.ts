import { musicManager } from './musicManager';

export const audioCache: Record<string, HTMLAudioElement> = {};
export const gameAudio: HTMLAudioElement | null = null;

const soundCache = new Map<string, HTMLAudioElement>();
const missingSounds = new Set<string>();

export function playSound(sound: string): void {
  if (missingSounds.has(sound)) return;
  try {
    let audio = soundCache.get(sound);
    if (!audio) {
      audio = new Audio(`/sounds/${sound}.wav`);
      audio.volume = 0.8;
      soundCache.set(sound, audio);
    }
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
