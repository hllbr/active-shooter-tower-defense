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
    
    const store = useGameStore.getState();
    
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
    
    return opened;
  }
} 