import type { StateCreator } from 'zustand';
import type { Store } from '../index';
import { gameAnalytics } from '../../../game-systems/analytics/GameAnalyticsManager';

export interface DiceSlice {
  rollDice: () => void;
  resetDice: () => void;
  setDiceResult: (roll: number, multiplier: number) => void;
}

export const createDiceSlice: StateCreator<Store, [], [], DiceSlice> = (set, get, _api) => ({
  rollDice: () => {
    if (get().diceUsed) return;
    set({ isDiceRolling: true });
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const multiplier = roll >= 4 ? (roll === 6 ? 0.5 : roll === 5 ? 0.6 : 0.7) :
                        roll === 3 ? 0.8 : roll === 2 ? 0.9 : 1.0;
      
      // Track analytics event
      gameAnalytics.trackEvent('dice_rolled', {
        roll,
        multiplier,
        wave: get().currentWave
      });
      
      set({
        diceRoll: roll,
        discountMultiplier: multiplier,
        diceUsed: true,
        isDiceRolling: false,
      });
    }, 2000);
  },

  resetDice: () => set(() => ({
    diceRoll: null,
    diceUsed: false,
    discountMultiplier: 1,
    isDiceRolling: false,
  })),

  setDiceResult: (roll, multiplier) => set(() => ({
    diceResult: roll,
    discountMultiplier: multiplier,
  })),
});
