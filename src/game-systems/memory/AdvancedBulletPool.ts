/**
 * 🔫 Advanced Bullet Pool - Enhanced object pool for bullet objects
 */

import { AdvancedObjectPool } from './AdvancedObjectPool';
import type { AdvancedPoolConfig } from './AdvancedObjectPool';
import { GAME_CONSTANTS } from '../../utils/constants';

export interface AdvancedBullet {
  id: string;
  position: { x: number; y: number };
  size: number;
  isActive: boolean;
  speed: number;
  damage: number;
  direction: { x: number; y: number };
  color: string;
  typeIndex: number;
  life: number;
  targetId?: string;
  reset(): void;
}

export class AdvancedBulletPool {
  private pool: AdvancedObjectPool<AdvancedBullet>;
  
  constructor() {
    const config: AdvancedPoolConfig<AdvancedBullet> = {
      createObject: () => ({
        id: `bullet_${Date.now()}_${Math.random()}`,
        position: { x: 0, y: 0 },
        size: GAME_CONSTANTS.BULLET_SIZE,
        isActive: false,
        speed: GAME_CONSTANTS.BULLET_SPEED,
        damage: 0,
        direction: { x: 0, y: 0 },
        color: '#ffffff',
        typeIndex: 0,
        life: 3000,
        targetId: undefined,
        reset() {
          this.position = { x: 0, y: 0 };
          this.size = GAME_CONSTANTS.BULLET_SIZE;
          this.isActive = false;
          this.speed = GAME_CONSTANTS.BULLET_SPEED;
          this.damage = 0;
          this.direction = { x: 0, y: 0 };
          this.color = '#ffffff';
          this.typeIndex = 0;
          this.life = 3000;
          this.targetId = undefined;
        }
      }),
      resetObject: (bullet) => bullet.reset(),
      initialSize: 50,
      maxPoolSize: 200,
      maxIdleTime: 30000, // 30 seconds
      autoShrinkInterval: 10000, // 10 seconds
      createIfEmpty: true,
      autoReturnDelay: 2000, // 2 seconds
      preWarmPercent: 0.7
    };
    
    this.pool = AdvancedObjectPool.getInstance('bullet-pool', config);
  }
  
  /**
   * Acquire a bullet from the pool
   */
  acquire(): AdvancedBullet {
    return this.pool.acquire();
  }
  
  /**
   * Release a bullet back to the pool
   */
  release(bullet: AdvancedBullet): void {
    this.pool.release(bullet);
  }
  
  /**
   * Create a configured bullet
   */
  createBullet(
    position: { x: number; y: number },
    target: { x: number; y: number },
    damage: number,
    speed: number = GAME_CONSTANTS.BULLET_SPEED,
    color: string = '#ffffff',
    targetId?: string
  ): AdvancedBullet {
    const bullet = this.acquire();
    bullet.id = `bullet_${Date.now()}_${Math.random()}`;
    bullet.position = { ...position };
    bullet.isActive = true;
    bullet.damage = damage;
    bullet.speed = speed;
    bullet.color = color;
    bullet.targetId = targetId;
    
    // Calculate direction
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    bullet.direction = {
      x: distance > 0 ? dx / distance : 0,
      y: distance > 0 ? dy / distance : 0
    };
    
    return bullet;
  }
  
  /**
   * Get pool statistics
   */
  getStats() {
    return this.pool.getStats();
  }
  
  /**
   * Clear all bullets
   */
  clear(): void {
    this.pool.clear();
  }
  
  /**
   * Release all active bullets
   */
  releaseAll(): void {
    this.pool.releaseAll();
  }
}

// Global singleton instance
export const advancedBulletPool = new AdvancedBulletPool(); 