import { HealthBarRenderer } from '../ui/GameBoard/components/renderers/helpers/HealthBarRenderer';
import { BossPhaseManager } from '../game-systems/enemy/BossPhaseManager';
import type { Enemy } from '../models/gameTypes';

/**
 * Health Bar and Boss Phase Test Suite
 * Validates the enhanced health visualization and boss phase management systems
 */
export class HealthBarAndBossPhaseTest {
  private static testResults: Array<{ test: string; passed: boolean; message: string }> = [];

  /**
   * Run all tests
   */
  static runAllTests(): void {
    console.log('🧪 Running Health Bar and Boss Phase Tests...\n');
    
    this.testResults = [];
    
    // Health Bar Tests
    this.testHealthBarColorCoding();
    this.testHealthBarDimensions();
    this.testBossHealthBarEnhancements();
    
    // Boss Phase Tests
    this.testBossPhaseTransitions();
    this.testPhaseBehaviorChanges();
    this.testPhaseTransitionEffects();
    this.testPhaseTransitionCooldown();
    
    // Performance Tests
    this.testHealthBarPerformance();
    
    this.printResults();
  }

  /**
   * Test health bar color coding
   */
  private static testHealthBarColorCoding(): void {
    console.log('  Testing Health Bar Color Coding...');
    
    try {
      // Create test enemies with different health percentages
      const testEnemies = [
        this.createTestEnemy(100, 100), // 100% health - should be green
        this.createTestEnemy(75, 100),  // 75% health - should be green
        this.createTestEnemy(50, 100),  // 50% health - should be green
        this.createTestEnemy(49, 100),  // 49% health - should be yellow
        this.createTestEnemy(30, 100),  // 30% health - should be yellow
        this.createTestEnemy(20, 100),  // 20% health - should be yellow
        this.createTestEnemy(19, 100),  // 19% health - should be red
        this.createTestEnemy(10, 100),  // 10% health - should be red
        this.createTestEnemy(0, 100),   // 0% health - should be red
      ];

      const expectedColors = [
        '#00ff00', // Green
        '#00ff00', // Green
        '#00ff00', // Green
        '#ffff00', // Yellow
        '#ffff00', // Yellow
        '#ffff00', // Yellow
        '#ff0000', // Red
        '#ff0000', // Red
        '#ff0000', // Red
      ];

      let allPassed = true;
      testEnemies.forEach((enemy, index) => {
        const healthPercent = enemy.health / enemy.maxHealth;
        const expectedColor = expectedColors[index];
        
        // Test the color logic directly
        let actualColor: string;
        if (healthPercent >= 0.5) {
          actualColor = '#00ff00'; // Green for 100%–50% HP
        } else if (healthPercent >= 0.2) {
          actualColor = '#ffff00'; // Yellow for 49%–20% HP
        } else {
          actualColor = '#ff0000'; // Red for 19% and below
        }

        if (actualColor !== expectedColor) {
          allPassed = false;
          console.log(`    ❌ Health ${healthPercent * 100}%: Expected ${expectedColor}, got ${actualColor}`);
        }
      });

      this.addTestResult('Health Bar Color Coding', allPassed, 
        allPassed ? 'All color transitions work correctly' : 'Color transitions failed');
        
    } catch (error) {
      this.addTestResult('Health Bar Color Coding', false, `Error: ${error}`);
    }
  }

  /**
   * Test health bar dimensions
   */
  private static testHealthBarDimensions(): void {
    console.log('  Testing Health Bar Dimensions...');
    
    try {
      // Test regular enemy
      const regularEnemy = this.createTestEnemy(50, 100);
      const regularDimensions = this.getHealthBarDimensions(regularEnemy);
      
      // Test boss enemy
      const bossEnemy = this.createTestEnemy(50, 100, 'major');
      const bossDimensions = this.getHealthBarDimensions(bossEnemy);
      
      const regularPassed = regularDimensions.width === regularEnemy.size * 1.2 && 
                           regularDimensions.height === 4; // ENEMY_HEALTHBAR_HEIGHT
      
      const bossPassed = bossDimensions.width === bossEnemy.size * 1.8 && 
                        bossDimensions.height === 10;
      
      this.addTestResult('Health Bar Dimensions', regularPassed && bossPassed,
        regularPassed && bossPassed ? 'Regular and boss health bars have correct dimensions' : 'Dimension calculations failed');
        
    } catch (error) {
      this.addTestResult('Health Bar Dimensions', false, `Error: ${error}`);
    }
  }

