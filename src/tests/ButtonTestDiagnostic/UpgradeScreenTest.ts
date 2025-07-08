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
    
    // Check upgrade screen state
    
    // Test opening upgrade screen
    store.setRefreshing(true);
    
    const opened = useGameStore.getState().isRefreshing;
    Logger.log(`Upgrade screen opened: ${opened}`);
    
    return opened;
  }
} 