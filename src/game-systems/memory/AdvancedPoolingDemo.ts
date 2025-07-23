/**
 * 🎯 Advanced Object Pooling Demo
 * Demonstrates the enhanced pooling system with all features
 */

import { 
  advancedBulletPool, 
  advancedEffectPool, 
  advancedEnemyPool, 
  advancedPoolManager 
} from './index';
import type { AdvancedBullet } from './AdvancedBulletPool';
import type { AdvancedEffect } from './AdvancedEffectPool';
import type { AdvancedEnemy } from './AdvancedEnemyPool';
import { advancedProfiler } from '../performance/AdvancedProfiler';

/**
 * Demo: Advanced Object Pooling Features
 */
export class AdvancedPoolingDemo {
  
  /**
   * Demo 1: Basic pool usage with auto-return
   */
  static demoBasicUsage(): void {
    
    // Create bullets - they will auto-return after 2 seconds
    const bullet1 = advancedBulletPool.createBullet(
      { x: 100, y: 100 },
      { x: 200, y: 200 },
      50,
      5,
      '#ff0000'
    );
    
    const _bullet2 = advancedBulletPool.createBullet(
      { x: 150, y: 150 },
      { x: 250, y: 250 },
      75,
      6,
      '#00ff00'
    );
    
    // Manual release (cancels auto-return)
    setTimeout(() => {
      advancedBulletPool.release(bullet1);
    }, 1000);
  }
  
  /**
   * Demo 2: Effect pooling with different configurations
   */
  static demoEffectPooling(): void {
    
    // Create various effects
    const _explosion = advancedEffectPool.createEffect(
      'explosion',
      { x: 300, y: 300 },
      1500,
      25,
      '#ff6600'
    );
    
    const _sparkle = advancedEffectPool.createEffect(
      'sparkle',
      { x: 400, y: 400 },
      800,
      15,
      '#ffff00'
    );
  }
  
  /**
   * Demo 3: Enemy pooling with lifecycle management
   */
  static demoEnemyPooling(): void {
    
    // Create enemies
    const enemy1 = advancedEnemyPool.createEnemy(
      { x: 50, y: 50 },
      150,
      2,
      25
    );
    
    const _enemy2 = advancedEnemyPool.createEnemy(
      { x: 100, y: 100 },
      200,
      1.5,
      30
    );
    
    // Simulate enemy death and return to pool
    setTimeout(() => {
      enemy1.isDead = true;
      advancedEnemyPool.release(enemy1);
    }, 1500);
  }
  
  /**
   * Demo 4: Pool manager statistics
   */
  static demoPoolManager(): void {
    
    // Get comprehensive stats
    const stats = advancedPoolManager.getStats();
    
    // Individual pool stats
    for (const [_poolName, _poolStats] of Object.entries(stats.pools)) {
      // console.log(`${poolName}:`, {
      //   active: poolStats.activeCount,
      //   pooled: poolStats.poolSize,
      //   reuseRate: poolStats.reuseRate.toFixed(1) + '%',
      //   autoReturns: poolStats.autoReturns,
      //   shrinks: poolStats.shrinks
      // });
    }
  }
  
  /**
   * Demo 5: Memory monitoring and cleanup
   */
  static demoMemoryMonitoring(): void {
    
    // Monitor memory usage
    const _summary = advancedPoolManager.getMemorySummary();
    // console.log('Memory Summary:', summary);
    
    // Simulate high activity
    const bullets: AdvancedBullet[] = [];
    const effects: AdvancedEffect[] = [];
    const enemies: AdvancedEnemy[] = [];
    
    for (let i = 0; i < 10; i++) {
      bullets.push(advancedBulletPool.createBullet(
        { x: i * 50, y: i * 50 },
        { x: (i + 1) * 50, y: (i + 1) * 50 },
        25 + i * 5
      ));
      
      effects.push(advancedEffectPool.createEffect(
        'demo',
        { x: i * 60, y: i * 60 },
        1000 + i * 100
      ));
      
      enemies.push(advancedEnemyPool.createEnemy(
        { x: i * 70, y: i * 70 },
        100 + i * 10
      ));
    }
    
    // Check stats after creation
    setTimeout(() => {
      const _stats = advancedPoolManager.getStats();
      // console.log('After creation - Active Objects:', stats.totalActiveObjects);
      
      // Release some objects
      bullets.slice(0, 5).forEach(bullet => advancedBulletPool.release(bullet));
      effects.slice(0, 3).forEach(effect => advancedEffectPool.release(effect));
      
      // console.log('Released some objects manually');
      
      // Check stats after release
      setTimeout(() => {
        const _finalStats = advancedPoolManager.getStats();
        // console.log('Final - Active Objects:', finalStats.totalActiveObjects);
        // console.log('Final - Pooled Objects:', finalStats.totalPooledObjects);
      }, 1000);
    }, 1000);
  }

  /**
   * Demo: Profile all pools before and after a simulated workload
   */
  static demoProfileAllPools(): void {
    advancedPoolManager.profileAllPools(advancedProfiler);
    // Optionally, run a simulated workload here
    // ...
    // Print profiler report
    // console.log(advancedProfiler.generateReport());
  }
  
  /**
   * Run all demos
   */
  static runAllDemos(): void {
    // console.log('🎯 Advanced Object Pooling System Demo');
    // console.log('=====================================');
    
    this.demoBasicUsage();
    
    setTimeout(() => {
      this.demoEffectPooling();
    }, 500);
    
    setTimeout(() => {
      this.demoEnemyPooling();
    }, 1000);
    
    setTimeout(() => {
      this.demoPoolManager();
    }, 2000);
    
    setTimeout(() => {
      this.demoMemoryMonitoring();
    }, 3000);
  }
}

// Export for easy access
export const runAdvancedPoolingDemo = AdvancedPoolingDemo.runAllDemos; 