import { create } from 'zustand';
import type { GameState, TowerSlot, Enemy, Bullet, Effect, Mine, Position, TowerUpgradeListener } from '../gameTypes';
import { GAME_CONSTANTS } from '../../utils/constants';
// import { DailyMissionsManager } from '../../logic/DailyMissionsManager';
import { updateWaveTiles } from '../../game-systems/TowerPlacementManager';
import { waveRules } from '../../config/waveRules';
import { energyManager } from '../../game-systems/EnergyManager';
import { waveManager } from '../../game-systems/WaveManager';
// import { upgradeEffectsManager } from '../../game-systems/UpgradeEffects';
import { initialState } from './initialState';
import { securityManager } from '../../security/SecurityManager';
import { buildTowerAction } from './actions/buildTower';
import { unlockSlotAction } from './actions/unlockSlot';
import { createEnemySlice, EnemySlice } from './slices/enemySlice';
import { createTowerSlice, TowerSlice } from './slices/towerSlice';
import { createDiceSlice, DiceSlice } from './slices/diceSlice';
import { createMineSlice, MineSlice } from './slices/mineSlice';
import { createWaveSlice, WaveSlice } from './slices/waveSlice';
import { createEnergySlice, EnergySlice, addEnemyKillListener, removeEnemyKillListener } from './slices/energySlice';

      x: Math.random() * (viewportWidth - margin * 2) + margin,
      y: Math.random() * (viewportHeight - margin * 2) + margin,
    };
    isTooClose = towerSlots.some(
      (slot) => Math.hypot(position.x - slot.x, position.y - slot.y) < MINE_MIN_DISTANCE_FROM_TOWER,
    );
  } while (isTooClose);

  return position;
};


export type Store = GameState &
  DiceSlice &
  MineSlice &
  WaveSlice &
  EnergySlice &
  EnemySlice &
  TowerSlice & {
  buildTower: (slotIdx: number, free?: boolean, towerType?: 'attack' | 'economy', towerClass?: string) => void;
  upgradeTower: (slotIdx: number) => void;
  damageTower: (slotIdx: number, dmg: number) => void;
  removeTower: (slotIdx: number) => void;
  dismantleTower: (slotIdx: number) => void;
  moveTower: (fromIdx: number, toIdx: number) => void;
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
  setRefreshing: (refreshing: boolean) => void;
  upgradeBullet: (free?: boolean) => void;
  refreshBattlefield: (slots: number) => void;
  rollDice: () => void;
  resetDice: () => void;
  setDiceResult: (roll: number, multiplier: number) => void;
  upgradeMines: () => void;
  deployMines: () => void;
  deploySpecializedMine: (mineType: 'explosive' | 'utility' | 'area_denial', mineSubtype: string, position?: Position) => void;
  triggerMine: (mineId: string) => void;
  upgradeWall: () => void;
  damageWall: (slotIdx: number) => void;
  regenerateWalls: () => void;
  activateFrostEffect: () => void;
  deactivateFrostEffect: () => void;
  performTileAction: (slotIdx: number, action: 'wall' | 'trench' | 'buff') => void;
  addTowerUpgradeListener: (fn: TowerUpgradeListener) => void;
  startPreparation: () => void;
  tickPreparation: (delta: number) => void;
  pausePreparation: () => void;
  resumePreparation: () => void;
  speedUpPreparation: (amount: number) => void;
  startWave: () => void;
  consumeEnergy: (amount: number, action: string) => boolean;
  addEnergy: (amount: number, action?: string) => void;
  clearEnergyWarning: () => void;
  
  // Yeni Enerji Sistemi
  upgradeEnergySystem: (upgradeId: string) => void;
  onEnemyKilled: (isSpecial?: boolean, enemyType?: string) => void;
  tickEnergyRegen: (deltaTime: number) => void;
  calculateEnergyStats: () => {
    passiveRegen: number;
    maxEnergy: number;
    killBonus: number;
    // CRITICAL FIX: Activity bonus removed to prevent energy flowing backwards
    efficiency: number;
  };
  
  // Dynamic Calculation Methods
  getMaxEnergy: () => number;
  getMaxActions: () => number;
  
  // Gelişmiş Action Sistemi
  tickActionRegen: (deltaTime: number) => void;
  addAction: (amount: number) => void;

  // PowerMarket upgrade functions
  setGold: (amount: number) => void;
  setEnergyBoostLevel: (level: number) => void;
  setMaxActionsLevel: (level: number) => void;
  setEliteModuleLevel: (level: number) => void;
  
  // Slot Unlock Animation Functions
  startSlotUnlockAnimation: (slotIdx: number) => void;
  finishSlotUnlockAnimation: (slotIdx: number) => void;
  clearRecentlyUnlockedSlots: () => void;
  
  // CRITICAL FIX: Individual Package Tracking Functions (fixes "0/10 stays 0/10")
  purchasePackage: (packageId: string, cost: number, maxAllowed: number) => boolean;
  getPackageInfo: (packageId: string, maxAllowed: number) => {
    purchaseCount: number;
    maxAllowed: number;
    canPurchase: boolean;
    isMaxed: boolean;
  };
  
  // CRITICAL FIX: Individual Upgrade Tracking Functions (fixes sayaç problemi)
  purchaseIndividualFireUpgrade: (upgradeId: string, cost: number, maxLevel: number) => boolean;
  getIndividualFireUpgradeInfo: (upgradeId: string, maxLevel: number) => {
    currentLevel: number;
    maxLevel: number;
    canUpgrade: boolean;
    isMaxed: boolean;
  };
  purchaseIndividualShieldUpgrade: (upgradeId: string, cost: number, maxLevel: number) => boolean;
  getIndividualShieldUpgradeInfo: (upgradeId: string, maxLevel: number) => {
    currentLevel: number;
    maxLevel: number;
    canUpgrade: boolean;
    isMaxed: boolean;
  };
  purchaseIndividualDefenseUpgrade: (upgradeId: string, cost: number, maxLevel: number) => boolean;
  getIndividualDefenseUpgradeInfo: (upgradeId: string, maxLevel: number) => {
    currentLevel: number;
    maxLevel: number;
    canUpgrade: boolean;
    isMaxed: boolean;
  };
  
  // Achievement System Functions (Faz 1: Temel Mekanikler)
  initializeAchievements: () => void;
  triggerAchievementEvent: (eventType: string, eventData?: unknown) => void;


  unlockTowerType: (towerType: string) => void;
  unlockSkin: (skinName: string) => void;
};

