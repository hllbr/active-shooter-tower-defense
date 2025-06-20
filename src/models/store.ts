import { create } from 'zustand';
import type { GameState, Tower, TowerSlot, Enemy, Bullet, Effect, Mine, Position } from './gameTypes';
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
  gold: 100,
  bulletLevel: 1,
  currentWave: 1,
  enemiesKilled: 0,
  enemiesRequired: GAME_CONSTANTS.getWaveEnemiesRequired(1),
  totalEnemiesKilled: 0,
  totalGoldSpent: 0,
  fireUpgradesPurchased: 0,
  shieldUpgradesPurchased: 0,
  packagesPurchased: 0,
  defenseUpgradesPurchased: 0,
  mineLevel: 0,
  mineRegeneration: false,
  mines: [],
  maxTowers: GAME_CONSTANTS.INITIAL_TOWER_LIMIT,
  globalWallStrength: 0,
  isGameOver: false,
  isStarted: false,
  diceRoll: null,
  diceUsed: false,
  discountMultiplier: 1,
  isDiceRolling: false,
  wallLevel: 0,
  globalWallActive: true,
  lastWallDestroyed: 0,
  wallRegenerationActive: false,
};

type Store = GameState & {
  buildTower: (slotIdx: number, free?: boolean) => void;
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
  purchaseShield: (idx: number, free?: boolean) => void;
  nextWave: () => void;
  resetGame: () => void;
  setStarted: (started: boolean) => void;
  upgradeBullet: (free?: boolean) => void;
  refreshBattlefield: (slots: number) => void;
  rollDice: () => void;
  resetDice: () => void;
  setDiceResult: (roll: number, multiplier: number) => void;
  upgradeMines: () => void;
  deployMines: () => void;
  triggerMine: (mineId: string) => void;
  upgradeWall: () => void;
  damageWall: (slotIdx: number) => void;
  regenerateWalls: () => void;
  activateFrostEffect: () => void;
  deactivateFrostEffect: () => void;
};

