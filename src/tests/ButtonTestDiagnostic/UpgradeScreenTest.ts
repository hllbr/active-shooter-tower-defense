/**
 * 📱 UPGRADE SCREEN TEST
 * Upgrade ekranının durumunu test eder
 */

import { useGameStore } from '../../models/store';

export class UpgradeScreenTest {
  
  /**
   * Test Upgrade Screen State
   */
  static testUpgradeScreenState() {
    console.log('🧪 Testing Upgrade Screen State...');
    
    const store = useGameStore.getState();
    
    console.log(`Current upgrade screen state:`, {
      isRefreshing: store.isRefreshing,
      gold: store.gold,
      currentWave: store.currentWave,
      enemiesKilled: store.enemiesKilled,
      enemiesRequired: store.enemiesRequired,
      isPreparing: store.isPreparing,
      diceUsed: store.diceUsed
    });
    
    // Test opening upgrade screen
    store.setRefreshing(true);
    
    const opened = useGameStore.getState().isRefreshing;
    console.log(`✅ Upgrade screen opens: ${opened}`);
    
    return opened;
  }
} 