export const useGameStore = create<Store>((set, get): Store => ({
  ...initialState,

  buildTower: (slotIdx, free = false, towerType: 'attack' | 'economy' = 'attack', towerClass?: string) =>
    set(state => buildTowerAction(state, slotIdx, free, towerType, towerClass)),

  unlockSlot: (slotIdx: number) =>
    set(state => unlockSlotAction(state, slotIdx)),

  addGold: (amount: number) => {
    // Security validation
    const validation = securityManager.validateStateChange('addGold', {}, { gold: amount });
    if (!validation.valid) {
      console.warn('🔒 Security: addGold blocked:', validation.reason);
      securityManager.logSecurityEvent('state_manipulation_attempt', {
        action: 'addGold',
        amount,
        reason: validation.reason
      }, 'high');
      return;
    }
    
    set((state) => ({ gold: state.gold + amount }));
  },
  
  spendGold: (amount: number) => {
    // Security validation
    const validation = securityManager.validateStateChange('spendGold', {}, { gold: amount });
    if (!validation.valid) {
      console.warn('🔒 Security: spendGold blocked:', validation.reason);
      securityManager.logSecurityEvent('state_manipulation_attempt', {
        action: 'spendGold',
        amount,
        reason: validation.reason
      }, 'high');
      return;
    }
    
    set((state) => ({
      gold: state.gold - amount,
      totalGoldSpent: state.totalGoldSpent + amount,
    }));
  },
  
  removeEnemy: (enemyId: string) => set((state) => {
    const enemy = state.enemies.find(e => e.id === enemyId);
    if (!enemy) return {};
    
    // Handle boss defeat if this is a boss
    if (enemy.bossType) {
      // Import boss manager and handle boss defeat
      setTimeout(() => {
        import('../../game-systems/enemy/BossManager').then(({ default: BossManager }) => {
          BossManager.handleBossDefeat(enemy);
        });
      }, 0);
    }
    
    // ✅ CRITICAL FIX: ALL enemies count toward wave completion, not just non-special ones
    // This was the main bug preventing wave progression
    const newKillCount = state.enemiesKilled + 1;
    
    // DEBUG: Log enemy kills for Wave 1
    if (state.currentWave === 1) {
      console.log(`💀 Enemy killed! Wave ${state.currentWave}: ${newKillCount}/${state.enemiesRequired} (${enemy.type}, special: ${enemy.isSpecial})`);
    }
    
    // Handle advanced loot system
    setTimeout(() => {
      import('../../game-systems/LootManager').then(({ default: LootManager }) => {
        LootManager.handleEnemyDeath(enemy);
      });
    }, 0);
    
    // Energy bonus for enemy kill (delayed to avoid state conflicts)
    setTimeout(() => get().onEnemyKilled(enemy.isSpecial, enemy.type), 0);
    
    // ✅ SOUND FIX: Play death sound effect
    setTimeout(() => {
      import('../../utils/sound').then(({ playContextualSound }) => {
        playContextualSound('death'); // Düşman ölüm sesi
      });
    }, 50);
    
    return {
      enemies: state.enemies.filter(e => e.id !== enemyId),
      gold: state.gold + enemy.goldValue, // Add gold when enemy is removed
      enemiesKilled: newKillCount,
      totalEnemiesKilled: state.totalEnemiesKilled + 1,
    };
  }),

  damageEnemy: (enemyId: string, dmg: number) => {
    const { towerSlots } = get();
    const enemyObj = get().enemies.find(e => e.id === enemyId);
    set((state) => {
      const enemy = state.enemies.find(e => e.id === enemyId);
      if (!enemy) return {};
      const newHealth = enemy.health - dmg;
      if (newHealth <= 0) {
        // Handle boss defeat if this is a boss
        if (enemy.bossType) {
          // Import boss manager and handle boss defeat
          setTimeout(() => {
            import('../../game-systems/enemy/BossManager').then(({ default: BossManager }) => {
              BossManager.handleBossDefeat(enemy);
            });
          }, 0);
        }
        
        // ✅ CRITICAL FIX: ALL enemies count toward wave completion, not just non-special ones
        // This was also causing wave progression issues in damageEnemy path
        const newKillCount = state.enemiesKilled + 1;
        
        // DEBUG: Log enemy kills for Wave 1 
        if (state.currentWave === 1) {
          console.log(`💀 Enemy killed! Wave ${state.currentWave}: ${newKillCount}/${state.enemiesRequired} (${enemy.type}, special: ${enemy.isSpecial})`);
        }
        
        // Handle advanced loot system
        setTimeout(() => {
          import('../../game-systems/LootManager').then(({ default: LootManager }) => {
            LootManager.handleEnemyDeath(enemy);
          });
        }, 0);
        
        // Enerji sistemi: Düşman öldürme bonusu
        setTimeout(() => get().onEnemyKilled(enemy.isSpecial, enemy.type), 0);
        
        // ✅ SOUND FIX: Play death sound effect
        setTimeout(() => {
          import('../../utils/sound').then(({ playContextualSound }) => {
            playContextualSound('death'); // Düşman ölüm sesi
          });
        }, 50);
        
        return {
          enemies: state.enemies.filter(e => e.id !== enemyId),
          gold: state.gold + enemy.goldValue,
          enemiesKilled: newKillCount,
          totalEnemiesKilled: state.totalEnemiesKilled + 1,
        };
      } else {
        return {
          enemies: state.enemies.map(e => e.id === enemyId ? { ...e, health: newHealth } : e),
        };
      }
    });
    if (enemyObj && enemyObj.health - dmg <= 0 && enemyObj.behaviorTag === 'tank') {
      towerSlots.forEach((s, idx) => {
        if (!s.tower) return;
        const dx = s.x - enemyObj.position.x;
        const dy = s.y - enemyObj.position.y;
        if (Math.hypot(dx, dy) <= GAME_CONSTANTS.TANK_DEATH_RADIUS) {
          get().damageTower(idx, enemyObj.damage);
        }
      });
    }
  },

  upgradeTower: (slotIdx: number) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    
    const currentLevel = slot.tower.level;
    const cost = GAME_CONSTANTS.TOWER_UPGRADE_COST * currentLevel;
    if (state.gold < cost) return {};
    
    const upgraded = { ...slot.tower, level: currentLevel + 1 };
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: upgraded };
    
    // ✅ SOUND FIX: Play upgrade sound effect
    setTimeout(() => {
      import('../../utils/sound').then(({ playContextualSound }) => {
        playContextualSound('tower-upgrade'); // Kule yükseltme sesi
      });
    }, 50);
    
    return {
      towerSlots: newSlots,
      gold: state.gold - cost,
      totalGoldSpent: state.totalGoldSpent + cost,
    };
  }),
  
  ...createTowerSlice(set, get),
  ...createEnemySlice(set, get),
  ...createDiceSlice(set, get),
  ...createMineSlice(set, get),
  ...createWaveSlice(set, get),
  ...createEnergySlice(set, get),

  resetGame: () => set(() => ({
    ...initialState,
    // Reset achievements but keep player progress
    gameStartTime: Date.now(),
  })),

  setStarted: (started: boolean) => set(() => ({ isStarted: started })),

  // ✅ CRITICAL FIX: UpgradeScreen trigger implementation  
  setRefreshing: (refreshing: boolean) => set((state) => {
    console.log(`🔄 setRefreshing called with: ${refreshing}, current state: ${state.isRefreshing}`);
    
    return {
      isRefreshing: refreshing,
      // Clear any preparation state when entering upgrade screen
      isPreparing: false,
      isPaused: false,
    };
  }),

  upgradeBullet: (free?: boolean) => set((state) => {
    const cost = free ? 0 : GAME_CONSTANTS.BULLET_UPGRADE_COST;
    if (state.gold < cost) return {};
    
    return {
      bulletLevel: Math.min(state.bulletLevel + 1, GAME_CONSTANTS.BULLET_TYPES.length - 1),
      gold: state.gold - cost,
      fireUpgradesPurchased: state.fireUpgradesPurchased + 1,
      totalGoldSpent: state.totalGoldSpent + cost,
    };
  }),

  refreshBattlefield: (slots: number) => set((state) => {
    // Add more unlocked slots
    const newSlots = [...state.towerSlots];
    let unlocked = 0;
    for (let i = 0; i < newSlots.length && unlocked < slots; i++) {
      if (!newSlots[i].unlocked) {
        newSlots[i] = { ...newSlots[i], unlocked: true };
        unlocked++;
      }
    }
    
    return {
      towerSlots: newSlots,
      maxTowers: state.maxTowers + unlocked,
    };
  }),


  // ✅ WALL SYSTEM Implementation
  upgradeWall: () => set((state) => {
    const cost = 200 * (state.wallLevel + 1); // ✅ FIX: Hardcoded wall cost formula
    if (state.gold < cost) return {};
    
    return {
      wallLevel: state.wallLevel + 1,
      globalWallStrength: 10 + (state.wallLevel * 5), // ✅ FIX: Hardcoded wall strength formula
      gold: state.gold - cost,
      defenseUpgradesPurchased: state.defenseUpgradesPurchased + 1,
      totalGoldSpent: state.totalGoldSpent + cost,
    };
  }),

  damageWall: (slotIdx: number) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower || slot.tower.wallStrength <= 0) return {};
    
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = {
      ...slot,
      tower: { ...slot.tower, wallStrength: slot.tower.wallStrength - 1 }
    };
    
    if (newSlots[slotIdx].tower?.wallStrength === 0) {
      return {
        towerSlots: newSlots,
        lastWallDestroyed: performance.now(),
      };
    }
    
    return { towerSlots: newSlots };
  }),

  regenerateWalls: () => set((state) => {
    if (!state.wallRegenerationActive) return {};
    
    const newSlots = state.towerSlots.map(slot => {
      if (slot.tower && slot.tower.wallStrength < 10) {
        return {
          ...slot,
          tower: { ...slot.tower, wallStrength: 10 }
        };
      }
      return slot;
    });
    
    return {
      towerSlots: newSlots,
      wallRegenerationActive: false,
    };
  }),

  // ✅ FROST SYSTEM Implementation
  activateFrostEffect: () => set(() => ({
    frostEffectActive: true,
    frostEffectStartTime: performance.now(),
  })),

  deactivateFrostEffect: () => set(() => ({
    frostEffectActive: false,
  })),

  // ✅ TILE ACTIONS Implementation
  performTileAction: (slotIdx: number, action: 'wall' | 'trench' | 'buff') => set((state) => {
    if (state.actionsRemaining < 1) return {};
    
    const newSlots = [...state.towerSlots];
    const slot = newSlots[slotIdx];
    
    // Apply modifier
    slot.modifier = {
      type: action,
      expiresAt: Date.now() + 30000, // 30 second duration
    };
    
    return {
      towerSlots: newSlots,
      actionsRemaining: state.actionsRemaining - 1,
    };
  }),

  // ✅ TOWER UPGRADE LISTENERS
  addTowerUpgradeListener: (fn: TowerUpgradeListener) => set((state) => ({
    towerUpgradeListeners: [...state.towerUpgradeListeners, fn]
  })),

  // ✅ CRITICAL FIX: Wave and Preparation System

  // ✅ POWER MARKET Implementation
  setGold: (amount: number) => {
    // Security validation
    const validation = securityManager.validateStateChange('setGold', {}, { gold: amount });
    if (!validation.valid) {
      console.warn('🔒 Security: setGold blocked:', validation.reason);
      securityManager.logSecurityEvent('state_manipulation_attempt', {
        action: 'setGold',
        amount,
        reason: validation.reason
      }, 'critical');
      return;
    }
    
    set(() => ({ gold: amount }));
  },
  
  setEnergyBoostLevel: (level: number) => set(() => ({ energyBoostLevel: level })),
  
  setMaxActionsLevel: (level: number) => set(() => ({ maxActionsLevel: level })),
  
  setEliteModuleLevel: (level: number) => set(() => ({ eliteModuleLevel: level })),

  // ✅ SLOT ANIMATION System
  startSlotUnlockAnimation: (slotIdx: number) => set((state) => ({
    unlockingSlots: new Set([...state.unlockingSlots, slotIdx])
  })),

  finishSlotUnlockAnimation: (slotIdx: number) => set((state) => {
    const newUnlocking = new Set(state.unlockingSlots);
    newUnlocking.delete(slotIdx);
    
    const newRecent = new Set([...state.recentlyUnlockedSlots, slotIdx]);
    
    return {
      unlockingSlots: newUnlocking,
      recentlyUnlockedSlots: newRecent,
    };
  }),

  clearRecentlyUnlockedSlots: () => set(() => ({
    recentlyUnlockedSlots: new Set<number>()
  })),

  // ✅ PACKAGE TRACKING System
  purchasePackage: (packageId: string, cost: number, maxAllowed: number) => {
    // Security validation for package purchase
    const validation = securityManager.validateStateChange('purchasePackage', {}, { 
      packageId, 
      cost, 
      maxAllowed 
    });
    
    if (!validation.valid) {
      console.warn('🔒 Security: purchasePackage blocked:', validation.reason);
      securityManager.logSecurityEvent('state_manipulation_attempt', {
        action: 'purchasePackage',
        packageId,
        cost,
        maxAllowed,
        reason: validation.reason
      }, 'high');
      return false;
    }
    
    // Additional package-specific validation
    if (!packageId || typeof packageId !== 'string') {
      securityManager.logSecurityEvent('invalid_input', {
        action: 'purchasePackage',
        packageId,
        reason: 'Invalid package ID'
      }, 'high');
      return false;
    }
    
    if (cost <= 0 || cost > 10000) {
      securityManager.logSecurityEvent('suspicious_activity', {
        action: 'purchasePackage',
        cost,
        reason: 'Invalid package cost'
      }, 'high');
      return false;
    }
    
    const state = useGameStore.getState();
    const tracker = state.packageTracker[packageId] || { purchaseCount: 0, lastPurchased: 0, maxAllowed };
    const current = tracker.purchaseCount;
    
    console.log(`🛒 purchasePackage attempt:`, {
      packageId,
      cost,
      maxAllowed,
      current,
      gold: state.gold,
      hasEnoughGold: state.gold >= cost,
      notMaxLevel: current < maxAllowed
    });
    
    if (current >= maxAllowed) {
      console.log(`❌ Purchase failed: Already at max level (${current}/${maxAllowed})`);
      return false;
    }
    
    if (state.gold < cost) {
      console.log(`❌ Purchase failed: Not enough gold (need ${cost}, have ${state.gold})`);
      return false;
    }
    
    // Log successful purchase
    securityManager.logSecurityEvent('upgrade_purchase', {
      action: 'purchasePackage',
      packageId,
      cost,
      maxAllowed
    }, 'low');
    
    useGameStore.setState({
      packageTracker: {
        ...state.packageTracker,
        [packageId]: {
          purchaseCount: current + 1,
          lastPurchased: Date.now(),
          maxAllowed,
        }
      },
      gold: state.gold - cost,
      packagesPurchased: state.packagesPurchased + 1,
      totalGoldSpent: state.totalGoldSpent + cost,
    });
    return true;
  },

  getPackageInfo: (packageId: string, maxAllowed: number) => {
    const state = useGameStore.getState();
    const tracker = state.packageTracker[packageId] || { purchaseCount: 0, lastPurchased: 0, maxAllowed };
    const purchaseCount = tracker.purchaseCount;
    return {
      purchaseCount,
      maxAllowed,
      canPurchase: purchaseCount < maxAllowed && state.gold >= 0,
      isMaxed: purchaseCount >= maxAllowed,
    };
  },

  // ✅ ACHIEVEMENT System
  initializeAchievements: () => {
    // Implementation will be added when achievement system is ready
    console.log('Achievement system initialized');
  },

  triggerAchievementEvent: (eventType: string, eventData?: unknown) => {
    // Implementation will be added when achievement system is ready
    console.log(`Achievement event: ${eventType}`, eventData);
  },


  unlockTowerType: (towerType: string) => set((state) => {
    if (state.unlockedTowerTypes && state.unlockedTowerTypes.includes(towerType)) return {};
    return {
      unlockedTowerTypes: [...(state.unlockedTowerTypes || []), towerType]
    };
  }),
  unlockSkin: (skinName: string) => set((state) => {
    if (state.playerProfile.unlockedCosmetics.includes(skinName)) return {};
    return {
      playerProfile: {
        ...state.playerProfile,
        unlockedCosmetics: [...state.playerProfile.unlockedCosmetics, skinName]
      }
    };
  }),

  // ✅ INDIVIDUAL FIRE UPGRADE TRACKING System (fixes sayaç problemi)
  purchaseIndividualFireUpgrade: (upgradeId: string, cost: number, maxLevel: number) => {
    const state = useGameStore.getState();
    const currentLevel = state.individualFireUpgrades[upgradeId] || 0;
    
    console.log(`🛒 purchaseIndividualFireUpgrade called:`, {
      upgradeId,
      cost,
      maxLevel,
      currentLevel,
      gold: state.gold,
      hasEnoughGold: state.gold >= cost,
      notMaxLevel: currentLevel < maxLevel
    });
    
    if (currentLevel >= maxLevel) {
      console.log(`❌ Purchase failed: Already at max level (${currentLevel}/${maxLevel})`);
      return false;
    }
    
    if (state.gold < cost) {
      console.log(`❌ Purchase failed: Not enough gold (need ${cost}, have ${state.gold})`);
      return false;
    }
    
    console.log(`✅ Purchase approved: ${upgradeId} ${currentLevel} → ${currentLevel + 1}`);
    
    useGameStore.setState({
      individualFireUpgrades: {
        ...state.individualFireUpgrades,
        [upgradeId]: currentLevel + 1,
      },
      gold: state.gold - cost,
      fireUpgradesPurchased: state.fireUpgradesPurchased + 1, // Global sayaç için
      totalGoldSpent: state.totalGoldSpent + cost,
    });
    
    console.log(`💾 State updated: ${upgradeId} level ${currentLevel + 1}, gold ${state.gold - cost}`);
    return true;
  },

  getIndividualFireUpgradeInfo: (upgradeId: string, maxLevel: number) => {
    const state = useGameStore.getState();
    const currentLevel = state.individualFireUpgrades[upgradeId] || 0;
    return {
      currentLevel,
      maxLevel,
      canUpgrade: currentLevel < maxLevel, // CRITICAL FIX: Cost kontrolü UI'da yapılacak
      isMaxed: currentLevel >= maxLevel,
    };
  },

  // ✅ INDIVIDUAL SHIELD UPGRADE TRACKING System
  purchaseIndividualShieldUpgrade: (upgradeId: string, cost: number, maxLevel: number) => {
    const state = useGameStore.getState();
    const currentLevel = state.individualShieldUpgrades[upgradeId] || 0;
    
    if (currentLevel >= maxLevel || state.gold < cost) {
      return false;
    }
    
    useGameStore.setState({
      individualShieldUpgrades: {
        ...state.individualShieldUpgrades,
        [upgradeId]: currentLevel + 1,
      },
      gold: state.gold - cost,
      shieldUpgradesPurchased: state.shieldUpgradesPurchased + 1, // Global sayaç için
      totalGoldSpent: state.totalGoldSpent + cost,
    });
    return true;
  },

  getIndividualShieldUpgradeInfo: (upgradeId: string, maxLevel: number) => {
    const state = useGameStore.getState();
    const currentLevel = state.individualShieldUpgrades[upgradeId] || 0;
    return {
      currentLevel,
      maxLevel,
      canUpgrade: currentLevel < maxLevel, // CRITICAL FIX: Cost kontrolü UI'da yapılacak
      isMaxed: currentLevel >= maxLevel,
    };
  },

  // ✅ INDIVIDUAL DEFENSE UPGRADE TRACKING System
  purchaseIndividualDefenseUpgrade: (upgradeId: string, cost: number, maxLevel: number) => {
    const state = useGameStore.getState();
    const currentLevel = state.individualDefenseUpgrades[upgradeId] || 0;
    
    if (currentLevel >= maxLevel || state.gold < cost) {
      return false;
    }
    
    useGameStore.setState({
      individualDefenseUpgrades: {
        ...state.individualDefenseUpgrades,
        [upgradeId]: currentLevel + 1,
      },
      gold: state.gold - cost,
      defenseUpgradesPurchased: state.defenseUpgradesPurchased + 1, // Global sayaç için
      totalGoldSpent: state.totalGoldSpent + cost,
    });
    return true;
  },

  getIndividualDefenseUpgradeInfo: (upgradeId: string, maxLevel: number) => {
    const state = useGameStore.getState();
    const currentLevel = state.individualDefenseUpgrades[upgradeId] || 0;
    return {
      currentLevel,
      maxLevel,
      canUpgrade: currentLevel < maxLevel, // CRITICAL FIX: Cost kontrolü UI'da yapılacak
      isMaxed: currentLevel >= maxLevel,
    };
  },
}));

