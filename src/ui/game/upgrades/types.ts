// PowerMarket Component Types

// Energy Upgrade specific types
export interface EnergyUpgradeData {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxLevel: number;
  category: string;
  icon: string;
  currentLevel: number;
}

export interface EnergyStats {
  passiveRegen: number;
  maxEnergy: number;
  killBonus: number;
  efficiency: number;
}

export interface EnergySystemState {
  gold: number;
  energyUpgrades: Record<string, number>;
  energy: number;
  maxEnergy: number;
  actionsRemaining: number;
  maxActions: number;
  actionRegenTime: number;
}

// Game Store selectors types
export interface GameStoreSelectors {
  gold: number;
  spendGold: (amount: number) => void;
  bulletLevel: number;
  upgradeBullet: (free?: boolean) => void;
  discountMultiplier: number;
  diceResult: number | null;
}

// Bullet type data
export interface BulletTypeData {
  name: string;
  color: string;
  damageMultiplier: number;
  fireRateMultiplier: number;
  speedMultiplier: number;
  freezeDuration?: number;
  missionRequirement?: { id: string; text: string };
}

// Package tracking types
export interface PackageInfo {
  purchaseCount: number;
  maxAllowed: number;
  canPurchase: boolean;
  isMaxed: boolean;
}

// Notification types
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationData {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  duration?: number;
}

// Defense upgrade limits
export interface DefenseUpgradeLimit {
  current: number;
  max: number;
  purchaseCount: number;
}

export interface DefenseUpgradeLimits {
  mines: DefenseUpgradeLimit;
  walls: DefenseUpgradeLimit;
}

// PowerMarket specific types

export interface UpgradeData {
  name: string;
  description: string;
  currentLevel: number;
  baseCost: number;
  maxLevel: number;
  onUpgrade: () => void;
  icon: string;
  color: string;
  isElite?: boolean;
  additionalInfo?: string;
}

export interface UpgradeCardProps {
  upgrade: UpgradeData;
  gold: number;
  diceResult?: number | null;
  discountMultiplier: number;
}

export interface BadgeProps {
  diceResult?: number | null;
  isElite?: boolean;
} 