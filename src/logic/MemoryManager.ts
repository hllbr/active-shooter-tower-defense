/**
 * 🧠 Elite Memory Leak Prevention & Cleanup System
 * 
 * This system provides comprehensive memory management for the tower defense game,
 * preventing memory leaks and optimizing performance through object pooling,
 * lifecycle management, and automatic cleanup.
 */

import { GAME_CONSTANTS } from '../utils/Constants';
import type { Bullet, Effect, Enemy } from '../models/gameTypes';

// =================== CLEANUP MANAGER ===================

export interface CleanupTask {
  id: string;
  cleanup: () => void;
  type: 'timer' | 'listener' | 'animation' | 'object' | 'interval';
  description?: string;
  created: number;
}

export class CleanupManager {
  private static instance: CleanupManager;
  private cleanupTasks: Map<string, CleanupTask> = new Map();
  private isShuttingDown: boolean = false;
  
  static getInstance(): CleanupManager {
    if (!CleanupManager.instance) {
      CleanupManager.instance = new CleanupManager();
    }
    return CleanupManager.instance;
  }
  
  /**
   * Register a cleanup task to be executed later
   */
  registerCleanup(task: CleanupTask): void {
    if (this.isShuttingDown) {
      // Execute immediately if shutting down
      task.cleanup();
      return;
    }
    
    this.cleanupTasks.set(task.id, task);
    
    if (GAME_CONSTANTS.DEBUG_MODE) {
      console.log(`🧹 Registered cleanup: ${task.type} - ${task.description || task.id}`);
    }
  }
  
  /**
   * Register a timer for automatic cleanup
   */
  registerTimer(id: string, timerId: number, description?: string): void {
    this.registerCleanup({
      id,
      cleanup: () => clearTimeout(timerId),
      type: 'timer',
      description,
      created: performance.now()
    });
  }
  
  /**
   * Register an interval for automatic cleanup
   */
  registerInterval(id: string, intervalId: number, description?: string): void {
    this.registerCleanup({
      id,
      cleanup: () => clearInterval(intervalId),
      type: 'interval',
      description,
      created: performance.now()
    });
  }
  
  /**
   * Register an event listener for automatic cleanup
   */
  registerEventListener(
    id: string, 
    element: EventTarget, 
    event: string, 
    handler: EventListener,
    description?: string
  ): void {
    this.registerCleanup({
      id,
      cleanup: () => element.removeEventListener(event, handler),
      type: 'listener',
      description: description || `${event} on ${element.constructor.name}`,
      created: performance.now()
    });
  }
  
  /**
   * Register an animation frame for automatic cleanup
   */
  registerAnimationFrame(id: string, frameId: number, description?: string): void {
    this.registerCleanup({
      id,
      cleanup: () => cancelAnimationFrame(frameId),
      type: 'animation',
      description,
      created: performance.now()
    });
  }
  
  /**
   * Unregister a specific cleanup task
   */
  unregister(id: string): boolean {
    return this.cleanupTasks.delete(id);
  }
  
  /**
   * Execute and remove a specific cleanup task
   */
  executeCleanup(id: string): boolean {
    const task = this.cleanupTasks.get(id);
    if (task) {
      task.cleanup();
      this.cleanupTasks.delete(id);
      if (GAME_CONSTANTS.DEBUG_MODE) {
        console.log(`🧹 Executed cleanup: ${task.type} - ${task.description || id}`);
      }
      return true;
    }
    return false;
  }
  
  /**
   * Execute all cleanup tasks and clear registry
   */
  cleanup(): void {
    this.isShuttingDown = true;
    
    if (GAME_CONSTANTS.DEBUG_MODE) {
      console.log(`🧹 CleanupManager: Executing ${this.cleanupTasks.size} cleanup tasks`);
    }
    
    for (const [id, task] of this.cleanupTasks) {
      try {
        task.cleanup();
        if (GAME_CONSTANTS.DEBUG_MODE) {
          const duration = performance.now() - task.created;
          console.log(`🧹 Cleaned: ${task.type} (${id}) - lived ${duration.toFixed(0)}ms`);
        }
      } catch (error) {
        console.error(`🚨 Cleanup error for ${id}:`, error);
      }
    }
    
    this.cleanupTasks.clear();
    this.isShuttingDown = false;
  }
  
  /**
   * Get memory diagnostics
   */
  getDiagnostics(): {
    totalTasks: number;
    tasksByType: Record<string, number>;
    oldestTask: { id: string; age: number } | null;
  } {
    const tasksByType: Record<string, number> = {};
    let oldestTask: { id: string; age: number } | null = null;
    const now = performance.now();
    
    for (const [id, task] of this.cleanupTasks) {
      tasksByType[task.type] = (tasksByType[task.type] || 0) + 1;
      
      const age = now - task.created;
      if (!oldestTask || age > oldestTask.age) {
        oldestTask = { id, age };
      }
    }
    
    return {
      totalTasks: this.cleanupTasks.size,
      tasksByType,
      oldestTask
    };
  }
}

