// ===== ACHIEVEMENT EVENT DATA TYPES =====

export interface WaveEventData {
  waveNumber: number;
  enemiesKilled: number;
  timeElapsed: number;
}

export interface PurchaseEventData {
  itemType: string;
  cost: number;
  level: number;
}

export interface EnemyEventData {
  enemyType: string;
  damage: number;
  isSpecial: boolean;
}

export interface TowerEventData {
  towerType: string;
  level: number;
  position: { x: number; y: number };
}

export type AchievementEventData = 
  | WaveEventData 
  | PurchaseEventData 
  | EnemyEventData 
  | TowerEventData 
  | Record<string, string | number | boolean>; 