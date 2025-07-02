import { getSettings } from '../settings';

class SmartMusicManager {
  private isPlaying = false;
  private currentTrack: string | null = null;
  private audio: HTMLAudioElement | null = null;

  start(track: string = 'gamesound'): void {
    if (this.isPlaying && this.currentTrack === track) return;
    this.stop();
    try {
      this.audio = new Audio(`/sounds/${track}.wav`);
      this.audio.loop = true;
      const settings = getSettings();
      this.audio.volume = settings.mute ? 0 : settings.musicVolume;
      const playPromise = this.audio.play();
      if (playPromise) {
        playPromise.then(() => {
          this.isPlaying = true;
          this.currentTrack = track;
        }).catch(() => {
          this.isPlaying = false;
          this.currentTrack = null;
        });
      }
    } catch {
      this.isPlaying = false;
      this.currentTrack = null;
    }
  }

  stop(): void {
    if (!this.isPlaying || !this.audio) return;
    try {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    } catch {
      // Ignore errors
    }
    this.isPlaying = false;
    this.currentTrack = null;
  }

  updateSettings(): void {
    if (this.audio) {
      const settings = getSettings();
      this.audio.volume = settings.mute ? 0 : settings.musicVolume;
    }
  }

  getStatus(): { isPlaying: boolean; currentTrack: string | null } {
    return { isPlaying: this.isPlaying, currentTrack: this.currentTrack };
  }
}

export const musicManager = new SmartMusicManager();

export function startBackgroundMusic(): void {
  musicManager.start('gamesound');
}

export function stopBackgroundMusic(): void {
  musicManager.stop();
}

export function transitionMusic(to: 'game' | 'victory' | 'silence'): void {
  const trackMap: Record<string, string | null> = {
    game: 'gamesound',
    victory: 'victory',
    silence: null
  };
  const target = trackMap[to];
  if (target) {
    musicManager.start(target);
  } else {
    musicManager.stop();
  }
}

export function getMusicStatus(): { isPlaying: boolean; currentTrack: string | null } {
  return musicManager.getStatus();
}

export function updateMusicSettings(): void {
  musicManager.updateSettings();
}
