export type Position = { x: number; y: number };

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
}

export interface TowerSlot {
  x: number;
  y: number;
  unlocked: boolean;
  /** build tile type */
  type?: 'fixed' | 'dynamic';
  tower?: Tower;
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
}

export interface Effect {
  id: string;
  position: Position;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface Mine {
  id: string;
  position: Position;
  size: number;
  damage: number;
  radius: number;
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
  mineLevel: number;
  mineRegeneration: boolean;
  mines: Mine[];
  maxTowers: number;
  globalWallStrength: number;
  isGameOver: boolean;
  isStarted: boolean;
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
  actionsRemaining: number;
  prepRemaining: number;
  isPreparing: boolean;
  isPaused: boolean;
  /** Timestamp when the current wave began */
  waveStartTime: number;
  /** Whether a tower was destroyed this wave */
  lostTowerThisWave: boolean;
}
