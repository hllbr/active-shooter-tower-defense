export interface PostProcessingState {
  saturation: number;
  contrast: number;
  brightness: number;
  colorTemperature: number;
  chromaticAberration: number;
  vignette: number;
  motionBlur: number;
  depthOfField: number;
  bloom: number;
  grain: number;
  filmGrain: number;
  scanlines: number;
  crtEffect: boolean;
  isActive: boolean;
}

export interface GameStateFilter {
  name: string;
  saturation: number;
  contrast: number;
  brightness: number;
  colorTemperature: number;
  chromaticAberration: number;
  vignette: number;
  motionBlur: number;
  depthOfField: number;
  bloom: number;
  grain: number;
  filmGrain: number;
  scanlines: number;
  crtEffect: boolean;
}

import { Logger } from '../../utils/Logger';

export class PostProcessingManager {
  private static instance: PostProcessingManager;
  private currentState: PostProcessingState;
  private gameStateFilters: Map<string, GameStateFilter> = new Map();
  private transitionDuration: number = 1000;
  private transitionStartTime: number = 0;
  private isTransitioning: boolean = false;
  private targetState: PostProcessingState | null = null;

  private constructor() {
    this.currentState = {
      saturation: 1.0,
      contrast: 1.0,
      brightness: 1.0,
      colorTemperature: 0,
      chromaticAberration: 0,
      vignette: 0,
      motionBlur: 0,
      depthOfField: 0,
      bloom: 0,
      grain: 0,
      filmGrain: 0,
      scanlines: 0,
      crtEffect: false,
      isActive: true,
    };

    this.initializeGameStateFilters();
  }

  public static getInstance(): PostProcessingManager {
    if (!PostProcessingManager.instance) {
      PostProcessingManager.instance = new PostProcessingManager();
    }
    return PostProcessingManager.instance;
  }

  /**
   * Initialize game state filters
   */
  private initializeGameStateFilters(): void {
    // Normal gameplay
    this.gameStateFilters.set('normal', {
      name: 'Normal Gameplay',
      saturation: 1.0,
      contrast: 1.1,
      brightness: 1.0,
      colorTemperature: 0,
      chromaticAberration: 0,
      vignette: 0,
      motionBlur: 0,
      depthOfField: 0,
      bloom: 0.1,
      grain: 0,
      filmGrain: 0,
      scanlines: 0,
      crtEffect: false,
    });

    // Under attack
    this.gameStateFilters.set('under_attack', {
      name: 'Under Attack',
      saturation: 1.2,
      contrast: 1.3,
      brightness: 1.1,
      colorTemperature: 0.1,
      chromaticAberration: 0.05,
      vignette: 0.2,
      motionBlur: 0.1,
      depthOfField: 0,
      bloom: 0.3,
      grain: 0.1,
      filmGrain: 0,
      scanlines: 0,
      crtEffect: false,
    });

    // Low health
    this.gameStateFilters.set('low_health', {
      name: 'Low Health',
      saturation: 0.7,
      contrast: 1.2,
      brightness: 0.9,
      colorTemperature: -0.2,
      chromaticAberration: 0.1,
      vignette: 0.4,
      motionBlur: 0.2,
      depthOfField: 0.1,
      bloom: 0.2,
      grain: 0.2,
      filmGrain: 0,
      scanlines: 0,
      crtEffect: false,
    });

    // Victory
    this.gameStateFilters.set('victory', {
      name: 'Victory',
      saturation: 1.3,
      contrast: 1.0,
      brightness: 1.2,
      colorTemperature: 0.2,
      chromaticAberration: 0,
      vignette: 0,
      motionBlur: 0,
      depthOfField: 0,
      bloom: 0.5,
      grain: 0,
      filmGrain: 0,
      scanlines: 0,
      crtEffect: false,
    });

    // Defeat
    this.gameStateFilters.set('defeat', {
      name: 'Defeat',
      saturation: 0.3,
      contrast: 0.8,
      brightness: 0.6,
      colorTemperature: -0.5,
      chromaticAberration: 0.15,
      vignette: 0.6,
      motionBlur: 0.3,
      depthOfField: 0.2,
      bloom: 0.1,
      grain: 0.3,
      filmGrain: 0.1,
      scanlines: 0,
      crtEffect: false,
    });

    // Boss fight
    this.gameStateFilters.set('boss_fight', {
      name: 'Boss Fight',
      saturation: 1.1,
      contrast: 1.4,
      brightness: 1.05,
      colorTemperature: 0.05,
      chromaticAberration: 0.08,
      vignette: 0.3,
      motionBlur: 0.15,
      depthOfField: 0.05,
      bloom: 0.4,
      grain: 0.05,
      filmGrain: 0,
      scanlines: 0,
      crtEffect: false,
    });

    // Night mode
    this.gameStateFilters.set('night_mode', {
      name: 'Night Mode',
      saturation: 0.9,
      contrast: 1.2,
      brightness: 0.8,
      colorTemperature: -0.1,
      chromaticAberration: 0,
      vignette: 0.2,
      motionBlur: 0,
      depthOfField: 0,
      bloom: 0.2,
      grain: 0,
      filmGrain: 0,
      scanlines: 0,
      crtEffect: false,
    });

    // Retro mode
    this.gameStateFilters.set('retro_mode', {
      name: 'Retro Mode',
      saturation: 0.8,
      contrast: 1.3,
      brightness: 0.9,
      colorTemperature: 0,
      chromaticAberration: 0.1,
      vignette: 0.1,
      motionBlur: 0,
      depthOfField: 0,
      bloom: 0,
      grain: 0.2,
      filmGrain: 0.3,
      scanlines: 0.1,
      crtEffect: true,
    });
  }

