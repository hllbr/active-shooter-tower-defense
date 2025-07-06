/**
 * 📊 Memory Tester - Core memory sampling and analysis functionality
 */

import type { MemoryMetrics, MemoryTrendAnalysis, ExtendedPerformance, ExtendedWindow } from './types';

export class MemoryTester {
  private samples: MemoryMetrics[] = [];
  private maxSamples: number = 1000;
  
  /**
   * Take a memory sample
   */
  sample(): MemoryMetrics | null {
    const extendedPerformance = performance as ExtendedPerformance;
    
    if (extendedPerformance.memory) {
      const memory = extendedPerformance.memory;
      
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
  analyzeTrend(windowSize: number = 50): MemoryTrendAnalysis {
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
    const extendedWindow = window as ExtendedWindow;
    if (extendedWindow.gc && typeof extendedWindow.gc === 'function') {
      extendedWindow.gc();
      return true;
    }
    return false;
  }
  
  /**
   * Wait for garbage collection
   */
  async waitForGC(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, 100);
    });
  }
} 