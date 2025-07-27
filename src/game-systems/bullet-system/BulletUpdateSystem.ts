import { GAME_CONSTANTS } from '../../utils/constants';
import type { Bullet, Enemy, Effect } from '../../models/gameTypes';
import { advancedPoolManager } from '../memory/AdvancedPoolManager';
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
        const bulletPool = advancedPoolManager.getPool<Bullet>('bullet');
        if (bulletPool) {
          try {
            bulletPool.release(bullet);
          } catch {
            // Error silently handled for performance
          }
        }
      }
    });

    // Process collisions using the new frame-rate independent system
    collisionManager.processBulletCollisions(
      bullets,
      enemies,
      deltaTime,
      (bullet, enemy, collisionResult) => {
        // ✅ NEW: Handle piercing bullets
        const isPiercing = bullet.piercing || false;
        const maxTargets = bullet.maxTargets || 1;
        const targetsHit = bullet.targetsHit || 0;
        
        // Apply damage
        damageEnemy(enemy.id, bullet.damage);
        
        // Apply bullet effects
        const bulletType = GAME_CONSTANTS.BULLET_TYPES[bullet.typeIndex];
        if ('freezeDuration' in bulletType && bulletType.freezeDuration) {
          enemy.frozenUntil = now + bulletType.freezeDuration;
        }
        
        // ✅ NEW: Enhanced collision effects with particles
        if (collisionResult.collisionPoint) {
          // Add traditional collision effect
          addEffect({
            id: `collision-${Date.now()}-${Math.random()}`,
            position: collisionResult.collisionPoint,
            radius: 15,
            color: bullet.color,
            life: 200,
            maxLife: 200,
          });
          
          // Add enhanced particle impact effect
          setTimeout(() => {
            import('../effects-system/EnhancedVisualEffectsManager').then(({ enhancedVisualEffectsManager }) => {
              enhancedVisualEffectsManager.createBulletImpactEffect(
                collisionResult.collisionPoint.x,
                collisionResult.collisionPoint.y,
                bullet.typeIndex.toString()
              );
            });
          }, 0);
        }
        
        // Handle piercing logic
        if (isPiercing && targetsHit < maxTargets) {
          // Increment targets hit
          bullet.targetsHit = targetsHit + 1;
          
          // Don't remove bullet yet if it can pierce more targets
          if (bullet.targetsHit < maxTargets) {
            return; // Continue with the bullet
          }
        }
        
        removeBullet(bullet.id);
        const bulletPool2 = advancedPoolManager.getPool<Bullet>('bullet');
        if (bulletPool2) {
          try {
            bulletPool2.release(bullet);
          } catch {
            // Error silently handled for performance
          }
        }
        

      }
    );
  }

  /**
   * Get bullet pool statistics
   */
  getBulletPoolStats() {
    const bulletPool = advancedPoolManager.getPool<Bullet>('bullet');
    return bulletPool ? bulletPool.getStats() : {};
  }

  /**
   * Clear all bullets from the pool
   */
  clearBulletPool(): void {
    const bulletPool = advancedPoolManager.getPool<Bullet>('bullet');
    if (bulletPool) bulletPool.clear();
  }
}

// Global bullet update system instance
export const bulletUpdateSystem = new BulletUpdateSystem(); 