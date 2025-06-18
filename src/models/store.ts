import { create } from 'zustand';
import type { GameState, Tower, TowerSlot, Enemy, Bullet, Position, Effect } from './gameTypes';
import { GAME_CONSTANTS } from '../utils/Constants';

const initialSlots: TowerSlot[] = GAME_CONSTANTS.TOWER_SLOTS.slice(
  0,
  GAME_CONSTANTS.INITIAL_SLOT_COUNT,
).map((slot) => ({
  ...slot,
  unlocked: true,
  tower: undefined,
  wasDestroyed: false,
}));

const initialState: GameState = {
  towers: [],
  towerSlots: initialSlots,
  enemies: [],
  bullets: [],
  effects: [],
  gold: 200,
  bulletLevel: 1,
  currentWave: 1,
  maxTowers: GAME_CONSTANTS.INITIAL_TOWER_LIMIT,
  globalWallStrength: 0,
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
  buyWall: (slotIdx: number) => void;
  hitWall: (slotIdx: number) => void;
  purchaseShield: (idx: number) => void;
  nextWave: () => void;
  resetGame: () => void;
  setStarted: (started: boolean) => void;
  upgradeBullet: () => void;
  refreshBattlefield: (slots: number) => void;
};

export const useGameStore = create<Store>((set, get) => ({
  ...initialState,

  buildTower: (slotIdx) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (
      slot.tower ||
      state.gold < GAME_CONSTANTS.TOWER_COST ||
      state.towers.length >= state.maxTowers
    )
      return {};
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
      wallStrength: state.globalWallStrength,
    };
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: newTower, wasDestroyed: false };
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

  damageTower: (slotIdx, dmg) => {
    const { towerSlots, isStarted, addEffect } = get();
    const slot = towerSlots[slotIdx];
    if (!slot.tower) return;
    const newHealth = slot.tower.health - dmg;
    if (newHealth <= 0) {
      const effect: Effect = {
        id: `${Date.now()}-${Math.random()}`,
        position: { x: slot.x, y: slot.y },
        radius: 60,
        color: '#ff3333',
        life: 600,
        maxLife: 600,
      };
      set((state) => {
        const newSlots = [...state.towerSlots];
        newSlots[slotIdx] = { ...slot, tower: undefined, wasDestroyed: true };
        return {
          towers: state.towers.filter(t => t.id !== slot.tower!.id),
          towerSlots: newSlots,
        };
      });
      addEffect(effect);
      const remaining = get().towerSlots.some(s => s.tower);
      if (isStarted && !remaining) {
        set(() => ({ isGameOver: true }));
      }
    } else {
      set((state) => {
        const updatedTower = { ...slot.tower!, health: newHealth };
        const newSlots = [...state.towerSlots];
        newSlots[slotIdx] = { ...slot, tower: updatedTower };
        return {
          towers: state.towers.map(t => t.id === updatedTower.id ? updatedTower : t),
          towerSlots: newSlots,
        };
      });
    }
  },

  removeTower: (slotIdx) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: undefined, wasDestroyed: false };
    return {
      towers: state.towers.filter(t => t.id !== slot.tower!.id),
      towerSlots: newSlots,
    };
  }),

  unlockSlot: () => {},

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

  buyWall: (slotIdx) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    if (state.gold < GAME_CONSTANTS.WALL_COST) return {};
    const updatedTower = { ...slot.tower, wallStrength: slot.tower.wallStrength + 1 };
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: updatedTower };
    return {
      towers: state.towers.map(t => t.id === updatedTower.id ? updatedTower : t),
      towerSlots: newSlots,
      gold: state.gold - GAME_CONSTANTS.WALL_COST,
    };
  }),

  hitWall: (slotIdx) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower || slot.tower.wallStrength <= 0) return {};
    const updatedTower = { ...slot.tower, wallStrength: slot.tower.wallStrength - 1 };
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: updatedTower };
    return {
      towers: state.towers.map(t => t.id === updatedTower.id ? updatedTower : t),
      towerSlots: newSlots,
    };
  }),

  purchaseShield: (idx) => set((state) => {
    const shield = GAME_CONSTANTS.WALL_SHIELDS[idx];
    if (!shield || state.gold < shield.cost) return {};
    const newSlots = state.towerSlots.map((s) =>
      s.tower ? { ...s, tower: { ...s.tower, wallStrength: s.tower.wallStrength + shield.strength } } : s,
    );
    return {
      towerSlots: newSlots,
      globalWallStrength: state.globalWallStrength + shield.strength,
      gold: state.gold - shield.cost,
    };
  }),

  nextWave: () => set((state) => ({ currentWave: state.currentWave + 1 })),
  resetGame: () => set(() => ({ ...initialState, towerSlots: initialSlots })),
  setStarted: (started) => set(() => ({ isStarted: started })),
  upgradeBullet: () => set((state) => {
    if (state.bulletLevel >= GAME_CONSTANTS.BULLET_TYPES.length) return {};
    if (state.gold < GAME_CONSTANTS.BULLET_UPGRADE_COST) return {};
    return {
      bulletLevel: state.bulletLevel + 1,
      gold: state.gold - GAME_CONSTANTS.BULLET_UPGRADE_COST,
    };
  }),
  refreshBattlefield: (slots) => set(() => {
    const newSlots: TowerSlot[] = GAME_CONSTANTS.TOWER_SLOTS.slice(0, slots).map((s, i) => ({
      ...s,
      unlocked: true,
      tower: undefined,
      wasDestroyed: false,
    }));
    return {
      towers: [],
      towerSlots: newSlots,
      enemies: [],
      bullets: [],
      effects: [],
    };
  }),
}));
