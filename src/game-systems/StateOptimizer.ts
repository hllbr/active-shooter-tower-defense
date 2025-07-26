/**
 * 🎯 Simplified State Optimization
 * Minimal change tracking for maximum performance
 */

import type { GameState } from '../models/gameTypes';

// Simplified thresholds
const CHANGE_THRESHOLDS = {
  ENEMY_COUNT: 5,
  BULLET_COUNT: 10,
  TIME_THRESHOLD: 50 // milliseconds
} as const;

class SimpleStateTracker {
  private lastSnapshot: Partial<GameState> = {};
  private lastUpdateTime = 0;

  hasSignificantChanges(currentState: GameState): boolean {
    const now = performance.now();
    
    // Time-based throttling
    if (now - this.lastUpdateTime < CHANGE_THRESHOLDS.TIME_THRESHOLD) {
      return false;
    }

    // Check significant changes
    const enemyChange = Math.abs((currentState.enemies?.length || 0) - (this.lastSnapshot.enemies?.length || 0));
    const bulletChange = Math.abs((currentState.bullets?.length || 0) - (this.lastSnapshot.bullets?.length || 0));
    
    const hasChange = enemyChange >= CHANGE_THRESHOLDS.ENEMY_COUNT || 
                     bulletChange >= CHANGE_THRESHOLDS.BULLET_COUNT ||
                     currentState.isGameOver !== this.lastSnapshot.isGameOver ||
                     currentState.currentWave !== this.lastSnapshot.currentWave;

    if (hasChange) {
      this.lastUpdateTime = now;
    }

    return hasChange;
  }

  updateSnapshot(state: GameState): void {
    this.lastSnapshot = {
      enemies: state.enemies,
      bullets: state.bullets,
      isGameOver: state.isGameOver,
      currentWave: state.currentWave
    };
  }
}

// Simplified performance monitor
class SimplePerformanceMonitor {
  private updateCount = 0;
  private skippedCount = 0;

  recordUpdate(wasSkipped: boolean): void {
    if (wasSkipped) {
      this.skippedCount++;
    }
    this.updateCount++;
  }

  logPerformance(): void {
    if (this.updateCount > 0) {
      const _skipRate = (this.skippedCount / this.updateCount * 100).toFixed(1);
      // Performance monitoring: updates skipped for optimization
    }
  }
}

// Simplified game state selectors
export const GameStateSelectors = {
  needsVisualUpdate: (state: GameState): boolean => {
    return state.enemies.length > 0 || state.bullets.length > 0 || state.isGameOver;
  },

  getActivityLevel: (state: GameState): 'low' | 'medium' | 'high' => {
    const totalEntities = (state.enemies?.length || 0) + (state.bullets?.length || 0);
    return totalEntities > 50 ? 'high' : totalEntities > 20 ? 'medium' : 'low';
  }
};

// Export simplified instances
export const stateTracker = new SimpleStateTracker();
export const performanceMonitor = new SimplePerformanceMonitor(); 