export type Position = { x: number; y: number };

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
  wallStrength: number;
}

export interface TowerSlot {
  x: number;
  y: number;
  unlocked: boolean;
  tower?: Tower;
  /** Indicates that a tower existed here and was destroyed */
  wasDestroyed?: boolean;
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
}
