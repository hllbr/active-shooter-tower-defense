import { create } from 'zustand';
import type { GameState, Tower, TowerSlot, Enemy, Bullet, Effect, Mine, Position, TowerUpgradeListener } from '../gameTypes';
import { GAME_CONSTANTS } from '../../utils/constants';
// import { DailyMissionsManager } from '../../logic/DailyMissionsManager';
import { updateWaveTiles } from '../../game-systems/TowerPlacementManager';
import { waveRules } from '../../config/waveRules';
import { energyManager } from '../../game-systems/EnergyManager';
import { waveManager } from '../../game-systems/WaveManager';
import { upgradeEffectsManager } from '../../game-systems/UpgradeEffects';
import { initialState } from './initialState';
import { securityManager } from '../../security/SecurityManager';

const getValidMinePosition = (towerSlots: TowerSlot[]): Position => {
  let position: Position;
  let isTooClose;
  const { MINE_MIN_DISTANCE_FROM_TOWER } = GAME_CONSTANTS;
  
  // Kullanıcının gerçek ekran boyutlarını kullan (görünür alan)
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const margin = 80; // Kenar boşluğu (mayın boyutu + güvenlik)

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

// Listener tipi
let enemyKillListeners: ((isSpecial?: boolean, enemyType?: string) => void)[] = [];

const addEnemyKillListener = (fn: (isSpecial?: boolean, enemyType?: string) => void) => {
  enemyKillListeners.push(fn);
};
const removeEnemyKillListener = (fn: (isSpecial?: boolean, enemyType?: string) => void) => {
  enemyKillListeners = enemyKillListeners.filter(l => l !== fn);
};

export type Store = GameState & {
  buildTower: (slotIdx: number, free?: boolean, towerType?: 'attack' | 'economy') => void;
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
  
  // Achievement System Functions (Faz 1: Temel Mekanikler)
  initializeAchievements: () => void;
  triggerAchievementEvent: (eventType: string, eventData?: unknown) => void;

  addEnemyKillListener: (fn: (isSpecial?: boolean, enemyType?: string) => void) => void;
  removeEnemyKillListener: (fn: (isSpecial?: boolean, enemyType?: string) => void) => void;

  unlockTowerType: (towerType: string) => void;
  unlockSkin: (skinName: string) => void;
};

export const useGameStore = create<Store>((set, get): Store => ({
  ...initialState,

  buildTower: (slotIdx, free = false, towerType: 'attack' | 'economy' = 'attack') => set((state) => {
    const slot = state.towerSlots[slotIdx];
    const cost = free ? 0 : GAME_CONSTANTS.TOWER_COST;
    
    // Enhanced validation with proper checks
    if (!slot.unlocked) {
      console.log(`❌ Cannot build tower: Slot ${slotIdx} is locked`);
      return {};
    }
    if (slot.tower) {
      console.log(`❌ Cannot build tower: Slot ${slotIdx} already has a tower`);
      return {};
    }
    if (state.gold < cost) {
      console.log(`❌ Cannot build tower: Need ${cost} gold, have ${state.gold}`);
      return {};
    }
    if (state.towers.length >= state.maxTowers) {
      console.log(`❌ Cannot build tower: Tower limit reached (${state.towers.length}/${state.maxTowers})`);
      return {};
    }
    
    const energyCost = GAME_CONSTANTS.ENERGY_COSTS.buildTower;
    if (!energyManager.consume(energyCost, 'buildTower')) {
      console.log(`❌ Cannot build tower: Not enough energy (need ${energyCost})`);
      return {};
    }
    
    console.log(`✅ Building ${towerType} tower at slot ${slotIdx}. Towers: ${state.towers.length + 1}/${state.maxTowers}`);
    
    const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[0]; // Level 1
    const newTower: Tower = {
      id: `${Date.now()}-${Math.random()}`,
      position: { x: slot.x, y: slot.y },
      size: GAME_CONSTANTS.TOWER_SIZE,
      isActive: true,
      level: 1,
      range: towerType === 'economy' ? 0 : GAME_CONSTANTS.TOWER_RANGE,
      damage: towerType === 'economy' ? 0 : upgrade.damage,
      fireRate: towerType === 'economy' ? 0 : upgrade.fireRate,
      lastFired: 0,
      health: upgrade.health,
      maxHealth: upgrade.health,
      wallStrength: upgradeEffectsManager.applyShieldUpgrades(state.globalWallStrength),
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
      attackSound: towerType === 'economy' ? undefined : GAME_CONSTANTS.TOWER_ATTACK_SOUNDS[0],
      visual: GAME_CONSTANTS.TOWER_VISUALS.find(v => v.level === 1),
      rangeMultiplier: slot.modifier?.type === 'buff'
        ? GAME_CONSTANTS.BUFF_RANGE_MULTIPLIER
        : 1,
      towerType,
    };
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: newTower, wasDestroyed: false };
    state.towerUpgradeListeners.forEach(fn => fn(newTower, 0, 1));
    
    // ✅ SOUND FIX: Play tower build sound effect
    setTimeout(() => {
      import('../../utils/sound').then(({ playContextualSound }) => {
        playContextualSound('tower-build'); // Kule inşa sesi
      });
    }, 50);
    
    return {
      towers: [...state.towers, newTower],
      towerSlots: newSlots,
      gold: state.gold - cost,
      totalGoldSpent: state.totalGoldSpent + cost,
    };
  }),

  unlockSlot: (slotIdx: number) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    
    if (slot.unlocked) {
      console.log(`❌ Slot ${slotIdx} already unlocked`);
      return {}; // Already unlocked
    }
    
    const cost = GAME_CONSTANTS.TOWER_SLOT_UNLOCK_GOLD[slotIdx] ?? 2400;
    if (state.gold < cost) {
      console.log(`❌ Not enough gold: need ${cost}, have ${state.gold}`);
      return {}; // Not enough gold
    }
    
    const energyCost = GAME_CONSTANTS.ENERGY_COSTS.buildTower; // Same as building
    if (!energyManager.consume(energyCost, 'unlockSlot')) {
      console.log(`❌ Not enough energy: need ${energyCost}`);
      return {};
    }
    
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, unlocked: true };
    
    console.log(`✅ Slot ${slotIdx} unlocked! Cost: ${cost}💰, New tower limit: ${state.maxTowers + 1}`);
    
    // ✅ SOUND & ANIMATION FIX: Play unlock sound and trigger animations
    setTimeout(() => {
      // Play unlock sound effect
      import('../../utils/sound').then(({ playContextualSound }) => {
        playContextualSound('unlock'); // Kilit açma sesi
      });
      
      // Start unlock animation sequence
      const { startSlotUnlockAnimation, finishSlotUnlockAnimation } = useGameStore.getState();
      startSlotUnlockAnimation(slotIdx);
      
      // Finish unlock animation after delay
      setTimeout(() => {
        finishSlotUnlockAnimation(slotIdx);
        
        // Clear recently unlocked after full animation sequence
        setTimeout(() => {
          const { clearRecentlyUnlockedSlots } = useGameStore.getState();
          clearRecentlyUnlockedSlots();
        }, 3000); // Keep celebration visible for 3 seconds
      }, 800); // First animation phase duration
    }, 50);
    
    return {
      towerSlots: newSlots,
      gold: state.gold - cost,
      maxTowers: state.maxTowers + 1, // ← CRITICAL FIX: Increase tower limit!
      totalGoldSpent: state.totalGoldSpent + cost,
    };
  }),

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
    
    // ✅ CRITICAL FIX: ALL enemies count toward wave completion, not just non-special ones
    // This was the main bug preventing wave progression
    const newKillCount = state.enemiesKilled + 1;
    
    // DEBUG: Log enemy kills for Wave 1
    if (state.currentWave === 1) {
      console.log(`💀 Enemy killed! Wave ${state.currentWave}: ${newKillCount}/${state.enemiesRequired} (${enemy.type}, special: ${enemy.isSpecial})`);
    }
    
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
        // ✅ CRITICAL FIX: ALL enemies count toward wave completion, not just non-special ones
        // This was also causing wave progression issues in damageEnemy path
        const newKillCount = state.enemiesKilled + 1;
        
        // DEBUG: Log enemy kills for Wave 1 
        if (state.currentWave === 1) {
          console.log(`💀 Enemy killed! Wave ${state.currentWave}: ${newKillCount}/${state.enemiesRequired} (${enemy.type}, special: ${enemy.isSpecial})`);
        }
        
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
  
  damageTower: (slotIdx: number, dmg: number) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    
    if (slot.tower.wallStrength > 0) {
      const newWallStrength = Math.max(0, slot.tower.wallStrength - dmg);
      const newSlots = [...state.towerSlots];
      newSlots[slotIdx] = {
        ...slot,
        tower: { ...slot.tower, wallStrength: newWallStrength }
      };
      return { towerSlots: newSlots };
    } else {
      const newHealth = slot.tower.health - dmg;
      if (newHealth <= 0) {
        const newSlots = [...state.towerSlots];
        newSlots[slotIdx] = { ...slot, tower: null, wasDestroyed: true };
        const newTowers = state.towers.filter(t => t.id !== slot.tower!.id);
        
        // ✅ CRITICAL FIX: Check if all towers are destroyed - trigger game over
        const shouldGameOver = newTowers.length === 0 && state.isStarted && !state.isGameOver;
        
        if (shouldGameOver) {
          console.log('💀 Game Over: All towers destroyed!');
          
          // ✅ Stop all spawning immediately
          import('../../game-systems/EnemySpawner').then(({ stopEnemyWave }) => {
            stopEnemyWave();
          });
          
          setTimeout(() => {
            // Use playContextualSound from sound.ts
            import('../../utils/sound').then(({ playContextualSound }) => {
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
      } else {
        const newSlots = [...state.towerSlots];
        newSlots[slotIdx] = {
          ...slot,
          tower: { ...slot.tower, health: newHealth }
        };
        return { towerSlots: newSlots };
      }
    }
  }),
  
  removeTower: (slotIdx: number) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: null };
    
    return {
      towerSlots: newSlots,
      towers: state.towers.filter(t => t.id !== slot.tower!.id),
    };
  }),
  
  dismantleTower: (slotIdx: number) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    
    const refund = Math.floor(GAME_CONSTANTS.TOWER_COST * 0.7); // 70% refund
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = { ...slot, tower: null };
    
    return {
      towerSlots: newSlots,
      towers: state.towers.filter(t => t.id !== slot.tower!.id),
      gold: state.gold + refund,
    };
  }),
  
  moveTower: (fromIdx: number, toIdx: number) => set((state) => {
    const fromSlot = state.towerSlots[fromIdx];
    const toSlot = state.towerSlots[toIdx];
    
    if (!fromSlot.tower || toSlot.tower || !toSlot.unlocked) return {};
    
    const newSlots = [...state.towerSlots];
    newSlots[toIdx] = { ...toSlot, tower: fromSlot.tower };
    newSlots[fromIdx] = { ...fromSlot, tower: null };
    
    return { towerSlots: newSlots };
  }),
  
  addEnemy: (enemy: Enemy) => set((state) => ({
    enemies: [...state.enemies, enemy]
  })),
  
  addBullet: (bullet: Bullet) => set((state) => ({
    bullets: [...state.bullets, bullet]
  })),
  
  removeBullet: (bulletId: string) => set((state) => ({
    bullets: state.bullets.filter(b => b.id !== bulletId)
  })),
  
  addEffect: (effect: Effect) => set((state) => ({
    effects: [...state.effects, effect]
  })),
  
  removeEffect: (effectId: string) => set((state) => ({
    effects: state.effects.filter(e => e.id !== effectId)
  })),
  
  buyWall: (slotIdx: number) => set((state) => {
    const cost = GAME_CONSTANTS.WALL_COST;
    if (state.gold < cost) return {};
    
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower) return {};
    
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = {
      ...slot,
      tower: { ...slot.tower, wallStrength: 10 }
    };
    
    return {
      towerSlots: newSlots,
      gold: state.gold - cost,
      totalGoldSpent: state.totalGoldSpent + cost,
    };
  }),
  
  hitWall: (slotIdx: number) => set((state) => {
    const slot = state.towerSlots[slotIdx];
    if (!slot.tower || slot.tower.wallStrength <= 0) return {};
    
    const newSlots = [...state.towerSlots];
    newSlots[slotIdx] = {
      ...slot,
      tower: { ...slot.tower, wallStrength: slot.tower.wallStrength - 1 }
    };
    
    return { towerSlots: newSlots };
  }),
  
  purchaseShield: (idx: number, free?: boolean) => set((state) => {
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

  // ✅ CRITICAL FIX: Wave progression implementation
  nextWave: () => set((state) => {
    const newWave = state.currentWave + 1;
    const newEnemiesRequired = GAME_CONSTANTS.getWaveEnemiesRequired(newWave);
    
    // ✅ FIX: Simple wave income calculation to avoid dependency issues
    const waveIncome = Math.floor(50 + (state.currentWave * 10)); // Basic wave income formula
    
    console.log(`📈 Wave ${state.currentWave} → ${newWave}: Income +${waveIncome} gold`);
    
    // Reset wave-specific counters
    return {
      currentWave: newWave,
      enemiesKilled: 0, // ✅ CRITICAL: Reset kill counter for new wave
      enemiesRequired: newEnemiesRequired, // ✅ CRITICAL: Update required enemies
      gold: state.gold + waveIncome, // Passive income from wave completion
      lostTowerThisWave: false,
      waveStartTime: performance.now(),
      currentWaveModifier: waveRules[newWave] || null,
      // Update tile configurations for new wave
      towerSlots: updateWaveTiles(newWave, state.towerSlots),
    };
  }),

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

  rollDice: () => set((state) => {
    if (state.diceUsed) return {};
    
    // ✅ CRITICAL FIX: Start dice rolling animation first
    useGameStore.setState({ isDiceRolling: true });
    
    // Wait for animation, then set result
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const multiplier = roll >= 4 ? (roll === 6 ? 0.5 : roll === 5 ? 0.6 : 0.7) : 
                        roll === 3 ? 0.8 : roll === 2 ? 0.9 : 1.0;
      
      useGameStore.setState({
        diceRoll: roll, // ✅ FIX: Store just the number, not object
        discountMultiplier: multiplier,
        diceUsed: true,
        isDiceRolling: false,
      });
      
      console.log(`🎲 Dice rolled: ${roll}, Multiplier: ${multiplier.toFixed(1)}`);
    }, 2000); // 2 second animation
    
    return {}; // Return empty to avoid immediate state update
  }),

  resetDice: () => set(() => ({
    diceRoll: null,
    diceUsed: false,
    discountMultiplier: 1,
    isDiceRolling: false,
  })),

  setDiceResult: (roll: number, _multiplier: number) => set(() => ({
    diceResult: roll // ✅ FIX: Just store the roll number 
  })),

  // ✅ MINING SYSTEM Implementation
  upgradeMines: () => set((state) => {
    const cost = 100; // ✅ FIX: Use hardcoded cost instead of missing constant
    if (state.gold < cost) return {};
    
    return {
      mineLevel: state.mineLevel + 1,
      gold: state.gold - cost,
      defenseUpgradesPurchased: state.defenseUpgradesPurchased + 1,
      totalGoldSpent: state.totalGoldSpent + cost,
    };
  }),

  deployMines: () => set((state) => {
    if (state.mineLevel === 0) return {};
    
    const newMines: Mine[] = [];
    const mineCount = Math.min(state.mineLevel, 5); // Max 5 mines
    
    for (let i = 0; i < mineCount; i++) {
      newMines.push({
        id: `mine-${Date.now()}-${i}`,
        position: getValidMinePosition(state.towerSlots),
        damage: 50 + (state.mineLevel * 10), // ✅ FIX: Use hardcoded damage formula
        size: 20, // ✅ FIX: Add missing size property
        radius: 50, // ✅ FIX: Add missing radius property
      });
    }
    
    return { mines: newMines };
  }),

  triggerMine: (mineId: string) => set((state) => ({
    mines: state.mines.filter(m => m.id !== mineId)
  })),

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
  startPreparation: () => set(() => ({
    isPreparing: true,
    isPaused: false,
    prepRemaining: GAME_CONSTANTS.PREP_TIME,
  })),

  tickPreparation: (delta: number) => set((state) => {
    if (!state.isPreparing || state.isPaused) return {};
    
    const newRemaining = Math.max(0, state.prepRemaining - delta);
    
    return {
      prepRemaining: newRemaining,
      isPreparing: newRemaining > 0,
    };
  }),

  pausePreparation: () => set((state) => 
    state.isPreparing ? { isPaused: true } : {}
  ),

  resumePreparation: () => set((state) => 
    state.isPreparing ? { isPaused: false } : {}
  ),

  speedUpPreparation: (amount: number) => set((state) => ({
    prepRemaining: Math.max(0, state.prepRemaining - amount)
  })),

  // ✅ CRITICAL FIX: Wave Start Implementation
  startWave: () => set((state) => {
    console.log(`🚀 Starting Wave ${state.currentWave}!`);
    
    // ✅ ENHANCED: Start enemy spawning when wave begins
    setTimeout(() => {
      import('../../game-systems/EnemySpawner').then(({ startEnemyWave }) => {
        startEnemyWave(state.currentWave);
      });
    }, 100); // Small delay to ensure state is updated
    
    return {
      isPreparing: false,
      isPaused: false,
      isStarted: true,
      waveStartTime: performance.now(),
      lostTowerThisWave: false,
      // Reset preparation timer for next wave
      prepRemaining: GAME_CONSTANTS.PREP_TIME,
    };
  }),

  consumeEnergy: (amount: number, action: string) => {
    const success = energyManager.consume(amount, action);
    return success;
  },
  
  addEnergy: (amount: number, action?: string) => {
    // Security validation for energy addition
    const validation = securityManager.validateStateChange('addEnergy', {}, { energy: amount });
    if (!validation.valid) {
      console.warn('🔒 Security: addEnergy blocked:', validation.reason);
      securityManager.logSecurityEvent('state_manipulation_attempt', {
        action: 'addEnergy',
        amount,
        actionType: action || 'manual',
        reason: validation.reason
      }, 'high');
      return;
    }
    
    energyManager.add(amount, action || 'manual');
  },
  
  clearEnergyWarning: () => set(() => ({
    energyWarning: null
  })),
  
  // ✅ ENERGY SYSTEM Implementation
  upgradeEnergySystem: (upgradeId: string) => set((state) => {
    const upgrade = GAME_CONSTANTS.POWER_MARKET.ENERGY_UPGRADES?.find(u => u.id === upgradeId);
    if (!upgrade) return {};
    
    const currentLevel = state.energyUpgrades[upgradeId] || 0;
    const cost = upgrade.cost * Math.pow(1.5, currentLevel); // Standard cost scaling
    
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

  onEnemyKilled: (isSpecial?: boolean, enemyType?: string) => set((state) => {
    const now = performance.now();
    const timeSinceLastKill = now - state.lastKillTime;
    
    // Combo system: kills within 3 seconds maintain combo
    const newCombo = timeSinceLastKill < 3000 ? state.killCombo + 1 : 1;
    
    // Energy bonus calculation - CRITICAL FIX: Add null checks
    let energyBonus = GAME_CONSTANTS.ENERGY_REGEN_KILL || 2;
    if (isSpecial) energyBonus *= 2; // Special enemies give double energy
    if (newCombo > 5) energyBonus += Math.floor(newCombo / 5); // Combo bonus
    
    // CRITICAL FIX: Only add energy if it's a valid number
    if (!isNaN(energyBonus) && energyBonus > 0) {
      energyManager.add(energyBonus, 'enemyKill');
    }
    
    // Challenge event listener tetikleme
    setTimeout(() => {
      enemyKillListeners.forEach(fn => fn(isSpecial, enemyType));
    }, 0);
    
    return {
      killCombo: newCombo,
      lastKillTime: now,
      totalKills: state.totalKills + 1,
    };
  }),

  tickEnergyRegen: (_deltaTime: number) => {
    energyManager.tick(_deltaTime);
  },

  calculateEnergyStats: () => {
    const state = useGameStore.getState();
    const baseRegen = GAME_CONSTANTS.ENERGY_REGEN_PASSIVE || 0.5;
    const upgradeMultiplier = 1 + (state.energyUpgrades['passiveRegen'] || 0) * 0.1;
    
    return {
      passiveRegen: baseRegen * upgradeMultiplier,
      maxEnergy: state.getMaxEnergy(),
      killBonus: GAME_CONSTANTS.ENERGY_REGEN_KILL || 2,
      efficiency: state.energyEfficiency || 0,
    };
  },

  // ✅ DYNAMIC CALCULATIONS
  getMaxEnergy: () => {
    const state = useGameStore.getState();
    const baseMax = GAME_CONSTANTS.ENERGY_SYSTEM.MAX_ENERGY_BASE;
    const upgradeBonus = (state.energyUpgrades['maxEnergy'] || 0) * 20;
    return baseMax + upgradeBonus;
  },

  getMaxActions: () => {
    const state = useGameStore.getState();
    const baseActions = GAME_CONSTANTS.ACTION_SYSTEM.BASE_ACTIONS;
    const upgradeBonus = state.maxActionsLevel * 2;
    return baseActions + upgradeBonus;
  },

  // ✅ ACTION SYSTEM Implementation
  tickActionRegen: (_deltaTime: number) => set((state) => {
    const now = performance.now();
    const timeSinceLastRegen = now - state.lastActionRegen;
    
    if (timeSinceLastRegen >= state.actionRegenTime) {
      const maxActions = state.getMaxActions();
      if (state.actionsRemaining < maxActions) {
        return {
          actionsRemaining: Math.min(maxActions, state.actionsRemaining + 1),
          lastActionRegen: now,
        };
      }
    }
    
    return {};
  }),

  addAction: (amount: number) => {
    // Security validation for action addition
    const validation = securityManager.validateStateChange('addAction', {}, { actions: amount });
    if (!validation.valid) {
      console.warn('🔒 Security: addAction blocked:', validation.reason);
      securityManager.logSecurityEvent('state_manipulation_attempt', {
        action: 'addAction',
        amount,
        reason: validation.reason
      }, 'high');
      return;
    }
    
    set((state) => ({
      actionsRemaining: Math.min(state.getMaxActions(), state.actionsRemaining + amount)
    }));
  },

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
    
    if (current >= maxAllowed || state.gold < cost) {
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

  addEnemyKillListener,
  removeEnemyKillListener,

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