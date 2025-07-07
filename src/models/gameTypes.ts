export type Position = { x: number; y: number };

export interface MineConfig {
  name: string;
  description: string;
  damage: number;
  radius: number;
  cost: number;
  triggerCondition: 'contact' | 'proximity' | 'remote' | 'timer';
  icon: string;
  // Optional properties
  subExplosions?: number;
  empDuration?: number;
  smokeDuration?: number;
  duration?: number;
  slowMultiplier?: number;
  freezeDuration?: number;
  effects?: string[];
}

export interface TowerVisual {
  level: number;
  model: string;
  glow?: boolean;
  effect?: string;
}

export interface Tower {
  id: string;
  position: Position;
  size: number;
  isActive: boolean;
  level: number;
  range: number;
  damage: number;
  fireRate: number;
  lastFired: number;
  health: number;
  maxHealth: number;
  wallStrength: number;
  specialAbility: string;
  healthRegenRate: number;
  lastHealthRegen: number;
  specialCooldown: number;
  lastSpecialUse: number;
  multiShotCount: number;
  chainLightningJumps: number;
  freezeDuration: number;
  burnDuration: number;
  acidStack: number;
  quantumState: boolean;
  nanoSwarmCount: number;
  psiRange: number;
  timeWarpSlow: number;
  spaceGravity: number;
  legendaryAura: boolean;
  divineProtection: boolean;
  cosmicEnergy: number;
  infinityLoop: boolean;
  godModeActive: boolean;
  /** Timestamp of last relocation for cooldown checks */
  lastRelocated?: number;
  attackSound?: string;
  visual?: TowerVisual;
  rangeMultiplier?: number;
  /** 'attack' towers shoot enemies, 'economy' towers generate gold */
  towerType?: 'attack' | 'economy';
  
  // ✅ NEW: Specialized Tower Types for Issue #54
  /** Specialized tower category for advanced mechanics */
  towerCategory?: 'assault' | 'area_control' | 'support' | 'defensive' | 'specialist';
  /** Specific tower class for unique behaviors */
  towerClass?: 'sniper' | 'gatling' | 'laser' | 'mortar' | 'flamethrower' | 'radar' | 'supply_depot' | 'shield_generator' | 'repair_station' | 'emp' | 'stealth_detector' | 'air_defense';
  
  // ✅ NEW: Advanced Tower Properties
  /** Critical hit chance (0-1) */
  criticalChance?: number;
  /** Critical hit damage multiplier */
  criticalDamage?: number;
  /** Armor penetration value */
  armorPenetration?: number;
  /** Area of effect radius */
  areaOfEffect?: number;
  /** Projectile penetration count */
  projectilePenetration?: number;
  /** Spin-up mechanic current level */
  spinUpLevel?: number;
  /** Maximum spin-up level */
  maxSpinUpLevel?: number;
  /** Beam focus damage multiplier */
  beamFocusMultiplier?: number;
  /** Target lock time for beam weapons */
  beamLockTime?: number;
  /** Support buff radius */
  supportRadius?: number;
  /** Support buff intensity */
  supportIntensity?: number;
  /** Shield strength for defensive towers */
  shieldStrength?: number;
  /** Shield regeneration rate */
  shieldRegenRate?: number;
  /** Repair rate for repair towers */
  repairRate?: number;
  /** EMP disable duration */
  empDuration?: number;
  /** Stealth detection range */
  stealthDetectionRange?: number;
  /** Manual targeting enabled */
  manualTargeting?: boolean;
  /** Upgrade path chosen */
  upgradePath?: string;
  /** Synergy bonuses from nearby towers */
  synergyBonuses?: { damage?: number; range?: number; fireRate?: number; };
}

export interface TowerSlot {
  x: number;
  y: number;
  unlocked: boolean;
  /** build tile type */
  type?: 'fixed' | 'dynamic';
  tower?: Tower | null;
  modifier?: TileModifier;
  /** Indicates that a tower existed here and was destroyed */
  wasDestroyed?: boolean;
}

export interface TileModifier {
  type: 'wall' | 'trench' | 'buff';
  expiresAt?: number;
}

export interface Enemy {
  id: string;
  position: Position;
  size: number;
  isActive: boolean;
  health: number;
  maxHealth: number;
  speed: number;
  goldValue: number;
  color: string;
  frozenUntil?: number;
  isSpecial?: boolean; // For microbe/yadama enemies
  lastGoldDrop?: number; // For tracking continuous gold drops
  damage: number;
  /** Behavior tag used for special AI logic */
  behaviorTag?: string;
  /** Enemy type name */
  type?: string;
  