// =================== OBJECT POOLS ===================

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

// =================== BULLET POOL ===================

export class BulletPool extends ObjectPool<Bullet> {
  constructor() {
    super(
      // Factory function
      () => ({
        id: `bullet_${Date.now()}_${Math.random()}`,
        position: { x: 0, y: 0 },
        target: { x: 0, y: 0 },
        damage: 0,
        speed: 0,
        firedAt: 0,
        createdAt: performance.now()
      }),
      // Reset function
      (bullet) => {
        bullet.position = { x: 0, y: 0 };
        bullet.target = { x: 0, y: 0 };
        bullet.damage = 0;
        bullet.speed = 0;
        bullet.firedAt = 0;
        bullet.createdAt = performance.now();
      },
      GAME_CONSTANTS.MAX_BULLETS || 200
    );
  }
  
  /**
   * Create a configured bullet
   */
  createBullet(
    position: { x: number; y: number },
    target: { x: number; y: number },
    damage: number,
    speed: number = GAME_CONSTANTS.BULLET_SPEED
  ): Bullet {
    const bullet = this.acquire();
    bullet.id = `bullet_${Date.now()}_${Math.random()}`;
    bullet.position = { ...position };
    bullet.target = { ...target };
    bullet.damage = damage;
    bullet.speed = speed;
    bullet.firedAt = performance.now();
    return bullet;
  }
}

// =================== EFFECT POOL ===================

export class EffectPool extends ObjectPool<Effect> {
  constructor() {
    super(
      // Factory function
      () => ({
        id: `effect_${Date.now()}_${Math.random()}`,
        type: 'explosion',
        position: { x: 0, y: 0 },
        life: 0,
        maxLife: 0,
        opacity: 1,
        scale: 1,
        createdAt: performance.now()
      }),
      // Reset function
      (effect) => {
        effect.position = { x: 0, y: 0 };
        effect.life = 0;
        effect.maxLife = 0;
        effect.opacity = 1;
        effect.scale = 1;
        effect.createdAt = performance.now();
      },
      GAME_CONSTANTS.MAX_EFFECTS || 100
    );
  }
  
  /**
   * Create a configured effect
   */
  createEffect(
    type: string,
    position: { x: number; y: number },
    duration: number = 1000
  ): Effect {
    const effect = this.acquire();
    effect.id = `effect_${Date.now()}_${Math.random()}`;
    effect.type = type;
    effect.position = { ...position };
    effect.life = duration;
    effect.maxLife = duration;
    effect.opacity = 1;
    effect.scale = 1;
    return effect;
  }
}

// =================== LIFECYCLE MANAGER ===================

export class LifecycleManager {
  private static instance: LifecycleManager;
  private trackedObjects: Map<string, {
    obj: any;
    type: string;
    created: number;
    lastAccessed: number;
  }> = new Map();
  
  static getInstance(): LifecycleManager {
    if (!LifecycleManager.instance) {
      LifecycleManager.instance = new LifecycleManager();
    }
    return LifecycleManager.instance;
  }
  
  /**
   * Track an object's lifecycle
   */
  track<T>(id: string, obj: T, type: string): T {
    const now = performance.now();
    this.trackedObjects.set(id, {
      obj,
      type,
      created: now,
      lastAccessed: now
    });
    return obj;
  }
  
  /**
   * Access a tracked object (updates last accessed time)
   */
  access(id: string): any | null {
    const tracked = this.trackedObjects.get(id);
    if (tracked) {
      tracked.lastAccessed = performance.now();
      return tracked.obj;
    }
    return null;
  }
  
  /**
   * Remove an object from tracking
   */
  untrack(id: string): boolean {
    return this.trackedObjects.delete(id);
  }
  
  /**
   * Clean up objects that haven't been accessed recently
   */
  cleanupStale(maxAge: number = 30000): number {
    const now = performance.now();
    let cleaned = 0;
    
    for (const [id, tracked] of this.trackedObjects) {
      if (now - tracked.lastAccessed > maxAge) {
        this.trackedObjects.delete(id);
        cleaned++;
      }
    }
    
    if (GAME_CONSTANTS.DEBUG_MODE && cleaned > 0) {
      console.log(`🧹 LifecycleManager: Cleaned ${cleaned} stale objects`);
    }
    
    return cleaned;
  }
  
  /**
   * Get object statistics
   */
  getStats(): {
    totalTracked: number;
    byType: Record<string, number>;
    averageAge: number;
    oldestObject: { id: string; age: number; type: string } | null;
  } {
    const now = performance.now();
    const byType: Record<string, number> = {};
    let totalAge = 0;
    let oldestObject: { id: string; age: number; type: string } | null = null;
    
    for (const [id, tracked] of this.trackedObjects) {
      byType[tracked.type] = (byType[tracked.type] || 0) + 1;
      
      const age = now - tracked.created;
      totalAge += age;
      
      if (!oldestObject || age > oldestObject.age) {
        oldestObject = { id, age, type: tracked.type };
      }
    }
    
    return {
      totalTracked: this.trackedObjects.size,
      byType,
      averageAge: this.trackedObjects.size > 0 ? totalAge / this.trackedObjects.size : 0,
      oldestObject
    };
  }
}

