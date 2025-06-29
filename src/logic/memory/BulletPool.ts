/**
 * 🔫 Bullet Pool - Specialized object pool for bullet objects
 */

import { ObjectPool } from './ObjectPool';
import type { Bullet } from '../../models/gameTypes';

export class BulletPool extends ObjectPool<Bullet> {
  constructor() {
    super(
      // Factory function
      () => ({
        id: `bullet_${Date.now()}_${Math.random()}`,
        position: { x: 0, y: 0 },
        size: 4,
        isActive: false,
        speed: 0,
        damage: 0,
        direction: { x: 0, y: 0 },
        color: '#ffffff',
        typeIndex: 0,
        life: 0
      }),
      // Reset function
      (bullet) => {
        bullet.position = { x: 0, y: 0 };
        bullet.size = 4;
        bullet.isActive = false;
        bullet.speed = 0;
        bullet.damage = 0;
        bullet.direction = { x: 0, y: 0 };
        bullet.color = '#ffffff';
        bullet.typeIndex = 0;
        bullet.life = 0;
        bullet.targetId = undefined;
      },
      200 // Max pool size
    );
  }
  
  /**
   * Create a configured bullet
   */
  createBullet(
    position: { x: number; y: number },
    target: { x: number; y: number },
    damage: number,
    speed: number = 5,
    color: string = '#ffffff',
    targetId?: string
  ): Bullet {
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
} 