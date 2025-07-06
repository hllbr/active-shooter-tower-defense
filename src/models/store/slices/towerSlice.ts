import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerSlot, TowerUpgradeListener } from '../../gameTypes';
import { buildTowerAction } from '../actions/buildTower';
import { unlockSlotAction } from '../actions/unlockSlot';

export interface TowerSlice {
  buildTower: (slotIdx: number, free?: boolean, towerType?: 'attack' | 'economy', towerClass?: string) => void;
  unlockSlot: (slotIdx: number) => void;
  damageTower: (slotIdx: number, dmg: number) => void;
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
}

export const createTowerSlice = (set: any, get: any): TowerSlice => ({
  buildTower: (slotIdx, free = false, towerType = 'attack', towerClass?: string) =>
    set((state: any) => buildTowerAction(state, slotIdx, free, towerType, towerClass)),

  unlockSlot: (slotIdx) => set((state: any) => unlockSlotAction(state, slotIdx)),

  damageTower: (slotIdx, dmg) => set((state: any) => {
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
      const newTowers = state.towers.filter((t: any) => t.id !== slot.tower!.id);
      const shouldGameOver = newTowers.length === 0 && state.isStarted && !state.isGameOver;
      if (shouldGameOver) {
        console.log('\uD83D\uDC80 Game Over: All towers destroyed!');
        import('../../../game-systems/EnemySpawner').then(({ stopEnemyWave }) => { stopEnemyWave(); });
        setTimeout(() => { import('../../../utils/sound').then(({ playContextualSound }) => { playContextualSound('defeat'); }); }, 100);
      }
      return { towerSlots: newSlots, towers: newTowers, lostTowerThisWave: true, isGameOver: shouldGameOver };
    }
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: { ...slot.tower, health: newHealth } };
    return { towerSlots: newSlots };
  }),

  removeTower: (slotIdx) => set((state: any) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: null };
    return { towerSlots: newSlots, towers: state.towers.filter((t: any) => t.id !== slot.tower!.id) };
  }),

  dismantleTower: (slotIdx) => set((state: any) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    const refund = Math.floor(GAME_CONSTANTS.TOWER_COST * 0.7);
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: null };
    return { towerSlots: newSlots, towers: state.towers.filter((t: any) => t.id !== slot.tower!.id), gold: state.gold + refund };
  }),

  moveTower: (fromIdx, toIdx) => set((state: any) => {
    const fromSlot = state.towerSlots[fromIdx];
    const toSlot = state.towerSlots[toIdx];
    if (!fromSlot.tower || toSlot.tower || !toSlot.unlocked) return {};
    const newSlots = [...state.towerSlots];
    newSlots[toIdx] = { ...toSlot, tower: fromSlot.tower };
    newSlots[fromIdx] = { ...fromSlot, tower: null };
    return { towerSlots: newSlots };
  }),

  buyWall: (slotIdx) => set((state: any) => {
    const cost = GAME_CONSTANTS.WALL_COST;
    if (state.gold < cost) return {};
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: { ...slot.tower, wallStrength: 10 } };
    return { towerSlots: newSlots, gold: state.gold - cost, totalGoldSpent: state.totalGoldSpent + cost };
  }),

  hitWall: (slotIdx) => set((state: any) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower || slot.tower.wallStrength <= 0) return {};
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: { ...slot.tower, wallStrength: slot.tower.wallStrength - 1 } };
    return { towerSlots: newSlots };
  }),

  purchaseShield: (idx, free) => set((state: any) => {
    const shield = GAME_CONSTANTS.WALL_SHIELDS[idx];
    if (!shield) return {};
    const cost = free ? 0 : shield.cost;
    if (state.gold < cost) return {};
    return { gold: state.gold - cost, shieldUpgradesPurchased: state.shieldUpgradesPurchased + 1, totalGoldSpent: state.totalGoldSpent + cost };
  }),

  upgradeTower: (slotIdx) => set((state: any) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    const currentLevel = slot.tower.level;
    const cost = GAME_CONSTANTS.TOWER_UPGRADE_COST * currentLevel;
    if (state.gold < cost) return {};
    const upgraded = { ...slot.tower, level: currentLevel + 1 };
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: upgraded };
    setTimeout(() => { import('../../../utils/sound').then(({ playContextualSound }) => { playContextualSound('tower-upgrade'); }); }, 50);
    return { towerSlots: newSlots, gold: state.gold - cost, totalGoldSpent: state.totalGoldSpent + cost };
  }),

  upgradeWall: () => set((state: any) => {
    const cost = 200 * (state.wallLevel + 1);
    if (state.gold < cost) return {};
    return { wallLevel: state.wallLevel + 1, globalWallStrength: 10 + state.wallLevel * 5, gold: state.gold - cost, defenseUpgradesPurchased: state.defenseUpgradesPurchased + 1, totalGoldSpent: state.totalGoldSpent + cost };
  }),

  damageWall: (slotIdx) => set((state: any) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower || slot.tower.wallStrength <= 0) return {};
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: { ...slot.tower, wallStrength: slot.tower.wallStrength - 1 } };
    if (newSlots[slotIdx].tower?.wallStrength === 0) {
      return { towerSlots: newSlots, lastWallDestroyed: performance.now() };
    }
    return { towerSlots: newSlots };
  }),

  regenerateWalls: () => set((state: any) => {
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

  performTileAction: (slotIdx, action) => set((state: any) => {
    if (state.actionsRemaining < 1) return {};
    const newSlots = [...state.towerSlots];
    const slot = newSlots[slotIdx];
    slot.modifier = { type: action, expiresAt: Date.now() + 30000 };
    return { towerSlots: newSlots, actionsRemaining: state.actionsRemaining - 1 };
  }),

  addTowerUpgradeListener: (fn) => set((state: any) => ({ towerUpgradeListeners: [...state.towerUpgradeListeners, fn] })),

  startSlotUnlockAnimation: (slotIdx) => set((state: any) => ({ unlockingSlots: new Set([...state.unlockingSlots, slotIdx]) })),

  finishSlotUnlockAnimation: (slotIdx) => set((state: any) => {
    const newUnlocking = new Set(state.unlockingSlots);
    newUnlocking.delete(slotIdx);
    const newRecent = new Set([...state.recentlyUnlockedSlots, slotIdx]);
    return { unlockingSlots: newUnlocking, recentlyUnlockedSlots: newRecent };
  }),

  clearRecentlyUnlockedSlots: () => set(() => ({ recentlyUnlockedSlots: new Set<number>() })),
});
