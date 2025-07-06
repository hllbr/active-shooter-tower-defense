export interface EconomySlice {
  addGold: (amount: number) => void;
  spendGold: (amount: number) => void;
  setGold: (amount: number) => void;
  setEnergyBoostLevel: (level: number) => void;
  setMaxActionsLevel: (level: number) => void;
  setEliteModuleLevel: (level: number) => void;
}

import { securityManager } from '../../../security/SecurityManager';

export const createEconomySlice = (set: any, _get: any): EconomySlice => ({
  addGold: (amount) => {
    const validation = securityManager.validateStateChange('addGold', {}, { gold: amount });
    if (!validation.valid) {
      console.warn('\uD83D\uDD12 Security: addGold blocked:', validation.reason);
      securityManager.logSecurityEvent('state_manipulation_attempt', {
        action: 'addGold',
        amount,
        reason: validation.reason
      }, 'high');
      return;
    }
    set((state: any) => ({ gold: state.gold + amount }));
  },

  spendGold: (amount) => {
    const validation = securityManager.validateStateChange('spendGold', {}, { gold: amount });
    if (!validation.valid) {
      console.warn('\uD83D\uDD12 Security: spendGold blocked:', validation.reason);
      securityManager.logSecurityEvent('state_manipulation_attempt', {
        action: 'spendGold',
        amount,
        reason: validation.reason
      }, 'high');
      return;
    }
    set((state: any) => ({
      gold: state.gold - amount,
      totalGoldSpent: state.totalGoldSpent + amount,
    }));
  },

  setGold: (amount) => {
    const validation = securityManager.validateStateChange('setGold', {}, { gold: amount });
    if (!validation.valid) {
      console.warn('\uD83D\uDD12 Security: setGold blocked:', validation.reason);
      securityManager.logSecurityEvent('state_manipulation_attempt', {
        action: 'setGold',
        amount,
        reason: validation.reason
      }, 'critical');
      return;
    }
    set(() => ({ gold: amount }));
  },

  setEnergyBoostLevel: (level) => set(() => ({ energyBoostLevel: level })),
  setMaxActionsLevel: (level) => set(() => ({ maxActionsLevel: level })),
  setEliteModuleLevel: (level) => set(() => ({ eliteModuleLevel: level })),
});
