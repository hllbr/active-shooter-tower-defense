/**
 * 🎨 Simple Effect Renderer
 * Replaces complex SVG animations with clean, fast canvas-based effects
 */

import { SimplifiedParticleSystem } from './SimplifiedParticleSystem';

export interface VisualEffect {
  id: string;
  x: number;
  y: number;
  type: 'tower-shoot' | 'enemy-hit' | 'tower-place' | 'weather-effect' | 'boss-ability';
  duration: number;
  timeRemaining: number;
  intensity: number;
  color: string;
}

export class EffectRenderer {
  private particleSystem: SimplifiedParticleSystem;
  private activeEffects: VisualEffect[] = [];
  private effectId = 0;

  constructor() {
    this.particleSystem = new SimplifiedParticleSystem();
  }

  /**
   * Create a simple shooting effect from tower to target
   */
  createShootingEffect(fromX: number, fromY: number, toX: number, toY: number, towerType: string): void {
    // Simple muzzle flash particles
    this.particleSystem.createEffect(fromX, fromY, 'spark', {
      count: 2,
      spread: 30,
      speed: 1,
      life: 200,
      colors: this.getTowerEffectColors(towerType)
    });

    // Simple hit effect at target
    setTimeout(() => {
      this.particleSystem.createEffect(toX, toY, 'damage', {
        count: 3,
        colors: this.getTowerEffectColors(towerType)
      });
    }, 100); // Simple projectile travel time
  }

  /**
   * Create explosion effect
   */
  createExplosionEffect(x: number, y: number, radius: number): void {
    const config = SimplifiedParticleSystem.createExplosionEffect(x, y, radius);
    this.particleSystem.createEffect(x, y, 'explosion', config);
  }

  /**
   * Create tower placement effect
   */
  createTowerPlacementEffect(x: number, y: number): void {
    this.particleSystem.createEffect(x, y, 'spark', {
      count: 8,
      spread: 360,
      speed: 2,
      life: 600,
      colors: ['#10B981', '#34D399', '#6EE7B7']
    });
  }

  /**
   * Create enemy damage effect
   */
  createEnemyDamageEffect(x: number, y: number, damage: number): void {
    const config = SimplifiedParticleSystem.createDamageEffect(x, y, damage);
    this.particleSystem.createEffect(x, y, 'damage', config);
  }

  /**
   * Create status effect (slow, freeze, heal)
   */
  createStatusEffect(x: number, y: number, type: 'slow' | 'freeze' | 'heal'): void {
    const config = SimplifiedParticleSystem.createStatusEffect(type);
    this.particleSystem.createEffect(x, y, type, config);
  }

  /**
   * Create weather effect particles
   */
  createWeatherEffect(x: number, y: number, weatherType: string): void {
    const weatherConfigs = {
      'explosion-rain': {
        type: 'explosion' as const,
        count: 4,
        colors: ['#EF4444', '#F87171', '#FCA5A5']
      },
      'lightning-storm': {
        type: 'spark' as const,
        count: 6,
        colors: ['#FDE047', '#FACC15', '#EAB308']
      },
      'slow-mist': {
        type: 'slow' as const,
        count: 8,
        colors: ['#6B7280', '#9CA3AF', '#D1D5DB']
      },
      'frost-wave': {
        type: 'freeze' as const,
        count: 10,
        colors: ['#06B6D4', '#67E8F9', '#A5F3FC']
      },
      'time-slow': {
        type: 'spark' as const,
        count: 5,
        colors: ['#8B5CF6', '#A78BFA', '#C4B5FD']
      },
      'healing-rain': {
        type: 'heal' as const,
        count: 6,
        colors: ['#10B981', '#34D399', '#6EE7B7']
      }
    };

    const config = weatherConfigs[weatherType as keyof typeof weatherConfigs];
    if (config) {
      this.particleSystem.createEffect(x, y, config.type, {
        count: config.count,
        colors: config.colors,
        spread: 360,
        life: 1000
      });
    }
  }

  /**
   * Simple boss ability effect
   */
  createBossAbilityEffect(x: number, y: number, abilityType: string): void {
    const bossConfigs = {
      'charge': {
        type: 'explosion' as const,
        count: 12,
        colors: ['#DC2626', '#EF4444', '#F87171']
      },
      'slam': {
        type: 'explosion' as const,
        count: 15,
        colors: ['#92400E', '#D97706', '#F59E0B']
      },
      'missile': {
        type: 'spark' as const,
        count: 8,
        colors: ['#FCD34D', '#F59E0B', '#D97706']
      }
    };

    const config = bossConfigs[abilityType as keyof typeof bossConfigs];
    if (config) {
      this.particleSystem.createEffect(x, y, config.type, {
        count: config.count,
        colors: config.colors,
        spread: 360,
        speed: 3
      });
    }
  }

  /**
   * Update all effects and particles
   */
  update(deltaTime: number): void {
    this.particleSystem.update(deltaTime);

    // Update visual effects
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      effect.timeRemaining -= deltaTime;
      
      if (effect.timeRemaining <= 0) {
        this.activeEffects.splice(i, 1);
      }
    }
  }

  /**
   * Render all effects
   */
  render(ctx: CanvasRenderingContext2D): void {
    this.particleSystem.render(ctx);
    this.renderVisualEffects(ctx);
  }

  /**
   * Render simple visual effects (circles, flashes)
   */
  private renderVisualEffects(ctx: CanvasRenderingContext2D): void {
    if (this.activeEffects.length === 0) return;

    ctx.save();
    
    for (const effect of this.activeEffects) {
      const progress = 1 - (effect.timeRemaining / effect.duration);
      const alpha = Math.sin(progress * Math.PI); // Fade in and out
      
      ctx.globalAlpha = alpha * 0.6;
      ctx.fillStyle = effect.color;
      
      // Simple circle effect
      const size = effect.intensity * (1 + progress * 0.5);
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * Get tower-specific effect colors
   */
  private getTowerEffectColors(towerType: string): string[] {
    const colorMap = {
      'basic': ['#9CA3AF', '#D1D5DB'],
      'sniper': ['#EF4444', '#F87171'],
      'explosive': ['#F59E0B', '#FCD34D'],
      'laser': ['#06B6D4', '#67E8F9'],
      'plasma': ['#8B5CF6', '#A78BFA']
    };
    
    return colorMap[towerType as keyof typeof colorMap] || colorMap.basic;
  }

  /**
   * Get current particle count for performance monitoring
   */
  getParticleCount(): number {
    return this.particleSystem.getParticleCount();
  }

  /**
   * Clear all effects
   */
  clear(): void {
    this.particleSystem.clear();
    this.activeEffects.length = 0;
  }
} 