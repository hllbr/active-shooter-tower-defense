/**
 * 🌦️ Weather Manager
 * Centralized weather system with pause/resume support
 * Follows SOLID principles for maintainability and extensibility
 */

import { useGameStore } from '../../models/store';
import { Effects } from '../Effects';
import { playSound } from '../../utils/sound/soundEffects';
// Logger import removed for production
import type { WeatherState } from '../../models/gameTypes';

export interface WeatherEffect {
  id: string;
  type: 'rain' | 'snow' | 'storm' | 'fog' | 'clear';
  intensity: number; // 0-1
  duration: number; // milliseconds
  startTime: number;
  endTime: number;
  isActive: boolean;
  isPaused: boolean;
  pauseStartTime?: number;
  totalPausedTime: number;
}

export interface WeatherParticleSystem {
  id: string;
  type: string;
  isActive: boolean;
  isPaused: boolean;
  pauseStartTime?: number;
  totalPausedTime: number;
}

export interface WeatherSound {
  id: string;
  soundName: string;
  isActive: boolean;
  isPaused: boolean;
  pauseStartTime?: number;
  totalPausedTime: number;
}

/**
 * Weather Manager - Single Responsibility: Manage weather state and effects
 */
export class WeatherManager {
  private static instance: WeatherManager | null = null;
  
  // Weather state
  private currentWeather: WeatherState;
  private activeEffects: Map<string, WeatherEffect> = new Map();
  private particleSystems: Map<string, WeatherParticleSystem> = new Map();
  private weatherSounds: Map<string, WeatherSound> = new Map();
  
  // Pause state
  private isPaused: boolean = false;
  private pauseStartTime: number = 0;
  private totalPausedTime: number = 0;
  
  // Update loop
  private updateInterval: number | null = null;
  private lastUpdateTime: number = 0;

  private constructor() {
    this.currentWeather = this.initializeWeatherState();
    this.startUpdateLoop();
  }

  static getInstance(): WeatherManager {
    if (!WeatherManager.instance) {
      WeatherManager.instance = new WeatherManager();
    }
    return WeatherManager.instance;
  }

  /**
   * Initialize default weather state
   */
  private initializeWeatherState(): WeatherState {
    return {
      currentWeather: 'clear',
      weatherIntensity: 0,
      visibility: 1.0,
      movementPenalty: 0,
      damageModifier: 1.0,
      duration: 120000, // 2 minutes
      startTime: performance.now(),
      transitionTime: 0
    };
  }

