import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import { waveCompositions } from '../../config/waves';
import { spawnStrategy, performanceTracker, dynamicSpawnController } from '../spawn-system';
import { waveManager } from '../WaveManager';
import { EnemyFactory } from './EnemyFactory';
import type { Tower, TowerSlot, WaveEnemyConfig } from '../../models/gameTypes';

/**
 * Manager class responsible for handling wave-based enemy spawning
 */
export class WaveSpawnManager {
  private static spawnInterval: number | null = null;
  private static spawnQueue: string[] = [];
  private static spawnIndex = 0;
  private static continuousSpawnInterval: number | null = null;

  /**
   * Checks if wave spawning is currently active
   */
  static isSpawningActive(): boolean {
    return WaveSpawnManager.spawnInterval !== null;
  }

  /**
   * Stops the current enemy wave
   */
  static stopEnemyWave() {
    if (WaveSpawnManager.spawnInterval) {
      clearInterval(WaveSpawnManager.spawnInterval);
      WaveSpawnManager.spawnInterval = null;
    }
    // Also stop dynamic spawning
    dynamicSpawnController.stopWaveSpawning();
  }

  /**
   * Starts continuous spawning (for sandbox mode)
   */
  static startContinuousSpawning() {
    if (WaveSpawnManager.continuousSpawnInterval) {
      clearInterval(WaveSpawnManager.continuousSpawnInterval);
    }
    
    WaveSpawnManager.continuousSpawnInterval = window.setInterval(() => {
      const state = useGameStore.getState();
      
      // Sadece oyun başlatılmışsa ve yükseltme ekranında değilse düşman yarat
      if (state.isStarted && !state.isRefreshing) {
        const enemy = EnemyFactory.createEnemy(state.currentWave, 'Basic');
        state.addEnemy(enemy);
      }
    }, GAME_CONSTANTS.ENEMY_SPAWN_RATE);
  }

  /**
   * Stops continuous spawning
   */
  static stopContinuousSpawning() {
    if (WaveSpawnManager.continuousSpawnInterval) {
      clearInterval(WaveSpawnManager.continuousSpawnInterval);
      WaveSpawnManager.continuousSpawnInterval = null;
    }
  }

  /**
   * Starts enemy wave spawning with KILL-BASED completion system
   */
  static startEnemyWave(wave: number) {
    const { addEnemy, towers, towerSlots, buildTower, currentWaveModifier } = useGameStore.getState();

    // ✅ ENHANCED: Auto-place tower if no towers exist
    WaveSpawnManager.autoPlaceStarterTower(towers, towerSlots, buildTower);

    // Start dynamic spawning system
    dynamicSpawnController.startWaveSpawning(wave);

    // Clear any existing interval
    if (WaveSpawnManager.spawnInterval) clearInterval(WaveSpawnManager.spawnInterval);

    WaveSpawnManager.spawnQueue = [];
    WaveSpawnManager.spawnIndex = 0;
    const composition = waveCompositions[wave];
    
    // CRITICAL FIX: Build initial spawn queue
    WaveSpawnManager.buildSpawnQueue(composition, wave);

    // KILL-BASED SPAWN LOGIC: Continue spawning until required kills achieved
    let spawnCount = 0;
    let totalSpawned = 0;
    
    const spawnNext = () => {
      const state = useGameStore.getState();
      
      // ✅ CRITICAL FIX: Stop spawning if game is over
      if (state.isGameOver) {
        console.log('💀 Stopping enemy spawn: Game Over');
        if (WaveSpawnManager.spawnInterval) {
          clearInterval(WaveSpawnManager.spawnInterval);
          WaveSpawnManager.spawnInterval = null;
        }
        return;
      }
      
      const enemiesRequired = GAME_CONSTANTS.getWaveEnemiesRequired(wave);
      const enemiesKilled = state.enemiesKilled;
      
      // CRITICAL: Check if we need more enemies to be spawnable
      const totalAvailableToKill = totalSpawned - enemiesKilled;
      
      // If player could potentially finish wave with existing enemies, don't spam spawn
      if (totalAvailableToKill >= enemiesRequired) {
        // Schedule next check in 2 seconds
        WaveSpawnManager.spawnInterval = window.setTimeout(spawnNext, 2000);
        return;
      }
      
      // Determine what type to spawn
      const enemyType = WaveSpawnManager.determineEnemyType(wave);
      
      const enemy = EnemyFactory.createEnemy(wave, enemyType);
      addEnemy(enemy);
      totalSpawned++;
      
      if (currentWaveModifier?.bonusEnemies) {
        const bonusEnemy = EnemyFactory.createEnemy(wave, enemyType);
        addEnemy(bonusEnemy);
        totalSpawned++;
      }
      
      spawnCount++;
      
      // Calculate next spawn delay (slower after initial composition)
      let nextDelay = spawnStrategy.calculateNextSpawnDelay(wave, spawnCount);
      if (WaveSpawnManager.spawnIndex >= WaveSpawnManager.spawnQueue.length) {
        // Slower spawning for additional enemies
        nextDelay = Math.max(3000, nextDelay * 2);
      }
      
      // Continue spawning
      WaveSpawnManager.spawnInterval = window.setTimeout(spawnNext, nextDelay);
    };

    // Start the first spawn
    spawnNext();
  }

