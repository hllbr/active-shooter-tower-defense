import type { PerformanceMetrics } from './types';

/**
 * Performance Monitor for State Updates
 */
export class StatePerformanceMonitor {
  private metrics: PerformanceMetrics = {
    totalUpdates: 0,
    skippedUpdates: 0,
    batchedUpdates: 0,
    avgBatchSize: 0,
    lastUpdateTime: 0
  };
  
  private updateHistory: number[] = [];
  private readonly maxHistorySize = 100;
  
  public recordUpdate(wasSkipped: boolean = false): void {
    this.metrics.totalUpdates++;
    if (wasSkipped) {
      this.metrics.skippedUpdates++;
    }
    
    this.metrics.lastUpdateTime = performance.now();
    this.updateHistory.push(this.metrics.lastUpdateTime);
    
    // Keep history size manageable
    if (this.updateHistory.length > this.maxHistorySize) {
      this.updateHistory.shift();
    }
  }
  
  public recordBatch(batchSize: number): void {
    this.metrics.batchedUpdates++;
    this.metrics.avgBatchSize = 
      (this.metrics.avgBatchSize * 0.9) + (batchSize * 0.1);
  }
  
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  public getEfficiencyPercent(): number {
    if (this.metrics.totalUpdates === 0) return 0;
    return (this.metrics.skippedUpdates / this.metrics.totalUpdates) * 100;
  }
  
  public getUpdateRate(): number {
    if (this.updateHistory.length < 2) return 0;
    
    const timeSpan = this.updateHistory[this.updateHistory.length - 1] - this.updateHistory[0];
    return (this.updateHistory.length / timeSpan) * 1000; // Updates per second
  }
  
  public logPerformance(): void {
    // Performance metrics available via getters:
    // - getEfficiencyPercent(): efficiency percentage  
    // - getUpdateRate(): updates per second
    // - getMetrics(): complete metrics object
    // This method can be extended for external monitoring integration
  }
  
  public reset(): void {
    this.metrics = {
      totalUpdates: 0,
      skippedUpdates: 0,
      batchedUpdates: 0,
      avgBatchSize: 0,
      lastUpdateTime: 0
    };
    this.updateHistory = [];
  }
} 