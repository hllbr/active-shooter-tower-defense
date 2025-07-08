/**
 * 🔧 SIMPLE BUTTON TEST
 * Savaşa devam butonunu test etmek için
 */

import { useGameStore } from '../models/store';
import { Logger } from '../utils/Logger';

export function testContinueButton() {
  Logger.log('🔧 Testing continue button...');
  
  const store = useGameStore.getState();
  
  console.log({
    currentWave: store.currentWave,
    isRefreshing: store.isRefreshing,
    isPreparing: store.isPreparing
  });
  
  // Test 1: nextWave function
  try {
    store.nextWave();
    Logger.log('✅ nextWave executed');
  } catch (error) {
    Logger.error('❌ nextWave failed:', error);
  }
  
  // Test 2: startPreparation function
  try {
    store.startPreparation();
    Logger.log('✅ startPreparation executed');
  } catch (error) {
    Logger.error('❌ startPreparation failed:', error);
  }
  
  // Test 3: resetDice function
  try {
    store.resetDice();
    Logger.log('✅ resetDice executed');
  } catch (error) {
    Logger.error('❌ resetDice failed:', error);
  }
  
  // Test 4: setRefreshing function
  try {
    store.setRefreshing(false);
    Logger.log('✅ setRefreshing executed');
  } catch (error) {
    Logger.error('❌ setRefreshing failed:', error);
  }
  
  const finalState = useGameStore.getState();
  console.log({
    currentWave: finalState.currentWave,
    isRefreshing: finalState.isRefreshing,
    isPreparing: finalState.isPreparing
  });
}

export function testDiceButton() {
  Logger.log('🔧 Testing dice button...');
  
  const store = useGameStore.getState();
  
  console.log({
    diceUsed: store.diceUsed,
    isDiceRolling: store.isDiceRolling,
    diceRoll: store.diceRoll
  });
  
  try {
    store.rollDice();
    Logger.log('✅ rollDice executed');
    
    setTimeout(() => {
      const afterState = useGameStore.getState();
      console.log({
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