import { towerInteractionManager } from '../game-systems/tower-system/TowerInteractionManager';
import { useGameStore } from '../models/store';

/**
 * Tower Interaction System Test Suite
 * 
 * Tests the new hover vs click behavior implementation:
 * 1. Hover shows only tooltip/info
 * 2. Click shows upgrade/repair controls
 * 3. Click elsewhere deselects
 * 4. No flickering or multiple selections
 */
export class TowerInteractionTest {
  private testResults: Array<{ test: string; passed: boolean; message: string }> = [];

  /**
   * Run all tower interaction tests
   */
  public runAllTests(): void {
    console.log('🧪 Running Tower Interaction Tests...');
    
    this.testHoverBehavior();
    this.testClickBehavior();
    this.testDeselectionBehavior();
    this.testMultipleTowerSelection();
    this.testInteractionManagerState();
    
    this.printResults();
  }

  /**
   * Test 1: Hover behavior - should only show tooltip, not controls
   */
  private testHoverBehavior(): void {
    const testName = 'Hover Behavior';
    
    try {
      // Simulate hover on slot 0
      towerInteractionManager.handleTowerHoverStart(0);
      
      // Check hover state
      const isHovered = towerInteractionManager.isSlotHovered(0);
      const isSelected = towerInteractionManager.isSlotSelected(0);
      
      if (isHovered && !isSelected) {
        this.testResults.push({ test: testName, passed: true, message: 'Hover shows tooltip only' });
      } else {
        this.testResults.push({ 
          test: testName, 
          passed: false, 
          message: `Expected hover=true, selected=false, got hover=${isHovered}, selected=${isSelected}` 
        });
      }
      
      // Clean up
      towerInteractionManager.handleTowerHoverEnd(0);
    } catch (error) {
      this.testResults.push({ test: testName, passed: false, message: `Error: ${error}` });
    }
  }

  /**
   * Test 2: Click behavior - should show controls and select tower
   */
  private testClickBehavior(): void {
    const testName = 'Click Behavior';
    
    try {
      // Simulate click on slot 1
      towerInteractionManager.handleTowerClick(1);
      
      // Check selection state
      const isSelected = towerInteractionManager.isSlotSelected(1);
      const gameStoreSelected = useGameStore.getState().selectedSlot;
      
      if (isSelected && gameStoreSelected === 1) {
        this.testResults.push({ test: testName, passed: true, message: 'Click selects tower and shows controls' });
      } else {
        this.testResults.push({ 
          test: testName, 
          passed: false, 
          message: `Expected selected=true, store=1, got selected=${isSelected}, store=${gameStoreSelected}` 
        });
      }
      
      // Clean up
      towerInteractionManager.handleTowerClick(1); // Deselect
    } catch (error) {
      this.testResults.push({ test: testName, passed: false, message: `Error: ${error}` });
    }
  }

  /**
   * Test 3: Deselection behavior - should deselect when clicking elsewhere
   */
  private testDeselectionBehavior(): void {
    const testName = 'Deselection Behavior';
    
    try {
      // First select a tower
      towerInteractionManager.handleTowerClick(2);
      
      // Simulate clicking elsewhere (global click)
      const mockEvent = new MouseEvent('click', { bubbles: true });
      document.dispatchEvent(mockEvent);
      
      // Small delay to allow event processing
      setTimeout(() => {
        const isSelected = towerInteractionManager.isSlotSelected(2);
        const gameStoreSelected = useGameStore.getState().selectedSlot;
        
        if (!isSelected && gameStoreSelected === null) {
          this.testResults.push({ test: testName, passed: true, message: 'Click elsewhere deselects tower' });
        } else {
          this.testResults.push({ 
            test: testName, 
            passed: false, 
            message: `Expected selected=false, store=null, got selected=${isSelected}, store=${gameStoreSelected}` 
          });
        }
      }, 10);
      
    } catch (error) {
      this.testResults.push({ test: testName, passed: false, message: `Error: ${error}` });
    }
  }

  /**
   * Test 4: Multiple tower selection - should only allow one selection at a time
   */
  private testMultipleTowerSelection(): void {
    const testName = 'Multiple Tower Selection';
    
    try {
      // Select first tower
      towerInteractionManager.handleTowerClick(3);
      
      // Select second tower
      towerInteractionManager.handleTowerClick(4);
      
      // Check that only the second tower is selected
      const isFirstSelected = towerInteractionManager.isSlotSelected(3);
      const isSecondSelected = towerInteractionManager.isSlotSelected(4);
      const gameStoreSelected = useGameStore.getState().selectedSlot;
      
      if (!isFirstSelected && isSecondSelected && gameStoreSelected === 4) {
        this.testResults.push({ test: testName, passed: true, message: 'Only one tower can be selected at a time' });
      } else {
        this.testResults.push({ 
          test: testName, 
          passed: false, 
          message: `Expected first=false, second=true, store=4, got first=${isFirstSelected}, second=${isSecondSelected}, store=${gameStoreSelected}` 
        });
      }
      
      // Clean up
      towerInteractionManager.handleTowerClick(4); // Deselect
    } catch (error) {
      this.testResults.push({ test: testName, passed: false, message: `Error: ${error}` });
    }
  }

  /**
   * Test 5: Interaction manager state consistency
   */
  private testInteractionManagerState(): void {
    const testName = 'Interaction Manager State';
    
    try {
      // Test initial state
      towerInteractionManager.clearAllStates();
      
      const isHovered = towerInteractionManager.isSlotHovered(0);
      const isSelected = towerInteractionManager.isSlotSelected(0);
      const gameStoreSelected = useGameStore.getState().selectedSlot;
      
      if (!isHovered && !isSelected && gameStoreSelected === null) {
        this.testResults.push({ test: testName, passed: true, message: 'Interaction manager state is consistent' });
      } else {
        this.testResults.push({ 
          test: testName, 
          passed: false, 
          message: `Expected all false/null, got hover=${isHovered}, selected=${isSelected}, store=${gameStoreSelected}` 
        });
      }
    } catch (error) {
      this.testResults.push({ test: testName, passed: false, message: `Error: ${error}` });
    }
  }

  /**
   * Print test results
   */
  private printResults(): void {
    console.log('\n📊 Tower Interaction Test Results:');
    console.log('=====================================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.message}`);
    });
    
    console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tower interaction tests passed! The hover vs click behavior is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the interaction system implementation.');
    }
  }

  /**
   * Cleanup method
   */
  public cleanup(): void {
    towerInteractionManager.clearAllStates();
    useGameStore.getState().selectSlot(null);
  }
}

// Export test instance
export const towerInteractionTest = new TowerInteractionTest(); 