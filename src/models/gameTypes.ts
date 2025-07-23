import type { EnergyCooldownState } from '../game-systems/EnergyManager';
import type React from 'react';

export type ResourceSource = 'enemy' | 'passive' | 'structure' | 'wave' | 'bonus' | 'purchase' | 'refund' | 'achievement' | 'event' | 'alliance' | 'faction' | 'research' | 'loot' | 'boss' | 'mission' | 'challenge';

export interface ResourceTransaction {
  id: string;
  amount: number;
  source: ResourceSource;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

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
  
  // ✅ NEW: Fire Hazard System
  /** Fire hazard state */
  fireHazard?: {
    isBurning: boolean;
    startTime: number;
    timeLimit: number;
    extinguisherClicked: boolean;
  };
  
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
  /** Area effect type for support towers */
  areaEffectType?: 'heal' | 'poison' | 'fire' | null;
  /** Area effect radius in pixels */
  areaEffectRadius?: number;
  /** Area effect power (heal per tick, poison damage, etc.) */
  areaEffectPower?: number;
  /** Area effect duration in ms (if temporary) */
  areaEffectDuration?: number;
  /** Area effect active flag */
  areaEffectActive?: boolean;
  /** Last tick time for area effect */
  areaEffectLastTick?: number;
  /** Timer for effect decay (if not upgraded/repaired) */
  areaEffectDecayTimer?: number;
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
  // --- YENİ: Ateşleme çıkış noktası için ref ---
  fireOriginRef?: React.RefObject<SVGGElement>;
  /** Manuel yerleşim kilidi */
  locked?: boolean;
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

// ✅ NEW: Wave Status Enum to replace multiple boolean flags
export type WaveStatus = 'idle' | 'in_progress' | 'completed';

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
  totalGoldEarned: number;
  fireUpgradesPurchased: number;
  shieldUpgradesPurchased: number;
  packagesPurchased: number;
  defenseUpgradesPurchased: number;
  
  // Enhanced Resource System
  resourceTransactions: ResourceTransaction[];
  
  // ✅ NEW: Defense Target System for Issue #65
  defenseTarget: DefenseTarget;
  
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
  energyCooldownState?: EnergyCooldownState;
  actionsRemaining: number;
  prepRemaining: number;
  /** Wave status to replace multiple boolean flags */
  waveStatus: WaveStatus;
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
  completedMissions: string[];
  unlockedTowerTypes: string[];

  /**
   * Global pause state for UI-based pausing (e.g., upgrade screen)
   * When true, all game logic and actions should be paused.
   */
  isPaused: boolean;

  /**
   * True if the player has placed their first tower (enables first wave spawn)
   */
  isFirstTowerPlaced: boolean;

  /** Currently selected tower slot index, or null if none selected */
  selectedSlot: number | null;
  
  // ✅ NEW: Dynamic Game Start System
  firstTowerInfo?: {
    towerClass: TowerClass;
    towerName: string;
    slotIndex: number;
  };
  supportTowerUpgrades: {
    radar_area_radius: number;
    radar_area_power: number;
    radar_area_duration: number;
    supply_depot_area_radius: number;
    supply_depot_area_power: number;
    supply_depot_area_duration: number;
    shield_generator_area_radius: number;
    shield_generator_area_power: number;
    shield_generator_area_duration: number;
    repair_station_area_radius: number;
    repair_station_area_power: number;
    repair_station_area_duration: number;
    emp_area_radius: number;
    emp_area_power: number;
    emp_area_duration: number;
    stealth_detector_area_radius: number;
    stealth_detector_area_power: number;
    stealth_detector_area_duration: number;
    air_defense_area_radius: number;
    air_defense_area_power: number;
    air_defense_area_duration: number;
    economy_area_radius: number;
    economy_area_power: number;
    economy_area_duration: number;
  };
}

// ✅ NEW: Defense Target System
export interface DefenseTarget {
  id: string;
  type: 'energy_core' | 'command_center' | 'resource_depot' | 'shield_generator';
  position: Position;
  size: number;
  health: number;
  maxHealth: number;
  isActive: boolean;
  isVisible: boolean;
  isVulnerable: boolean;
  
  // Visual properties
  color: string;
  glowIntensity: number;
  pulseRate: number;
  
  // Defense properties
  shieldStrength: number;
  maxShieldStrength: number;
  shieldRegenRate: number;
  lastShieldRegen: number;
  
  // Damage properties
  damageResistance: number;
  criticalVulnerability: number;
  
  // Effects
  activeEffects: string[];
  lastDamaged: number;
  
