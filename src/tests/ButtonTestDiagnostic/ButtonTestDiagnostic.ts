/**
 * 🔧 BUTTON TEST DIAGNOSTIC TOOL
 * Zar atma ve devam butonlarının çalışıp çalışmadığını test eder
 */

import { DiceRollingTest } from './DiceRollingTest';
import { ContinueButtonTest } from './ContinueButtonTest';
import { UpgradeScreenTest } from './UpgradeScreenTest';

export class ButtonTestDiagnostic {
  
  /**
   * Test Dice Rolling System
   */
  static testDiceRolling() {
    return DiceRollingTest.testDiceRolling();
  }
  
  /**
   * Test Continue Button Chain
   */
  static testContinueButton() {
    return ContinueButtonTest.testContinueButton();
  }
  
  /**
   * Test Upgrade Screen State
   */
  static testUpgradeScreenState() {
    return UpgradeScreenTest.testUpgradeScreenState();
  }
  
  /**
   * Run All Button Tests
   */
  static runAllTests() {
    
    const results = {
      upgradeScreenState: this.testUpgradeScreenState(),
      diceRolling: this.testDiceRolling(),
      continueButton: this.testContinueButton(),
    };
    
    Object.entries(results).forEach(([_test, _passed]) => {
      // Test result processing can be added here
    });
    
    const _allPassed = Object.values(results).every(result => result);
    
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