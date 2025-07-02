import type { Bullet, Enemy, Position } from '../../../models/gameTypes';
import type { ICollisionDetector, CollisionResult, TrajectoryInfo } from '../types';

/**
 * Base Collision Detector with Common Utilities
 * Single Responsibility: Provides common collision detection utilities
 */
export abstract class BaseCollisionDetector implements ICollisionDetector {
  protected static readonly MIN_COLLISION_STEPS = 1;
  protected static readonly MAX_COLLISION_STEPS = 20;
  
  /**
   * Abstract method that must be implemented by subclasses
   */
  abstract checkCollision(bullet: Bullet, enemy: Enemy, deltaTime: number): CollisionResult;
  
  /**
   * Calculate bullet trajectory for the given time step
   */
  protected calculateBulletTrajectory(bullet: Bullet, deltaTime: number): TrajectoryInfo {
    const deltaX = bullet.direction.x * bullet.speed * (deltaTime / 1000);
    const deltaY = bullet.direction.y * bullet.speed * (deltaTime / 1000);
    
    return {
      startPos: { x: bullet.position.x, y: bullet.position.y },
      endPos: { 
        x: bullet.position.x + deltaX, 
        y: bullet.position.y + deltaY 
      },
      velocity: { x: deltaX, y: deltaY },
      radius: bullet.size / 2
    };
  }
  
  /**
   * Calculate enemy trajectory (for moving enemies)
   */
  protected calculateEnemyTrajectory(enemy: Enemy): TrajectoryInfo {
    // For now, enemies are treated as stationary during collision check
    // Can be extended for moving enemy prediction
    return {
      startPos: { x: enemy.position.x, y: enemy.position.y },
      endPos: { x: enemy.position.x, y: enemy.position.y },
      velocity: { x: 0, y: 0 },
      radius: enemy.size / 2
    };
  }
  
  /**
   * Utility: Calculate distance between two positions
   */
  protected getDistance(pos1: Position, pos2: Position): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Check if two circles are overlapping
   */
  protected areCirclesOverlapping(
    center1: Position, 
    radius1: number, 
    center2: Position, 
    radius2: number
  ): boolean {
    const distance = this.getDistance(center1, center2);
    return distance <= radius1 + radius2;
  }
  
  /**
   * Calculate penetration depth between two overlapping circles
   */
  protected calculatePenetrationDepth(
    center1: Position, 
    radius1: number, 
    center2: Position, 
    radius2: number
  ): number {
    const distance = this.getDistance(center1, center2);
    const combinedRadius = radius1 + radius2;
    return Math.max(0, combinedRadius - distance);
  }
} 