import { GAME_CONSTANTS } from '../../utils/Constants';
import type { Bullet, Enemy, Effect } from '../../models/gameTypes';
import { bulletPool } from './BulletPool';
import { collisionManager } from '../CollisionDetection';

/**
 * Bullet update system
 * Handles bullet movement, collision detection, and lifecycle management
 */
export class BulletUpdateSystem {
  /**
   * Update all bullets in the game
   */
  updateBullets(
    bullets: Bullet[],
    enemies: Enemy[],
    deltaTime: number = 16,
    removeBullet: (bulletId: string) => void,
    addEffect: (effect: Effect) => void,
    damageEnemy: (id: string, damage: number) => void
  ): void {
    const now = performance.now();
    const expiredBullets: string[] = [];
    
    // Update bullet positions using actual deltaTime (frame-rate independent)
    bullets.forEach((bullet) => {
      // Move bullet using actual deltaTime
      const deltaX = bullet.direction.x * bullet.speed * (deltaTime / 1000);
      const deltaY = bullet.direction.y * bullet.speed * (deltaTime / 1000);
      bullet.position.x += deltaX;
      bullet.position.y += deltaY;
      bullet.life -= deltaTime;
      
      if (bullet.life <= 0) {
        expiredBullets.push(bullet.id);
      }
    });
    
    // Batch remove expired bullets and return them to pool
    expiredBullets.forEach(bulletId => {
      const bullet = bullets.find(b => b.id === bulletId);
      if (bullet) {
        removeBullet(bulletId);
        // Return to pool for reuse
        try {
          bulletPool.release(bullet);
        } catch (error) {
          console.warn('🚨 Error releasing bullet to pool:', error);
        }
      }
    });

    // Process collisions using the new frame-rate independent system
    collisionManager.processBulletCollisions(
      bullets,
      enemies,
      deltaTime,
      (bullet, enemy, collisionResult) => {
        // Apply damage
        damageEnemy(enemy.id, bullet.damage);
        
        // Remove bullet and return to pool
        removeBullet(bullet.id);
        try {
          bulletPool.release(bullet);
        } catch (error) {
          console.warn('🚨 Error releasing bullet to pool after collision:', error);
        }
        
        // Apply bullet effects
        const bulletType = GAME_CONSTANTS.BULLET_TYPES[bullet.typeIndex];
        if ('freezeDuration' in bulletType && bulletType.freezeDuration) {
          enemy.frozenUntil = now + bulletType.freezeDuration;
        }
        
        // Optional: Add collision effect at the collision point
        if (collisionResult.collisionPoint) {
          addEffect({
            id: `collision-${Date.now()}-${Math.random()}`,
            position: collisionResult.collisionPoint,
            radius: 15,
            color: bullet.color,
            life: 200,
            maxLife: 200,
          });
        }
        
        if (GAME_CONSTANTS.DEBUG_MODE) {
          console.log(`Bullet ${bullet.id} hit enemy ${enemy.id} at collision time: ${collisionResult.collisionTime?.toFixed(3)}`);
        }
      }
    );
  }

  /**
   * Get bullet pool statistics
   */
  getBulletPoolStats() {
    return bulletPool.getStats();
  }

  /**
   * Clear all bullets from the pool
   */
  clearBulletPool(): void {
    bulletPool.clear();
  }
}

// Global bullet update system instance
export const bulletUpdateSystem = new BulletUpdateSystem(); 