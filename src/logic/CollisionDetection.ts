// Re-export everything for backward compatibility
export * from './collision/types';
export * from './collision/detectors/BaseDetector';
export * from './collision/detectors/FrameIndependentDetector';
export * from './collision/detectors/OptimizedDetector';
export * from './collision/CollisionManager';

// Import for singleton
import { CollisionManager } from './collision/CollisionManager';

// Export singleton instance for easy use
export const collisionManager = new CollisionManager(); 