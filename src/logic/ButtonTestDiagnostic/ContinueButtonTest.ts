/**
 * 🔄 CONTINUE BUTTON TEST
 * Devam butonunun çalışıp çalışmadığını test eder
 */

import { useGameStore } from '../../models/store';

export class ContinueButtonTest {
  
  /**
   * Test Continue Button Chain
   */
  static testContinueButton() {
    console.log('🧪 Testing Continue Button Chain...');
    
    const store = useGameStore.getState();
    
    // Initial state
    console.log(`Initial state:`, {
      currentWave: store.currentWave,
      isRefreshing: store.isRefreshing,
      isPreparing: store.isPreparing,
      enemiesKilled: store.enemiesKilled,
      enemiesRequired: store.enemiesRequired
    });
    
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
      console.error('❌ Missing functions:', missingFunctions);
      return false;
    }
    
    console.log('✅ All required functions exist');
    
    // Test the exact sequence from UpgradeScreen
    try {
      console.log('🔄 Executing continue sequence...');
      
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
        console.log(`After continue sequence:`, {
          currentWave: result.currentWave,
          isRefreshing: result.isRefreshing,
          isPreparing: result.isPreparing,
          enemiesKilled: result.enemiesKilled,
          enemiesRequired: result.enemiesRequired
        });
        
        const waveIncremented = result.currentWave === initialWave + 1;
        const preparationStarted = result.isPreparing;
        const screenClosed = !result.isRefreshing;
        const killsReset = result.enemiesKilled === 0;
        
        console.log('📊 Continue Button Results:');
        console.log(`✅ Wave incremented: ${waveIncremented}`);
        console.log(`✅ Preparation started: ${preparationStarted}`);
        console.log(`✅ Screen closed: ${screenClosed}`);
        console.log(`✅ Kills reset: ${killsReset}`);
        
        if (waveIncremented && preparationStarted && killsReset) {
          console.log('🎉 Continue button works correctly!');
        } else {
          console.log('❌ Continue button has issues');
        }
      }, 100);
      
      return true;
      
    } catch (error) {
      console.error('❌ Error in continue sequence:', error);
      return false;
    }
  }
} 