import { create } from 'zustand';
import type { GameState, Tower, TowerSlot, Enemy, Bullet, Position, Effect } from './gameTypes';
import { GAME_CONSTANTS, generateRandomTowerSlots } from '../utils/Constants';

const allSlots: TowerSlot[] = generateRandomTowerSlots(GAME_CONSTANTS.TOTAL_SLOT_COUNT).map(s => ({
  ...s,
  unlocked: false,
  tower: undefined,
  wasDestroyed: false,
}));

const initialSlots: TowerSlot[] = allSlots.slice(0, GAME_CONSTANTS.INITIAL_SLOT_COUNT).map(slot => ({
  ...slot,
  unlocked: true,
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
  upgradePower: (slotIdx: number) => void;
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
  upgradeBullet: (slotIdx: number, bulletTypeId: string) => void;
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
      maxHealth: GAME_CONSTANTS.TOWER_HEALTH,
      wallStrength: state.globalWallStrength,
      powerMultiplier: 1,
      bulletTypeId: 'basic',
      bulletLevel: 1,
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
    const newMaxHealth = slot.tower.maxHealth + upgrade.healthBonus;
    const upgradedTower = {
      ...slot.tower,
      level: nextLevel,
      damage: upgrade.damage,
      fireRate: upgrade.fireRate,
      health: slot.tower.health + upgrade.healthBonus,
      maxHealth: newMaxHealth,
    };
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: upgradedTower };
    return {
      towers: state.towers.map(t => t.id === upgradedTower.id ? upgradedTower : t),
      towerSlots: newSlots,
      gold: state.gold - GAME_CONSTANTS.TOWER_UPGRADE_COST,
    };
  }),

  upgradePower: (slotIdx) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower || state.gold < GAME_CONSTANTS.POWER_UPGRADE_COST) return {};
    
    // Check if we've reached the maximum power level (multiplier 6 = level 20)
    if (slot.tower.powerMultiplier >= 6) return {};
    
    const upgradedTower = {
      ...slot.tower,
      powerMultiplier: slot.tower.powerMultiplier + 0.25,  // Each upgrade adds 25% damage (1 level = 4 power)
    };
    
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: upgradedTower };
    
    return {
      towers: state.towers.map(t => t.id === upgradedTower.id ? upgradedTower : t),
      towerSlots: newSlots,
      gold: state.gold - GAME_CONSTANTS.POWER_UPGRADE_COST,
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

  unlockSlot: (slotIdx) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, unlocked: true };
    return {
      towers: state.towers.map(t => t.id === slot.tower!.id ? { ...t, wallStrength: t.wallStrength + 1 } : t),
      towerSlots: newSlots,
      globalWallStrength: state.globalWallStrength + 1,
      gold: state.gold - GAME_CONSTANTS.WALL_COST,
    };
  }),

  addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
  spendGold: (amount) => set((state) => ({ gold: state.gold - amount })),

  addEnemy: (enemy) => set((state) => ({ enemies: [...state.enemies, enemy] })),
  removeEnemy: (enemyId) => set((state) => ({ enemies: state.enemies.filter(e => e.id !== enemyId) })),
  damageEnemy: (enemyId, dmg) => set((state) => {
    const enemy = state.enemies.find(e => e.id === enemyId);
    if (!enemy) return {};
    
    // Apply damage reduction from shield if present
    let actualDamage = dmg;
    if (enemy.shield && enemy.shield > 0) {
      actualDamage = Math.max(1, dmg * 0.5); // Shield reduces damage by 50%, minimum 1
    }
    
    const newHealth = enemy.health - actualDamage;
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
  setStarted: (started) => set((state) => {
    const newState: Partial<GameState> = { isStarted: started };
    if (started) {
      // Always start with a level 1 tower in the first slot
      const slot = state.towerSlots[0];
      if (!slot.tower) {
        const newTower: Tower = {
          id: `${Date.now()}-${Math.random()}`,
          position: { x: slot.x, y: slot.y },
          size: GAME_CONSTANTS.TOWER_SIZE,
          isActive: true,
          level: 1,
          range: GAME_CONSTANTS.TOWER_RANGE,
          damage: GAME_CONSTANTS.TOWER_UPGRADES[0].damage,
          fireRate: GAME_CONSTANTS.TOWER_UPGRADES[0].fireRate,
          lastFired: 0,
          health: GAME_CONSTANTS.TOWER_HEALTH,
          maxHealth: GAME_CONSTANTS.TOWER_HEALTH,
          wallStrength: state.globalWallStrength,
          wallColor: GAME_CONSTANTS.TOWER_WALL_COLORS[0],
          powerMultiplier: 1,
          bulletTypeId: 'basic',
          bulletLevel: 1,
        };
        const newSlots = [...state.towerSlots];
        newSlots[0] = { ...slot, tower: newTower, wasDestroyed: false };
        newState.towerSlots = newSlots;
        newState.towers = [newTower];
      }
    }
    return newState;
  }),
  upgradeBullet: (slotIdx, bulletTypeId) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower || state.gold < GAME_CONSTANTS.BULLET_UPGRADE_COST) return {};

    const bulletType = GAME_CONSTANTS.BULLET_TYPES.find(t => t.id === bulletTypeId);
    if (!bulletType) return {};

    // Check if tower level is high enough for this bullet type
    if (slot.tower.level < bulletType.requiredTowerLevel) return {};

    let newLevel = 1;
    // If upgrading same type, increase level
    if (slot.tower.bulletTypeId === bulletTypeId) {
      if (slot.tower.bulletLevel >= bulletType.maxLevel) return {};
      newLevel = slot.tower.bulletLevel + 1;
    }

    const upgradedTower = {
      ...slot.tower,
      bulletTypeId,
      bulletLevel: newLevel,
    };

    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: upgradedTower };

    return {
      towers: state.towers.map(t => t.id === upgradedTower.id ? upgradedTower : t),
      towerSlots: newSlots,
      gold: state.gold - GAME_CONSTANTS.BULLET_UPGRADE_COST,
    };
  }),
  refreshBattlefield: (slots) => set((state) => {
    const newSlots: TowerSlot[] = generateRandomTowerSlots(slots).map((s) => ({
      ...s,
      unlocked: true,
      tower: undefined,
      wasDestroyed: false,
    }));
    // Always add a level 1 tower to the first slot
    const firstSlot = newSlots[0];
    const newTower: Tower = {
      id: `${Date.now()}-${Math.random()}`,
      position: { x: firstSlot.x, y: firstSlot.y },
      size: GAME_CONSTANTS.TOWER_SIZE,
      isActive: true,
      level: 1,
      range: GAME_CONSTANTS.TOWER_RANGE,
      damage: GAME_CONSTANTS.TOWER_DAMAGE,
      fireRate: GAME_CONSTANTS.TOWER_FIRE_RATE,
      lastFired: 0,
      health: GAME_CONSTANTS.TOWER_HEALTH,
      maxHealth: GAME_CONSTANTS.TOWER_HEALTH,
      wallStrength: state.globalWallStrength,
      wallColor: GAME_CONSTANTS.TOWER_WALL_COLORS[0],
      powerMultiplier: 1,
      bulletTypeId: 'basic',
      bulletLevel: 1,
    };
    newSlots[0] = { ...firstSlot, tower: newTower, wasDestroyed: false };
    return {
      towers: [newTower],
      towerSlots: newSlots,
      enemies: [],
      bullets: [],
      effects: [],
    };
  }),
}));
