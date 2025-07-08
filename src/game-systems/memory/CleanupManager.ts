/**
 * 🧹 Cleanup Manager - Handles automatic cleanup of timers, listeners, and other resources
 */

import { GAME_CONSTANTS } from '../../utils/constants';

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
    }
    
    for (const [id, task] of this.cleanupTasks) {
      try {
        task.cleanup();
        if (GAME_CONSTANTS.DEBUG_MODE) {
          const duration = performance.now() - task.created;
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

// =================== GLOBAL INSTANCE ===================

export const cleanupManager = CleanupManager.getInstance(); 