  /**
   * Updates enemy movement and checks wave completion
   */
  static updateEnemyMovement() {
    const { enemies, enemiesKilled, enemiesRequired, towers, currentWave } = useGameStore.getState();
    
    // CRITICAL FIX: Pending should be true if spawning is still active OR if we haven't reached required kills
    const pending = WaveSpawnManager.isSpawningActive() || enemiesKilled < enemiesRequired;
    
    // Track performance for dynamic difficulty adjustment
    if (!pending && enemies.length === 0) {
      performanceTracker.trackPlayerPerformance(currentWave, performance.now(), towers.length);
      dynamicSpawnController.onWaveComplete(currentWave, towers.length);
    }
    
    waveManager.checkComplete(currentWave, enemies.length, pending, enemiesKilled, enemiesRequired);
  }

  /**
   * Auto-places a starter tower if no towers exist
   */
  private static autoPlaceStarterTower(towers: Tower[], towerSlots: TowerSlot[], buildTower: (index: number, free: boolean) => void) {
    if (towers.length === 0) {
      const emptySlots = towerSlots
        .map((slot, index) => ({ slot, index }))
        .filter(({ slot }) => slot.unlocked && !slot.tower);
      
      if (emptySlots.length > 0) {
        // Choose random empty slot instead of first one for variety
        const randomSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
        console.log(`🏗️ Auto-building starter tower at slot ${randomSlot.index} (${emptySlots.length} slots available)`);
        buildTower(randomSlot.index, true); // Free tower placement
      } else {
        console.warn('⚠️ No unlocked slots available for auto tower placement!');
      }
    }
  }

  /**
   * Builds the initial spawn queue for the wave
   */
  private static buildSpawnQueue(composition: WaveEnemyConfig[] | undefined, wave: number) {
    if (composition) {
      composition.forEach((cfg: WaveEnemyConfig) => {
        for (let i = 0; i < cfg.count; i++) WaveSpawnManager.spawnQueue.push(cfg.type);
      });
    } else {
      const count = GAME_CONSTANTS.getWaveEnemiesRequired(wave);
      for (let i = 0; i < count; i++) WaveSpawnManager.spawnQueue.push('Basic');
    }
  }

  /**
   * Determines what type of enemy to spawn
   */
  private static determineEnemyType(wave: number): keyof typeof GAME_CONSTANTS.ENEMY_TYPES {
    if (WaveSpawnManager.spawnIndex < WaveSpawnManager.spawnQueue.length) {
      // Use composition if available
      return WaveSpawnManager.spawnQueue[WaveSpawnManager.spawnIndex++] as keyof typeof GAME_CONSTANTS.ENEMY_TYPES;
    } else {
      // After composition, spawn additional enemies based on wave pattern
      const wavePattern = wave % 3;
      if (wavePattern === 0) return 'Tank';
      else if (wavePattern === 1) return 'Scout';
      else return 'Basic';
    }
  }
} 