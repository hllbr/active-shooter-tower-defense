/**
 * 🧠 Memory Management System - Main exports and utilities
 */

export { CleanupManager } from './CleanupManager';
export { cleanupManager } from './CleanupManager';
export { ObjectPool } from './ObjectPool';
export { BulletPool } from './BulletPool';
export { EffectPool } from './EffectPool';
export { LifecycleManager } from './LifecycleManager';
export { MemoryMonitor } from './MemoryMonitor';
export { GlobalMemoryManager } from './GlobalMemoryManager';

// Advanced Object Pooling System
export { AdvancedObjectPool } from './AdvancedObjectPool';
export { AdvancedBulletPool, advancedBulletPool } from './AdvancedBulletPool';
export { AdvancedEffectPool, advancedEffectPool } from './AdvancedEffectPool';
export { AdvancedEnemyPool, advancedEnemyPool } from './AdvancedEnemyPool';
export { AdvancedPoolManager, advancedPoolManager } from './AdvancedPoolManager';

// Memory Testing System
export { globalMemoryManager, memoryMonitor, checkMemoryUsage, startMemoryMonitoring, getMemoryStats, forceCleanup } from './utils';
export type { MemoryMetrics, MemoryTestResult, MemoryTrendAnalysis } from './types';

// Import the class first, then create the instance
import { GlobalMemoryManager } from './GlobalMemoryManager';

// Main memory manager instance
export const memoryManager = GlobalMemoryManager.getInstance();

// Utility functions for easy access
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

// React Hook for automatic cleanup (placeholder for React integration)
export const useMemoryCleanup = (cleanupFn: () => void, _deps: unknown[] = []) => {
  // Note: This would need React import in actual usage
  // For now, we'll just return the cleanup function
  return cleanupFn;
}; 