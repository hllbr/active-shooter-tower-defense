/**
 * 🎯 Enhanced Visual Effects Manager
 * Coordinates all visual feedback effects for optimal performance and visual impact
 */

import { EnhancedParticleSystem } from './EnhancedParticleSystem';
// import { useGameStore } from '../../models/store'; // Unused import removed
import { playSound } from '../../utils/sound';
import { performanceMonitor } from './PerformanceMonitor';

export interface ScreenShakeConfig {
  intensity: number;
  duration: number;
  frequency: number;
}

export interface HitFeedbackConfig {
  flashDuration: number;
  flashIntensity: number;
  particleCount: number;
  soundEffect?: string;
}

export class EnhancedVisualEffectsManager {
  private static instance: EnhancedVisualEffectsManager;
  private particleSystem: EnhancedParticleSystem;
  private screenShakeActive = false;
  private screenShakeEndTime = 0;
  private screenShakeConfig: ScreenShakeConfig = { intensity: 0, duration: 0, frequency: 0 };

  // Performance tracking
  private frameCount = 0;
  private lastPerformanceCheck = 0;
  private averageFrameTime = 16; // Target 60 FPS

  private constructor() {
    this.particleSystem = new EnhancedParticleSystem();
  }

  static getInstance(): EnhancedVisualEffectsManager {
    if (!EnhancedVisualEffectsManager.instance) {
      EnhancedVisualEffectsManager.instance = new EnhancedVisualEffectsManager();
    }
    return EnhancedVisualEffectsManager.instance;
  }

  /**
   * Create enemy damage effects with hit flash and particles
   */
  createEnemyDamageEffect(x: number, y: number, damage: number, enemyType: string): void {
    // Create hit flash effect
    this.particleSystem.createHitFlash(x, y, damage);
    
    // Create damage spark effect
    this.particleSystem.createDamageSpark(x, y, damage);
    
    // Add screen shake for heavy damage
    if (damage > 30) {
      this.triggerScreenShake({
        intensity: Math.min(3, damage / 20),
        duration: 200,
        frequency: 0.02
      });
    }
    
    // Play damage sound
    this.playDamageSound(damage, enemyType);
  }

  /**
   * Create tower firing effects with muzzle flash and smoke
   */
  createTowerFiringEffect(x: number, y: number, towerType: string): void {
    // Create muzzle flash
    this.particleSystem.createMuzzleFlash(x, y, towerType);
    
    // Create smoke effect (delayed slightly)
    setTimeout(() => {
      this.particleSystem.createSmoke(x, y);
    }, 50);
    
    // Play firing sound
    this.playFiringSound(towerType);
  }

  /**
   * Create enhanced mine explosion effects
   */
  createMineExplosionEffect(x: number, y: number, mineType: string, radius: number): void {
    // Create explosion particles
    this.particleSystem.createMineExplosion(x, y, mineType);
    
    // Create additional explosion effect
    this.particleSystem.createExplosion(x, y, radius);
    
    // Add screen shake
    this.triggerScreenShake({
      intensity: Math.min(5, radius / 10),
      duration: 300,
      frequency: 0.015
    });
    
    // Play explosion sound
    this.playExplosionSound(mineType);
  }

