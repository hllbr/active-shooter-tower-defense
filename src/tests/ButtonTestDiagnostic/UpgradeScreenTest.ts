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
    
    // Test opening upgrade screen
    store.setRefreshing(true);
    // Simulate opening the upgrade screen (would mount UpgradeScreen in UI)
    store.setPaused(true);
    
    const opened = useGameStore.getState().isRefreshing;
    const pausedWhenOpen = useGameStore.getState().isPaused;
    Logger.log(`Upgrade screen opened: ${opened}, game paused: ${pausedWhenOpen}`);
    
    // Test closing upgrade screen
    store.setRefreshing(false);
    // Simulate closing the upgrade screen (would unmount UpgradeScreen in UI)
    store.setPaused(false);
    const closed = !useGameStore.getState().isRefreshing;
    const pausedWhenClosed = useGameStore.getState().isPaused;
    Logger.log(`Upgrade screen closed: ${closed}, game paused: ${pausedWhenClosed}`);
    
    return opened && pausedWhenOpen && closed && !pausedWhenClosed;
  }
} 