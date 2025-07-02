/**
 * 📊 Memory Tester - Core memory sampling and analysis functionality
 */

import type { MemoryMetrics, MemoryTrendAnalysis } from './types';

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
    if ('gc' in window && typeof (window as Record<string, unknown>).gc === 'function') {
      ((window as Record<string, unknown>).gc as () => void)();
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