import { GAME_CONSTANTS } from '../utils/Constants';
import type { TowerSlot } from '../models/gameTypes';

export const updateWaveTiles = (wave: number, currentSlots: TowerSlot[]): TowerSlot[] => {
  if (wave === 1) {
    // At the start of the game, initialize all tower slots from the new circular layout.
    // The first few are unlocked by default, the rest can be unlocked by the player.
    return GAME_CONSTANTS.TOWER_SLOTS.map((s, i) => ({
      ...s,
      unlocked: i < GAME_CONSTANTS.INITIAL_SLOT_COUNT,
      type: 'fixed', // Use a single type for a uniform look.
    }));
  }

  // For all subsequent waves, do not change the tower slots.
  return currentSlots;
};
