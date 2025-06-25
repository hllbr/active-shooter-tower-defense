import { create } from 'zustand';
import type { GameState, Tower, TowerSlot, Enemy, Bullet, Effect, Mine, Position, TowerUpgradeListener, TileModifier } from './gameTypes';
import { GAME_CONSTANTS } from '../utils/Constants';
import { AchievementManager } from '../logic/AchievementManager';
// import { DailyMissionsManager } from '../logic/DailyMissionsManager';
import { updateWaveTiles } from '../logic/TowerPlacementManager';
import { waveRules } from '../config/waveRules';
import { economyConfig, calculateTotalWaveIncome } from '../config/economy';
import { energyManager } from '../logic/EnergyManager';
import { waveManager } from '../logic/WaveManager';
import { playSound } from '../utils/sound';
import { upgradeEffectsManager } from '../logic/UpgradeEffects';

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

const initialSlots: TowerSlot[] = updateWaveTiles(1, []);

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
  isRefreshing: false,
  diceRoll: null,
  diceUsed: false,
  discountMultiplier: 1,
  isDiceRolling: false,
  wallLevel: 0,
  globalWallActive: true,
  lastWallDestroyed: 0,
  wallRegenerationActive: false,
  frostEffectActive: false,
  frostEffectStartTime: 0,
  originalEnemySpeeds: new Map(),
  currentWaveModifier: waveRules[1],
  towerUpgradeListeners: [],
  energy: GAME_CONSTANTS.BASE_ENERGY,
  energyWarning: null,
  actionsRemaining: GAME_CONSTANTS.MAP_ACTIONS_PER_WAVE,
  prepRemaining: GAME_CONSTANTS.PREP_TIME,
  isPreparing: false,
  isPaused: false,
  waveStartTime: 0,
  lostTowerThisWave: false,
  lastUpdate: 0,
  
  // Yeni Enerji Sistemi  
  energyUpgrades: {},
  maxEnergy: GAME_CONSTANTS.ENERGY_SYSTEM.MAX_ENERGY_BASE, // Dynamic olarak güncellenecek
  killCombo: 0,
  lastKillTime: 0,
  totalKills: 0,
  energyEfficiency: 0,
  
  // Gelişmiş Action Sistemi
  maxActions: GAME_CONSTANTS.ACTION_SYSTEM.BASE_ACTIONS,
  actionRegenTime: GAME_CONSTANTS.ACTION_SYSTEM.ACTION_REGEN_TIME,
  lastActionRegen: 0,

  // PowerMarket upgrade levels
  energyBoostLevel: 0,
  maxActionsLevel: 0,
  eliteModuleLevel: 0,
  diceResult: null,
  
  // Slot Unlock Animation System
  unlockingSlots: new Set<number>(), // Şu anda animasyonda olan slot'lar
  recentlyUnlockedSlots: new Set<number>(), // Son 3 saniyede açılan slot'lar
  
  // Defense Upgrade Limits (CRITICAL FIX for unlimited purple cards)
  defenseUpgradeLimits: {
    mines: { 
      current: 0, 
      max: GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.MINES.MAX_PURCHASES, 
      purchaseCount: 0 
    },
    walls: { 
      current: 0, 
      max: GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.WALLS.MAX_PURCHASES, 
      purchaseCount: 0 
    },
  },
  
  // CRITICAL FIX: Individual Package Tracking System (fixes "0/10 stays 0/10" bug)
  packageTracker: {},
  
  // Notification System for User Feedback (fixes "can't tell if purchase worked")
  notifications: [],
  
  // Achievement & Player Progression System (Faz 1: Temel Mekanikler)
  // Initialized in constructor
  playerProfile: {
    level: 1,
    experience: 0,
    experienceToNext: 1000,
    achievementsCompleted: 0,
    achievementPoints: 0,
    unlockedTitles: ['Çaylak'],
    activeTitle: 'Çaylak',
    statistics: {
      totalWavesCompleted: 0,
      highestWaveReached: 0,
      totalPlaytime: 0,
      gamesPlayed: 0,
      totalEnemiesKilled: 0,
      totalDamageDealt: 0,
      perfectWaves: 0,
      totalTowersBuilt: 0,
      totalTowersLost: 0,
      highestTowerLevel: 0,
      totalUpgradesPurchased: 0,
      totalGoldEarned: 0,
      totalGoldSpent: 0,
      totalPackagesPurchased: 0,
      bestGoldPerWave: 0,
      speedrunRecords: {},
      efficiencyRecords: {},
      survivalStreaks: []
    },
    unlockedCosmetics: [],
    researchPoints: 0,
    permanentBonuses: {}
  },
  achievements: {}, // Will be initialized
  achievementSeries: {}, // Will be initialized
  gameStartTime: Date.now(),
  
  // Daily Missions System
  dailyMissions: [],
  lastMissionRefresh: 0,
};

