/**
 * 🎆 Enhanced Effects System - Core Functions
 */

import { useGameStore } from '../../models/store';
import { GAME_CONSTANTS } from '../../utils/constants';
import type { Effect } from '../../models/gameTypes';
import { effectPool } from './EffectPool';
import { cleanupManager } from '../memory';
import { Logger } from '../../utils/Logger';

/**
 * Update all effects with automatic cleanup
 */
export function updateEffects() {
  const { effects, removeEffect } = useGameStore.getState();
  const expiredEffects: string[] = [];
  
  effects.forEach((effect: Effect) => {
    effect.life -= GAME_CONSTANTS.GAME_TICK;
    
    // Check if effect is expired
    if (effect.life <= 0) {
      expiredEffects.push(effect.id);
    }
  });
  
  // Batch remove expired effects and return them to pool
  expiredEffects.forEach(effectId => {
    const effect = effects.find((e: Effect) => e.id === effectId);
    if (effect) {
      removeEffect(effectId);
      // Return to pool for reuse
      try {
        effectPool.release(effect);
      } catch (error) {
        Logger.warn('🚨 Error releasing effect to pool:', error);
      }
    }
  });
  
  // Log performance statistics periodically
  if (GAME_CONSTANTS.DEBUG_MODE && Math.random() < 0.01) { // 1% chance per frame
    const _stats = effectPool.getStats();
    // Performance statistics available for debugging
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
 * Perform comprehensive cleanup
 */
export function performMemoryCleanup(): void {
  cleanupManager.cleanup();
  effectPool.clear();
  
  if (GAME_CONSTANTS.DEBUG_MODE) {
    // Debug cleanup logging can be added here
  }
} 