import type { Bullet, Enemy } from '../../models/gameTypes';
import type { ICollisionDetector, CollisionResult } from './types';
import { OptimizedCollisionDetector } from './detectors/OptimizedDetector';

/**
 * Collision Manager - Dependency Inversion Principle
 * Depends on abstractions, not concretions
 * Single Responsibility: Manages collision detection workflow
 */
export class CollisionManager {
  private detector: ICollisionDetector;
  
  constructor(detector: ICollisionDetector = new OptimizedCollisionDetector()) {
    this.detector = detector;
  }
  
  /**
   * Process all bullet collisions for a frame - Frame-rate independent
   */
  public processBulletCollisions(
    bullets: Bullet[], 
    enemies: Enemy[], 
    deltaTime: number,
    onCollision: (bullet: Bullet, enemy: Enemy, result: CollisionResult) => void
  ): void {
    const optimizedDetector = this.detector as OptimizedCollisionDetector;
    
    for (const bullet of bullets) {
      if (!bullet.isActive) continue;
      
      if (optimizedDetector.checkCollisionWithSpatialOptimization) {
        // Use optimized detection with spatial partitioning
        const collision = optimizedDetector.checkCollisionWithSpatialOptimization(bullet, enemies, deltaTime);
        if (collision) {
          onCollision(bullet, collision.enemy, collision.result);
        }
      } else {
        // Fallback to basic detection
        for (const enemy of enemies) {
          if (!enemy.isActive) continue;
          
          const result = this.detector.checkCollision(bullet, enemy, deltaTime);
          if (result.hasCollision) {
            onCollision(bullet, enemy, result);
            break; // Bullet can only hit one enemy
          }
        }
      }
    }
  }
  
  /**
   * Change collision detection algorithm at runtime
   */
  public setDetector(detector: ICollisionDetector): void {
    this.detector = detector;
  }
  
  /**
   * Get current detector instance
   */
  public getDetector(): ICollisionDetector {
    return this.detector;
  }
  
  /**
   * Get performance statistics (if available)
   */
  public getPerformanceStats(): { gridStats?: { totalCells: number; totalEnemies: number; averageEnemiesPerCell: number }; detectorType: string } {
    const optimizedDetector = this.detector as OptimizedCollisionDetector;
    if (optimizedDetector.getGridStats) {
      return {
        gridStats: optimizedDetector.getGridStats(),
        detectorType: this.detector.constructor.name
      };
    }
    
    return {
      detectorType: this.detector.constructor.name
    };
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    const optimizedDetector = this.detector as OptimizedCollisionDetector;
    if (optimizedDetector.clearGrid) {
      optimizedDetector.clearGrid();
    }
  }
} 