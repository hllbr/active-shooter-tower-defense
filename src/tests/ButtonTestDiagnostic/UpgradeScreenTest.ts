/**
 * 📱 UPGRADE SCREEN TEST
 * Upgrade ekranının durumunu test eder
 */

import { useGameStore } from '../../models/store';
import { Logger } from '../../utils/Logger';

export class UpgradeScreenTest {
  
  /**
   * Test Upgrade Screen State
   */
  static testUpgradeScreenState() {
    Logger.log('📱 Testing upgrade screen state...');
    
    const store = useGameStore.getState();
    
    console.log({
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
    Logger.log(`Upgrade screen opened: ${opened}`);
    
    return opened;
  }
} 