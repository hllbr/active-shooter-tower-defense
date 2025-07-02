// Export all types
export * from './types';

// Export all classes
export { GameStateSelectors } from './GameStateSelectors';
export { SimpleStateTracker } from './SimpleStateTracker';
export { StatePerformanceMonitor } from './StatePerformanceMonitor';
export { StateOptimizationUtils } from './StateOptimizationUtils';

// Export singleton instances for global use
import { SimpleStateTracker } from './SimpleStateTracker';
import { StatePerformanceMonitor } from './StatePerformanceMonitor';

export const stateTracker = new SimpleStateTracker();
export const performanceMonitor = new StatePerformanceMonitor(); 