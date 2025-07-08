/**
 * 🔧 SIMPLE BUTTON TEST
 * Savaşa devam butonunu test etmek için
 */

import { useGameStore } from '../models/store';
import { Logger } from '../utils/Logger';

export function testContinueButton() {
  
  const store = useGameStore.getState();
  
    currentWave: store.currentWave,
    isRefreshing: store.isRefreshing,
    isPreparing: store.isPreparing
  });
  
  // Test 1: nextWave function
  try {
    store.nextWave();
  } catch (error) {
    Logger.error('❌ nextWave failed:', error);
  }
  
  // Test 2: startPreparation function
  try {
    store.startPreparation();
  } catch (error) {
    Logger.error('❌ startPreparation failed:', error);
  }
  
  // Test 3: resetDice function
  try {
    store.resetDice();
  } catch (error) {
    Logger.error('❌ resetDice failed:', error);
  }
  
  // Test 4: setRefreshing function
  try {
    store.setRefreshing(false);
  } catch (error) {
    Logger.error('❌ setRefreshing failed:', error);
  }
  
  const finalState = useGameStore.getState();
    currentWave: finalState.currentWave,
    isRefreshing: finalState.isRefreshing,
    isPreparing: finalState.isPreparing
  });
}

export function testDiceButton() {
  
  const store = useGameStore.getState();
  
    diceUsed: store.diceUsed,
    isDiceRolling: store.isDiceRolling,
    diceRoll: store.diceRoll
  });
  
  try {
    store.rollDice();
    
    setTimeout(() => {
      const afterState = useGameStore.getState();
        diceUsed: afterState.diceUsed,
        isDiceRolling: afterState.isDiceRolling,
        diceRoll: afterState.diceRoll
      });
    }, 2500);
    
  } catch (error) {
    Logger.error('❌ rollDice failed:', error);
  }
}

// Make available globally for easy testing
declare global {
  interface Window {
    testContinueButton: typeof testContinueButton;
    testDiceButton: typeof testDiceButton;
  }
}
window.testContinueButton = testContinueButton;
window.testDiceButton = testDiceButton;

export default { testContinueButton, testDiceButton }; 