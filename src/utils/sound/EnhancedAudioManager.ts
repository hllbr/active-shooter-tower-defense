import { getSettings, saveSettings } from '../settings';

// Types for audio management
interface AudioTransition {
  startVolume: number;
  targetVolume: number;
  startTime: number;
  duration: number;
  isActive: boolean;
}

interface AudioState {
  sfxVolume: number;
  musicVolume: number;
  mute: boolean;
  isTransitioning: boolean;
}

// Audio transition configuration
const TRANSITION_CONFIG = {
  duration: 300, // 300ms transition duration
  debounceDelay: 100, // 100ms debounce for rapid changes
  lerpSteps: 30, // Number of steps for smooth transition
} as const;

class EnhancedAudioManager {
  private audioCache = new Map<string, HTMLAudioElement>();
  private musicAudio: HTMLAudioElement | null = null;
  private currentState: AudioState;
  private transition: AudioTransition | null = null;
  private debounceTimers = new Map<string, number>();
  private animationFrameId: number | null = null;

  constructor() {
    const settings = getSettings();
    this.currentState = {
      sfxVolume: settings.sfxVolume,
      musicVolume: settings.musicVolume,
      mute: settings.mute,
      isTransitioning: false,
    };
  }

  /**
   * Smoothly transition volume with lerp interpolation
   */
  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * Easing function for smooth transitions
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Update volume with smooth transition
   */
  private updateVolumeWithTransition(
    targetVolume: number,
    audioElements: HTMLAudioElement[],
    volumeType: 'sfx' | 'music'
  ): void {
    if (this.transition?.isActive) {
      // Cancel existing transition
      this.transition.isActive = false;
    }

    const startVolume = volumeType === 'sfx' 
      ? this.currentState.sfxVolume 
      : this.currentState.musicVolume;

    // If no change needed, return early
    if (Math.abs(targetVolume - startVolume) < 0.01) {
      return;
    }

    this.transition = {
      startVolume,
      targetVolume,
      startTime: performance.now(),
      duration: TRANSITION_CONFIG.duration,
      isActive: true,
    };

    this.currentState.isTransitioning = true;

    // Start animation loop
    this.startTransitionAnimation(audioElements);
  }

  /**
   * Animation loop for smooth volume transitions
   */
  private startTransitionAnimation(audioElements: HTMLAudioElement[]): void {
    const animate = (currentTime: number) => {
      if (!this.transition?.isActive) {
        this.currentState.isTransitioning = false;
        return;
      }

      const elapsed = currentTime - this.transition.startTime;
      const progress = Math.min(elapsed / this.transition.duration, 1);
      const easedProgress = this.easeInOutCubic(progress);

      const currentVolume = this.lerp(
        this.transition.startVolume,
        this.transition.targetVolume,
        easedProgress
      );

      // Update all audio elements
      audioElements.forEach(audio => {
        if (audio && !audio.paused) {
          audio.volume = this.currentState.mute ? 0 : currentVolume;
        }
      });

      // Update state
      if (this.transition.targetVolume === this.currentState.sfxVolume) {
        this.currentState.sfxVolume = currentVolume;
      } else {
        this.currentState.musicVolume = currentVolume;
      }

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        // Transition complete
        this.transition.isActive = false;
        this.currentState.isTransitioning = false;
        this.animationFrameId = null;
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Debounced volume update to prevent rapid changes
   */
  private debouncedVolumeUpdate(
    volumeType: 'sfxVolume' | 'musicVolume',
    newValue: number,
    updateFunction: () => void
  ): void {
    const key = `volume_${volumeType}`;
    
    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key)!);
    }

    // Set new timer
    const timer = setTimeout(() => {
      updateFunction();
      this.debounceTimers.delete(key);
    }, TRANSITION_CONFIG.debounceDelay);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Update SFX volume with smooth transition
   */
  updateSFXVolume(newVolume: number): void {
    this.debouncedVolumeUpdate('sfxVolume', newVolume, () => {
      const audioElements = Array.from(this.audioCache.values());
      this.updateVolumeWithTransition(newVolume, audioElements, 'sfx');
      
      // Update settings
      const settings = getSettings();
      const newSettings = { ...settings, sfxVolume: newVolume };
      saveSettings(newSettings);
    });
  }

  /**
   * Update music volume with smooth transition
   */
  updateMusicVolume(newVolume: number): void {
    this.debouncedVolumeUpdate('musicVolume', newVolume, () => {
      if (this.musicAudio) {
        this.updateVolumeWithTransition(newVolume, [this.musicAudio], 'music');
      }
      
      // Update settings
      const settings = getSettings();
      const newSettings = { ...settings, musicVolume: newVolume };
      saveSettings(newSettings);
    });
  }

  /**
   * Toggle mute with smooth transition
   */
  toggleMute(): void {
    const newMuteState = !this.currentState.mute;
    this.currentState.mute = newMuteState;

    // Immediately update all audio elements
    const targetVolume = newMuteState ? 0 : this.currentState.sfxVolume;
    this.audioCache.forEach(audio => {
      if (audio) {
        audio.volume = targetVolume;
      }
    });

    if (this.musicAudio) {
      const musicTargetVolume = newMuteState ? 0 : this.currentState.musicVolume;
      this.musicAudio.volume = musicTargetVolume;
    }

    // Update settings
    const settings = getSettings();
    const newSettings = { ...settings, mute: newMuteState };
    saveSettings(newSettings);
  }

  /**
   * Add audio element to cache
   */
  addAudioElement(key: string, audio: HTMLAudioElement): void {
    this.audioCache.set(key, audio);
    
    // Set initial volume
    const settings = getSettings();
    audio.volume = settings.mute ? 0 : settings.sfxVolume;
  }

  /**
   * Set music audio element
   */
  setMusicAudio(audio: HTMLAudioElement): void {
    this.musicAudio = audio;
    
    // Set initial volume
    const settings = getSettings();
    audio.volume = settings.mute ? 0 : settings.musicVolume;
  }

  /**
   * Get current audio state
   */
  getCurrentState(): AudioState {
    return { ...this.currentState };
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Clear debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();

    // Clear transition
    if (this.transition) {
      this.transition.isActive = false;
    }
  }

  /**
   * Force immediate volume update (for testing)
   */
  forceVolumeUpdate(): void {
    const settings = getSettings();
    const targetVolume = settings.mute ? 0 : settings.sfxVolume;
    
    this.audioCache.forEach(audio => {
      if (audio) {
        audio.volume = targetVolume;
      }
    });

    if (this.musicAudio) {
      const musicTargetVolume = settings.mute ? 0 : settings.musicVolume;
      this.musicAudio.volume = musicTargetVolume;
    }
  }
}

// Export singleton instance
export const enhancedAudioManager = new EnhancedAudioManager();

// Export convenience functions
export const updateSFXVolume = (volume: number) => enhancedAudioManager.updateSFXVolume(volume);
export const updateMusicVolume = (volume: number) => enhancedAudioManager.updateMusicVolume(volume);
export const toggleMute = () => enhancedAudioManager.toggleMute();
export const getAudioState = () => enhancedAudioManager.getCurrentState();
export const forceVolumeUpdate = () => enhancedAudioManager.forceVolumeUpdate(); 