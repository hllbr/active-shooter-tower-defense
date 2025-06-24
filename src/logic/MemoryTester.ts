/**
 * 🧪 Memory Leak Testing & Validation System
 * 
 * This utility provides comprehensive memory leak detection and testing
 * to validate the effectiveness of our cleanup system.
 */

import { GAME_CONSTANTS } from '../utils/Constants';
import { bulletPool } from '../logic/TowerManager';
import { effectPool } from '../logic/Effects';
import { performMemoryCleanup } from '../logic/Effects';

// =================== MEMORY METRICS ===================

export interface MemoryMetrics {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
}

export interface MemoryTestResult {
  passed: boolean;
  initialMemory: number;
  finalMemory: number;
  memoryGrowth: number;
  memoryGrowthPercent: number;
  iterations: number;
  duration: number;
  details: {
    effectPoolStats: any;
    bulletPoolStats: any;
    gcAvailable: boolean;
    memoryBeforeGC?: number;
    memoryAfterGC?: number;
  };
}

// =================== MEMORY MONITOR ===================

export class MemoryTester {
  private samples: MemoryMetrics[] = [];
  private maxSamples: number = 1000;
  
  /**
   * Take a memory sample
   */
  sample(): MemoryMetrics | null {
    if ('memory' in performance) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const memory = (performance as any).memory;
      
      const metrics: MemoryMetrics = {
        timestamp: performance.now(),
        heapUsed: memory.usedJSHeapSize,
        heapTotal: memory.totalJSHeapSize,
        external: memory.usedJSHeapSize, // Fallback
        arrayBuffers: 0 // Not available in browser
      };
      
      this.samples.push(metrics);
      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }
      
      return metrics;
    }
    return null;
  }
  
  /**
   * Clear all samples
   */
  clearSamples(): void {
    this.samples = [];
  }
  
  /**
   * Get memory trend analysis
   */
  analyzeTrend(windowSize: number = 50): {
    trend: 'rising' | 'falling' | 'stable' | 'unknown';
    averageGrowth: number;
    peakMemory: number;
    currentMemory: number;
  } {
    if (this.samples.length < windowSize) {
      return {
        trend: 'unknown',
        averageGrowth: 0,
        peakMemory: 0,
        currentMemory: 0
      };
    }
    
    const recent = this.samples.slice(-windowSize);
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    const growth = last.heapUsed - first.heapUsed;
    const duration = last.timestamp - first.timestamp;
    const averageGrowth = duration > 0 ? (growth / duration) * 1000 : 0; // bytes per second
    
    const peakMemory = Math.max(...recent.map(s => s.heapUsed));
    
    let trend: 'rising' | 'falling' | 'stable' | 'unknown' = 'stable';
    const growthPercent = first.heapUsed > 0 ? (growth / first.heapUsed) * 100 : 0;
    
    if (growthPercent > 5) trend = 'rising';
    else if (growthPercent < -5) trend = 'falling';
    
    return {
      trend,
      averageGrowth,
      peakMemory,
      currentMemory: last.heapUsed
    };
  }
  
  /**
   * Force garbage collection if available
   */
  forceGC(): boolean {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
      return true;
    }
    return false;
  }
}

// =================== MEMORY LEAK TESTS ===================

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
    await this.waitForGC();
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
    await this.waitForGC();
    
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
    await this.waitForGC();
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
    await this.waitForGC();
    
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
    console.log('🧪 Starting comprehensive memory leak test...');
    
    const bulletTest = await this.testBulletMemoryLeaks(500);
    const effectTest = await this.testEffectMemoryLeaks(500);
    
    const overallPassed = bulletTest.passed && effectTest.passed;
    
    // Log results
    if (GAME_CONSTANTS.DEBUG_MODE) {
      console.log('📊 Memory Test Results:');
      console.log(`  Bullet Test: ${bulletTest.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`    Memory Growth: ${bulletTest.memoryGrowthPercent.toFixed(2)}%`);
      console.log(`    Duration: ${bulletTest.duration.toFixed(0)}ms`);
      
      console.log(`  Effect Test: ${effectTest.passed ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`    Memory Growth: ${effectTest.memoryGrowthPercent.toFixed(2)}%`);
      console.log(`    Duration: ${effectTest.duration.toFixed(0)}ms`);
      
      console.log(`  Overall: ${overallPassed ? '✅ PASSED' : '❌ FAILED'}`);
    }
    
    return {
      bulletTest,
      effectTest,
      overallPassed
    };
  }
  
  /**
   * Wait for garbage collection
   */
  private async waitForGC(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, 100);
    });
  }
}

// =================== EXPORTS ===================

export const memoryTester = new MemoryTester();
export const memoryLeakTester = new MemoryLeakTester();

/**
 * Quick memory leak test function
 */
export const testMemoryLeaks = async (): Promise<boolean> => {
  const result = await memoryLeakTester.runComprehensiveTest();
  return result.overallPassed;
};

/**
 * Memory usage monitoring for development
 */
export const startMemoryMonitoring = (interval: number = 5000): () => void => {
  console.log('🔍 Starting memory monitoring...');
  
  const intervalId = setInterval(() => {
    const sample = memoryTester.sample();
    if (sample) {
      const analysis = memoryTester.analyzeTrend();
      
      if (GAME_CONSTANTS.DEBUG_MODE) {
        console.log(`💾 Memory: ${(sample.heapUsed / 1024 / 1024).toFixed(1)} MB, Trend: ${analysis.trend}`);
        
        if (analysis.trend === 'rising') {
          console.warn('⚠️ Memory usage is rising - potential leak detected');
        }
      }
    }
  }, interval);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.log('🔍 Memory monitoring stopped');
  };
}; 