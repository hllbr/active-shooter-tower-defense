/**
 * 🧪 Memory Leak Tester - Comprehensive memory leak detection and testing
 */

import { GAME_CONSTANTS } from '../../utils/constants';
import { bulletPool } from '../bullet-system/BulletPool';
import { effectPool } from '../Effects';
import { performMemoryCleanup } from '../Effects';
import { MemoryTester } from './MemoryTester';
import type { MemoryTestResult } from './types';

export class MemoryLeakTester {
  private tester: MemoryTester;
  
  constructor() {
    this.tester = new MemoryTester();
  }
  
  /**
   * Test for memory leaks in bullet system
   */
  async testBulletMemoryLeaks(iterations: number = 1000): Promise<MemoryTestResult> {
    const startTime = performance.now();
    
    // Initial memory measurement
    this.tester.forceGC();
    await this.tester.waitForGC();
    const initialSample = this.tester.sample();
    const initialMemory = initialSample?.heapUsed || 0;
    
    // Simulate bullet creation and cleanup
    for (let i = 0; i < iterations; i++) {
      // Create bullets
      const bullets = [];
      for (let j = 0; j < 10; j++) {
        const bullet = bulletPool.createBullet(
          { x: Math.random() * 800, y: Math.random() * 600 },
          { x: Math.random(), y: Math.random() },
          10,
          100,
          '#ffffff',
          0
        );
        bullets.push(bullet);
      }
      
      // Simulate bullet lifecycle
      await new Promise(resolve => setTimeout(resolve, 1));
      
      // Clean up bullets
      bullets.forEach(bullet => {
        bulletPool.release(bullet);
      });
      
      // Sample memory periodically
      if (i % 100 === 0) {
        this.tester.sample();
      }
    }
    
    // Force cleanup and garbage collection
    performMemoryCleanup();
    this.tester.forceGC();
    await this.tester.waitForGC();
    
    // Final memory measurement
    const finalSample = this.tester.sample();
    const finalMemory = finalSample?.heapUsed || 0;
    
    const duration = performance.now() - startTime;
    const memoryGrowth = finalMemory - initialMemory;
    const memoryGrowthPercent = initialMemory > 0 ? (memoryGrowth / initialMemory) * 100 : 0;
    
    // Test passes if memory growth is less than 10%
    const passed = Math.abs(memoryGrowthPercent) < 10;
    
    return {
      passed,
      initialMemory,
      finalMemory,
      memoryGrowth,
      memoryGrowthPercent,
      iterations,
      duration,
      details: {
        effectPoolStats: effectPool.getStats(),
        bulletPoolStats: bulletPool.getStats(),
        gcAvailable: this.tester.forceGC(),
        memoryBeforeGC: initialMemory,
        memoryAfterGC: finalMemory
      }
    };
  }
  
  /**
   * Test for memory leaks in effect system
   */
  async testEffectMemoryLeaks(iterations: number = 1000): Promise<MemoryTestResult> {
    const startTime = performance.now();
    
    // Initial memory measurement
    this.tester.forceGC();
    await this.tester.waitForGC();
    const initialSample = this.tester.sample();
    const initialMemory = initialSample?.heapUsed || 0;
    
    // Simulate effect creation and cleanup
    for (let i = 0; i < iterations; i++) {
      // Create effects
      const effects = [];
      for (let j = 0; j < 5; j++) {
        const effect = effectPool.createEffect(
          'explosion',
          { x: Math.random() * 800, y: Math.random() * 600 },
          1000
        );
        effects.push(effect);
      }
      
      // Simulate effect lifecycle
      await new Promise(resolve => setTimeout(resolve, 1));
      
      // Clean up effects
      effects.forEach(effect => {
        effectPool.release(effect);
      });
      
      // Sample memory periodically
      if (i % 100 === 0) {
        this.tester.sample();
      }
    }
    
    // Force cleanup and garbage collection
    performMemoryCleanup();
    this.tester.forceGC();
    await this.tester.waitForGC();
    
    // Final memory measurement
    const finalSample = this.tester.sample();
    const finalMemory = finalSample?.heapUsed || 0;
    
    const duration = performance.now() - startTime;
    const memoryGrowth = finalMemory - initialMemory;
    const memoryGrowthPercent = initialMemory > 0 ? (memoryGrowth / initialMemory) * 100 : 0;
    
    // Test passes if memory growth is less than 10%
    const passed = Math.abs(memoryGrowthPercent) < 10;
    
    return {
      passed,
      initialMemory,
      finalMemory,
      memoryGrowth,
      memoryGrowthPercent,
      iterations,
      duration,
      details: {
        effectPoolStats: effectPool.getStats(),
        bulletPoolStats: bulletPool.getStats(),
        gcAvailable: this.tester.forceGC(),
        memoryBeforeGC: initialMemory,
        memoryAfterGC: finalMemory
      }
    };
  }
  
  /**
   * Comprehensive memory stress test
   */
  async runComprehensiveTest(): Promise<{
    bulletTest: MemoryTestResult;
    effectTest: MemoryTestResult;
    overallPassed: boolean;
  }> {
    
    const bulletTest = await this.testBulletMemoryLeaks(500);
    const effectTest = await this.testEffectMemoryLeaks(500);
    
    const overallPassed = bulletTest.passed && effectTest.passed;
    
    // Log results
    if (GAME_CONSTANTS.DEBUG_MODE) {
      
      
    }
    
    return {
      bulletTest,
      effectTest,
      overallPassed
    };
  }
} 