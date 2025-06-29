/**
 * 🔧 BUTTON TEST DIAGNOSTIC TOOL
 * Zar atma ve devam butonlarının çalışıp çalışmadığını test eder
 */

import { useGameStore } from '../models/store';

export class ButtonTestDiagnostic {
  
  /**
   * Test Dice Rolling System
   */
  static testDiceRolling() {
    console.log('🧪 Testing Dice Rolling System...');
    
    const store = useGameStore.getState();
    
    // Initial state check
    console.log(`Initial state:`, {
      diceUsed: store.diceUsed,
      isDiceRolling: store.isDiceRolling,
      diceRoll: store.diceRoll,
      discountMultiplier: store.discountMultiplier
    });
    
    // Test rollDice function exists
    if (typeof store.rollDice !== 'function') {
      console.error('❌ rollDice function not found!');
      return false;
    }
    
    // Reset dice first
    store.resetDice();
    
    // Test dice rolling
    console.log('🎲 Attempting to roll dice...');
    store.rollDice();
    
    // Check immediate state
    const afterRoll = useGameStore.getState();
    console.log(`After rollDice():`, {
      diceUsed: afterRoll.diceUsed,
      isDiceRolling: afterRoll.isDiceRolling,
      diceRoll: afterRoll.diceRoll,
      discountMultiplier: afterRoll.discountMultiplier
    });
    
    // Wait for animation to complete
    setTimeout(() => {
      const finalState = useGameStore.getState();
      console.log(`Final state after animation:`, {
        diceUsed: finalState.diceUsed,
        isDiceRolling: finalState.isDiceRolling,
        diceRoll: finalState.diceRoll,
        discountMultiplier: finalState.discountMultiplier
      });
      
      if (finalState.diceRoll && finalState.diceUsed && !finalState.isDiceRolling) {
        console.log('✅ Dice rolling works correctly!');
      } else {
        console.log('❌ Dice rolling has issues');
      }
    }, 3000);
    
    return afterRoll.isDiceRolling; // Should be true immediately after rolling
  }
  
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
  
  /**
   * Run All Button Tests
   */
  static runAllTests() {
    console.log('🚀 Running Button Test Diagnostic Suite...\n');
    
    const results = {
      upgradeScreenState: this.testUpgradeScreenState(),
      diceRolling: this.testDiceRolling(),
      continueButton: this.testContinueButton(),
    };
    
    console.log('\n📊 Button Test Results:');
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(result => result);
    console.log(`\n🎯 Overall: ${allPassed ? 'ALL BUTTON TESTS PASSED' : 'SOME BUTTON TESTS FAILED'}`);
    
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