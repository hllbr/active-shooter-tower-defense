/**
 * 🎆 Effects System - Main Entry Point
 */

// Export all effects-related modules
export * from './EffectPool';
export * from './ManagedTimers';
// Memory exports - exclude conflicting names
export { 
  memoryManager, 
  MemoryTester, 
  MemoryLeakTester,
  MemoryMonitor,
  GlobalMemoryManager,
  LifecycleManager,
  CleanupManager,
  ObjectPool,
  createManagedTimer,
  createManagedInterval,
  createManagedEventListener
} from '../memory';

// Re-export main effects functions
export { updateEffects, createManagedEffect, performMemoryCleanup } from './Effects'; 