// =================== MEMORY MONITOR ===================

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
      const memory = (performance as any).memory;
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
    if ('gc' in global && typeof (global as any).gc === 'function') {
      (global as any).gc();
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

// =================== GLOBAL MEMORY MANAGER ===================

export class GlobalMemoryManager {
  private static instance: GlobalMemoryManager;
  private cleanupManager: CleanupManager;
  private bulletPool: BulletPool;
  private effectPool: EffectPool;
  private lifecycleManager: LifecycleManager;
  private memoryMonitor: MemoryMonitor;
  private monitoringInterval: number | null = null;
  
  private constructor() {
    this.cleanupManager = CleanupManager.getInstance();
    this.bulletPool = new BulletPool();
    this.effectPool = new EffectPool();
    this.lifecycleManager = LifecycleManager.getInstance();
    this.memoryMonitor = MemoryMonitor.getInstance();
  }
  
  static getInstance(): GlobalMemoryManager {
    if (!GlobalMemoryManager.instance) {
      GlobalMemoryManager.instance = new GlobalMemoryManager();
    }
    return GlobalMemoryManager.instance;
  }
  
  /**
   * Initialize memory monitoring
   */
  startMonitoring(interval: number = 5000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = window.setInterval(() => {
      this.memoryMonitor.sample();
      this.lifecycleManager.cleanupStale();
      
      if (this.memoryMonitor.isMemoryHigh()) {
        this.performMaintenanceCleanup();
      }
    }, interval);
    
    this.cleanupManager.registerInterval(
      'memory-monitor',
      this.monitoringInterval,
      'Memory monitoring interval'
    );
  }
  
  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.cleanupManager.unregister('memory-monitor');
    }
  }
  
  /**
   * Perform maintenance cleanup
   */
  performMaintenanceCleanup(): void {
    if (GAME_CONSTANTS.DEBUG_MODE) {
      console.log('🧹 Performing maintenance cleanup');
    }
    
    // Clean up stale objects
    this.lifecycleManager.cleanupStale();
    
    // Release unused objects from pools
    this.bulletPool.clear();
    this.effectPool.clear();
    
    // Force garbage collection if available
    this.memoryMonitor.forceGC();
  }
  
  /**
   * Full system cleanup
   */
  cleanup(): void {
    this.stopMonitoring();
    this.cleanupManager.cleanup();
    this.bulletPool.clear();
    this.effectPool.clear();
    this.performMaintenanceCleanup();
  }
  
  /**
   * Get comprehensive memory statistics
   */
  getStats(): {
    memory: ReturnType<MemoryMonitor['getStats']>;
    cleanup: ReturnType<CleanupManager['getDiagnostics']>;
    lifecycle: ReturnType<LifecycleManager['getStats']>;
    bullets: ReturnType<BulletPool['getStats']>;
    effects: ReturnType<EffectPool['getStats']>;
  } {
    return {
      memory: this.memoryMonitor.getStats(),
      cleanup: this.cleanupManager.getDiagnostics(),
      lifecycle: this.lifecycleManager.getStats(),
      bullets: this.bulletPool.getStats(),
      effects: this.effectPool.getStats()
    };
  }
  
  // Public accessors
  get cleanup() { return this.cleanupManager; }
  get bullets() { return this.bulletPool; }
  get effects() { return this.effectPool; }
  get lifecycle() { return this.lifecycleManager; }
  get monitor() { return this.memoryMonitor; }
}

// =================== EXPORTS ===================

export const memoryManager = GlobalMemoryManager.getInstance();

// React Hook for automatic cleanup
export const useMemoryCleanup = (cleanupFn: () => void, deps: any[] = []) => {
  const React = require('react');
  
  React.useEffect(() => {
    return cleanupFn;
  }, deps);
};

// Utility functions
export const createManagedTimer = (
  callback: () => void,
  delay: number,
  description?: string
): string => {
  const id = `timer_${Date.now()}_${Math.random()}`;
  const timerId = window.setTimeout(callback, delay);
  memoryManager.cleanup.registerTimer(id, timerId, description);
  return id;
};

export const createManagedInterval = (
  callback: () => void,
  interval: number,
  description?: string
): string => {
  const id = `interval_${Date.now()}_${Math.random()}`;
  const intervalId = window.setInterval(callback, interval);
  memoryManager.cleanup.registerInterval(id, intervalId, description);
  return id;
};

export const createManagedEventListener = (
  element: EventTarget,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions,
  description?: string
): string => {
  const id = `listener_${Date.now()}_${Math.random()}`;
  element.addEventListener(event, handler, options);
  memoryManager.cleanup.registerEventListener(id, element, event, handler, description);
  return id;
}; 