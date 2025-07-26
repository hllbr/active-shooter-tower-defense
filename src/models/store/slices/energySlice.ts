import { GAME_CONSTANTS } from '../../../utils/constants';
import { energyManager, type EnergyCooldownState, type EnergyStats } from '../../../game-systems/EnergyManager';
import { securityManager } from '../../../security/SecurityManager';
import type { StateCreator } from 'zustand';
import type { Store } from '../index';
// Logger import removed for production

let enemyKillListeners: ((isSpecial?: boolean, enemyType?: string) => void)[] = [];
export const addEnemyKillListener = (fn: (isSpecial?: boolean, enemyType?: string) => void): void => {
  enemyKillListeners.push(fn);
};

export const removeEnemyKillListener = (fn: (isSpecial?: boolean, enemyType?: string) => void): void => {
  enemyKillListeners = enemyKillListeners.filter(l => l !== fn);
};

export interface EnergySlice {
  consumeEnergy: (amount: number, action: string) => boolean;
  addEnergy: (amount: number, action?: string) => void;
  clearEnergyWarning: () => void;
  upgradeEnergySystem: (upgradeId: string) => void;
  onEnemyKilled: (isSpecial?: boolean, enemyType?: string) => void;
  tickEnergyRegen: (_deltaTime: number) => void;
  calculateEnergyStats: () => { passiveRegen: number; maxEnergy: number; killBonus: number; efficiency: number };
  getMaxEnergy: () => number;
  getMaxActions: () => number;
  tickActionRegen: (_deltaTime: number) => void;
  addAction: (amount: number) => void;
  addEnemyKillListener: (fn: (isSpecial?: boolean, enemyType?: string) => void) => void;
  removeEnemyKillListener: (fn: (isSpecial?: boolean, enemyType?: string) => void) => void;
  getEnergyCooldownState: () => EnergyCooldownState;
  getEnergyStats: () => EnergyStats;
}

export const createEnergySlice: StateCreator<Store, [], [], EnergySlice> = (set, get, _api) => ({
  consumeEnergy: (amount, action) => {
    const success = energyManager.consume(amount, action, get());
    return success;
  },

  addEnergy: (amount, action) => {
    const validation = securityManager.validateStateChange('addEnergy', {}, { energy: amount });
    if (!validation.valid) {
      // Security: addEnergy blocked
      return;
    }
    energyManager.add(amount, action || 'manual');
  },

  clearEnergyWarning: () => set(() => ({
    energyWarning: null
  })),

  upgradeEnergySystem: (upgradeId) => set((state: Store) => {
    const upgrade = GAME_CONSTANTS.POWER_MARKET.ENERGY_UPGRADES?.find(u => u.id === upgradeId);
    if (!upgrade) return {};
    
    const currentLevel = state.energyUpgrades[upgradeId] || 0;
    const cost = upgrade.cost * Math.pow(1.5, currentLevel);
    
    if (state.gold < cost) return {};
    
    return {
      energyUpgrades: {
        ...state.energyUpgrades,
        [upgradeId]: currentLevel + 1
      },
      gold: state.gold - cost,
      totalGoldSpent: state.totalGoldSpent + cost,
    };
  }),

  onEnemyKilled: (isSpecial, enemyType) => set((state: Store) => {
    const now = performance.now();
    const timeSinceLastKill = now - state.lastKillTime;
    const newCombo = timeSinceLastKill < 3000 ? state.killCombo + 1 : 1;
    let energyBonus = GAME_CONSTANTS.ENERGY_REGEN_KILL || 2;
    
    if (isSpecial) energyBonus *= 2;
    if (newCombo > 5) energyBonus += Math.floor(newCombo / 5);
    
    if (!isNaN(energyBonus) && energyBonus > 0) {
      energyManager.add(energyBonus, 'enemyKill');
    }
    
    // Use setTimeout to avoid blocking the main thread
    setTimeout(() => {
      enemyKillListeners.forEach(fn => fn(isSpecial, enemyType));
    }, 0);
    
    return {
      killCombo: newCombo,
      lastKillTime: now,
      totalKills: state.totalKills + 1,
    };
  }),

  tickEnergyRegen: (_deltaTime) => {
    energyManager.tick(_deltaTime);
  },

  calculateEnergyStats: () => {
    const state = get();
    const baseRegen = GAME_CONSTANTS.ENERGY_REGEN_PASSIVE || 0.5;
    const upgradeMultiplier = 1 + (state.energyUpgrades['passiveRegen'] || 0) * 0.1;
    const baseMax = GAME_CONSTANTS.ENERGY_SYSTEM.MAX_ENERGY_BASE;
    const upgradeBonus = (state.energyUpgrades['maxEnergy'] || 0) * 20;
    const maxEnergy = baseMax + upgradeBonus;
    
    return {
      passiveRegen: baseRegen * upgradeMultiplier,
      maxEnergy,
      killBonus: GAME_CONSTANTS.ENERGY_REGEN_KILL || 2,
      efficiency: state.energyEfficiency || 0,
    };
  },

  getMaxEnergy: () => {
    const state = get();
    const baseMax = GAME_CONSTANTS.ENERGY_SYSTEM.MAX_ENERGY_BASE;
    const upgradeBonus = (state.energyUpgrades['maxEnergy'] || 0) * 20;
    return baseMax + upgradeBonus;
  },

  getMaxActions: () => {
    const state = get();
    const baseActions = GAME_CONSTANTS.ACTION_SYSTEM.BASE_ACTIONS;
    const upgradeBonus = state.maxActionsLevel * 2;
    return baseActions + upgradeBonus;
  },

  tickActionRegen: (_deltaTime) => set((state: Store) => {
    const now = performance.now();
    const timeSinceLastRegen = now - state.lastActionRegen;
    
    if (timeSinceLastRegen >= state.actionRegenTime) {
      const baseActions = GAME_CONSTANTS.ACTION_SYSTEM.BASE_ACTIONS;
      const upgradeBonus = state.maxActionsLevel * 2;
      const maxActions = baseActions + upgradeBonus;
      
      if (state.actionsRemaining < maxActions) {
        return {
          actionsRemaining: Math.min(maxActions, state.actionsRemaining + 1),
          lastActionRegen: now,
        };
      }
    }
    return {};
  }),

  addAction: (amount) => {
    const validation = securityManager.validateStateChange('addAction', {}, { actions: amount });
    if (!validation.valid) {
      // Security: addAction blocked
      return;
    }
    
    const state = get();
    const baseActions = GAME_CONSTANTS.ACTION_SYSTEM.BASE_ACTIONS;
    const upgradeBonus = state.maxActionsLevel * 2;
    const maxActions = baseActions + upgradeBonus;
    
    set({
      actionsRemaining: Math.min(maxActions, state.actionsRemaining + amount)
    });
  },

  addEnemyKillListener: (fn) => {
    enemyKillListeners.push(fn);
  },

  removeEnemyKillListener: (fn) => {
    enemyKillListeners = enemyKillListeners.filter(l => l !== fn);
  },

  getEnergyCooldownState: () => {
    return energyManager.getCooldownState();
  },

  getEnergyStats: () => {
    const baseStats = energyManager.getEnergyStats();
    const calculatedStats = get().calculateEnergyStats();
    
    return {
      ...baseStats,
      efficiency: calculatedStats.efficiency
    };
  },
});
