/**
 * ✨ Effect Pool - Specialized object pool for visual effects
 */

import { ObjectPool } from './ObjectPool';
import type { Effect } from '../../models/gameTypes';

export class EffectPool extends ObjectPool<Effect> {
  constructor() {
    super(
      // Factory function
      () => ({
        id: `effect_${Date.now()}_${Math.random()}`,
        position: { x: 0, y: 0 },
        radius: 10,
        color: '#ffffff',
        life: 0,
        maxLife: 0,
        type: 'explosion',
        opacity: 1,
        scale: 1,
        createdAt: performance.now()
      }),
      // Reset function
      (effect) => {
        effect.position = { x: 0, y: 0 };
        effect.radius = 10;
        effect.color = '#ffffff';
        effect.life = 0;
        effect.maxLife = 0;
        effect.type = 'explosion';
        effect.opacity = 1;
        effect.scale = 1;
        effect.createdAt = performance.now();
      },
      100 // Max pool size
    );
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
  ): Effect {
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
    return effect;
  }
} 