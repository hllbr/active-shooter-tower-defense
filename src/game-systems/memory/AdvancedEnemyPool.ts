/**
 * 👹 Advanced Enemy Pool - Enhanced object pool for enemy objects
 */

import { AdvancedObjectPool } from './AdvancedObjectPool';
import type { AdvancedPoolConfig } from './AdvancedObjectPool';

export interface AdvancedEnemy {
  id: string;
  position: { x: number; y: number };
  size: number;
  health: number;
  maxHealth: number;
  speed: number;
  isActive: boolean;
  pathIndex: number;
  frozenUntil?: number;
  slowUntil?: number;
  slowFactor: number;
  isDead: boolean;
  lastDamageTime: number;
  goldValue: number;
  color: string;
  damage: number;
  type?: string;
  bossType?: 'legendary' | 'mini' | 'major' | undefined;
  reset(): void;
}

export class AdvancedEnemyPool {
  private pool: AdvancedObjectPool<AdvancedEnemy>;
  
  constructor() {
    const config: AdvancedPoolConfig<AdvancedEnemy> = {
      createObject: () => ({
        id: `enemy_${Date.now()}_${Math.random()}`,
        position: { x: 0, y: 0 },
        size: 20,
        health: 100,
        maxHealth: 100,
        speed: 1,
        isActive: false,
        pathIndex: 0,
        frozenUntil: undefined,
        slowUntil: undefined,
        slowFactor: 1,
        isDead: false,
        lastDamageTime: 0,
        goldValue: 10,
        color: '#ff0000',
        damage: 10,
        type: 'Basic',
        bossType: undefined,
        reset() {
          this.position = { x: 0, y: 0 };
          this.size = 20;
          this.health = 100;
          this.maxHealth = 100;
          this.speed = 1;
          this.isActive = false;
          this.pathIndex = 0;
          this.frozenUntil = undefined;
          this.slowUntil = undefined;
          this.slowFactor = 1;
          this.isDead = false;
          this.lastDamageTime = 0;
          this.goldValue = 10;
          this.color = '#ff0000';
          this.damage = 10;
          this.type = 'Basic';
          this.bossType = undefined;
        }
      }),
      resetObject: (enemy) => enemy.reset(),
      initialSize: 20,
      maxPoolSize: 100,
      maxIdleTime: 60000, // 60 seconds
      autoShrinkInterval: 20000, // 20 seconds
      createIfEmpty: true,
      autoReturnDelay: 2000, // 2 seconds
      preWarmPercent: 0.5
    };
    
    this.pool = AdvancedObjectPool.getInstance('enemy-pool', config);
  }
  
  /**
   * Acquire an enemy from the pool
   */
  acquire(): AdvancedEnemy {
    return this.pool.acquire();
  }
  
  /**
   * Release an enemy back to the pool
   */
  release(enemy: AdvancedEnemy): void {
    this.pool.release(enemy);
  }
  
  /**
   * Create a configured enemy
   */
  createEnemy(
    position: { x: number; y: number },
    health: number = 100,
    speed: number = 1,
    size: number = 20,
    goldValue: number = 10,
    color: string = '#ff0000',
    damage: number = 10,
    type: string = 'Basic',
    bossType?: 'legendary' | 'mini' | 'major' | undefined
  ): AdvancedEnemy {
    const enemy = this.acquire();
    enemy.id = `enemy_${Date.now()}_${Math.random()}`;
    enemy.position = { ...position };
    enemy.health = health;
    enemy.maxHealth = health;
    enemy.speed = speed;
    enemy.size = size;
    enemy.isActive = true;
    enemy.isDead = false;
    enemy.pathIndex = 0;
    enemy.lastDamageTime = performance.now();
    enemy.goldValue = goldValue;
    enemy.color = color;
    enemy.damage = damage;
    enemy.type = type;
    enemy.bossType = bossType;
    return enemy;
  }
  
  /**
   * Get pool statistics
   */
  getStats() {
    return this.pool.getStats();
  }
  
  /**
   * Clear all enemies
   */
  clear(): void {
    this.pool.clear();
  }
  
  /**
   * Release all active enemies
   */
  releaseAll(): void {
    this.pool.releaseAll();
  }
}

// Global singleton instance
export const advancedEnemyPool = new AdvancedEnemyPool(); 