  /**
   * Start the weather update loop
   */
  private startUpdateLoop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.updateInterval = window.setInterval(() => {
      this.updateWeather();
    }, 1000); // Update every second
  }

  /**
   * Stop the weather update loop
   */
  private stopUpdateLoop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update weather state and effects
   */
  private updateWeather(): void {
    if (this.isPaused) {
      return; // Don't update when paused
    }

    const currentTime = performance.now();
    this.lastUpdateTime = currentTime;

    // Update weather progression
    this.updateWeatherProgression(currentTime);
    
    // Update active effects
    this.updateActiveEffects(currentTime);
    
    // Update particle systems
    this.updateParticleSystems(currentTime);
    
    // Update weather sounds
    this.updateWeatherSounds(currentTime);
    
    // Update store state
    this.updateStoreState();
  }

  /**
   * Update weather progression (natural weather changes)
   */
  private updateWeatherProgression(currentTime: number): void {
    const weatherDuration = currentTime - this.currentWeather.startTime;
    
    if (weatherDuration > this.currentWeather.duration) {
      // Change weather
      this.transitionToNextWeather(currentTime);
    }
  }

  /**
   * Transition to next weather state
   */
  private transitionToNextWeather(currentTime: number): void {
    const weatherCycle = ['clear', 'fog', 'clear', 'rain', 'clear'];
    const currentIndex = weatherCycle.indexOf(this.currentWeather.currentWeather);
    const nextIndex = (currentIndex + 1) % weatherCycle.length;
    
    const newWeather = weatherCycle[nextIndex] as WeatherState['currentWeather'];
    
    this.currentWeather = {
      ...this.currentWeather,
      currentWeather: newWeather,
      weatherIntensity: 0.3,
      startTime: currentTime,
      duration: 120000 + Math.random() * 60000 // 2-3 minutes
    };

    // Create transition effects
    this.createWeatherTransitionEffects(newWeather);
  }

  /**
   * Create weather transition effects
   */
  private createWeatherTransitionEffects(weatherType: string): void {
    const effectId = `transition_${Date.now()}`;
    
    // Create particle system for transition
    this.particleSystems.set(effectId, {
      id: effectId,
      type: weatherType,
      isActive: true,
      isPaused: false,
      totalPausedTime: 0
    });

    // Create weather sound if applicable
    if (weatherType === 'rain' || weatherType === 'storm') {
      this.weatherSounds.set(effectId, {
        id: effectId,
        soundName: weatherType === 'storm' ? 'ambient-battle' : 'ambient-wind',
        isActive: true,
        isPaused: false,
        totalPausedTime: 0
      });
      
      if (!this.isPaused) {
        playSound(weatherType === 'storm' ? 'ambient-battle' : 'ambient-wind');
      }
    }
  }

  /**
   * Update active weather effects
   */
  private updateActiveEffects(currentTime: number): void {
    for (const [effectId, effect] of this.activeEffects) {
      if (!effect.isActive) continue;
      
      if (currentTime >= effect.endTime) {
        // Effect expired
        this.deactivateEffect(effectId);
      } else if (effect.isPaused) {
        // Update paused time
        if (effect.pauseStartTime) {
          effect.totalPausedTime = currentTime - effect.pauseStartTime;
        }
      }
    }
  }

  /**
   * Update particle systems
   */
  private updateParticleSystems(currentTime: number): void {
    for (const [_systemId, system] of this.particleSystems) {
      if (!system.isActive) continue;
      
      if (system.isPaused) {
        // Update paused time
        if (system.pauseStartTime) {
          system.totalPausedTime = currentTime - system.pauseStartTime;
        }
      } else {
        // Create particles if not paused
        this.createWeatherParticles(system.type, 0.5); // Default intensity
      }
    }
  }

  /**
   * Update weather sounds
   */
  private updateWeatherSounds(currentTime: number): void {
    for (const [_soundId, sound] of this.weatherSounds) {
      if (!sound.isActive) continue;
      
      if (sound.isPaused) {
        // Update paused time
        if (sound.pauseStartTime) {
          sound.totalPausedTime = currentTime - sound.pauseStartTime;
        }
      }
    }
  }

  /**
   * Create weather particles
   */
  private createWeatherParticles(weatherType: string, intensity: number): void {
    if (this.isPaused) return;

    const particleCount = Math.floor(intensity * 5) + 1; // 1-6 particles
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      
      Effects.createWeatherEffect(x, y, weatherType);
    }
  }

  /**
   * Update store state
   */
  private updateStoreState(): void {
    const store = useGameStore.getState();
    store.updateWeatherState(this.currentWeather);
  }

  /**
   * Pause all weather systems
   */
  public pause(): void {
    if (this.isPaused) return;
    
    this.isPaused = true;
    this.pauseStartTime = performance.now();
    
    // Pause all active effects
    for (const effect of this.activeEffects.values()) {
      if (effect.isActive && !effect.isPaused) {
        effect.isPaused = true;
        effect.pauseStartTime = this.pauseStartTime;
      }
    }
    
    // Pause all particle systems
    for (const system of this.particleSystems.values()) {
      if (system.isActive && !system.isPaused) {
        system.isPaused = true;
        system.pauseStartTime = this.pauseStartTime;
      }
    }
    
    // Pause all weather sounds
    for (const sound of this.weatherSounds.values()) {
      if (sound.isActive && !sound.isPaused) {
        sound.isPaused = true;
        sound.pauseStartTime = this.pauseStartTime;
      }
    }
    
    // Stop weather sounds
    this.stopWeatherSounds();
    
    // Weather system paused
  }

  /**
   * Resume all weather systems
   */
  public resume(): void {
    if (!this.isPaused) return;
    
    const currentTime = performance.now();
    this.totalPausedTime += currentTime - this.pauseStartTime;
    
    this.isPaused = false;
    
    // Resume all active effects
    for (const effect of this.activeEffects.values()) {
      if (effect.isActive && effect.isPaused) {
        effect.isPaused = false;
        effect.totalPausedTime += currentTime - (effect.pauseStartTime || currentTime);
        delete effect.pauseStartTime;
      }
    }
    
    // Resume all particle systems
    for (const system of this.particleSystems.values()) {
      if (system.isActive && system.isPaused) {
        system.isPaused = false;
        system.totalPausedTime += currentTime - (system.pauseStartTime || currentTime);
        delete system.pauseStartTime;
      }
    }
    
    // Resume all weather sounds
    for (const sound of this.weatherSounds.values()) {
      if (sound.isActive && sound.isPaused) {
        sound.isPaused = false;
        sound.totalPausedTime += currentTime - (sound.pauseStartTime || currentTime);
        delete sound.pauseStartTime;
      }
    }
    
    // Resume weather sounds
    this.resumeWeatherSounds();
    
    // Weather system resumed
  }

  /**
   * Stop all weather sounds
   */
  private stopWeatherSounds(): void {
    // Note: Sound stopping is handled by the sound system when game is paused
    // This is just for logging and state management
    for (const sound of this.weatherSounds.values()) {
      if (sound.isActive) {
        // Weather sound paused
      }
    }
  }

  /**
   * Resume weather sounds
   */
  private resumeWeatherSounds(): void {
    for (const sound of this.weatherSounds.values()) {
      if (sound.isActive && !sound.isPaused) {
        // Weather sound resumed
        // Sound will be resumed by the sound system when game resumes
      }
    }
  }

  /**
   * Add a weather effect
   */
  public addWeatherEffect(type: string, intensity: number, duration: number): string {
    const effectId = `weather_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const effect: WeatherEffect = {
      id: effectId,
      type: type as WeatherEffect['type'],
      intensity,
      duration,
      startTime: performance.now(),
      endTime: performance.now() + duration,
      isActive: true,
      isPaused: this.isPaused,
      totalPausedTime: 0
    };
    
    this.activeEffects.set(effectId, effect);
    
    // Create particle system
    this.particleSystems.set(effectId, {
      id: effectId,
      type,
      isActive: true,
      isPaused: this.isPaused,
      totalPausedTime: 0
    });
    
    // Create weather sound if applicable
    if (type === 'rain' || type === 'storm') {
      this.weatherSounds.set(effectId, {
        id: effectId,
        soundName: type === 'storm' ? 'ambient-battle' : 'ambient-wind',
        isActive: true,
        isPaused: this.isPaused,
        totalPausedTime: 0
      });
      
      if (!this.isPaused) {
        playSound(type === 'storm' ? 'ambient-battle' : 'ambient-wind');
      }
    }
    
    // Weather effect added
    return effectId;
  }

  /**
   * Remove a weather effect
   */
  public removeWeatherEffect(effectId: string): boolean {
    const effect = this.activeEffects.get(effectId);
    if (!effect) return false;
    
    this.deactivateEffect(effectId);
    return true;
  }

  /**
   * Deactivate an effect and clean up resources
   */
  private deactivateEffect(effectId: string): void {
    // Deactivate effect
    const effect = this.activeEffects.get(effectId);
    if (effect) {
      effect.isActive = false;
      this.activeEffects.delete(effectId);
    }
    
    // Deactivate particle system
    const system = this.particleSystems.get(effectId);
    if (system) {
      system.isActive = false;
      this.particleSystems.delete(effectId);
    }
    
    // Deactivate sound
    const sound = this.weatherSounds.get(effectId);
    if (sound) {
      sound.isActive = false;
      this.weatherSounds.delete(effectId);
    }
  }

  /**
   * Get current weather state
   */
  public getWeatherState(): WeatherState {
    return { ...this.currentWeather };
  }

  /**
   * Get active effects
   */
  public getActiveEffects(): WeatherEffect[] {
    return Array.from(this.activeEffects.values()).filter(effect => effect.isActive);
  }

  /**
   * Check if weather system is paused
   */
  public isWeatherPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Get weather system status
   */
  public getStatus(): {
    isPaused: boolean;
    activeEffects: number;
    particleSystems: number;
    weatherSounds: number;
    currentWeather: string;
  } {
    return {
      isPaused: this.isPaused,
      activeEffects: this.getActiveEffects().length,
      particleSystems: Array.from(this.particleSystems.values()).filter(s => s.isActive).length,
      weatherSounds: Array.from(this.weatherSounds.values()).filter(s => s.isActive).length,
      currentWeather: this.currentWeather.currentWeather
    };
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stopUpdateLoop();
    this.activeEffects.clear();
    this.particleSystems.clear();
    this.weatherSounds.clear();
    WeatherManager.instance = null;
  }
}

// Export singleton instance
export const weatherManager = WeatherManager.getInstance(); 