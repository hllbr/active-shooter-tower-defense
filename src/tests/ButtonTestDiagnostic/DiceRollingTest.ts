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
    
    const store = useGameStore.getState();
    
    // Initial state check
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
      diceUsed: afterRoll.diceUsed,
      isDiceRolling: afterRoll.isDiceRolling,
      diceRoll: afterRoll.diceRoll,
      discountMultiplier: afterRoll.discountMultiplier
    });
    
    // Wait for animation to complete
    setTimeout(() => {
      const finalState = useGameStore.getState();
        diceUsed: finalState.diceUsed,
        isDiceRolling: finalState.isDiceRolling,
        diceRoll: finalState.diceRoll,
        discountMultiplier: finalState.discountMultiplier
      });
      
      if (finalState.diceRoll && finalState.diceUsed && !finalState.isDiceRolling) {
      } else {
      }
    }, 3000);
    
    return afterRoll.isDiceRolling; // Should be true immediately after rolling
  }
} 