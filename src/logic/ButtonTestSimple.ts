/**
 * 🔧 SIMPLE BUTTON TEST
 * Savaşa devam butonunu test etmek için
 */

import { useGameStore } from '../models/store';

export function testContinueButton() {
  console.log('🧪 Testing Continue Button...');
  
  const store = useGameStore.getState();
  
  console.log('Initial state:', {
    currentWave: store.currentWave,
    isRefreshing: store.isRefreshing,
    isPreparing: store.isPreparing
  });
  
  // Test 1: nextWave function
  try {
    console.log('📈 Testing nextWave...');
    store.nextWave();
    console.log('✅ nextWave worked');
  } catch (error) {
    console.error('❌ nextWave failed:', error);
  }
  
  // Test 2: startPreparation function
  try {
    console.log('⏳ Testing startPreparation...');
    store.startPreparation();
    console.log('✅ startPreparation worked');
  } catch (error) {
    console.error('❌ startPreparation failed:', error);
  }
  
  // Test 3: resetDice function
  try {
    console.log('🎲 Testing resetDice...');
    store.resetDice();
    console.log('✅ resetDice worked');
  } catch (error) {
    console.error('❌ resetDice failed:', error);
  }
  
  // Test 4: setRefreshing function
  try {
    console.log('🔄 Testing setRefreshing...');
    store.setRefreshing(false);
    console.log('✅ setRefreshing worked');
  } catch (error) {
    console.error('❌ setRefreshing failed:', error);
  }
  
  const finalState = useGameStore.getState();
  console.log('Final state:', {
    currentWave: finalState.currentWave,
    isRefreshing: finalState.isRefreshing,
    isPreparing: finalState.isPreparing
  });
}

export function testDiceButton() {
  console.log('🧪 Testing Dice Button...');
  
  const store = useGameStore.getState();
  
  console.log('Initial dice state:', {
    diceUsed: store.diceUsed,
    isDiceRolling: store.isDiceRolling,
    diceRoll: store.diceRoll
  });
  
  try {
    console.log('🎲 Testing rollDice...');
    store.rollDice();
    console.log('✅ rollDice called successfully');
    
    setTimeout(() => {
      const afterState = useGameStore.getState();
      console.log('After dice roll:', {
        diceUsed: afterState.diceUsed,
        isDiceRolling: afterState.isDiceRolling,
        diceRoll: afterState.diceRoll
      });
    }, 2500);
    
  } catch (error) {
    console.error('❌ rollDice failed:', error);
  }
}

// Make available globally for easy testing
(window as any).testContinueButton = testContinueButton;
(window as any).testDiceButton = testDiceButton;

export default { testContinueButton, testDiceButton }; 