type Store = GameState & {
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
  onEnemyKilled: (isSpecial?: boolean) => void;
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
  
  // Notification System Functions (fixes "can't tell if purchase worked")
  addNotification: (type: 'success' | 'error' | 'info' | 'warning', message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Achievement System Functions (Faz 1: Temel Mekanikler)
  initializeAchievements: () => void;
  triggerAchievementEvent: (eventType: string, eventData?: unknown) => void;
};

export const useGameStore = create<Store>((set, get) => ({
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
    
    return {
      towerSlots: newSlots,
      gold: state.gold - cost,
      maxTowers: state.maxTowers + 1, // ← CRITICAL FIX: Increase tower limit!
      totalGoldSpent: state.totalGoldSpent + cost,
    };
  }),

  addGold: (amount: number) => set((state) => ({ gold: state.gold + amount })),
  spendGold: (amount: number) => set((state) => ({
    gold: state.gold - amount,
    totalGoldSpent: state.totalGoldSpent + amount,
  })),
  
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
    setTimeout(() => get().onEnemyKilled(enemy.isSpecial), 0);
    
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
        setTimeout(() => get().onEnemyKilled(enemy.isSpecial), 0);
        
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

  // Simplified core methods to avoid syntax issues - add rest as needed
  upgradeTower: () => {},
  damageTower: () => {},
  removeTower: () => {},
  dismantleTower: () => {},
  moveTower: () => {},
  addEnemy: () => {},
  addBullet: () => {},
  removeBullet: () => {},
  addEffect: () => {},
  removeEffect: () => {},
  buyWall: () => {},
  hitWall: () => {},
  purchaseShield: () => {},
  nextWave: () => {},
  resetGame: () => {},
  setStarted: () => {},
  setRefreshing: () => {},
  upgradeBullet: () => {},
  refreshBattlefield: () => {},
  rollDice: () => {},
  resetDice: () => {},
  setDiceResult: () => {},
  upgradeMines: () => {},
  deployMines: () => {},
  triggerMine: () => {},
  upgradeWall: () => {},
  damageWall: () => {},
  regenerateWalls: () => {},
  activateFrostEffect: () => {},
  deactivateFrostEffect: () => {},
  performTileAction: () => {},
  addTowerUpgradeListener: () => {},
  startPreparation: () => {},
  tickPreparation: () => {},
  pausePreparation: () => {},
  resumePreparation: () => {},
  speedUpPreparation: () => {},
  startWave: () => {},
  consumeEnergy: () => false,
  addEnergy: () => {},
  clearEnergyWarning: () => {},
  upgradeEnergySystem: () => {},
  onEnemyKilled: () => {},
  tickEnergyRegen: () => {},
  calculateEnergyStats: () => ({ passiveRegen: 0, maxEnergy: 0, killBonus: 0, efficiency: 0 }),
  getMaxEnergy: () => 100,
  getMaxActions: () => 5,
  tickActionRegen: () => {},
  addAction: () => {},
  setGold: () => {},
  setEnergyBoostLevel: () => {},
  setMaxActionsLevel: () => {},
  setEliteModuleLevel: () => {},
  startSlotUnlockAnimation: () => {},
  finishSlotUnlockAnimation: () => {},
  clearRecentlyUnlockedSlots: () => {},
  purchasePackage: () => false,
  getPackageInfo: () => ({ purchaseCount: 0, maxAllowed: 0, canPurchase: false, isMaxed: false }),
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
  initializeAchievements: () => {},
  triggerAchievementEvent: () => {},
}));

energyManager.init(initialState.energy, (e, w) => useGameStore.setState({ energy: e, energyWarning: w ?? null }), initialState.maxEnergy);

// Energy regeneration when a wave completes
waveManager.on('complete', () => {
  const { lostTowerThisWave, waveStartTime } = useGameStore.getState();
  let bonus = GAME_CONSTANTS.ENERGY_REGEN_WAVE;
  if (!lostTowerThisWave) bonus += 5;
  if (performance.now() - waveStartTime < 60000) bonus += 5;
  energyManager.add(bonus, 'waveComplete');
}); 