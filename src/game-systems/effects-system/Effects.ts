/**
 * 🎆 Enhanced Effects System - Core Functions
 */

import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import type { Effect } from '../../models/gameTypes';
import { effectPool } from './EffectPool';
import { cleanupManager } from '../memory';


/**
 * Update all effects with automatic cleanup
 */
export function updateEffects() {
  const { effects, removeEffect } = useGameStore.getState();
  const expiredEffects: Effect[] = []; // 🚀 Store references instead of IDs
  
  // Single pass: update life and collect expired effects
  effects.forEach((effect: Effect) => {
    effect.life -= GAME_CONSTANTS.GAME_TICK;
    
    // Check if effect is expired - store reference directly
    if (effect.life <= 0) {
      expiredEffects.push(effect); // 🚀 Direct reference, no ID lookup needed
    }
  });
  
  // 🚀 OPTIMIZED: Batch remove expired effects (no find() operation)
  expiredEffects.forEach(effect => {
    removeEffect(effect.id); // Remove from state
    // Return to pool for reuse
    try {
      effectPool.release(effect);
    } catch {
      // Error silently handled for performance
    }
  });
  
  // Performance monitoring removed for production optimization
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
 * Perform comprehensive cleanup
 */
export function performMemoryCleanup(): void {
  cleanupManager.cleanup();
  effectPool.clear();
  
  // Debug cleanup logging removed for production optimization
} 