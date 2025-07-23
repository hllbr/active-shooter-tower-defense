import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerSlot, TowerUpgradeListener, TowerClass } from '../../gameTypes';
import { buildTowerAction } from '../actions/buildTower';
import { unlockSlotAction } from '../actions/unlockSlot';
import type { StateCreator } from 'zustand';
import type { Store } from '../index';
import { towerSynergyManager } from '../../../game-systems/tower-system/TowerSynergyManager';

export interface TowerSlice {
  /** Currently selected tower slot index */
  selectedSlot: number | null;
  /** Set which slot is selected, or clear selection with null */
  selectSlot: (slotIdx: number | null) => void;
  buildTower: (slotIdx: number, free?: boolean, towerType?: 'attack' | 'economy', towerClass?: TowerClass) => void;
  unlockSlot: (slotIdx: number) => void;
  damageTower: (slotIdx: number, dmg: number) => void;
  repairTower: (slotIdx: number) => void;
  removeTower: (slotIdx: number) => void;
  dismantleTower: (slotIdx: number) => void;
  moveTower: (fromIdx: number, toIdx: number) => void;
  buyWall: (slotIdx: number) => void;
  hitWall: (slotIdx: number) => void;
  purchaseShield: (idx: number, free?: boolean) => void;
  upgradeTower: (slotIdx: number) => void;
  upgradeWall: () => void;
  damageWall: (slotIdx: number) => void;
  regenerateWalls: () => void;
  activateFrostEffect: () => void;
  deactivateFrostEffect: () => void;
  performTileAction: (slotIdx: number, action: 'wall' | 'trench' | 'buff') => void;
  addTowerUpgradeListener: (fn: TowerUpgradeListener) => void;
  startSlotUnlockAnimation: (slotIdx: number) => void;
  finishSlotUnlockAnimation: (slotIdx: number) => void;
  clearRecentlyUnlockedSlots: () => void;
  destroyTowerByFire: (slotIdx: number) => void;
}

