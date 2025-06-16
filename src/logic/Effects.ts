import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';

export function updateEffects() {
  const { effects, removeEffect } = useGameStore.getState();
  effects.forEach((effect) => {
    effect.life -= GAME_CONSTANTS.GAME_TICK;
    if (effect.life <= 0) {
      removeEffect(effect.id);
    }
  });
}