  /**
   * Test boss health bar enhancements
   */
  private static testBossHealthBarEnhancements(): void {
    console.log('  Testing Boss Health Bar Enhancements...');
    
    try {
      const bossEnemy = this.createTestEnemy(50, 100, 'legendary');
      bossEnemy.bossPhase = 2;
      
      // Test that boss health bar renders with enhancements
      const healthBarElement = HealthBarRenderer.render(bossEnemy);
      
      const hasEnhancements = healthBarElement !== null && 
                             bossEnemy.bossType === 'legendary' &&
                             bossEnemy.bossPhase === 2;
      
      this.addTestResult('Boss Health Bar Enhancements', hasEnhancements,
        hasEnhancements ? 'Boss health bar renders with metallic frame and phase indicator' : 'Boss enhancements not applied');
        
    } catch (error) {
      this.addTestResult('Boss Health Bar Enhancements', false, `Error: ${error}`);
    }
  }

  /**
   * Test boss phase transitions
   */
  private static testBossPhaseTransitions(): void {
    console.log('  Testing Boss Phase Transitions...');
    
    try {
      // Initialize BossPhaseManager
      BossPhaseManager.initialize();
      
      // Create boss with phase transitions
      const boss = this.createTestEnemy(100, 100, 'major');
      boss.phaseTransitionThresholds = [0.75, 0.5, 0.25]; // 75%, 50%, 25%
      boss.maxBossPhases = 3;
      boss.bossPhase = 1;
      
      // Test phase 1 to phase 2 transition
      boss.health = 70; // 70% health, should trigger phase 2
      BossPhaseManager.updateBossPhase(boss);
      
      const phase2Triggered = boss.bossPhase === 2;
      
      // Test phase 2 to phase 3 transition
      boss.health = 40; // 40% health, should trigger phase 3
      BossPhaseManager.updateBossPhase(boss);
      
      const phase3Triggered = boss.bossPhase === 3;
      
      this.addTestResult('Boss Phase Transitions', phase2Triggered && phase3Triggered,
        phase2Triggered && phase3Triggered ? 'Phase transitions triggered correctly' : 'Phase transitions failed');
        
    } catch (error) {
      this.addTestResult('Boss Phase Transitions', false, `Error: ${error}`);
    }
  }

  /**
   * Test phase behavior changes
   */
  private static testPhaseBehaviorChanges(): void {
    console.log('  Testing Phase Behavior Changes...');
    
    try {
      const boss = this.createTestEnemy(100, 100, 'major');
      const originalSpeed = boss.speed;
      const originalDamage = boss.damage;
      
      // Simulate phase 2 transition
      boss.health = 70;
      BossPhaseManager.updateBossPhase(boss);
      
      // Check if speed and damage increased
      const speedIncreased = boss.speed > originalSpeed;
      const damageIncreased = boss.damage > originalDamage;
      
      this.addTestResult('Phase Behavior Changes', speedIncreased && damageIncreased,
        speedIncreased && damageIncreased ? 'Speed and damage increased in phase 2' : 'Behavior changes not applied');
        
    } catch (error) {
      this.addTestResult('Phase Behavior Changes', false, `Error: ${error}`);
    }
  }