export const createTowerSlice: StateCreator<Store, [], [], TowerSlice> = (set, _get, _api) => ({
  selectedSlot: null,
  selectSlot: (slotIdx) => set({ selectedSlot: slotIdx }),
  buildTower: (slotIdx, free = false, towerType = 'attack', towerClass?: TowerClass, manual = true) =>
    set((state: Store) => buildTowerAction(state, slotIdx, free, towerType, towerClass, manual)),

  unlockSlot: (slotIdx) => set((state: Store) => unlockSlotAction(state, slotIdx)),

  damageTower: (slotIdx, dmg) => set((state: Store) => {
    const slot = state.towerSlots[slotIdx] as TowerSlot;
    if (!slot.tower) return {};
    if (slot.tower.wallStrength > 0) {
      const newWallStrength = Math.max(0, slot.tower.wallStrength - dmg);
      const newSlots = [...state.towerSlots];
      newSlots[slotIdx] = { ...slot, tower: { ...slot.tower, wallStrength: newWallStrength } };
      return { towerSlots: newSlots };
    }
    const newHealth = slot.tower.health - dmg;
    if (newHealth <= 0) {
      const newSlots = [...state.towerSlots];
      newSlots[slotIdx] = { ...slot, tower: null, wasDestroyed: true };
      const newTowers = state.towers.filter((t) => t.id !== slot.tower!.id);
      const shouldGameOver = newTowers.length === 0 && state.isStarted && !state.isGameOver;
      if (shouldGameOver) {
        import('../../../game-systems/EnemySpawner').then(({ stopEnemyWave }) => { stopEnemyWave(); });
        setTimeout(() => { import('../../../utils/sound').then(({ playContextualSound }) => { playContextualSound('defeat'); }); }, 100);
      }
      return { towerSlots: newSlots, towers: newTowers, lostTowerThisWave: true, isGameOver: shouldGameOver };
    }
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: { ...slot.tower, health: newHealth } };
    return { towerSlots: newSlots };
  }),

  repairTower: (slotIdx) => set((state: Store) => {
    const slot = state.towerSlots[slotIdx] as TowerSlot;
    if (!slot.tower) return {};
    
    // Check if tower needs repair
    if (slot.tower.health >= slot.tower.maxHealth) return {};
    
    // Calculate repair cost based on damage percentage
    const damagePercentage = 1 - (slot.tower.health / slot.tower.maxHealth);
    const baseRepairCost = GAME_CONSTANTS.TOWER_REPAIR_BASE_COST;
    const repairCost = Math.ceil(baseRepairCost * damagePercentage);
    
    // Check if player can afford repair
    if (state.gold < repairCost) return {};
    
    // Check energy cost
    const energyCost = GAME_CONSTANTS.ENERGY_COSTS.buildTower; // Use same energy cost as building
    if (state.energy < energyCost) return {};
    
    // Repair the tower
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { 
      ...slot, 
      tower: { 
        ...slot.tower, 
        health: slot.tower.maxHealth 
      } 
    };
    
    // Play repair sound
    setTimeout(() => {
      import('../../../utils/sound').then(({ playContextualSound }) => {
        playContextualSound('tower-upgrade');
      });
    }, 50);
    
    return { 
      towerSlots: newSlots, 
      gold: state.gold - repairCost,
      energy: state.energy - energyCost,
      totalGoldSpent: state.totalGoldSpent + repairCost
    };
  }),

  removeTower: (slotIdx) => set((state: Store) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: null };
    return { towerSlots: newSlots, towers: state.towers.filter((t) => t.id !== slot.tower!.id) };
  }),

  dismantleTower: (slotIdx) => set((state: Store) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    const refund = Math.floor(GAME_CONSTANTS.TOWER_COST * 0.7);
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: null };
    return { towerSlots: newSlots, towers: state.towers.filter((t) => t.id !== slot.tower!.id), gold: state.gold + refund };
  }),

  moveTower: (fromIdx, toIdx) => set((state: Store) => {
    const fromSlot = state.towerSlots[fromIdx];
    const toSlot = state.towerSlots[toIdx];
    if (!fromSlot.tower || toSlot.tower || !toSlot.unlocked) return {};

    const movedTower = {
      ...fromSlot.tower,
      position: { x: toSlot.x, y: toSlot.y },
      lastRelocated: performance.now()
    };

    const newSlots = [...state.towerSlots];
    newSlots[toIdx] = { ...toSlot, tower: movedTower, locked: true };
    newSlots[fromIdx] = { ...fromSlot, tower: null, locked: false };

    const updatedTowers = state.towers.map(t =>
      t.id === movedTower.id ? movedTower : t
    );

    return { towerSlots: newSlots, towers: updatedTowers };
  }),

  buyWall: (slotIdx) => set((state: Store) => {
    const cost = GAME_CONSTANTS.WALL_COST;
    if (state.gold < cost) return {};
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: { ...slot.tower, wallStrength: 10 } };
    return { towerSlots: newSlots, gold: state.gold - cost, totalGoldSpent: state.totalGoldSpent + cost };
  }),

  hitWall: (slotIdx) => set((state: Store) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower || slot.tower.wallStrength <= 0) return {};
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: { ...slot.tower, wallStrength: slot.tower.wallStrength - 1 } };
    return { towerSlots: newSlots };
  }),

  purchaseShield: (idx, free) => set((state: Store) => {
    const shield = GAME_CONSTANTS.WALL_SHIELDS[idx];
    if (!shield) return {};
    const cost = free ? 0 : shield.cost;
    if (state.gold < cost) return {};
    return { gold: state.gold - cost, shieldUpgradesPurchased: state.shieldUpgradesPurchased + 1, totalGoldSpent: state.totalGoldSpent + cost };
  }),

  upgradeTower: (slotIdx) => set((state: Store) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    const currentLevel = slot.tower.level;
    const cost = GAME_CONSTANTS.TOWER_UPGRADE_COST * currentLevel;
    if (state.gold < cost) return {};
    const upgraded = { ...slot.tower, level: currentLevel + 1 };
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: upgraded };
    // Immediately update synergies after upgrade
    setTimeout(() => {
      towerSynergyManager.updateAllSynergyBonuses(newSlots);
    }, 0);
    // Notify listeners (batched)
    setTimeout(() => {
      const listeners = state.towerUpgradeListeners || [];
      listeners.forEach(fn => {
        try {
          fn(upgraded, currentLevel, upgraded.level);
        } catch {
          // Silent fail for listener errors
        }
      });
    }, 0);
    setTimeout(() => { import('../../../utils/sound').then(({ playContextualSound }) => { playContextualSound('tower-upgrade'); }); }, 50);
    return { towerSlots: newSlots, gold: state.gold - cost, totalGoldSpent: state.totalGoldSpent + cost };
  }),

  upgradeWall: () => set((state: Store) => {
    const currentShieldLevel = state.wallLevel || 0;
    const shield = GAME_CONSTANTS.WALL_SHIELDS[currentShieldLevel];
    
    // Check if shield exists and can be purchased
    if (!shield) return {};
    
    const cost = shield.cost;
    if (state.gold < cost) return {};
    
    // Calculate new wall strength based on shield strength
    const newWallStrength = state.globalWallStrength + shield.strength;
    
    return { 
      wallLevel: state.wallLevel + 1, 
      globalWallStrength: newWallStrength, 
      gold: state.gold - cost, 
      defenseUpgradesPurchased: state.defenseUpgradesPurchased + 1, 
      totalGoldSpent: state.totalGoldSpent + cost,
      shieldUpgradesPurchased: state.shieldUpgradesPurchased + 1 // Also increment shield upgrades counter
    };
  }),

  damageWall: (slotIdx) => set((state: Store) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower || slot.tower.wallStrength <= 0) return {};
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: { ...slot.tower, wallStrength: slot.tower.wallStrength - 1 } };
    if (newSlots[slotIdx].tower?.wallStrength === 0) {
      return { towerSlots: newSlots, lastWallDestroyed: performance.now() };
    }
    return { towerSlots: newSlots };
  }),

  regenerateWalls: () => set((state: Store) => {
    if (!state.wallRegenerationActive) return {};
    const newSlots = state.towerSlots.map(slot => {
      if (slot.tower && slot.tower.wallStrength < 10) {
        return { ...slot, tower: { ...slot.tower, wallStrength: 10 } };
      }
      return slot;
    });
    return { towerSlots: newSlots, wallRegenerationActive: false };
  }),

  activateFrostEffect: () => set(() => ({ frostEffectActive: true, frostEffectStartTime: performance.now() })),
  deactivateFrostEffect: () => set(() => ({ frostEffectActive: false })),

  performTileAction: (slotIdx, action) => set((state: Store) => {
    if (state.actionsRemaining < 1) return {};
    const newSlots = [...state.towerSlots];
    const slot = newSlots[slotIdx];
    slot.modifier = { type: action, expiresAt: Date.now() + 30000 };
    return { towerSlots: newSlots, actionsRemaining: state.actionsRemaining - 1 };
  }),

  addTowerUpgradeListener: (fn) => set((state: Store) => ({ towerUpgradeListeners: [...state.towerUpgradeListeners, fn] })),

  startSlotUnlockAnimation: (slotIdx) => set((state: Store) => ({ unlockingSlots: new Set([...state.unlockingSlots, slotIdx]) })),

  finishSlotUnlockAnimation: (slotIdx) => set((state: Store) => {
    const newUnlocking = new Set(state.unlockingSlots);
    newUnlocking.delete(slotIdx);
    const newRecent = new Set([...state.recentlyUnlockedSlots, slotIdx]);
    return { unlockingSlots: newUnlocking, recentlyUnlockedSlots: newRecent };
  }),

  clearRecentlyUnlockedSlots: () => set(() => ({ recentlyUnlockedSlots: new Set<number>() })),
  
  destroyTowerByFire: (slotIdx: number) => set((state: Store) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: null, wasDestroyed: true };
    const newTowers = state.towers.filter((t) => t.id !== slot.tower!.id);
    const shouldGameOver = newTowers.length === 0 && state.isStarted && !state.isGameOver;
    
    if (shouldGameOver) {
      import('../../../game-systems/EnemySpawner').then(({ stopEnemyWave }) => { stopEnemyWave(); });
      setTimeout(() => { import('../../../utils/sound').then(({ playContextualSound }) => { playContextualSound('defeat'); }); }, 100);
    }
    
    return { towerSlots: newSlots, towers: newTowers, lostTowerThisWave: true, isGameOver: shouldGameOver };
  }),
});
