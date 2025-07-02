// Export all enemy-related modules
export { EnemyFactory } from './EnemyFactory';
export { EnemyMovement } from './EnemyMovement';
export { SpawnPositionManager, getRandomSpawnPosition } from './SpawnPositionManager';
export { TargetFinder } from './TargetFinder';
export { WaveSpawnManager } from './WaveSpawnManager';

// Re-export types for convenience
export type { Enemy } from '../../models/gameTypes';
export type { Position } from '../../models/gameTypes'; 