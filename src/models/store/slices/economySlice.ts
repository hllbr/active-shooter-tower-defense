import { securityManager } from '../../../security/SecurityManager';
import type { StateCreator } from 'zustand';
import type { Store } from '../index';
import { Logger } from '../../../utils/Logger';

export interface EconomySlice {
  addGold: (amount: number) => void;
  spendGold: (amount: number) => void;
  setGold: (amount: number) => void;
  setEnergyBoostLevel: (level: number) => void;
  setMaxActionsLevel: (level: number) => void;
  setEliteModuleLevel: (level: number) => void;
}

export const createEconomySlice: StateCreator<Store, [], [], EconomySlice> = (set, _get, _api) => ({
  addGold: (amount) => {
    const validation = securityManager.validateStateChange('addGold', {}, { gold: amount });
    if (!validation.valid) {
      Logger.warn('🔒 Security: addGold blocked:', validation.reason);
      return;
    }
    set((state: Store) => ({ gold: state.gold + amount }));
  },

  spendGold: (amount) => {
    const validation = securityManager.validateStateChange('spendGold', {}, { gold: amount });
    if (!validation.valid) {
      Logger.warn('🔒 Security: spendGold blocked:', validation.reason);
      return;
    }
    set((state: Store) => ({
      gold: state.gold - amount,
      totalGoldSpent: state.totalGoldSpent + amount,
    }));
  },

  setGold: (amount) => {
    const validation = securityManager.validateStateChange('setGold', {}, { gold: amount });
    if (!validation.valid) {
      Logger.warn('🔒 Security: setGold blocked:', validation.reason);
      return;
    }
    set(() => ({ gold: amount }));
  },

  setEnergyBoostLevel: (level) => set(() => ({ energyBoostLevel: level })),
  setMaxActionsLevel: (level) => set(() => ({ maxActionsLevel: level })),
  setEliteModuleLevel: (level) => set(() => ({ eliteModuleLevel: level })),
});
