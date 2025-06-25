export const audioCache: Record<string, HTMLAudioElement> = {};
let backgroundMusic: HTMLAudioElement | null = null;
let gameAudio: HTMLAudioElement | null = null;

// ✅ ENHANCED AUDIO SYSTEM: Smart Music Management (prevents overlaps and chaos)
class SmartMusicManager {
  private isPlaying: boolean = false;
  private currentTrack: string | null = null;
  private audio: HTMLAudioElement | null = null;
  
  public start(track: string = 'gamesound'): void {
    // ✅ PREVENT OVERLAP: Don't restart if same track already playing
    if (this.isPlaying && this.currentTrack === track) {
      console.log(`🔊 Music already playing: ${track}`);
      return;
    }
    
    console.log(`🎵 Starting music: ${track}`);
    
    // Stop any current music first
    this.stop();
    
    try {
      this.audio = new Audio(`/sounds/${track}.wav`);
      this.audio.loop = true;
      this.audio.volume = 0.6;
      
      const playPromise = this.audio.play();
      if (playPromise) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            this.currentTrack = track;
            console.log(`✅ Music started successfully: ${track}`);
          })
          .catch(error => {
            console.warn(`⚠️ Could not start music ${track}:`, error);
            this.isPlaying = false;
            this.currentTrack = null;
          });
      }
    } catch (error) {
      console.error(`❌ Music error for ${track}:`, error);
    }
  }
  
  public stop(): void {
    if (!this.isPlaying || !this.audio) return;
    
    console.log(`🛑 Stopping music: ${this.currentTrack}`);
    
    try {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    } catch (error) {
      console.warn('⚠️ Error stopping music:', error);
    }
    
    this.isPlaying = false;
    this.currentTrack = null;
  }
  
  public getStatus(): { isPlaying: boolean; currentTrack: string | null } {
    return {
      isPlaying: this.isPlaying,
      currentTrack: this.currentTrack
    };
  }
}

// Singleton instance
const musicManager = new SmartMusicManager();

// ✅ ENHANCED SOUND SYSTEM: Missing Sound Detection + Context Awareness
const soundCache = new Map<string, HTMLAudioElement>();
const missingSounds = new Set<string>();

export function playSound(sound: string): void {
  // ✅ PREVENT SPAM: Don't spam missing sound warnings
  if (missingSounds.has(sound)) return;
  
  try {
    let audio = soundCache.get(sound);
    
    if (!audio) {
      audio = new Audio(`/sounds/${sound}.wav`);
      audio.volume = 0.8;
      soundCache.set(sound, audio);
    }
    
    // Reset and play
    audio.currentTime = 0;
    const playPromise = audio.play();
    
    if (playPromise) {
      playPromise.catch(error => {
        console.warn(`🔊 Could not play sound ${sound}:`, error);
        missingSounds.add(sound);
      });
    }
  } catch (error) {
    console.error(`❌ Sound error for ${sound}:`, error);
    missingSounds.add(sound);
  }
}

// ✅ NEW: Context-aware sound system with fallbacks for missing sounds
export function playContextualSound(context: 'victory' | 'defeat' | 'warning' | 'purchase' | 'click' | 'unlock'): void {
  const soundMap: Record<string, string> = {
    victory: 'levelupwav',    // Fallback: celebration sound for victory
    defeat: 'gameover',       // Direct mapping
    warning: 'gameover',      // Fallback: attention sound for warnings  
    purchase: 'lock-break',   // Fallback: transaction sound
    click: '',                // Silent until click.wav is added
    unlock: 'lock-break'      // Direct mapping
  };
  
  const soundFile = soundMap[context];
  if (soundFile) {
    playSound(soundFile);
  } else {
    console.log(`🔇 Silent context: ${context} (no sound file)`);
  }
}

// ✅ SMART MUSIC FUNCTIONS: Use the enhanced manager
export function startBackgroundMusic(): void {
  musicManager.start('gamesound');
}

export function stopBackgroundMusic(): void {
  musicManager.stop();
}

// ✅ NEW: Music transition system
export function transitionMusic(to: 'game' | 'victory' | 'silence'): void {
  const trackMap: Record<string, string | null> = {
    game: 'gamesound',
    victory: 'victory', // If we have victory background music
    silence: null
  };
  
  const targetTrack = trackMap[to];
  
  if (targetTrack) {
    musicManager.start(targetTrack);
  } else {
    musicManager.stop();
  }
}

// ✅ DIAGNOSTIC: Get music status for debugging
export function getMusicStatus(): { isPlaying: boolean; currentTrack: string | null } {
  return musicManager.getStatus();
}

// ✅ CLEANUP: Clear sound cache
export function clearSoundCache(): void {
  soundCache.clear();
  missingSounds.clear();
  musicManager.stop();
}

// ✅ MISSING SOUND DETECTION: Get list of missing sounds
export function getMissingSounds(): string[] {
  return Array.from(missingSounds);
}

// Legacy support (backward compatibility)
export { gameAudio };
