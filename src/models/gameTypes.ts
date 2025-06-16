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
}

export interface TowerSlot {
  x: number;
  y: number;
  unlocked: boolean;
  tower?: Tower;
}

export interface Enemy {
  id: string;
  position: Position;
  size: number;
  isActive: boolean;
  health: number;
  speed: number;
  goldValue: number;
  color: string;
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
}

export interface GameState {
  towers: Tower[];
  towerSlots: TowerSlot[];
  enemies: Enemy[];
  bullets: Bullet[];
  gold: number;
  currentWave: number;
  isGameOver: boolean;
  isStarted: boolean;
} 