  // Visual indicators
  showDamageIndicator: boolean;
  damageIndicatorDuration: number;
  damageIndicatorStartTime: number;
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
  /** Optional validation function for custom logic */
  validate?: (gameState: GameState, eventData?: unknown) => boolean;
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
  type: 'gold' | 'energy' | 'actions' | 'experience' | 'unlock' | 'upgrade';
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
  // Area effect properties for support towers
  areaEffectType?: 'heal' | 'poison' | 'fire' | null;
  areaEffectRadius?: number;
  areaEffectPower?: number;
  areaEffectDuration?: number;
  areaEffectActive?: boolean;
  areaEffectDecayTimer?: number;
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

// ✅ NEW: Alliance System Types for Issue #63
export interface AllianceMember {
  playerId: string;
  rank: 'member' | 'officer' | 'leader';
  contribution: {
    research: number;
    resources: number;
    activity: number;
  };
  permissions: AlliancePermission[];
}

export type AlliancePermission = 
  | 'view_alliance' 
  | 'contribute_resources' 
  | 'start_research' 
  | 'manage_members' 
  | 'declare_war' 
  | 'manage_buildings';

export interface AllianceResearch {
  id: string;
  type: string;
  cost: number;
  progress: number;
  maxProgress: number;
  startTime: number;
  estimatedCompletion: number;
  contributors: Array<{
    playerId: string;
    amount: number;
  }>;
}

export interface AllianceBonus {
  type: 'damage_multiplier' | 'energy_regen' | 'gold_bonus' | 'experience_multiplier' | 'research_speed' | 'resource_capacity';
  value: number;
  description: string;
}

export interface AllianceBuilding {
  level: number;
  bonuses: AllianceBonus[];
}

export interface AllianceLaboratory {
  level: number;
  researchSpeed: number;
}

export interface AllianceTreasury {
  level: number;
  resourceCapacity: number;
}

export interface AllianceBarracks {
  level: number;
  memberBonuses: AllianceBonus[];
}

export interface AllianceWar {
  id: string;
  opponentAllianceId: string;
  startTime: number;
  endTime: number;
  status: 'preparing' | 'active' | 'completed';
  score: {
    attacker: number;
    defender: number;
  };
  participants: string[]; // player IDs
}

export interface CooperativeRaid {
  id: string;
  type: 'boss_raid' | 'resource_raid' | 'territory_raid';
  startTime: number;
  endTime: number;
  participants: string[]; // player IDs
  progress: number;
  maxProgress: number;
  rewards: Record<string, number>;
}

export interface ResourceSharingPool {
  gold: number;
  energy: number;
  researchPoints: number;
  lastContribution: number;
}

export interface Alliance {
  id: string;
  name: string;
  tag: string; // [TAG]
  level: number;
  members: AllianceMember[];
  maxMembers: number;

  // Alliance features
  research: {
    activeProjects: AllianceResearch[];
    completedProjects: string[];
    researchPower: number; // Combined member contribution
  };

  buildings: {
    headquarters: AllianceBuilding;
    laboratory: AllianceLaboratory;
    treasury: AllianceTreasury;
    barracks: AllianceBarracks;
  };

