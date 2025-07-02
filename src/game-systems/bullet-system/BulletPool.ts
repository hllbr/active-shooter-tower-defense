import type { Bullet, Position } from '../../models/gameTypes';
import { GAME_CONSTANTS } from '../../utils/constants';

/**
 * Bullet Pool System for efficient memory management
 * Reuses bullet objects to reduce garbage collection
 */
export class BulletPool {
  private pool: Bullet[] = [];
  private active: Set<Bullet> = new Set();
  private maxPoolSize: number = 200;
  private created: number = 0;
  private reused: number = 0;
  
  /**
   * Get a bullet from the pool or create a new one
   */
  acquire(): Bullet {
    let bullet = this.pool.pop();
    
    if (!bullet) {
      bullet = {
        id: `bullet_${Date.now()}_${Math.random()}`,
        position: { x: 0, y: 0 },
        size: GAME_CONSTANTS.BULLET_SIZE,
        isActive: true,
        speed: GAME_CONSTANTS.BULLET_SPEED,
        damage: 0,
        direction: { x: 0, y: 0 },
        color: '#ffffff',
        typeIndex: 0,
        life: 3000
      };
      this.created++;
    } else {
      this.reused++;
    }
    
    this.active.add(bullet);
    return bullet;
  }
  
  /**
   * Return a bullet to the pool
   */
  release(bullet: Bullet): void {
    if (!this.active.has(bullet)) {
      console.warn('🚨 Attempting to release bullet not in active set');
      return;
    }
    
    this.active.delete(bullet);
    
    // Reset bullet properties
    bullet.position = { x: 0, y: 0 };
    bullet.direction = { x: 0, y: 0 };
    bullet.isActive = false;
    bullet.damage = 0;
    bullet.speed = GAME_CONSTANTS.BULLET_SPEED;
    bullet.life = 3000;
    bullet.targetId = undefined;
    
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(bullet);
    }
  }
  
  /**
   * Create a configured bullet
   */
  createBullet(
    position: Position,
    direction: Position,
    damage: number,
    speed: number,
    color: string,
    typeIndex: number,
    targetId?: string
  ): Bullet {
    const bullet = this.acquire();
    bullet.id = `bullet_${Date.now()}_${Math.random()}`;
    bullet.position = { ...position };
    bullet.direction = { ...direction };
    bullet.damage = damage;
    bullet.speed = speed;
    bullet.color = color;
    bullet.typeIndex = typeIndex;
    bullet.isActive = true;
    bullet.life = 3000;
    bullet.targetId = targetId;
    return bullet;
  }
  
  /**
   * Clear all pooled bullets
   */
  clear(): void {
    this.pool.length = 0;
    this.active.clear();
  }
  
  /**
   * Get pool statistics
   */
  getStats(): {
    poolSize: number;
    activeCount: number;
    created: number;
    reused: number;
    reuseRate: number;
  } {
    return {
      poolSize: this.pool.length,
      activeCount: this.active.size,
      created: this.created,
      reused: this.reused,
      reuseRate: this.created > 0 ? (this.reused / (this.created + this.reused)) * 100 : 0
    };
  }
}

// Global bullet pool instance
export const bulletPool = new BulletPool(); 