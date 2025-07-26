import { securityManager } from '../../../security/SecurityManager';
import type { StateCreator } from 'zustand';
import type { Store } from '../index';
import type { ResourceSource } from '../../gameTypes';
// Logger import removed for production
import { transactionQueue } from '../TransactionQueue';

export interface EconomySlice {
  addGold: (amount: number, source?: string) => void;
  spendGold: (amount: number, source?: string) => boolean;
  setGold: (amount: number, source?: string) => void;
  setEnergyBoostLevel: (level: number) => void;
  setMaxActionsLevel: (level: number) => void;
  setEliteModuleLevel: (level: number) => void;
  purchaseTransaction: (amount: number, callback: () => void, source?: string) => Promise<boolean>;
}

export const createEconomySlice: StateCreator<Store, [], [], EconomySlice> = (set, _get, _api) => ({
  addGold: (amount, source = 'manual') => {
    const validation = securityManager.validateStateChange('addGold', {}, { gold: amount });
    if (!validation.valid) {
      // Security: addGold blocked
      return;
    }
    
    // Use the new resource system if available
    const { addResource } = _get();
    if (addResource) {
      addResource(amount, source as ResourceSource, { originalAmount: amount });
    } else {
      set((state: Store) => ({ gold: state.gold + amount }));
    }
  },

  spendGold: (amount, source = 'purchase') => {
    const validation = securityManager.validateStateChange('spendGold', {}, { gold: amount });
    if (!validation.valid) {
      // Security: spendGold blocked
      return false;
    }
    
    // Check if we have enough gold before spending
    const currentGold = _get().gold;
    if (currentGold < amount) {
      // Insufficient gold for purchase
      return false;
    }
    
    // Use the new resource system if available
    const { spendResource } = _get();
    if (spendResource) {
      return spendResource(amount, source as ResourceSource, { originalAmount: amount });
    } else {
      set((state: Store) => ({
        gold: state.gold - amount,
        totalGoldSpent: state.totalGoldSpent + amount,
      }));
      return true;
    }
  },

  setGold: (amount) => {
    const validation = securityManager.validateStateChange('setGold', {}, { gold: amount });
    if (!validation.valid) {
      // Security: setGold blocked
      return;
    }
    set(() => ({ gold: amount }));
  },

  setEnergyBoostLevel: (level) => set(() => ({ energyBoostLevel: level })),
  setMaxActionsLevel: (level) => set(() => ({ maxActionsLevel: level })),
  setEliteModuleLevel: (level) => set(() => ({ eliteModuleLevel: level })),

  purchaseTransaction: (amount, callback) => {
    return transactionQueue.queueResourceTransaction(async () => {
      const { spendResource } = _get();
      // Atomic spend
      const spent = spendResource ? spendResource(amount, 'purchase', { originalAmount: amount }) : false;
      if (!spent) {
        // Transaction failed: insufficient funds
        return false;
      }
      try {
        await Promise.resolve(callback());
        // Purchase transaction successful
        return true;
      } catch (error) {
        // Rollback if callback fails
        const { addResource } = _get();
        if (addResource) addResource(amount, 'refund', { originalAmount: amount });
        // Purchase transaction failed, rolled back
        return false;
      }
    });
  },
});
