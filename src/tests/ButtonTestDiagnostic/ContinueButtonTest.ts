/**
 * 🔄 CONTINUE BUTTON TEST
 * Devam butonunun çalışıp çalışmadığını test eder
 */

import { useGameStore } from '../../models/store';
import { Logger } from '../../utils/Logger';

export class ContinueButtonTest {
  
  /**
   * Test Continue Button Chain
   */
  static testContinueButton() {
    Logger.log('🔄 Testing continue button...');
    
    const store = useGameStore.getState();
    
    // Check initial state
    
    // Test functions exist
    const functionsToTest = {
      nextWave: store.nextWave,
      startPreparation: store.startPreparation,
      resetDice: store.resetDice,
      setRefreshing: store.setRefreshing
    };
    const missingFunctions = Object.entries(functionsToTest)
      .filter(([_name, fn]) => typeof fn !== 'function')
      .map(([name]) => name);
    
    if (missingFunctions.length > 0) {
      Logger.error('❌ Missing functions:', missingFunctions);
      return false;
    }
    
    Logger.log('✅ All required functions exist');
    
    // Test the exact sequence from UpgradeScreen
    try {
      Logger.log('🔧 Starting continue button sequence...');
      
      const initialWave = store.currentWave;
      
      // 1. Next wave
      store.nextWave();
      
      // 2. Start preparation  
      store.startPreparation();
      
      // 3. Reset dice
      store.resetDice();
      
      // 4. Close upgrade screen
      setTimeout(() => {
        store.setRefreshing(false);
      }, 50);
      
      // Check results
      setTimeout(() => {
        const result = useGameStore.getState();
        
        const waveIncremented = result.currentWave === initialWave + 1;
        const preparationStarted = result.isPreparing;
        const _screenClosed = !result.isRefreshing;
        const killsReset = result.enemiesKilled === 0;
        
        if (waveIncremented && preparationStarted && killsReset) {
          Logger.log('✅ Continue button test passed');
        } else {
          Logger.error('❌ Continue button test failed');
        }
      }, 100);
      
      return true;
      
    } catch (error) {
      Logger.error('❌ Error in continue sequence:', error);
      return false;
    }
  }
} 