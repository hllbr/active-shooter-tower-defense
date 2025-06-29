/**
 * 🎆 Effects System - Main Entry Point
 */

// Export all effects-related modules
export * from './EffectPool';
export * from './ManagedTimers';
export * from '../memory';

// Re-export main effects functions
export { updateEffects, createManagedEffect, performMemoryCleanup } from './Effects'; 