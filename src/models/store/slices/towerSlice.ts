import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerSlot } from '../../gameTypes';

export interface TowerSlice {
  damageTower: (slotIdx: number, dmg: number) => void;
  removeTower: (slotIdx: number) => void;
  dismantleTower: (slotIdx: number) => void;
  moveTower: (fromIdx: number, toIdx: number) => void;
  buyWall: (slotIdx: number) => void;
  hitWall: (slotIdx: number) => void;
  purchaseShield: (idx: number, free?: boolean) => void;
}

export const createTowerSlice = (set: any, get: any): TowerSlice => ({
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
        import('../../../game-systems/EnemySpawner').then(({ stopEnemyWave }) => {
          stopEnemyWave();
        });
        setTimeout(() => {
          import('../../../utils/sound').then(({ playContextualSound }) => {
            playContextualSound('defeat');
          });
        }, 100);
      }

      return {
        towerSlots: newSlots,
        towers: newTowers,
        lostTowerThisWave: true,
        isGameOver: shouldGameOver,
      };
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
    return {
      towerSlots: newSlots,
      towers: state.towers.filter((t: any) => t.id !== slot.tower!.id),
    };
  }),

  dismantleTower: (slotIdx) => set((state: any) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    const refund = Math.floor(GAME_CONSTANTS.TOWER_COST * 0.7);
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: null };
    return {
      towerSlots: newSlots,
      towers: state.towers.filter((t: any) => t.id !== slot.tower!.id),
      gold: state.gold + refund,
    };
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
    return {
      towerSlots: newSlots,
      gold: state.gold - cost,
      totalGoldSpent: state.totalGoldSpent + cost,
    };
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
    return {
      gold: state.gold - cost,
      shieldUpgradesPurchased: state.shieldUpgradesPurchased + 1,
      totalGoldSpent: state.totalGoldSpent + cost,
    };
  }),
});
