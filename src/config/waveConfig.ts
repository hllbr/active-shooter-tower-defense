import type { WaveEnemyConfig, WaveModifier } from '../models/gameTypes';

// ✅ NEW: Dynamic Wave Configuration System
export interface DynamicWaveConfig {
  waveNumber: number;
  enemyComposition: WaveEnemyConfig[];
  modifier?: WaveModifier;
  spawnRate: number;
  adaptiveTiming: {
    basePrepTime: number;
    performanceMultiplier: number;
    minPrepTime: number;
    maxPrepTime: number;
  };
  inWaveScaling: {
    enemySpeedMultiplier: number;
    enemyHealthMultiplier: number;
    spawnRateAcceleration: number;
  };
  difficulty: {
    baseDifficulty: number;
    playerPerformanceAdjustment: number;
    randomizationFactor: number;
  };
}

// ✅ NEW: Procedural Wave Generation
export class ProceduralWaveGenerator {
  private static readonly BASE_ENEMY_TYPES = ['Basic', 'Scout', 'Tank', 'Ghost'];
  private static readonly ADVANCED_ENEMY_TYPES = ['Assassin', 'Berserker', 'Shaman', 'Archer', 'ZigZag'];
  private static readonly ELITE_ENEMY_TYPES = ['Demon', 'Wraith', 'Golem', 'Phoenix'];
  private static readonly BOSS_TYPES = ['TankBoss', 'GhostBoss', 'DemonLord', 'DragonKing', 'LichKing', 'VoidGod', 'UltimateGod'];

  /**
   * Generates a dynamic wave configuration with procedural elements
   */
  static generateWaveConfig(waveNumber: number, playerPerformance: number): DynamicWaveConfig {
    const baseDifficulty = this.calculateBaseDifficulty(waveNumber);
    const performanceAdjustment = this.calculatePerformanceAdjustment(playerPerformance);
    const randomizationFactor = this.generateRandomizationFactor(waveNumber);

    const finalDifficulty = Math.max(0.1, Math.min(2.0, 
      baseDifficulty + performanceAdjustment + randomizationFactor
    ));

    return {
      waveNumber,
      enemyComposition: this.generateEnemyComposition(waveNumber, finalDifficulty),
      modifier: this.generateWaveModifier(waveNumber, finalDifficulty),
      spawnRate: this.calculateSpawnRate(waveNumber, finalDifficulty),
      adaptiveTiming: this.calculateAdaptiveTiming(waveNumber, playerPerformance),
      inWaveScaling: this.calculateInWaveScaling(waveNumber, finalDifficulty),
      difficulty: {
        baseDifficulty,
        playerPerformanceAdjustment: performanceAdjustment,
        randomizationFactor
      }
    };
  }

  /**
   * Calculates base difficulty based on wave number
   */
  private static calculateBaseDifficulty(waveNumber: number): number {
    if (waveNumber <= 10) return 0.1 + (waveNumber * 0.05);
    if (waveNumber <= 25) return 0.6 + ((waveNumber - 10) * 0.03);
    if (waveNumber <= 50) return 1.05 + ((waveNumber - 25) * 0.02);
    if (waveNumber <= 75) return 1.55 + ((waveNumber - 50) * 0.015);
    return 1.925 + ((waveNumber - 75) * 0.01);
  }

  /**
   * Adjusts difficulty based on player performance
   */
  private static calculatePerformanceAdjustment(performance: number): number {
    // performance: 0 = poor, 1 = excellent
    if (performance > 0.8) return 0.2; // Make it harder for good players
    if (performance < 0.3) return -0.15; // Make it easier for struggling players
    return 0; // No adjustment for average performance
  }

  /**
   * Adds randomization to prevent predictable patterns
   */
  private static generateRandomizationFactor(waveNumber: number): number {
    const seed = waveNumber * 12345; // Simple deterministic seed
    const random = Math.sin(seed) * 0.1; // Small random factor
    return random;
  }

