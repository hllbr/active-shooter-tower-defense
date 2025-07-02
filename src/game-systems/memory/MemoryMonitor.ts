/**
 * 📊 Memory Monitor - Tracks memory usage and provides diagnostics
 */

export class MemoryMonitor {
  private static instance: MemoryMonitor;
  private samples: number[] = [];
  private maxSamples: number = 100;
  private lastGC: number = 0;
  
  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }
  
  /**
   * Take a memory sample
   */
  sample(): number | null {
    if ('memory' in performance) {
      const memory = (performance as Record<string, unknown>).memory as { usedJSHeapSize: number };
      const usage = memory.usedJSHeapSize;
      
      this.samples.push(usage);
      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }
      
      return usage;
    }
    return null;
  }
  
  /**
   * Force garbage collection if available
   */
  forceGC(): boolean {
    if (typeof window !== 'undefined' && 'gc' in window && typeof (window as Record<string, unknown>).gc === 'function') {
      ((window as Record<string, unknown>).gc as () => void)();
      this.lastGC = performance.now();
      return true;
    }
    return false;
  }
  
  /**
   * Get memory statistics
   */
  getStats(): {
    current: number | null;
    average: number | null;
    peak: number | null;
    trend: 'rising' | 'falling' | 'stable' | 'unknown';
    samples: number;
    lastGC: number;
  } {
    if (this.samples.length === 0) {
      return {
        current: null,
        average: null,
        peak: null,
        trend: 'unknown',
        samples: 0,
        lastGC: this.lastGC
      };
    }
    
    const current = this.samples[this.samples.length - 1];
    const average = this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
    const peak = Math.max(...this.samples);
    
    // Calculate trend
    let trend: 'rising' | 'falling' | 'stable' | 'unknown' = 'stable';
    if (this.samples.length >= 10) {
      const recent = this.samples.slice(-10);
      const older = this.samples.slice(-20, -10);
      
      if (older.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        const diff = (recentAvg - olderAvg) / olderAvg;
        
        if (diff > 0.05) trend = 'rising';
        else if (diff < -0.05) trend = 'falling';
      }
    }
    
    return {
      current,
      average,
      peak,
      trend,
      samples: this.samples.length,
      lastGC: this.lastGC
    };
  }
  
  /**
   * Check if memory usage is concerning
   */
  isMemoryHigh(): boolean {
    const stats = this.getStats();
    if (!stats.current || !stats.average) return false;
    
    // Memory is concerning if:
    // 1. Current usage is 50% higher than average
    // 2. Trend is rising
    return stats.current > stats.average * 1.5 || stats.trend === 'rising';
  }
} 