export const useGameStore = create<Store>((set, get) => ({
  ...initialState,

  buildTower: (slotIdx, free = false) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    const cost = free ? 0 : GAME_CONSTANTS.TOWER_COST;
    if (
      slot.tower ||
      state.gold < cost ||
      state.towers.length >= state.maxTowers
    )
      return {};
    
    const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[0]; // Level 1
    const newTower: Tower = {
      id: `${Date.now()}-${Math.random()}`,
      position: { x: slot.x, y: slot.y },
      size: GAME_CONSTANTS.TOWER_SIZE,
      isActive: true,
      level: 1,
      range: GAME_CONSTANTS.TOWER_RANGE,
      damage: upgrade.damage,
      fireRate: upgrade.fireRate,
      lastFired: 0,
      health: upgrade.health,
      maxHealth: upgrade.health,
      wallStrength: state.globalWallStrength,
      specialAbility: upgrade.special,
      healthRegenRate: 0,
      lastHealthRegen: 0,
      specialCooldown: 5000,
      lastSpecialUse: 0,
      multiShotCount: 3,
      chainLightningJumps: 5,
      freezeDuration: 2000,
      burnDuration: 3000,
      acidStack: 0,
      quantumState: false,
      nanoSwarmCount: 5,
      psiRange: 150,
      timeWarpSlow: 0.3,
      spaceGravity: 0.5,
      legendaryAura: false,
      divineProtection: false,
      cosmicEnergy: 100,
      infinityLoop: false,
      godModeActive: false,
    };
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: newTower, wasDestroyed: false };
    return {
      towers: [...state.towers, newTower],
      towerSlots: newSlots,
      gold: state.gold - cost,
      totalGoldSpent: state.totalGoldSpent + cost,
    };
  }),

  upgradeTower: (slotIdx) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower || slot.tower.level >= GAME_CONSTANTS.TOWER_MAX_LEVEL) return {};
    
    const nextLevel = slot.tower.level + 1;
    const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[nextLevel - 1];
    
    if (state.gold < upgrade.cost) return {};
    
    const upgradedTower = {
      ...slot.tower,
      level: nextLevel,
      damage: upgrade.damage,
      fireRate: upgrade.fireRate,
      health: upgrade.health,
      maxHealth: upgrade.health,
      specialAbility: upgrade.special,
      // Level-based special improvements
      healthRegenRate: nextLevel >= 20 ? 5 : nextLevel >= 15 ? 3 : nextLevel >= 10 ? 2 : nextLevel >= 5 ? 1 : 0,
      multiShotCount: nextLevel >= 7 ? 5 : nextLevel >= 6 ? 4 : 3,
      chainLightningJumps: nextLevel >= 12 ? 8 : nextLevel >= 11 ? 6 : 5,
      freezeDuration: nextLevel >= 13 ? 3000 : 2000,
      burnDuration: nextLevel >= 14 ? 4000 : 3000,
      nanoSwarmCount: nextLevel >= 17 ? 8 : nextLevel >= 16 ? 6 : 5,
      psiRange: nextLevel >= 18 ? 200 : 150,
      timeWarpSlow: nextLevel >= 19 ? 0.5 : 0.3,
      spaceGravity: nextLevel >= 20 ? 0.8 : 0.5,
      cosmicEnergy: nextLevel >= 23 ? 200 : nextLevel >= 21 ? 150 : 100,
    };
    
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: upgradedTower };
    return {
      towers: state.towers.map(t => t.id === upgradedTower.id ? upgradedTower : t),
      towerSlots: newSlots,
      gold: state.gold - upgrade.cost,
      totalGoldSpent: state.totalGoldSpent + upgrade.cost,
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
  spendGold: (amount) => set((state) => ({
    gold: state.gold - amount,
    totalGoldSpent: state.totalGoldSpent + amount,
    packagesPurchased: state.packagesPurchased + 1, // Assume spendGold is only for packages
  })),

  addEnemy: (enemy) => set((state) => ({ enemies: [...state.enemies, enemy] })),
  removeEnemy: (enemyId) => set((state) => ({ enemies: state.enemies.filter(e => e.id !== enemyId) })),
  damageEnemy: (enemyId, dmg) => set((state) => {
    const enemy = state.enemies.find(e => e.id === enemyId);
    if (!enemy) return {};
    const newHealth = enemy.health - dmg;
    if (newHealth <= 0) {
      // Don't count special enemies towards wave completion
      const shouldCountKill = !enemy.isSpecial;
      return {
        enemies: state.enemies.filter(e => e.id !== enemyId),
        gold: state.gold + enemy.goldValue,
        enemiesKilled: shouldCountKill ? state.enemiesKilled + 1 : state.enemiesKilled,
        totalEnemiesKilled: state.totalEnemiesKilled + 1,
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
      totalGoldSpent: state.totalGoldSpent + GAME_CONSTANTS.WALL_COST,
      shieldUpgradesPurchased: state.shieldUpgradesPurchased + 1,
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

  purchaseShield: (idx, free = false) => set((state) => {
    const shield = GAME_CONSTANTS.WALL_SHIELDS[idx];
    if (!shield || (!free && state.gold < shield.cost)) return {};
    const newSlots = state.towerSlots.map((s) =>
      s.tower ? { ...s, tower: { ...s.tower, wallStrength: s.tower.wallStrength + shield.strength } } : s,
    );
    return {
      towerSlots: newSlots,
      globalWallStrength: state.globalWallStrength + shield.strength,
      gold: free ? state.gold : state.gold - shield.cost,
      totalGoldSpent: free ? state.totalGoldSpent : state.totalGoldSpent + shield.cost,
      shieldUpgradesPurchased: state.shieldUpgradesPurchased + 1,
    };
  }),

  nextWave: () => set((state) => {
    const newWave = state.currentWave + 1;
    
    // Check if player completed all 100 waves
    if (newWave > 100) {
      return {
        isGameOver: true,
        // Victory condition - you could add a victory flag here
      };
    }
    
    return {
      currentWave: newWave,
      enemiesKilled: 0,
      enemiesRequired: GAME_CONSTANTS.getWaveEnemiesRequired(newWave),
      totalEnemiesKilled: 0,
      totalGoldSpent: 0,
      fireUpgradesPurchased: 0,
      shieldUpgradesPurchased: 0,
      packagesPurchased: 0,
    };
  }),
  resetGame: () => set(() => ({ 
    ...initialState, 
    towerSlots: initialSlots,
    enemiesKilled: 0,
    enemiesRequired: GAME_CONSTANTS.getWaveEnemiesRequired(1),
    totalEnemiesKilled: 0,
    totalGoldSpent: 0,
    fireUpgradesPurchased: 0,
    shieldUpgradesPurchased: 0,
    packagesPurchased: 0,
  })),
  setStarted: (started) => set(() => ({ isStarted: started })),
  upgradeBullet: (free = false) => set((state) => {
    if (state.bulletLevel >= GAME_CONSTANTS.BULLET_TYPES.length) return {};
    if (!free && state.gold < GAME_CONSTANTS.BULLET_UPGRADE_COST) return {};
    return {
      bulletLevel: state.bulletLevel + 1,
      gold: free ? state.gold : state.gold - GAME_CONSTANTS.BULLET_UPGRADE_COST,
      totalGoldSpent: free ? state.totalGoldSpent : state.totalGoldSpent + GAME_CONSTANTS.BULLET_UPGRADE_COST,
      fireUpgradesPurchased: state.fireUpgradesPurchased + 1,
    };
  }),
  refreshBattlefield: (slots) => set(() => {
    const newSlots: TowerSlot[] = GAME_CONSTANTS.TOWER_SLOTS.slice(0, slots).map((s) => ({
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
  rollDice: () => set((state) => {
    if (state.diceUsed || state.isDiceRolling) return {};
    
    // Zar atma animasyonu için önce rolling state'ini true yap
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      let discountMultiplier = 1;
      
      if (roll <= 3) {
        // 3 ve altında: indirimler iptal edilir
        discountMultiplier = 0;
      } else {
        // 4-6 arası: mevcut indirim + %50 daha fazla
        discountMultiplier = 1 + (roll - 3) * 0.5;
      }
      
      get().setDiceResult(roll, discountMultiplier);
    }, 2000); // 2 saniye animasyon
    
    return {
      isDiceRolling: true,
    };
  }),
  resetDice: () => set(() => ({
    diceRoll: null,
    diceUsed: false,
    discountMultiplier: 1,
    isDiceRolling: false,
  })),
  setDiceResult: (roll: number, multiplier: number) => set(() => ({
    diceRoll: roll,
    diceUsed: true,
    discountMultiplier: multiplier,
    isDiceRolling: false,
  })),
  upgradeMines: () => set((state) => {
    const currentLevel = state.mineLevel;
    if (currentLevel >= GAME_CONSTANTS.MINE_UPGRADES.length) return {};
    const upgrade = GAME_CONSTANTS.MINE_UPGRADES[currentLevel];
    if (state.gold < upgrade.cost) return {};

    const isRegenUpgrade = currentLevel === GAME_CONSTANTS.MINE_UPGRADES.length - 2;

    return {
      gold: state.gold - upgrade.cost,
      mineLevel: currentLevel + 1,
      mineRegeneration: state.mineRegeneration || isRegenUpgrade,
      totalGoldSpent: state.totalGoldSpent + upgrade.cost,
      defenseUpgradesPurchased: state.defenseUpgradesPurchased + 1,
    };
  }),
  deployMines: () => set((state) => {
    if (state.mineLevel === 0) return { mines: [] };
    const level = state.mineLevel - 1;
    const upgrade = GAME_CONSTANTS.MINE_UPGRADES[level];
    const newMines: Mine[] = [];
    
    // Simple random placement for now, avoiding tower slots
    const towerSlotPositions = new Set(state.towerSlots.map(s => `${s.x},${s.y}`));

    for (let i = 0; i < upgrade.count; i++) {
      let position: Position;
      let isOverlapping;
      do {
        position = {
          x: Math.random() * (window.innerWidth - 100) + 50,
          y: Math.random() * (window.innerHeight - 100) + 50,
        };
        isOverlapping = towerSlotPositions.has(`${position.x},${position.y}`);
      } while (isOverlapping);

      newMines.push({
        id: `mine-${Date.now()}-${i}`,
        position,
        size: GAME_CONSTANTS.MINE_VISUALS.size,
        damage: upgrade.damage,
        radius: upgrade.radius,
      });
    }
    return { mines: newMines };
  }),
  triggerMine: (mineId) => set((state) => {
    const newMines = state.mines.filter(m => m.id !== mineId);

    if (state.mineRegeneration) {
      const level = state.mineLevel - 1;
      const upgrade = GAME_CONSTANTS.MINE_UPGRADES[level];
      const towerSlotPositions = new Set(state.towerSlots.map(s => `${s.x},${s.y}`));
      
      let position: Position;
      let isOverlapping;
      do {
        position = {
          x: Math.random() * (window.innerWidth - 100) + 50,
          y: Math.random() * (window.innerHeight - 100) + 50,
        };
        isOverlapping = towerSlotPositions.has(`${position.x},${position.y}`);
      } while (isOverlapping);

      const newMine: Mine = {
        id: `mine-${Date.now()}-${Math.random()}`,
        position,
        size: GAME_CONSTANTS.MINE_VISUALS.size,
        damage: upgrade.damage,
        radius: upgrade.radius,
      };
      newMines.push(newMine);
    }
    
    return { mines: newMines };
  }),
  upgradeWall: () => set((state) => {
    const currentLevel = state.wallLevel;
    if (currentLevel >= GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS.length) return {};
    const upgrade = GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS[currentLevel];
    if (state.gold < upgrade.cost) return {};

    return {
      gold: state.gold - upgrade.cost,
      wallLevel: currentLevel + 1,
      totalGoldSpent: state.totalGoldSpent + upgrade.cost,
    };
  }),
  damageWall: (slotIdx) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower || slot.tower.wallStrength <= 0) return {};
    
    const updatedTower = { ...slot.tower, wallStrength: slot.tower.wallStrength - 1 };
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: updatedTower };
    
    // Global sur durumunu kontrol et
    const anyWallDestroyed = newSlots.some(s => s.tower && s.tower.wallStrength === 0);
    
    // Buz efekti aktif et
    if (anyWallDestroyed && !state.frostEffectActive) {
      const originalSpeeds = new Map<string, number>();
      state.enemies.forEach(enemy => {
        originalSpeeds.set(enemy.id, enemy.speed);
        enemy.speed *= GAME_CONSTANTS.WALL_SYSTEM.GLOBAL_EFFECTS.NO_WALL_ENEMY_SPEED_MULTIPLIER;
      });
      
      return {
        towers: state.towers.map(t => t.id === updatedTower.id ? updatedTower : t),
        towerSlots: newSlots,
        globalWallActive: false,
        lastWallDestroyed: performance.now(),
        frostEffectActive: true,
        frostEffectStartTime: performance.now(),
        originalEnemySpeeds: originalSpeeds,
      };
    }
    
    return {
      towers: state.towers.map(t => t.id === updatedTower.id ? updatedTower : t),
      towerSlots: newSlots,
      globalWallActive: !anyWallDestroyed,
      lastWallDestroyed: anyWallDestroyed ? performance.now() : state.lastWallDestroyed,
    };
  }),
  regenerateWalls: () => set((state) => {
    const now = performance.now();
    const wallLevel = GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS[state.wallLevel];
    
    if (!wallLevel || now - state.lastWallDestroyed < GAME_CONSTANTS.WALL_SYSTEM.GLOBAL_EFFECTS.WALL_REGEN_DELAY) {
      return {};
    }
    
    // Tüm kulelerin surlarını yenile
    const newSlots = state.towerSlots.map(slot => {
      if (slot.tower && slot.tower.wallStrength === 0) {
        return { ...slot, tower: { ...slot.tower, wallStrength: wallLevel.strength } };
      }
      return slot;
    });
    
    // Buz efektini deaktif et
    state.enemies.forEach(enemy => {
      const originalSpeed = state.originalEnemySpeeds.get(enemy.id);
      if (originalSpeed !== undefined) {
        enemy.speed = originalSpeed;
      }
    });
    
    return {
      towerSlots: newSlots,
      globalWallActive: true,
      wallRegenerationActive: false,
      frostEffectActive: false,
      frostEffectStartTime: 0,
      originalEnemySpeeds: new Map(),
    };
  }),
  activateFrostEffect: () => set((state) => {
    const now = performance.now();
    const originalSpeeds = new Map<string, number>();
    
    // Tüm düşmanların orijinal hızlarını kaydet ve yavaşlat
    state.enemies.forEach(enemy => {
      originalSpeeds.set(enemy.id, enemy.speed);
      enemy.speed *= GAME_CONSTANTS.WALL_SYSTEM.GLOBAL_EFFECTS.NO_WALL_ENEMY_SPEED_MULTIPLIER;
    });
    
    return {
      frostEffectActive: true,
      frostEffectStartTime: now,
      originalEnemySpeeds: originalSpeeds,
    };
  }),
  deactivateFrostEffect: () => set((state) => {
    // Tüm düşmanların hızlarını normale döndür
    state.enemies.forEach(enemy => {
      const originalSpeed = state.originalEnemySpeeds.get(enemy.id);
      if (originalSpeed !== undefined) {
        enemy.speed = originalSpeed;
      }
    });
    
    return {
      frostEffectActive: false,
      frostEffectStartTime: 0,
      originalEnemySpeeds: new Map(),
    };
  }),
}));