  // ✅ NEW: Advanced Boss System for Issue #56
  /** Boss type for multi-phase boss mechanics */
  bossType?: 'mini' | 'major' | 'legendary';
  /** Current boss phase (0 = normal enemy, 1+ = boss phases) */
  bossPhase?: number;
  /** Maximum boss phases */
  maxBossPhases?: number;
  /** Boss phase transition health thresholds */
  phaseTransitionThresholds?: number[];
  /** Boss special abilities */
  bossAbilities?: string[];
  /** Last ability use timestamp */
  lastAbilityUse?: number;
  /** Boss ability cooldowns */
  abilityCooldowns?: Record<string, number>;
  /** Cinematic state for boss encounters */
  cinematicState?: 'entrance' | 'phase_transition' | 'defeat' | 'normal';
  /** Cinematic start time */
  cinematicStartTime?: number;
  /** Boss-specific loot table */
  bossLootTable?: BossLootEntry[];
  /** Temporary invulnerability during phase transitions */
  isInvulnerable?: boolean;
  /** Boss entrance animation completed */
  entranceComplete?: boolean;
  /** Boss special effects */
  bossSpecialEffects?: string[];
  /** Boss spawn minions ability */
  canSpawnMinions?: boolean;
  /** Last minion spawn time */
  lastMinionSpawn?: number;
  /** Boss environmental effects */
  environmentalEffects?: string[];
  /** Boss shield strength (for shielded bosses) */
  shieldStrength?: number;
  /** Boss shield regeneration rate */
  shieldRegenRate?: number;
  /** Boss rage mode (increased damage/speed when low health) */
  rageMode?: boolean;
  /** Boss flee threshold (bosses that flee at low health) */
  fleeThreshold?: number;
  /** Boss is fleeing */
  isFleeing?: boolean;
}

export interface Bullet {
  id: string;
  position: Position;
  size: number;
  isActive: boolean;
  speed: number;
  damage: number;
  direction: Position;
  color: string;
  typeIndex: number;
  targetId?: string;
  life: number;
}

export interface Effect {
  id: string;
  position: Position;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  // Enhanced properties for memory management
  type?: string;
  opacity?: number;
  scale?: number;
  createdAt?: number;
}

export interface Mine {
  id: string;
  position: Position;
  size: number;
  damage: number;
  radius: number;
  
  // ✅ NEW: Mine Variety System for Issue #54
  /** Mine type for different behaviors */
  mineType: 'explosive' | 'utility' | 'area_denial';
  /** Mine subtype for specialized behaviors */
  mineSubtype?: 'standard' | 'cluster' | 'emp' | 'smoke' | 'caltrops' | 'tar' | 'freeze';
  
  // ✅ NEW: Advanced Mine Properties
  /** Duration for utility/area denial mines */
  duration?: number;
  /** Remaining duration for active mines */
  remainingDuration?: number;
  /** Slow effect multiplier for area denial mines */
  slowMultiplier?: number;
  /** Additional effects applied by the mine */
  effects?: string[];
  /** Mine trigger condition */
  triggerCondition?: 'contact' | 'proximity' | 'remote' | 'timer';
  /** Mine activation state */
  isActive?: boolean;
  /** Mine placement timestamp */
  placedAt?: number;
  /** EMP disable duration for EMP mines */
  empDuration?: number;
  /** Smoke cloud duration for smoke mines */
  smokeDuration?: number;
  /** Freeze duration for freeze mines */
  freezeDuration?: number;
}

export interface WaveModifier {
  speedMultiplier?: number;
  disableTowerType?: string;
  bonusEnemies?: boolean;
  towerRangeReduced?: boolean;
  noUpgrades?: boolean;
  disableArea?: { x: number; y: number; radius: number };
}

export interface EnemyType {
  speed: number;
  hp: number;
  damage: number;
  color: string;
  behaviorTag?: string;
}

export interface WaveEnemyConfig {
  type: string;
  count: number;
}

export type TowerUpgradeListener = (
  tower: Tower,
  oldLevel: number,
  newLevel: number,
) => void;

