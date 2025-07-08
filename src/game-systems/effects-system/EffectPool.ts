/**
 * 🎆 Effect Pooling System
 */

import type { Effect } from '../../models/gameTypes';


// =================== EFFECT POOL ===================

export class EffectPool {
  private pool: Effect[] = [];
  private active: Set<Effect> = new Set();
  private maxPoolSize: number = 100;
  private created: number = 0;
  private reused: number = 0;
  
  /**
   * Get an effect from the pool or create a new one
   */
  acquire(): Effect {
    let effect = this.pool.pop();
    
    if (!effect) {
      effect = {
        id: `effect_${Date.now()}_${Math.random()}`,
        position: { x: 0, y: 0 },
        radius: 10,
        color: '#ffffff',
        life: 0,
        maxLife: 1000,
        type: 'explosion',
        opacity: 1,
        scale: 1,
        createdAt: performance.now()
      };
      this.created++;
    } else {
      this.reused++;
    }
    
    this.active.add(effect);
    return effect;
  }
  
  /**
   * Return an effect to the pool
   */
  release(effect: Effect): void {
    if (!this.active.has(effect)) {
      return;
    }
    
    this.active.delete(effect);
    
    // Reset effect properties
    effect.position = { x: 0, y: 0 };
    effect.radius = 10;
    effect.color = '#ffffff';
    effect.life = 0;
    effect.maxLife = 1000;
    effect.type = 'explosion';
    effect.opacity = 1;
    effect.scale = 1;
    effect.createdAt = performance.now();
    
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(effect);
    }
  }
  
  /**
   * Create a configured effect
   */
  createEffect(
    type: string,
    position: { x: number; y: number },
    duration: number = 1000
  ): Effect {
    const effect = this.acquire();
    effect.id = `effect_${Date.now()}_${Math.random()}`;
    effect.type = type;
    effect.position = { ...position };
    effect.life = duration;
    effect.maxLife = duration;
    effect.opacity = 1;
    effect.scale = 1;
    return effect;
  }
  
  /**
   * Clear all pooled effects
   */
  clear(): void {
    this.pool.length = 0;
    this.active.clear();
  }
  
  /**
   * Get pool statistics
   */
  getStats(): {
    poolSize: number;
    activeCount: number;
    created: number;
    reused: number;
    reuseRate: number;
  } {
    return {
      poolSize: this.pool.length,
      activeCount: this.active.size,
      created: this.created,
      reused: this.reused,
      reuseRate: this.created > 0 ? (this.reused / (this.created + this.reused)) * 100 : 0
    };
  }
}

// =================== GLOBAL INSTANCE ===================

export const effectPool = new EffectPool(); 