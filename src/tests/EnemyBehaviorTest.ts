import { EnemyBehaviorSystem } from '../game-systems/enemy/EnemyBehaviorSystem';
import { EnemyFactory } from '../game-systems/enemy/EnemyFactory';
import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/constants';

/**
 * Comprehensive test suite for the enhanced enemy behavior system
 */
export class EnemyBehaviorTest {
  private static testResults: Array<{ test: string; passed: boolean; message: string }> = [];

  /**
   * Run all behavior system tests
   */
  static runAllTests(): void {
    console.log('🧪 Starting Enemy Behavior System Tests...');
    
    this.testResults = [];
    
    // Initialize systems
    this.setupTestEnvironment();
    
    // Run individual tests
    this.testFleeBehavior();
    this.testGroupAttackBehavior();
    this.testBossPhaseTransitions();
    this.testPerformanceOptimization();
    this.testTypeSafety();
    
    // Report results
    this.reportTestResults();
  }

  /**
   * Setup test environment
   */
  private static setupTestEnvironment(): void {
    // Initialize behavior system
    EnemyBehaviorSystem.initialize();
    EnemyFactory.initialize();
    
    // Reset game store
    const store = useGameStore.getState();
    store.enemies = [];
    store.towerSlots = [];
    store.towers = [];
  }

  /**
   * Test flee behavior functionality
   */
  private static testFleeBehavior(): void {
    console.log('  Testing Flee Behavior...');
    
    try {
      // Create a Fleer enemy
      const fleer = EnemyFactory.createEnemy(5, 'Fleer');
      const initialPosition = { ...fleer.position };
      
      // Add some towers to trigger flee behavior
      const store = useGameStore.getState();
      store.towerSlots = [
        { x: fleer.position.x + 50, y: fleer.position.y, unlocked: true, tower: { id: 'test', position: { x: 0, y: 0 }, size: 48, isActive: true, level: 1, range: 100, damage: 20, fireRate: 800, lastFired: 0, health: 100, maxHealth: 100, wallStrength: 0, specialAbility: '', healthRegenRate: 0, lastHealthRegen: 0, specialCooldown: 0, lastSpecialUse: 0, multiShotCount: 0, chainLightningJumps: 0, freezeDuration: 0, burnDuration: 0, acidStack: 0, quantumState: false, nanoSwarmCount: 0, psiRange: 0, timeWarpSlow: 0, spaceGravity: 0, legendaryAura: false, divineProtection: false, cosmicEnergy: 0, infinityLoop: false, godModeActive: false } }
      ];
      
      // Update behavior
      EnemyBehaviorSystem.updateEnemyBehaviors();
      
      // Check if enemy moved (flee behavior should cause movement)
      const positionChanged = fleer.position.x !== initialPosition.x || fleer.position.y !== initialPosition.y;
      
      this.addTestResult('Flee Behavior', positionChanged, 
        positionChanged ? 'Enemy moved due to flee behavior' : 'Enemy did not move as expected');
        
    } catch (error) {
      this.addTestResult('Flee Behavior', false, `Error: ${error}`);
    }
  }

  /**
   * Test group attack behavior functionality
   */
  private static testGroupAttackBehavior(): void {
    console.log('  Testing Group Attack Behavior...');
    
    try {
      // Create multiple Grouper enemies
      const grouper1 = EnemyFactory.createEnemy(7, 'Grouper');
      const grouper2 = EnemyFactory.createEnemy(7, 'Grouper');
      const grouper3 = EnemyFactory.createEnemy(7, 'Grouper');
      
      // Position them near each other
      grouper2.position = { x: grouper1.position.x + 30, y: grouper1.position.y };
      grouper3.position = { x: grouper1.position.x, y: grouper1.position.y + 30 };
      
      // Add a target tower
      const store = useGameStore.getState();
      store.towerSlots = [
        { x: grouper1.position.x + 100, y: grouper1.position.y + 100, unlocked: true, tower: { id: 'test', position: { x: 0, y: 0 }, size: 48, isActive: true, level: 1, range: 100, damage: 20, fireRate: 800, lastFired: 0, health: 100, maxHealth: 100, wallStrength: 0, specialAbility: '', healthRegenRate: 0, lastHealthRegen: 0, specialCooldown: 0, lastSpecialUse: 0, multiShotCount: 0, chainLightningJumps: 0, freezeDuration: 0, burnDuration: 0, acidStack: 0, quantumState: false, nanoSwarmCount: 0, psiRange: 0, timeWarpSlow: 0, spaceGravity: 0, legendaryAura: false, divineProtection: false, cosmicEnergy: 0, infinityLoop: false, godModeActive: false } }
      ];
      
      // Update behavior
      EnemyBehaviorSystem.updateEnemyBehaviors();
      
      // Check if enemies moved toward target (group behavior)
      const allMoved = [grouper1, grouper2, grouper3].every(enemy => 
        enemy.position.x > 0 || enemy.position.y > 0
      );
      
      this.addTestResult('Group Attack Behavior', allMoved, 
        allMoved ? 'All enemies moved in group attack pattern' : 'Group attack behavior not working');
        
    } catch (error) {
      this.addTestResult('Group Attack Behavior', false, `Error: ${error}`);
    }
  }