  // Cooperative activities
  events: {
    allianceWars: AllianceWar[];
    cooperativeRaids: CooperativeRaid[];
    resourceSharing: ResourceSharingPool;
  };
}

// ✅ NEW: Competitive System Types for Issue #63
export interface PlayerRanking {
  playerId: string;
  rank: number;
  score: number;
  category: 'global' | 'survival' | 'efficiency' | 'speed' | 'innovation';
  seasonId: string;
  lastUpdated: number;
}

export interface AllianceRanking {
  allianceId: string;
  allianceName: string;
  rank: number;
  totalScore: number;
  memberCount: number;
  averageScore: number;
  seasonId: string;
  lastUpdated: number;
}

export interface SeasonInfo {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  status: 'active' | 'completed' | 'upcoming';
  theme: string;
  rewards: {
    gold: number;
    researchPoints: number;
    cosmetics: string[];
    titles: string[];
  };
}

export interface SeasonHistory {
  id: string;
  name: string;
  startDate: number;
  endDate: number;
  theme: string;
  winner: {
    playerId: string;
    playerName: string;
    score: number;
  };
  totalParticipants: number;
}

export interface WeeklyReward {
  id: string;
  name: string;
  description: string;
  rewards: {
    gold: number;
    researchPoints: number;
    cosmetics: string[];
  };
  requirements: {
    minRank?: number;
    minScore?: number;
    minGames?: number;
  };
}

export interface SeasonalReward {
  id: string;
  name: string;
  description: string;
  rewards: {
    gold: number;
    researchPoints: number;
    cosmetics: string[];
    titles: string[];
  };
  requirements: {
    minRank?: number;
    minScore?: number;
    minGames?: number;
  };
}

export interface LifetimeAchievement {
  id: string;
  name: string;
  description: string;
  category: 'competitive' | 'social' | 'technical';
  requirements: {
    totalSeasons: number;
    totalWins: number;
    highestRank: number;
  };
  rewards: {
    gold: number;
    researchPoints: number;
    cosmetics: string[];
    titles: string[];
  };
}

// ✅ NEW: Prestige System Types for Issue #63
export interface PrestigeLevel {
  level: number;
  name: string;
  description: string;
  requirements: {
    minWave: number;
    minPlaytime: number;
    achievementsRequired: string[];
  };
  rewards: {
    prestigePoints: number;
    legacyBonuses: LegacyBonus[];
    specialUnlocks: string[];
  };
}

export interface LegacyBonus {
  type: 'damage_multiplier' | 'gold_bonus' | 'energy_efficiency' | 'research_speed' | 'experience_multiplier';
  value: number;
  description: string;
  permanent: boolean;
}

export interface PrestigeReward {
  level: number;
  rewards: {
    cosmetics: string[];
    titles: string[];
    specialAbilities: string[];
  };
}

// ✅ NEW: Terrain Modification System Types for Issue #63
export type TerrainModificationType = 'crater' | 'bridge' | 'platform' | 'trench' | 'wall' | 'tunnel' | 'elevation';

export interface TerrainModificationCost {
  gold: number;
  energy: number;
  researchPoints: number;
}

export interface TerrainModification {
  id: string;
  type: TerrainModificationType;
  position: Position;
  cost: TerrainModificationCost;
  description: string;
  effects: string[];
  createdBy: string;
  createdAt: number;
  duration?: number;
  isActive: boolean;
  removedAt?: number;
}

// ✅ NEW: Campaign & Narrative System Types for Issue #63
export interface CampaignObjective {
  id: string;
  type: 'survive_waves' | 'build_towers' | 'complete_tutorial' | 'research_technology' | 'form_alliance' | 'defeat_boss' | 'unlock_technology' | 'faction_choice';
  target: number;
  description: string;
  completed: boolean;
  progress?: number;
}

export interface CampaignReward {
  gold: number;
  researchPoints: number;
  cosmetics: string[];
  titles: string[];
}

export interface StoryChoice {
  id: string;
  text: string;
  description: string;
  consequences: string[];
}

export interface StoryDecision {
  id: string;
  description: string;
  options: StoryChoice[];
  chapterId?: string;
  choiceId?: string;
  timestamp?: number;
  consequences?: string[];
}

export interface StoryConsequence {
  id: string;
  chapterId: string;
  choiceId: string;
  timestamp: number;
  consequences: string[];
}

export interface AlternativePath {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  rewards: CampaignReward;
}

export interface CampaignChapter {
  id: string;
  name: string;
  description: string;
  objectives: CampaignObjective[];
  rewards: CampaignReward;
  storyDecisions: StoryDecision[];
  worldStateChanges: {
    globalEvents: string[];
    factionControl: Record<string, number>;
    resourceAvailability: Record<string, number>;
  };
}

// ✅ NEW: Live Events System Types for Issue #63
export type EventType = 'speed_challenge' | 'boss_rush' | 'resource_efficiency' | 'tower_specialist' | 'endurance_test' | 'community_challenge';

export interface EventReward {
  gold: number;
  researchPoints: number;
  cosmetics: string[];
  titles: string[];
  specialRewards: string[];
}

export interface EventParticipant {
  playerId: string;
  playerName: string;
  joinTime: number;
  score: number;
  achievements: string[];
  currentRank: number;
  lastUpdate?: number;
  finalRewards?: EventReward;
}

export interface EventLeaderboard {
  playerId: string;
  playerName: string;
  score: number;
  rank: number;
  achievements: string[];
}

export interface LiveEvent {
  id: string;
  name: string;
  description: string;
  type: EventType;
  startTime: number;
  endTime: number;
  rewards: EventReward;
  participants: EventParticipant[];
  leaderboard: EventLeaderboard[];
  specialRules: string[];
  isActive: boolean;
  currentPhase: 'upcoming' | 'active' | 'completed';
}

// ✅ NEW: Faction System Types for Issue #63
export type FactionType = 'military' | 'scientific' | 'merchant' | 'neutral' | 'chaos';

export interface FactionAbility {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'active' | 'ultimate';
  effect: string;
  cost: { gold: number; researchPoints: number };
}

export interface FactionTechnology {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  cost: { gold: number; researchPoints: number };
}

export interface FactionResource {
  gold: number;
  researchPoints: number;
  influence: number;
  technology: number;
}

export interface FactionRelationship {
  faction1: string;
  faction2: string;
  relationship: 'allied' | 'neutral' | 'hostile' | 'cooperative';
  trustLevel: number;
  tradeAgreements: string[];
  conflicts: string[];
}

export interface FactionMember {
  playerId: string;
  playerName: string;
  joinDate: number;
  contribution: number;
  rank: 'recruit' | 'member' | 'veteran' | 'elite' | 'leader';
  specializations: string[];
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  type: FactionType;
  leader: string;
  members: FactionMember[];
  maxMembers: number;
  level: number;
  experience: number;
  resources: FactionResource;
  abilities: FactionAbility[];
  technologies: FactionTechnology[];
  specializations: string[];
  reputation: number;
  territory: string[];
  isActive: boolean;
}
