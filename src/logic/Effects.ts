import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import { Effect, EffectType } from '../models/gameTypes';

export function updateEffects() {
  const { effects, removeEffect } = useGameStore.getState();
  effects.forEach((effect) => {
    effect.life -= GAME_CONSTANTS.GAME_TICK;
    if (effect.life <= 0) {
      removeEffect(effect.id);
    }
  });
}

// Add update method to Effect prototype
function createEffectUpdate() {
  return function update(this: Effect) {
    // Update effect life
    this.life -= 1;
    
    // Remove effect if life is depleted
    if (this.life <= 0) {
      const store = useGameStore.getState();
      store.effects = store.effects.filter(e => e.id !== this.id);
    }
  };
}

// Attach update method to Effect prototype
Object.defineProperty(Effect.prototype, 'update', {
  value: createEffectUpdate(),
  writable: false,
  configurable: true
});

export const createEffect = (x: number, y: number, type: EffectType): Effect => {
  return {
    id: Math.random().toString(),
    position: { x, y },
    radius: 30,
    color: '#ffff00',
    life: 60,
    maxLife: 60,
    type,
    update: createEffectUpdate()
  };
};