  /**
   * Generates enemy composition based on wave difficulty
   */
  private static generateEnemyComposition(waveNumber: number, difficulty: number): WaveEnemyConfig[] {
    const composition: WaveEnemyConfig[] = [];
    const totalEnemies = Math.floor(5 + (difficulty * 15));

    // Determine available enemy types based on wave progression
    const availableTypes = this.getAvailableEnemyTypes(waveNumber);
    
    // Distribute enemies across types
    let remainingEnemies = totalEnemies;
    
    // Always include some basic enemies
    const basicCount = Math.max(2, Math.floor(remainingEnemies * 0.3));
    composition.push({ type: 'Basic', count: basicCount });
    remainingEnemies -= basicCount;

    // Add variety based on difficulty
    while (remainingEnemies > 0 && availableTypes.length > 0) {
      const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
      const count = Math.min(remainingEnemies, Math.floor(Math.random() * 5) + 1);
      
      composition.push({ type, count });
      remainingEnemies -= count;
    }

    // Add boss for milestone waves
    if (this.isBossWave(waveNumber)) {
      const bossType = this.getBossType(waveNumber);
      composition.push({ type: bossType, count: 1 });
    }

    return composition;
  }

  /**
   * Gets available enemy types based on wave progression
   */
  private static getAvailableEnemyTypes(waveNumber: number): string[] {
    const types = [...this.BASE_ENEMY_TYPES];
    
    if (waveNumber >= 5) types.push(...this.ADVANCED_ENEMY_TYPES);
    if (waveNumber >= 15) types.push(...this.ELITE_ENEMY_TYPES);
    
    return types;
  }

  /**
   * Determines if this is a boss wave
   */
  private static isBossWave(waveNumber: number): boolean {
    return waveNumber % 10 === 0 || waveNumber === 50 || waveNumber === 80 || waveNumber === 100;
  }

  /**
   * Gets appropriate boss type for wave
   */
  private static getBossType(waveNumber: number): string {
    if (waveNumber <= 10) return 'TankBoss';
    if (waveNumber <= 20) return 'GhostBoss';
    if (waveNumber <= 30) return 'DemonLord';
    if (waveNumber <= 40) return 'DragonKing';
    if (waveNumber <= 60) return 'LichKing';
    if (waveNumber <= 80) return 'VoidGod';
    return 'UltimateGod';
  }

  /**
   * Generates wave modifier based on difficulty
   */
  private static generateWaveModifier(waveNumber: number, difficulty: number): WaveModifier | undefined {
    const modifiers: WaveModifier[] = [];
    
    // Speed modifier for high difficulty
    if (difficulty > 1.2) {
      modifiers.push({ speedMultiplier: 1.2 + (difficulty - 1.2) * 0.3 });
    }
    
    // Bonus enemies for variety
    if (Math.random() < 0.3) {
      modifiers.push({ bonusEnemies: true });
    }
    
    // Tower restrictions for strategic challenge
    if (difficulty > 1.5 && Math.random() < 0.2) {
      const disabledTypes = ['sniper', 'gatling', 'laser'];
      modifiers.push({ disableTowerType: disabledTypes[Math.floor(Math.random() * disabledTypes.length)] });
    }
    
    return modifiers.length > 0 ? modifiers[0] : undefined;
  }

  /**
   * Calculates spawn rate based on wave difficulty
   */
  private static calculateSpawnRate(_waveNumber: number, difficulty: number): number {
    const baseRate = 2000; // 2 seconds base
    const difficultyMultiplier = 1 - (difficulty * 0.2); // Faster spawning for higher difficulty
    return Math.max(500, baseRate * difficultyMultiplier);
  }

