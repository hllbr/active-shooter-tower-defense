import { GAME_CONSTANTS } from '../../../utils/constants';
import type { Mine, Position, TowerSlot, MineConfig } from '../../gameTypes';
import type { StateCreator } from 'zustand';
import type { Store } from '../index';

export interface MineSlice {
  upgradeMines: () => void;
  deployMines: () => void;
  deploySpecializedMine: (mineType: 'explosive' | 'utility' | 'area_denial', mineSubtype: string, position?: Position) => void;
  triggerMine: (mineId: string) => void;
}

const getValidMinePosition = (towerSlots: TowerSlot[]): Position => {
  let position: Position;
  let isTooClose;
  const { MINE_MIN_DISTANCE_FROM_TOWER } = GAME_CONSTANTS;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 80;
  do {
    position = {
      x: Math.random() * (viewportWidth - margin * 2) + margin,
      y: Math.random() * (viewportHeight - margin * 2) + margin,
    };
    isTooClose = towerSlots.some(
      (slot) => Math.hypot(position.x - slot.x, position.y - slot.y) < MINE_MIN_DISTANCE_FROM_TOWER,
    );
  } while (isTooClose);
  return position;
};

export const createMineSlice: StateCreator<Store, [], [], MineSlice> = (set, _get, _api) => ({
  upgradeMines: () => set((state: Store) => {
    const cost = 100;
    if (state.gold < cost) return {};
    return {
      mineLevel: state.mineLevel + 1,
      gold: state.gold - cost,
      defenseUpgradesPurchased: state.defenseUpgradesPurchased + 1,
      totalGoldSpent: state.totalGoldSpent + cost,
    };
  }),

  deployMines: () => set((state: Store) => {
    if (state.mineLevel === 0) return {};
    const newMines: Mine[] = [];
    const mineCount = Math.min(state.mineLevel, 5);
    for (let i = 0; i < mineCount; i++) {
      newMines.push({
        id: `mine-${Date.now()}-${i}`,
        position: getValidMinePosition(state.towerSlots),
        damage: 50 + (state.mineLevel * 10),
        size: 20,
        radius: 50,
        mineType: 'explosive',
        mineSubtype: 'standard',
        triggerCondition: 'contact',
        isActive: true,
        placedAt: Date.now(),
      });
    }
    return { mines: newMines };
  }),

  deploySpecializedMine: (mineType, mineSubtype, position) => set((state: Store) => {
    const mineTypeConfig = GAME_CONSTANTS.MINE_TYPES[mineType];
    if (!mineTypeConfig) return {};
    const mineConfig = mineTypeConfig[mineSubtype as keyof typeof mineTypeConfig] as MineConfig;
    if (!mineConfig) return {};
    const typeCount = state.mines.filter((m: Mine) => m.mineType === mineType).length;
    const maxForType = GAME_CONSTANTS.MINE_PLACEMENT_LIMITS.MAX_MINES_PER_TYPE[mineType];
    const totalMines = state.mines.length;
    if (typeCount >= maxForType || totalMines >= GAME_CONSTANTS.MINE_PLACEMENT_LIMITS.MAX_MINES_PER_WAVE) {
      return {};
    }
    if (state.gold < mineConfig.cost) return {};
    const minePosition = position || getValidMinePosition(state.towerSlots);
    const tooCloseToExisting = state.mines.some((existing: Mine) => {
      const distance = Math.hypot(
        minePosition.x - existing.position.x,
        minePosition.y - existing.position.y,
      );
      return distance < GAME_CONSTANTS.MINE_PLACEMENT_LIMITS.MIN_DISTANCE_BETWEEN_MINES;
    });
    if (tooCloseToExisting) return {};
    const newMine: Mine = {
      id: `mine-${Date.now()}-${mineType}-${mineSubtype}`,
      position: minePosition,
      damage: mineConfig.damage || 0,
      size: 20,
      radius: mineConfig.radius || 50,
      mineType,
      mineSubtype: mineSubtype as Mine['mineSubtype'],
      triggerCondition: mineConfig.triggerCondition || 'contact',
      isActive: true,
      placedAt: Date.now(),
      duration: mineConfig.duration,
      remainingDuration: mineConfig.duration,
      slowMultiplier: mineConfig.slowMultiplier,
      effects: mineConfig.effects,
      empDuration: mineConfig.empDuration,
      smokeDuration: mineConfig.smokeDuration,
      freezeDuration: mineConfig.freezeDuration,
    };
    return {
      mines: [...state.mines, newMine],
      gold: state.gold - mineConfig.cost,
      totalGoldSpent: state.totalGoldSpent + mineConfig.cost,
    };
  }),

  triggerMine: (mineId) => set((state: Store) => ({
    mines: state.mines.filter((m: Mine) => m.id !== mineId)
  })),
});