  /**
   * Create boss death effects with dramatic visual impact
   */
  createBossDeathEffect(x: number, y: number, bossType: string): void {
    // Create dramatic boss death particles
    this.particleSystem.createBossDeath(x, y, bossType);
    
    // Create multiple explosion layers
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.particleSystem.createExplosion(
          x + (Math.random() - 0.5) * 50,
          y + (Math.random() - 0.5) * 50,
          30 + Math.random() * 20
        );
      }, i * 100);
    }
    
    // Add dramatic screen shake
    this.triggerScreenShake({
      intensity: 8,
      duration: 800,
      frequency: 0.01
    });
    
    // Play boss death sound
    this.playBossDeathSound(bossType);
  }

  /**
   * Create bullet impact effects
   */
  createBulletImpactEffect(x: number, y: number, bulletType: string): void {
    // Create impact spark effect
    this.particleSystem.createEffect(x, y, 'damage_spark', {
      count: 3,
      size: 3,
      life: 200
    });
    
    // Play impact sound
    this.playImpactSound(bulletType);
  }

  /**
   * Trigger screen shake effect
   */
  triggerScreenShake(config: ScreenShakeConfig): void {
    this.screenShakeActive = true;
    this.screenShakeConfig = config;
    this.screenShakeEndTime = performance.now() + config.duration;
    
    // Dispatch custom event for UI components
    const event = new CustomEvent('screenShake', {
      detail: {
        intensity: config.intensity,
        duration: config.duration,
        frequency: config.frequency
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get current screen shake state
   */
  getScreenShakeState(): { active: boolean; intensity: number; offset: { x: number; y: number } } {
    if (!this.screenShakeActive || performance.now() > this.screenShakeEndTime) {
      this.screenShakeActive = false;
      return { active: false, intensity: 0, offset: { x: 0, y: 0 } };
    }

    const timeLeft = this.screenShakeEndTime - performance.now();
    const progress = 1 - (timeLeft / this.screenShakeConfig.duration);
    const currentIntensity = this.screenShakeConfig.intensity * (1 - progress);
    
    const offset = {
      x: Math.sin(performance.now() * this.screenShakeConfig.frequency) * currentIntensity,
      y: Math.cos(performance.now() * this.screenShakeConfig.frequency * 0.7) * currentIntensity
    };

    return { active: true, intensity: currentIntensity, offset };
  }

  /**
   * Update all visual effects
   */
  update(deltaTime: number): void {
    // Update particle system
    this.particleSystem.update(deltaTime);
    
    // Performance monitoring
    this.monitorPerformance(deltaTime);
  }

  /**
   * Render all visual effects
   */
  render(ctx: CanvasRenderingContext2D): void {
    this.particleSystem.render(ctx);
  }

  /**
   * Monitor performance and adjust effects accordingly
   */
  private monitorPerformance(_deltaTime: number): void {
    // ✅ NEW: Use performance monitor for better performance tracking
    const metrics = performanceMonitor.update();
    
    // Update particle count in metrics
    metrics.particleCount = this.particleSystem.getParticleCount();
    
    // Adjust particle system based on performance
    const _recommendedLimit = performanceMonitor.getRecommendedParticleLimit();
    this.particleSystem.setPerformanceMode(metrics.isPerformanceMode);
    
    // Performance monitoring (silent in production)
    if (process.env.NODE_ENV === 'development' && metrics.fps < 50) {
      // Performance warning silently handled
    }
  }

  /**
   * Play damage sound based on damage amount and enemy type
   */
  private playDamageSound(damage: number, _enemyType: string): void {
    if (damage > 50) {
      playSound('heavy-damage');
    } else if (damage > 20) {
      playSound('medium-damage');
    } else {
      playSound('light-damage');
    }
  }

  /**
   * Play firing sound based on tower type
   */
  private playFiringSound(towerType: string): void {
    switch (towerType) {
      case 'laser':
        playSound('laser-fire');
        break;
      case 'flamethrower':
        playSound('flame-fire');
        break;
      case 'mortar':
        playSound('mortar-fire');
        break;
      case 'gatling':
        playSound('gatling-fire');
        break;
      default:
        playSound('tower-fire');
    }
  }

  /**
   * Play explosion sound based on mine type
   */
  private playExplosionSound(mineType: string): void {
    switch (mineType) {
      case 'emp':
        playSound('emp-explosion');
        break;
      case 'sticky':
        playSound('sticky-explosion');
        break;
      case 'chain':
        playSound('chain-explosion');
        break;
      default:
        playSound('mine-explosion');
    }
  }

  /**
   * Play boss death sound based on boss type
   */
  private playBossDeathSound(bossType: string): void {
    switch (bossType) {
      case 'demon':
        playSound('demon-death');
        break;
      case 'dragon':
        playSound('dragon-death');
        break;
      case 'golem':
        playSound('golem-death');
        break;
      case 'phoenix':
        playSound('phoenix-death');
        break;
      default:
        playSound('boss-death');
    }
  }

  /**
   * Play impact sound based on bullet type
   */
  private playImpactSound(bulletType: string): void {
    switch (bulletType) {
      case 'laser':
        playSound('laser-impact');
        break;
      case 'explosive':
        playSound('explosive-impact');
        break;
      default:
        playSound('bullet-impact');
    }
  }

  /**
   * Get particle count for debugging
   */
  getParticleCount(): number {
    return this.particleSystem.getParticleCount();
  }

  /**
   * Clear all effects
   */
  clear(): void {
    this.particleSystem.clear();
    this.screenShakeActive = false;
  }

  /**
   * Set performance mode manually
   */
  setPerformanceMode(enabled: boolean): void {
    this.particleSystem.setPerformanceMode(enabled);
  }
}

// Export singleton instance
export const enhancedVisualEffectsManager = EnhancedVisualEffectsManager.getInstance(); 