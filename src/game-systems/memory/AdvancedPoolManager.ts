/**
 * 🎯 Advanced Pool Manager - Unified interface for all object pools
 */

import { AdvancedObjectPool } from './AdvancedObjectPool';
import { advancedBulletPool } from './AdvancedBulletPool';
import { advancedEffectPool } from './AdvancedEffectPool';
import { advancedEnemyPool } from './AdvancedEnemyPool';
import { AdvancedPerformanceProfiler } from '../performance/AdvancedProfiler';

export interface PoolManagerStats {
  totalPools: number;
  totalActiveObjects: number;
  totalPooledObjects: number;
  totalCreated: number;
  totalReused: number;
  averageReuseRate: number;
  memoryEfficiency: number;
  pools: {
    [key: string]: {
      poolSize: number;
      activeCount: number;
      created: number;
      reused: number;
      reuseRate: number;
      autoReturns: number;
      shrinks: number;
    };
  };
}

export class AdvancedPoolManager {
  private static instance: AdvancedPoolManager;
  private pools: Map<string, unknown> = new Map();
  private monitoringInterval: number | null = null;
  
  private constructor() {
    this.registerDefaultPools();
    this.startMonitoring();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): AdvancedPoolManager {
    if (!AdvancedPoolManager.instance) {
      AdvancedPoolManager.instance = new AdvancedPoolManager();
    }
    return AdvancedPoolManager.instance;
  }
  
  /**
   * Register default pools
   */
  private registerDefaultPools(): void {
    // Register the default pools
    this.pools.set('bullet', advancedBulletPool['pool']);
    this.pools.set('effect', advancedEffectPool['pool']);
    this.pools.set('enemy', advancedEnemyPool['pool']);
  }
  
  /**
   * Register a custom pool
   */
  registerPool<T extends { reset(): void; isActive: boolean }>(
    key: string,
    pool: AdvancedObjectPool<T>
  ): void {
    this.pools.set(key, pool);
  }
  
  /**
   * Get a pool by key
   */
  getPool<T extends { reset(): void; isActive: boolean }>(key: string): AdvancedObjectPool<T> | null {
    return this.pools.get(key) as AdvancedObjectPool<T> || null;
  }
  
  /**
   * Get all registered pool keys
   */
  getPoolKeys(): string[] {
    return Array.from(this.pools.keys());
  }
  
  /**
   * Get comprehensive statistics for all pools
   */
  getStats(): PoolManagerStats {
    const stats: PoolManagerStats = {
      totalPools: this.pools.size,
      totalActiveObjects: 0,
      totalPooledObjects: 0,
      totalCreated: 0,
      totalReused: 0,
      averageReuseRate: 0,
      memoryEfficiency: 0,
      pools: {}
    };
    
    let totalReuseRate = 0;
    let poolCount = 0;
    
    for (const [key, pool] of this.pools) {
      const poolStats = (pool as AdvancedObjectPool<{ reset(): void; isActive: boolean }>).getStats();
      
      stats.totalActiveObjects += poolStats.activeCount;
      stats.totalPooledObjects += poolStats.poolSize;
      stats.totalCreated += poolStats.created;
      stats.totalReused += poolStats.reused;
      
      stats.pools[key] = {
        poolSize: poolStats.poolSize,
        activeCount: poolStats.activeCount,
        created: poolStats.created,
        reused: poolStats.reused,
        reuseRate: poolStats.reuseRate,
        autoReturns: poolStats.autoReturns,
        shrinks: poolStats.shrinks
      };
      
      totalReuseRate += poolStats.reuseRate;
      poolCount++;
    }
    
    if (poolCount > 0) {
      stats.averageReuseRate = totalReuseRate / poolCount;
    }
    
    // Calculate memory efficiency (active objects vs total objects)
    const totalObjects = stats.totalActiveObjects + stats.totalPooledObjects;
    if (totalObjects > 0) {
      stats.memoryEfficiency = (stats.totalActiveObjects / totalObjects) * 100;
    }
    
    return stats;
  }
  
  /**
   * Perform maintenance on all pools
   */
  performMaintenance(): void {
    for (const _pool of this.pools.values()) {
      // The pools handle their own maintenance automatically
      // This is just for any additional maintenance tasks
    }
  }
  
  /**
   * Clear all pools (emergency cleanup)
   */
  clearAllPools(): void {
    for (const pool of this.pools.values()) {
      (pool as AdvancedObjectPool<{ reset(): void; isActive: boolean }>).clear();
    }
  }
  
  /**
   * Release all active objects from all pools
   */
  releaseAllActive(): void {
    for (const pool of this.pools.values()) {
      (pool as AdvancedObjectPool<{ reset(): void; isActive: boolean }>).releaseAll();
    }
  }
  
  /**
   * Profile all pools using AdvancedPerformanceProfiler
   */
  profileAllPools(profiler: AdvancedPerformanceProfiler): void {
    profiler.startMonitoring();
    const beforeStats = this.getStats();
    profiler.recordMetric({
      name: 'PoolStatsBefore',
      value: beforeStats.totalActiveObjects,
      timestamp: performance.now(),
      category: 'memory',
      severity: 'info'
    });
    // ... run test or simulation here ...
    const afterStats = this.getStats();
    profiler.recordMetric({
      name: 'PoolStatsAfter',
      value: afterStats.totalActiveObjects,
      timestamp: performance.now(),
      category: 'memory',
      severity: 'info'
    });
    profiler.stopMonitoring();
  }
  
  /**
   * Start monitoring pools
   */
  private startMonitoring(): void {
    if (typeof window !== 'undefined') {
      this.monitoringInterval = window.setInterval(() => {
        this.performMaintenance();
      }, 5000); // Check every 5 seconds
      
      // Clean up on page unload
      window.addEventListener('beforeunload', () => {
        if (this.monitoringInterval) {
          clearInterval(this.monitoringInterval);
        }
      });
    }
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  
  /**
   * Get memory usage summary
   */
  getMemorySummary(): string {
    const stats = this.getStats();
    return `Pools: ${stats.totalPools}, Active: ${stats.totalActiveObjects}, Pooled: ${stats.totalPooledObjects}, Reuse Rate: ${stats.averageReuseRate.toFixed(1)}%`;
  }
}

// Global singleton instance
export const advancedPoolManager = AdvancedPoolManager.getInstance(); 