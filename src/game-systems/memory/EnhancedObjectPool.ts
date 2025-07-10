/**
 * 🚀 Enhanced Object Pool System
 * Advanced pooling with pre-warming, dynamic sizing, and activity monitoring
 */



export interface PoolableObject {
  reset(): void;
  isActive: boolean;
}

export interface PoolConfig<T> {
  createObject: () => T;
  resetObject: (obj: T) => void;
  initialSize: number;
  maxSize: number;
  preWarmPercent: number; // Percentage to pre-warm during low activity
  growthFactor: number; // How much to grow pool when needed
  shrinkThreshold: number; // Usage below this triggers shrinking
}

export class EnhancedObjectPool<T extends PoolableObject> {
  private pool: T[] = [];
  private active: Set<T> = new Set();
  private config: PoolConfig<T>;
  private stats = {
    created: 0,
    reused: 0,
    peakActive: 0,
    totalAcquisitions: 0,
    averageActiveCount: 0,
    lastUsageCheck: performance.now()
  };
  
  // Activity monitoring for dynamic sizing
  private usageHistory: number[] = [];
  private readonly historyLength = 60; // Track 60 samples
  
  constructor(config: PoolConfig<T>) {
    this.config = config;
    this.preWarm();
    this.scheduleMaintenanceTask();
  }
  
  /**
   * Pre-warm the pool with initial objects
   */
  private preWarm(): void {
    const preWarmSize = Math.floor(this.config.initialSize * this.config.preWarmPercent);
    for (let i = 0; i < preWarmSize; i++) {
      const obj = this.config.createObject();
      this.config.resetObject(obj);
      this.pool.push(obj);
      this.stats.created++;
    }
    

  }
  
  /**
   * Acquire an object from the pool
   */
  acquire(): T {
    this.stats.totalAcquisitions++;
    let obj = this.pool.pop();
    
    if (!obj) {
      obj = this.config.createObject();
      this.stats.created++;
    } else {
      this.stats.reused++;
    }
    
    this.active.add(obj);
    this.updatePeakActive();
    return obj;
  }
  
  /**
   * Release an object back to the pool
   */
  release(obj: T): void {
    if (!this.active.has(obj)) {
      return;
    }
    
    this.active.delete(obj);
    this.config.resetObject(obj);
    
    // Only add back to pool if we haven't exceeded max size
    if (this.pool.length < this.config.maxSize) {
      this.pool.push(obj);
    }
  }
  
  /**
   * Force release all active objects (emergency cleanup)
   */
  releaseAll(): void {
    for (const obj of this.active) {
      this.config.resetObject(obj);
      if (this.pool.length < this.config.maxSize) {
        this.pool.push(obj);
      }
    }
    this.active.clear();
  }
  
  /**
   * Update peak active count
   */
  private updatePeakActive(): void {
    if (this.active.size > this.stats.peakActive) {
      this.stats.peakActive = this.active.size;
    }
  }
  
  /**
   * Record usage for dynamic sizing
   */
  private recordUsage(): void {
    this.usageHistory.push(this.active.size);
    if (this.usageHistory.length > this.historyLength) {
      this.usageHistory.shift();
    }
    
    // Update average
    const sum = this.usageHistory.reduce((a, b) => a + b, 0);
    this.stats.averageActiveCount = sum / this.usageHistory.length;
  }
  
  /**
   * Schedule periodic maintenance tasks
   */
  private scheduleMaintenanceTask(): void {
    const maintenanceInterval = setInterval(() => {
      this.recordUsage();
      this.optimizePoolSize();
    }, 1000); // Run every second
    
    // Clean up interval when needed
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        clearInterval(maintenanceInterval);
      });
    }
  }
  
  /**
   * Dynamically optimize pool size based on usage
   */
  private optimizePoolSize(): void {
    if (this.usageHistory.length < 10) return; // Need some history
    
    const currentUsage = this.stats.averageActiveCount;
    const poolSize = this.pool.length;
    
    // Grow pool if we're consistently using most of it
    const usageRatio = currentUsage / Math.max(poolSize, 1);
    if (usageRatio > 0.8 && poolSize < this.config.maxSize) {
      const growAmount = Math.min(
        Math.ceil(poolSize * this.config.growthFactor),
        this.config.maxSize - poolSize
      );
      
      for (let i = 0; i < growAmount; i++) {
        const obj = this.config.createObject();
        this.config.resetObject(obj);
        this.pool.push(obj);
        this.stats.created++;
      }
      

    }
    
    // Shrink pool if usage is consistently low
    if (usageRatio < this.config.shrinkThreshold && poolSize > this.config.initialSize) {
      const shrinkAmount = Math.min(
        Math.ceil(poolSize * 0.1), // Shrink by 10%
        poolSize - this.config.initialSize
      );
      
      this.pool.splice(0, shrinkAmount);

    }
  }
  
  /**
   * Get comprehensive pool statistics
   */
  getStats(): {
    poolSize: number;
    activeCount: number;
    created: number;
    reused: number;
    reuseRate: number;
    peakActive: number;
    averageActive: number;
    efficiency: number;
    totalAcquisitions: number;
  } {
    const reuseRate = this.stats.totalAcquisitions > 0 ? 
      (this.stats.reused / this.stats.totalAcquisitions) * 100 : 0;
    
    const efficiency = this.stats.peakActive > 0 ? 
      (this.stats.averageActiveCount / this.stats.peakActive) * 100 : 0;
    
    return {
      poolSize: this.pool.length,
      activeCount: this.active.size,
      created: this.stats.created,
      reused: this.stats.reused,
      reuseRate,
      peakActive: this.stats.peakActive,
      averageActive: this.stats.averageActiveCount,
      efficiency,
      totalAcquisitions: this.stats.totalAcquisitions
    };
  }
  
  /**
   * Clear all objects and reset stats
   */
  clear(): void {
    this.pool.length = 0;
    this.active.clear();
    this.usageHistory.length = 0;
    this.stats = {
      created: 0,
      reused: 0,
      peakActive: 0,
      totalAcquisitions: 0,
      averageActiveCount: 0,
      lastUsageCheck: performance.now()
    };
  }
} 