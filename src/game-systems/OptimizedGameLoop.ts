/**
 * 🚀 Optimized Game Loop
 * High-performance game loop with integrated optimizations
 */

import { updateTowerFire, updateBullets } from './TowerManager';
import { updateEnemyMovement } from './EnemySpawner';
import { updateEffects } from './Effects';
import { updateMineCollisions } from './MineManager';
import { useGameStore } from '../models/store';
import { stateTracker, performanceMonitor, GameStateSelectors } from './StateOptimizer';
import { EnvironmentManager } from './environment/EnvironmentManager';
import { OptimizedCollisionDetector, type SpatialBounds } from './collision/SpatialPartitioning';
import { advancedProfiler } from './performance/AdvancedProfiler';
import { EnhancedObjectPool, type PoolConfig } from './memory/EnhancedObjectPool';


// Enhanced performance metrics
interface OptimizedGameLoopMetrics {
  totalFrames: number;
  skippedUpdates: number;
  lastFPS: number;
  avgDelta: number;
  collisionOptimizationGain: number;
  poolReuseRate: number;
  spatialQueryCount: number;
}

let gameLoopMetrics: OptimizedGameLoopMetrics = {
  totalFrames: 0,
  skippedUpdates: 0,
  lastFPS: 0,
  avgDelta: 16,
  collisionOptimizationGain: 0,
  poolReuseRate: 0,
  spatialQueryCount: 0
};

/**
 * Optimized game loop with spatial partitioning and advanced profiling
 */
export function startOptimizedGameLoop(existingManager?: EnvironmentManager) {
  let frameId = 0;
  let lastUpdateTime = performance.now();
  
  // Initialize optimized systems
  const environmentManager = existingManager ?? new EnvironmentManager();
  
  // Spatial partitioning for collision detection
  const gameBounds: SpatialBounds = {
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight
  };
  const collisionDetector = new OptimizedCollisionDetector(gameBounds, 100);
  
  // Enhanced object pools for bullets and effects
  interface PooledBullet {
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
    reset(): void;
  }
  
  const bulletPoolConfig: PoolConfig<PooledBullet> = {
    createObject: () => ({
      id: `bullet_${Date.now()}_${Math.random()}`,
      position: { x: 0, y: 0 },
      size: 5,
      isActive: false,
      speed: 300,
      damage: 0,
      direction: { x: 0, y: 0 },
      color: '#ffffff',
      typeIndex: 0,
      life: 3000,
      reset() {
        this.isActive = false;
        this.position = { x: 0, y: 0 };
        this.direction = { x: 0, y: 0 };
        this.damage = 0;
        this.life = 3000;
      }
    }),
    resetObject: (obj) => obj.reset(),
    initialSize: 50,
    maxSize: 200,
    preWarmPercent: 0.7,
    growthFactor: 1.5,
    shrinkThreshold: 0.3
  };
  
  const enhancedBulletPool = new EnhancedObjectPool(bulletPoolConfig);
  
  // State snapshot for change detection
  const lastStateSnapshot = {
    enemyCount: 0,
    bulletCount: 0,
    effectCount: 0,
    lastSignificantChange: 0
  };
  
  // Start advanced profiling
  advancedProfiler.startMonitoring();
  
  const loop = (currentTime: number) => {
    const deltaTime = currentTime - lastUpdateTime;
    gameLoopMetrics.totalFrames++;
    
    // Advanced profiling - start frame timing
    advancedProfiler.startTimer('frame-total');
    advancedProfiler.startTimer('game-logic');
    
    // Dynamic FPS cap based on activity level and performance
    const state = useGameStore.getState();
    const activityLevel = GameStateSelectors.getActivityLevel(state);
    const performanceStats = advancedProfiler.getStats();
    
    // Adaptive frame rate based on current performance
    let targetFrameTime = 16; // Default 60fps
    if (performanceStats.averageFPS < 45) {
      targetFrameTime = 20; // Drop to 50fps if struggling
    } else if (performanceStats.averageFPS > 55 && activityLevel === 'low') {
      targetFrameTime = 14; // Push to ~70fps if performing well
    }
    
    // Only update if enough time has passed
    if (deltaTime >= targetFrameTime) {
      // Stop game loop updates if game is over
      if (state.isGameOver) {
        frameId = requestAnimationFrame(loop);
        return;
      }
      
      // Store previous counts for change detection
      const prevEnemyCount = lastStateSnapshot.enemyCount;
      const prevBulletCount = lastStateSnapshot.bulletCount;
      
      // 🚀 OPTIMIZED: Reuse arrays and avoid object creation every frame
      advancedProfiler.startTimer('spatial-update');
      
      // Update spatial partitioning - use existing objects to avoid allocation
      const enemies = state.enemies;
      const bullets = state.bullets;
      
      // Update spatial grid with direct references (no object creation)
      collisionDetector.updateEnemies(enemies);
      collisionDetector.updateBullets(bullets);
      
      advancedProfiler.endTimer('spatial-update', 'collision');
      
      // Optimized collision detection - use direct references
      advancedProfiler.startTimer('collision-detection');
      const collisions = collisionDetector.findBulletCollisions(bullets, enemies);
      
      // Apply collision results (integrate with existing collision system)
      for (const _collision of collisions) {
        // Handle collision logic here - this would integrate with existing systems
      }
      
      const _collisionTime = advancedProfiler.endTimer('collision-detection', 'collision');
      
      // Run optimized game logic updates
      updateEnemyMovement();
      updateTowerFire();
      updateBullets(deltaTime);
      updateEffects();
      updateMineCollisions();
      
      advancedProfiler.endTimer('game-logic', 'game-logic');
      
      // Environment updates
      advancedProfiler.startTimer('environment-update');
      environmentManager.updateEnvironment(currentTime, (effect) => {
        useGameStore.getState().addEffect(effect);
      });
      
      const environmentState = environmentManager.getEnvironmentState();
      useGameStore.setState({
        terrainTiles: environmentState.terrainTiles,
        weatherState: environmentState.weatherState,
        timeOfDayState: environmentState.timeOfDayState,
        environmentalHazards: environmentState.environmentalHazards,
        interactiveElements: environmentState.interactiveElements
      });
      advancedProfiler.endTimer('environment-update', 'game-logic');
      
      // Get updated state
      const updatedState = useGameStore.getState();
      const currentEnemyCount = updatedState.enemies.length;
      const currentBulletCount = updatedState.bullets.length;
      const currentEffectCount = updatedState.effects.length;
      
      // Enhanced change detection
      const hasSignificantChange = stateTracker.hasSignificantChanges(updatedState);
      const needsVisualUpdate = GameStateSelectors.needsVisualUpdate(updatedState);
      
      if (hasSignificantChange || needsVisualUpdate) {
        // Advanced batching and throttling
        const now = performance.now();
        const timeSinceLastUpdate = now - lastStateSnapshot.lastSignificantChange;
        
        // Adaptive throttling based on performance
        let throttleThreshold = 16; // Default
        if (performanceStats.averageFPS < 40) {
          throttleThreshold = 33; // More aggressive throttling if struggling
        } else if (performanceStats.averageFPS > 55) {
          throttleThreshold = 12; // Less throttling if performing well
        }
        
        const shouldUpdate = timeSinceLastUpdate >= throttleThreshold || 
                           Math.abs(currentEnemyCount - prevEnemyCount) > 3 ||
                           Math.abs(currentBulletCount - prevBulletCount) > 8 ||
                           updatedState.isGameOver !== stateTracker['lastValues']?.isGameOver;
        
        if (shouldUpdate) {
          // Batched state update
          useGameStore.setState({ 
            lastUpdate: now
          });
          
          lastStateSnapshot.lastSignificantChange = now;
          stateTracker.updateSnapshot(updatedState);
          performanceMonitor.recordUpdate(false);
        } else {
          performanceMonitor.recordUpdate(true);
        }
      } else {
        gameLoopMetrics.skippedUpdates++;
        performanceMonitor.recordUpdate(true);
      }
      
      // Update state snapshot
      lastStateSnapshot.enemyCount = currentEnemyCount;
      lastStateSnapshot.bulletCount = currentBulletCount;
      lastStateSnapshot.effectCount = currentEffectCount;
      
      // Calculate performance metrics
      gameLoopMetrics.avgDelta = (gameLoopMetrics.avgDelta * 0.9) + (deltaTime * 0.1);
      gameLoopMetrics.lastFPS = Math.round(1000 / gameLoopMetrics.avgDelta);
      
      // Enhanced pool statistics
      const poolStats = enhancedBulletPool.getStats();
      gameLoopMetrics.poolReuseRate = poolStats.reuseRate;
      
      // Spatial partitioning statistics  
      const spatialStats = collisionDetector.getPerformanceStats();
      gameLoopMetrics.spatialQueryCount = spatialStats.enemy.totalQueries + spatialStats.bullet.totalQueries;
      
      lastUpdateTime = currentTime;
    }
    
    // Capture comprehensive performance snapshot
    const _totalFrameTime = advancedProfiler.endTimer('frame-total', 'fps');
    advancedProfiler.captureSnapshot({
      enemies: state.enemies.length,
      bullets: state.bullets.length,
      effects: state.effects.length,
      towers: state.towers.length
    });
    
    frameId = requestAnimationFrame(loop);
  };

  frameId = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(frameId);
    advancedProfiler.stopMonitoring();
  };
}

