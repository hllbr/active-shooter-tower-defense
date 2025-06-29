/**
 * StateOptimizer - Performance Optimization System
 * 
 * This module has been refactored into smaller, focused components:
 * - types.ts: Type definitions
 * - GameStateSelectors.ts: State selection utilities
 * - SimpleStateTracker.ts: State change tracking
 * - StatePerformanceMonitor.ts: Performance monitoring
 * - StateOptimizationUtils.ts: Utility functions
 * - index.ts: Main exports and singletons
 * 
 * For backward compatibility, all exports are re-exported from here.
 */

// Re-export everything from the new modular structure
export * from './state-optimization'; 