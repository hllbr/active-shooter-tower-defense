/**
 * 🧠 Enhanced Effects System with Memory Management
 */

import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import type { Effect } from '../models/gameTypes';

// =================== MEMORY MANAGEMENT ===================

interface CleanupTask {
  id: string;
  cleanup: () => void;
  type: 'timer' | 'listener' | 'animation' | 'object' | 'interval';
  description?: string;
  created: number;
}

class CleanupManager {
  private static instance: CleanupManager;
  private cleanupTasks: Map<string, CleanupTask> = new Map();
  private isShuttingDown: boolean = false;
  
  static getInstance(): CleanupManager {
    if (!CleanupManager.instance) {
      CleanupManager.instance = new CleanupManager();
    }
    return CleanupManager.instance;
  }
  
  registerTimer(id: string, timerId: number, description?: string): void {
    this.registerCleanup({
      id,
      cleanup: () => clearTimeout(timerId),
      type: 'timer',
      description,
      created: performance.now()
    });
  }
  
  registerInterval(id: string, intervalId: number, description?: string): void {
    this.registerCleanup({
      id,
      cleanup: () => clearInterval(intervalId),
      type: 'interval',
      description,
      created: performance.now()
    });
  }
  
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
      description: description || `${event} listener`,
      created: performance.now()
    });
  }
  
  private registerCleanup(task: CleanupTask): void {
    if (this.isShuttingDown) {
      task.cleanup();
      return;
    }
    
    this.cleanupTasks.set(task.id, task);
    
    if (GAME_CONSTANTS.DEBUG_MODE) {
      console.log(`🧹 Registered cleanup: ${task.type} - ${task.description || task.id}`);
    }
  }
  
  executeCleanup(id: string): boolean {
    const task = this.cleanupTasks.get(id);
    if (task) {
      task.cleanup();
      this.cleanupTasks.delete(id);
      return true;
    }
    return false;
  }
  
  cleanup(): void {
    this.isShuttingDown = true;
    
    if (GAME_CONSTANTS.DEBUG_MODE) {
      console.log(`🧹 CleanupManager: Executing ${this.cleanupTasks.size} cleanup tasks`);
    }
    
    for (const [id, task] of this.cleanupTasks) {
      try {
        task.cleanup();
      } catch (error) {
        console.error(`🚨 Cleanup error for ${id}:`, error);
      }
    }
    
    this.cleanupTasks.clear();
    this.isShuttingDown = false;
  }
  
  getDiagnostics(): {
    totalTasks: number;
    tasksByType: Record<string, number>;
  } {
    const tasksByType: Record<string, number> = {};
    
    for (const [, task] of this.cleanupTasks) {
      tasksByType[task.type] = (tasksByType[task.type] || 0) + 1;
    }
    
    return {
      totalTasks: this.cleanupTasks.size,
      tasksByType
    };
  }
}

// =================== EFFECT POOL ===================

class EffectPool {
  private pool: Effect[] = [];
  private active: Set<Effect> = new Set();
  private maxPoolSize: number = 100;
  private created: number = 0;
  private reused: number = 0;
  
  /**
   * Get an effect from the pool or create a new one
   */
  acquire(): Effect {
    let effect = this.pool.pop();
    
    if (!effect) {
             effect = {
         id: `effect_${Date.now()}_${Math.random()}`,
         position: { x: 0, y: 0 },
         radius: 10,
         color: '#ffffff',
         life: 0,
         maxLife: 1000,
         type: 'explosion',
         opacity: 1,
         scale: 1,
         createdAt: performance.now()
       };
      this.created++;
    } else {
      this.reused++;
    }
    
    this.active.add(effect);
    return effect;
  }
  
  /**
   * Return an effect to the pool
   */
  release(effect: Effect): void {
    if (!this.active.has(effect)) {
      console.warn('🚨 Attempting to release effect not in active set');
      return;
    }
    
    this.active.delete(effect);
    
         // Reset effect properties
     effect.position = { x: 0, y: 0 };
     effect.radius = 10;
     effect.color = '#ffffff';
     effect.life = 0;
     effect.maxLife = 1000;
     effect.type = 'explosion';
     effect.opacity = 1;
     effect.scale = 1;
     effect.createdAt = performance.now();
    
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(effect);
    }
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
  
  /**
   * Clear all pooled effects
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

// =================== GLOBAL INSTANCES ===================

export const cleanupManager = CleanupManager.getInstance();
export const effectPool = new EffectPool();

// =================== ENHANCED EFFECTS SYSTEM ===================

/**
 * Update all effects with automatic cleanup
 */
export function updateEffects() {
  const { effects, removeEffect } = useGameStore.getState();
  const expiredEffects: string[] = [];
  
  effects.forEach((effect) => {
    effect.life -= GAME_CONSTANTS.GAME_TICK;
    
    // Check if effect is expired
    if (effect.life <= 0) {
      expiredEffects.push(effect.id);
    }
  });
  
     // Batch remove expired effects and return them to pool
   expiredEffects.forEach(effectId => {
     const effect = effects.find(e => e.id === effectId);
     if (effect) {
       removeEffect(effectId);
       // Return to pool for reuse
       try {
         effectPool.release(effect);
       } catch (error) {
         console.warn('🚨 Error releasing effect to pool:', error);
       }
     }
   });
  
  // Log performance statistics periodically
  if (GAME_CONSTANTS.DEBUG_MODE && Math.random() < 0.01) { // 1% chance per frame
    const stats = effectPool.getStats();
    console.log(`🎆 Effect Pool Stats: ${stats.activeCount} active, ${stats.poolSize} pooled, ${stats.reuseRate.toFixed(1)}% reuse`);
  }
}

/**
 * Create a managed effect with automatic pooling
 */
export function createManagedEffect(
  type: string,
  position: { x: number; y: number },
  duration: number = 1000
): Effect {
  const effect = effectPool.createEffect(type, position, duration);
  
  // Add to game state
  const { addEffect } = useGameStore.getState();
  addEffect(effect);
  
  return effect;
}

/**
 * Utility functions for managed timers and intervals
 */
export const createManagedTimer = (
  callback: () => void,
  delay: number,
  description?: string
): string => {
  const id = `timer_${Date.now()}_${Math.random()}`;
  const timerId = window.setTimeout(callback, delay);
  cleanupManager.registerTimer(id, timerId, description);
  return id;
};

export const createManagedInterval = (
  callback: () => void,
  interval: number,
  description?: string
): string => {
  const id = `interval_${Date.now()}_${Math.random()}`;
  const intervalId = window.setInterval(callback, interval);
  cleanupManager.registerInterval(id, intervalId, description);
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
  cleanupManager.registerEventListener(id, element, event, handler, description);
  return id;
};

/**
 * Perform comprehensive cleanup
 */
export function performMemoryCleanup(): void {
  cleanupManager.cleanup();
  effectPool.clear();
  
  if (GAME_CONSTANTS.DEBUG_MODE) {
    console.log('🧹 Memory cleanup completed');
  }
}
