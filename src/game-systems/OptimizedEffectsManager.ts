/**
 * 🚀 Optimized Effects Manager
 * Central coordinator for all simplified effect systems
 */

import { Effects } from './Effects';
import { weatherEffectMarket } from './market/WeatherEffectMarket';

export class OptimizedEffectsManager {
  private static instance: OptimizedEffectsManager | null = null;
  private frameCount = 0;
  private performanceStats = {
    averageParticleCount: 0,
    peakParticleCount: 0,
    effectsPerSecond: 0,
    lastCleanup: Date.now()
  };

  private constructor() {
    // Auto-cleanup every 30 seconds
    setInterval(() => {
      this.performCleanup();
    }, 30000);
  }

  static getInstance(): OptimizedEffectsManager {
    if (!OptimizedEffectsManager.instance) {
      OptimizedEffectsManager.instance = new OptimizedEffectsManager();
    }
    return OptimizedEffectsManager.instance;
  }

  /**
   * Frame-based update for all effect systems
   */
  update(): void {
    this.frameCount++;
    
    // Performance monitoring every 60 frames (1 second at 60fps)
    if (this.frameCount % 60 === 0) {
      this.updatePerformanceStats();
    }

    // Aggressive cleanup every 300 frames (5 seconds)
    if (this.frameCount % 300 === 0) {
      this.performCleanup();
    }
  }

  /**
   * Create optimized effect based on context
   */
  createContextualEffect(
    type: 'combat' | 'ui' | 'weather' | 'boss',
    x: number,
    y: number,
    options?: {
      damage?: number;
      explosion?: boolean;
      radius?: number;
      fromX?: number;
      fromY?: number;
      towerType?: string;
      placement?: boolean;
      status?: 'slow' | 'freeze' | 'heal' | 'shield';
      weatherType?: string;
      ability?: string;
    }
  ): void {
    switch (type) {
      case 'combat':
        if (options?.damage) {
          Effects.createEnemyDamageEffect(x, y, options.damage);
        } else if (options?.explosion) {
          Effects.createExplosionEffect(x, y, options.radius || 30);
        } else {
          Effects.createShootingEffect(
            options?.fromX || x,
            options?.fromY || y,
            x,
            y,
            options?.towerType || 'basic'
          );
        }
        break;

      case 'ui':
        if (options?.placement) {
          Effects.createTowerPlacementEffect(x, y);
        } else if (options?.status) {
          Effects.createStatusEffect(x, y, options.status);
        }
        break;

      case 'weather':
        Effects.createWeatherEffect(x, y, options?.weatherType || 'storm');
        break;

      case 'boss':
        Effects.createBossAbilityEffect(x, y, options?.ability || 'slam');
        break;
    }
  }

  /**
   * Batch create multiple effects efficiently
   */
  createBatchEffects(effects: Array<{
    type: string;
    x: number;
    y: number;
    options?: Record<string, unknown>;
  }>): void {
    // Limit batch size for performance
    const maxBatch = 10;
    const limitedEffects = effects.slice(0, maxBatch);

    limitedEffects.forEach(effect => {
      this.createContextualEffect(
        effect.type as 'combat' | 'ui' | 'weather' | 'boss',
        effect.x,
        effect.y,
        effect.options as any // eslint-disable-line @typescript-eslint/no-explicit-any
      );
    });
  }

  /**
   * Update performance statistics
   */
  private updatePerformanceStats(): void {
    const stats = Effects.getPerformanceStats();
    const currentParticleCount = stats.particleCount;

    // Update average
    this.performanceStats.averageParticleCount = 
      (this.performanceStats.averageParticleCount + currentParticleCount) / 2;

    // Update peak
    if (currentParticleCount > this.performanceStats.peakParticleCount) {
      this.performanceStats.peakParticleCount = currentParticleCount;
    }

    // Calculate effects per second (rough estimate)
    this.performanceStats.effectsPerSecond = stats.activeEffects;

    // Auto-optimize if performance is degrading
    if (currentParticleCount > 100) {
      this.performCleanup();
    }
  }

  /**
   * Aggressive cleanup for performance
   */
  private performCleanup(): void {
    Effects.clearAllEffects();
    this.performanceStats.lastCleanup = Date.now();
    
    // Reset peak counter
    this.performanceStats.peakParticleCount = 0;
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics(): {
    particles: number;
    effects: number;
    frameCount: number;
    stats: typeof this.performanceStats;
  } {
    const currentStats = Effects.getPerformanceStats();
    
    return {
      particles: currentStats.particleCount,
      effects: currentStats.activeEffects,
      frameCount: this.frameCount,
      stats: { ...this.performanceStats }
    };
  }

  /**
   * Weather effects integration
   */
  triggerWeatherEffect(x: number, y: number): void {
    const activeEffects = weatherEffectMarket.getActiveEffects();
    
    activeEffects.forEach(({ card }) => {
      // Create visual effect based on card type
      const effectMap: Record<string, string> = {
        'explosion-rain': 'explosion-rain',
        'lightning-storm': 'lightning-storm',
        'slow-mist': 'slow-mist',
        'frost-wave': 'frost-wave',
        'time-slow': 'time-slow',
        'healing-rain': 'healing-rain'
      };

      const weatherType = effectMap[card.id];
      if (weatherType) {
        Effects.createWeatherEffect(x, y, weatherType);
      }
    });
  }

  /**
   * Emergency performance reset
   */
  emergencyReset(): void {
    Effects.clearAllEffects();
    this.frameCount = 0;
    this.performanceStats = {
      averageParticleCount: 0,
      peakParticleCount: 0,
      effectsPerSecond: 0,
      lastCleanup: Date.now()
    };
  }
}

// Singleton export
export const optimizedEffectsManager = OptimizedEffectsManager.getInstance(); 