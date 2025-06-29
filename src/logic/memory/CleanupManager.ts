/**
 * 🧹 Memory Management System - CleanupManager
 */

import { GAME_CONSTANTS } from '../../utils/Constants';

// =================== MEMORY MANAGEMENT ===================

interface CleanupTask {
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

// =================== GLOBAL INSTANCE ===================

export const cleanupManager = CleanupManager.getInstance(); 