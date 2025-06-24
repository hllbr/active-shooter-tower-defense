import type { Bullet, Enemy, Position } from '../models/gameTypes';

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
interface TrajectoryInfo {
  startPos: Position;
  endPos: Position;
  velocity: Position;
  radius: number;
}

/**
 * Frame-Rate Independent Collision Detector
 * Single Responsibility: Only handles collision detection
 * Open/Closed: Can be extended for different collision algorithms
 */
export class FrameIndependentCollisionDetector implements ICollisionDetector {
  private static readonly MIN_COLLISION_STEPS = 1;
  private static readonly MAX_COLLISION_STEPS = 20;
  
  /**
   * Main collision detection method - frame-rate independent
   */
  public checkCollision(bullet: Bullet, enemy: Enemy, deltaTime: number): CollisionResult {
    // Calculate actual movement based on deltaTime (frame-rate independent)
    const bulletTrajectory = this.calculateBulletTrajectory(bullet, deltaTime);
    const enemyTrajectory = this.calculateEnemyTrajectory(enemy);
    
    // Use continuous collision detection for fast-moving objects
    return this.continuousCollisionDetection(bulletTrajectory, enemyTrajectory);
  }
  
  /**
   * Calculate bullet trajectory for the given time step
   */
  private calculateBulletTrajectory(bullet: Bullet, deltaTime: number): TrajectoryInfo {
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
  private calculateEnemyTrajectory(enemy: Enemy): TrajectoryInfo {
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
   * Continuous Collision Detection using swept sphere method
   */
  private continuousCollisionDetection(
    bulletTraj: TrajectoryInfo, 
    enemyTraj: TrajectoryInfo
  ): CollisionResult {
    // Calculate relative movement
    const relativeVelocity = {
      x: bulletTraj.velocity.x - enemyTraj.velocity.x,
      y: bulletTraj.velocity.y - enemyTraj.velocity.y
    };
    
    // Initial distance
    const initialDistance = this.getDistance(bulletTraj.startPos, enemyTraj.startPos);
    const combinedRadius = bulletTraj.radius + enemyTraj.radius;
    
    // Already overlapping
    if (initialDistance <= combinedRadius) {
      return {
        hasCollision: true,
        collisionPoint: bulletTraj.startPos,
        penetrationDepth: combinedRadius - initialDistance,
        collisionTime: 0
      };
    }
    
    // No relative movement - no collision possible
    const relativeSpeed = Math.sqrt(relativeVelocity.x ** 2 + relativeVelocity.y ** 2);
    if (relativeSpeed === 0) {
      return { hasCollision: false };
    }
    
    // Use swept sphere collision detection
    return this.sweptSphereCollision(bulletTraj, enemyTraj, relativeVelocity, combinedRadius);
  }
  
  /**
   * Swept Sphere Collision Detection Algorithm
   */
  private sweptSphereCollision(
    bulletTraj: TrajectoryInfo,
    enemyTraj: TrajectoryInfo,
    relativeVelocity: Position,
    combinedRadius: number
  ): CollisionResult {
    // Vector from bullet to enemy
    const bulletToEnemy = {
      x: enemyTraj.startPos.x - bulletTraj.startPos.x,
      y: enemyTraj.startPos.y - bulletTraj.startPos.y
    };
    
    // Quadratic equation coefficients for swept sphere
    const a = relativeVelocity.x ** 2 + relativeVelocity.y ** 2;
    const b = 2 * (bulletToEnemy.x * relativeVelocity.x + bulletToEnemy.y * relativeVelocity.y);
    const c = bulletToEnemy.x ** 2 + bulletToEnemy.y ** 2 - combinedRadius ** 2;
    
    // Discriminant
    const discriminant = b ** 2 - 4 * a * c;
    
    if (discriminant < 0) {
      return { hasCollision: false }; // No collision
    }
    
    // Calculate collision time (0-1 range)
    const sqrtDiscriminant = Math.sqrt(discriminant);
    const t1 = (-b - sqrtDiscriminant) / (2 * a);
    const t2 = (-b + sqrtDiscriminant) / (2 * a);
    
    // Use the earlier collision time (entry point)
    const collisionTime = Math.min(t1, t2);
    
    // Check if collision happens within this frame (t must be between 0 and 1)
    if (collisionTime < 0 || collisionTime > 1) {
      return { hasCollision: false };
    }
    
    // Calculate collision point
    const collisionPoint = {
      x: bulletTraj.startPos.x + bulletTraj.velocity.x * collisionTime,
      y: bulletTraj.startPos.y + bulletTraj.velocity.y * collisionTime
    };
    
    return {
      hasCollision: true,
      collisionPoint,
      collisionTime,
      penetrationDepth: 0 // No penetration with continuous detection
    };
  }
  
  /**
   * Utility: Calculate distance between two positions
   */
  private getDistance(pos1: Position, pos2: Position): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

/**
 * Optimized Collision Detector with Spatial Partitioning
 * Open/Closed Principle: Extends base functionality
 */
export class OptimizedCollisionDetector extends FrameIndependentCollisionDetector {
  private spatialGrid = new Map<string, Enemy[]>();
  private readonly gridSize = 100; // Grid cell size for spatial partitioning
  
  /**
   * Override to use spatial partitioning for performance
   */
  public checkCollisionWithSpatialOptimization(
    bullet: Bullet, 
    enemies: Enemy[], 
    deltaTime: number
  ): { enemy: Enemy; result: CollisionResult } | null {
    // Update spatial grid
    this.updateSpatialGrid(enemies);
    
    // Get nearby enemies using spatial partitioning
    const nearbyEnemies = this.getNearbyEnemies(bullet.position);
    
    // Check collision only with nearby enemies
    for (const enemy of nearbyEnemies) {
      const result = this.checkCollision(bullet, enemy, deltaTime);
      if (result.hasCollision) {
        return { enemy, result };
      }
    }
    
    return null;
  }
  
  /**
   * Update spatial partitioning grid
   */
  private updateSpatialGrid(enemies: Enemy[]): void {
    this.spatialGrid.clear();
    
    for (const enemy of enemies) {
      const gridKey = this.getGridKey(enemy.position);
      if (!this.spatialGrid.has(gridKey)) {
        this.spatialGrid.set(gridKey, []);
      }
      this.spatialGrid.get(gridKey)!.push(enemy);
    }
  }
  
  /**
   * Get enemies in nearby grid cells
   */
  private getNearbyEnemies(position: Position): Enemy[] {
    const nearbyEnemies: Enemy[] = [];
    const centerGridKey = this.getGridKey(position);
    const [centerX, centerY] = centerGridKey.split(',').map(Number);
    
    // Check 3x3 grid around bullet position
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const gridKey = `${centerX + dx},${centerY + dy}`;
        const cellEnemies = this.spatialGrid.get(gridKey) || [];
        nearbyEnemies.push(...cellEnemies);
      }
    }
    
    return nearbyEnemies;
  }
  
  /**
   * Generate grid key from position
   */
  private getGridKey(position: Position): string {
    const gridX = Math.floor(position.x / this.gridSize);
    const gridY = Math.floor(position.y / this.gridSize);
    return `${gridX},${gridY}`;
  }
}

/**
 * Collision Manager - Dependency Inversion Principle
 * Depends on abstractions, not concretions
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
}

// Export singleton instance for easy use
export const collisionManager = new CollisionManager(); 