  /**
   * Update post-processing state
   */
  public update(currentTime: number): void {
    if (this.isTransitioning && this.targetState) {
      const transitionProgress = (currentTime - this.transitionStartTime) / this.transitionDuration;
      
      if (transitionProgress >= 1) {
        // Transition complete
        this.currentState = { ...this.targetState };
        this.isTransitioning = false;
        this.targetState = null;
      } else {
        // Ease transition
        const easeProgress = this.easeInOutCubic(transitionProgress);
        this.interpolateState(this.currentState, this.targetState, easeProgress);
      }
    }
  }

  /**
   * Apply game state filter
   */
  public applyGameStateFilter(filterName: string, duration: number = 1000): void {
    const filter = this.gameStateFilters.get(filterName);
    if (!filter) {
      Logger.warn(`Post-processing filter "${filterName}" not found`);
      return;
    }

    this.targetState = {
      saturation: filter.saturation,
      contrast: filter.contrast,
      brightness: filter.brightness,
      colorTemperature: filter.colorTemperature,
      chromaticAberration: filter.chromaticAberration,
      vignette: filter.vignette,
      motionBlur: filter.motionBlur,
      depthOfField: filter.depthOfField,
      bloom: filter.bloom,
      grain: filter.grain,
      filmGrain: filter.filmGrain,
      scanlines: filter.scanlines,
      crtEffect: filter.crtEffect,
      isActive: true,
    };

    this.transitionDuration = duration;
    this.transitionStartTime = performance.now();
    this.isTransitioning = true;
  }

