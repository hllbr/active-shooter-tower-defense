import type { GameState, TowerSlot } from '../gameTypes';
import { GAME_CONSTANTS } from '../../utils/constants';
import { waveRules } from '../../config/waveRules';
import { updateWaveTiles } from '../../game-systems/TowerPlacementManager';

export const initialSlots: TowerSlot[] = updateWaveTiles(1, []);

export const initialState: GameState = {
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
  
  // CRITICAL FIX: Individual Upgrade Tracking (fixes sayaç problemi)
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
  isPreparing: false,
  isPaused: false,
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

  unlockingSlots: new Set<number>(),
  recentlyUnlockedSlots: new Set<number>(),

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

  packageTracker: {},
  notifications: [],

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
  achievements: {},
  achievementSeries: {},
  gameStartTime: Date.now(),
  dailyMissions: [],
  lastMissionRefresh: 0,
  unlockedTowerTypes: [],
};