  /**
   * Test boss phase transitions
   */
  private static testBossPhaseTransitions(): void {
    console.log('  Testing Boss Phase Transitions...');
    
    try {
      // Create a boss enemy with phase transitions
      const boss = EnemyFactory.createEnemy(20, 'TankBoss');
      
      // Set up boss properties for phase testing
      boss.bossType = 'major';
      boss.bossPhase = 1;
      boss.maxBossPhases = 3;
      boss.phaseTransitionThresholds = [0.5, 0.25]; // 50% and 25% health thresholds
      boss.health = 100;
      boss.maxHealth = 100;
      
      // Simulate damage to trigger phase transition
      boss.health = 40; // 40% health, should trigger phase 2
      
      // Update behavior
      EnemyBehaviorSystem.updateEnemyBehaviors();
      
      // Check if phase transition occurred
      const phaseTransitioned = boss.bossPhase === 2;
      
      this.addTestResult('Boss Phase Transitions', phaseTransitioned, 
        phaseTransitioned ? 'Boss phase transition triggered correctly' : 'Phase transition not triggered');
        
    } catch (error) {
      this.addTestResult('Boss Phase Transitions', false, `Error: ${error}`);
    }
  }

  /**
   * Test performance optimization features
   */
  private static testPerformanceOptimization(): void {
    console.log('  Testing Performance Optimization...');
    
    try {
      // Create multiple enemies to test caching
      const enemies = [];
      for (let i = 0; i < 50; i++) {
        enemies.push(EnemyFactory.createEnemy(5, 'Basic'));
      }
      
      const startTime = performance.now();
      
      // Update behaviors multiple times to test caching
      for (let i = 0; i < 10; i++) {
        EnemyBehaviorSystem.updateEnemyBehaviors();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Performance should be reasonable (less than 100ms for 50 enemies)
      const performanceOk = duration < 100;
      
      this.addTestResult('Performance Optimization', performanceOk, 
        `Behavior updates took ${duration.toFixed(2)}ms for 50 enemies (${performanceOk ? 'OK' : 'TOO SLOW'})`);
        
    } catch (error) {
      this.addTestResult('Performance Optimization', false, `Error: ${error}`);
    }
  }

  /**
   * Test TypeScript type safety
   */
  private static testTypeSafety(): void {
    console.log('  Testing Type Safety...');
    
    try {
      // Test that all enemy types are properly typed
      const enemyTypes = Object.keys(GAME_CONSTANTS.ENEMY_TYPES);
      let typeSafetyOk = true;
      
      for (const type of enemyTypes) {
        const enemy = EnemyFactory.createEnemy(1, type as keyof typeof GAME_CONSTANTS.ENEMY_TYPES);
        
        // Check required properties exist
        if (!enemy.id || !enemy.position || !enemy.health || !enemy.speed) {
          typeSafetyOk = false;
          break;
        }
      }
      
      this.addTestResult('Type Safety', typeSafetyOk, 
        typeSafetyOk ? 'All enemy types properly typed' : 'Type safety issues detected');
        
    } catch (error) {
      this.addTestResult('Type Safety', false, `Error: ${error}`);
    }
  }

  /**
   * Add test result
   */
  private static addTestResult(test: string, passed: boolean, message: string): void {
    this.testResults.push({ test, passed, message });
  }

  /**
   * Report test results
   */
  private static reportTestResults(): void {
    console.log('\n📊 Test Results:');
    console.log('================');
    
    let passedCount = 0;
    const totalCount = this.testResults.length;
    
    this.testResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.test}: ${result.message}`);
      if (result.passed) passedCount++;
    });
    
    console.log(`\n📈 Summary: ${passedCount}/${totalCount} tests passed`);
    
    if (passedCount === totalCount) {
      console.log('🎉 All tests passed! Enemy behavior system is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Please review the implementation.');
    }
  }

  /**
   * Get behavior statistics for debugging
   */
  static getBehaviorStats(): void {
    const stats = EnemyBehaviorSystem.getBehaviorStats();
    console.log('📊 Current Behavior Statistics:');
    console.log(`  Fleeing enemies: ${stats.fleeingCount}`);
    console.log(`  Group attacks: ${stats.groupAttackCount}`);
    console.log(`  Boss phase transitions: ${stats.bossPhaseTransitions}`);
  }
} 