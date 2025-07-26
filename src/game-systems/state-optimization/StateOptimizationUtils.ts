import type { GameState } from '../../models/gameTypes';
import { GameStateSelectors } from './GameStateSelectors';
import { performanceMonitor } from './index';

/**
 * State Optimization Utilities
 * Convenience functions for state optimization
 */
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
    // Performance logging removed for production optimization
  },
  
  /**
   * Reset all optimization tracking
   */
  reset: () => {
    performanceMonitor.reset();
  },
  
  /**
   * Get performance summary for debugging
   */
  getPerformanceSummary: () => {
    const metrics = performanceMonitor.getMetrics();
    const efficiency = performanceMonitor.getEfficiencyPercent();
    const updateRate = performanceMonitor.getUpdateRate();
    
    return {
      efficiency: efficiency.toFixed(1),
      updateRate: updateRate.toFixed(1),
      totalUpdates: metrics.totalUpdates,
      skippedUpdates: metrics.skippedUpdates,
      avgBatchSize: metrics.avgBatchSize.toFixed(1)
    };
  }
}; 