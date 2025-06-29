import type { Enemy } from "../../models/gameTypes";
import { GAME_CONSTANTS } from "../../utils/Constants";

export interface WaveSpawnConfig {
  baseSpawnRate: number;
  spawnRateAcceleration: number;
  maxEnemiesPerWave: number;
  enemyComposition: EnemyCompositionEntry[];
  bossConfig?: BossSpawnConfig;
  difficultyModifiers: DifficultyModifiers;
}

export interface EnemyCompositionEntry {
  type: keyof typeof GAME_CONSTANTS.ENEMY_TYPES;
  weight: number;
  minWave: number;
  maxConcurrent: number;
}

export interface BossSpawnConfig {
  spawnChance: number;
  bossTypes: Array<keyof typeof GAME_CONSTANTS.ENEMY_TYPES>;
  healthMultiplier: number;
  speedMultiplier: number;
  goldMultiplier: number;
}

export interface DifficultyModifiers {
  performanceThreshold: number;
  adaptiveSpawnModifier: number;
  healthScalingFactor: number;
  speedScalingFactor: number;
}

export interface ISpawnStrategy {
  calculateNextSpawnDelay(waveNumber: number, currentSpawnCount: number): number;
  selectEnemyType(waveNumber: number, activeEnemies: Enemy[]):
    keyof typeof GAME_CONSTANTS.ENEMY_TYPES;
  shouldSpawnBoss(waveNumber: number, currentSpawnCount: number): boolean;
  applyDifficultyScaling(enemy: Enemy, waveNumber: number): Enemy;
}

export interface IPerformanceTracker {
  trackPlayerPerformance(
    waveNumber: number,
    completionTime: number,
    towersUsed: number
  ): void;
  getPerformanceScore(): number;
  getAdaptiveDifficultyModifier(): number;
}
