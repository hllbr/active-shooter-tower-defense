/**
 * 🔧 BUTTON TEST DIAGNOSTIC TOOL
 * Zar atma ve devam butonlarının çalışıp çalışmadığını test eder
 */

import { useGameStore } from '../models/store';
import { Logger } from '../utils/Logger';

export class ButtonTestDiagnostic {
  
  /**
   * Test Dice Rolling System
   */
  static testDiceRolling() {
    
    const store = useGameStore.getState();
    
    // Initial state check
    console.log({
      diceUsed: store.diceUsed,
      isDiceRolling: store.isDiceRolling,
      diceRoll: store.diceRoll,
      discountMultiplier: store.discountMultiplier
    });
    
    // Test rollDice function exists
    if (typeof store.rollDice !== 'function') {
      Logger.error('❌ rollDice function not found!');
      return false;
    }
    
    // Reset dice first
    store.resetDice();
    
    // Test dice rolling
    store.rollDice();
    
    // Check immediate state
    const afterRoll = useGameStore.getState();
    console.log({
      diceUsed: afterRoll.diceUsed,
      isDiceRolling: afterRoll.isDiceRolling,
      diceRoll: afterRoll.diceRoll,
      discountMultiplier: afterRoll.discountMultiplier
    });
    
    // Wait for animation to complete
    setTimeout(() => {
      const finalState = useGameStore.getState();
      console.log({
        diceUsed: finalState.diceUsed,
        isDiceRolling: finalState.isDiceRolling,
        diceRoll: finalState.diceRoll,
        discountMultiplier: finalState.discountMultiplier
      });
      
      if (finalState.diceRoll && finalState.diceUsed && !finalState.isDiceRolling) {
        Logger.log('✅ Dice rolling test passed');
      } else {
        Logger.error('❌ Dice rolling test failed');
      }
    }, 3000);
    
    return afterRoll.isDiceRolling; // Should be true immediately after rolling
  }
  
  /**
   * Test Continue Button Chain
   */
  static testContinueButton() {
    
    const store = useGameStore.getState();
    
    // Initial state
    console.log({
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
      Logger.error('❌ Missing functions:', missingFunctions);
      return false;
    }
    
    Logger.log('✅ All required functions exist');
    
    // Test the exact sequence from UpgradeScreen
    try {
      
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
        console.log({
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
        
        Logger.log('Test results:', { waveIncremented, preparationStarted, screenClosed, killsReset });
        
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
  
  /**
   * Test Upgrade Screen State
   */
  static testUpgradeScreenState() {
    
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
  
  /**
   * Run All Button Tests
   */
  static runAllTests() {
    Logger.log('🔧 Running all button tests...');
    
    const results = {
      upgradeScreenState: this.testUpgradeScreenState(),
      diceRolling: this.testDiceRolling(),
      continueButton: this.testContinueButton(),
    };
    
    Object.entries(results).forEach(([test, passed]) => {
      Logger.log(`${test}: ${passed ? '✅' : '❌'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    Logger.log(`All tests passed: ${allPassed ? '✅' : '❌'}`);
    
    return results;
  }
}

// Make it available globally for testing
declare global {
  interface Window {
    ButtonTestDiagnostic: typeof ButtonTestDiagnostic;
  }
}
window.ButtonTestDiagnostic = ButtonTestDiagnostic;

export default ButtonTestDiagnostic; 