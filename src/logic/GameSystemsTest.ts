/**
 * ✅ GAME SYSTEMS TEST SUITE
 * Tests the critical functionality fixed in this update
 */

import { useGameStore } from '../models/store';
import { waveManager } from './WaveManager';
import { GAME_CONSTANTS } from '../utils/Constants';

export class GameSystemsTest {
  
  /**
   * Test Wave Progression and Upgrade Screen Trigger
   */
  static testWaveProgression() {
    console.log('🧪 Testing Wave Progression...');
    
    const store = useGameStore.getState();
    
    // Initial state check
    console.log(`Initial state: Wave ${store.currentWave}, Enemies killed: ${store.enemiesKilled}/${store.enemiesRequired}`);
    
    // Simulate killing required enemies
    const requiredKills = store.enemiesRequired;
    for (let i = 0; i < requiredKills; i++) {
      store.removeEnemy(`test-enemy-${i}`);
    }
    
    // Check if wave completion triggers upgrade screen
    const updatedStore = useGameStore.getState();
    console.log(`After kills: Enemies killed: ${updatedStore.enemiesKilled}/${updatedStore.enemiesRequired}`);
    
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
    console.log(`Final state: isRefreshing=${finalStore.isRefreshing} (should be true)`);
    
    return finalStore.isRefreshing;
  }
  
  /**
   * Test Store Function Implementation
   */
  static testStoreFunctions() {
    console.log('🧪 Testing Store Functions...');
    
    const store = useGameStore.getState();
    
    // Test nextWave function
    const initialWave = store.currentWave;
    const initialKills = store.enemiesKilled;
    
    console.log(`Before nextWave: Wave ${initialWave}, Kills ${initialKills}`);
    
    store.nextWave();
    
    const afterNextWave = useGameStore.getState();
    console.log(`After nextWave: Wave ${afterNextWave.currentWave}, Kills ${afterNextWave.enemiesKilled}`);
    
    // Verify wave incremented and kills reset
    const waveIncremented = afterNextWave.currentWave === initialWave + 1;
    const killsReset = afterNextWave.enemiesKilled === 0;
    
    console.log(`✅ Wave incremented: ${waveIncremented}`);
    console.log(`✅ Kills reset: ${killsReset}`);
    
    return waveIncremented && killsReset;
  }
  
  /**
   * Test Enemy Spawning System
   */
  static testEnemySpawning() {
    console.log('🧪 Testing Enemy Spawning...');
    
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
    
    console.log(`✅ Enemy added: ${enemyAdded} (${initialEnemyCount} -> ${afterAdd.enemies.length})`);
    
    // Test enemy removal (which should increment kill count)
    const initialKills = afterAdd.enemiesKilled;
    store.removeEnemy('test-enemy-spawn');
    
    const afterRemove = useGameStore.getState();
    const enemyRemoved = afterRemove.enemies.length === initialEnemyCount;
    const killIncremented = afterRemove.enemiesKilled === initialKills + 1;
    
    console.log(`✅ Enemy removed: ${enemyRemoved}`);
    console.log(`✅ Kill count incremented: ${killIncremented}`);
    
    return enemyAdded && enemyRemoved && killIncremented;
  }
  
  /**
   * Test Upgrade Screen Flow
   */
  static testUpgradeScreenFlow() {
    console.log('🧪 Testing Upgrade Screen Flow...');
    
    const store = useGameStore.getState();
    
    // Test opening upgrade screen
    store.setRefreshing(true);
    const openState = useGameStore.getState();
    const screenOpened = openState.isRefreshing;
    
    console.log(`✅ Upgrade screen opened: ${screenOpened}`);
    
    // Test continuing from upgrade screen
    store.nextWave();
    store.startPreparation();
    store.setRefreshing(false);
    
    const afterContinue = useGameStore.getState();
    const screenClosed = !afterContinue.isRefreshing;
    const preparationStarted = afterContinue.isPreparing;
    
    console.log(`✅ Upgrade screen closed: ${screenClosed}`);
    console.log(`✅ Preparation started: ${preparationStarted}`);
    
    return screenOpened && screenClosed && preparationStarted;
  }
  
  /**
   * Run All Tests
   */
  static runAllTests() {
    console.log('🚀 Running Game Systems Test Suite...\n');
    
    const results = {
      waveProgression: this.testWaveProgression(),
      storeFunctions: this.testStoreFunctions(),
      enemySpawning: this.testEnemySpawning(),
      upgradeScreen: this.testUpgradeScreenFlow(),
    };
    
    console.log('\n📊 Test Results:');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎯 Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    
    return results;
  }
}

// Export for use in development
export default GameSystemsTest; 