/**
 * 🔄 Lifecycle Manager - Tracks object lifecycles and manages cleanup
 */

import { GAME_CONSTANTS } from '../../utils/constants';

export class LifecycleManager {
  private static instance: LifecycleManager;
  private trackedObjects: Map<string, {
    obj: unknown;
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
  access(id: string): unknown | null {
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
    
    // Debug logging removed for production optimization
    
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