  /**
   * Calculates adaptive timing based on player performance
   */
  private static calculateAdaptiveTiming(_waveNumber: number, playerPerformance: number): DynamicWaveConfig['adaptiveTiming'] {
    const basePrepTime = 30000; // 30 seconds base
    const performanceMultiplier = 1 - (playerPerformance * 0.3); // Faster for good performance
    const minPrepTime = 10000; // 10 seconds minimum
    const maxPrepTime = 60000; // 60 seconds maximum
    
    return {
      basePrepTime,
      performanceMultiplier,
      minPrepTime,
      maxPrepTime
    };
  }

  /**
   * Calculates in-wave scaling for increasing difficulty within a wave
   */
  private static calculateInWaveScaling(_waveNumber: number, difficulty: number): DynamicWaveConfig['inWaveScaling'] {
    return {
      enemySpeedMultiplier: 1 + (difficulty * 0.1),
      enemyHealthMultiplier: 1 + (difficulty * 0.15),
      spawnRateAcceleration: 0.95 - (difficulty * 0.02) // Faster spawning as wave progresses
    };
  }
}

// ✅ NEW: Wave Performance Tracker for adaptive timing
export class WavePerformanceTracker {
  private static waveCompletionTimes: number[] = [];
  private static playerPerformance: number = 0.5; // Default to average

  /**
   * Records wave completion time and updates performance metrics
   */
  static recordWaveCompletion(waveNumber: number, completionTime: number): void {
    this.waveCompletionTimes[waveNumber] = completionTime;
    this.updatePlayerPerformance();
  }

  /**
   * Gets current player performance rating (0-1)
   */
  static getPlayerPerformance(): number {
    return this.playerPerformance;
  }

  /**
   * Updates player performance based on recent wave completion times
   */
  private static updatePlayerPerformance(): void {
    const recentTimes = this.waveCompletionTimes.slice(-5); // Last 5 waves
    if (recentTimes.length === 0) return;

    const averageTime = recentTimes.reduce((sum, time) => sum + time, 0) / recentTimes.length;
    const expectedTime = 60000; // 60 seconds expected
    
    // Normalize performance: faster = better performance
    this.playerPerformance = Math.max(0, Math.min(1, 1 - (averageTime / expectedTime)));
  }

  /**
   * Resets performance tracking
   */
  static reset(): void {
    this.waveCompletionTimes = [];
    this.playerPerformance = 0.5;
  }
}

// ✅ NEW: In-Wave Scaling Manager
export class InWaveScalingManager {
  private static currentWaveStartTime: number = 0;
  private static enemySpawnCount: number = 0;

  /**
   * Starts tracking for a new wave
   */
  static startWave(_waveNumber: number): void {
    this.currentWaveStartTime = performance.now();
    this.enemySpawnCount = 0;
  }

  /**
   * Gets current scaling factors based on wave progress
   */
  static getCurrentScalingFactors(_waveNumber: number, config: DynamicWaveConfig): {
    speedMultiplier: number;
    healthMultiplier: number;
    spawnRateMultiplier: number;
  } {
    const waveProgress = this.enemySpawnCount / 10; // Normalize to 0-1
    const timeProgress = (performance.now() - this.currentWaveStartTime) / 60000; // 60 seconds max
    
    const progressFactor = Math.max(waveProgress, timeProgress);
    
    return {
      speedMultiplier: 1 + (config.inWaveScaling.enemySpeedMultiplier - 1) * progressFactor,
      healthMultiplier: 1 + (config.inWaveScaling.enemyHealthMultiplier - 1) * progressFactor,
      spawnRateMultiplier: 1 + (1 - config.inWaveScaling.spawnRateAcceleration) * progressFactor
    };
  }

  /**
   * Records enemy spawn for scaling calculations
   */
  static recordEnemySpawn(): void {
    this.enemySpawnCount++;
  }

  /**
   * Resets scaling for new wave
   */
  static reset(): void {
    this.currentWaveStartTime = 0;
    this.enemySpawnCount = 0;
  }
} 