import type { TowerSlot, Enemy } from '../../../models/gameTypes';

export interface TowerUpgradeInfo {
  level: number;
  name: string;
  cost: number;
  damage: number;
  fireRate: number;
  health: number;
  special: string;
}

export interface TowerSpotProps {
  slot: TowerSlot;
  slotIdx: number;
  onTowerDragStart?: (slotIdx: number, event: React.MouseEvent | React.TouchEvent) => void;
  isDragTarget?: boolean;
  draggedTowerSlotIdx?: number | null;
}

export interface TowerRenderProps {
  slot: TowerSlot;
  towerLevel: number;
}

export interface WallRenderProps {
  slot: TowerSlot;
  wallLevel: number;
}

export interface ModifierRenderProps {
  slot: TowerSlot;
}

export interface VisualExtrasProps {
  slot: TowerSlot;
}

export interface TowerMenuProps {
  menuPos: { x: number; y: number } | null;
  slot: TowerSlot;
  slotIdx: number;
  onClose: () => void;
  onBuildTower: (slotIdx: number, type: 'attack' | 'economy') => void;
  onPerformTileAction: (slotIdx: number, action: 'wall' | 'trench' | 'buff') => void;
}

export interface TowerInfoPanelProps {
  slot: TowerSlot;
  slotIdx: number;
  currentTowerInfo: TowerUpgradeInfo | null;
  towerBottomY: number;
  canUpgrade: boolean;
  upgradeInfo: TowerUpgradeInfo | null;
  upgradeMessage: string;
  canAffordUpgrade: boolean;
  onUpgrade: (slotIdx: number) => void;
}

export interface SlotUnlockProps {
  slot: TowerSlot;
  slotIdx: number;
  unlockCost: number;
  canUnlock: boolean;
  isUnlocking: boolean;
  isRecentlyUnlocked: boolean;
  onUnlock: (slotIdx: number) => void;
}

export interface DebugInfoProps {
  slot: TowerSlot;
  debugInfo: {
    enemy: Enemy;
    firing: boolean;
  } | null;
} 