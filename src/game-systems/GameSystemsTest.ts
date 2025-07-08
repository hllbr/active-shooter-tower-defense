/**
 * ✅ GAME SYSTEMS TEST SUITE
 * Tests the critical functionality fixed in this update
 */

import { useGameStore } from '../models/store';
import { waveManager } from './WaveManager';

export class GameSystemsTest {
  
  /**
   * Test Wave Progression and Upgrade Screen Trigger
   */
  static testWaveProgression() {
    
    const store = useGameStore.getState();
    
    // Initial state check
    
    // Simulate killing required enemies
    const requiredKills = store.enemiesRequired;
    for (let i = 0; i < requiredKills; i++) {
      store.removeEnemy(`test-enemy-${i}`);
    }
    
    // Check if wave completion triggers upgrade screen
    const updatedStore = useGameStore.getState();
    
    // Manually trigger wave completion check
    waveManager.checkComplete(
      updatedStore.currentWave,
      0, // no remaining enemies
      false, // no pending spawns
      updatedStore.enemiesKilled,
      updatedStore.enemiesRequired
    );
    
    // Check if upgrade screen opened
    const finalStore = useGameStore.getState();
    
    return finalStore.isRefreshing;
  }
  
  /**
   * Test Store Function Implementation
   */
  static testStoreFunctions() {
    
    const store = useGameStore.getState();
    
    // Test nextWave function
    const initialWave = store.currentWave;
    const initialKills = store.enemiesKilled;
    
    
    store.nextWave();
    
    const afterNextWave = useGameStore.getState();
    
    // Verify wave incremented and kills reset
    const waveIncremented = afterNextWave.currentWave === initialWave + 1;
    const killsReset = afterNextWave.enemiesKilled === 0;
    
    
    return waveIncremented && killsReset;
  }
  
  /**
   * Test Enemy Spawning System
   */
  static testEnemySpawning() {
    
    const store = useGameStore.getState();
    
    // Test enemy addition
    const initialEnemyCount = store.enemies.length;
    
    const testEnemy = {
      id: 'test-enemy-spawn',
      position: { x: 100, y: 100 },
      size: 20,
      isActive: true,
      health: 100,
      maxHealth: 100,
      speed: 50,
      goldValue: 10,
      color: '#ff0000',
      frozenUntil: 0,
      isSpecial: false,
      damage: 10,
      type: 'Basic' as const,
    };
    
    store.addEnemy(testEnemy);
    
    const afterAdd = useGameStore.getState();
    const enemyAdded = afterAdd.enemies.length === initialEnemyCount + 1;
    
    
    // Test enemy removal (which should increment kill count)
    const initialKills = afterAdd.enemiesKilled;
    store.removeEnemy('test-enemy-spawn');
    
    const afterRemove = useGameStore.getState();
    const enemyRemoved = afterRemove.enemies.length === initialEnemyCount;
    const killIncremented = afterRemove.enemiesKilled === initialKills + 1;
    
    
    return enemyAdded && enemyRemoved && killIncremented;
  }
  
  /**
   * Test Upgrade Screen Flow
   */
  static testUpgradeScreenFlow() {
    
    const store = useGameStore.getState();
    
    // Test opening upgrade screen
    store.setRefreshing(true);
    const openState = useGameStore.getState();
    const screenOpened = openState.isRefreshing;
    
    
    // Test continuing from upgrade screen
    store.nextWave();
    store.startPreparation();
    store.setRefreshing(false);
    
    const afterContinue = useGameStore.getState();
    const screenClosed = !afterContinue.isRefreshing;
    const preparationStarted = afterContinue.isPreparing;
    
    
    return screenOpened && screenClosed && preparationStarted;
  }
  
  /**
   * Run All Tests
   */
  static runAllTests() {
    
    const results = {
      waveProgression: this.testWaveProgression(),
      storeFunctions: this.testStoreFunctions(),
      enemySpawning: this.testEnemySpawning(),
      upgradeScreen: this.testUpgradeScreenFlow(),
    };
    
    Object.entries(results).forEach(([test, passed]) => {
    });
    
    const allPassed = Object.values(results).every(result => result);
    
    return results;
  }
}

// Export for use in development
export default GameSystemsTest; 