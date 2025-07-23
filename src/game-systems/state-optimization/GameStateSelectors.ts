import type { GameState } from '../../models/gameTypes';
import type { ActivityLevel, ObjectCounts } from './types';

/**
 * Game-Specific State Selectors - Performance Optimized
 * Optimized selectors for common game state queries
 */
export class GameStateSelectors {
  /**
   * Check if visual re-render is needed
   */
  public static needsVisualUpdate(state: GameState): boolean {
    return state.enemies.length > 0 || 
           state.bullets.length > 0 || 
           state.effects.length > 0 ||
           state.unlockingSlots.size > 0;
  }
  
  /**
   * Check if game is in active state (not paused, not game over)
   */
  public static isGameActive(state: GameState): boolean {
    return state.isStarted && !state.isGameOver && !state.isPaused;
  }
  
  /**
   * Check if the game is globally paused
   */
  public static isPaused(state: GameState): boolean {
    return !!state.isPaused;
  }
  
  /**
   * Get critical game objects count for performance decisions
   */
  public static getObjectCounts(state: GameState): ObjectCounts {
    return {
      enemies: state.enemies.length,
      bullets: state.bullets.length,
      effects: state.effects.length
    };
  }
  
  /**
   * Check if state update should be throttled based on activity
   */
  public static shouldThrottleUpdates(state: GameState): boolean {
    const counts = this.getObjectCounts(state);
    return counts.enemies > 20 || counts.bullets > 30 || counts.effects > 15;
  }
  
  /**
   * Calculate activity level for dynamic performance adjustments
   */
  public static getActivityLevel(state: GameState): ActivityLevel {
    const counts = this.getObjectCounts(state);
    const totalObjects = counts.enemies + counts.bullets + counts.effects;
    
    if (totalObjects < 10) return 'low';
    if (totalObjects < 50) return 'medium';
    return 'high';
  }

  /**
   * Check if the game is ready to spawn waves (at least one tower placed)
   */
  public static isGameReadyForWaves(state: GameState): boolean {
    return !!state.gameReadyForWaves;
  }
} 