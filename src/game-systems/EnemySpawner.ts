import { useGameStore } from '../models/store';
import { waveManager } from "./WaveManager";
import { performanceTracker, dynamicSpawnController } from './spawn-system';
import { 
  EnemyFactory, 
  _EnemyMovement, 
  WaveSpawnManager 
} from './enemy';
import { EnhancedEnemyMovement } from './enemy/EnhancedEnemyMovement';

// Re-export functions for backward compatibility
export const stopEnemyWave = WaveSpawnManager.stopEnemyWave;
export const startContinuousSpawning = WaveSpawnManager.startContinuousSpawning;
export const stopContinuousSpawning = WaveSpawnManager.stopContinuousSpawning;
export const startEnemyWave = WaveSpawnManager.startEnemyWave;

/**
 * Enhanced enemy movement update with performance tracking
 */
export function updateEnemyMovement() {
  // Update enemy movement using the enhanced system with visual diversification
  EnhancedEnemyMovement.updateEnemyMovement();
  
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

// Export the factory for direct enemy creation if needed
export const createEnemy = EnemyFactory.createEnemy;
