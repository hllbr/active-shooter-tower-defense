import type { Bullet, Enemy, Position } from '../../../models/gameTypes';
import type { CollisionResult, TrajectoryInfo } from '../types';
import { BaseCollisionDetector } from './BaseDetector';

/**
 * Frame-Rate Independent Collision Detector
 * Single Responsibility: Only handles frame-rate independent collision detection
 * Open/Closed: Can be extended for different collision algorithms
 */
export class FrameIndependentCollisionDetector extends BaseCollisionDetector {
  
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
} 