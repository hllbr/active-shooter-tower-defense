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

/**
 * Demo: Advanced Object Pooling Features
 */
export class AdvancedPoolingDemo {
  
  /**
   * Demo 1: Basic pool usage with auto-return
   */
  static demoBasicUsage(): void {
    console.log('🚀 Demo 1: Basic Pool Usage');
    
    // Create bullets - they will auto-return after 2 seconds
    const bullet1 = advancedBulletPool.createBullet(
      { x: 100, y: 100 },
      { x: 200, y: 200 },
      50,
      5,
      '#ff0000'
    );
    
    const bullet2 = advancedBulletPool.createBullet(
      { x: 150, y: 150 },
      { x: 250, y: 250 },
      75,
      6,
      '#00ff00'
    );
    
    console.log('Created 2 bullets, they will auto-return in 2 seconds');
    console.log('Bullet 1:', bullet1.id);
    console.log('Bullet 2:', bullet2.id);
    
    // Manual release (cancels auto-return)
    setTimeout(() => {
      advancedBulletPool.release(bullet1);
      console.log('Manually released bullet 1');
    }, 1000);
  }
  
  /**
   * Demo 2: Effect pooling with different configurations
   */
  static demoEffectPooling(): void {
    console.log('✨ Demo 2: Effect Pooling');
    
    // Create various effects
    const explosion = advancedEffectPool.createEffect(
      'explosion',
      { x: 300, y: 300 },
      1500,
      25,
      '#ff6600'
    );
    
    const sparkle = advancedEffectPool.createEffect(
      'sparkle',
      { x: 400, y: 400 },
      800,
      15,
      '#ffff00'
    );
    
    console.log('Created explosion and sparkle effects');
    console.log('Explosion:', explosion.id);
    console.log('Sparkle:', sparkle.id);
  }
  
  /**
   * Demo 3: Enemy pooling with lifecycle management
   */
  static demoEnemyPooling(): void {
    console.log('👹 Demo 3: Enemy Pooling');
    
    // Create enemies
    const enemy1 = advancedEnemyPool.createEnemy(
      { x: 50, y: 50 },
      150,
      2,
      25
    );
    
    const enemy2 = advancedEnemyPool.createEnemy(
      { x: 100, y: 100 },
      200,
      1.5,
      30
    );
    
    console.log('Created 2 enemies');
    console.log('Enemy 1:', enemy1.id, 'Health:', enemy1.health);
    console.log('Enemy 2:', enemy2.id, 'Health:', enemy2.health);
    
    // Simulate enemy death and return to pool
    setTimeout(() => {
      enemy1.isDead = true;
      advancedEnemyPool.release(enemy1);
      console.log('Enemy 1 died and returned to pool');
    }, 1500);
  }
  
  /**
   * Demo 4: Pool manager statistics
   */
  static demoPoolManager(): void {
    console.log('📊 Demo 4: Pool Manager Statistics');
    
    // Get comprehensive stats
    const stats = advancedPoolManager.getStats();
    
    console.log('Pool Manager Stats:');
    console.log('- Total Pools:', stats.totalPools);
    console.log('- Total Active Objects:', stats.totalActiveObjects);
    console.log('- Total Pooled Objects:', stats.totalPooledObjects);
    console.log('- Average Reuse Rate:', stats.averageReuseRate.toFixed(1) + '%');
    console.log('- Memory Efficiency:', stats.memoryEfficiency.toFixed(1) + '%');
    
    // Individual pool stats
    console.log('\nIndividual Pool Stats:');
    for (const [poolName, poolStats] of Object.entries(stats.pools)) {
      console.log(`${poolName}:`, {
        active: poolStats.activeCount,
        pooled: poolStats.poolSize,
        reuseRate: poolStats.reuseRate.toFixed(1) + '%',
        autoReturns: poolStats.autoReturns,
        shrinks: poolStats.shrinks
      });
    }
  }
  
  /**
   * Demo 5: Memory monitoring and cleanup
   */
  static demoMemoryMonitoring(): void {
    console.log('🧠 Demo 5: Memory Monitoring');
    
    // Monitor memory usage
    const summary = advancedPoolManager.getMemorySummary();
    console.log('Memory Summary:', summary);
    
    // Simulate high activity
    console.log('Creating many objects...');
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
    
    console.log('Created 30 objects total');
    
    // Check stats after creation
    setTimeout(() => {
      const stats = advancedPoolManager.getStats();
      console.log('After creation - Active Objects:', stats.totalActiveObjects);
      
      // Release some objects
      bullets.slice(0, 5).forEach(bullet => advancedBulletPool.release(bullet));
      effects.slice(0, 3).forEach(effect => advancedEffectPool.release(effect));
      
      console.log('Released some objects manually');
      
      // Check stats after release
      setTimeout(() => {
        const finalStats = advancedPoolManager.getStats();
        console.log('Final - Active Objects:', finalStats.totalActiveObjects);
        console.log('Final - Pooled Objects:', finalStats.totalPooledObjects);
      }, 1000);
    }, 1000);
  }
  
  /**
   * Run all demos
   */
  static runAllDemos(): void {
    console.log('🎯 Advanced Object Pooling System Demo');
    console.log('=====================================');
    
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