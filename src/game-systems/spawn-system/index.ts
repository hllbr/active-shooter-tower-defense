import { AdaptiveSpawnStrategy } from './AdaptiveSpawnStrategy';
import { PerformanceTracker } from './PerformanceTracker';
import { DynamicSpawnController } from './DynamicSpawnController';
export * from './types';
export * from './waveConfigs';

export const performanceTracker = new PerformanceTracker();
export const spawnStrategy = new AdaptiveSpawnStrategy(performanceTracker);
export const dynamicSpawnController = new DynamicSpawnController(
  spawnStrategy,
  performanceTracker
);
