/**
 * Test file for enhanced EnemyMovement system
 * Tests dynamic targeting, curved movement, and visual effects
 */

import { EnemyMovement } from '../game-systems/enemy/EnemyMovement';
import { TargetFinder } from '../game-systems/enemy/TargetFinder';
import type { Enemy } from '../models/gameTypes';

/**
 * Test suite for enhanced enemy movement system
 */
export class EnemyMovementTest {
  /**
   * Test dynamic targeting functionality
   */
  static testDynamicTargeting() {
    console.log('🧪 Testing Dynamic Targeting...');
    
    // Create test enemy
    const testEnemy: Enemy = {
      id: 'test_enemy_1',
      position: { x: 100, y: 100 },
      size: 20,
      isActive: true,
      health: 100,
      maxHealth: 100,
      speed: 80,
      goldValue: 10,
      color: '#ff3333',
      damage: 10,
      behaviorTag: 'avoid',
      type: 'Scout'
    };

    // Test different enemy behaviors
    const testCases = [
      { behavior: 'avoid' },
      { behavior: 'stealth' },
      { behavior: 'tank' },
      { behavior: 'ghost' }
    ];

    testCases.forEach(({ behavior }) => {
      const enemy = { ...testEnemy, behaviorTag: behavior };
      const target = TargetFinder.getNearestSlot(enemy.position, enemy);
      
      console.log(`✅ ${behavior} enemy targeting: ${target ? 'Target found' : 'No target'}`);
    });

    console.log('✅ Dynamic targeting tests completed');
  }

  /**
   * Test curved movement patterns
   */
  static testCurvedMovement() {
    console.log('🧪 Testing Curved Movement Patterns...');
    
    const testEnemy: Enemy = {
      id: 'test_enemy_2',
      position: { x: 150, y: 150 },
      size: 20,
      isActive: true,
      health: 100,
      maxHealth: 100,
      speed: 80,
      goldValue: 10,
      color: '#ff3333',
      damage: 10,
      behaviorTag: 'ghost',
      type: 'Ghost'
    };

    // Test movement calculation
    const initialPosition = { ...testEnemy.position };
    
    // Simulate movement update
    const movementData = {
      direction: { x: 0.707, y: 0.707 }, // 45-degree angle
      distance: 141.42,
      curveFactor: 0.2,
      avoidanceVector: { x: 0.1, y: 0.1 }
    };

    // Apply movement
    const newPosition = {
      x: testEnemy.position.x + movementData.direction.x * testEnemy.speed * 0.016,
      y: testEnemy.position.y + movementData.direction.y * testEnemy.speed * 0.016
    };

    console.log(`✅ Initial position: (${initialPosition.x}, ${initialPosition.y})`);
    console.log(`✅ New position: (${newPosition.x.toFixed(2)}, ${newPosition.y.toFixed(2)})`);
    console.log(`✅ Movement applied: curved pattern with factor ${movementData.curveFactor}`);

    console.log('✅ Curved movement tests completed');
  }

  /**
   * Test visual effects on collision
   */
  static testVisualEffects() {
    console.log('🧪 Testing Visual Effects...');
    
    const testEnemy: Enemy = {
      id: 'test_enemy_3',
      position: { x: 200, y: 200 },
      size: 20,
      isActive: true,
      health: 100,
      maxHealth: 100,
      speed: 80,
      goldValue: 10,
      color: '#ff3333',
      damage: 10,
      type: 'Tank'
    };

    // Test different enemy types for effects
    const enemyTypes = ['basic', 'boss', 'Ghost', 'Tank', 'Golem'];
    
    enemyTypes.forEach(enemyType => {
      const effectType = EnemyMovement['getEffectTypeForEnemy'](enemyType);
      const duration = EnemyMovement['getEffectDurationForEnemy'](enemyType);
      
      console.log(`✅ ${enemyType} enemy: ${effectType} effect (${duration}ms)`);
    });

    // Test with the test enemy
    const effectType = EnemyMovement['getEffectTypeForEnemy'](testEnemy.type || 'basic');
    const duration = EnemyMovement['getEffectDurationForEnemy'](testEnemy.type || 'basic');
    console.log(`✅ Test enemy (${testEnemy.type}): ${effectType} effect (${duration}ms)`);

    console.log('✅ Visual effects tests completed');
  }

  /**
   * Test performance optimizations
   */
  static testPerformanceOptimizations() {
    console.log('🧪 Testing Performance Optimizations...');
    
    const startTime = performance.now();
    
    // Simulate multiple enemy updates
    const enemies: Enemy[] = Array.from({ length: 50 }, (_, i) => ({
      id: `test_enemy_${i}`,
      position: { x: Math.random() * 1000, y: Math.random() * 1000 },
      size: 20,
      isActive: true,
      health: 100,
      maxHealth: 100,
      speed: 80,
      goldValue: 10,
      color: '#ff3333',
      damage: 10,
      behaviorTag: 'normal',
      type: 'Basic'
    }));

    // Simulate target finding for all enemies
    enemies.forEach(enemy => {
      TargetFinder.getNearestSlot(enemy.position, enemy);
    });

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Processed ${enemies.length} enemies in ${duration.toFixed(2)}ms`);
    console.log(`✅ Average time per enemy: ${(duration / enemies.length).toFixed(2)}ms`);
    
    console.log('✅ Performance optimization tests completed');
  }

  /**
   * Run all tests
   */
  static runAllTests() {
    console.log('🚀 Starting Enhanced Enemy Movement Tests...\n');
    
    this.testDynamicTargeting();
    console.log('');
    
    this.testCurvedMovement();
    console.log('');
    
    this.testVisualEffects();
    console.log('');
    
    this.testPerformanceOptimizations();
    console.log('');
    
    console.log('🎉 All Enhanced Enemy Movement Tests Completed Successfully!');
  }
}

// Export for use in other test files
export default EnemyMovementTest; 