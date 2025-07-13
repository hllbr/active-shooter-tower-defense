import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import { ProceduralWaveGenerator, WavePerformanceTracker, InWaveScalingManager } from '../../config/waveConfig';
import { EnemyFactory } from './EnemyFactory';
import { SpawnPositionManager } from './SpawnPositionManager';
import type { Tower, TowerSlot, WaveEnemyConfig, Enemy } from '../../models/gameTypes';
import type { DynamicWaveConfig } from '../../config/waveConfig';

/**
 * Enhanced enemy spawner with dynamic wave system integration
 */
export class EnhancedEnemySpawner {
  private static spawnInterval: number | null = null;
  private static spawnQueue: string[] = [];
  private static spawnIndex = 0;
  private static currentWaveConfig: DynamicWaveConfig | null = null;
  private static waveStartTime = 0;

  /**
   * Starts enhanced enemy wave spawning with dynamic configuration
   */
  static startEnemyWave(wave: number) {
    const { towers, towerSlots, buildTower } = useGameStore.getState();

    // ✅ NEW: Generate dynamic wave configuration
    const playerPerformance = WavePerformanceTracker.getPlayerPerformance();
    this.currentWaveConfig = ProceduralWaveGenerator.generateWaveConfig(wave, playerPerformance);

    // 🎯 UPDATE: Configure spawn zones for current wave
    SpawnPositionManager.updateSpawnZonesForWave(wave);

    // ✅ ENHANCED: Auto-place tower if no towers exist
    this.autoPlaceStarterTower(towers, towerSlots, buildTower);

    // Clear any existing interval
    if (this.spawnInterval) clearInterval(this.spawnInterval);

    this.spawnQueue = [];
    this.spawnIndex = 0;
    this.waveStartTime = performance.now();
    
    // ✅ NEW: Build spawn queue from dynamic configuration
    this.buildDynamicSpawnQueue(wave);

    // ✅ NEW: Start enhanced spawning with in-wave scaling
    this.startEnhancedSpawning(wave);
  }

  /**
   * Builds spawn queue from dynamic wave configuration
   */
  private static buildDynamicSpawnQueue(_wave: number) {
    if (!this.currentWaveConfig) return;

    this.spawnQueue = [];
    this.currentWaveConfig.enemyComposition.forEach((cfg: WaveEnemyConfig) => {
      for (let i = 0; i < cfg.count; i++) {
        this.spawnQueue.push(cfg.type);
      }
    });

  
  }

  /**
   * Starts enhanced spawning with in-wave scaling
   */
  private static startEnhancedSpawning(wave: number) {
    if (!this.currentWaveConfig) return;

    const spawnNext = () => {
      const state = useGameStore.getState();
      
      // ✅ CRITICAL FIX: Stop spawning if game is over
      if (state.isGameOver) {
        if (this.spawnInterval) {
          clearInterval(this.spawnInterval);
          this.spawnInterval = null;
        }
        return;
      }
      
      const enemiesRequired = GAME_CONSTANTS.getWaveEnemiesRequired(wave);
      const enemiesKilled = state.enemiesKilled;
      
      // CRITICAL: Check if we need more enemies to be spawnable
      const totalSpawned = this.spawnIndex;
      const totalAvailableToKill = totalSpawned - enemiesKilled;
      
      // If player could potentially finish wave with existing enemies, don't spam spawn
      if (totalAvailableToKill >= enemiesRequired) {
        // Schedule next check in 2 seconds
        this.spawnInterval = window.setTimeout(spawnNext, 2000);
        return;
      }
      
      // ✅ NEW: Get current scaling factors for in-wave difficulty
      const scalingFactors = this.currentWaveConfig ? InWaveScalingManager.getCurrentScalingFactors(wave, this.currentWaveConfig) : { speedMultiplier: 1, healthMultiplier: 1, spawnRateMultiplier: 1 };
      
      // Determine what type to spawn
      const enemyType = this.determineEnemyType(wave);
      
      // ✅ NEW: Create enemy with in-wave scaling
      const enemy = this.createScaledEnemy(wave, enemyType, scalingFactors);
      state.addEnemy(enemy);
      
      // ✅ NEW: Record spawn for scaling calculations
      InWaveScalingManager.recordEnemySpawn();
      
      this.spawnIndex++;
      
      // ✅ NEW: Calculate adaptive spawn delay based on wave progress
      const nextDelay = this.calculateAdaptiveSpawnDelay(wave, this.spawnIndex, scalingFactors);
      
      if (this.spawnIndex < this.spawnQueue.length) {
        this.spawnInterval = window.setTimeout(spawnNext, nextDelay);
      } else {
        // Schedule additional spawns for bonus enemies
        this.spawnInterval = window.setTimeout(spawnNext, Math.max(4000, nextDelay * 1.5));
      }
    };

    // Start spawning
    spawnNext();
  }

