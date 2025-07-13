/**
 * 🚀 Advanced Object Pool System
 * Enhanced pooling with memory control, auto-shrink, and automatic lifecycle management
 */

export interface PoolableObject {
  reset(): void;
  isActive: boolean;
  id?: string;
}

export interface AdvancedPoolConfig<T> {
  createObject: () => T;
  resetObject: (obj: T) => void;
  initialSize: number;
  maxPoolSize: number;
  maxIdleTime: number; // Maximum time objects can stay idle in pool (ms)
  autoShrinkInterval: number; // How often to check for shrinking (ms)
  createIfEmpty: boolean; // Whether to create new objects when pool is empty
  autoReturnDelay: number; // Delay before auto-returning objects (ms)
  preWarmPercent: number; // Percentage to pre-warm during initialization
}

export class AdvancedObjectPool<T extends PoolableObject> {
  private pool: T[] = [];
  private active: Set<T> = new Set();
  private config: AdvancedPoolConfig<T>;
  private stats = {
    created: 0,
    reused: 0,
    peakActive: 0,
    totalAcquisitions: 0,
    autoReturns: 0,
    shrinks: 0,
    lastShrinkTime: 0
  };
  
  // Idle time tracking for auto-shrink
  private idleTimestamps: Map<T, number> = new Map();
  private autoReturnTimers: Map<T, number> = new Map();
  
  // Singleton registry
  private static pools = new Map<string, unknown>();
  
  constructor(config: AdvancedPoolConfig<T>, poolKey?: string) {
    this.config = config;
    this.preWarm();
    this.scheduleMaintenanceTasks();
    
    // Register as singleton if key provided
    if (poolKey) {
      AdvancedObjectPool.pools.set(poolKey, this);
    }
  }
  
  /**
   * Get singleton pool instance
   */
  static getInstance<T extends PoolableObject>(
    poolKey: string,
    config: AdvancedPoolConfig<T>
  ): AdvancedObjectPool<T> {
    if (!AdvancedObjectPool.pools.has(poolKey)) {
      const pool = new AdvancedObjectPool(config, poolKey);
      return pool;
    }
    return AdvancedObjectPool.pools.get(poolKey) as AdvancedObjectPool<T>;
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
      this.idleTimestamps.set(obj, performance.now());
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
      if (this.config.createIfEmpty) {
        obj = this.config.createObject();
        this.stats.created++;
      } else {
        throw new Error('Pool is empty and createIfEmpty is disabled');
      }
    } else {
      this.stats.reused++;
      this.idleTimestamps.delete(obj);
    }
    
    this.active.add(obj);
    this.updatePeakActive();
    
    // Schedule auto-return after delay
    this.scheduleAutoReturn(obj);
    
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
    
    // Clear auto-return timer
    this.clearAutoReturnTimer(obj);
    
    // Only add back to pool if we haven't exceeded max size
    if (this.pool.length < this.config.maxPoolSize) {
      this.pool.push(obj);
      this.idleTimestamps.set(obj, performance.now());
    }
  }
  
  /**
   * Schedule automatic return after delay
   */
  private scheduleAutoReturn(obj: T): void {
    const timerId = window.setTimeout(() => {
      if (this.active.has(obj)) {
        this.release(obj);
        this.stats.autoReturns++;
      }
      this.autoReturnTimers.delete(obj);
    }, this.config.autoReturnDelay);
    
    this.autoReturnTimers.set(obj, timerId);
  }
  
  /**
   * Clear auto-return timer for an object
   */
  private clearAutoReturnTimer(obj: T): void {
    const timerId = this.autoReturnTimers.get(obj);
    if (timerId) {
      clearTimeout(timerId);
      this.autoReturnTimers.delete(obj);
    }
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
   * Schedule periodic maintenance tasks
   */
  private scheduleMaintenanceTasks(): void {
    // Auto-shrink task
    const shrinkInterval = setInterval(() => {
      this.autoShrink();
    }, this.config.autoShrinkInterval);
    
    // Clean up intervals when needed
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        clearInterval(shrinkInterval);
        this.clearAllTimers();
      });
    }
  }
  
  /**
   * Automatically shrink pool based on idle time
   */
  private autoShrink(): void {
    const now = performance.now();
    const cutoffTime = now - this.config.maxIdleTime;
    
    let shrunkCount = 0;
    const newPool: T[] = [];
    
    for (const obj of this.pool) {
      const idleTime = this.idleTimestamps.get(obj) || 0;
      
      if (idleTime < cutoffTime) {
        // Object has been idle too long, remove it
        shrunkCount++;
      } else {
        // Keep object in pool
        newPool.push(obj);
      }
    }
    
    if (shrunkCount > 0) {
      this.pool = newPool;
      this.stats.shrinks++;
      this.stats.lastShrinkTime = now;
    }
  }
  
  /**
   * Clear all timers
   */
  private clearAllTimers(): void {
    for (const timerId of this.autoReturnTimers.values()) {
      clearTimeout(timerId);
    }
    this.autoReturnTimers.clear();
  }
  
  /**
   * Force release all active objects
   */
  releaseAll(): void {
    for (const obj of this.active) {
      this.config.resetObject(obj);
      this.clearAutoReturnTimer(obj);
      if (this.pool.length < this.config.maxPoolSize) {
        this.pool.push(obj);
        this.idleTimestamps.set(obj, performance.now());
      }
    }
    this.active.clear();
  }
  
  /**
   * Clear the entire pool
   */
  clear(): void {
    this.pool.length = 0;
    this.active.clear();
    this.idleTimestamps.clear();
    this.clearAllTimers();
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
    autoReturns: number;
    shrinks: number;
    totalAcquisitions: number;
    idleObjects: number;
  } {
    const reuseRate = this.stats.totalAcquisitions > 0 ? 
      (this.stats.reused / this.stats.totalAcquisitions) * 100 : 0;
    
    return {
      poolSize: this.pool.length,
      activeCount: this.active.size,
      created: this.stats.created,
      reused: this.stats.reused,
      reuseRate,
      peakActive: this.stats.peakActive,
      autoReturns: this.stats.autoReturns,
      shrinks: this.stats.shrinks,
      totalAcquisitions: this.stats.totalAcquisitions,
      idleObjects: this.idleTimestamps.size
    };
  }
  
  /**
   * Get all registered pool keys
   */
  static getPoolKeys(): string[] {
    return Array.from(AdvancedObjectPool.pools.keys());
  }
  
  /**
   * Clear all pools (emergency cleanup)
   */
  static clearAllPools(): void {
    for (const pool of AdvancedObjectPool.pools.values()) {
      (pool as AdvancedObjectPool<PoolableObject>).clear();
    }
    AdvancedObjectPool.pools.clear();
  }
} 