  /**
   * Get current post-processing CSS filters
   */
  public getCSSFilters(): string {
    const { 
      saturation, contrast, brightness, colorTemperature,
      chromaticAberration, vignette, motionBlur, depthOfField,
      bloom, grain, filmGrain, scanlines, crtEffect 
    } = this.currentState;

    const filters: string[] = [];

    // Basic color adjustments
    filters.push(`saturate(${saturation})`);
    filters.push(`contrast(${contrast})`);
    filters.push(`brightness(${brightness})`);

    // Color temperature (warm/cool)
    if (colorTemperature !== 0) {
      const temp = colorTemperature > 0 ? `sepia(${colorTemperature})` : `hue-rotate(${colorTemperature * 180}deg)`;
      filters.push(temp);
    }

    // Chromatic aberration (RGB separation)
    if (chromaticAberration > 0) {
      filters.push(`hue-rotate(${chromaticAberration * 10}deg)`);
    }

    // Vignette effect
    if (vignette > 0) {
      // Vignette is handled via CSS box-shadow
    }

    // Motion blur
    if (motionBlur > 0) {
      filters.push(`blur(${motionBlur * 2}px)`);
    }

    // Depth of field (focus blur)
    if (depthOfField > 0) {
      filters.push(`blur(${depthOfField * 3}px)`);
    }

    // Bloom effect
    if (bloom > 0) {
      filters.push(`drop-shadow(0 0 ${bloom * 10}px rgba(255, 255, 255, ${bloom * 0.5}))`);
    }

    // Grain effect
    if (grain > 0) {
      // Grain is handled via CSS noise texture
    }

    // Film grain
    if (filmGrain > 0) {
      // Film grain is handled via CSS noise texture
    }

    // Scanlines
    if (scanlines > 0) {
      // Scanlines are handled via CSS repeating linear gradient
    }

    // CRT effect
    if (crtEffect) {
      filters.push(`contrast(1.2)`);
      filters.push(`brightness(0.9)`);
    }

    return filters.join(' ');
  }

  /**
   * Get vignette CSS
   */
  public getVignetteCSS(): string {
    const { vignette } = this.currentState;
    if (vignette <= 0) return '';

    return `
      radial-gradient(
        circle at center,
        transparent 0%,
        transparent ${100 - vignette * 50}%,
        rgba(0, 0, 0, ${vignette * 0.8}) 100%
      )
    `;
  }

  /**
   * Get grain CSS
   */
  public getGrainCSS(): string {
    const { grain, filmGrain } = this.currentState;
    const totalGrain = grain + filmGrain;
    
    if (totalGrain <= 0) return '';

    return `
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='${totalGrain * 0.3}'/%3E%3C/svg%3E")
    `;
  }

  /**
   * Get scanlines CSS
   */
  public getScanlinesCSS(): string {
    const { scanlines } = this.currentState;
    if (scanlines <= 0) return '';

    return `
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 1px,
        rgba(0, 0, 0, ${scanlines * 0.3}) 1px,
        rgba(0, 0, 0, ${scanlines * 0.3}) 2px
      )
    `;
  }

  /**
   * Interpolate between two states
   */
  private interpolateState(
    current: PostProcessingState, 
    target: PostProcessingState, 
    progress: number
  ): void {
    const lerp = (start: number, end: number, t: number): number => {
      return start + (end - start) * t;
    };

    this.currentState.saturation = lerp(current.saturation, target.saturation, progress);
    this.currentState.contrast = lerp(current.contrast, target.contrast, progress);
    this.currentState.brightness = lerp(current.brightness, target.brightness, progress);
    this.currentState.colorTemperature = lerp(current.colorTemperature, target.colorTemperature, progress);
    this.currentState.chromaticAberration = lerp(current.chromaticAberration, target.chromaticAberration, progress);
    this.currentState.vignette = lerp(current.vignette, target.vignette, progress);
    this.currentState.motionBlur = lerp(current.motionBlur, target.motionBlur, progress);
    this.currentState.depthOfField = lerp(current.depthOfField, target.depthOfField, progress);
    this.currentState.bloom = lerp(current.bloom, target.bloom, progress);
    this.currentState.grain = lerp(current.grain, target.grain, progress);
    this.currentState.filmGrain = lerp(current.filmGrain, target.filmGrain, progress);
    this.currentState.scanlines = lerp(current.scanlines, target.scanlines, progress);
    this.currentState.crtEffect = target.crtEffect; // Boolean, no interpolation
  }

  /**
   * Easing function
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Get current state
   */
  public getCurrentState(): PostProcessingState {
    return { ...this.currentState };
  }

  /**
   * Check if transitioning
   */
  public isInTransition(): boolean {
    return this.isTransitioning;
  }

  /**
   * Reset to normal state
   */
  public resetToNormal(): void {
    this.applyGameStateFilter('normal', 500);
  }
} 