export interface GameState {
  towers: Tower[];
  towerSlots: TowerSlot[];
  enemies: Enemy[];
  bullets: Bullet[];
  effects: Effect[];
  gold: number;
  bulletLevel: number;
  currentWave: number;
  enemiesKilled: number;
  enemiesRequired: number;
  totalEnemiesKilled: number;
  totalGoldSpent: number;
  fireUpgradesPurchased: number;
  shieldUpgradesPurchased: number;
  packagesPurchased: number;
  defenseUpgradesPurchased: number;
  
  // ✅ NEW: Environment & Terrain System for Issue #62
  terrainTiles: TerrainTile[];
  weatherState: WeatherState;
  timeOfDayState: TimeOfDayState;
  environmentalHazards: EnvironmentalHazard[];
  interactiveElements: InteractiveElement[];
  
  // CRITICAL FIX: Individual Fire Upgrade Tracking System (fixes sayaç problemi)
  individualFireUpgrades: Record<string, number>; // bulletType -> upgrade count (e.g., "fire_1": 2, "fire_2": 1)
  individualShieldUpgrades: Record<string, number>; // shieldType -> upgrade count
  individualDefenseUpgrades: Record<string, number>; // defenseType -> upgrade count
  mineLevel: number;
  mineRegeneration: boolean;
  mines: Mine[];
  maxTowers: number;
  globalWallStrength: number;
  isGameOver: boolean;
  isStarted: boolean;
  isRefreshing: boolean;
  diceRoll: number | null;
  diceUsed: boolean;
  discountMultiplier: number;
  isDiceRolling: boolean;
  wallLevel: number;
  globalWallActive: boolean;
  lastWallDestroyed: number;
  wallRegenerationActive: boolean;
  frostEffectActive: boolean;
  frostEffectStartTime: number;
  originalEnemySpeeds: Map<string, number>;
  currentWaveModifier?: WaveModifier;
  towerUpgradeListeners: TowerUpgradeListener[];
  energy: number;
  energyWarning?: string | null;
  actionsRemaining: number;
  prepRemaining: number;
  isPreparing: boolean;
  isPaused: boolean;
  /** Timestamp when the current wave began */
  waveStartTime: number;
  /** Whether a tower was destroyed this wave */
  lostTowerThisWave: boolean;
  /** Last game loop update timestamp for performance optimization */
  lastUpdate?: number;
  
  // Yeni Enerji Sistemi
  energyUpgrades: Record<string, number>; // upgrade_id -> level
  maxEnergy: number;
  killCombo: number;
  lastKillTime: number;
  totalKills: number;
  energyEfficiency: number; // Enerji harcama indirimi (0.0-1.0)
  
  // Gelişmiş Action Sistemi
  maxActions: number;
  actionRegenTime: number;
  lastActionRegen: number;

  // PowerMarket upgrade levels
  energyBoostLevel: number;
  maxActionsLevel: number;
  eliteModuleLevel: number;
  diceResult: number | null;
  
  // Defense Upgrade Limits System (CRITICAL FIX for unlimited purple cards)
  defenseUpgradeLimits: {
    mines: {
      current: number;
      max: number;
      purchaseCount: number;
    };
    walls: {
      current: number;
      max: number;
      purchaseCount: number;
    };
  };
  
  // CRITICAL FIX: Individual Package Tracking System (fixes "0/10 stays 0/10" bug)
  packageTracker: {
    [packageId: string]: {
      purchaseCount: number;
      lastPurchased: number; // timestamp
      maxAllowed: number;
    };
  };
  
  // Slot Unlock Animation System
  unlockingSlots: Set<number>; // Şu anda animasyonda olan slot'lar
  recentlyUnlockedSlots: Set<number>; // Son 3 saniyede açılan slot'lar

  // Notification System for User Feedback (fixes "can't tell if purchase worked")
  notifications: {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: number;
    duration?: number; // milliseconds, default 3000
  }[];
  
  // Achievement & Player Progression System (Faz 1: Temel Mekanikler)
  playerProfile: PlayerProfile;
  achievements: Record<string, Achievement>; // achievement ID -> achievement
  achievementSeries: Record<string, AchievementSeries>; // series ID -> series
  gameStartTime: number; // For playtime tracking
  
  // Daily Missions System
  dailyMissions: DailyMission[];
  lastMissionRefresh: number;
  unlockedTowerTypes: string[];
}

export interface PowerUpgrade {
  id: string;
  name: string;
  description: string;
  category: string;
  cost: number;
  maxLevel: number;
  effect: PowerUpgradeEffect;
  icon: string;
}

