/**
 * 🎲 DICE ROLLING TEST
 * Zar atma sisteminin çalışıp çalışmadığını test eder
 */

import { useGameStore } from '../../models/store';

export class DiceRollingTest {
  
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
} 