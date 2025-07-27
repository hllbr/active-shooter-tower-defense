import type { Enemy } from '../../models/gameTypes';
import { GAME_CONSTANTS } from '../../utils/constants';
import { WAVE_SPAWN_CONFIGS } from './waveConfigs';
import type {
  ISpawnStrategy,
  IPerformanceTracker,
  WaveSpawnConfig
} from './types';
import { dynamicDifficultyManager } from '../DynamicDifficultyManager';

export class AdaptiveSpawnStrategy implements ISpawnStrategy {
  private lastSpawnTime = 0;
  private spawnAcceleration = 1.0;

  constructor(private tracker: IPerformanceTracker) {}

  calculateNextSpawnDelay(waveNumber: number, currentSpawnCount: number): number {
    const config = this.getWaveConfig(waveNumber);

    const baseDelay = config.baseSpawnRate;
    const accelerationFactor = Math.pow(config.spawnRateAcceleration, currentSpawnCount);

    const performanceModifier = this.tracker.getAdaptiveDifficultyModifier();
    
    // Apply dynamic difficulty spawn rate adjustment
    const dynamicSpawnRateModifier = dynamicDifficultyManager.getSpawnRateAdjustment();

    const progressionScaling = Math.max(0.3, 1.0 - waveNumber * 0.02);

    const finalDelay = baseDelay * accelerationFactor * performanceModifier * dynamicSpawnRateModifier * progressionScaling;

    return Math.max(200, finalDelay);
  }

  selectEnemyType(waveNumber: number, activeEnemies: Enemy[]): keyof typeof GAME_CONSTANTS.ENEMY_TYPES {
    const config = this.getWaveConfig(waveNumber);
    const availableTypes = config.enemyComposition.filter(
      (entry) =>
        waveNumber >= entry.minWave &&
        (entry.maxConcurrent === -1 || this.countEnemyType(activeEnemies, entry.type) < entry.maxConcurrent)
    );

    if (availableTypes.length === 0) {
      return 'Basic';
    }

    const totalWeight = availableTypes.reduce((sum, entry) => sum + entry.weight, 0);
    let random = Math.random() * totalWeight;

    for (const entry of availableTypes) {
      random -= entry.weight;
      if (random <= 0) {
        return entry.type;
      }
    }

    return availableTypes[0].type;
  }

  shouldSpawnBoss(waveNumber: number, currentSpawnCount: number): boolean {
    const config = this.getWaveConfig(waveNumber);
    if (!config.bossConfig) return false;

    const isLateInWave = currentSpawnCount > config.maxEnemiesPerWave * 0.7;
    const passesChanceCheck = Math.random() < config.bossConfig.spawnChance;
    const meetsWaveRequirement = waveNumber >= 5;

    return isLateInWave && passesChanceCheck && meetsWaveRequirement;
  }

  applyDifficultyScaling(enemy: Enemy, waveNumber: number): Enemy {
    const config = this.getWaveConfig(waveNumber);
    const modifiers = config.difficultyModifiers;

    const healthScaling = Math.pow(modifiers.healthScalingFactor, waveNumber - 1);
    enemy.health = Math.floor(enemy.health * healthScaling);
    enemy.maxHealth = enemy.health;

    const speedScaling = Math.pow(modifiers.speedScalingFactor, (waveNumber - 1) * 0.5);
    enemy.speed = Math.floor(enemy.speed * speedScaling);

    const performanceModifier = this.tracker.getAdaptiveDifficultyModifier();
    enemy.health = Math.floor(enemy.health * performanceModifier);
    enemy.speed = Math.floor(enemy.speed * performanceModifier);

    // Apply dynamic difficulty adjustment as final scaling
    return dynamicDifficultyManager.applyEnemyAdjustment(enemy, enemy.isSpecial || false);
  }

  private getWaveConfig(waveNumber: number): WaveSpawnConfig {
    return WAVE_SPAWN_CONFIGS[this.getWaveTier(waveNumber)];
  }

  private getWaveTier(waveNumber: number): keyof typeof WAVE_SPAWN_CONFIGS {
    if (waveNumber <= 5) return 'easy';
    if (waveNumber <= 10) return 'medium';
    if (waveNumber <= 15) return 'hard';
    if (waveNumber <= 25) return 'extreme';
    return 'nightmare';
  }

  private countEnemyType(enemies: Enemy[], type: keyof typeof GAME_CONSTANTS.ENEMY_TYPES): number {
    return enemies.filter((enemy) => enemy.type === type).length;
  }
}