export interface PowerUpgradeEffect {
  type: 'passive_regen' | 'max_energy' | 'kill_bonus' | 'activity_bonus' | 'combo_master' | 'efficiency' | 
        'action_capacity' | 'action_regen' | 'special_kill_action' | 'action_save_chance' | 
        'combo_duration' | 'rampage_efficiency' | 'power_core' | 'infinite_loop' | 'quantum_regen';
  value: number | { bonus: number; time: number };
}

// Backward compatibility
export type EnergyUpgrade = PowerUpgrade;
export type EnergyUpgradeEffect = PowerUpgradeEffect;

// ===== ACHIEVEMENT SYSTEM TYPES =====

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'progression' | 'upgrade' | 'economy' | 'building' | 'combat' | 'special' | 'defense';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  target: number;
  progress: number;
  completed: boolean;
  completedAt?: number; // timestamp
  hidden?: boolean; // Secret achievements
  series?: string; // Achievement series ID
  rewards: AchievementReward;
  tracking: AchievementTracking;
}

export interface AchievementReward {
  type: 'research_points' | 'cosmetic' | 'title' | 'bonus' | 'unlock';
  value: number;
  name: string;
  description: string;
  permanent?: boolean; // Permanent bonuses
}

export interface AchievementTracking {
  condition: string; // JavaScript condition to check
  trackingFunction: string; // Function name to track progress
  triggerEvents: string[]; // Game events that trigger progress check
}

export interface AchievementSeries {
  id: string;
  name: string;
  description: string;
  category: Achievement['category'];
  achievements: string[]; // Achievement IDs in order
  seriesReward?: AchievementReward; // Bonus for completing entire series
}

export interface PlayerProfile {
  // Experience and Level
  level: number;
  experience: number;
  experienceToNext: number;
  
  // Achievement Progress
  achievementsCompleted: number;
  achievementPoints: number;
  unlockedTitles: string[];
  activeTitle?: string;
  
  // Statistics for achievement tracking
  statistics: PlayerStatistics;
  
  // Unlocks and rewards
  unlockedCosmetics: string[];
  researchPoints: number;
  permanentBonuses: Record<string, number>;
}

export interface PlayerStatistics {
  // Progression stats
  totalWavesCompleted: number;
  highestWaveReached: number;
  totalPlaytime: number; // milliseconds
  gamesPlayed: number;
  
  // Combat stats
  totalEnemiesKilled: number;
  totalDamageDealt: number;
  perfectWaves: number; // Waves completed without losing towers
  
  // Building stats
  totalTowersBuilt: number;
  totalTowersLost: number;
  highestTowerLevel: number;
  totalUpgradesPurchased: number;
  
  // Economy stats
  totalGoldEarned: number;
  totalGoldSpent: number;
  totalPackagesPurchased: number;
  bestGoldPerWave: number;
  
  // Special achievements
  speedrunRecords: Record<string, number>; // wave -> best time
  efficiencyRecords: Record<string, number>; // wave -> best efficiency
  survivalStreaks: number[]; // Consecutive perfect waves
}

export interface DailyMission {
  id: string;
  name: string;
  description: string;
  category: 'combat' | 'economic' | 'survival' | 'exploration';
  objective: MissionObjective;
  reward: MissionReward;
  expiresAt: number;
  completed: boolean;
  progress: number;
  maxProgress: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isSecret?: boolean;
}

export interface MissionObjective {
  type: 'survive_waves' | 'kill_enemies' | 'build_towers' | 'earn_gold' | 'complete_upgrades' | 'use_abilities' | 'perfect_waves';
  target: number;
  description: string;
  trackingKey: string; // Key to track in player stats
}

export interface MissionReward {
  type: 'gold' | 'energy' | 'actions' | 'experience' | 'unlock';
  amount: number;
  description: string;
  special?: string; // Special rewards like unlocks
}

// ✅ NEW: Boss Loot System for Issue #56
export interface BossLootEntry {
  itemType: 'gold' | 'research_points' | 'upgrade_materials' | 'rare_components' | 'legendary_items' | 'achievements' | 'cosmetics';
  itemName: string;
  amount: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  dropChance: number; // 0-1
  description: string;
  visualEffect?: string; // Special visual effect when dropped
  unlockCondition?: string; // Condition to unlock this drop
}

