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
 * Activity level types for performance adjustments
 */
export type ActivityLevel = 'low' | 'medium' | 'high';

/**
 * Object counts for performance decisions
 */
export interface ObjectCounts {
  enemies: number;
  bullets: number;
  effects: number;
}

/**
 * State change tracking data
 */
export interface StateSnapshot {
  counts: {
    enemies: number;
    bullets: number;
    effects: number;
    towers: number;
  };
  values: {
    gold: number;
    currentWave: number;
    isGameOver: boolean;
    isPaused: boolean;
  };
} 