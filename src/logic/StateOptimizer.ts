import type { GameState } from '../models/gameTypes';

/**
 * Performance Metrics Interface
 */
export interface PerformanceMetrics {
  totalUpdates: number;
  skippedUpdates: number;
  batchedUpdates: number;
  avgBatchSize: number;
  lastUpdateTime: number;
}

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
   * Get critical game objects count for performance decisions
   */
  public static getObjectCounts(state: GameState): { enemies: number, bullets: number, effects: number } {
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
  public static getActivityLevel(state: GameState): 'low' | 'medium' | 'high' {
    const counts = this.getObjectCounts(state);
    const totalObjects = counts.enemies + counts.bullets + counts.effects;
    
    if (totalObjects < 10) return 'low';
    if (totalObjects < 50) return 'medium';
    return 'high';
  }
}

/**
 * Simple State Change Tracker
 * Tracks basic changes without complex type handling
 */
export class SimpleStateTracker {
  private lastCounts = {
    enemies: 0,
    bullets: 0,
    effects: 0,
    towers: 0
  };
  
  private lastValues = {
    gold: 0,
    currentWave: 0,
    isGameOver: false,
    isPaused: false
  };
  
  /**
   * Check if there are significant changes worth updating
   */
  public hasSignificantChanges(state: GameState): boolean {
    const currentCounts = {
      enemies: state.enemies.length,
      bullets: state.bullets.length,
      effects: state.effects.length,
      towers: state.towers.length
    };
    
    const currentValues = {
      gold: state.gold,
      currentWave: state.currentWave,
      isGameOver: state.isGameOver,
      isPaused: state.isPaused
    };
    
    // Check for any changes in critical values
    const hasCountChanges = 
      currentCounts.enemies !== this.lastCounts.enemies ||
      currentCounts.bullets !== this.lastCounts.bullets ||
      currentCounts.effects !== this.lastCounts.effects ||
      currentCounts.towers !== this.lastCounts.towers;
      
    const hasValueChanges =
      currentValues.gold !== this.lastValues.gold ||
      currentValues.currentWave !== this.lastValues.currentWave ||
      currentValues.isGameOver !== this.lastValues.isGameOver ||
      currentValues.isPaused !== this.lastValues.isPaused;
    
    return hasCountChanges || hasValueChanges;
  }
  
  /**
   * Update tracked values
   */
  public updateSnapshot(state: GameState): void {
    this.lastCounts = {
      enemies: state.enemies.length,
      bullets: state.bullets.length,
      effects: state.effects.length,
      towers: state.towers.length
    };
    
    this.lastValues = {
      gold: state.gold,
      currentWave: state.currentWave,
      isGameOver: state.isGameOver,
      isPaused: state.isPaused
    };
  }
  
  /**
   * Get change summary for debugging
   */
  public getChangeSummary(state: GameState): string {
    const current = GameStateSelectors.getObjectCounts(state);
    const changes = {
      enemies: current.enemies - this.lastCounts.enemies,
      bullets: current.bullets - this.lastCounts.bullets,
      effects: current.effects - this.lastCounts.effects
    };
    
    return `Δ Enemies: ${changes.enemies > 0 ? '+' : ''}${changes.enemies}, ` +
           `Bullets: ${changes.bullets > 0 ? '+' : ''}${changes.bullets}, ` +
           `Effects: ${changes.effects > 0 ? '+' : ''}${changes.effects}`;
  }
}

/**
 * Performance Monitor for State Updates
 */
export class StatePerformanceMonitor {
  private metrics: PerformanceMetrics = {
    totalUpdates: 0,
    skippedUpdates: 0,
    batchedUpdates: 0,
    avgBatchSize: 0,
    lastUpdateTime: 0
  };
  
  private updateHistory: number[] = [];
  private readonly maxHistorySize = 100;
  
  public recordUpdate(wasSkipped: boolean = false): void {
    this.metrics.totalUpdates++;
    if (wasSkipped) {
      this.metrics.skippedUpdates++;
    }
    
    this.metrics.lastUpdateTime = performance.now();
    this.updateHistory.push(this.metrics.lastUpdateTime);
    
    // Keep history size manageable
    if (this.updateHistory.length > this.maxHistorySize) {
      this.updateHistory.shift();
    }
  }
  
  public recordBatch(batchSize: number): void {
    this.metrics.batchedUpdates++;
    this.metrics.avgBatchSize = 
      (this.metrics.avgBatchSize * 0.9) + (batchSize * 0.1);
  }
  
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
  
  public getEfficiencyPercent(): number {
    if (this.metrics.totalUpdates === 0) return 0;
    return (this.metrics.skippedUpdates / this.metrics.totalUpdates) * 100;
  }
  
  public getUpdateRate(): number {
    if (this.updateHistory.length < 2) return 0;
    
    const timeSpan = this.updateHistory[this.updateHistory.length - 1] - this.updateHistory[0];
    return (this.updateHistory.length / timeSpan) * 1000; // Updates per second
  }
  
  public logPerformance(): void {
    const efficiency = this.getEfficiencyPercent().toFixed(1);
    const updateRate = this.getUpdateRate().toFixed(1);
    
    console.log(`🚀 State Performance Report:
      Update Rate: ${updateRate}/sec
      Total Updates: ${this.metrics.totalUpdates}
      Skipped: ${this.metrics.skippedUpdates} (${efficiency}% efficiency)
      Avg Batch Size: ${this.metrics.avgBatchSize.toFixed(1)}
      Last Update: ${Date.now() - this.metrics.lastUpdateTime}ms ago`);
  }
  
  public reset(): void {
    this.metrics = {
      totalUpdates: 0,
      skippedUpdates: 0,
      batchedUpdates: 0,
      avgBatchSize: 0,
      lastUpdateTime: 0
    };
    this.updateHistory = [];
  }
}

// Export singleton instances for global use
export const stateTracker = new SimpleStateTracker();
export const performanceMonitor = new StatePerformanceMonitor();

// Export convenience utilities
export const StateOptimizationUtils = {
  /**
   * Determine if an update should be throttled
   */
  shouldThrottle: (state: GameState, lastUpdateTime: number): boolean => {
    const now = performance.now();
    const timeSinceUpdate = now - lastUpdateTime;
    const activityLevel = GameStateSelectors.getActivityLevel(state);
    
    switch (activityLevel) {
      case 'low': return timeSinceUpdate < 50; // 20 FPS
      case 'medium': return timeSinceUpdate < 33; // 30 FPS  
      case 'high': return timeSinceUpdate < 16; // 60 FPS
      default: return false;
    }
  },
  
  /**
   * Log current state optimization status
   */
  logStatus: () => {
    performanceMonitor.logPerformance();
  },
  
  /**
   * Reset all optimization tracking
   */
  reset: () => {
    performanceMonitor.reset();
  }
}; 