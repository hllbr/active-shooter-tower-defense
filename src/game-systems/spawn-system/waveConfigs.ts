import type { WaveSpawnConfig } from './types';

export const WAVE_SPAWN_CONFIGS: Record<string, WaveSpawnConfig> = {
  easy: {
    baseSpawnRate: 1800,
    spawnRateAcceleration: 0.97,
    maxEnemiesPerWave: 8,
    enemyComposition: [
      { type: 'Basic', weight: 80, minWave: 1, maxConcurrent: -1 },
      { type: 'Scout', weight: 20, minWave: 3, maxConcurrent: 2 }
    ],
    difficultyModifiers: {
      performanceThreshold: 0.6,
      adaptiveSpawnModifier: 1.0,
      healthScalingFactor: 1.12,
      speedScalingFactor: 1.03
    }
  },
  medium: {
    baseSpawnRate: 1400,
    spawnRateAcceleration: 0.95,
    maxEnemiesPerWave: 12,
    enemyComposition: [
      { type: 'Basic', weight: 50, minWave: 1, maxConcurrent: -1 },
      { type: 'Scout', weight: 30, minWave: 1, maxConcurrent: 4 },
      { type: 'Tank', weight: 20, minWave: 6, maxConcurrent: 2 }
    ],
    bossConfig: {
      spawnChance: 0.15,
      bossTypes: ['Tank'],
      healthMultiplier: 1.5,
      speedMultiplier: 0.8,
      goldMultiplier: 2.0
    },
    difficultyModifiers: {
      performanceThreshold: 0.65,
      adaptiveSpawnModifier: 1.1,
      healthScalingFactor: 1.15,
      speedScalingFactor: 1.05
    }
  },
  hard: {
    baseSpawnRate: 1000,
    spawnRateAcceleration: 0.93,
    maxEnemiesPerWave: 16,
    enemyComposition: [
      { type: 'Basic', weight: 30, minWave: 1, maxConcurrent: -1 },
      { type: 'Scout', weight: 35, minWave: 1, maxConcurrent: 6 },
      { type: 'Tank', weight: 25, minWave: 1, maxConcurrent: 3 },
      { type: 'Ghost', weight: 10, minWave: 11, maxConcurrent: 2 }
    ],
    bossConfig: {
      spawnChance: 0.25,
      bossTypes: ['Tank', 'Ghost'],
      healthMultiplier: 2.0,
      speedMultiplier: 0.9,
      goldMultiplier: 2.5
    },
    difficultyModifiers: {
      performanceThreshold: 0.7,
      adaptiveSpawnModifier: 1.2,
      healthScalingFactor: 1.18,
      speedScalingFactor: 1.06
    }
  },
  extreme: {
    baseSpawnRate: 700,
    spawnRateAcceleration: 0.91,
    maxEnemiesPerWave: 20,
    enemyComposition: [
      { type: 'Basic', weight: 20, minWave: 1, maxConcurrent: -1 },
      { type: 'Scout', weight: 30, minWave: 1, maxConcurrent: 8 },
      { type: 'Tank', weight: 30, minWave: 1, maxConcurrent: 4 },
      { type: 'Ghost', weight: 20, minWave: 1, maxConcurrent: 4 }
    ],
    bossConfig: {
      spawnChance: 0.35,
      bossTypes: ['Tank', 'Ghost'],
      healthMultiplier: 2.5,
      speedMultiplier: 1.0,
      goldMultiplier: 3.0
    },
    difficultyModifiers: {
      performanceThreshold: 0.75,
      adaptiveSpawnModifier: 1.3,
      healthScalingFactor: 1.22,
      speedScalingFactor: 1.08
    }
  },
  nightmare: {
    baseSpawnRate: 500,
    spawnRateAcceleration: 0.89,
    maxEnemiesPerWave: 25,
    enemyComposition: [
      { type: 'Basic', weight: 15, minWave: 1, maxConcurrent: -1 },
      { type: 'Scout', weight: 25, minWave: 1, maxConcurrent: 10 },
      { type: 'Tank', weight: 35, minWave: 1, maxConcurrent: 6 },
      { type: 'Ghost', weight: 25, minWave: 1, maxConcurrent: 6 }
    ],
    bossConfig: {
      spawnChance: 0.45,
      bossTypes: ['Tank', 'Ghost'],
      healthMultiplier: 3.0,
      speedMultiplier: 1.1,
      goldMultiplier: 4.0
    },
    difficultyModifiers: {
      performanceThreshold: 0.8,
      adaptiveSpawnModifier: 1.4,
      healthScalingFactor: 1.25,
      speedScalingFactor: 1.10
    }
  }
};