export interface BossPhaseData {
  phase: number;
  name: string;
  healthThreshold: number; // Percentage (0-1)
  abilities: string[];
  behaviorChanges?: {
    speedMultiplier?: number;
    damageMultiplier?: number;
    specialAbilityCooldownMultiplier?: number;
    newBehaviorTag?: string;
  };
  phaseTransitionEffect?: string;
  environmentalEffects?: string[];
  spawnMinions?: {
    enabled: boolean;
    minionTypes: string[];
    spawnRate: number;
    maxMinions: number;
  };
}

// ✅ Specialized Tower System Types
export interface SpecializedTowerUpgradePath {
  criticalChance?: number;
  criticalDamage?: number;
  projectilePenetration?: number;
  armorPenetration?: number;
  supportRadius?: number;
  supportIntensity?: number;
  empDuration?: number;
  areaOfEffect?: number;
  maxSpinUpLevel?: number;
  fireRate?: number;
  burnDuration?: number;
  damage?: number;
  range?: number;
  beamFocusMultiplier?: number;
  manualTargeting?: boolean;
  multiShotCount?: number;
  shieldStrength?: number;
  shieldRegenRate?: number;
  repairRate?: number;
  stealthDetectionRange?: number;
  acidStack?: number;
}

export interface SpecializedTowerConfig {
  name: string;
  category: 'assault' | 'area_control' | 'support' | 'defensive' | 'specialist';
  baseDamage: number;
  baseRange: number;
  baseFireRate: number;
  cost: number;
  description: string;
  upgradePaths: Record<string, SpecializedTowerUpgradePath>;
  
  // Optional specialized properties
  criticalChance?: number;
  criticalDamage?: number;
  armorPenetration?: number;
  spinUpLevel?: number;
  maxSpinUpLevel?: number;
  beamFocusMultiplier?: number;
  beamLockTime?: number;
  areaOfEffect?: number;
  burnDuration?: number;
  supportRadius?: number;
  supportIntensity?: number;
  stealthDetectionRange?: number;
  empDuration?: number;
  shieldStrength?: number;
  shieldRegenRate?: number;
  repairRate?: number;
  projectilePenetration?: number;
  manualTargeting?: boolean;
  multiShotCount?: number;
  acidStack?: number;
}

export type TowerClass = 'sniper' | 'gatling' | 'laser' | 'mortar' | 'flamethrower' | 'radar' | 'supply_depot' | 'shield_generator' | 'repair_station' | 'emp' | 'stealth_detector' | 'air_defense';

export type SpecializedTowersConfig = Record<TowerClass, SpecializedTowerConfig>;

export interface TerrainTile {
  id: string;
  position: Position;
  terrainType: 'lowlands' | 'hills' | 'plateaus' | 'valleys';
  elevation: number;
  isDestructible: boolean;
  health?: number;
  maxHealth?: number;
  coverBonus?: number;
  movementPenalty?: number;
  visibilityBonus?: number;
  towerBonus?: {
    damage?: number;
    range?: number;
    fireRate?: number;
  };
}

export interface WeatherState {
  currentWeather: 'clear' | 'rain' | 'fog' | 'storm' | 'sandstorm' | 'snow';
  weatherIntensity: number; // 0-1
  visibility: number; // 0-1
  movementPenalty: number; // 0-1
  damageModifier: number; // 0-1
  duration: number; // milliseconds
  startTime: number;
  transitionTime: number;
}

export interface TimeOfDayState {
  currentPhase: 'dawn' | 'day' | 'dusk' | 'night';
  cycleProgress: number; // 0-1
  lightingIntensity: number; // 0-1
  visibilityModifier: number; // 0-1
  enemyBehaviorModifier: number; // 0-1
}

export interface EnvironmentalHazard {
  id: string;
  type: 'earthquake' | 'volcanic_activity' | 'solar_flare' | 'radioactive_zone' | 'magnetic_anomaly' | 'unstable_ground';
  position: Position;
  radius: number;
  intensity: number; // 0-1
  duration: number;
  startTime: number;
  effects: readonly string[];
  warningTime?: number;
}

export interface InteractiveElement {
  id: string;
  type: 'tree' | 'rock' | 'building' | 'bridge' | 'gate' | 'switch';
  position: Position;
  size: number;
  health: number;
  maxHealth: number;
  isDestructible: boolean;
  strategicValue: number;
  effects: readonly string[];
  isActive?: boolean;
}
