/**
 * ✨ Advanced Effect Pool - Enhanced object pool for visual effects
 */

import { AdvancedObjectPool } from './AdvancedObjectPool';
import type { AdvancedPoolConfig } from './AdvancedObjectPool';

export interface AdvancedEffect {
  id: string;
  position: { x: number; y: number };
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  type: string;
  opacity: number;
  scale: number;
  createdAt: number;
  isActive: boolean;
  reset(): void;
}

export class AdvancedEffectPool {
  private pool: AdvancedObjectPool<AdvancedEffect>;
  
  constructor() {
    const config: AdvancedPoolConfig<AdvancedEffect> = {
      createObject: () => ({
        id: `effect_${Date.now()}_${Math.random()}`,
        position: { x: 0, y: 0 },
        radius: 10,
        color: '#ffffff',
        life: 0,
        maxLife: 1000,
        type: 'explosion',
        opacity: 1,
        scale: 1,
        createdAt: performance.now(),
        isActive: false,
        reset() {
          this.position = { x: 0, y: 0 };
          this.radius = 10;
          this.color = '#ffffff';
          this.life = 0;
          this.maxLife = 1000;
          this.type = 'explosion';
          this.opacity = 1;
          this.scale = 1;
          this.createdAt = performance.now();
          this.isActive = false;
        }
      }),
      resetObject: (effect) => effect.reset(),
      initialSize: 30,
      maxPoolSize: 100,
      maxIdleTime: 45000, // 45 seconds
      autoShrinkInterval: 15000, // 15 seconds
      createIfEmpty: true,
      autoReturnDelay: 2000, // 2 seconds
      preWarmPercent: 0.6
    };
    
    this.pool = AdvancedObjectPool.getInstance('effect-pool', config);
  }
  
  /**
   * Acquire an effect from the pool
   */
  acquire(): AdvancedEffect {
    return this.pool.acquire();
  }
  
  /**
   * Release an effect back to the pool
   */
  release(effect: AdvancedEffect): void {
    this.pool.release(effect);
  }
  
  /**
   * Create a configured effect
   */
  createEffect(
    type: string,
    position: { x: number; y: number },
    duration: number = 1000,
    radius: number = 10,
    color: string = '#ffffff'
  ): AdvancedEffect {
    const effect = this.acquire();
    effect.id = `effect_${Date.now()}_${Math.random()}`;
    effect.type = type;
    effect.position = { ...position };
    effect.radius = radius;
    effect.color = color;
    effect.life = duration;
    effect.maxLife = duration;
    effect.opacity = 1;
    effect.scale = 1;
    effect.createdAt = performance.now();
    effect.isActive = true;
    return effect;
  }
  
  /**
   * Get pool statistics
   */
  getStats() {
    return this.pool.getStats();
  }
  
  /**
   * Clear all effects
   */
  clear(): void {
    this.pool.clear();
  }
  
  /**
   * Release all active effects
   */
  releaseAll(): void {
    this.pool.releaseAll();
  }
}

// Global singleton instance
export const advancedEffectPool = new AdvancedEffectPool(); 