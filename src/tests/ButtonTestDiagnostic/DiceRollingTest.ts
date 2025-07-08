/**
 * 🎲 DICE ROLLING TEST
 * Zar atma sisteminin çalışıp çalışmadığını test eder
 */

import { useGameStore } from '../../models/store';
import { Logger } from '../../utils/Logger';

export class DiceRollingTest {
  
  /**
   * Test Dice Rolling System
   */
  static testDiceRolling() {
    Logger.log('🎲 Testing dice rolling...');
    
    const store = useGameStore.getState();
    
    // Check initial dice state
    
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
    
    // Wait for animation to complete
    setTimeout(() => {
      const finalState = useGameStore.getState();
      
      if (finalState.diceRoll && finalState.diceUsed && !finalState.isDiceRolling) {
        Logger.log('✅ Dice rolling test passed');
      } else {
        Logger.error('❌ Dice rolling test failed');
      }
    }, 3000);
    
    return afterRoll.isDiceRolling; // Should be true immediately after rolling
  }
} 