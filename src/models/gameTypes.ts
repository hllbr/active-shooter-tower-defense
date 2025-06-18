import { GAME_CONSTANTS } from '../utils/Constants';

export type Position = { x: number; y: number };

export type BulletEffect = 'slow' | 'freeze' | 'burn' | 'chain' | 'blind' | 'shatter' | 'explosion' | 'poison' | 'pierce';
export type BulletSpecial = 'star' | 'fire_cloud' | 'inferno_cloud' | 'shadow_wave' | 'void_wave' | 'shrapnel' | 'crystal_burst' | 'crystal_storm';

export interface BulletType {
  id: string;
  name: string;
  maxLevel: number;
  requiredTowerLevel: number;
  levels: BulletLevel[];
}

export interface BulletLevel {
  color: string | string[];
  effect: BulletEffect | undefined;
  damageMultiplier: number;
  fireRateMultiplier: number;
  speedMultiplier: number;
  count: number;
  special: BulletSpecial | undefined;
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
  wallColor?: string;
  powerMultiplier: number;
  bulletTypeId: string;
  bulletLevel: number;
}

export interface TowerSlot {
  x: number;
  y: number;
  unlocked: boolean;
  tower?: Tower;
  /** Indicates that a tower existed here and was destroyed */
  wasDestroyed?: boolean;
}

export enum EffectType {
  EXPLOSION = 'explosion',
  FREEZE = 'freeze',
  POISON = 'poison'
}

export class Enemy {
  id: string;
  position: Position;
  size: number;
  isActive: boolean;
  health: number;
  maxHealth: number;
  speed: number;
  goldValue: number;
  color: string;
  shield: number;
  type: string;
  frozenUntil: number;

  constructor(
    id: string,
    position: Position,
    size: number,
    health: number,
    speed: number,
    goldValue: number,
    color: string,
    type: string,
    shield: number = 0
  ) {
    this.id = id;
    this.position = position;
    this.size = size;
    this.isActive = true;
    this.health = health;
    this.maxHealth = health;
    this.speed = speed;
    this.goldValue = goldValue;
    this.color = color;
    this.shield = shield;
    this.type = type;
    this.frozenUntil = 0;
  }

  update() {
    if (!this.isActive) return;
    
    // Update position based on path and speed
    this.position.x += this.speed;
    this.position.y += this.speed;

    // Check if enemy reached end of path
    if (this.position.x > GAME_CONSTANTS.CANVAS_WIDTH || 
        this.position.y > GAME_CONSTANTS.CANVAS_HEIGHT) {
      this.isActive = false;
      // Handle player damage
    }
  }
}

export interface Bullet {
  id: string;
  position: Position;
  size: number;
  isActive: boolean;
  speed: number;
  damage: number;
  direction: Position;
  color: string | string[];
  typeIndex: number;
  effect?: BulletEffect;
  special?: BulletSpecial;
  createdAt?: number;
  update: () => void;
}

export interface Effect {
  id: string;
  position: Position;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  type: EffectType;
  update: () => void;
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
  maxTowers: number;
  globalWallStrength: number;
  isGameOver: boolean;
  isStarted: boolean;
}
