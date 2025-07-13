import { enhancedAudioManager } from './EnhancedAudioManager';

class SmartMusicManager {
  private isPlaying = false;
  private currentTrack: string | null = null;
  private audio: HTMLAudioElement | null = null;

  start(track: string = 'gamesound'): void {
    if (this.isPlaying && this.currentTrack === track) return;
    this.stop();
    try {
      this.audio = new Audio(`/assets/sounds/${track}.wav`);
      this.audio.loop = true;
      
      // Register with enhanced audio manager for smooth volume transitions
      enhancedAudioManager.setMusicAudio(this.audio);
      
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
    // Volume is now managed by enhanced audio manager
    // This method is kept for backward compatibility
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
    victory: 'victory-fanfare',
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
  // Volume is now managed by enhanced audio manager
  // This method is kept for backward compatibility
}
