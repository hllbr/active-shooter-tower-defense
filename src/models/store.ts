import { create } from 'zustand';
import type { GameState, Tower, TowerSlot, Enemy, Bullet, Position, Effect } from './gameTypes';
import { GAME_CONSTANTS } from '../utils/Constants';

const initialSlots: TowerSlot[] = GAME_CONSTANTS.TOWER_SLOTS.map((slot, i) => ({
  ...slot,
  unlocked: i === 0, // Only first slot unlocked at start
  tower: undefined,
}));

const initialState: GameState = {
  towers: [],
  towerSlots: initialSlots,
  enemies: [],
  bullets: [],
  effects: [],
  gold: 200,
  currentWave: 1,
  isGameOver: false,
  isStarted: false,
};

type Store = GameState & {
  buildTower: (slotIdx: number) => void;
  upgradeTower: (slotIdx: number) => void;
  damageTower: (slotIdx: number, dmg: number) => void;
  removeTower: (slotIdx: number) => void;
  unlockSlot: (slotIdx: number) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => void;
  addEnemy: (enemy: Enemy) => void;
  removeEnemy: (enemyId: string) => void;
  damageEnemy: (enemyId: string, dmg: number) => void;
  addBullet: (bullet: Bullet) => void;
  removeBullet: (bulletId: string) => void;
  addEffect: (effect: Effect) => void;
  removeEffect: (effectId: string) => void;
  nextWave: () => void;
  resetGame: () => void;
  setStarted: (started: boolean) => void;
};

export const useGameStore = create<Store>((set, get) => ({
  ...initialState,

  buildTower: (slotIdx) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.unlocked || slot.tower || state.gold < GAME_CONSTANTS.TOWER_COST) return {};
    const newTower: Tower = {
      id: `${Date.now()}-${Math.random()}`,
      position: { x: slot.x, y: slot.y },
      size: GAME_CONSTANTS.TOWER_SIZE,
      isActive: true,
      level: 1,
      range: GAME_CONSTANTS.TOWER_RANGE,
      damage: GAME_CONSTANTS.TOWER_DAMAGE,
      fireRate: GAME_CONSTANTS.TOWER_FIRE_RATE,
      lastFired: 0,
      health: GAME_CONSTANTS.TOWER_HEALTH,
    };
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: newTower };
    return {
      towers: [...state.towers, newTower],
      towerSlots: newSlots,
      gold: state.gold - GAME_CONSTANTS.TOWER_COST,
    };
  }),

  upgradeTower: (slotIdx) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower || state.gold < GAME_CONSTANTS.TOWER_UPGRADE_COST || slot.tower.level >= GAME_CONSTANTS.TOWER_MAX_LEVEL) return {};
    const nextLevel = slot.tower.level + 1;
    const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[nextLevel - 1];
    const upgradedTower = {
      ...slot.tower,
      level: nextLevel,
      damage: upgrade.damage,
      fireRate: upgrade.fireRate,
    };
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: upgradedTower };
    return {
      towers: state.towers.map(t => t.id === upgradedTower.id ? upgradedTower : t),
      towerSlots: newSlots,
      gold: state.gold - GAME_CONSTANTS.TOWER_UPGRADE_COST,
    };
  }),

  damageTower: (slotIdx, dmg) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    const newHealth = slot.tower.health - dmg;
    if (newHealth <= 0) {
      const newSlots = [...state.towerSlots];
      newSlots[slotIdx] = { ...slot, tower: undefined };
      return {
        towers: state.towers.filter(t => t.id !== slot.tower!.id),
        towerSlots: newSlots,
      };
    } else {
      const updatedTower = { ...slot.tower, health: newHealth };
      const newSlots = [...state.towerSlots];
      newSlots[slotIdx] = { ...slot, tower: updatedTower };
      return {
        towers: state.towers.map(t => t.id === updatedTower.id ? updatedTower : t),
        towerSlots: newSlots,
      };
    }
  }),

  removeTower: (slotIdx) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: undefined };
    return {
      towers: state.towers.filter(t => t.id !== slot.tower!.id),
      towerSlots: newSlots,
    };
  }),

  unlockSlot: (slotIdx) => set((state) => {
    if (state.towerSlots[slotIdx].unlocked) return {};
    const unlockCost = GAME_CONSTANTS.TOWER_SLOT_UNLOCK_GOLD[slotIdx] || 0;
    if (state.gold < unlockCost) return {};
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...state.towerSlots[slotIdx], unlocked: true };
    return {
      towerSlots: newSlots,
      gold: state.gold - unlockCost,
    };
  }),

  addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
  spendGold: (amount) => set((state) => ({ gold: state.gold - amount })),

  addEnemy: (enemy) => set((state) => ({ enemies: [...state.enemies, enemy] })),
  removeEnemy: (enemyId) => set((state) => ({ enemies: state.enemies.filter(e => e.id !== enemyId) })),
  damageEnemy: (enemyId, dmg) => set((state) => {
    const enemy = state.enemies.find(e => e.id === enemyId);
    if (!enemy) return {};
    const newHealth = enemy.health - dmg;
    if (newHealth <= 0) {
      return {
        enemies: state.enemies.filter(e => e.id !== enemyId),
        gold: state.gold + enemy.goldValue,
      };
    } else {
      return {
        enemies: state.enemies.map(e => e.id === enemyId ? { ...e, health: newHealth } : e),
      };
    }
  }),

  addBullet: (bullet) => set((state) => ({ bullets: [...state.bullets, bullet] })),
  removeBullet: (bulletId) => set((state) => ({ bullets: state.bullets.filter(b => b.id !== bulletId) })),
  addEffect: (effect) => set((state) => ({ effects: [...state.effects, effect] })),
  removeEffect: (effectId) => set((state) => ({ effects: state.effects.filter(e => e.id !== effectId) })),

  nextWave: () => set((state) => ({ currentWave: state.currentWave + 1 })),
  resetGame: () => set(() => ({ ...initialState, towerSlots: initialSlots })),
  setStarted: (started) => set(() => ({ isStarted: started })),
})); 