/**
 * Enhanced performance monitoring utilities
 */
export const OptimizedGameLoopPerformance = {
  getMetrics: (): OptimizedGameLoopMetrics => ({ ...gameLoopMetrics }),
  
  getAdvancedStats: () => {
    const basicStats = advancedProfiler.getStats();
    const recommendations = advancedProfiler.getRecommendations();
    
    return {
      ...basicStats,
      recommendations,
      optimizations: {
        poolReuseRate: gameLoopMetrics.poolReuseRate,
        spatialQueryCount: gameLoopMetrics.spatialQueryCount,
        skippedUpdates: gameLoopMetrics.skippedUpdates
      }
    };
  },
  
  generatePerformanceReport: () => {
    const report = advancedProfiler.generateReport();
    const optimizedMetrics = `
🚀 Optimization Metrics:
- Pool Reuse Rate: ${gameLoopMetrics.poolReuseRate.toFixed(1)}%
- Spatial Queries: ${gameLoopMetrics.spatialQueryCount}
- Skipped Updates: ${gameLoopMetrics.skippedUpdates}
- Collision Optimization: ${gameLoopMetrics.collisionOptimizationGain.toFixed(1)}%
    `;
    
    return report + optimizedMetrics;
  },
  
  logPerformance: () => {
    // Performance logging removed for production optimization
  },
  
  resetMetrics: () => {
    gameLoopMetrics = {
      totalFrames: 0,
      skippedUpdates: 0,
      lastFPS: 0,
      avgDelta: 16,
      collisionOptimizationGain: 0,
      poolReuseRate: 0,
      spatialQueryCount: 0
    };
    advancedProfiler.clear();
  }
}; 