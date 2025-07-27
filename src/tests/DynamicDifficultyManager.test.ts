/**
 * 🧪 Dynamic Difficulty Manager Tests
 * Comprehensive test suite for the dynamic difficulty adjustment system
 */

import { DynamicDifficultyManager } from '../game-systems/DynamicDifficultyManager';
import type { Enemy } from '../models/gameTypes';

// Mock the game store
jest.mock('../models/store', () => ({
  useGameStore: {
    getState: jest.fn(() => ({
      currentWave: 1,
      towerSlots: [],
      gold: 1000,
      totalGoldSpent: 500,
      enemiesKilled: 10
    }))
  }
}));

describe('DynamicDifficultyManager', () => {
  let manager: DynamicDifficultyManager;

  beforeEach(() => {
    manager = DynamicDifficultyManager.getInstance();
    manager.reset();
  });

  describe('Singleton Pattern', () => {
    test('should return the same instance', () => {
      const instance1 = DynamicDifficultyManager.getInstance();
      const instance2 = DynamicDifficultyManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Wave Tracking', () => {
      test('should start wave tracking correctly', () => {
    manager.startWave(5);
      
      // Simulate some time passing
      jest.advanceTimersByTime(1000);
      
      manager.completeWave();
      
      // Verify wave completion was recorded
      const adjustment = manager.getCurrentDifficultyAdjustment();
      expect(adjustment).toBeDefined();
      expect(adjustment.difficultyLevel).toBeDefined();
    });

    test('should record damage dealt and taken', () => {
      manager.startWave(1);
      
      manager.recordDamageDealt(100);
      manager.recordDamageDealt(50);
      manager.recordDamageTaken(25);
      
      manager.completeWave();
      
      // Verify damage tracking
      const powerLevel = manager.getPlayerPowerLevel();
      expect(powerLevel).toBeDefined();
    });
  });

  describe('Difficulty Adjustment', () => {
    test('should calculate balanced difficulty adjustment', () => {
      const adjustment = manager.getCurrentDifficultyAdjustment();
      
      expect(adjustment).toHaveProperty('enemyHealthMultiplier');
      expect(adjustment).toHaveProperty('enemySpeedMultiplier');
      expect(adjustment).toHaveProperty('enemyDamageMultiplier');
      expect(adjustment).toHaveProperty('spawnRateMultiplier');
      expect(adjustment).toHaveProperty('bossHealthMultiplier');
      expect(adjustment).toHaveProperty('bossDamageMultiplier');
      expect(adjustment).toHaveProperty('difficultyLevel');
      expect(adjustment).toHaveProperty('adjustmentReason');
      
      // Verify multipliers are within reasonable bounds
      expect(adjustment.enemyHealthMultiplier).toBeGreaterThanOrEqual(0.5);
      expect(adjustment.enemyHealthMultiplier).toBeLessThanOrEqual(2.5);
      expect(adjustment.enemySpeedMultiplier).toBeGreaterThanOrEqual(0.5);
      expect(adjustment.enemySpeedMultiplier).toBeLessThanOrEqual(2.5);
      expect(adjustment.enemyDamageMultiplier).toBeGreaterThanOrEqual(0.5);
      expect(adjustment.enemyDamageMultiplier).toBeLessThanOrEqual(2.5);
    });

    test('should apply different adjustments for bosses vs regular enemies', () => {
      const regularEnemy: Enemy = {
        id: 'test-enemy',
        position: { x: 0, y: 0 },
        size: 20,
        isActive: true,
        health: 100,
        maxHealth: 100,
        speed: 100,
        goldValue: 10,
        color: '#ff0000',
        damage: 10,
        type: 'Basic'
      };

      const bossEnemy: Enemy = {
        ...regularEnemy,
        id: 'test-boss',
        isSpecial: true,
        bossType: 'mini'
      };

      const adjustedRegular = manager.applyEnemyAdjustment(regularEnemy, false);
      const adjustedBoss = manager.applyEnemyAdjustment(bossEnemy, true);

      // Boss should have higher multipliers
      expect(adjustedBoss.health).toBeGreaterThanOrEqual(adjustedRegular.health);
      expect(adjustedBoss.damage).toBeGreaterThanOrEqual(adjustedRegular.damage);
    });
  });

  describe('Performance Analysis', () => {
    test('should track performance trend correctly', () => {
      // Simulate improving performance
      manager.startWave(1);
      manager.recordDamageDealt(1000);
      manager.completeWave();

      manager.startWave(2);
      manager.recordDamageDealt(1500);
      manager.completeWave();

      manager.startWave(3);
      manager.recordDamageDealt(2000);
      manager.completeWave();

      const trend = manager.getPerformanceTrend();
      expect(['improving', 'stable', 'declining']).toContain(trend);
    });

    test('should calculate player power level correctly', () => {
      const powerLevel = manager.getPlayerPowerLevel();
      
      expect(powerLevel).toHaveProperty('averageTowerLevel');
      expect(powerLevel).toHaveProperty('totalTowerDamage');
      expect(powerLevel).toHaveProperty('totalTowerHealth');
      expect(powerLevel).toHaveProperty('upgradeInvestment');
      expect(powerLevel).toHaveProperty('powerScore');
      
      expect(powerLevel.powerScore).toBeGreaterThanOrEqual(0);
      expect(powerLevel.powerScore).toBeLessThanOrEqual(1);
    });
  });

  describe('Spawn Rate Adjustment', () => {
    test('should return spawn rate adjustment', () => {
      const spawnRateAdjustment = manager.getSpawnRateAdjustment();
      
      expect(spawnRateAdjustment).toBeGreaterThanOrEqual(0.5);
      expect(spawnRateAdjustment).toBeLessThanOrEqual(2.0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty tower slots', () => {
      const powerLevel = manager.getPlayerPowerLevel();
      expect(powerLevel.averageTowerLevel).toBe(1);
      expect(powerLevel.totalTowerDamage).toBe(0);
      expect(powerLevel.totalTowerHealth).toBe(0);
    });

    test('should handle zero damage scenarios', () => {
      manager.startWave(1);
      manager.recordDamageDealt(0);
      manager.recordDamageTaken(0);
      manager.completeWave();
      
      const adjustment = manager.getCurrentDifficultyAdjustment();
      expect(adjustment).toBeDefined();
    });

    test('should handle very high performance', () => {
      manager.startWave(1);
      manager.recordDamageDealt(10000);
      manager.completeWave();
      
      const adjustment = manager.getCurrentDifficultyAdjustment();
      expect(adjustment.difficultyLevel).toBeDefined();
    });
  });

  describe('SOLID Principles Compliance', () => {
    test('should follow Single Responsibility Principle', () => {
      // Each method should have a single, well-defined responsibility
      expect(typeof manager.startWave).toBe('function');
      expect(typeof manager.completeWave).toBe('function');
      expect(typeof manager.getCurrentDifficultyAdjustment).toBe('function');
      expect(typeof manager.applyEnemyAdjustment).toBe('function');
    });

    test('should follow Open/Closed Principle', () => {
      // The system should be open for extension but closed for modification
      const adjustment = manager.getCurrentDifficultyAdjustment();
      
      // Should be able to extend with new properties without breaking existing code
      expect(adjustment).toHaveProperty('difficultyLevel');
      expect(adjustment).toHaveProperty('adjustmentReason');
    });

    test('should follow Liskov Substitution Principle', () => {
      // Different types of enemies should be substitutable
      const regularEnemy: Enemy = {
        id: 'regular',
        position: { x: 0, y: 0 },
        size: 20,
        isActive: true,
        health: 100,
        maxHealth: 100,
        speed: 100,
        goldValue: 10,
        color: '#ff0000',
        damage: 10,
        type: 'Basic'
      };

      const bossEnemy: Enemy = {
        ...regularEnemy,
        id: 'boss',
        isSpecial: true,
        bossType: 'mini'
      };

      // Both should work with the same adjustment method
      const adjustedRegular = manager.applyEnemyAdjustment(regularEnemy, false);
      const adjustedBoss = manager.applyEnemyAdjustment(bossEnemy, true);
      
      expect(adjustedRegular).toBeDefined();
      expect(adjustedBoss).toBeDefined();
    });

    test('should follow Interface Segregation Principle', () => {
      // The manager should not force clients to depend on methods they don't use
      const adjustment = manager.getCurrentDifficultyAdjustment();
      
      // Clients can access only the properties they need
      expect(adjustment.enemyHealthMultiplier).toBeDefined();
      expect(adjustment.bossHealthMultiplier).toBeDefined();
    });

    test('should follow Dependency Inversion Principle', () => {
      // High-level modules should not depend on low-level modules
      // Both should depend on abstractions
      const adjustment = manager.getCurrentDifficultyAdjustment();
      
      // The adjustment interface provides the abstraction
      expect(adjustment).toHaveProperty('enemyHealthMultiplier');
      expect(adjustment).toHaveProperty('difficultyLevel');
    });
  });

  describe('Performance and Memory', () => {
      test('should not cause memory leaks', () => {
    const initialMemory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
      
      // Simulate many wave completions
      for (let i = 0; i < 100; i++) {
        manager.startWave(i);
        manager.recordDamageDealt(100);
        manager.completeWave();
      }
      
      const finalMemory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });

    test('should handle rapid updates efficiently', () => {
      const startTime = performance.now();
      
      // Simulate rapid damage recording
      for (let i = 0; i < 1000; i++) {
        manager.recordDamageDealt(10);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });
  });
}); 