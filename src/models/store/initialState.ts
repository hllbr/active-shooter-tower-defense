import type { GameState, TowerSlot, WaveStatus } from '../gameTypes';
import { GAME_CONSTANTS } from '../../utils/constants';
import { waveRules } from '../../config/waveRules';
import { updateWaveTiles } from '../../game-systems/TowerPlacementManager';
import { defenseTargetManager } from '../../game-systems/defense-systems/DefenseTargetManager';

export const initialSlots: TowerSlot[] = updateWaveTiles(1, []);

export const initialState: GameState = {
  towers: [],
  towerSlots: initialSlots,
  enemies: [],
  bullets: [],
  effects: [],
  gold: 200,
  bulletLevel: 1,
  currentWave: 1,
  enemiesKilled: 0,
  enemiesRequired: GAME_CONSTANTS.getWaveEnemiesRequired(1),
  totalEnemiesKilled: 0,
  totalGoldSpent: 0,
  totalGoldEarned: 0,
  fireUpgradesPurchased: 0,
  shieldUpgradesPurchased: 0,
  packagesPurchased: 0,
  defenseUpgradesPurchased: 0,
  
  // Enhanced Resource System
  resourceTransactions: [],
  
  // ✅ NEW: Defense Target System for Issue #65
  defenseTarget: {
    id: 'energy_core_001',
    type: 'energy_core',
    position: { x: GAME_CONSTANTS.CANVAS_WIDTH / 2, y: GAME_CONSTANTS.CANVAS_HEIGHT / 2 },
    size: 60,
    health: 1000,
    maxHealth: 1000,
    isActive: true,
    isVisible: true,
    isVulnerable: true,
    
    // Visual properties
    color: '#00ffff',
    glowIntensity: 0.8,
    pulseRate: 1.0,
    
    // Defense properties
    shieldStrength: 200,
    maxShieldStrength: 200,
    shieldRegenRate: 5,
    lastShieldRegen: 0,
    
    // Damage properties
    damageResistance: 0.1,
    criticalVulnerability: 0.05,
    
    // Effects
    activeEffects: [],
    lastDamaged: 0,
    
    // Visual indicators
    showDamageIndicator: false,
    damageIndicatorDuration: 1000,
    damageIndicatorStartTime: 0,
  },
  
  // ✅ NEW: Environment & Terrain System for Issue #62
  terrainTiles: [],
  weatherState: {
    currentWeather: 'clear',
    weatherIntensity: 0,
    visibility: 1,
    movementPenalty: 0,
    damageModifier: 1,
    duration: 0,
    startTime: 0,
    transitionTime: 0,
  },
  timeOfDayState: {
    currentPhase: 'day',
    cycleProgress: 0.5,
    lightingIntensity: 1,
    visibilityModifier: 1,
    enemyBehaviorModifier: 1,
  },
  environmentalHazards: [],
  interactiveElements: [],
  
  // CRITICAL FIX: Individual Fire Upgrade Tracking System (fixes sayaç problemi)
  individualFireUpgrades: {}, // Her fire upgrade tipi için ayrı sayaç
  individualShieldUpgrades: {}, // Her shield upgrade tipi için ayrı sayaç
  individualDefenseUpgrades: {}, // Her defense upgrade tipi için ayrı sayaç
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
  waveStatus: 'idle' as WaveStatus,
  waveStartTime: 0,
  lostTowerThisWave: false,
  lastUpdate: 0,

  energyUpgrades: {},
  maxEnergy: GAME_CONSTANTS.ENERGY_SYSTEM.MAX_ENERGY_BASE,
  killCombo: 0,
  lastKillTime: 0,
  totalKills: 0,
  energyEfficiency: 0,

  maxActions: GAME_CONSTANTS.ACTION_SYSTEM.BASE_ACTIONS,
  actionRegenTime: GAME_CONSTANTS.ACTION_SYSTEM.ACTION_REGEN_TIME,
  lastActionRegen: 0,

  energyBoostLevel: 0,
  maxActionsLevel: 0,
  eliteModuleLevel: 0,
  diceResult: null,
  
  // Defense Upgrade Limits System (CRITICAL FIX for unlimited purple cards)
  defenseUpgradeLimits: {
    mines: {
      current: 0,
      max: 5,
      purchaseCount: 0,
    },
    walls: {
      current: 0,
      max: 10,
      purchaseCount: 0,
    },
  },
  
  // CRITICAL FIX: Individual Package Tracking System (fixes "0/10 stays 0/10" bug)
  packageTracker: {},
  
  // Slot Unlock Animation System
  unlockingSlots: new Set<number>(), // Şu anda animasyonda olan slot'lar
  recentlyUnlockedSlots: new Set<number>(), // Son 3 saniyede açılan slot'lar

  // Notification System for User Feedback (fixes "can't tell if purchase worked")
  notifications: [],
  
  // Achievement & Player Progression System (Faz 1: Temel Mekanikler)
  playerProfile: {
    level: 1,
    experience: 0,
    experienceToNext: 100,
    achievementsCompleted: 0,
    achievementPoints: 0,
    unlockedTitles: [],
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
      survivalStreaks: [],
    },
    unlockedCosmetics: [],
    researchPoints: 0,
    permanentBonuses: {},
  },
  achievements: {},
  achievementSeries: {},
  gameStartTime: 0,
  
  // Daily Missions System
  dailyMissions: [],
  lastMissionRefresh: 0,
  completedMissions: [],
  unlockedTowerTypes: [],
};

// Initialize defense target manager
defenseTargetManager.initialize();