  /**
   * Creates enemy with in-wave scaling applied
   */
  private static createScaledEnemy(wave: number, enemyType: string, scalingFactors: { speedMultiplier: number; healthMultiplier: number; spawnRateMultiplier: number }): Enemy {
    const baseEnemy = EnemyFactory.createEnemy(wave, enemyType as string);
    
    // ✅ NEW: Apply in-wave scaling
    return {
      ...baseEnemy,
      speed: baseEnemy.speed * scalingFactors.speedMultiplier,
      health: baseEnemy.health * scalingFactors.healthMultiplier,
      maxHealth: baseEnemy.maxHealth * scalingFactors.healthMultiplier,
    };
  }

  /**
   * Calculates adaptive spawn delay based on wave progress
   */
  private static calculateAdaptiveSpawnDelay(wave: number, spawnCount: number, scalingFactors: { speedMultiplier: number; healthMultiplier: number; spawnRateMultiplier: number }): number {
    const baseDelay = this.currentWaveConfig?.spawnRate || 2000;
    const progressFactor = spawnCount / Math.max(1, this.spawnQueue.length);
    
    // ✅ NEW: Apply spawn rate acceleration based on wave progress
    const acceleratedDelay = baseDelay * Math.pow(scalingFactors.spawnRateMultiplier, progressFactor);
    
    // Ensure minimum and maximum delays
    return Math.max(500, Math.min(8000, acceleratedDelay));
  }

  /**
   * Determines enemy type to spawn based on wave configuration
   */
  private static determineEnemyType(_wave: number): string {
    if (this.spawnIndex < this.spawnQueue.length) {
      return this.spawnQueue[this.spawnIndex];
    }
    
    // Fallback to basic enemy type
    return 'Basic';
  }

  /**
   * Auto-places starter tower if no towers exist
   */
  private static autoPlaceStarterTower(towers: Tower[], towerSlots: TowerSlot[], buildTower: (slotIdx: number, free?: boolean, towerType?: 'attack' | 'economy') => void) {
    if (towers.length === 0) {
      // Find first unlocked slot
      const firstUnlockedSlot = towerSlots.findIndex(slot => slot.unlocked && !slot.tower);
      if (firstUnlockedSlot !== -1) {
        buildTower(firstUnlockedSlot, true, 'attack');
      }
    }
  }

  /**
   * Stops enemy wave spawning
   */
  static stopEnemyWave() {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
      this.spawnInterval = null;
    }
    this.spawnQueue = [];
    this.spawnIndex = 0;
    this.currentWaveConfig = null;
  
  }

  /**
   * Checks if wave spawning is currently active
   */
  static isSpawningActive(): boolean {
    return this.spawnInterval !== null;
  }

  /**
   * Gets current wave configuration
   */
  static getCurrentWaveConfig() {
    return this.currentWaveConfig;
  }

  /**
   * Records wave completion for performance tracking
   */
  static recordWaveCompletion(wave: number) {
    const completionTime = performance.now() - this.waveStartTime;
    WavePerformanceTracker.recordWaveCompletion(wave, completionTime);
    InWaveScalingManager.reset();
   
  }
} 