/**
 * 🏊 Object Pool - Generic object pooling system for memory optimization
 */

export class ObjectPool<T> {
  private pool: T[] = [];
  private active: Set<T> = new Set();
  private factory: () => T;
  private resetFn: (obj: T) => void;
  private maxPoolSize: number;
  private created: number = 0;
  private reused: number = 0;
  
  constructor(
    factory: () => T,
    resetFn: (obj: T) => void,
    maxPoolSize: number = 100
  ) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.maxPoolSize = maxPoolSize;
  }
  
  /**
   * Get an object from the pool or create a new one
   */
  acquire(): T {
    let obj = this.pool.pop();
    
    if (!obj) {
      obj = this.factory();
      this.created++;
    } else {
      this.reused++;
    }
    
    this.active.add(obj);
    return obj;
  }
  
  /**
   * Return an object to the pool
   */
  release(obj: T): void {
    if (!this.active.has(obj)) {
      console.warn('🚨 Attempting to release object not in active set');
      return;
    }
    
    this.active.delete(obj);
    this.resetFn(obj);
    
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(obj);
    }
  }
  
  /**
   * Force release all active objects
   */
  releaseAll(): void {
    for (const obj of this.active) {
      this.resetFn(obj);
      if (this.pool.length < this.maxPoolSize) {
        this.pool.push(obj);
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
  }
  
  /**
   * Get pool statistics
   */
  getStats(): {
    poolSize: number;
    activeCount: number;
    created: number;
    reused: number;
    reuseRate: number;
  } {
    return {
      poolSize: this.pool.length,
      activeCount: this.active.size,
      created: this.created,
      reused: this.reused,
      reuseRate: this.created > 0 ? (this.reused / (this.created + this.reused)) * 100 : 0
    };
  }
} 