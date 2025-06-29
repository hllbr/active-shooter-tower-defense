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