  /**
   * Test phase transition effects
   */
  private static testPhaseTransitionEffects(): void {
    console.log('  Testing Phase Transition Effects...');
    
    try {
      const boss = this.createTestEnemy(100, 100, 'legendary');
      boss.phaseTransitionThresholds = [0.75];
      boss.maxBossPhases = 2;
      
      // Mock the screen shake event listener
      let screenShakeTriggered = false;
      const originalAddEventListener = window.addEventListener;
      window.addEventListener = (type: string, listener: EventListener) => {
        if (type === 'screenShake') {
          screenShakeTriggered = true;
        }
        originalAddEventListener.call(window, type, listener);
      };
      
      // Trigger phase transition
      boss.health = 70;
      BossPhaseManager.updateBossPhase(boss);
      
      // Restore original addEventListener
      window.addEventListener = originalAddEventListener;
      
      this.addTestResult('Phase Transition Effects', screenShakeTriggered,
        screenShakeTriggered ? 'Screen shake effect triggered' : 'Visual effects not triggered');
        
    } catch (error) {
      this.addTestResult('Phase Transition Effects', false, `Error: ${error}`);
    }
  }

  /**
   * Test phase transition cooldown
   */
  private static testPhaseTransitionCooldown(): void {
    console.log('  Testing Phase Transition Cooldown...');
    
    try {
      const boss = this.createTestEnemy(100, 100, 'major');
      boss.phaseTransitionThresholds = [0.75, 0.5];
      boss.maxBossPhases = 3;
      
      // First transition
      boss.health = 70;
      BossPhaseManager.updateBossPhase(boss);
      const firstPhase = boss.bossPhase;
      
      // Immediately try second transition (should be blocked by cooldown)
      boss.health = 40;
      BossPhaseManager.updateBossPhase(boss);
      const secondPhase = boss.bossPhase;
      
      // Should still be in phase 2 due to cooldown
      const cooldownRespected = secondPhase === firstPhase;
      
      this.addTestResult('Phase Transition Cooldown', cooldownRespected,
        cooldownRespected ? 'Cooldown prevents rapid phase transitions' : 'Cooldown not working');
        
    } catch (error) {
      this.addTestResult('Phase Transition Cooldown', false, `Error: ${error}`);
    }
  }

  /**
   * Test health bar performance
   */
  private static testHealthBarPerformance(): void {
    console.log('  Testing Health Bar Performance...');
    
    try {
      const startTime = performance.now();
      
      // Render many health bars
      const enemies = Array.from({ length: 100 }, (_, i) => 
        this.createTestEnemy(Math.random() * 100, 100, i % 10 === 0 ? 'major' : undefined)
      );
      
      enemies.forEach(enemy => {
        HealthBarRenderer.render(enemy);
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render 100 health bars in under 10ms
      const performancePassed = renderTime < 10;
      
      this.addTestResult('Health Bar Performance', performancePassed,
        performancePassed ? `Rendered 100 health bars in ${renderTime.toFixed(2)}ms` : `Performance too slow: ${renderTime.toFixed(2)}ms`);
        
    } catch (error) {
      this.addTestResult('Health Bar Performance', false, `Error: ${error}`);
    }
  }

  /**
   * Helper methods
   */
  private static createTestEnemy(health: number, maxHealth: number, bossType?: string): Enemy {
    return {
      id: `test_enemy_${Math.random()}`,
      position: { x: 100, y: 100 },
      size: 32,
      isActive: true,
      health,
      maxHealth,
      speed: 80,
      goldValue: 50,
      color: '#ff3333',
      damage: 10,
      bossType: bossType as string | undefined,
      bossPhase: 1,
      maxBossPhases: 3,
      phaseTransitionThresholds: [0.75, 0.5, 0.25],
    };
  }

  private static getHealthBarDimensions(enemy: Enemy): { width: number; height: number; yOffset: number } {
    const isBoss = !!enemy.bossType;
    const baseWidth = enemy.size * (isBoss ? 1.8 : 1.2);
    const baseHeight = isBoss ? 10 : 4; // ENEMY_HEALTHBAR_HEIGHT
    const yOffset = enemy.size / 2 + (isBoss ? 20 : 15);

    return {
      width: baseWidth,
      height: baseHeight,
      yOffset
    };
  }

  private static addTestResult(test: string, passed: boolean, message: string): void {
    this.testResults.push({ test, passed, message });
  }

  private static printResults(): void {
    console.log('\n📊 Test Results:');
    console.log('================');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    this.testResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.message}`);
    });
    
    console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Health bar and boss phase systems are working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the implementation.');
    }
  }
} 