// CRITICAL FIX: Initialize energy manager with proper error handling
try {
  const initialEnergy = initialState.energy || GAME_CONSTANTS.BASE_ENERGY || 100;
  const maxEnergy = initialState.maxEnergy || GAME_CONSTANTS.ENERGY_SYSTEM?.MAX_ENERGY_BASE || 100;
  
  energyManager.init(
    initialEnergy, 
    (e, w) => {
      // CRITICAL FIX: Validate energy value before setting
      if (isNaN(e) || e < 0) {
        console.warn('⚠️ Energy manager returned invalid value, resetting:', e);
        e = GAME_CONSTANTS.BASE_ENERGY || 100;
      }
      useGameStore.setState({ energy: e, energyWarning: w ?? null });
    }, 
    maxEnergy
  );
  
  console.log('✅ Energy Manager initialized successfully');
} catch (error) {
  console.error('❌ Energy Manager initialization failed:', error);
  // Fallback initialization
  energyManager.reset();
}

// Energy regeneration when a wave completes
waveManager.on('complete', () => {
  const { lostTowerThisWave, waveStartTime } = useGameStore.getState();
  let bonus = GAME_CONSTANTS.ENERGY_REGEN_WAVE;
  if (!lostTowerThisWave) bonus += 5;
  if (performance.now() - waveStartTime < 60000) bonus += 5;
  energyManager.add(bonus, 'waveComplete');
});

export { addEnemyKillListener, removeEnemyKillListener };
