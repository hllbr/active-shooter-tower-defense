import type { Bullet, Enemy, Position } from '../../models/gameTypes';

/**
 * Collision Detection Interface - Interface Segregation Principle
 */
export interface ICollisionDetector {
  checkCollision(bullet: Bullet, enemy: Enemy, deltaTime: number): CollisionResult;
}

/**
 * Collision Result Interface
 */
export interface CollisionResult {
  hasCollision: boolean;
  collisionPoint?: Position;
  penetrationDepth?: number;
  collisionTime?: number; // 0-1 range within the frame
}

/**
 * Trajectory Information for Predictive Collision
 */
export interface TrajectoryInfo {
  startPos: Position;
  endPos: Position;
  velocity: Position;
  radius: number;
}

/**
 * Spatial Grid Cell Interface
 */
export interface SpatialGridCell {
  enemies: Enemy[];
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

/**
 * Collision Detection Configuration
 */
export interface CollisionConfig {
  minCollisionSteps: number;
  maxCollisionSteps: number;
  gridSize: number;
  spatialPartitioningEnabled: boolean;
} 